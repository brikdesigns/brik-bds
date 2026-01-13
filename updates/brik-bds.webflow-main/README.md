# Brik BDS Webflow Project

This is a Webflow project for Brik BDS with automated deployment via GitHub Actions and Figma integration.

## Features
- Automated deployment to Webflow via GitHub Actions
- Figma design token synchronization
- Theme switching functionality
- Responsive design

## Deployment
Changes pushed to the main branch will automatically deploy to the live Webflow site.

**Test Deployment:** 2024-12-19 15:30 UTC

## 🚀 Live Site

Visit the live site: [https://brik-bds.io/](https://brik-bds.io/)

## 📁 Project Structure

```
brik-bds/
├── css/                    # Stylesheets
│   ├── brik-bds.css
│   ├── normalize.css
│   └── webflow.css
├── fonts/                  # Font files
├── images/                 # Image assets
├── js/                     # JavaScript files
│   └── webflow.js
├── design-tokens/          # Figma design tokens (auto-synced)
├── scripts/                # Sync scripts
├── .github/workflows/      # GitHub Actions
├── *.html                  # HTML pages
└── README.md              # This file
```

## 🛠️ Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Webflow CLI](https://github.com/webflow/webflow-cli)
- Git
- Figma account with personal access token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/brik-bds.git
   cd brik-bds
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Webflow CLI**
   ```bash
   npm install -g @webflow/cli
   ```

4. **Login to Webflow**
   ```bash
   webflow login
   ```

## 🔄 Workflow

### Development Process

1. **Design in Figma** - Create or update designs
2. **Sync to GitHub** - Design tokens automatically sync via GitHub Actions
3. **Sync to Webflow** - Use Figma to Webflow plugin or manual sync
4. **Deploy** - Changes automatically deploy to Webflow

### Commands

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push origin main

# Manual Figma sync
npm run sync-figma

# Deploy to Webflow (after getting site ID and token)
webflow deploy --site-id YOUR_SITE_ID
```

## 🎨 Design Token Management

### Automatic Sync
- Design tokens are automatically synced from Figma to GitHub daily
- Tokens are stored in the `design-tokens/` directory
- Changes trigger automatic deployment to Webflow

### Manual Sync
```bash
# Sync Figma designs to tokens
npm run sync-figma

# View synced tokens
cat design-tokens/tokens.json
```

## 📝 Pages

- `index.html` - Home page
- `about.html` - About page
- `services.html` - Services page
- `contact.html` - Contact page
- `pricing.html` - Pricing page
- `style-guide.html` - Style guide
- `web-modules.html` - Web modules showcase

## 🔧 Configuration

### Webflow Settings

To connect this local project to your Webflow site:

1. **Get your Site ID** from Webflow Designer → Settings → General
2. **Generate API Token** from Webflow Designer → Settings → Integrations → API Access
3. **Set environment variables**:
   ```bash
   export WEBFLOW_SITE_ID="your-site-id"
   export WEBFLOW_TOKEN="your-api-token"
   ```

### Figma Integration

To set up Figma integration:

1. **Add GitHub Secrets** (Repository → Settings → Secrets and variables → Actions):
   - `FIGMA_ACCESS_TOKEN`: `figd_REajXU3piTuMf0iiVMujqwmOp93OLhCt6DXpTxmN`
   - `FIGMA_FILE_KEY`: Your Figma file key (from the URL: `https://www.figma.com/file/{file_key}/{title}`)

2. **Install Figma to Webflow Plugin**:
   - Go to [https://webflow.com/figma-to-webflow](https://webflow.com/figma-to-webflow)
   - Install the plugin in Figma
   - Authorize your Webflow account

3. **Optional: Install Tokens Studio Plugin**:
   - Install [Tokens Studio for Figma](https://www.figma.com/community/plugin/843461159747178978/Tokens-Studio-for-Figma)
   - Configure GitHub sync in the plugin settings

## 🚀 Deployment

### Manual Deployment

```bash
# Deploy to Webflow
webflow deploy --site-id YOUR_SITE_ID
```

### Automated Deployment

This repository is configured with GitHub Actions for automated deployment and Figma sync. See `.github/workflows/` for details.

## 🤝 Collaboration

### Working with AI Assistant

1. **Share changes**: Push your latest changes to GitHub
2. **Request assistance**: Ask for help with specific features or issues
3. **Review suggestions**: The AI can suggest improvements to your code
4. **Implement changes**: Apply suggested changes and test locally
5. **Deploy**: Push changes and deploy to Webflow

### Best Practices

- **Commit frequently** with descriptive messages
- **Test locally** before deploying
- **Use branches** for major features
- **Keep custom code organized** in appropriate files
- **Document changes** in commit messages
- **Sync Figma designs** regularly to maintain consistency

## 📚 Resources

- [Webflow Documentation](https://developers.webflow.com/)
- [Webflow CLI Documentation](https://github.com/webflow/webflow-cli)
- [Webflow API Reference](https://developers.webflow.com/reference)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [Figma to Webflow Plugin](https://webflow.com/figma-to-webflow)
- [Tokens Studio for Figma](https://www.figma.com/community/plugin/843461159747178978/Tokens-Studio-for-Figma)
- [Official Figma GitHub Actions Example](https://github.com/figma/variables-github-action-example)

## 📄 License

This project is proprietary to Brik Designs. All rights reserved.

---

**Last updated**: January 2025 