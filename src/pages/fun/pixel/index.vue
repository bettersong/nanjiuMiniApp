<template>
  <view class="page">
    <!-- 工具栏 -->
    <view class="toolbar">
      <view class="tool_row">
        <view
          class="tool_btn"
          :class="{ active: currentTool === 'draw' }"
          @tap="currentTool = 'draw'"
        >
          ✏️
        </view>
        <view
          class="tool_btn"
          :class="{ active: currentTool === 'eraser' }"
          @tap="currentTool = 'eraser'"
        >
          🧹
        </view>
        <view
          class="tool_btn"
          :class="{ active: currentTool === 'fill' }"
          @tap="currentTool = 'fill'"
        >
          🪣
        </view>
        <view class="tool_btn" @tap="undo">↩️</view>
        <view class="tool_btn" @tap="clearCanvas">🗑️</view>
      </view>
    </view>

    <!-- 画布区域 - 使用 catchTouchMove 阻止画布滑动时页面跟着滚动 -->
    <view class="canvas_wrapper" :catchMove="true" @touchmove.stop.prevent="noop">
      <view class="canvas_grid" :style="gridStyle">
        <view
          v-for="(color, idx) in grid"
          :key="idx"
          class="pixel"
          :style="{ background: color || '#ffffff' }"
          @tap="handleTap(idx)"
          @touchstart="handleTouchStart(idx)"
          @touchmove.stop.prevent="handleTouchMove"
        />
      </view>
    </view>

    <!-- 网格大小选择 -->
    <view class="size_bar">
      <view
        class="size_btn"
        :class="{ active: gridSize === 16 }"
        @tap="changeSize(16)"
      >16×16</view>
      <view
        class="size_btn"
        :class="{ active: gridSize === 24 }"
        @tap="changeSize(24)"
      >24×24</view>
      <view
        class="size_btn"
        :class="{ active: gridSize === 32 }"
        @tap="changeSize(32)"
      >32×32</view>
    </view>

    <!-- 调色板 -->
    <view class="palette">
      <view class="palette_title">调色板</view>
      <view class="color_grid">
        <view
          v-for="(c, idx) in palette"
          :key="idx"
          class="color_swatch"
          :class="{ selected: currentColor === c }"
          :style="{ background: c }"
          @tap="currentColor = c"
        />
      </view>
    </view>

    <!-- 最近使用颜色 -->
    <view class="recent_colors" v-if="recentColors.length">
      <view class="palette_title">最近使用</view>
      <view class="color_grid">
        <view
          v-for="(c, idx) in recentColors"
          :key="idx"
          class="color_swatch small"
          :class="{ selected: currentColor === c }"
          :style="{ background: c }"
          @tap="currentColor = c"
        />
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action_bar">
      <view class="btn btn_primary" @tap="saveImage">💾 保存作品</view>
    </view>

    <!-- 预设模板 -->
    <view class="template_section">
      <view class="palette_title">快速开始（点击加载模板）</view>
      <view class="template_grid">
        <view class="template_item" @tap="loadTemplate('heart')">❤️ 爱心</view>
        <view class="template_item" @tap="loadTemplate('smile')">😊 笑脸</view>
        <view class="template_item" @tap="loadTemplate('star')">⭐ 星星</view>
        <view class="template_item" @tap="loadTemplate('code')">💻 代码</view>
      </view>
    </view>

    <!-- 隐藏的 canvas 用于导出图片 -->
    <canvas
      canvas-id="pixelCanvas"
      id="pixelCanvas"
      class="offscreen_canvas"
      :style="{ width: canvasSize + 'px', height: canvasSize + 'px' }"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Taro from '@tarojs/taro'

// 网格配置
const gridSize = ref(16)
const grid = ref<string[]>(new Array(16 * 16).fill(''))
const history = ref<string[][]>([])
const maxHistory = 30

// 工具状态
const currentTool = ref<'draw' | 'eraser' | 'fill'>('draw')
const currentColor = ref('#333333')
const recentColors = ref<string[]>([])

// 调色板
const palette = [
  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
  '#ff0000', '#ff4444', '#ff8800', '#ffcc00', '#ffff00', '#88ff00',
  '#00cc00', '#00cc88', '#00cccc', '#0088ff', '#0044ff', '#4400ff',
  '#8800ff', '#cc00ff', '#ff00cc', '#ff0088', '#ff6688', '#ffaa88',
  '#8B4513', '#D2691E', '#F4A460', '#FFDEAD', '#87CEEB', '#4169E1',
]

// 计算网格样式
const gridStyle = computed(() => {
  const size = gridSize.value
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${size}, 1fr)`,
    gridTemplateRows: `repeat(${size}, 1fr)`,
  }
})

// 离屏 canvas 尺寸
const canvasSize = computed(() => {
  const size = gridSize.value
  const pixelSize = Math.floor(600 / size)
  return size * pixelSize
})

// 保存历史记录
const saveHistory = () => {
  history.value.push([...grid.value])
  if (history.value.length > maxHistory) {
    history.value.shift()
  }
}

// 撤销
const undo = () => {
  if (history.value.length > 0) {
    grid.value = history.value.pop()!
  }
}

// 添加最近使用颜色
const addRecentColor = (color: string) => {
  if (!color || color === '#ffffff') return
  const filtered = recentColors.value.filter(c => c !== color)
  filtered.unshift(color)
  recentColors.value = filtered.slice(0, 10)
}

// 填充算法（Flood Fill）
const floodFill = (startIdx: number, targetColor: string, fillColor: string) => {
  if (targetColor === fillColor) return
  const size = gridSize.value
  const total = size * size
  const stack = [startIdx]
  const visited = new Set<number>()

  while (stack.length > 0) {
    const idx = stack.pop()!
    if (visited.has(idx) || idx < 0 || idx >= total) continue
    if ((grid.value[idx] || '#ffffff') !== targetColor) continue

    visited.add(idx)
    grid.value[idx] = fillColor

    const row = Math.floor(idx / size)
    const col = idx % size
    if (col > 0) stack.push(idx - 1)
    if (col < size - 1) stack.push(idx + 1)
    if (row > 0) stack.push(idx - size)
    if (row < size - 1) stack.push(idx + size)
  }
}

// 点击像素
const handleTap = (idx: number) => {
  saveHistory()

  if (currentTool.value === 'draw') {
    grid.value[idx] = currentColor.value
    addRecentColor(currentColor.value)
  } else if (currentTool.value === 'eraser') {
    grid.value[idx] = ''
  } else if (currentTool.value === 'fill') {
    const targetColor = grid.value[idx] || '#ffffff'
    const fillColor = currentColor.value
    floodFill(idx, targetColor, fillColor)
    addRecentColor(currentColor.value)
  }

  // 触发响应式更新
  grid.value = [...grid.value]
}

// 触摸绘画
let isDrawing = false
const handleTouchStart = (idx: number) => {
  isDrawing = true
  handleTap(idx)
}

const handleTouchMove = () => {
  if (!isDrawing) return
  // 在小程序中 touchmove 获取坐标比较复杂，此处简化处理
}

// 空函数，用于阻止画布区域的滚动穿透
const noop = () => {}

// 清除画布
const clearCanvas = () => {
  Taro.showModal({
    title: '提示',
    content: '确定要清空画布吗？',
    success: (res) => {
      if (res.confirm) {
        saveHistory()
        grid.value = new Array(gridSize.value * gridSize.value).fill('')
      }
    }
  })
}

// 切换网格大小
const changeSize = (size: number) => {
  if (size === gridSize.value) return
  Taro.showModal({
    title: '切换画布大小',
    content: '切换大小会清空当前画布，确定吗？',
    success: (res) => {
      if (res.confirm) {
        gridSize.value = size
        grid.value = new Array(size * size).fill('')
        history.value = []
      }
    }
  })
}

// 保存图片（使用 Canvas 绘制后保存）
const saveImage = () => {
  Taro.showLoading({ title: '生成中...' })
  const size = gridSize.value
  const pixelSize = Math.floor(600 / size)
  const canvasWidth = size * pixelSize

  const ctx = Taro.createCanvasContext('pixelCanvas')

  // 绘制背景
  ctx.setFillStyle('#ffffff')
  ctx.fillRect(0, 0, canvasWidth, canvasWidth)

  // 绘制像素
  for (let i = 0; i < grid.value.length; i++) {
    const row = Math.floor(i / size)
    const col = i % size
    const color = grid.value[i] || '#ffffff'
    ctx.setFillStyle(color)
    ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize)
  }

  // 绘制网格线
  ctx.setStrokeStyle('#eeeeee')
  ctx.setLineWidth(0.5)
  for (let i = 0; i <= size; i++) {
    ctx.moveTo(i * pixelSize, 0)
    ctx.lineTo(i * pixelSize, canvasWidth)
    ctx.moveTo(0, i * pixelSize)
    ctx.lineTo(canvasWidth, i * pixelSize)
  }
  ctx.stroke()

  ctx.draw(false, () => {
    setTimeout(() => {
      Taro.canvasToTempFilePath({
        canvasId: 'pixelCanvas',
        width: canvasWidth,
        height: canvasWidth,
        destWidth: canvasWidth * 2,
        destHeight: canvasWidth * 2,
        success: (res) => {
          Taro.hideLoading()
          // 保存到相册
          Taro.showModal({
            title: '保存成功',
            content: '是否保存到相册？',
            success: (modalRes) => {
              if (modalRes.confirm) {
                Taro.saveImageToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: () => {
                    Taro.showToast({ title: '已保存到相册', icon: 'success' })
                  },
                  fail: () => {
                    Taro.showToast({ title: '保存失败', icon: 'none' })
                  }
                })
              }
            }
          })
        },
        fail: () => {
          Taro.hideLoading()
          Taro.showToast({ title: '生成失败', icon: 'none' })
        }
      })
    }, 500)
  })
}

// 加载预设模板
const loadTemplate = (type: string) => {
  saveHistory()
  const size = 16
  if (gridSize.value !== size) {
    gridSize.value = size
    grid.value = new Array(size * size).fill('')
  } else {
    grid.value = new Array(size * size).fill('')
  }

  const templates: Record<string, { pixels: number[]; color: string }[]> = {
    heart: [
      {
        color: '#ff4444',
        pixels: [
          33, 34, 37, 38,
          48, 49, 50, 51, 52, 53, 54, 55,
          64, 65, 66, 67, 68, 69, 70, 71,
          80, 81, 82, 83, 84, 85, 86, 87,
          97, 98, 99, 100, 101, 102,
          114, 115, 116, 117,
          131, 132,
        ],
      },
    ],
    smile: [
      {
        color: '#ffcc00',
        pixels: [
          34, 35, 36, 37,
          49, 50, 51, 52, 53, 54,
          64, 65, 66, 67, 68, 69, 70, 71,
          80, 81, 82, 83, 84, 85, 86, 87,
          96, 97, 98, 99, 100, 101, 102, 103,
          112, 113, 114, 115, 116, 117, 118, 119,
          129, 130, 131, 132, 133, 134,
          146, 147, 148, 149,
        ],
      },
      {
        color: '#333333',
        pixels: [66, 69, 82, 85, 113, 118, 130, 131, 132, 133],
      },
    ],
    star: [
      {
        color: '#ffcc00',
        pixels: [
          // 正五角星（数学精确计算）
          7,
          23,
          39,
          54, 55, 56,
          70, 71, 72,
          82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92,
          99, 100, 101, 102, 103, 104, 105, 106, 107,
          116, 117, 118, 119, 120, 121, 122,
          133, 134, 135, 136, 137,
          148, 149, 150, 151, 152, 153, 154,
          164, 165, 169, 170,
          180, 186,
          195, 203,
        ],
      },
    ],
    code: [
      {
        // 左尖括号 <
        color: '#61dafb',
        pixels: [
          35,
          49, 50,
          64, 65,
          80,
          64, 65,
          96, 97,
          113,
        ],
      },
      {
        // 右尖括号 >
        color: '#61dafb',
        pixels: [
          40,
          56, 57,
          73, 74,
          89, 90,
          105, 106,
          120, 121,
          136,
        ],
      },
      {
        // 中间斜线 /
        color: '#f0db4f',
        pixels: [
          38,
          53,
          68,
          83, 84,
          99,
          114,
          129,
        ],
      },
    ],
  }

  const template = templates[type]
  if (template) {
    template.forEach(({ pixels, color }) => {
      pixels.forEach(idx => {
        if (idx < grid.value.length) {
          grid.value[idx] = color
        }
      })
    })
    grid.value = [...grid.value]
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 12px;
  padding-bottom: 40px;
  box-sizing: border-box;
}

.toolbar {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tool_row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.tool_btn {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s;

  &.active {
    background: #e8f4ff;
    box-shadow: 0 0 0 2px #4169E1;
  }

  &:active {
    transform: scale(0.92);
  }
}

.canvas_wrapper {
  background: #fff;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.canvas_grid {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.pixel {
  border: 0.5px solid rgba(0, 0, 0, 0.05);
  box-sizing: border-box;

  &:active {
    opacity: 0.7;
  }
}

.size_bar {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
}

.size_btn {
  padding: 6px 14px;
  border-radius: 16px;
  background: #fff;
  font-size: 12px;
  color: #666;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);

  &.active {
    background: #4169E1;
    color: #fff;
  }

  &:active {
    opacity: 0.75;
  }
}

.palette {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.palette_title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.color_grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color_swatch {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 2px solid transparent;
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);

  &.selected {
    border-color: #4169E1;
    transform: scale(1.15);
    box-shadow: 0 2px 8px rgba(65, 105, 225, 0.4);
  }

  &.small {
    width: 24px;
    height: 24px;
    border-radius: 4px;
  }

  &:active {
    transform: scale(0.9);
  }
}

.recent_colors {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.action_bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.btn {
  padding: 10px 28px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;

  &:active {
    opacity: 0.75;
  }
}

.btn_primary {
  background: linear-gradient(135deg, #4169E1, #6a5acd);
  color: #fff;
  box-shadow: 0 4px 12px rgba(65, 105, 225, 0.3);
}

.template_section {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.template_grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.template_item {
  padding: 8px 14px;
  border-radius: 8px;
  background: #f8f8f8;
  font-size: 13px;
  color: #555;

  &:active {
    background: #e8f4ff;
  }
}

/* 隐藏的 canvas 用于导出 */
.offscreen_canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
}
</style>
