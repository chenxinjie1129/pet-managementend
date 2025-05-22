import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import store from './store'
import axios from 'axios'

// 配置axios默认URL
axios.defaults.baseURL = 'http://localhost:8080/api'

const app = createApp(App)

// 全局挂载axios
app.config.globalProperties.$axios = axios

app.use(ElementPlus)
   .use(router)
   .use(store)
   .mount('#app')
