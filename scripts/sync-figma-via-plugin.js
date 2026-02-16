#!/usr/bin/env node
/**
 * Figma Variables Sync via figma-talk MCP (Plugin API)
 *
 * WHY THIS EXISTS:
 * - Figma Variables REST API requires Enterprise plan
 * - Plugin API (via figma-talk) works on ANY plan
 * - This script uses figma-talk MCP to read Variables
 *
 * PREREQUISITES:
 * 1. figma-talk WebSocket server running (mcp-start-figma-server.sh)
 * 2. Figma Desktop open with target file
 * 3. "Claude Talk to Figma" plugin connected
 * 4. Channel ID from plugin
 *
 * USAGE:
 *   node scripts/sync-figma-via-plugin.js <channel-id>
 *
 * See: /FIGMA-ACCESS-ARCHITECTURE.md for full workflow
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const FIGMA_FILE_KEYS = process.env.FIGMA_FILE_KEYS?.split(',') || [];
const outputDir = path.join(__dirname, '../design-tokens');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Channel ID from command line
const channelId = process.argv[2];
if (!channelId) {
  console.error('❌ ERROR: Channel ID required');
  console.error('');
  console.error('USAGE:');
  console.error('  node scripts/sync-figma-via-plugin.js <channel-id>');
  console.error('');
  console.error('SETUP:');
  console.error('  1. Start figma-talk server: mcp-start-figma-server.sh');
  console.error('  2. Open Figma Desktop → target file');
  console.error('  3. Run plugin: Cmd+/ → "Claude Talk to Figma" → "Connect"');
  console.error('  4. Copy channel ID from plugin');
  console.error('  5. Run this script with the channel ID');
  process.exit(1);
}

/**
 * Call figma-talk MCP tool via Claude Code CLI
 * (This is a placeholder — actual implementation would use MCP client library)
 */
async function callFigmaTool(tool, params) {
  // TODO: Implement actual MCP client call
  // For now, this would need to be called from within a Claude Code session
  // where figma-talk MCP is available

  throw new Error('This script requires refactoring to use MCP client library directly');
}

/**
 * Process Variables from Figma file
 */
async function getVariablesFromFile(fileKey) {
  console.log(`📁 Processing Figma file: ${fileKey}`);

  try {
    // Join channel first
    await callFigmaTool('mcp__figma-talk__join_channel', { channel_id: channelId });

    // Get variable definitions
    const result = await callFigmaTool('mcp__figma-talk__get_variable_defs', {});

    // Parse and structure tokens
    const structuredTokens = {};

    // TODO: Transform Figma Variables API format to our tokens.json structure
    // This depends on the exact format returned by get_variable_defs

    return structuredTokens;
  } catch (error) {
    console.error(`Error fetching variables from ${fileKey}:`, error.message);
    return {};
  }
}

/**
 * Main sync function
 */
async function syncVariables() {
  console.log('🔄 Syncing Figma variables via Plugin API...');
  console.log(`📡 Channel ID: ${channelId}\n`);

  let allTokens = {};
  const metadata = {
    files: [],
    syncedAt: new Date().toISOString(),
    method: 'figma-talk-plugin-api',
  };

  for (const fileKey of FIGMA_FILE_KEYS) {
    const tokens = await getVariablesFromFile(fileKey);

    // Deep merge
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
    metadata.files.push({ key: fileKey });
    console.log(`✅ Successfully processed: ${fileKey}`);
  }

  // Validate
  const tokenCount = Object.keys(allTokens).length;
  if (tokenCount === 0) {
    console.error('\n❌ SYNC FAILED: No tokens were fetched.');
    console.error('   Check that figma-talk server is running and plugin is connected.');
    process.exit(1);
  }

  // Write output
  fs.writeFileSync(path.join(outputDir, 'tokens.json'), JSON.stringify(allTokens, null, 2));
  fs.writeFileSync(path.join(outputDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

  console.log('\n✅ Variables synced successfully!');
  console.log(`📁 Processed ${FIGMA_FILE_KEYS.length} files (${tokenCount} top-level token groups)`);
  console.log('\nNext steps:');
  console.log('  npm run transform-tokens    # Generate CSS from tokens');
  console.log('  git add design-tokens/      # Stage changes');
  console.log('  git commit -m "..."         # Commit');
}

// Run
syncVariables().catch((err) => {
  console.error('❌ Sync failed:', err.message);
  console.error('\nThis script requires the MCP client library to call figma-talk tools.');
  console.error('Currently it must be run from within a Claude Code session.');
  console.error('\nAlternative: Use Claude Code directly with these steps:');
  console.error('  1. Start figma-talk server');
  console.error('  2. Tell Claude: "Join figma-talk channel <id> and export Variables to design-tokens/tokens.json"');
  process.exit(1);
});
