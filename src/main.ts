import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import './styles/index.scss';
import router from './router';
import store from './store';
import i18n from './i18n';
import directive from './directive';

// unocss
import 'virtual:uno.css';
// vite-plugin-svg-icons
import 'virtual:svg-icons-register';

const app = createApp(App).use(store).use(router).use(ElementPlus).use(i18n);

// 挂载自定义指令
directive(app);

router.isReady().then(() => {
  app.mount('#app');
});
