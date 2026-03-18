/// <reference types="@figma/plugin-typings" />

/**
 * Figma plugin main thread
 * Runs in Figma's sandbox — has access to figma.variables API.
 * Receives color data from UI, writes to Figma Variables.
 */

figma.showUI(__html__, {
  width: 440,
  height: 660,
  themeColors: true,
  title: 'Brik Color Ramp Generator',
});

type ColorStop = {
  stop: number;
  hex: string;
  rgb: { r: number; g: number; b: number };
};

type IncomingMessage =
  | { type: 'create-variables'; colorName: string; stops: ColorStop[] }
  | { type: 'close' };

figma.ui.onmessage = async (msg: IncomingMessage) => {
  if (msg.type === 'close') {
    figma.closePlugin();
    return;
  }

  if (msg.type === 'create-variables') {
    const { colorName, stops } = msg;

    try {
      // Find or create the Primitives collection
      const collections = figma.variables.getLocalVariableCollections();
      let collection = collections.find((c) => c.name === 'Primitives');

      if (!collection) {
        collection = figma.variables.createVariableCollection('Primitives');
        figma.notify('Created "Primitives" variable collection');
      }

      const modeId = collection.defaultModeId;
      const existingVars = figma.variables.getLocalVariables('COLOR');

      let created = 0;
      let updated = 0;

      for (const stop of stops) {
        const varName = `color/${colorName}/${stop.stop}`;

        let variable = existingVars.find(
          (v) => v.name === varName && v.variableCollectionId === collection!.id
        );

        if (!variable) {
          variable = figma.variables.createVariable(varName, collection.id, 'COLOR');
          created++;
        } else {
          updated++;
        }

        const { r, g, b } = stop.rgb;
        variable.setValueForMode(modeId, {
          r: r / 255,
          g: g / 255,
          b: b / 255,
        });
      }

      figma.ui.postMessage({
        type: 'success',
        created,
        updated,
        colorName,
      });
    } catch (err) {
      figma.ui.postMessage({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }
};
