<template>
  <view class="page">
    <!-- 输入区 -->
    <view class="card">
      <view class="card_title">📱 输入内容</view>
      <textarea
        class="textarea"
        v-model="inputText"
        placeholder="输入文字或网址，生成二维码..."
      />
      <view class="char_count">{{ inputText.length }} 字符</view>
    </view>

    <!-- 生成按钮 -->
    <view class="btn_row">
      <view class="btn btn_primary" @tap="generateQR">生成二维码</view>
      <view class="btn btn_ghost" @tap="clearAll">清空</view>
    </view>

    <!-- 二维码显示区 -->
    <view class="card qr_card" v-if="showCanvas">
      <view class="card_title">✅ 生成结果</view>
      <view class="qr_wrapper">
        <canvas
          canvas-id="qrCanvas"
          style="width: 200px; height: 200px;"
          class="qr_canvas"
        />
      </view>
      <view class="qr_actions">
        <view class="btn btn_primary" @tap="saveToAlbum">保存到相册</view>
      </view>
    </view>

    <!-- 说明 -->
    <view class="card tips_card">
      <view class="tips_title">📖 说明</view>
      <view class="tips_item">• 生成标准 QR Code，可被任何扫码器识别</view>
      <view class="tips_item">• 支持英文、数字、中文、网址等内容</view>
      <view class="tips_item">• 内容过长时会自动提升二维码版本</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import drawQrcode from 'weapp-qrcode'

onMounted(() => {
  const count = Taro.getStorageSync('nj_tools_used_count') || 0
  Taro.setStorageSync('nj_tools_used_count', count + 1)
})

const inputText = ref('')
const showCanvas = ref(false)
const canvasSize = 200

const generateQR = () => {
  const text = inputText.value.trim()
  if (!text) {
    Taro.showToast({ title: '请输入内容', icon: 'none' })
    return
  }

  showCanvas.value = true

  setTimeout(() => {
    const ctx = Taro.createCanvasContext('qrCanvas')
    drawQrcode({
      ctx: ctx,
      width: canvasSize,
      height: canvasSize,
      text: text,
      typeNumber: -1,
      correctLevel: 1, // L级纠错
      background: '#ffffff',
      foreground: '#000000',
      callback: () => {
        // 绘制完成
      }
    })
  }, 300)
}

const saveToAlbum = () => {
  Taro.authorize({
    scope: 'scope.writePhotosAlbum',
    success: () => doSave(),
    fail: () => {
      Taro.showModal({
        title: '需要相册权限',
        content: '请在设置中开启相册写入权限',
        confirmText: '去设置',
        success: (res) => { if (res.confirm) Taro.openSetting() }
      })
    }
  })
}

const doSave = () => {
  Taro.canvasToTempFilePath({
    x: 0,
    y: 0,
    width: canvasSize,
    height: canvasSize,
    destWidth: canvasSize * 3,
    destHeight: canvasSize * 3,
    canvasId: 'qrCanvas',
    fileType: 'png',
    success: (res) => {
      Taro.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => Taro.showToast({ title: '已保存到相册', icon: 'success' }),
        fail: () => Taro.showToast({ title: '保存失败', icon: 'none' }),
      })
    },
    fail: () => Taro.showToast({ title: '生成图片失败', icon: 'none' }),
  })
}

const clearAll = () => {
  inputText.value = ''
  showCanvas.value = false
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 16px;
  box-sizing: border-box;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card_title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.textarea {
  width: 100%;
  height: 100px;
  background: #f7f7f7;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
  line-height: 1.6;
  border: 1px solid #eee;
}

.char_count {
  font-size: 11px;
  color: #ccc;
  text-align: right;
  margin-top: 6px;
}

.btn_row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.btn {
  flex: 1;
  height: 42px;
  line-height: 42px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  &:active { opacity: 0.75; }
}

.btn_primary {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #fff;
}

.btn_ghost {
  background: #f0f0f0;
  color: #666;
}

.qr_card {
  text-align: center;
}

.qr_wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.qr_canvas {
  border: 1px solid #eee;
}

.qr_actions {
  padding-top: 12px;
  .btn {
    margin: 0 auto;
    max-width: 200px;
  }
}

.tips_card {
  .tips_title {
    font-size: 13px;
    font-weight: 600;
    color: #666;
    margin-bottom: 8px;
  }
  .tips_item {
    font-size: 12px;
    color: #aaa;
    line-height: 2;
  }
}
</style>
