import '@testing-library/jest-dom/vitest';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';

// Vitest 4 + @storybook/addon-vitest no longer auto-applies the project-
// level preview (decorators, theme wrappers, default render). Without this
// call, stories without an explicit `render` fail with NoRenderFunctionError.
// Ref: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([projectAnnotations]);
