import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Library build. Outputs ESM + CJS + a single styles.css. Workers are bundled
// inline (`worker.format: 'es'`) so consumers don't need to host worker files.
export default defineConfig({
  plugins: [
    react(),
    dts({ rollupTypes: true, tsconfigPath: './tsconfig.build.json' })
  ],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },
  worker: {
    format: 'es'
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'UmbraWidget',
      fileName: (format) =>
        format === 'es' ? 'umbra-widget.js' : 'umbra-widget.cjs',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@solana/kit',
        '@tanstack/react-query',
        /^@umbra-privacy\/client/,
        /^@umbra-privacy\/sdk/
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@tanstack/react-query': 'ReactQuery'
        },
        assetFileNames: 'umbra-widget.[ext]'
      }
    }
  }
})
