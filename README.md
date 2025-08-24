# AbeiTools - AI Tools Directory

> Discover quality AI tools to boost your efficiency and creativity

## 🚀 Features

- **🌐 Multi-language Support**: 5 languages (EN, 中文, ES, AR, RU) with preference memory
- **🔍 Smart Search**: Real-time local search by name, description, and tags
- **📱 Responsive Design**: Perfect for both desktop and mobile devices
- **⚡ Fast Loading**: Pure static design, first screen loads < 2s
- **📊 Category Navigation**: 9 major categories with anchor jumping and count statistics
- **🔄 External Data**: JSON file management, changes take effect immediately
- **💰 Ad Support**: Integrated Google AdSense with approval placeholders
- **♿ Accessibility**: Keyboard navigation support, WCAG AA compliant
- **🛠️ Admin Panel**: Built-in content management system

## 🌍 Supported Languages

- **English (EN)** - Default language
- **中文 (ZH)** - Chinese Simplified
- **Español (ES)** - Spanish
- **العربية (AR)** - Arabic with RTL support
- **Русский (RU)** - Russian

## 📁 Project Structure

```
AbeiTools/
├── index.html              # Main homepage
├── admin.html              # Admin management panel
├── 404.html                # 404 error page
├── demo-data.json          # Demo data (for file:// protocol)
├── data/
│   └── links.json         # Production data (for http:// protocol)
├── start_server.py         # Local development server
└── README.md              # Project documentation
```

## 🛠️ Deployment

### 1. Cloudflare Pages Deployment (Recommended)

1. Push code to your GitHub repository
2. Create a new project on [Cloudflare Pages](https://pages.cloudflare.com/)
3. Connect your GitHub repository
4. Configure build settings:
   - **Framework preset**: `None`
   - **Build command**: Leave empty
   - **Build output directory**: `/`
5. Bind custom domain (optional)

### 2. Other Static Hosting Services

This project works with any static hosting service:
- **Netlify**: Just connect your GitHub repo
- **Vercel**: Zero-config deployment
- **GitHub Pages**: Enable in repository settings
- **Firebase Hosting**: Use `firebase deploy`

### 3. Google AdSense Configuration

1. Apply for [Google AdSense](https://www.google.com/adsense/) account
2. Get your Publisher ID (format: `ca-pub-xxxxxxxxxxxxxxxx`)
3. Replace `ca-pub-XXXXXXXXXXXXXXXX` in `index.html` with your actual ID
4. Configure ad units and update `data-ad-slot` values

## 📝 Usage Guide

### Frontend Usage

- **Access Website**: Open homepage directly, no registration required
- **Search Tools**: Use the top search box for real-time tool search
- **Switch Language**: Click "EN/中文/ES/عر/RU" button in top-right corner
- **Browse Categories**: Click left sidebar categories for quick navigation
- **Access Tools**: Click tool cards to open in new tab

### Data Management

#### Method 1: Admin Panel (Recommended)
1. Visit `/admin.html` in your browser
2. Add, edit, or delete tools using the visual interface
3. Export updated `links.json` file
4. Upload to your GitHub repository

#### Method 2: Direct File Editing
1. Edit `data/links.json` directly in GitHub repository
2. Commit changes to main branch
3. Cloudflare Pages auto-deploys (1-2 minutes)
4. Refresh website to see updates

### Data Format

Tool data is stored in `data/links.json`:

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
      "icon": "https://example.com/icon.png", // optional
      "sponsor": false
    }
  ]
}
```

### Supported Categories

- `llm`: AI Large Language Models
- `image`: AI Image Generation
- `video`: AI Video Creation
- `audio`: AI Audio & Speech
- `search`: AI Search Engines
- `code`: AI Coding Assistants
- `agent`: AI Agents & Automation
- `workflow`: AI Workflow Tools
- `office`: AI Office & Productivity
- `other`: Other AI Tools

## 🔧 Development

### Local Development

**Method 1: Python Server (Recommended)**
```bash
# Clone repository
git clone https://github.com/yourusername/abeitools.git
cd abeitools

# Start server (loads production data)
python start_server.py
# or
python -m http.server 8080

# Visit http://localhost:8080
```

**Method 2: Direct File Opening**
```bash
# Double-click index.html
# Browser opens with file:// protocol
# Automatically loads demo-data.json to avoid CORS issues
```

### Clear Browser Cache/Storage

If you see old language settings, clear browser storage:
```javascript
// Open browser console and run:
localStorage.clear();
location.reload();
```

### Quality Assurance Checklist

After deployment, verify these features:

- ✅ Homepage displays correctly with proper category counts
- ✅ **Default language is English** for new visitors
- ✅ Language switching works properly with preference memory
- ✅ Search function filters tools by current language
- ✅ Updating `data/links.json` reflects changes after refresh
- ✅ AdSense verification script in `<head>`, ads display properly
- ✅ Page first screen loads < 2s, mobile display works
- ✅ All tool links have `target="_blank" rel="noopener nofollow"`
- ✅ `<html lang>` and page title/description change with language
- ✅ Admin panel functions correctly for content management

## 📊 Current Statistics

- **135+ AI Tools** across 9 categories
- **5 Languages** fully supported
- **Mobile Optimized** responsive design
- **SEO Ready** with proper meta tags
- **Admin Panel** for easy content management

## 🔄 Update Instructions

### For GitHub + Cloudflare Pages Users

1. **Local Changes**: Make changes to your local files
2. **Commit & Push**: 
   ```bash
   git add .
   git commit -m "Update: [describe your changes]"
   git push origin main
   ```
3. **Auto Deploy**: Cloudflare Pages automatically deploys (1-2 minutes)
4. **Verify**: Check your live website

### Important Files to Update

Always include these files when pushing updates:
- `index.html` - Main functionality
- `data/links.json` - Tool database
- `admin.html` - Management interface (if modified)

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit Issues and Pull Requests.

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Contribution Ideas

- Add new language translations
- Improve UI/UX design
- Add new AI tool categories
- Enhance search functionality
- Optimize performance

---

**AbeiTools** - Making AI Tools Accessible ✨

🌐 **Live Demo**: [Your Website URL]
📱 **Mobile Friendly**: Works perfectly on all devices
🔧 **Easy Setup**: Deploy in under 5 minutes