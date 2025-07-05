import { createRouter, createWebHistory } from 'vue-router';
import PanelView from '../views/PanelView.vue';

const routes = [
  { path: '/panel', component: PanelView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});
export default router;
