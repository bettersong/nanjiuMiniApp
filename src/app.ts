import { createApp } from 'vue'
import { setGlobalDataPlugin } from '@tarojs/taro'
import EventBus from './utils/eventBus'
import './app.scss'

const App = createApp({
  onShow (options) {},
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})

// 注册全局事件总线
App.config.globalProperties.$bus = EventBus.getInstance()

// 注册全局数据
App.use(setGlobalDataPlugin, {
  isLogin: false, // 是否登录
})

export default App
