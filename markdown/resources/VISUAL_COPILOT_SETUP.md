# Visual Copilot Integration Setup

## Overview
Visual Copilot is Builder.io's AI-powered Figma-to-code toolchain that converts Figma designs into React, Vue, Svelte, Angular, HTML, etc. code in real-time.

## Installation Steps

### 1. Install Visual Copilot Plugin
1. Open your Figma file
2. Go to **Actions menu** → **Plugins & widgets**
3. Search for "Builder.io AI-powered Figma to Code"
4. Click **Install** and **Run**

### 2. Configure Project Rules

#### Create .builderrules file
```bash
touch .builderrules
```

Add the following content:
```yaml
# Visual Copilot Configuration
framework: html
styling: css
outputFormat: webflow
useExistingComponents: true
responsiveDesign: true
designTokens: true
tokenSource: "css/design-tokens.css"
```

#### Create .builderignore file
```bash
touch .builderignore
```

Add the following content:
```
# Ignore files for Visual Copilot
node_modules/
.git/
*.log
webflow.tar.gz
```

### 3. Usage Workflow

1. **Select Design in Figma**: Choose the component/frame you want to convert
2. **Export to Code**: Click "Export to Code" in the Visual Copilot plugin
3. **Copy Command**: Copy the generated command from the plugin
4. **Paste in Cursor**: Paste the command in your Cursor terminal
5. **Review & Refine**: Use Cursor's AI features to optimize the generated code

### 4. Integration with Existing Workflow

Visual Copilot works alongside your current Figma sync workflow:
- **Design Tokens**: Uses your existing `css/design-tokens.css`
- **Webflow Integration**: Generates HTML/CSS compatible with Webflow
- **Cursor Enhancement**: Leverages your `.cursorrules` for better code generation

## Features
- ✅ One-click conversion from Figma to code
- ✅ Automatic responsiveness
- ✅ Design token integration
- ✅ Custom component reuse
- ✅ Real-time code generation
- ✅ Multiple framework support

## Benefits
- **50-80% time savings** on design-to-code conversion
- **Pixel-perfect accuracy** with automatic responsiveness
- **AI-powered refinement** with Cursor integration
- **Design system consistency** using your existing tokens 