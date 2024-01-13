import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';


/**
 * Routers
 */
Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  // Defining a route for the login page
  {
    path: '/login',
    name: 'Login',
    meta: { requiresAuth: false },
    component: () => import('../views/LoginView.vue'),
  },
  // Defining a route for the queen page
  {
    path: '/queen',
    name: 'Queen',
    meta: { requiresAuth: true },
    component: () => import('../views/QueenView.vue'),
  },
  // Defining a route for the runway page
  {
    path: '/runway',
    name: 'Runway',
    meta: { requiresAuth: true },
    component: () => import('../views/RunwayView.vue'),
  },
  // Defining a route for the profile page
  {
    path: '/profile',
    name: 'Profile',
    meta: { requiresAuth: true },
    component: () => import('../views/ProfileView.vue'),
  },
  // Defining a route for the index page
  {
    path: '/index',
    name: 'Index',
    meta: { requiresAuth: true },
    component: () => import('../views/IndexView.vue'),
  },

];

const router = new VueRouter({
  routes,
});

// Add a global navigation guard
router.beforeEach((to, from, next) => {
  // Check if the route has meta information
  if (to.meta && to.meta.requiresAuth) {
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('token') !== null;

    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      next('/login');
    } else {
      // Prevent logged-in users from accessing the login page
      if (to.name === 'login') {
        next('/index'); // Redirect to another page
      } else {
        // Continue to the requested page if logged in and not trying to access the login page
        next();
      }
    }
  } else {
    // Continue to non-protected routes
    next();
  }
});
export default router;
