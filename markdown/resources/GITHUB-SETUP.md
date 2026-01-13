# GitHub Backup Setup Guide

## Quick Setup

1. **Create GitHub Repository** (if not already done):
   - Go to [GitHub.com](https://github.com) and create a new repository
   - Name it something like `brik-designs-website`
   - Don't initialize with README (since we already have files)

2. **Connect Local Repository to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

3. **Use the Sync Script** (automated workflow):
   ```bash
   # Simple sync
   ./github-sync.sh
   
   # With custom commit message
   ./github-sync.sh "Update theme switcher functionality"
   ```

## What the Sync Script Does

- ✅ Automatically updates from the latest Webflow export in the `updates/` folder
- ✅ Copies updated CSS, images, and JavaScript files
- ✅ Stages and commits all changes
- ✅ Pushes to GitHub for backup
- ✅ Provides clear status messages throughout the process

## Manual GitHub Commands (if needed)

```bash
# Check status
git status

# Add and commit manually
git add .
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

## Development Workflow

1. **Export from Webflow** → Place files in `updates/brikdesigns.webflow/`
2. **Test locally** → Make changes to `header.css` and `footer.js`
3. **Run sync script** → `./github-sync.sh "Description of changes"`
4. **Copy to Webflow** → Transfer `header.css` and `footer.js` content back to Webflow

This ensures your GitHub backup is always current with your development progress.

