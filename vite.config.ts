import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/auto-imports.d.ts',
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/components.d.ts',
      }),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
        symbolId: 'icon-[name]',
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData(source: string, filename: string) {
            // Don't inject into the files themselves to avoid circular imports
            if (filename.includes('styles/variables.scss') || filename.includes('styles/mixin.scss') || filename.includes('styles/index.scss') || filename.includes('styles/sidebar.scss') || filename.includes('styles/element-plus.scss') || filename.includes('styles/transition.scss')) {
              return source
            }
            return `@import "@/styles/variables.scss";\n@import "@/styles/mixin.scss";\n${source}`
          },
        },
      },
    },
    server: {
      port: 9528,
      open: true,
      proxy: {
        '/dev-api': {
          target: env.VITE_APP_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/dev-api/, ''),
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('element-plus')) return 'element-plus'
            if (id.includes('node_modules')) return 'vendor'
          },
        },
      },
    },
  }
})
