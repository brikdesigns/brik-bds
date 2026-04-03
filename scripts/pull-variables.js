#!/usr/bin/env bun
/**
 * Pull all Figma variables via the WebSocket relay + plugin.
 *
 * Usage:
 *   bun scripts/pull-variables.js <channel-id> [--collection=Name] [--type=COLOR|FLOAT|STRING|BOOLEAN]
 *
 * Examples:
 *   bun scripts/pull-variables.js v9td7k9v
 *   bun scripts/pull-variables.js v9td7k9v --collection=Primitives --type=COLOR
 *   bun scripts/pull-variables.js v9td7k9v > renew-variables.json
 */

const args = process.argv.slice(2);
const channel = args.find(a => !a.startsWith('--'));
const collectionFlag = args.find(a => a.startsWith('--collection='));
const typeFlag = args.find(a => a.startsWith('--type='));

if (!channel) {
  console.error('Usage: bun scripts/pull-variables.js <channel-id> [--collection=Name] [--type=COLOR|FLOAT|STRING|BOOLEAN]');
  process.exit(1);
}

const PORT = process.env.FIGMA_RELAY_PORT || 3055;
const params = {};
if (collectionFlag) params.collectionName = collectionFlag.split('=')[1];
if (typeFlag) params.resolvedType = typeFlag.split('=')[1];

const commandId = crypto.randomUUID();

const ws = new WebSocket(`ws://localhost:${PORT}`);

ws.addEventListener('open', () => {
  // Join channel
  ws.send(JSON.stringify({ type: 'join', channel }));

  // Send get_variables command after brief delay for join to propagate
  setTimeout(() => {
    ws.send(JSON.stringify({
      id: commandId,
      type: 'message',
      channel,
      message: {
        id: commandId,
        command: 'get_variables',
        params: { ...params, commandId },
      },
    }));
  }, 500);
});

ws.addEventListener('message', (event) => {
  try {
    const msg = JSON.parse(event.data);

    // Look for our command result
    if (msg.message && msg.message.id === commandId && msg.message.result !== undefined) {
      console.log(JSON.stringify(msg.message.result, null, 2));
      ws.close();
      process.exit(0);
    }

    // Error response
    if (msg.message && msg.message.id === commandId && msg.message.error) {
      console.error('Plugin error:', msg.message.error);
      ws.close();
      process.exit(1);
    }
  } catch (e) {
    // Ignore non-JSON messages
  }
});

ws.addEventListener('error', (err) => {
  console.error('WebSocket error:', err.message);
  process.exit(1);
});

// Timeout after 30s
setTimeout(() => {
  console.error('Timeout: no response from Figma plugin after 30s');
  ws.close();
  process.exit(1);
}, 30000);
