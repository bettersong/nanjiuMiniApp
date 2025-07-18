import Taro from '@tarojs/taro';

export const throttle = (cb, delay = 300) => {
  //距离上一次的执行时间
  let lastTime = 0;
  return function () {
    // console.log("---enter to work---");
    var _this = this;
    var _arguments = arguments;
    var now = new Date().getTime();
    //如果距离上一次执行超过了delay才能再次执行
    // console.log("---wait work---");
    if (now - lastTime > delay) {
      // console.log("---work---");
      cb.apply(_this, _arguments);
      lastTime = now;
    }
  };
};


// 获取状态栏高度
export const getTitleBarHeight = () => {
  const { statusBarHeight = 0 } = Taro.getSystemInfoSync();
  const { top, height, bottom } = Taro.getMenuButtonBoundingClientRect();
  return {
    statusBarHeight,
    titleBarHeight: height,
    titleTop: top,
    titleBottom: bottom
  }
}
