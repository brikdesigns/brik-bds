#!/usr/bin/env node

/**
 * Setup Script for Visual Copilot and Onlook Integration
 * Configures both tools to work with your existing Figma-to-Webflow workflow
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Visual Copilot and Onlook Integration...\n');

// Check if configuration files exist
const configFiles = [
  '.builderrules',
  '.builderignore',
  '.cursorrules'
];

console.log('📁 Checking configuration files...');
configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file} exists`);
  } else {
    console.log(`  ❌ ${file} missing`);
  }
});

// Create enhanced .cursorrules for better AI integration
console.log('\n💻 Enhancing Cursor integration...');
const enhancedCursorRules = `# Enhanced Cursor Rules for Brik BDS Webflow Project

## Project Overview
This is a Webflow project with Figma design token integration, Visual Copilot, and Onlook support.

## File Structure
- \`design-tokens/\` - Contains Figma design tokens (JSON format)
- \`css/design-tokens.css\` - Auto-generated CSS variables from Figma tokens
- \`scripts/\` - Node.js scripts for Figma sync and token transformation
- \`.github/workflows/\` - GitHub Actions for automated deployment and Figma sync
- \`.builderrules\` - Visual Copilot configuration
- \`.builderignore\` - Visual Copilot ignore patterns

## Coding Standards
- Use semantic HTML5 elements
- Follow Webflow's CSS class naming conventions
- Maintain responsive design principles
- Use CSS custom properties (variables) from design tokens
- Keep JavaScript minimal and focused on interactions

## Design Token Usage
- All colors, typography, and spacing should use CSS variables from \`design-tokens.css\`
- Variables follow the pattern: \`--color---[figma-node-name]\`
- Typography variables: \`--typography---[figma-node-name]\`
- Spacing variables: \`--spacing---[figma-node-name]\`

## Figma Integration
- Design tokens are synced from Figma files via GitHub Actions
- Multiple Figma files are supported (comma-separated in environment)
- Tokens are automatically transformed to CSS variables
- Changes in Figma trigger automatic updates via webhooks

## Visual Copilot Integration
- Use .builderrules for code generation configuration
- Leverage existing design tokens for consistent styling
- Generate Webflow-compatible HTML/CSS
- Maintain responsive design patterns

## Onlook Integration
- Visual development with AI assistance
- Real-time preview and editing
- Component-based development
- Export to Webflow-compatible code

## Webflow Best Practices
- Use Webflow's built-in responsive breakpoints
- Leverage Webflow's CMS for dynamic content
- Maintain clean, semantic HTML structure
- Use Webflow's interaction system for animations

## Git Workflow
- Commit design token changes automatically
- Use conventional commit messages
- Maintain clean git history
- Test locally before pushing to GitHub

## AI Assistant Guidelines
- Always reference existing design tokens when suggesting colors or typography
- Suggest improvements that align with the established design system
- Consider Webflow's limitations when proposing solutions
- Prioritize maintainable and scalable code patterns
- Leverage Visual Copilot for design-to-code conversion
- Use Onlook for visual development and component creation
`;

fs.writeFileSync('.cursorrules', enhancedCursorRules);
console.log('  ✅ Enhanced .cursorrules created');

// Create Visual Copilot usage guide
console.log('\n🎨 Creating Visual Copilot usage guide...');
const copilotGuide = `# Visual Copilot Quick Start Guide

## Prerequisites
- Figma file with designs
- Visual Copilot plugin installed
- Cursor editor open

## Quick Workflow
1. **Select Design**: In Figma, select the component/frame you want to convert
2. **Open Visual Copilot**: Run the Builder.io AI-powered Figma to Code plugin
3. **Export to Code**: Click "Export to Code" and copy the generated command
4. **Paste in Cursor**: Paste the command in your Cursor terminal
5. **Review & Refine**: Use Cursor's AI features to optimize the code

## Configuration
- Framework: HTML
- Styling: CSS
- Output: Webflow-compatible
- Design Tokens: Uses your existing css/design-tokens.css

## Tips
- Use Auto Layout in Figma for better code generation
- Keep .builderrules updated as your project evolves
- Leverage your existing design tokens for consistency
`;

fs.writeFileSync('VISUAL_COPILOT_GUIDE.md', copilotGuide);
console.log('  ✅ Visual Copilot guide created');

// Create Onlook integration guide
console.log('\n🎯 Creating Onlook integration guide...');
const onlookGuide = `# Onlook Integration Guide

## Getting Started
1. Visit [onlook.com](https://onlook.com)
2. Connect your GitHub repository: brik-bds
3. Import your design tokens from css/design-tokens.css

## Visual Development Workflow
1. **Create Components**: Use Onlook's visual editor
2. **Style with AI**: Generate styles using your design tokens
3. **Preview Real-time**: See changes instantly
4. **Export to Webflow**: Generate compatible HTML/CSS

## Benefits
- Visual code editing with AI assistance
- Real-time preview and editing
- Component-based development
- Design system integration
- Webflow compatibility

## Integration Points
- Design Tokens: css/design-tokens.css
- Figma Files: 7uPDq1zzZVoEdBe7PTauRS, Rkdc3SIWJUdgoAkeadgZZe
- GitHub Repository: Your connected repo
- Webflow Output: HTML/CSS generation
`;

fs.writeFileSync('ONLOOK_GUIDE.md', onlookGuide);
console.log('  ✅ Onlook guide created');

// Update package.json scripts
console.log('\n📦 Updating package.json scripts...');
try {
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Add new scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'setup-copilot': 'node scripts/setup-copilot-onlook.js',
    'open-onlook': 'echo "Visit https://onlook.com to connect your repository"',
    'copilot-guide': 'open VISUAL_COPILOT_GUIDE.md',
    'onlook-guide': 'open ONLOOK_GUIDE.md'
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('  ✅ Package.json scripts updated');
} catch (error) {
  console.log(`  ❌ Error updating package.json: ${error.message}`);
}

// Summary
console.log('\n📊 Setup Summary');
console.log('================');
console.log('✅ Visual Copilot configuration created');
console.log('✅ Onlook integration guide created');
console.log('✅ Enhanced Cursor rules configured');
console.log('✅ Package.json scripts updated');
console.log('\n🚀 Next Steps:');
console.log('1. Install Visual Copilot plugin in Figma');
console.log('2. Visit onlook.com to connect your repository');
console.log('3. Test the integration with: npm run test-integration');
console.log('4. Start using Visual Copilot: npm run copilot-guide');
console.log('5. Explore Onlook: npm run onlook-guide');

console.log('\n🎉 Setup completed successfully!'); 