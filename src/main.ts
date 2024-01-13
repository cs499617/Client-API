import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import App from './App.vue';
import router from './router';
import store from './store';
import 'bootswatch/dist/slate/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import '@fortawesome/fontawesome-free/css/all.css';

Vue.config.productionTip = false;

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
// optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);

// make all the global-mixin methods and data available in ALL components
// Vue.mixin(GlobalMixin);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
