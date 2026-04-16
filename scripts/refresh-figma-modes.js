#!/usr/bin/env bun
/**
 * Refresh stale variable mode names in Figma.
 *
 * When collections or modes are renamed, frames that already had the old mode
 * applied cache the stale name in the Design panel. This script sends a
 * `refresh_variable_modes` command to the Figma plugin, which re-applies
 * each explicit mode to force Figma to update the cached display.
 *
 * Usage:
 *   bun scripts/refresh-figma-modes.js <channel-id> [--all-pages] [--collection=Name]
 *
 * Examples:
 *   bun scripts/refresh-figma-modes.js j6t7k3ly
 *   bun scripts/refresh-figma-modes.js j6t7k3ly --collection=spacing
 *   bun scripts/refresh-figma-modes.js j6t7k3ly --all-pages
 */

const args = process.argv.slice(2);
const channel = args.find(a => !a.startsWith('--'));
const allPages = args.includes('--all-pages');
const collectionFlag = args.find(a => a.startsWith('--collection='));

if (!channel) {
  console.error('Usage: bun scripts/refresh-figma-modes.js <channel-id> [--all-pages] [--collection=Name]');
  process.exit(1);
}

const PORT = process.env.FIGMA_RELAY_PORT || 3055;
const commandId = crypto.randomUUID();

const params = { pageOnly: !allPages };
if (collectionFlag) params.collectionFilter = collectionFlag.split('=')[1];

const ws = new WebSocket(`ws://localhost:${PORT}`);

ws.addEventListener('open', () => {
  ws.send(JSON.stringify({ type: 'join', channel }));

  setTimeout(() => {
    console.log(`Sending refresh_variable_modes to channel ${channel}...`);
    console.log(`  pageOnly: ${params.pageOnly}, collectionFilter: ${params.collectionFilter || '(all)'}`);

    ws.send(JSON.stringify({
      id: commandId,
      type: 'message',
      channel,
      message: {
        id: commandId,
        command: 'refresh_variable_modes',
        params: { ...params, commandId },
      },
    }));
  }, 500);
});

ws.addEventListener('message', (event) => {
  try {
    const msg = JSON.parse(event.data);

    if (msg.message && msg.message.id === commandId && msg.message.result !== undefined) {
      const result = msg.message.result;
      console.log(`\nDone — visited ${result.nodesVisited} nodes, refreshed ${result.refreshed} mode assignments.\n`);

      if (result.collections && result.collections.length) {
        console.log('Collections processed:');
        for (const col of result.collections) {
          const modeNames = col.modes.map(m => m.name).join(', ');
          console.log(`  ${col.name} → [${modeNames}]`);
        }
      }

      if (result.log && result.log.length) {
        console.log('\nRefreshed nodes (first 50):');
        for (const entry of result.log) {
          console.log(`  ${entry.nodeName} — ${entry.collection}/${entry.mode}`);
        }
      }

      ws.close();
      process.exit(0);
    }

    if (msg.message && msg.message.id === commandId && msg.message.error) {
      console.error('Plugin error:', msg.message.error);
      ws.close();
      process.exit(1);
    }
  } catch (e) {
    // Ignore non-JSON
  }
});

ws.addEventListener('error', (err) => {
  console.error('WebSocket error:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.error('Timeout: no response from Figma plugin after 30s');
  ws.close();
  process.exit(1);
}, 30000);
