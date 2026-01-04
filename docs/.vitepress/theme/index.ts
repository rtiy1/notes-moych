// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import './style.css'
import MyLayout from './Layout.vue'
// @ts-ignore
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export default {
  extends: DefaultTheme,
  Layout: MyLayout,
  enhanceApp({ app }: { app: any }) {
    app.use(ElementPlus)
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }
  }
}
