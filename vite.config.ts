import { defineConfig, loadEnv } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import vueDevTools from 'vite-plugin-vue-devtools';

const __dirname = dirname(fileURLToPath(import.meta.url));
function path(dir: string) {
  return resolve(__dirname, dir);
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: env.VITE_BASE_PATH,
    resolve: {
      alias: {
        /** @ 符号指向 src 目录 */
        '@': resolve(__dirname, './src')
      }
    },

    plugins: [
      vueDevTools(),
      vue(),
      vueJsx(),
      UnoCSS(),
      AutoImport({
        resolvers: [
          // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
          ElementPlusResolver(),
          // 自动导入图标组件
          IconsResolver({
            prefix: 'icon'
          })
        ],
        imports: ['vue', 'vue-router', '@vueuse/core'],
        dts: true
      }),
      Components({
        resolvers: [
          // 自动导入 Element Plus 组件
          ElementPlusResolver(),
          // 自动注册图标组件
          IconsResolver({
            enabledCollections: ['ep']
          })
        ]
      }),
      Icons({
        autoInstall: true
        // 自定义图标集
        // customCollections: {
        //   home: FileSystemIconLoader('src/assets/svg/home', svg => svg.replace(/^<svg /, '<svg fill="currentColor" ')),
        // }
      }),
      createSvgIconsPlugin({
        iconDirs: [path('src/assets/svg')],
        symbolId: 'icon-[dir]-[name]',
        svgoOptions: true
      })
    ],

    server: {
      port: 8444,
      host: true,
      open: true,
      cors: true,
      strictPort: false,
      hmr: true,
      proxy: {
        '/api/v1': {
          target: 'http://localhost:8888/', // 本地调试
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true,
          rewrite: p => p.replace(/^\/api\/v1/, '')
        }
      }
    },

    build: {
      minify: 'terser',
      outDir: 'dist',
      emptyOutDir: true,
      target: 'es2016',
      sourcemap: process.env.VITE_APP_FLAG === 'dev',
      terserOptions: {
        compress: {
          drop_debugger: true,
          drop_console: process.env.VITE_APP_FLAG === 'dev'
        }
      }
    }
  };
});
