/**
 * ABeiTools V3.0 - Main Application Controller
 * 主应用控制器
 */

class AppManager {
    constructor() {
        this.isInitialized = false;
        this.categories = {};
        this.isMobile = false;
        this.sidebarOpen = false;
        
        // DOM元素引用
        this.elements = {
            loadingScreen: null,
            sidebar: null,
            sidebarOverlay: null,
            mobileMenuToggle: null,
            sidebarClose: null,
            categoriesNav: null,
            themeToggle: null,
            backToTop: null,
            statsText: null,
            adminBtn: null
        };
        
        // 配置
        this.config = {
            mobileBreakpoint: 768,
            backToTopThreshold: 700, // 优化回到顶部阈值
            sidebarTransitionDuration: 300,
            loadingMinDuration: 800, // 最小加载时间，避免闪烁
            scrollSpyOffset: 100 // Scrollspy 偏移量
        };
        
        // Scrollspy 状态
        this.scrollSpy = {
            sections: [],
            activeSection: null,
            isScrolling: false
        };
        
        // 启动时间记录
        this.startTime = Date.now();
    }

    /**
     * 应用初始化
     */
    async init() {
        try {
            if (this.isInitialized) return;
            
            console.log('🚀 Initializing ABeiTools V3.0...');
            
            // 1. 基础初始化
            this._bindElements();
            this._detectEnvironment();
            this._bindBasicEvents();
            
            // 2. 初始化核心系统（并行）
            await this._initializeSystems();
            
            // 3. 加载分类数据
            await this._loadCategories();
            
            // 4. 渲染分类导航
            this._renderCategoriesNav();
            
            // 5. 设置初始状态
            this._setupInitialState();
            
            // 6. 隐藏加载屏幕
            await this._hideLoadingScreen();
            
            // 7. 后续初始化
            this._postInit();
            
            this.isInitialized = true;
            console.log('✅ ABeiTools V3.0 initialized successfully');
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this._showInitError(error);
        }
    }

    /**
     * 绑定DOM元素
     * @private
     */
    _bindElements() {
        this.elements = {
            loadingScreen: document.getElementById('loading-screen'),
            sidebar: document.getElementById('sidebar'),
            sidebarOverlay: document.getElementById('sidebar-overlay'),
            mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
            sidebarClose: document.getElementById('sidebar-close'),
            categoriesNav: document.getElementById('categories-nav'),
            backToTop: document.getElementById('back-to-top'),
            statsText: document.getElementById('stats-text')
            // adminBtn removed for security
        };
    }

    /**
     * 环境检测
     * @private
     */
    _detectEnvironment() {
        this.isMobile = Utils.isMobile();
        this.isTouch = Utils.isTouchDevice();
        
        // 监听窗口大小变化
        window.addEventListener('resize', Utils.throttle(() => {
            const wasMobile = this.isMobile;
            this.isMobile = Utils.isMobile();
            
            if (wasMobile !== this.isMobile) {
                this._handleMobileChange();
            }
        }, 250));
        
        console.log(`📱 Environment: ${this.isMobile ? 'Mobile' : 'Desktop'}, ${this.isTouch ? 'Touch' : 'Mouse'}`);
    }

    /**
     * 绑定基础事件
     * @private
     */
    _bindBasicEvents() {
        // 移动端菜单切换
        this.elements.mobileMenuToggle?.addEventListener('click', () => {
            this._toggleSidebar();
        });
        
        // 侧边栏关闭按钮
        this.elements.sidebarClose?.addEventListener('click', () => {
            this._closeSidebar();
        });
        
        // 遮罩层点击关闭
        this.elements.sidebarOverlay?.addEventListener('click', () => {
            this._closeSidebar();
        });
        
        // 回到顶部
        this.elements.backToTop?.addEventListener('click', () => {
            Utils.scrollToElement('body');
        });
        
        // 滚动事件
        window.addEventListener('scroll', Utils.throttle(() => {
            this._handleScroll();
            this._updateScrollSpy();
        }, 100));
        
        // 键盘导航支持
        document.addEventListener('keydown', (e) => {
            this._handleKeyboardNavigation(e);
        });
    }

    /**
     * 处理键盘导航
     * @private
     * @param {KeyboardEvent} e - 键盘事件
     */
    _handleKeyboardNavigation(e) {
        // ESC键关闭侧边栏
        if (e.key === 'Escape' && this.sidebarOpen) {
            this._closeSidebar();
            return;
        }
        
        // Alt + 数字键快速切换分类
        if (e.altKey && e.key >= '1' && e.key <= '6') {
            e.preventDefault();
            const categoryIndex = parseInt(e.key) - 1;
            const categories = ['all', 'chat', 'search', 'creative', 'office', 'coding'];
            const targetCategory = categories[categoryIndex];
            if (targetCategory) {
                this._selectCategoryWithScroll(targetCategory);
            }
            return;
        }
        
        // Ctrl/Cmd + K 聚焦搜索框
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
            return;
        }
        
        // Tab键管理焦点陷阱（侧边栏打开时）
        if (e.key === 'Tab' && this.sidebarOpen) {
            this._handleSidebarTabTrapping(e);
            return;
        }
        
        // 方向键导航工具卡片
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains('tool-card')) {
                e.preventDefault();
                this._navigateToolCards(e.key, activeElement);
            }
            return;
        }
        
        // Home/End键导航
        if (e.key === 'Home' && !e.ctrlKey && !e.metaKey) {
            // 聚焦到第一个工具卡片
            const firstCard = document.querySelector('.tool-card');
            if (firstCard && document.activeElement !== firstCard) {
                e.preventDefault();
                firstCard.focus();
            }
        } else if (e.key === 'End' && !e.ctrlKey && !e.metaKey) {
            // 聚焦到最后一个工具卡片
            const cards = document.querySelectorAll('.tool-card');
            const lastCard = cards[cards.length - 1];
            if (lastCard && document.activeElement !== lastCard) {
                e.preventDefault();
                lastCard.focus();
            }
        }
    }
    
    /**
     * 处理侧边栏Tab键陷阱
     * @private
     * @param {KeyboardEvent} e - 键盘事件
     */
    _handleSidebarTabTrapping(e) {
        if (!this.isMobile || !this.sidebarOpen) return;
        
        const focusableElements = this.elements.sidebar.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusableArray = Array.from(focusableElements);
        const firstFocusable = focusableArray[0];
        const lastFocusable = focusableArray[focusableArray.length - 1];
        
        if (e.shiftKey) {
            // Shift+Tab: 向前导航
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            }
        } else {
            // Tab: 向后导航
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    }
    
    /**
     * 工具卡片方向键导航
     * @private
     * @param {string} key - 按键
     * @param {Element} currentCard - 当前卡片
     */
    _navigateToolCards(key, currentCard) {
        const cards = Array.from(document.querySelectorAll('.tool-card'));
        const currentIndex = cards.indexOf(currentCard);
        
        if (currentIndex === -1) return;
        
        let targetIndex = currentIndex;
        const gridColumns = this._getGridColumns();
        
        switch (key) {
            case 'ArrowLeft':
                targetIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowRight':
                targetIndex = Math.min(cards.length - 1, currentIndex + 1);
                break;
            case 'ArrowUp':
                targetIndex = Math.max(0, currentIndex - gridColumns);
                break;
            case 'ArrowDown':
                targetIndex = Math.min(cards.length - 1, currentIndex + gridColumns);
                break;
        }
        
        if (targetIndex !== currentIndex && cards[targetIndex]) {
            cards[targetIndex].focus();
        }
    }
    
    /**
     * 获取当前网格列数
     * @private
     * @returns {number} 网格列数
     */
    _getGridColumns() {
        const screenWidth = window.innerWidth;
        if (screenWidth >= 1280) return 4;
        if (screenWidth >= 1024) return 3;
        if (screenWidth >= 640) return 2;
        return 1;
    }

    /**
     * 初始化核心系统
     * @private
     */
    async _initializeSystems() {
        const initPromises = [];
        
        // 初始化多语言系统
        if (window.i18n) {
            initPromises.push(window.i18n.init());
        }
        
        // 初始化搜索系统
        if (window.searchManager) {
            initPromises.push(window.searchManager.init());
        }
        
        // 等待所有系统初始化完成
        await Promise.all(initPromises);
        
        // 绑定系统间事件
        this._bindSystemEvents();
    }

    /**
     * 绑定系统间事件
     * @private
     */
    _bindSystemEvents() {
        // 监听语言变更
        if (window.i18n) {
            window.i18n.on('language-changed', (data) => {
                console.log(`🌍 Language changed to: ${data.to}`);
                this._updateStatsText();
                this._updateCategoriesNav();
                // 重新渲染工具
                if (window.searchManager) {
                    window.searchManager.renderInitialTools();
                }
            });
        }
        
        // 监听搜索事件
        if (window.searchManager) {
            window.searchManager.on('search-start', (data) => {
                console.log(`🔍 Search started: ${data.query}`);
            });
            
            window.searchManager.on('search-complete', (data) => {
                console.log(`✅ Search completed: ${data.total} results`);
            });
            
            window.searchManager.on('search-clear', () => {
                console.log(`🧹 Search cleared`);
            });
        }
    }

    /**
     * 加载分类数据
     * @private
     */
    async _loadCategories() {
        try {
            const response = await fetch('./config/categories.json');
            if (!response.ok) throw new Error('Failed to load categories');
            
            const data = await response.json();
            this.categories = data.categories || {};
            
            console.log(`📂 Loaded ${Object.keys(this.categories).length} categories`);
            
        } catch (error) {
            console.error('Failed to load categories:', error);
            throw error;
        }
    }

    /**
     * 渲染分类导航
     * @private
     */
    _renderCategoriesNav() {
        if (!this.elements.categoriesNav) return;
        
        const currentLang = window.i18n?.getCurrentLanguage() || 'zh';
        
        // 添加"所有工具"选项
        const allToolsItem = this._createCategoryItem('all', {
            name: { [currentLang]: currentLang === 'zh' ? '所有工具' : 'All Tools' },
            icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>',
            color: '#6B7280'
        }, true);
        
        // 创建分类项
        const categoryItems = Object.entries(this.categories)
            .filter(([_, category]) => category.enabled !== false)
            .sort(([_, a], [__, b]) => (a.order || 0) - (b.order || 0))
            .map(([id, category]) => this._createCategoryItem(id, category));
        
        this.elements.categoriesNav.innerHTML = allToolsItem + categoryItems.join('');
        
        // 绑定分类点击事件
        this._bindCategoryEvents();
        
        // 初始化 Scrollspy
        setTimeout(() => {
            this._initScrollSpy();
        }, 100);
        
        // 更新分类工具数量
        this._updateCategoryToolCounts();
    }

    /**
     * 创建分类项HTML
     * @private
     * @param {string} categoryId - 分类ID
     * @param {Object} category - 分类数据
     * @param {boolean} isActive - 是否为当前激活项
     * @returns {string} HTML字符串
     */
    _createCategoryItem(categoryId, category, isActive = false) {
        const currentLang = window.i18n?.getCurrentLanguage() || 'zh';
        const categoryName = category.name[currentLang] || category.name.en || categoryId;
        const activeClass = isActive ? 'category-active' : '';
        
        const categoryColor = category.color || '#6B7280';
        const hoverBgColor = categoryColor + '10'; // 添加透明度
        const hoverTextColor = categoryColor;
        
        return `
            <button class="category-item ${activeClass} w-full flex items-center px-4 py-3 text-left text-gray-700 rounded-lg transition-colors duration-200" 
                    data-category="${categoryId}"
                    title="${categoryName}"
                    style="--category-color: ${categoryColor}; --hover-bg: ${hoverBgColor}; --hover-text: ${hoverTextColor};"
                    onmouseover="this.style.backgroundColor = '${hoverBgColor}'; this.style.color = '${hoverTextColor}';"
                    onmouseout="this.classList.contains('category-active') ? '' : (this.style.backgroundColor = '', this.style.color = '#374151')">
                <span class="category-icon text-lg mr-3" style="color: ${categoryColor}">
                    ${category.icon || '📁'}
                </span>
                <span class="category-name text-sm font-medium flex-1">
                    ${categoryName}
                </span>
                <span class="category-count text-xs text-gray-400 ml-2" id="count-${categoryId}">
                    0
                </span>
            </button>
        `;
    }

    /**
     * 绑定分类点击事件
     * @private
     */
    _bindCategoryEvents() {
        document.querySelectorAll('.category-item').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = button.getAttribute('data-category');
                this._selectCategoryWithScroll(categoryId);
                
                // 移动端点击后关闭侧边栏
                if (this.isMobile) {
                    setTimeout(() => this._closeSidebar(), 150);
                }
            });
        });
    }
    
    /**
     * 选择分类并滚动到对应区块
     * @private
     * @param {string} categoryId
     */
    _selectCategoryWithScroll(categoryId) {
        console.log(`📂 Category selected with scroll: ${categoryId}`);
        
        // 设置滚动标记，防止ScrollSpy干扰
        this.scrollSpy.isScrolling = true;
        
        // 更新活跃状态
        this._updateActiveCategory(categoryId);
        
        // 滚动到对应区块
        this._scrollToSection(categoryId);
        
        // 通知搜索系统切换分类
        if (window.searchManager) {
            window.searchManager.setCategory(categoryId);
        }
        
        // 清除滚动标记
        setTimeout(() => {
            this.scrollSpy.isScrolling = false;
        }, 500);
    }
    
    /**
     * 滚动到指定区块
     * @private
     * @param {string} sectionId
     */
    _scrollToSection(sectionId) {
        let targetElement;
        
        if (sectionId === 'all') {
            // 滚动到页面顶部
            targetElement = document.querySelector('#tools-container');
        } else {
            // 滚动到对应分类区块
            targetElement = document.querySelector(`[data-category-section="${sectionId}"]`);
        }
        
        if (targetElement) {
            const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 80; // 80px offset for header
            
            window.scrollTo({
                top: Math.max(0, offsetTop),
                behavior: 'smooth'
            });
            
            console.log(`📍 Scrolled to section: ${sectionId}`);
        } else {
            console.warn(`⚠️ Section element not found: ${sectionId}`);
        }
    }

    /**
     * 选择分类（不滚动，用于搜索等场景）
     * @private
     * @param {string} categoryId - 分类ID
     */
    _selectCategory(categoryId) {
        console.log(`📂 Category selected: ${categoryId}`);
        
        // 更新活跃状态
        this._updateActiveCategory(categoryId);
        
        // 通知搜索系统切换分类
        if (window.searchManager) {
            window.searchManager.setCategory(categoryId);
        }
        
        // 如果是移动端，点击后关闭侧边栏
        if (this.isMobile) {
            setTimeout(() => this._closeSidebar(), 150);
        }
    }

    /**
     * 更新活跃分类
     * @private
     * @param {string} categoryId - 分类ID
     */
    _updateActiveCategory(categoryId) {
        // 移除所有激活状态
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('category-active');
            // 重置为默认样式
            item.style.backgroundColor = '';
            item.style.color = '#374151';
            item.style.borderLeft = '';
            item.style.paddingLeft = '';
        });
        
        // 添加当前激活状态 - 统一使用JavaScript动态设置所有颜色
        const activeButton = document.querySelector(`.category-item[data-category="${categoryId}"]`);
        if (activeButton) {
            activeButton.classList.add('category-active');
            
            // 直接从categories数据获取颜色，确保一致性
            const category = this.categories[categoryId];
            // 特殊处理"所有工具"分类（不在categories.json中）
            const categoryColor = categoryId === 'all' ? '#6B7280' : (category ? category.color : '#3B82F6');
            
            // 动态设置所有相关颜色
            activeButton.style.color = categoryColor;
            activeButton.style.borderLeft = `3px solid ${categoryColor}`;
            activeButton.style.paddingLeft = '13px'; // 调整内边距以适应边框
            
            // 设置浅色背景（颜色+10%透明度）
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            };
            
            const rgb = hexToRgb(categoryColor);
            if (rgb) {
                activeButton.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
            }
        }
    }

    /**
     * 更新分类导航（语言变更时）
     * @private
     */
    _updateCategoriesNav() {
        const currentLang = window.i18n?.getCurrentLanguage() || 'zh';
        
        // 更新"所有工具"文本
        const allToolsButton = document.querySelector('.category-item[data-category="all"] .category-name');
        if (allToolsButton) {
            allToolsButton.textContent = currentLang === 'zh' ? '所有工具' : 'All Tools';
        }
        
        // 更新其他分类名称
        Object.entries(this.categories).forEach(([id, category]) => {
            const button = document.querySelector(`.category-item[data-category="${id}"] .category-name`);
            if (button) {
                button.textContent = category.name[currentLang] || category.name.en || id;
            }
        });
        
        // 重新更新工具数量
        this._updateCategoryToolCounts();
    }

    /**
     * 更新分类工具数量
     * @private
     */
    _updateCategoryToolCounts() {
        // 从SearchManager获取工具数据
        const tools = window.searchManager?.tools || [];
        
        // 统计每个分类的工具数量
        const categoryCounts = {};
        tools.forEach(tool => {
            categoryCounts[tool.category] = (categoryCounts[tool.category] || 0) + 1;
        });
        
        // 更新"所有工具"的数量
        const allCount = document.getElementById('count-all');
        if (allCount) {
            allCount.textContent = tools.length;
        }
        
        // 更新各分类的工具数量
        Object.entries(this.categories).forEach(([categoryId, category]) => {
            const countElement = document.getElementById(`count-${categoryId}`);
            if (countElement) {
                countElement.textContent = categoryCounts[categoryId] || 0;
            }
        });
        
        console.log('📊 Category tool counts updated:', categoryCounts);
    }

    /**
     * 设置初始状态
     * @private
     */
    _setupInitialState() {
        
        // 更新统计文本
        this._updateStatsText();
        
        // 显示管理按钮（仅在开发环境）
        this._checkShowAdminBtn();
        
        // 移动端默认关闭侧边栏
        if (this.isMobile) {
            this._closeSidebar();
        }
    }

    /**
     * 隐藏加载屏幕
     * @private
     */
    async _hideLoadingScreen() {
        const elapsedTime = Date.now() - this.startTime;
        const minTime = this.config.loadingMinDuration;
        
        // 确保最小显示时间，避免闪烁
        if (elapsedTime < minTime) {
            await new Promise(resolve => setTimeout(resolve, minTime - elapsedTime));
        }
        
        // 添加淡出动画
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.opacity = '0';
            
            setTimeout(() => {
                if (this.elements.loadingScreen) {
                    this.elements.loadingScreen.style.display = 'none';
                }
            }, 300);
        }
    }

    /**
     * 后续初始化
     * @private
     */
    _postInit() {
        // 渲染初始工具
        if (window.searchManager) {
            window.searchManager.renderInitialTools();
        }
        
        // 延迟更新分类计数（确保工具数据加载完成）
        setTimeout(() => {
            this._updateCategoryToolCounts();
        }, 100);
        
        // 预加载关键资源
        this._preloadResources();
        
        // 设置分析跟踪
        this._setupAnalytics();
        
        // 注册服务工作者（如果需要PWA支持）
        // this._registerServiceWorker();
    }

    /**
     * 预加载关键资源
     * @private
     */
    _preloadResources() {
        // 预加载可能用到的图片（使用requestIdleCallback优化）
        const imagesToPreload = [
            '/assets/images/og-image.jpg',
            '/assets/images/twitter-image.jpg'
        ];
        
        const preloadImages = () => {
            imagesToPreload.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        };

        // 使用空闲时间预加载，避免阻塞主线程
        if ('requestIdleCallback' in window) {
            requestIdleCallback(preloadImages);
        } else {
            setTimeout(preloadImages, 100);
        }
    }

    /**
     * 设置分析跟踪
     * @private
     */
    _setupAnalytics() {
        // 页面浏览统计
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href
            });
        }
    }

    /**
     * 侧边栏控制
     */
    _toggleSidebar() {
        if (this.sidebarOpen) {
            this._closeSidebar();
        } else {
            this._openSidebar();
        }
    }

    _openSidebar() {
        if (!this.isMobile) return;
        
        this.sidebarOpen = true;
        this.elements.sidebar?.classList.remove('-translate-x-full');
        this.elements.sidebarOverlay?.classList.remove('hidden');
        this.elements.mobileMenuToggle?.classList.add('active');
        
        // 防止背景滚动
        document.body.style.overflow = 'hidden';
    }

    _closeSidebar() {
        if (!this.isMobile) return;
        
        this.sidebarOpen = false;
        this.elements.sidebar?.classList.add('-translate-x-full');
        this.elements.sidebarOverlay?.classList.add('hidden');
        this.elements.mobileMenuToggle?.classList.remove('active');
        
        // 恢复背景滚动
        document.body.style.overflow = '';
    }

    /**
     * 处理移动端变化
     * @private
     */
    _handleMobileChange() {
        if (!this.isMobile && this.sidebarOpen) {
            this._closeSidebar();
        }
        
        console.log(`📱 Mobile state changed: ${this.isMobile}`);
    }


    /**
     * 滚动处理
     * @private
     */
    _handleScroll() {
        const scrollY = window.scrollY;
        
        // 回到顶部按钮显示/隐藏
        if (this.elements.backToTop) {
            if (scrollY > this.config.backToTopThreshold) {
                this.elements.backToTop.classList.remove('translate-y-16');
            } else {
                this.elements.backToTop.classList.add('translate-y-16');
            }
        }
    }
    
    /**
     * 初始化 Scrollspy
     * @private
     */
    _initScrollSpy() {
        // 收集所有分类区块
        this.scrollSpy.sections = [
            { id: 'all', element: document.querySelector('#all-tools-container') },
            { id: 'chat', element: document.querySelector('[data-category-section="chat"]') },
            { id: 'search', element: document.querySelector('[data-category-section="search"]') },
            { id: 'creative', element: document.querySelector('[data-category-section="creative"]') },
            { id: 'office', element: document.querySelector('[data-category-section="office"]') },
            { id: 'coding', element: document.querySelector('[data-category-section="coding"]') }
        ].filter(section => section.element); // 过滤掉不存在的元素
        
        console.log(`📍 ScrollSpy initialized with ${this.scrollSpy.sections.length} sections`);
    }
    
    /**
     * 更新 Scrollspy
     * @private
     */
    _updateScrollSpy() {
        if (this.scrollSpy.sections.length === 0) return;
        
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        let activeSection = null;
        
        // 找到当前可见的区块
        for (let i = 0; i < this.scrollSpy.sections.length; i++) {
            const section = this.scrollSpy.sections[i];
            const element = section.element;
            
            if (!element) continue;
            
            const rect = element.getBoundingClientRect();
            const elementTop = scrollY + rect.top;
            const elementBottom = elementTop + rect.height;
            
            // 检查元素是否在视口中
            if (elementTop <= scrollY + this.config.scrollSpyOffset && 
                elementBottom > scrollY + this.config.scrollSpyOffset) {
                activeSection = section.id;
                break;
            }
        }
        
        // 如果没有找到活跃区块，默认选择第一个
        if (!activeSection && this.scrollSpy.sections.length > 0) {
            activeSection = this.scrollSpy.sections[0].id;
        }
        
        // 更新活跃状态
        if (activeSection && activeSection !== this.scrollSpy.activeSection) {
            this.scrollSpy.activeSection = activeSection;
            this._updateActiveCategoryByScroll(activeSection);
        }
    }
    
    /**
     * 根据滚动位置更新活跃分类
     * @private
     * @param {string} sectionId
     */
    _updateActiveCategoryByScroll(sectionId) {
        if (this.scrollSpy.isScrolling) return; // 防止递归
        
        // 更新侧边栏活跃状态 - 复用统一的激活样式方法
        this._updateActiveCategory(sectionId);
        
        console.log(`📍 ScrollSpy: Active section changed to ${sectionId}`);
    }

    /**
     * 更新统计文本
     * @private
     */
    _updateStatsText() {
        if (!this.elements.statsText) return;
        
        const currentLang = window.i18n?.getCurrentLanguage() || 'zh';
        
        if (currentLang === 'zh') {
            this.elements.statsText.textContent = '精选全球优质AI工具';
        } else {
            this.elements.statsText.textContent = 'Curated Global AI Tools';
        }
    }

    /**
     * 管理员按钮访问已移除
     * @private
     */
    _checkShowAdminBtn() {
        // Admin access removed for security
        console.log('🔒 Admin panel access disabled for production security');
    }

    /**
     * 显示初始化错误
     * @private
     * @param {Error} error - 错误对象
     */
    _showInitError(error) {
        // 隐藏加载屏幕
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.innerHTML = `
                <div class="text-center">
                    <div class="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 class="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
                    <p class="text-gray-600 mb-4">应用初始化时遇到问题，请刷新页面重试</p>
                    <button onclick="window.location.reload()" 
                            class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">
                        刷新页面
                    </button>
                    <details class="mt-4 text-left">
                        <summary class="cursor-pointer text-sm text-gray-500">技术详情</summary>
                        <pre class="mt-2 text-xs text-gray-400 bg-gray-100 p-2 rounded overflow-auto">${error.message}</pre>
                    </details>
                </div>
            `;
        }
    }

    /**
     * 获取应用状态信息
     * @returns {Object} 状态信息
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            isMobile: this.isMobile,
            sidebarOpen: this.sidebarOpen,
            currentLanguage: window.i18n?.getCurrentLanguage(),
            totalCategories: Object.keys(this.categories).length
        };
    }
}

/**
 * 应用启动函数
 */
async function startApp() {
    // 创建全局应用实例
    window.app = new AppManager();
    
    // 启动应用
    await window.app.init();
    
    // 开发模式下输出状态信息
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔧 Development mode - App status:', window.app.getStatus());
    }
}

// DOM加载完成后启动应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

// 导出供其他模块使用
window.AppManager = AppManager;