import { resolve } from 'path';
import { defineConfig } from 'vite';
// import nodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.js'),
      name: 'CreateCafe',
      // the proper extensions will be added
      fileName: 'create-cafe',
      formats: ['es']
    },
    rollupOptions: {
      // plugins: [nodePolyfills()],
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        'os',
        'fs',
        'path',
        'http',
        'https',
        'child_process',
        'rc',
        'chalk',
        'picocolors',
        'joi',
        'figlet',
        'extract-zip',
        '@clack/prompts',
        '@xhmikosr/decompress',
        '@xhmikosr/decompress-targz'
      ],
      output: {}
    }
  }
});
