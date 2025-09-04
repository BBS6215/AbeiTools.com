/**
 * ABeiTools V3.0 - Search System
 * 搜索系统
 */

class SearchManager {
    constructor() {
        this.tools = [];              // 所有工具数据
        this.categories = {};         // 分类数据
        this.searchIndex = [];        // 搜索索引
        this.currentResults = [];     // 当前搜索结果
        this.currentCategory = 'all'; // 当前分类
        this.searchInput = null;      // 搜索输入框
        this.searchClear = null;      // 清空按钮
        this.isInitialized = false;   // 是否已初始化
        
        // 搜索配置
        this.searchConfig = {
            minLength: 1,           // 最小搜索长度
            debounceTime: 300,      // 防抖时间
            maxResults: 100,        // 最大结果数
            highlightClass: 'bg-yellow-200' // 高亮样式类
        };
        
        // 事件监听器
        this.listeners = {
            'search-start': [],
            'search-complete': [],
            'search-clear': [],
            'category-change': []
        };
    }

    /**
     * 初始化搜索系统
     */
    async init() {
        try {
            if (this.isInitialized) return;
            
            console.log('🔍 Initializing search system...');
            
            // 1. 加载数据
            await this._loadData();
            
            // 2. 构建搜索索引
            this._buildSearchIndex();
            
            // 3. 绑定DOM元素
            this._bindElements();
            
            // 4. 绑定事件
            this._bindEvents();
            
            // 5. 处理URL参数
            this._handleURLParams();
            
            this.isInitialized = true;
            console.log('✅ Search system initialized successfully');
            
        } catch (error) {
            console.error('❌ Search system initialization failed:', error);
            this._showError('搜索系统初始化失败');
        }
    }

    /**
     * 加载工具和分类数据
     * @private
     */
    async _loadData() {
        try {
            // 并行加载数据
            const [toolsResponse, categoriesResponse] = await Promise.all([
                fetch('./data/links_curated.json'),
                fetch('./config/categories.json')
            ]);

            if (!toolsResponse.ok || !categoriesResponse.ok) {
                throw new Error('Failed to load data files');
            }

            const toolsData = await toolsResponse.json();
            const categoriesData = await categoriesResponse.json();

            this.tools = toolsData.links || [];
            this.categories = categoriesData.categories || {};
            
            console.log(`📊 Loaded ${this.tools.length} tools and ${Object.keys(this.categories).length} categories`);
            
        } catch (error) {
            console.error('Data loading failed:', error);
            throw error;
        }
    }

    /**
     * 构建搜索索引
     * @private
     */
    _buildSearchIndex() {
        this.searchIndex = this.tools.map(tool => {
            // 获取当前语言的工具信息
            const currentLang = window.i18n?.getCurrentLanguage() || 'zh';
            
            // 优化：预处理搜索文本，减少运行时计算
            const searchTexts = [
                tool.name[currentLang] || tool.name.en || '',
                tool.description[currentLang] || tool.description.en || '',
                tool.category || '',
                (tool.tags || []).join(' '),
                tool.pricing || '',
                tool.id || ''
            ];

            // 优化：一次性处理并缓存
            const searchText = searchTexts.join(' ').toLowerCase().trim();

            return {
                id: tool.id,
                tool: tool,
                searchText: searchText,
                // 预计算权重
                weight: this._calculateWeight(tool)
            };
        });
        
        console.log(`🔍 Built search index for ${this.searchIndex.length} items`);
    }

    /**
     * 计算工具热度权重（综合排序）
     * @private
     * @param {Object} tool - 工具对象
     * @returns {number} 权重值（越高越热门）
     */
    _calculateWeight(tool) {
        let weight = 0;
        
        // 基础权重
        weight += 20; // 所有工具基础权重
        
        // 定价模式权重调整
        if (tool.pricing === 'free') {
            weight += 25; // 免费工具额外加分
        } else if (tool.pricing === 'freemium') {
            weight += 15; // Freemium模式适中加分
        } else if (tool.pricing === 'paid') {
            weight += 10; // 付费工具基础分
        }
        
        // 根据知名度和历史地位加权
        const premiumTools = [
            'chatgpt.com', 'claude.ai', 'chat.openai.com', 'openai.com',
            'midjourney.com', 'gemini.google.com', 'perplexity.ai',
            'github.com', 'notion.so', 'canva.com', 'stability.ai'
        ];
        
        const popularTools = [
            'leonardo.ai', 'elevenlabs.io', 'runwayml.com', 'synthesia.io',
            'gamma.app', 'character.ai', 'huggingface.co', 'cursor.com',
            'remove.bg', 'grammarly.com', 'zapier.com', 'zoom.us'
        ];
        
        if (tool.url && premiumTools.some(domain => tool.url.includes(domain))) {
            weight += 40; // 顶级工具额外权重
        } else if (tool.url && popularTools.some(domain => tool.url.includes(domain))) {
            weight += 20; // 流行工具额外权重
        }
        
        // 基于工具名称的受欢迎程度加权
        const toolNameLower = (tool.name.zh + ' ' + tool.name.en).toLowerCase();
        const hotKeywords = ['gpt', 'chatgpt', 'claude', 'gemini', 'midjourney', 'ai', '智能'];
        let keywordBonus = 0;
        hotKeywords.forEach(keyword => {
            if (toolNameLower.includes(keyword)) {
                keywordBonus += 5;
            }
        });
        weight += Math.min(keywordBonus, 25); // 关键词奖励上限25分
        
        // 分类热度调整（某些分类天然更受关注）
        const categoryWeights = {
            'chat': 15,      // AI对话助手最受关注
            'creative': 12,  // 内容创作次受关注
            'search': 10,    // 信息获取
            'office': 8,     // 办公效率
            'coding': 10     // 编程开发
        };
        
        if (tool.category && categoryWeights[tool.category]) {
            weight += categoryWeights[tool.category];
        }
        
        // 自建工具优先展示
        if (tool.url && tool.url.startsWith('/')) {
            weight += 30;
        }
        
        return weight;
    }

    /**
     * 绑定DOM元素
     * @private
     */
    _bindElements() {
        this.searchInput = document.getElementById('search-input');
        this.searchClear = document.getElementById('search-clear');
        this.toolsContainer = document.getElementById('tools-container');
        this.toolsLoading = document.getElementById('tools-loading');
        this.noResults = document.getElementById('no-results');
        this.currentCategoryTitle = document.getElementById('current-category-title');
        
        if (!this.searchInput || !this.toolsContainer) {
            throw new Error('Required DOM elements not found');
        }
    }

    /**
     * 绑定事件监听
     * @private
     */
    _bindEvents() {
        // 搜索输入防抖处理
        const debouncedSearch = Utils.debounce((query) => {
            this._performSearch(query);
        }, this.searchConfig.debounceTime);

        // 搜索输入事件
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // 显示/隐藏清空按钮
            if (query.length > 0) {
                this.searchClear?.classList.remove('hidden');
                this.searchClear?.classList.add('flex');
            } else {
                this.searchClear?.classList.add('hidden');
                this.searchClear?.classList.remove('flex');
            }
            
            // 执行搜索
            if (query.length >= this.searchConfig.minLength) {
                debouncedSearch(query);
            } else if (query.length === 0) {
                this._clearSearch();
            }
        });

        // 清空按钮事件
        this.searchClear?.addEventListener('click', () => {
            this.searchInput.value = '';
            this.searchClear.classList.add('hidden');
            this.searchClear.classList.remove('flex');
            this._clearSearch();
            this.searchInput.focus();
        });

        // 回车键搜索
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = this.searchInput.value.trim();
                if (query.length > 0) {
                    this._performSearch(query);
                }
            }
        });

        // 监听语言变化，重建搜索索引
        if (window.i18n) {
            window.i18n.on('language-changed', () => {
                this._buildSearchIndex();
                // 如果有搜索查询，重新搜索
                if (this.searchInput.value.trim()) {
                    this._performSearch(this.searchInput.value.trim());
                }
            });
        }
    }

    /**
     * 处理URL参数
     * @private
     */
    _handleURLParams() {
        const searchQuery = Utils.url.getParam('search');
        const category = Utils.url.getParam('category');
        
        if (searchQuery) {
            this.searchInput.value = searchQuery;
            this.searchClear?.classList.remove('hidden');
            this.searchClear?.classList.add('flex');
            this._performSearch(searchQuery);
        }
        
        if (category && category !== 'all') {
            this.setCategory(category);
        }
    }

    /**
     * 渲染所有工具到分区域
     * @private
     */
    async _renderAllToolsByCategories() {
        const container = document.getElementById('all-tools-container');
        const toolsContainer = document.getElementById('tools-container');
        
        if (!container || !toolsContainer) return;
        
        // 隐藏普通工具容器，显示分类容器
        toolsContainer.classList.add('hidden');
        container.classList.remove('hidden');
        
        const currentLang = window.i18n?.getCurrentLanguage() || 'zh';
        
        // 按分类分组工具
        const toolsByCategory = Utils.array.groupBy(this.tools, 'category');
        
        // 生成所有分类区域的HTML
        let sectionsHTML = '';
        
        // 按照分类order字段排序生成
        const sortedCategories = Object.entries(this.categories)
            .filter(([_, category]) => category.enabled !== false)
            .sort(([_a, a], [_b, b]) => (a.order || 999) - (b.order || 999));
            
        for (const [categoryId, category] of sortedCategories) {
            if (!category.enabled) continue;
            
            const categoryTools = toolsByCategory[categoryId] || [];
            if (categoryTools.length === 0) continue;
            
            // 保持JSON文件中的原始顺序
            // categoryTools.sort((a, b) => this._calculateWeight(b) - this._calculateWeight(a));
            
            const categoryName = category.name[currentLang] || category.name.en || categoryId;
            
            sectionsHTML += `
                <section id="section-${categoryId}" class="category-section category-${categoryId} mb-8 scroll-mt-24" data-category-section="${categoryId}">
                    <div class="category-header flex items-center mb-6">
                        <div class="category-icon mr-3" style="color: ${category.color};">
                            ${category.icon}
                        </div>
                        <h2 class="category-title text-2xl font-bold flex-1" style="color: ${category.color};">
                            ${categoryName}
                        </h2>
                        <div class="category-underline flex-1 ml-4 h-0.5" style="background: linear-gradient(to right, transparent 0%, ${category.color}40 50%, ${category.color} 100%);"></div>
                    </div>
                    
                    <div class="tools-grid">
                        ${categoryTools.map(tool => this._createToolCard(tool, [], '')).join('')}
                    </div>
                </section>
            `;
        }
        
        container.innerHTML = sectionsHTML;
        
        // 绑定工具卡片事件
        this._bindToolCardEvents();
        
        // 更新分类显示信息
        this._updateCategoryDisplay();
        
        console.log('✅ All tools rendered by categories');
    }


    /**
     * 执行搜索（新版本 - 支持分区域显示）
     * @private
     * @param {string} query - 搜索查询
     */
    _performSearch(query) {
        console.log(`🔍 Searching for: "${query}"`);
        
        // 触发搜索开始事件
        this._emit('search-start', { query });
        
        // 显示加载状态
        this._showLoading();
        
        // 执行搜索
        const results = this._search(query);
        this.currentResults = results;
        
        // 更新URL
        Utils.url.setParam('search', query);
        
        // 渲染搜索结果
        this._renderSearchResults(results, query);
        
        // 触发搜索完成事件
        this._emit('search-complete', {
            query,
            results: results,
            total: results.length
        });
        
        console.log(`✅ Search completed: ${results.length} results found`);
    }

    /**
     * 渲染搜索结果
     * @private
     * @param {Array} results - 搜索结果
     * @param {string} query - 搜索查询
     */
    _renderSearchResults(results, query) {
        const container = document.getElementById('all-tools-container');
        const toolsContainer = document.getElementById('tools-container');
        
        // 搜索时使用all-tools-container以便显示搜索结果
        if (toolsContainer && container) {
            toolsContainer.classList.add('hidden');
            container.classList.remove('hidden');
        }
        
        this._hideLoading();
        
        if (results.length === 0) {
            this._showNoResults();
            return;
        }
        
        this._hideNoResults();
        
        // 生成搜索结果HTML
        const searchResultsHTML = `
            <section class="mb-8">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">
                        🔍 ${window.i18n?.getCurrentLanguage() === 'zh' ? '搜索结果' : 'Search Results'}
                    </h2>
                    <span class="text-sm text-gray-500">${results.length} ${window.i18n?.getCurrentLanguage() === 'zh' ? '个结果' : 'results'}</span>
                </div>
                
                <div class="tools-grid">
                    ${results.map(result => this._createToolCard(result.tool, result.highlights, query)).join('')}
                </div>
            </section>
        `;
        
        if (container) {
            container.innerHTML = searchResultsHTML;
        }
        
        // 绑定工具卡片事件
        this._bindToolCardEvents();
        
        // 滚动到顶部显示搜索结果
        Utils.scrollToElement('body');
    }

    /**
     * 清空搜索（新版本）
     * @private
     */
    _clearSearch() {
        console.log('🧹 Clearing search');
        
        // 清除URL参数
        Utils.url.removeParam('search');
        
        // 触发清空事件
        this._emit('search-clear');
        
        // 重新渲染所有工具
        this._renderAllToolsByCategories();
    }

    /**
     * 显示加载状态
     * @private
     */
    _showLoading() {
        const container = document.getElementById('all-tools-container');
        const toolsContainer = document.getElementById('tools-container');
        
        // 使用all-tools-container显示加载状态
        if (toolsContainer && container) {
            toolsContainer.classList.add('hidden');
            container.classList.remove('hidden');
        }
        
        if (!container) return;
        
        const currentLang = window.i18n?.getCurrentLanguage() || 'zh';
        
        container.innerHTML = `
            <div class="text-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p class="text-gray-600" data-i18n="ui.loading">${currentLang === 'zh' ? '加载中...' : 'Loading...'}</p>
            </div>
        `;
    }

    /**
     * 隐藏加载状态
     * @private
     */
    _hideLoading() {
        // Loading状态由内容替换自动隐藏
    }

    /**
     * 显示无结果状态
     * @private
     */
    _showNoResults() {
        const container = document.getElementById('all-tools-container');
        const toolsContainer = document.getElementById('tools-container');
        
        // 使用all-tools-container显示无结果状态
        if (toolsContainer && container) {
            toolsContainer.classList.add('hidden');
            container.classList.remove('hidden');
        }
        
        if (!container) return;
        
        const currentLang = window.i18n?.getCurrentLanguage() || 'zh';
        
        container.innerHTML = `
            <div class="text-center py-20 no-results">
                <svg class="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <h3 class="text-xl font-medium text-gray-900 mb-3" data-i18n="ui.noResults">
                    ${currentLang === 'zh' ? '没有找到相关工具' : 'No relevant tools found'}
                </h3>
                <p class="text-gray-600 mb-6">
                    ${currentLang === 'zh' ? '尝试使用不同的关键词搜索，或者浏览下面的分类' : 'Try different keywords or browse categories below'}
                </p>
                <button id="clear-search-btn" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
                    ${currentLang === 'zh' ? '浏览所有工具' : 'Browse All Tools'}
                </button>
            </div>
        `;
        
        // 绑定清空搜索按钮
        document.getElementById('clear-search-btn')?.addEventListener('click', () => {
            this.searchInput.value = '';
            this.searchClear?.classList.add('hidden');
            this._clearSearch();
        });
    }

    /**
     * 隐藏无结果状态
     * @private
     */
    _hideNoResults() {
        // 无结果状态由内容替换自动隐藏
    }

    /**
     * 初始化时渲染所有工具
     */
    async renderInitialTools() {
        // 默认显示按分类排列的所有工具
        await this._renderAllToolsByCategories();
    }

    /**
     * 核心搜索算法（优化版）
     * @private
     * @param {string} query - 搜索查询
     * @returns {Array} 搜索结果
     */
    _search(query) {
        if (!query || query.length === 0) {
            return this.searchIndex.map(item => ({
                ...item,
                score: item.weight,
                highlights: []
            }));
        }

        // 优化：预处理搜索词，避免重复操作
        const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        const results = [];

        // 优化：提前退出机制，达到最大结果数时停止
        const maxResults = this.searchConfig.maxResults;
        let foundResults = 0;

        for (const item of this.searchIndex) {
            let score = 0;
            const highlights = [];
            
            // 优化：快速字符串匹配检查
            const itemText = item.searchText;
            let hasMatch = false;
            
            // 为每个搜索词计算匹配分数
            for (const term of searchTerms) {
                if (itemText.includes(term)) {
                    hasMatch = true;
                    const matchResult = this._calculateMatch(item, term);
                    score += matchResult.score;
                    highlights.push(...matchResult.highlights);
                }
            }
            
            // 只有匹配的结果才加入
            if (hasMatch && score > 0) {
                results.push({
                    ...item,
                    score: score * item.weight, // 应用权重
                    highlights: highlights
                });
                
                foundResults++;
                // 优化：找到足够结果后可以继续，但不超过合理限制
                if (foundResults > maxResults * 2) break;
            }
        }

        // 按分数排序（优化：只对实际结果排序）
        results.sort((a, b) => b.score - a.score);
        
        // 限制结果数量
        return results.slice(0, maxResults);
    }

    /**
     * 计算单个词的匹配分数
     * @private
     * @param {Object} item - 搜索项
     * @param {string} term - 搜索词
     * @returns {Object} 匹配结果 {score, highlights}
     */
    _calculateMatch(item, term) {
        let score = 0;
        let highlights = [];
        
        const searchText = item.searchText;
        const tool = item.tool;
        const currentLang = window.i18n?.getCurrentLanguage() || 'zh';
        
        // 精确匹配名称 - 最高分
        const toolName = (tool.name[currentLang] || tool.name.en || '').toLowerCase();
        if (toolName.includes(term)) {
            score += 10;
            highlights.push({ field: 'name', term });
        }
        
        // 精确匹配ID - 高分
        if (tool.id && tool.id.toLowerCase().includes(term)) {
            score += 8;
        }
        
        // 匹配分类 - 中高分
        if (tool.category && tool.category.toLowerCase().includes(term)) {
            score += 6;
        }
        
        // 匹配标签 - 中分
        if (tool.tags) {
            for (const tag of tool.tags) {
                if (tag.toLowerCase().includes(term)) {
                    score += 4;
                    break;
                }
            }
        }
        
        // 匹配描述 - 较低分
        const toolDesc = (tool.description[currentLang] || tool.description.en || '').toLowerCase();
        if (toolDesc.includes(term)) {
            score += 2;
            highlights.push({ field: 'description', term });
        }
        
        // 部分匹配 - 最低分
        if (score === 0 && searchText.includes(term)) {
            score += 1;
        }
        
        return { score, highlights };
    }

    /**
     * 按分类过滤结果
     * @private
     * @param {Array} results - 搜索结果
     * @returns {Array} 过滤后的结果
     */
    _filterByCategory(results) {
        if (this.currentCategory === 'all') {
            return results;
        }
        
        return results.filter(item => item.tool.category === this.currentCategory);
    }

    /**
     * 设置当前分类
     * @param {string} categoryId - 分类ID
     */
    setCategory(categoryId) {
        console.log(`📂 Setting category: ${categoryId}`);
        
        this.currentCategory = categoryId;
        
        // 更新URL
        if (categoryId === 'all') {
            Utils.url.removeParam('category');
        } else {
            Utils.url.setParam('category', categoryId);
        }
        
        // 触发分类变更事件
        this._emit('category-change', { category: categoryId });
        
        // 如果有搜索查询，重新搜索；否则显示该分类的工具
        const query = this.searchInput.value.trim();
        if (query) {
            this._performSearch(query);
        } else {
            this._showCategoryTools();
        }
        
        // 更新页面标题和计数
        this._updateCategoryDisplay();
    }

    /**
     * 显示当前分类的所有工具
     * @private
     */
    _showCategoryTools() {
        if (this.currentCategory === 'all') {
            // 显示所有工具按分类分组
            this._renderAllToolsByCategories();
        } else {
            // 显示单个分类的工具
            const tools = this.tools.filter(tool => tool.category === this.currentCategory);
            
            // 转换为搜索结果格式
            const results = tools.map(tool => ({
                id: tool.id,
                tool: tool,
                score: this._calculateWeight(tool),
                highlights: []
            }));
            
            // 按权重排序
            results.sort((a, b) => b.score - a.score);
            
            this.currentResults = results;
            this._renderResults(results);
        }
    }

    /**
     * 清空搜索
     * @private
     */
    _clearSearch() {
        console.log('🧹 Clearing search');
        
        // 清除URL参数
        Utils.url.removeParam('search');
        
        // 触发清空事件
        this._emit('search-clear');
        
        // 显示当前分类的所有工具
        this._showCategoryTools();
    }

    /**
     * 渲染搜索结果
     * @private
     * @param {Array} results - 搜索结果
     * @param {string} query - 搜索查询（可选，用于高亮）
     */
    _renderResults(results, query = '') {
        const toolsContainer = document.getElementById('tools-container');
        const allToolsContainer = document.getElementById('all-tools-container');
        
        // 确保显示正确的容器
        if (toolsContainer && allToolsContainer) {
            toolsContainer.classList.remove('hidden');
            allToolsContainer.classList.add('hidden');
        }
        
        this._hideLoading();
        
        if (results.length === 0) {
            this._showNoResults();
            this._updateCategoryDisplay();
            return;
        }
        
        this._hideNoResults();
        this._updateCategoryDisplay();
        
        // 渲染工具卡片
        if (toolsContainer) {
            toolsContainer.innerHTML = results.map(result => 
                this._createToolCard(result.tool, result.highlights, query)
            ).join('');
        }
        
        // 绑定工具卡片事件
        this._bindToolCardEvents();
    }

    /**
     * 创建工具卡片HTML
     * @private
     * @param {Object} tool - 工具对象
     * @param {Array} highlights - 高亮信息
     * @param {string} query - 搜索查询
     * @returns {string} 卡片HTML
     */
    _createToolCard(tool, highlights = [], query = '') {
        const currentLang = window.i18n?.getCurrentLanguage() || 'zh';
        const toolName = tool.name[currentLang] || tool.name.en || tool.id;
        let toolDesc = tool.description[currentLang] || tool.description.en || '';
        const category = this.categories[tool.category];
        const categoryIcon = category ? category.icon : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>';
        
        // 将重要信息整合到描述中
        toolDesc = this._enhanceDescription(tool, toolDesc, currentLang);
        
        // 应用高亮
        const highlightedName = this._applyHighlight(toolName, query);
        const highlightedDesc = this._applyHighlight(toolDesc, query);
        
        // 智能字体缩放：检测英文长描述
        const isLongEnglishDesc = this._isLongEnglishDescription(toolDesc, currentLang);
        
        // 判断是否为外部链接
        const isExternal = tool.url && !tool.url.startsWith('/');
        const linkAttrs = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
        
        // 生成网站favicon URL
        const getWebsiteFavicon = (url) => {
            if (!url || url.startsWith('/')) return null;
            try {
                const domain = new URL(url).hostname;
                return `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(url)}`;
            } catch (e) {
                return null;
            }
        };
        
        const faviconUrl = tool.icon || getWebsiteFavicon(tool.url);
        
        // 获取分类颜色用于顶部色线（移除无用的状态指示器）
        const categoryColor = category ? category.color : '#6B7280';
        
        // 生成无障碍描述
        const ariaLabel = `${toolName} - ${toolDesc.replace(/<[^>]*>/g, '')}`;
        const categoryName = category ? (category.name[currentLang] || category.name.en) : '';
        
        return `
            <a href="${tool.url}" ${linkAttrs} 
               class="tool-card"
               data-tool-id="${tool.id}"
               data-tool-category="${tool.category}"
               style="border-top: 2px solid ${categoryColor};"
               aria-label="${ariaLabel}"
               role="article"
               tabindex="0">
                <div class="tool-header">
                    <div class="tool-icon" role="img" aria-hidden="true">
                        ${faviconUrl ? 
                            `<img src="${faviconUrl}" alt="" onerror="this.style.display='none';">` 
                            : 
                            ``
                        }
                    </div>
                    <h3 class="tool-title" id="tool-${tool.id}-title">
                        ${highlightedName}
                    </h3>
                    <span class="sr-only">分类: ${categoryName}</span>
                </div>
                
                <div class="tool-description${isLongEnglishDesc ? ' long-english' : ''}" aria-describedby="tool-${tool.id}-title">
                    ${highlightedDesc}
                </div>
            </a>
        `;
    }


    /**
     * 简化描述信息，不添加额外标识
     * @private
     * @param {Object} tool - 工具对象
     * @param {string} originalDesc - 原始描述
     * @param {string} currentLang - 当前语言
     * @returns {string} 原始描述
     */
    _enhanceDescription(tool, originalDesc, currentLang) {
        return originalDesc;
    }

    /**
     * 检测是否为英文长描述
     * @private
     * @param {string} description - 描述文本
     * @param {string} currentLang - 当前语言
     * @returns {boolean} 是否为英文长描述
     */
    _isLongEnglishDescription(description, currentLang) {
        if (!description) return false;
        
        // 中文环境下不应用此优化
        if (currentLang === 'zh') return false;
        
        // 检测英文内容：计算英文字符占比
        const englishChars = description.match(/[a-zA-Z]/g);
        const totalChars = description.replace(/\s+/g, '').length;
        
        if (!englishChars || totalChars === 0) return false;
        
        const englishRatio = englishChars.length / totalChars;
        
        // 英文字符超过70%且描述长度超过80个字符，认为是长英文描述
        return englishRatio > 0.7 && description.length > 80;
    }

    /**
     * 应用文本高亮
     * @private
     * @param {string} text - 原文本
     * @param {string} query - 搜索查询
     * @returns {string} 高亮后的文本
     */
    _applyHighlight(text, query) {
        if (!query || !text) return text;
        
        const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        let highlightedText = text;
        
        for (const term of searchTerms) {
            const regex = new RegExp(`(${this._escapeRegExp(term)})`, 'gi');
            highlightedText = highlightedText.replace(regex, `<mark class="bg-yellow-200 px-1 py-0.5 rounded">$1</mark>`);
        }
        
        return highlightedText;
    }

    // 推荐徽章功能已移除

    /**
     * 转义正则表达式特殊字符
     * @private
     * @param {string} string - 要转义的字符串
     * @returns {string} 转义后的字符串
     */
    _escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * 绑定工具卡片事件
     * @private
     */
    _bindToolCardEvents() {
        // 工具点击统计 - 现在整个卡片都是链接
        document.querySelectorAll('.tool-card').forEach(link => {
            link.addEventListener('click', (e) => {
                const toolId = link.getAttribute('data-tool-id');
                const category = link.getAttribute('data-tool-category');
                
                // 统计点击
                console.log(`🔗 Tool clicked: ${toolId} (${category})`);
                
                // 发送统计数据到分析服务
                this._trackToolClick(toolId, category);
            });
        });
    }

    /**
     * 跟踪工具点击
     * @private
     * @param {string} toolId - 工具ID
     * @param {string} category - 工具分类
     */
    _trackToolClick(toolId, category) {
        // 发送点击统计（如果有Google Analytics等）
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_click', {
                'tool_id': toolId,
                'tool_category': category,
                'search_query': this.searchInput?.value || '',
                'current_category': this.currentCategory
            });
        }
    }

    /**
     * 更新分类显示信息
     * @private
     */
    _updateCategoryDisplay() {
        if (!this.currentCategoryTitle) return;
        
        const currentLang = window.i18n?.getCurrentLanguage() || 'zh';
        
        if (this.currentCategory === 'all') {
            this.currentCategoryTitle.textContent = currentLang === 'zh' ? '所有工具' : 'All Tools';
        } else {
            const category = this.categories[this.currentCategory];
            const categoryName = category ? (category.name[currentLang] || category.name.en) : this.currentCategory;
            this.currentCategoryTitle.textContent = categoryName;
        }
    }

    /**
     * 显示加载状态
     * @private
     */
    _showLoading() {
        this.toolsContainer?.classList.add('hidden');
        this.noResults?.classList.add('hidden');
        this.toolsLoading?.classList.remove('hidden');
    }

    /**
     * 隐藏加载状态
     * @private
     */
    _hideLoading() {
        this.toolsLoading?.classList.add('hidden');
        this.toolsContainer?.classList.remove('hidden');
    }

    /**
     * 显示无结果状态
     * @private
     */
    _showNoResults() {
        this.toolsContainer?.classList.add('hidden');
        this.noResults?.classList.remove('hidden');
    }

    /**
     * 隐藏无结果状态
     * @private
     */
    _hideNoResults() {
        this.noResults?.classList.add('hidden');
        this.toolsContainer?.classList.remove('hidden');
    }

    /**
     * 获取当前搜索查询
     * @returns {string} 当前搜索查询
     */
    getCurrentQuery() {
        return this.searchInput?.value.trim() || '';
    }

    /**
     * 获取当前搜索结果
     * @returns {Array} 当前搜索结果
     */
    getCurrentResults() {
        return this.currentResults;
    }

    /**
     * 获取当前分类
     * @returns {string} 当前分类ID
     */
    getCurrentCategory() {
        return this.currentCategory;
    }

    /**
     * 注册事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * 移除事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    off(event, callback) {
        if (!this.listeners[event]) return;
        
        const index = this.listeners[event].indexOf(callback);
        if (index > -1) {
            this.listeners[event].splice(index, 1);
        }
    }

    /**
     * 触发事件
     * @private
     * @param {string} event - 事件名称
     * @param {any} data - 事件数据
     */
    _emit(event, data) {
        if (!this.listeners[event]) return;
        
        this.listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Event callback error for ${event}:`, error);
            }
        });
    }

    /**
     * 显示错误信息
     * @private
     * @param {string} message - 错误消息
     */
    _showError(message) {
        console.error('Search Error:', message);
        Utils.showNotification(message, 'error');
    }
}

// 创建全局实例
window.searchManager = new SearchManager();

// 导出类
window.SearchManager = SearchManager;