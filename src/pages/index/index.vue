<template>
  <view>
    <text>{{ name }}</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import taro from '@tarojs/taro'
const name = ref('前端南玖---测试更新机制')
             console.log(name.value)

if (taro.canIUse('getUpdateManager')) {
      const updateManager = taro.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        console.log('onCheckForUpdate====', res);
        if (res.hasUpdate) {

          // 小程序已更新
          updateManager.onUpdateReady(function () {
            taro.showModal({
              title: '更新提示',
              showCancel: false,
              confirmText: '立即重启',
              content: '新版本已经上线，是否重启小程序以应用新版本？',
              success: function (res) {
                if (res.confirm) {
                  // 调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate();
                }
              }
            });
          });
          // 更新失败
          updateManager.onUpdateFailed(function () {
            taro.showModal({
              title: '更新失败',
              content: '新版本下载失败，请删除当前小程序后重新打开。',
            });
          });
        }
      });
    } else {
      // 版本过低
      taro.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
      });
    }
</script>
