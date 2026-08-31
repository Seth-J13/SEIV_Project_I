import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";
import Utils from "./config/utils.js";

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/register",
    name: "register",
    component: Register,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: "home" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, _from, next) => {
  const user = Utils.getStore("user");
  const isAuthenticated = !!user?.token;
  const isAuthRoute = to.name === "login" || to.name === "register";

  if (isAuthRoute) {
    if (isAuthenticated) {
      return next({ name: "home" });
    }
    return next();
  }

  if (!isAuthenticated) {
    return next({ name: "login" });
  }

  return next();
});

export default router;
