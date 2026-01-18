#!/usr/bin/env node
/**
 * Populate Notion Design Tokens Database
 *
 * This script syncs tokens from the Figma variables export to Notion.
 *
 * Usage:
 *   1. Copy .env.example to .env and add your Notion token
 *   2. Run: npm run populate-notion
 *
 * Get your token from: https://www.notion.so/profile/integrations
 */

require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

// Database IDs
const MODES_DATABASE_ID = '2e697d34-ed28-810a-a4c2-df1e8508dba8';
const DESIGN_TOKENS_DATABASE_ID = '1c197d34-ed28-80bc-9e56-fc49b13d8688';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// ============================================================================
// MODES DATA
// ============================================================================
const modesToAdd = [
  // Border Radius Modes
  { name: 'sharp', type: 'Border Radius', description: 'Minimal rounding. Maps to border-radius.sharp in Figma. Values: none=0, sm=2, md=4, lg=8' },
  { name: 'soft', type: 'Border Radius', description: 'Moderate rounding. Maps to border-radius.soft in Figma. Values: none=0, sm=8, md=12, lg=16' },
  { name: 'softest', type: 'Border Radius', description: 'Maximum rounding. Maps to border-radius.softest in Figma. Values: none=0, sm=24, md=40, lg=pill' },
];

// ============================================================================
// PRIMITIVE TOKENS DATA
// ============================================================================
const primitiveTokens = [
  // -------------------------------------------------------------------------
  // COLOR PRIMITIVES - Grayscale
  // -------------------------------------------------------------------------
  { name: 'color-grayscale-white', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/grayscale/white', value: '#ffffff' },
  { name: 'color-grayscale-lightest', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/grayscale/lightest', value: '#f2f2f2' },
  { name: 'color-grayscale-lighter', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/grayscale/lighter', value: '#e0e0e0' },
  { name: 'color-grayscale-light', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/grayscale/light', value: '#bdbdbd' },
  { name: 'color-grayscale-dark', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/grayscale/dark', value: '#828282' },
  { name: 'color-grayscale-darker', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/grayscale/darker', value: '#4f4f4f' },
  { name: 'color-grayscale-darkest', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/grayscale/darkest', value: '#333333' },
  { name: 'color-grayscale-black', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/grayscale/black', value: '#000000' },

  // -------------------------------------------------------------------------
  // COLOR PRIMITIVES - System
  // -------------------------------------------------------------------------
  { name: 'color-system-blue', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/system/blue', value: '#2f80ed' },
  { name: 'color-system-neutral', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/system/neutral', value: '#d4d4d4' },
  { name: 'color-system-green', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/system/green', value: '#27ae60' },
  { name: 'color-system-red', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/system/red', value: '#eb5757' },
  { name: 'color-system-yellow', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/system/yellow', value: '#f2c94c' },
  { name: 'color-system-orange', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/system/orange', value: '#f2994a' },
  { name: 'color-system-purple', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'color/system/purple', value: '#9b51e0' },

  // -------------------------------------------------------------------------
  // COLOR PRIMITIVES - Brik Theme
  // -------------------------------------------------------------------------
  { name: 'theme-brik-poppy-red', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'theme/brik/poppy-red', value: '#e35335' },
  { name: 'theme-brik-black', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'theme/brik/black', value: '#000000' },
  { name: 'theme-brik-tan', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'theme/brik/tan', value: '#f1f0ec' },
  { name: 'theme-brik-yellow', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'theme/brik/yellow', value: '#f4d364' },
  { name: 'theme-brik-orange', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'theme/brik/orange', value: '#e76134' },
  { name: 'theme-brik-green', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'theme/brik/green', value: '#bcff8c' },
  { name: 'theme-brik-blue', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'theme/brik/blue', value: '#8ebbcc' },
  { name: 'theme-brik-purple', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'theme/brik/purple', value: '#9e8bc2' },

  // -------------------------------------------------------------------------
  // COLOR PRIMITIVES - Blue Theme
  // -------------------------------------------------------------------------
  { name: 'theme-blue-dark', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'theme/blue/blue-dark', value: '#0e212a' },
  { name: 'theme-blue-light', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'theme/blue/blue-light', value: '#4665f5' },
  { name: 'theme-blue-lighter', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'theme/blue/blue-lighter', value: '#79b0d9' },
  { name: 'theme-blue-lightest', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'theme/blue/blue-lightest', value: '#edf2f6' },
  { name: 'theme-blue-green', type: 'primitive', foundation: 'color', collection: 'primitive', figmaVar: 'theme/blue/green', value: '#79d799' },

  // -------------------------------------------------------------------------
  // FONT SIZE PRIMITIVES
  // -------------------------------------------------------------------------
  { name: 'font-size-5', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/5', value: '5.69' },
  { name: 'font-size-10', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/10', value: '6.41' },
  { name: 'font-size-15', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/15', value: '8.11' },
  { name: 'font-size-20', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/20', value: '9.12' },
  { name: 'font-size-25', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/25', value: '10.26' },
  { name: 'font-size-50', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/50', value: '11.54' },
  { name: 'font-size-75', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/75', value: '14' },
  { name: 'font-size-100', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/100', value: '16' },
  { name: 'font-size-200', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/200', value: '18' },
  { name: 'font-size-300', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/300', value: '20' },
  { name: 'font-size-400', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/400', value: '22.5' },
  { name: 'font-size-500', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/500', value: '25.3' },
  { name: 'font-size-600', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/600', value: '28.5' },
  { name: 'font-size-700', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/700', value: '32' },
  { name: 'font-size-800', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/800', value: '36' },
  { name: 'font-size-900', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/900', value: '40.5' },
  { name: 'font-size-1000', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/1000', value: '45.5' },
  { name: 'font-size-1100', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/1100', value: '51' },
  { name: 'font-size-1200', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/1200', value: '57.5' },
  { name: 'font-size-1300', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/1300', value: '64.7' },
  { name: 'font-size-1400', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/1400', value: '72.8' },
  { name: 'font-size-1500', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/1500', value: '81.9' },
  { name: 'font-size-1600', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/1600', value: '92.2' },
  { name: 'font-size-1700', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/1700', value: '103.9' },
  { name: 'font-size-1800', type: 'primitive', foundation: 'font-size', collection: 'primitive', figmaVar: 'font-size/1800', value: '116.9' },

  // -------------------------------------------------------------------------
  // LINE HEIGHT PRIMITIVES
  // -------------------------------------------------------------------------
  { name: 'line-height-none', type: 'primitive', foundation: 'font-line-height', collection: 'primitive', figmaVar: 'font-line-height/none', value: '0' },
  { name: 'line-height-tight', type: 'primitive', foundation: 'font-line-height', collection: 'primitive', figmaVar: 'font-line-height/tight', value: '1.1' },
  { name: 'line-height-snug', type: 'primitive', foundation: 'font-line-height', collection: 'primitive', figmaVar: 'font-line-height/snug', value: '1.25' },
  { name: 'line-height-normal', type: 'primitive', foundation: 'font-line-height', collection: 'primitive', figmaVar: 'font-line-height/normal', value: '1.5' },
  { name: 'line-height-relaxed', type: 'primitive', foundation: 'font-line-height', collection: 'primitive', figmaVar: 'font-line-height/relaxed', value: '1.75' },
  { name: 'line-height-loose', type: 'primitive', foundation: 'font-line-height', collection: 'primitive', figmaVar: 'font-line-height/loose', value: '2' },

  // -------------------------------------------------------------------------
  // SPACE PRIMITIVES
  // -------------------------------------------------------------------------
  { name: 'space-0', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/0', value: '0' },
  { name: 'space-25', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/25', value: '1' },
  { name: 'space-50', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/50', value: '2' },
  { name: 'space-100', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/100', value: '4' },
  { name: 'space-150', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/150', value: '6' },
  { name: 'space-200', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/200', value: '8' },
  { name: 'space-250', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/250', value: '10' },
  { name: 'space-300', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/300', value: '12' },
  { name: 'space-350', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/350', value: '14' },
  { name: 'space-400', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/400', value: '16' },
  { name: 'space-450', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/450', value: '18' },
  { name: 'space-500', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/500', value: '20' },
  { name: 'space-600', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/600', value: '24' },
  { name: 'space-700', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/700', value: '28' },
  { name: 'space-800', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/800', value: '32' },
  { name: 'space-900', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/900', value: '36' },
  { name: 'space-1000', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/1000', value: '40' },
  { name: 'space-1100', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/1100', value: '44' },
  { name: 'space-1200', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/1200', value: '48' },
  { name: 'space-1400', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/1400', value: '56' },
  { name: 'space-1600', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/1600', value: '64' },
  { name: 'space-1800', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/1800', value: '80' },
  { name: 'space-2000', type: 'primitive', foundation: 'space', collection: 'primitive', figmaVar: 'space/2000', value: '88' },

  // -------------------------------------------------------------------------
  // SIZE PRIMITIVES
  // -------------------------------------------------------------------------
  { name: 'size-0', type: 'primitive', foundation: 'size', collection: 'primitive', figmaVar: 'size/0', value: '0' },
  { name: 'size-100', type: 'primitive', foundation: 'size', collection: 'primitive', figmaVar: 'size/100', value: '4' },
  { name: 'size-200', type: 'primitive', foundation: 'size', collection: 'primitive', figmaVar: 'size/200', value: '8' },
  { name: 'size-300', type: 'primitive', foundation: 'size', collection: 'primitive', figmaVar: 'size/300', value: '12' },
  { name: 'size-400', type: 'primitive', foundation: 'size', collection: 'primitive', figmaVar: 'size/400', value: '16' },
  { name: 'size-500', type: 'primitive', foundation: 'size', collection: 'primitive', figmaVar: 'size/500', value: '20' },
  { name: 'size-600', type: 'primitive', foundation: 'size', collection: 'primitive', figmaVar: 'size/600', value: '24' },
  { name: 'size-700', type: 'primitive', foundation: 'size', collection: 'primitive', figmaVar: 'size/700', value: '28' },
  { name: 'size-800', type: 'primitive', foundation: 'size', collection: 'primitive', figmaVar: 'size/800', value: '32' },
  { name: 'size-900', type: 'primitive', foundation: 'size', collection: 'primitive', figmaVar: 'size/900', value: '36' },
  { name: 'size-1000', type: 'primitive', foundation: 'size', collection: 'primitive', figmaVar: 'size/1000', value: '40' },
  { name: 'size-1200', type: 'primitive', foundation: 'size', collection: 'primitive', figmaVar: 'size/1200', value: '48' },
  { name: 'size-pill', type: 'primitive', foundation: 'size', collection: 'primitive', figmaVar: 'size/pill', value: '9999' },
  { name: 'size-circle', type: 'primitive', foundation: 'size', collection: 'primitive', figmaVar: 'size/circle', value: '99999' },

  // -------------------------------------------------------------------------
  // BORDER RADIUS PRIMITIVES
  // -------------------------------------------------------------------------
  { name: 'border-radius-0', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/0', value: '0' },
  { name: 'border-radius-50', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/50', value: '2' },
  { name: 'border-radius-100', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/100', value: '4' },
  { name: 'border-radius-200', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/200', value: '8' },
  { name: 'border-radius-300', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/300', value: '10' },
  { name: 'border-radius-400', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/400', value: '12' },
  { name: 'border-radius-500', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/500', value: '14' },
  { name: 'border-radius-600', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/600', value: '16' },
  { name: 'border-radius-700', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/700', value: '20' },
  { name: 'border-radius-800', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/800', value: '24' },
  { name: 'border-radius-900', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/900', value: '28' },
  { name: 'border-radius-1000', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/1000', value: '32' },
  { name: 'border-radius-1100', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/1100', value: '36' },
  { name: 'border-radius-1200', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/1200', value: '40' },
  { name: 'border-radius-1300', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/1300', value: '44' },
  { name: 'border-radius-1400', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/1400', value: '48' },
  { name: 'border-radius-pill', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/pill', value: '999' },
  { name: 'border-radius-circle', type: 'primitive', foundation: 'border-radius', collection: 'primitive', figmaVar: 'border-radius/radius-circle', value: '9999' },

  // -------------------------------------------------------------------------
  // BORDER WIDTH PRIMITIVES
  // -------------------------------------------------------------------------
  { name: 'border-width-0', type: 'primitive', foundation: 'border-width', collection: 'primitive', figmaVar: 'border-width/0', value: '0' },
  { name: 'border-width-50', type: 'primitive', foundation: 'border-width', collection: 'primitive', figmaVar: 'border-width/50', value: '1' },
  { name: 'border-width-100', type: 'primitive', foundation: 'border-width', collection: 'primitive', figmaVar: 'border-width/100', value: '2' },
  { name: 'border-width-200', type: 'primitive', foundation: 'border-width', collection: 'primitive', figmaVar: 'border-width/200', value: '3' },
  { name: 'border-width-300', type: 'primitive', foundation: 'border-width', collection: 'primitive', figmaVar: 'border-width/300', value: '4' },
  { name: 'border-width-400', type: 'primitive', foundation: 'border-width', collection: 'primitive', figmaVar: 'border-width/400', value: '5' },
  { name: 'border-width-500', type: 'primitive', foundation: 'border-width', collection: 'primitive', figmaVar: 'border-width/500', value: '6' },

  // -------------------------------------------------------------------------
  // SHADOW PRIMITIVES
  // -------------------------------------------------------------------------
  { name: 'shadow-blur-0', type: 'primitive', foundation: 'shadow-blur', collection: 'primitive', figmaVar: 'shadow-blur/0', value: '0' },
  { name: 'shadow-blur-100', type: 'primitive', foundation: 'shadow-blur', collection: 'primitive', figmaVar: 'shadow-blur/100', value: '2' },
  { name: 'shadow-blur-200', type: 'primitive', foundation: 'shadow-blur', collection: 'primitive', figmaVar: 'shadow-blur/200', value: '4' },
  { name: 'shadow-blur-300', type: 'primitive', foundation: 'shadow-blur', collection: 'primitive', figmaVar: 'shadow-blur/300', value: '6' },
  { name: 'shadow-blur-400', type: 'primitive', foundation: 'shadow-blur', collection: 'primitive', figmaVar: 'shadow-blur/400', value: '8' },
  { name: 'shadow-blur-500', type: 'primitive', foundation: 'shadow-blur', collection: 'primitive', figmaVar: 'shadow-blur/500', value: '10' },
  { name: 'shadow-blur-600', type: 'primitive', foundation: 'shadow-blur', collection: 'primitive', figmaVar: 'shadow-blur/600', value: '12' },
  { name: 'shadow-blur-700', type: 'primitive', foundation: 'shadow-blur', collection: 'primitive', figmaVar: 'shadow-blur/700', value: '14' },
  { name: 'shadow-blur-800', type: 'primitive', foundation: 'shadow-blur', collection: 'primitive', figmaVar: 'shadow-blur/800', value: '16' },
  { name: 'shadow-offset-0', type: 'primitive', foundation: 'shadow-offset', collection: 'primitive', figmaVar: 'shadow-offset/0', value: '0' },
  { name: 'shadow-offset-100', type: 'primitive', foundation: 'shadow-offset', collection: 'primitive', figmaVar: 'shadow-offset/100', value: '2' },
  { name: 'shadow-offset-200', type: 'primitive', foundation: 'shadow-offset', collection: 'primitive', figmaVar: 'shadow-offset/200', value: '4' },
  { name: 'shadow-offset-300', type: 'primitive', foundation: 'shadow-offset', collection: 'primitive', figmaVar: 'shadow-offset/300', value: '8' },
  { name: 'shadow-offset-400', type: 'primitive', foundation: 'shadow-offset', collection: 'primitive', figmaVar: 'shadow-offset/400', value: '10' },
  { name: 'shadow-spread-0', type: 'primitive', foundation: 'shadow-spread', collection: 'primitive', figmaVar: 'shadow-spread/0', value: '0' },
  { name: 'shadow-spread-100', type: 'primitive', foundation: 'shadow-spread', collection: 'primitive', figmaVar: 'shadow-spread/100', value: '2' },
  { name: 'shadow-spread-200', type: 'primitive', foundation: 'shadow-spread', collection: 'primitive', figmaVar: 'shadow-spread/200', value: '4' },

  // -------------------------------------------------------------------------
  // BREAKPOINT TOKENS
  // -------------------------------------------------------------------------
  { name: 'breakpoint-web', type: 'primitive', foundation: 'size', collection: 'breakpoint', figmaVar: 'breakpoint/web', value: '1200' },
  { name: 'breakpoint-tablet', type: 'primitive', foundation: 'size', collection: 'breakpoint', figmaVar: 'breakpoint/tablet', value: '768' },
  { name: 'breakpoint-mobile', type: 'primitive', foundation: 'size', collection: 'breakpoint', figmaVar: 'breakpoint/mobile', value: '320' },
];

// ============================================================================
// SEMANTIC TOKENS DATA
// ============================================================================
const semanticTokens = [
  // -------------------------------------------------------------------------
  // TYPOGRAPHY SEMANTIC - with size property
  // -------------------------------------------------------------------------
  { name: 'typography-huge', type: 'alias', foundation: 'font-size', collection: 'typography', figmaVar: 'typography/huge', value: '{font-size.500}', size: 'huge' },
  { name: 'typography-xl', type: 'alias', foundation: 'font-size', collection: 'typography', figmaVar: 'typography/xl', value: '{font-size.400}', size: 'xl' },
  { name: 'typography-lg', type: 'alias', foundation: 'font-size', collection: 'typography', figmaVar: 'typography/lg', value: '{font-size.300}', size: 'lg' },
  { name: 'typography-md', type: 'alias', foundation: 'font-size', collection: 'typography', figmaVar: 'typography/md', value: '{font-size.200}', size: 'md' },
  { name: 'typography-sm', type: 'alias', foundation: 'font-size', collection: 'typography', figmaVar: 'typography/sm', value: '{font-size.100}', size: 'sm' },
  { name: 'typography-xs', type: 'alias', foundation: 'font-size', collection: 'typography', figmaVar: 'typography/xs', value: '{font-size.75}', size: 'xs' },
  { name: 'typography-tiny', type: 'alias', foundation: 'font-size', collection: 'typography', figmaVar: 'typography/tiny', value: '{font-size.50}', size: 'tiny' },

  // -------------------------------------------------------------------------
  // GAP SEMANTIC - with element and size
  // -------------------------------------------------------------------------
  { name: 'gap-none', type: 'alias', foundation: 'space', collection: 'spacing', figmaVar: 'gap/none', value: '{space.0}', element: 'gap', size: 'none' },
  { name: 'gap-tiny', type: 'alias', foundation: 'space', collection: 'spacing', figmaVar: 'gap/tiny', value: '{space.100}', element: 'gap', size: 'tiny' },
  { name: 'gap-sm', type: 'alias', foundation: 'space', collection: 'spacing', figmaVar: 'gap/sm', value: '{space.200}', element: 'gap', size: 'sm' },
  { name: 'gap-md', type: 'alias', foundation: 'space', collection: 'spacing', figmaVar: 'gap/md', value: '{space.400}', element: 'gap', size: 'md' },
  { name: 'gap-lg', type: 'alias', foundation: 'space', collection: 'spacing', figmaVar: 'gap/lg', value: '{space.600}', element: 'gap', size: 'lg' },

  // -------------------------------------------------------------------------
  // PADDING SEMANTIC - with element and size
  // -------------------------------------------------------------------------
  { name: 'padding-none', type: 'alias', foundation: 'space', collection: 'spacing', figmaVar: 'padding/none', value: '{space.0}', element: 'padding', size: 'none' },
  { name: 'padding-tiny', type: 'alias', foundation: 'space', collection: 'spacing', figmaVar: 'padding/tiny', value: '{space.200}', element: 'padding', size: 'tiny' },
  { name: 'padding-sm', type: 'alias', foundation: 'space', collection: 'spacing', figmaVar: 'padding/sm', value: '{space.400}', element: 'padding', size: 'sm' },
  { name: 'padding-md', type: 'alias', foundation: 'space', collection: 'spacing', figmaVar: 'padding/md', value: '{space.600}', element: 'padding', size: 'md' },
  { name: 'padding-lg', type: 'alias', foundation: 'space', collection: 'spacing', figmaVar: 'padding/lg', value: '{space.800}', element: 'padding', size: 'lg' },
  { name: 'padding-huge', type: 'alias', foundation: 'space', collection: 'spacing', figmaVar: 'padding/huge', value: '{space.1200}', element: 'padding', size: 'huge' },

  // -------------------------------------------------------------------------
  // BORDER RADIUS SEMANTIC - with size property (mode-aware)
  // -------------------------------------------------------------------------
  { name: 'radius-none', type: 'alias', foundation: 'border-radius', collection: 'border-radius', figmaVar: 'border-radius/none', value: '{border-radius.0}', size: 'none' },
  { name: 'radius-sm', type: 'alias', foundation: 'border-radius', collection: 'border-radius', figmaVar: 'border-radius/sm', size: 'sm' },
  { name: 'radius-md', type: 'alias', foundation: 'border-radius', collection: 'border-radius', figmaVar: 'border-radius/md', size: 'md' },
  { name: 'radius-lg', type: 'alias', foundation: 'border-radius', collection: 'border-radius', figmaVar: 'border-radius/lg', size: 'lg' },

  // -------------------------------------------------------------------------
  // BORDER WIDTH SEMANTIC - with size property
  // -------------------------------------------------------------------------
  { name: 'stroke-none', type: 'alias', foundation: 'border-width', collection: 'border-width', figmaVar: 'border-width/none', value: '0', size: 'none' },
  { name: 'stroke-thin', type: 'alias', foundation: 'border-width', collection: 'border-width', figmaVar: 'border-width/thin', value: '0.5', size: 'thin' },
  { name: 'stroke-normal', type: 'alias', foundation: 'border-width', collection: 'border-width', figmaVar: 'border-width/normal', value: '1', size: 'normal' },
  { name: 'stroke-thick', type: 'alias', foundation: 'border-width', collection: 'border-width', figmaVar: 'border-width/thick', value: '2', size: 'thick' },
  { name: 'stroke-thicker', type: 'alias', foundation: 'border-width', collection: 'border-width', figmaVar: 'border-width/thicker', value: '3', size: 'thicker' },
  { name: 'stroke-thickest', type: 'alias', foundation: 'border-width', collection: 'border-width', figmaVar: 'border-width/thickest', value: '4', size: 'thickest' },

  // -------------------------------------------------------------------------
  // ELEVATION SEMANTIC - with element and size
  // -------------------------------------------------------------------------
  { name: 'elevation-01', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'elevation-01', element: 'elevation', size: '01' },
  { name: 'elevation-02', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'elevation-02', element: 'elevation', size: '02' },
  { name: 'elevation-03', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'elevation-03', element: 'elevation', size: '03' },
  { name: 'elevation-04', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'elevation-04', element: 'elevation', size: '04' },
  { name: 'elevation-05', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'elevation-05', element: 'elevation', size: '05' },
  { name: 'elevation-06', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'elevation-06', element: 'elevation', size: '06' },
  { name: 'elevation-07', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'elevation-07', element: 'elevation', size: '07' },
  { name: 'elevation-08', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'elevation-08', element: 'elevation', size: '08' },
  { name: 'box-shadow-sm', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'box-shadow/sm', element: 'elevation', size: 'sm' },
  { name: 'box-shadow-md', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'box-shadow/md', element: 'elevation', size: 'md' },
  { name: 'box-shadow-lg', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'box-shadow/lg', element: 'elevation', size: 'lg' },
  { name: 'box-shadow-xl', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'box-shadow/xl', element: 'elevation', size: 'xl' },
  { name: 'box-shadow-popover', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'box-shadow/popover', element: 'elevation', role: 'popover' },
  { name: 'box-shadow-sticky', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'box-shadow/sticky', element: 'elevation', role: 'sticky' },
  { name: 'box-shadow-toast', type: 'alias', foundation: 'elevation', collection: 'elevation', figmaVar: 'box-shadow/toast', element: 'elevation', role: 'toast' },
  { name: 'blur-radius-sm', type: 'alias', foundation: 'shadow-blur', collection: 'elevation', figmaVar: 'blur-radius/sm', element: 'elevation', size: 'sm' },
  { name: 'blur-radius-md', type: 'alias', foundation: 'shadow-blur', collection: 'elevation', figmaVar: 'blur-radius/md', element: 'elevation', size: 'md' },
  { name: 'blur-radius-lg', type: 'alias', foundation: 'shadow-blur', collection: 'elevation', figmaVar: 'blur-radius/lg', element: 'elevation', size: 'lg' },
  { name: 'blur-radius-xl', type: 'alias', foundation: 'shadow-blur', collection: 'elevation', figmaVar: 'blur-radius/xl', element: 'elevation', size: 'xl' },

  // -------------------------------------------------------------------------
  // TEXT COLOR SEMANTIC - complete set
  // -------------------------------------------------------------------------
  { name: 'text-primary', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'text/primary', element: 'text', role: 'primary', value: '{color.grayscale.darkest}' },
  { name: 'text-secondary', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'text/secondary', element: 'text', role: 'secondary', value: '{color.grayscale.dark}' },
  { name: 'text-muted', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'text/muted', element: 'text', role: 'muted', value: '{color.grayscale.light}' },
  { name: 'text-brand', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'text/brand', element: 'text', role: 'brand', value: '{theme.blue.blue-light}' },
  { name: 'text-inverse', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'text/inverse', element: 'text', role: 'inverse', value: '{color.grayscale.white}' },
  { name: 'text-on-color', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'text/on-color', element: 'text', role: 'on-color', value: '{color.grayscale.white}' },
  { name: 'text-accent-yellow', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'text/accent-yellow', element: 'text', role: 'accent', value: '{color.system.yellow}' },
  { name: 'text-accent-blue', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'text/accent-blue', element: 'text', role: 'accent', value: '{color.system.blue}' },
  { name: 'text-accent-green', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'text/accent-green', element: 'text', role: 'accent', value: '{color.system.green}' },
  { name: 'text-accent-purple', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'text/accent-purple', element: 'text', role: 'accent', value: '{color.system.purple}' },
  { name: 'text-accent-red', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'text/accent-red', element: 'text', role: 'accent', value: '{color.system.red}' },

  // -------------------------------------------------------------------------
  // BORDER COLOR SEMANTIC - complete set
  // -------------------------------------------------------------------------
  { name: 'border-primary', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'border/primary', element: 'border', role: 'primary', value: '{color.grayscale.lighter}' },
  { name: 'border-secondary', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'border/secondary', element: 'border', role: 'secondary', value: '{color.grayscale.dark}' },
  { name: 'border-muted', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'border/muted', element: 'border', role: 'muted', value: '{color.grayscale.light}' },
  { name: 'border-brand', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'border/brand', element: 'border', role: 'brand', value: '{theme.blue.blue-light}' },
  { name: 'border-on-color', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'border/on-color', element: 'border', role: 'on-color', value: '{color.grayscale.white}' },
  { name: 'border-inverse', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'border/inverse', element: 'border', role: 'inverse', value: '{color.grayscale.white}' },

  // -------------------------------------------------------------------------
  // BACKGROUND COLOR SEMANTIC - complete set
  // -------------------------------------------------------------------------
  { name: 'background-primary', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'background/primary', element: 'background', role: 'primary', value: '{color.grayscale.white}' },
  { name: 'background-secondary', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'background/secondary', element: 'background', role: 'secondary', value: '{color.grayscale.dark}' },
  { name: 'background-muted', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'background/muted', element: 'background', role: 'muted', value: '{color.grayscale.light}' },
  { name: 'background-brand', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'background/brand', element: 'background', role: 'brand', value: '{theme.blue.blue-light}' },
  { name: 'background-inverse', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'background/inverse', element: 'background', role: 'inverse', value: '{color.grayscale.white}' },
  { name: 'background-on-color', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'background/on-color', element: 'background', role: 'on-color', value: '{color.grayscale.white}' },
  { name: 'background-input', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'background/input', element: 'background', role: 'input', value: '{color.grayscale.white}' },
  { name: 'background-accent-yellow', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'background/accent-yellow', element: 'background', role: 'accent', value: '{color.system.yellow}' },
  { name: 'background-accent-blue', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'background/accent-blue', element: 'background', role: 'accent', value: '{color.system.blue}' },
  { name: 'background-accent-green', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'background/accent-green', element: 'background', role: 'accent', value: '{color.system.green}' },
  { name: 'background-accent-purple', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'background/accent-purple', element: 'background', role: 'accent', value: '{color.system.purple}' },
  { name: 'background-accent-red', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'background/accent-red', element: 'background', role: 'accent', value: '{color.system.red}' },

  // -------------------------------------------------------------------------
  // SURFACE COLOR SEMANTIC - complete set
  // -------------------------------------------------------------------------
  { name: 'surface-primary', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'surface/primary', element: 'surface', role: 'primary', value: '{color.grayscale.white}' },
  { name: 'surface-secondary', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'surface/secondary', element: 'surface', role: 'secondary', value: '{color.grayscale.lighter}' },
  { name: 'surface-brand', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'surface/brand', element: 'surface', role: 'brand', value: '{theme.blue.blue-light}' },
  { name: 'surface-inverse', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'surface/inverse', element: 'surface', role: 'inverse', value: '{color.grayscale.black}' },

  // -------------------------------------------------------------------------
  // PAGE COLOR SEMANTIC - complete set
  // -------------------------------------------------------------------------
  { name: 'page-primary', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'page/primary', element: 'page', role: 'primary', value: '{color.grayscale.white}' },
  { name: 'page-secondary', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'page/secondary', element: 'page', role: 'secondary', value: '{color.grayscale.lighter}' },
  { name: 'page-brand', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'page/brand', element: 'page', role: 'brand', value: '{theme.blue.blue-light}' },
  { name: 'page-inverse', type: 'alias', foundation: 'color', collection: 'color', figmaVar: 'page/inverse', element: 'page', role: 'inverse', value: '{color.grayscale.black}' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Rate limiting - Notion API allows 3 requests/second
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function createMode(mode) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: MODES_DATABASE_ID },
      properties: {
        Name: { title: [{ text: { content: mode.name } }] },
        Type: { select: { name: mode.type } },
        Description: { rich_text: [{ text: { content: mode.description || '' } }] },
      },
    });
    console.log(`  \x1b[32m+\x1b[0m Created mode: ${mode.name}`);
    await delay(350); // Rate limit
    return response;
  } catch (error) {
    if (error.code === 'conflict_error') {
      console.log(`  \x1b[33m-\x1b[0m Skipped (exists): ${mode.name}`);
    } else {
      console.error(`  \x1b[31mx\x1b[0m Error creating mode ${mode.name}:`, error.message);
    }
  }
}

async function createToken(token) {
  try {
    const properties = {
      Name: { title: [{ text: { content: token.name } }] },
      Type: { select: { name: token.type } },
      '{foundation}': { select: { name: token.foundation } },
      Collection: { select: { name: token.collection } },
      'Figma Variable': { rich_text: [{ text: { content: token.figmaVar || '' } }] },
      'Figma Value': { rich_text: [{ text: { content: token.value || '' } }] },
    };

    if (token.element) {
      properties['{element}'] = { select: { name: token.element } };
    }
    if (token.role) {
      properties['{role}'] = { select: { name: token.role } };
    }
    if (token.size) {
      properties['{size}'] = { select: { name: token.size } };
    }

    const response = await notion.pages.create({
      parent: { database_id: DESIGN_TOKENS_DATABASE_ID },
      properties,
    });
    console.log(`  \x1b[32m+\x1b[0m Created token: ${token.name}`);
    await delay(350); // Rate limit
    return response;
  } catch (error) {
    if (error.code === 'conflict_error') {
      console.log(`  \x1b[33m-\x1b[0m Skipped (exists): ${token.name}`);
    } else {
      console.error(`  \x1b[31mx\x1b[0m Error creating token ${token.name}:`, error.message);
    }
  }
}

async function checkExistingTokens() {
  const response = await notion.databases.query({
    database_id: DESIGN_TOKENS_DATABASE_ID,
    page_size: 100,
  });
  return new Set(
    response.results
      .map(page => page.properties.Name?.title?.[0]?.plain_text)
      .filter(Boolean)
  );
}

async function checkExistingModes() {
  const response = await notion.databases.query({
    database_id: MODES_DATABASE_ID,
    page_size: 100,
  });
  return new Set(
    response.results
      .map(page => page.properties.Name?.title?.[0]?.plain_text)
      .filter(Boolean)
  );
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  if (!process.env.NOTION_TOKEN) {
    console.error('\x1b[31mError: NOTION_TOKEN environment variable is required\x1b[0m');
    console.log('\n\x1b[36mTo set up:\x1b[0m');
    console.log('1. Go to https://www.notion.so/profile/integrations');
    console.log('2. Create a new internal integration');
    console.log('3. Copy .env.example to .env and add your token');
    console.log('4. Share your Design Tokens and Modes databases with the integration');
    console.log('5. Run: npm run populate-notion');
    process.exit(1);
  }

  console.log('\x1b[36mSyncing Figma tokens to Notion...\x1b[0m\n');
  let created = { modes: 0, primitives: 0, semantic: 0 };
  let skipped = { modes: 0, primitives: 0, semantic: 0 };

  // Check existing entries
  console.log('Checking existing entries...');
  const existingTokens = await checkExistingTokens();
  let existingModes = new Set();
  try {
    existingModes = await checkExistingModes();
    console.log(`Found ${existingModes.size} existing modes`);
  } catch (e) {
    console.log('\x1b[33mModes database not accessible - skipping modes\x1b[0m');
  }
  console.log(`Found ${existingTokens.size} existing tokens\n`);

  // Add Modes (if accessible)
  if (existingModes.size > 0 || modesToAdd.length > 0) {
    console.log('\x1b[1mAdding Modes...\x1b[0m');
    for (const mode of modesToAdd) {
      if (!existingModes.has(mode.name)) {
        const result = await createMode(mode);
        if (result) created.modes++;
      } else {
        console.log(`  \x1b[33m-\x1b[0m Skipped (exists): ${mode.name}`);
        skipped.modes++;
      }
    }
  }

  // Add Primitive Tokens
  console.log('\n\x1b[1mAdding Primitive Tokens...\x1b[0m');
  for (const token of primitiveTokens) {
    if (!existingTokens.has(token.name)) {
      const result = await createToken(token);
      if (result) created.primitives++;
    } else {
      console.log(`  \x1b[33m-\x1b[0m Skipped (exists): ${token.name}`);
      skipped.primitives++;
    }
  }

  // Add Semantic Tokens
  console.log('\n\x1b[1mAdding Semantic Tokens...\x1b[0m');
  for (const token of semanticTokens) {
    if (!existingTokens.has(token.name)) {
      const result = await createToken(token);
      if (result) created.semantic++;
    } else {
      console.log(`  \x1b[33m-\x1b[0m Skipped (exists): ${token.name}`);
      skipped.semantic++;
    }
  }

  // Summary
  console.log('\n\x1b[36m=== Summary ===\x1b[0m');
  console.log(`Modes:      \x1b[32m${created.modes} created\x1b[0m, \x1b[33m${skipped.modes} skipped\x1b[0m`);
  console.log(`Primitives: \x1b[32m${created.primitives} created\x1b[0m, \x1b[33m${skipped.primitives} skipped\x1b[0m`);
  console.log(`Semantic:   \x1b[32m${created.semantic} created\x1b[0m, \x1b[33m${skipped.semantic} skipped\x1b[0m`);
  console.log(`\n\x1b[32mDone!\x1b[0m`);
}

main().catch(console.error);
