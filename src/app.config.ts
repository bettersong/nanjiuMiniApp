export default defineAppConfig({
  pages: [
    'pages/index/index',
    // 'pages/login/index',
    // 'pages/mine/index',
  ],
  // tabBar:{
  //   color: '#2c2c2c',
  //   selectedColor: '#d81e06',
  //   list: [
  //     {
  //       pagePath: 'pages/index/index',
  //       text: '首页',
  //       iconPath: 'assets/icons/index.png',
  //       selectedIconPath: 'assets/icons/index_act.png'
  //     },
  //     {
  //       pagePath: 'pages/mine/index',
  //       text: '我的',
  //       iconPath: 'assets/icons/mine.png',
  //       selectedIconPath: 'assets/icons/mine_act.png'
  //     }
  //   ]
  // },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '前端南玖',
    navigationBarTextStyle: 'black'
  }
})
