/**
 * ABeiTools V3.0 - Utility Functions
 * 通用工具函数库
 */

// 工具函数命名空间
window.Utils = {
    
    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {Function} 防抖后的函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 限制时间（毫秒）
     * @returns {Function} 节流后的函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * 深度克隆对象
     * @param {any} obj - 要克隆的对象
     * @returns {any} 克隆后的对象
     */
    deepClone(obj) {
        // 优化：对于现代浏览器使用structuredClone，性能更好
        if (typeof structuredClone === 'function') {
            try {
                return structuredClone(obj);
            } catch {
                // 如果structuredClone失败，回退到手动实现
            }
        }
        
        // 手动深度克隆实现
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
    },

    /**
     * 获取嵌套对象属性值
     * @param {Object} obj - 目标对象
     * @param {string} path - 属性路径，如 'a.b.c'
     * @param {any} defaultValue - 默认值
     * @returns {any} 属性值
     */
    get(obj, path, defaultValue = undefined) {
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result === null || result === undefined || !(key in result)) {
                return defaultValue;
            }
            result = result[key];
        }
        
        return result;
    },

    /**
     * 设置嵌套对象属性值
     * @param {Object} obj - 目标对象
     * @param {string} path - 属性路径
     * @param {any} value - 要设置的值
     */
    set(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let target = obj;

        for (const key of keys) {
            if (!(key in target) || typeof target[key] !== 'object') {
                target[key] = {};
            }
            target = target[key];
        }

        target[lastKey] = value;
    },

    /**
     * 格式化日期
     * @param {Date|string|number} date - 日期
     * @param {string} format - 格式字符串，默认 'YYYY-MM-DD'
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    /**
     * 生成随机ID
     * @param {number} length - ID长度，默认8
     * @returns {string} 随机ID
     */
    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * 检查是否为移动设备
     * @returns {boolean} 是否为移动设备
     */
    isMobile() {
        return window.innerWidth < 768;
    },

    /**
     * 检查是否为触摸设备
     * @returns {boolean} 是否为触摸设备
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    /**
     * 平滑滚动到元素
     * @param {string|Element} target - 目标元素或选择器
     * @param {number} offset - 偏移量，默认0
     */
    scrollToElement(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },

    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     * @returns {Promise<boolean>} 是否复制成功
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const result = document.execCommand('copy');
                textArea.remove();
                return result;
            }
        } catch (error) {
            console.error('Copy to clipboard failed:', error);
            return false;
        }
    },

    /**
     * 创建提示消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型: success, error, warning, info
     * @param {number} duration - 显示时长（毫秒），默认3000
     */
    showNotification(message, type = 'info', duration = 3000) {
        // 移除现有通知
        const existing = document.querySelector('.notification-toast');
        if (existing) existing.remove();

        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification-toast fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 transform transition-all duration-300 translate-x-full`;
        
        // 设置样式
        const styles = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        notification.classList.add(styles[type] || styles.info);
        notification.textContent = message;

        // 添加到页面
        document.body.appendChild(notification);

        // 动画显示
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 10);

        // 自动隐藏
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    /**
     * 本地存储操作
     */
    storage: {
        /**
         * 获取本地存储数据
         * @param {string} key - 存储键
         * @param {any} defaultValue - 默认值
         * @returns {any} 存储的值
         */
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('LocalStorage get error:', error);
                return defaultValue;
            }
        },

        /**
         * 设置本地存储数据
         * @param {string} key - 存储键
         * @param {any} value - 要存储的值
         * @returns {boolean} 是否存储成功
         */
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('LocalStorage set error:', error);
                return false;
            }
        },

        /**
         * 删除本地存储数据
         * @param {string} key - 存储键
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error('LocalStorage remove error:', error);
            }
        },

        /**
         * 清空本地存储
         */
        clear() {
            try {
                localStorage.clear();
            } catch (error) {
                console.error('LocalStorage clear error:', error);
            }
        }
    },

    /**
     * URL 相关工具
     */
    url: {
        /**
         * 获取URL参数
         * @param {string} name - 参数名
         * @param {string} url - URL字符串，默认为当前页面URL
         * @returns {string|null} 参数值
         */
        getParam(name, url = window.location.href) {
            const urlObj = new URL(url);
            return urlObj.searchParams.get(name);
        },

        /**
         * 设置URL参数
         * @param {string} name - 参数名
         * @param {string} value - 参数值
         * @param {boolean} push - 是否推入历史记录，默认false
         */
        setParam(name, value, push = false) {
            const url = new URL(window.location);
            url.searchParams.set(name, value);
            
            if (push) {
                window.history.pushState({}, '', url);
            } else {
                window.history.replaceState({}, '', url);
            }
        },

        /**
         * 删除URL参数
         * @param {string} name - 参数名
         */
        removeParam(name) {
            const url = new URL(window.location);
            url.searchParams.delete(name);
            window.history.replaceState({}, '', url);
        }
    },

    /**
     * 数组工具
     */
    array: {
        /**
         * 数组去重
         * @param {Array} arr - 原数组
         * @param {string} key - 去重依据的属性名（对象数组）
         * @returns {Array} 去重后的数组
         */
        unique(arr, key = null) {
            if (!key) {
                return [...new Set(arr)];
            }
            
            const seen = new Set();
            return arr.filter(item => {
                const val = item[key];
                if (seen.has(val)) {
                    return false;
                }
                seen.add(val);
                return true;
            });
        },

        /**
         * 数组分组
         * @param {Array} arr - 原数组
         * @param {string|Function} key - 分组依据
         * @returns {Object} 分组后的对象
         */
        groupBy(arr, key) {
            return arr.reduce((groups, item) => {
                const group = typeof key === 'function' ? key(item) : item[key];
                (groups[group] = groups[group] || []).push(item);
                return groups;
            }, {});
        },

        /**
         * 数组排序
         * @param {Array} arr - 原数组
         * @param {string|Function} key - 排序依据
         * @param {string} order - 排序顺序: asc, desc
         * @returns {Array} 排序后的数组
         */
        sortBy(arr, key, order = 'asc') {
            const sorted = [...arr].sort((a, b) => {
                const valueA = typeof key === 'function' ? key(a) : a[key];
                const valueB = typeof key === 'function' ? key(b) : b[key];
                
                if (valueA < valueB) return order === 'asc' ? -1 : 1;
                if (valueA > valueB) return order === 'asc' ? 1 : -1;
                return 0;
            });
            
            return sorted;
        }
    }
};

// 导出到全局
window.utils = window.Utils;