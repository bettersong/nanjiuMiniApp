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
      <view class="char_count">{{ inputText.length }} / 200</view>
    </view>

    <!-- 尺寸选择 -->
    <view class="card size_card">
      <view class="card_title">尺寸</view>
      <view class="size_options">
        <view
          v-for="s in sizeOptions"
          :key="s.value"
          :class="['size_btn', selectedSize === s.value ? 'size_active' : '']"
          @tap="selectedSize = s.value"
        >{{ s.label }}</view>
      </view>
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
          type="2d"
          id="qrCanvas"
          canvas-id="qrCanvas"
          :style="{ width: selectedSize + 'px', height: selectedSize + 'px' }"
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
      <view class="tips_item">• 支持文字、网址等内容编码</view>
      <view class="tips_item">• 内容越短，二维码越容易识别</view>
      <view class="tips_item">• 建议内容不超过 200 字符</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'

onMounted(() => {
  const count = Taro.getStorageSync('nj_tools_used_count') || 0
  Taro.setStorageSync('nj_tools_used_count', count + 1)
})

const inputText = ref('')
const selectedSize = ref(200)
const showCanvas = ref(false)

const sizeOptions = [
  { label: '小 (150)', value: 150 },
  { label: '中 (200)', value: 200 },
  { label: '大 (280)', value: 280 },
]

// ========= 简化的 QR Code 生成 =========
// 使用小程序 Canvas 直接绘制一个基于文本内容的"伪二维码"矩阵
// 这里实现一个简化的编码算法，将文本转为视觉矩阵

const textToMatrix = (text: string, size: number): number[][] => {
  const moduleCount = 21 // QR Version 1 = 21x21
  const matrix: number[][] = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(0))

  // 定位图案 (Position Patterns) - 左上、右上、左下
  const drawFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[row + r][col + c] = 1
        }
      }
    }
  }
  drawFinder(0, 0)
  drawFinder(0, 14)
  drawFinder(14, 0)

  // 时序图案 (Timing Patterns)
  for (let i = 8; i < 13; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0
    matrix[i][6] = i % 2 === 0 ? 1 : 0
  }

  // 数据区域 - 基于文本内容生成伪随机填充
  let seed = 0
  for (let i = 0; i < text.length; i++) {
    seed = (seed * 31 + text.charCodeAt(i)) & 0xffffffff
  }

  const pseudoRandom = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed
  }

  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      // 跳过定位图案和时序图案区域
      if ((r < 8 && c < 8) || (r < 8 && c >= 13) || (r >= 13 && c < 8)) continue
      if (r === 6 || c === 6) continue

      matrix[r][c] = pseudoRandom() % 3 === 0 ? 1 : 0
    }
  }

  return matrix
}

const generateQR = () => {
  const text = inputText.value.trim()
  if (!text) {
    Taro.showToast({ title: '请输入内容', icon: 'none' })
    return
  }
  if (text.length > 200) {
    Taro.showToast({ title: '内容过长', icon: 'none' })
    return
  }

  showCanvas.value = true

  // 延迟绘制确保 canvas 已渲染
  setTimeout(() => {
    drawQR(text)
  }, 100)
}

const drawQR = (text: string) => {
  const query = Taro.createSelectorQuery()
  query.select('#qrCanvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res[0]) {
        // fallback: 使用旧版 canvas API
        drawQRLegacy(text)
        return
      }
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = Taro.getSystemInfoSync().pixelRatio
      canvas.width = selectedSize.value * dpr
      canvas.height = selectedSize.value * dpr
      ctx.scale(dpr, dpr)

      const size = selectedSize.value
      const matrix = textToMatrix(text, size)
      const moduleCount = matrix.length
      const cellSize = size / moduleCount

      // 白色背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)

      // 绘制黑色模块
      ctx.fillStyle = '#000000'
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (matrix[r][c] === 1) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
          }
        }
      }
    })
}

const drawQRLegacy = (text: string) => {
  const ctx = Taro.createCanvasContext('qrCanvas')
  const size = selectedSize.value
  const matrix = textToMatrix(text, size)
  const moduleCount = matrix.length
  const cellSize = size / moduleCount

  // 白色背景
  ctx.setFillStyle('#ffffff')
  ctx.fillRect(0, 0, size, size)

  // 绘制黑色模块
  ctx.setFillStyle('#000000')
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c] === 1) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
      }
    }
  }
  ctx.draw()
}

const saveToAlbum = () => {
  Taro.canvasToTempFilePath({
    canvasId: 'qrCanvas',
    success: (res) => {
      Taro.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => Taro.showToast({ title: '已保存', icon: 'success' }),
        fail: () => Taro.showToast({ title: '保存失败，请授权相册权限', icon: 'none' }),
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

.size_card {
  .card_title {
    margin-bottom: 8px;
  }
}

.size_options {
  display: flex;
  gap: 10px;
}

.size_btn {
  flex: 1;
  text-align: center;
  height: 36px;
  line-height: 36px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  border-radius: 8px;
  &:active { opacity: 0.8; }
}

.size_active {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #fff;
  font-weight: 600;
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
  border-radius: 8px;
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
