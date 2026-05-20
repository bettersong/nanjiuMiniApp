export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/mine/index',
    'pages/sign/index',
    'pages/generateImg/index',
    // 'pages/aiChat/index',
    'pages/tools/index',
    'pages/tools/timestamp/index',
    'pages/tools/json/index',
    'pages/tools/base64/index',
    'pages/tools/color/index',
    'pages/tools/regex/index',
    'pages/tools/css/index',
    'pages/tools/markdown/index',
    'pages/tools/qrcode/index',
    'pages/tools/urlencode/index',
    'pages/tools/age/index',
    'pages/tools/bmi/index',
    'pages/fun/index',
    'pages/fun/typing/index',
    'pages/fun/flexbox/index',
    'pages/fun/game2048/index',
    'pages/fun/mbti/index',
    'pages/fun/wheel/index',
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
