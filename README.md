# AbeiTools - AI 工具导航站

> 发现优质 AI 工具，提升你的效率与创造力

## 🚀 功能特性

- **🌐 双语支持**: 中英文界面切换，自动记忆偏好
- **🔍 智能搜索**: 本地实时搜索名称、描述、标签
- **📱 响应式设计**: 完美适配桌面端和移动端
- **⚡ 快速加载**: 纯静态设计，首屏 < 2s
- **📊 分类导航**: 8 大分类，锚点跳转，数量统计
- **🔄 数据外置**: JSON 文件管理，修改即生效
- **💰 广告支持**: 集成 Google AdSense，审核占位
- **♿ 无障碍**: 支持键盘导航，WCAG AA 标准

## 📁 项目结构

```
AbeiTools.com/
├── index.html              # 主页面
├── demo-data.json          # 本地演示数据（file:// 协议使用）
├── data/
│   └── links.json         # 线上真实数据（http:// 协议使用）
├── 404.html               # 404 错误页面
└── README.md              # 项目文档
```

## 🛠️ 部署配置

### 1. Cloudflare Pages 部署

1. 将代码推送到 GitHub 仓库
2. 在 [Cloudflare Pages](https://pages.cloudflare.com/) 创建新项目
3. 连接你的 GitHub 仓库
4. 配置构建设置：
   - **Framework preset**: `None`
   - **Build command**: 留空
   - **Build output directory**: `/`
5. 绑定自定义域名（可选）

### 2. Google AdSense 配置

1. 申请 [Google AdSense](https://www.google.com/adsense/) 账户
2. 获取你的发布商 ID（格式：`ca-pub-xxxxxxxxxxxxxxxx`）
3. 替换 `index.html` 中的 `ca-pub-XXXXXXXXXXXXXXXX` 为你的实际 ID
4. 配置广告单元并更新 `data-ad-slot` 值

## 📝 使用说明

### 前台使用

- **访问网站**: 直接打开主页即可使用，无需注册
- **搜索工具**: 使用顶部搜索框实时搜索工具
- **切换语言**: 点击右上角 "EN/中文" 按钮，自动记忆偏好
- **分类浏览**: 点击左侧分类导航快速跳转到对应分区
- **工具访问**: 点击工具卡片在新标签页打开

### 数据管理

**更新工具数据只需修改 `data/links.json` 文件：**

1. **编辑文件**: 直接在 GitHub 仓库中编辑 `data/links.json`
2. **提交更改**: 提交到 main 分支
3. **自动部署**: Cloudflare Pages 自动重新部署（1-2 分钟）
4. **查看效果**: 刷新网站即可看到更新

### 数据格式

工具数据存储在 `data/links.json` 文件中，格式如下：

```json
{
  "links": [
    {
      "id": "unique-id",
      "url": "https://example.com",
      "category": "llm",
      "name": {
        "zh": "中文名称",
        "en": "English Name"
      },
      "desc": {
        "zh": "中文描述（≤30字）",
        "en": "English description (≤80 chars)"
      },
      "tags": {
        "zh": ["标签1", "标签2"],
        "en": ["tag1", "tag2"]
      },
      "sponsor": false
    }
  ]
}
```

### 支持的分类

- `llm`: AI 大模型
- `image`: AI 图像
- `video`: AI 视频  
- `audio`: AI 音频
- `search`: AI 搜索
- `code`: AI 编程
- `office`: AI 办公
- `other`: 其他

## 🔧 开发说明

### 本地开发

**方式一：HTTP 服务器（推荐）**
1. 克隆仓库到本地
2. 在项目根目录运行：`python -m http.server 8080`
3. 访问 `http://localhost:8080` 查看效果
4. 此方式会加载真实数据 `data/links.json`

**方式二：直接打开文件**
1. 直接双击 `index.html` 文件
2. 浏览器会以 `file://` 协议打开
3. 此方式会自动加载演示数据 `demo-data.json`，避免 CORS 问题

### 数据更新流程

1. **通过 CMS**: 访问 `/admin/` → 登录 → 编辑数据 → 发布
2. **手动编辑**: 直接修改 `data/links.json` 文件并提交到 GitHub

### 验收标准

部署完成后，请验证以下功能：

- ✅ 主页正常显示，左栏分类数量与锚点跳转正确
- ✅ 中英文切换功能正常，全站文案即时切换并记忆偏好
- ✅ 搜索功能按当前语言实时过滤工具
- ✅ 修改 `data/links.json` 后提交，刷新页面即可看到新数据
- ✅ AdSense 验证脚本在 `<head>` 中，广告位正常显示或显示占位
- ✅ 页面首屏加载 < 2s，移动端显示正常
- ✅ 所有工具链接为 `target="_blank" rel="noopener nofollow"`
- ✅ `<html lang>` 和页面标题/描述随语言变化

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**AbeiTools** - 让 AI 工具触手可及 ✨