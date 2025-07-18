export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/mine/index',
    'pages/sign/index',
    'pages/generateImg/index',
    'pages/aiChat/index',
  ],
  tabBar:{
    color: '#2c2c2c',
    selectedColor: '#d81e06',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '南',
        iconPath: 'assets/icons/index.png',
        selectedIconPath: 'assets/icons/index_act.png'
      },
      {
        pagePath: 'pages/mine/index',
        text: '玖',
        iconPath: 'assets/icons/mine.png',
        selectedIconPath: 'assets/icons/mine_act.png'
      }
    ]
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '前端南玖',
    navigationBarTextStyle: 'black'
  }
})
