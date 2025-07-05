import { createApp } from 'vue';
import App from './views/PanelView.vue';
import router from './router';
import './assets/variables.css';

createApp(App)
  .use(router)
  .mount('#app');
