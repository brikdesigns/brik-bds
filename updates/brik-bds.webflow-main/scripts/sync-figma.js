require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_KEYS = process.env.FIGMA_FILE_KEYS.split(',');

const figmaAPI = axios.create({
  baseURL: 'https://api.figma.com/v1',
  headers: {
    'X-Figma-Token': FIGMA_ACCESS_TOKEN,
  },
});

const outputDir = path.join(__dirname, '../design-tokens');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function processValue(value, resolvedType) {
  if (resolvedType === 'COLOR' && value) {
    const { r, g, b, a } = value;
    const toHex = (c) => `0${Math.round(c * 255).toString(16)}`.slice(-2);
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return a === 1 ? hex : `rgba(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}, ${a.toFixed(2)})`;
  }
  if (resolvedType === 'FLOAT' && value) {
    return `${value}px`;
  }
  return value;
}

async function getFigmaVariables(fileKey) {
  try {
    const { data } = await figmaAPI.get(`/files/${fileKey}/variables/local`);
    if (!data.meta) {
      console.log(`No variables found for file ${fileKey}`);
      return {};
    }

    const { variables, variableCollections } = data.meta;
    const structuredTokens = {};

    for (const varId in variables) {
      const variable = variables[varId];
      const collection = variableCollections[variable.variableCollectionId];
      const modeNames = {};
      collection.modes.forEach(mode => {
        modeNames[mode.modeId] = mode.name;
      });

      const path = variable.name.split('/');
      let current = structuredTokens;
      path.forEach((key, index) => {
        if (index === path.length - 1) {
          current[key] = {
            values: {},
          };
          for (const modeId in variable.valuesByMode) {
            const modeName = modeNames[modeId];
            const rawValue = variable.valuesByMode[modeId];
            current[key].values[modeName] = processValue(rawValue, variable.resolvedType);
          }
        } else {
          current[key] = current[key] || {};
          current = current[key];
        }
      });
    }

    return structuredTokens;
  } catch (error) {
    console.error(`Error fetching variables from Figma file ${fileKey}:`, error.message);
    if (error.response) {
      console.error('Figma API Response:', error.response.status, error.response.data);
    }
    return {};
  }
}

async function syncAllFigmaVariables() {
  console.log('🔄 Syncing Figma variables...');
  let allTokens = {};
  const metadata = {
    files: [],
    syncedAt: new Date().toISOString(),
  };

  for (const fileKey of FIGMA_FILE_KEYS) {
    console.log(`📁 Processing Figma file: ${fileKey}`);
    const fileData = await figmaAPI.get(`/files/${fileKey}`).then(res => res.data);
    const fileName = fileData.name;
    const tokens = await getFigmaVariables(fileKey);

    // Deep merge tokens
    const merge = (target, source) => {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !source[key].values) {
          target[key] = target[key] || {};
          merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };

    merge(allTokens, tokens);
    metadata.files.push({ name: fileName, key: fileKey });
    console.log(`✅ Successfully processed: ${fileName}`);
  }

  fs.writeFileSync(path.join(outputDir, 'tokens.json'), JSON.stringify(allTokens, null, 2));
  fs.writeFileSync(path.join(outputDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

  console.log('\n✅ Figma variables synced successfully!');
  console.log(`📁 Processed ${FIGMA_FILE_KEYS.length} files`);
}

syncAllFigmaVariables(); 