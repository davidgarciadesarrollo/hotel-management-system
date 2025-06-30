require('./bootstrap');


import { createApp } from 'vue';
import App from './components/App.vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/app.css';

const app = createApp(App);
app.mount('#app');