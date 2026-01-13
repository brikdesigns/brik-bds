const fs = require('fs');
const path = require('path');

const tokensPath = path.join(__dirname, '../design-tokens/tokens.json');
const cssPath = path.join(__dirname, '../css/design-tokens.css');

const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

let cssString = `/* Auto-generated CSS variables from Figma design tokens */
/* Generated on: ${new Date().toISOString()} */

`;

function generateVariables(obj, prefix = '', mode) {
  let variables = '';
  for (const key in obj) {
    const newPrefix = prefix ? `${prefix}-${key}` : key;
    if (obj[key].values && obj[key].values[mode]) {
      const value = obj[key].values[mode];
      variables += `  --${newPrefix}: ${value};\n`;
    } else if (typeof obj[key] === 'object' && !obj[key].values) {
      variables += generateVariables(obj[key], newPrefix, mode);
    }
  }
  return variables;
}

// Extract all modes from the tokens
const modes = new Set();
function findModes(obj) {
  for (const key in obj) {
    if (obj[key].values) {
      Object.keys(obj[key].values).forEach(mode => modes.add(mode));
    } else if (typeof obj[key] === 'object') {
      findModes(obj[key]);
    }
  }
}
findModes(tokens);

// Generate CSS for each mode
modes.forEach(mode => {
  const modeSelector = mode.toLowerCase().replace(/[\s_]+/g, '-');
  if (mode === 'Light' || mode === 'Default') { // Assuming 'Light' or 'Default' is the default theme
    cssString += `:root {\n`;
  } else {
    cssString += `body.theme-${modeSelector} {\n`;
  }
  cssString += generateVariables(tokens, '', mode);
  cssString += `}\n\n`;
});


fs.writeFileSync(cssPath, cssString);

console.log('✅ CSS variables generated successfully!');
console.log(`🎨 Processed ${modes.size} themes/modes.`);
console.log(`📝 Output written to ${cssPath}`); 