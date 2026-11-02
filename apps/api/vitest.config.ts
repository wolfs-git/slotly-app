import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // esbuild/oxc не генерирует emitDecoratorMetadata, без которого не работает DI в Nest
  plugins: [
    swc.vite({
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { decoratorMetadata: true, legacyDecorator: true },
        target: 'es2023',
      },
    }),
  ],
  test: {
    include: ['test/**/*.spec.ts'],
  },
});
