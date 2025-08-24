# AbeiTools - AI工具导航站

> 发现优质AI工具，提升你的效率与创造力

[English](README.md) | 中文

## 🚀 功能特性

- **🌐 多语言支持**: 5种语言（EN, 中文, ES, AR, RU）自动检测，记忆偏好
- **🔍 智能搜索**: 本地实时搜索名称、描述、标签
- **📱 响应式设计**: 完美适配桌面端和移动端
- **⚡ 快速加载**: 纯静态设计，首屏加载 < 2s
- **📊 分类导航**: 9大分类，锚点跳转，数量统计
- **🔄 数据外置**: JSON文件管理，修改即生效
- **💰 广告支持**: 集成Google AdSense，审核占位
- **♿ 无障碍**: 支持键盘导航，WCAG AA标准
- **🛠️ 管理后台**: 内置内容管理系统

## 🌍 支持的语言

- **English (EN)** - 英语（默认语言）
- **中文 (ZH)** - 简体中文
- **Español (ES)** - 西班牙语
- **العربية (AR)** - 阿拉伯语，支持RTL布局
- **Русский (RU)** - 俄语

## 📁 项目结构

```
AbeiTools/
├── index.html              # 主页面
├── admin.html              # 管理后台
├── 404.html                # 404错误页面
├── demo-data.json          # 演示数据（file://协议使用）
├── data/
│   └── links.json         # 生产数据（http://协议使用）
├── start_server.py         # 本地开发服务器
├── README.md              # 英文文档
└── README-zh.md           # 中文文档
```

## 🛠️ 部署方式

### 1. Cloudflare Pages部署（推荐）

1. 将代码推送到GitHub仓库
2. 在[Cloudflare Pages](https://pages.cloudflare.com/)创建新项目
3. 连接你的GitHub仓库
4. 配置构建设置：
   - **框架预设**: `None`
   - **构建命令**: 留空
   - **构建输出目录**: `/`
5. 绑定自定义域名（可选）

### 2. 其他静态托管服务

本项目支持任何静态托管服务：
- **Netlify**: 直接连接GitHub仓库
- **Vercel**: 零配置部署
- **GitHub Pages**: 在仓库设置中启用
- **Firebase Hosting**: 使用`firebase deploy`

### 3. Google AdSense配置

1. 申请[Google AdSense](https://www.google.com/adsense/)账户
2. 获取发布商ID（格式：`ca-pub-xxxxxxxxxxxxxxxx`）
3. 在`index.html`中替换`ca-pub-XXXXXXXXXXXXXXXX`为你的实际ID
4. 配置广告单元并更新`data-ad-slot`值

## 📝 使用指南

### 前台使用

- **访问网站**: 直接打开主页即可使用，无需注册
- **搜索工具**: 使用顶部搜索框实时搜索工具
- **切换语言**: 点击右上角"EN/中文/ES/عر/RU"按钮
- **分类浏览**: 点击左侧分类导航快速跳转
- **访问工具**: 点击工具卡片在新标签页打开

### 数据管理

#### 方法1：管理后台（推荐）
1. 在浏览器中访问`/admin.html`
2. 使用可视化界面添加、编辑或删除工具
3. 导出更新后的`links.json`文件
4. 上传到你的GitHub仓库

#### 方法2：直接编辑文件
1. 直接在GitHub仓库中编辑`data/links.json`
2. 提交更改到main分支
3. Cloudflare Pages自动部署（1-2分钟）
4. 刷新网站查看更新

### 数据格式

工具数据存储在`data/links.json`中：

```json
{
  "links": [
    {
      "id": "unique-id",
      "url": "https://example.com",
      "category": "llm",
      "name": {
        "zh": "中文名称",
        "en": "English Name",
        "es": "Nombre Español",
        "ar": "الاسم العربي",
        "ru": "Русское Имя"
      },
      "desc": {
        "zh": "中文描述（≤30字）",
        "en": "English description (≤80 chars)",
        "es": "Descripción en español",
        "ar": "الوصف بالعربية",
        "ru": "Русское описание"
      },
      "tags": {
        "zh": ["标签1", "标签2"],
        "en": ["tag1", "tag2"],
        "es": ["etiqueta1", "etiqueta2"],
        "ar": ["علامة1", "علامة2"],
        "ru": ["тег1", "тег2"]
      },
      "icon": "https://example.com/icon.png", // 可选
      "sponsor": false
    }
  ]
}
```

### 支持的分类

- `llm`: AI大语言模型
- `image`: AI图像生成
- `video`: AI视频创作
- `audio`: AI音频语音
- `search`: AI搜索引擎
- `code`: AI编程助手
- `agent`: AI智能体与自动化
- `workflow`: AI工作流工具
- `office`: AI办公与效率
- `other`: 其他AI工具

## 🔧 本地开发

### 本地开发环境

**方法1：Python服务器（推荐）**
```bash
# 克隆仓库
git clone https://github.com/yourusername/abeitools.git
cd abeitools

# 启动服务器（加载生产数据）
python start_server.py
# 或者
python -m http.server 8080

# 访问 http://localhost:8080
```

**方法2：直接打开文件**
```bash
# 双击index.html文件
# 浏览器以file://协议打开
# 自动加载demo-data.json避免CORS问题
```

### 清除浏览器缓存/存储

如果看到旧的语言设置，请清除浏览器存储：
```javascript
// 打开浏览器控制台运行：
localStorage.clear();
location.reload();
```

### 质量检查清单

部署完成后，请验证以下功能：

- ✅ 主页正常显示，分类数量正确
- ✅ **新用户默认显示合适的语言**（根据浏览器语言自动检测）
- ✅ 语言切换功能正常，偏好记忆正确
- ✅ 搜索功能按当前语言过滤工具
- ✅ 更新`data/links.json`后刷新页面看到变化
- ✅ AdSense验证脚本在`<head>`中，广告位正常显示
- ✅ 页面首屏加载 < 2s，移动端显示正常
- ✅ 所有工具链接带有`target="_blank" rel="noopener nofollow"`
- ✅ `<html lang>`和页面标题/描述随语言变化
- ✅ 管理后台内容管理功能正常

## 📊 项目统计

- **135+ AI工具** 涵盖9大分类
- **5种语言** 完整支持
- **移动端优化** 响应式设计
- **SEO就绪** 适当的meta标签
- **管理后台** 轻松内容管理

## 🔄 更新说明

### 面向GitHub + Cloudflare Pages用户

1. **本地修改**: 对本地文件进行修改
2. **提交推送**: 
   ```bash
   git add .
   git commit -m "更新: [描述你的修改]"
   git push origin main
   ```
3. **自动部署**: Cloudflare Pages自动部署（1-2分钟）
4. **验证**: 检查你的线上网站

### 重要更新文件

推送更新时始终包含这些文件：
- `index.html` - 主要功能
- `data/links.json` - 工具数据库
- `admin.html` - 管理界面（如有修改）

## 📄 开源许可

MIT License - 你可以自由使用本项目进行任何用途。

## 🤝 贡献代码

欢迎贡献！请随时提交Issues和Pull Requests。

### 如何贡献

1. Fork本仓库
2. 创建功能分支
3. 进行你的修改
4. 充分测试
5. 提交pull request

### 贡献想法

- 添加新的语言翻译
- 改进UI/UX设计
- 添加新的AI工具分类
- 增强搜索功能
- 性能优化

## 🌟 特色功能

### 智能语言检测
- 根据浏览器语言自动显示合适界面
- 支持手动切换并记忆用户偏好
- RTL语言（阿拉伯语）完整支持

### 管理后台
- 可视化工具管理界面
- 支持添加、编辑、删除操作
- 一键导出数据文件
- 分类统计和筛选功能

### 搜索体验
- 实时本地搜索
- 支持多语言内容匹配
- 搜索名称、描述、标签
- 分类筛选功能

## 🎯 使用场景

- **个人导航**: 收藏和管理你常用的AI工具
- **团队分享**: 为团队创建专属AI工具导航
- **教育用途**: 为学生提供AI工具学习资源
- **商业用途**: 构建AI工具推荐网站

---

**AbeiTools** - 让AI工具触手可及 ✨

🌐 **在线演示**: [你的网站URL]
📱 **移动友好**: 在所有设备上完美运行
🔧 **快速部署**: 5分钟内完成部署