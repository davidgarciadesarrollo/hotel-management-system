// Punto de entrada principal del frontend Vue.
// Importa Bootstrap 5, Bootstrap Icons y monta la app.

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Bootstrap 5 CSS y JS para estilos y componentes visuales
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Bootstrap Icons para íconos en botones y tablas
import 'bootstrap-icons/font/bootstrap-icons.css';

createApp(App).use(router).mount('#app');