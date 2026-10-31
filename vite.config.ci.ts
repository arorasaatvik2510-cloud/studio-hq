import { fileURLToPath, URL } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import baseConfig from './vite.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    resolve: {
      alias: [
        {
          find: /^@appdeploy\/client$/,
          replacement: fileURLToPath(new URL('./ci/sdk-shims/client.ts', import.meta.url)),
        },
      ],
    },
    server: { host: '127.0.0.1' },
    preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  }),
);
