import { createRouter, createWebHistory } from 'vue-router'

import WordSearchView from "@/views/WordSearchView.vue";

const routes = [
  {
    path: "/",
    name: "WordSearch",
    component: WordSearchView
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
