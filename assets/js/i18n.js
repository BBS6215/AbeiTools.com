/**
 * ABeiTools V3.0 - Internationalization System
 * 多语言国际化系统
 */

class I18nManager {
    constructor() {
        this.currentLang = 'zh';  // 默认语言
        this.fallbackLang = 'en'; // 后备语言
        this.translations = {};   // 翻译数据
        this.rtlLanguages = ['ar']; // RTL语言列表
        this.loadPromise = null;  // 加载Promise，避免重复加载
        
        // 支持的语言配置
        this.supportedLanguages = {
            'zh': { name: '中文', flag: '🇨🇳', nativeName: '中文' },
            'en': { name: 'English', flag: '🇺🇸', nativeName: 'English' },
            'es': { name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
            'ar': { name: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
            'ru': { name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
            'ja': { name: '日本語', flag: '🇯🇵', nativeName: '日本語' }
        };
        
        // 事件系统
        this.listeners = {
            'language-changed': [],
            'translations-loaded': []
        };
    }

    /**
     * 初始化多语言系统
     */
    async init() {
        try {
            console.log('🌍 Initializing i18n system...');
            
            // 避免重复初始化
            if (this.loadPromise) {
                console.log('⏳ I18n already initializing, waiting for completion...');
                return await this.loadPromise;
            }

            this.loadPromise = this._performInit();
            await this.loadPromise;
            
            console.log('✅ I18n system initialized successfully');
        } catch (error) {
            console.error('❌ I18n initialization failed:', error);
            this._showError('多语言系统加载失败，请刷新页面重试');
        }
    }

    /**
     * 执行初始化
     * @private
     */
    async _performInit() {
        // 1. 检测并设置语言
        console.log('🔍 Detecting language...');
        this._detectLanguage();
        console.log('📍 Current language set to:', this.currentLang);
        
        // 2. 加载翻译数据
        console.log('📚 Loading translations...');
        await this._loadTranslations();
        console.log('✅ Translations loaded successfully');
        
        // 3. 应用翻译
        console.log('📝 Applying translations to DOM...');
        this._applyTranslations();
        
        // 4. 设置RTL
        console.log('↔️ Setting up RTL support...');
        this._handleRTL();
        
        // 5. 更新页面meta信息
        console.log('📄 Updating page metadata...');
        this._updatePageMeta();
        
        // 6. 绑定事件
        console.log('🔗 Binding events...');
        this._bindEvents();
        
        // 7. 触发加载完成事件
        console.log('📡 Emitting translations-loaded event...');
        this._emit('translations-loaded', { language: this.currentLang });
    }

    /**
     * 检测用户语言偏好
     * @private
     */
    _detectLanguage() {
        // 1. 优先使用URL参数（安全检查Utils）
        try {
            const urlLang = window.Utils?.url?.getParam('lang') || new URLSearchParams(window.location.search).get('lang');
            if (urlLang && this.supportedLanguages[urlLang]) {
                this.currentLang = urlLang;
                return;
            }
        } catch (error) {
            console.warn('URL param detection failed:', error);
        }

        // 2. 其次使用本地存储（安全检查Utils）
        try {
            let parsedLang = null;
            if (window.Utils?.storage?.get) {
                // Utils.storage.get已经解析了JSON，直接使用
                parsedLang = window.Utils.storage.get('abei_language');
            } else {
                // 直接使用localStorage，需要手动解析
                const savedLang = localStorage.getItem('abei_language');
                parsedLang = savedLang ? JSON.parse(savedLang) : null;
            }
            
            if (parsedLang && this.supportedLanguages[parsedLang]) {
                this.currentLang = parsedLang;
                return;
            }
        } catch (error) {
            console.warn('LocalStorage detection failed:', error);
        }

        // 3. 最后使用浏览器语言
        const browserLang = this._getBrowserLanguage();
        if (browserLang && this.supportedLanguages[browserLang]) {
            this.currentLang = browserLang;
            return;
        }

        // 4. 默认使用中文
        this.currentLang = 'zh';
    }

    /**
     * 获取浏览器语言设置
     * @private
     * @returns {string|null} 语言代码
     */
    _getBrowserLanguage() {
        const browserLangs = navigator.languages || [navigator.language];
        
        for (const lang of browserLangs) {
            // 直接匹配
            const langCode = lang.toLowerCase();
            if (this.supportedLanguages[langCode]) {
                return langCode;
            }
            
            // 匹配主语言（如 zh-CN -> zh）
            const primaryLang = langCode.split('-')[0];
            if (this.supportedLanguages[primaryLang]) {
                return primaryLang;
            }
        }
        
        return null;
    }

    /**
     * 加载翻译数据
     * @private
     */
    async _loadTranslations() {
        try {
            const response = await fetch('./config/i18n.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.translations = await response.json();
            
            // 验证当前语言是否存在
            if (!this.translations[this.currentLang]) {
                console.warn(`⚠️ Language '${this.currentLang}' not found, using fallback '${this.fallbackLang}'`);
                this.currentLang = this.fallbackLang;
            }
            
        } catch (error) {
            console.error('Failed to load translations:', error);
            throw error;
        }
    }

    /**
     * 获取翻译文本
     * @param {string} key - 翻译键，支持点号分隔的嵌套键
     * @param {Object} params - 参数对象，用于字符串插值
     * @returns {string} 翻译后的文本
     */
    t(key, params = {}) {
        try {
            // 获取当前语言的翻译
            let value = Utils.get(this.translations[this.currentLang], key);
            
            // 如果没有找到，尝试后备语言
            if (value === undefined && this.currentLang !== this.fallbackLang) {
                value = Utils.get(this.translations[this.fallbackLang], key);
            }
            
            // 如果仍然没有找到，返回空字符串而不是键名（避免显示技术键值）
            if (value === undefined) {
                // 只对recommendations类的键给出警告，其他的静默处理
                if (key.startsWith('recommendations.')) {
                    console.warn(`🔍 Translation missing for deprecated key: ${key}`);
                }
                return ''; // 返回空字符串，避免在UI中显示键名
            }
            
            // 字符串插值
            return this._interpolate(value, params);
            
        } catch (error) {
            console.error('Translation error:', error);
            return ''; // 出错时也返回空字符串
        }
    }

    /**
     * 字符串插值
     * @private
     * @param {string} template - 模板字符串
     * @param {Object} params - 参数对象
     * @returns {string} 插值后的字符串
     */
    _interpolate(template, params) {
        if (typeof template !== 'string' || Object.keys(params).length === 0) {
            return template;
        }
        
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * 切换语言
     * @param {string} langCode - 语言代码
     * @returns {Promise<boolean>} 是否切换成功
     */
    async setLanguage(langCode) {
        try {
            // 验证语言代码
            if (!this.supportedLanguages[langCode]) {
                throw new Error(`Unsupported language: ${langCode}`);
            }
            
            if (langCode === this.currentLang) {
                return true; // 已经是当前语言
            }
            
            const oldLang = this.currentLang;
            this.currentLang = langCode;
            
            // 保存语言偏好（安全检查Utils）
            try {
                if (window.Utils?.storage?.set) {
                    window.Utils.storage.set('abei_language', langCode);
                } else {
                    localStorage.setItem('abei_language', JSON.stringify(langCode));
                }
            } catch (error) {
                console.warn('Language preference save failed:', error);
            }
            
            // 更新URL参数（不刷新页面，安全检查Utils）
            try {
                if (window.Utils?.url?.setParam) {
                    window.Utils.url.setParam('lang', langCode, false);
                } else {
                    const url = new URL(window.location);
                    url.searchParams.set('lang', langCode);
                    window.history.replaceState({}, '', url);
                }
            } catch (error) {
                console.warn('URL update failed:', error);
            }
            
            // 重新应用翻译
            this._applyTranslations();
            
            // 处理RTL
            this._handleRTL();
            
            // 更新页面标题和meta
            this._updatePageMeta();
            
            // 触发语言变更事件
            this._emit('language-changed', {
                from: oldLang,
                to: langCode,
                language: this.getSupportedLanguages()[langCode]
            });
            
            console.log(`🌍 Language changed from ${oldLang} to ${langCode}`);
            return true;
            
        } catch (error) {
            console.error('❌ Language change failed:', error);
            return false;
        }
    }

    /**
     * 应用翻译到DOM元素
     * @private
     */
    _applyTranslations() {
        console.log('📝 Applying translations for language:', this.currentLang);
        
        // 翻译带有 data-i18n 属性的元素
        const elementsWithI18n = document.querySelectorAll('[data-i18n]');
        console.log(`🔍 Found ${elementsWithI18n.length} elements with data-i18n`);
        
        elementsWithI18n.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // 翻译placeholder属性
        const elementsWithPlaceholder = document.querySelectorAll('[data-i18n-placeholder]');
        console.log(`🔍 Found ${elementsWithPlaceholder.length} elements with data-i18n-placeholder`);
        
        elementsWithPlaceholder.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
        
        // 翻译title属性
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
        
        // 翻译alt属性
        document.querySelectorAll('[data-i18n-alt]').forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            element.alt = this.t(key);
        });
        
        // 翻译content属性（用于meta标签）
        document.querySelectorAll('[data-i18n-content]').forEach(element => {
            const key = element.getAttribute('data-i18n-content');
            const translation = this.t(key);
            if (translation && translation !== key) {
                element.setAttribute('content', translation);
            }
        });
        
        console.log('✅ Translation application completed');
    }

    /**
     * 处理RTL布局
     * @private
     */
    _handleRTL() {
        const isRTL = this.rtlLanguages.includes(this.currentLang);
        const html = document.documentElement;
        
        if (isRTL) {
            html.dir = 'rtl';
            html.classList.add('rtl');
            html.classList.remove('ltr');
        } else {
            html.dir = 'ltr';
            html.classList.add('ltr');
            html.classList.remove('rtl');
        }
    }

    /**
     * 更新页面标题和meta信息
     * @private
     */
    _updatePageMeta() {
        // 更新页面标题
        document.title = this.t('site.title');
        
        // 更新meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = this.t('site.description');
        }
        
        // 更新语言属性
        document.documentElement.lang = this.currentLang;
        
        // 更新OpenGraph信息
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDesc = document.querySelector('meta[property="og:description"]');
        
        if (ogTitle) ogTitle.content = this.t('site.title');
        if (ogDesc) ogDesc.content = this.t('site.description');
    }

    /**
     * 绑定事件监听
     * @private
     */
    _bindEvents() {
        // 语言选择器
        const langSelector = document.getElementById('language-selector');
        
        if (langSelector) {
            langSelector.value = this.currentLang;
            langSelector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
            console.log('✅ Language selector event bound successfully');
        } else {
            console.error('❌ Language selector not found! Element with id "language-selector" does not exist.');
        }
    }

    /**
     * 获取当前语言
     * @returns {string} 当前语言代码
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * 获取当前语言信息
     * @returns {Object} 语言信息对象
     */
    getCurrentLanguageInfo() {
        return this.supportedLanguages[this.currentLang];
    }

    /**
     * 获取支持的语言列表
     * @returns {Object} 支持的语言对象
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    /**
     * 检查是否为RTL语言
     * @param {string} langCode - 语言代码，默认为当前语言
     * @returns {boolean} 是否为RTL语言
     */
    isRTL(langCode = this.currentLang) {
        return this.rtlLanguages.includes(langCode);
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
        console.error('I18n Error:', message);
        // 可以在这里添加用户友好的错误提示
    }

    /**
     * 格式化数字（考虑语言环境）
     * @param {number} number - 要格式化的数字
     * @param {Object} options - 格式化选项
     * @returns {string} 格式化后的数字字符串
     */
    formatNumber(number, options = {}) {
        try {
            const locale = this._getLocaleCode();
            return new Intl.NumberFormat(locale, options).format(number);
        } catch (error) {
            console.warn('Number formatting failed:', error);
            return number.toString();
        }
    }

    /**
     * 格式化日期（考虑语言环境）
     * @param {Date|string|number} date - 要格式化的日期
     * @param {Object} options - 格式化选项
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(date, options = {}) {
        try {
            const locale = this._getLocaleCode();
            return new Intl.DateTimeFormat(locale, options).format(new Date(date));
        } catch (error) {
            console.warn('Date formatting failed:', error);
            return new Date(date).toLocaleDateString();
        }
    }

    /**
     * 获取语言环境代码
     * @private
     * @returns {string} 语言环境代码
     */
    _getLocaleCode() {
        const localeMap = {
            'zh': 'zh-CN',
            'en': 'en-US',
            'es': 'es-ES',
            'ar': 'ar-SA',
            'ru': 'ru-RU',
            'ja': 'ja-JP'
        };
        
        return localeMap[this.currentLang] || 'en-US';
    }
}

// 创建全局实例
window.i18n = new I18nManager();

// 导出类供其他模块使用
window.I18nManager = I18nManager;