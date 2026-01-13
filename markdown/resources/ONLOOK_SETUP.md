# Onlook Integration Setup

## Overview
Onlook is "The Cursor for Designers" - an open-source visual vibecoding editor that allows you to visually build, style, and edit your React app with AI.

## Key Features
- 🎨 Visual code editor with AI assistance
- 🔄 Real-time preview and editing
- 🧠 AI-powered code generation and refinement
- 📱 Responsive design tools
- 🎯 Component-based development
- 🔗 Figma integration capabilities

## Installation Options

### Option 1: Use Onlook Online (Recommended)
1. Visit [onlook.com](https://onlook.com)
2. Create an account or sign in
3. Start a new project or import existing code
4. Connect your GitHub repository

### Option 2: Self-Host Onlook
```bash
# Clone the repository
git clone https://github.com/onlook-dev/onlook.git
cd onlook

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Integration with Your Project

### 1. Connect Your Repository
1. In Onlook, click "Connect a repo"
2. Select your `brik-bds` repository
3. Onlook will analyze your project structure

### 2. Import Your Design Tokens
Onlook can work with your existing design tokens:
- **CSS Variables**: Your `css/design-tokens.css` file
- **Figma Integration**: Direct connection to your Figma files
- **Design System**: Leverage your existing token structure

### 3. Visual Development Workflow
1. **Create Components**: Use Onlook's visual editor to create React components
2. **Style with AI**: Use AI to generate styles based on your design tokens
3. **Preview Real-time**: See changes instantly in the preview pane
4. **Export to Webflow**: Generate HTML/CSS compatible with Webflow

## Benefits for Your Project
- **Visual Development**: See your code changes in real-time
- **AI-Powered Styling**: Generate styles using your design tokens
- **Component Library**: Build reusable components visually
- **Design System Integration**: Maintain consistency with your Figma designs
- **Webflow Compatibility**: Generate code that works with Webflow

## Workflow Integration
```
Figma → Onlook (Visual Development) → React Components → Webflow
   ↓              ↓                        ↓              ↓
Design Tokens → AI Styling → Code Generation → Live Site
```

## Next Steps
1. Visit [onlook.com](https://onlook.com) to get started
2. Connect your GitHub repository
3. Import your design tokens
4. Start building components visually
5. Export code for Webflow integration 