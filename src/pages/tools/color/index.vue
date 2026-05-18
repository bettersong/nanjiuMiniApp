<template>
  <view class="page">
    <!-- 颜色预览 -->
    <view class="preview_card">
      <view class="color_block" :style="{ background: previewColor }"></view>
      <view class="preview_info">
        <view class="preview_hex">{{ hexVal || '#--' }}</view>
        <view class="preview_sub">点击颜色块复制 HEX</view>
      </view>
      <view class="copy_icon" @tap="copyText(hexVal)">复制</view>
    </view>

    <!-- 预设颜色 -->
    <view class="card">
      <view class="card_title">🎨 常用颜色</view>
      <view class="preset_grid">
        <view
          class="preset_dot"
          v-for="c in presetColors"
          :key="c"
          :style="{ background: c }"
          @tap="applyPreset(c)"
        ></view>
      </view>
    </view>

    <!-- HEX 输入 -->
    <view class="card">
      <view class="card_title">HEX</view>
      <view class="input_row">
        <text class="prefix">#</text>
        <input
          class="input"
          type="text"
          v-model="hexInput"
          placeholder="RRGGBB 或 RGB"
          maxlength="6"
          @input="onHexInput"
        />
      </view>
      <view class="error_tip" v-if="hexError">{{ hexError }}</view>
    </view>

    <!-- RGB 输入 -->
    <view class="card">
      <view class="card_title">RGB</view>
      <view class="rgb_row">
        <view class="rgb_item">
          <text class="rgb_label">R</text>
          <input class="input_sm" type="number" v-model="rVal" placeholder="0-255" @input="onRGBInput" />
        </view>
        <view class="rgb_item">
          <text class="rgb_label">G</text>
          <input class="input_sm" type="number" v-model="gVal" placeholder="0-255" @input="onRGBInput" />
        </view>
        <view class="rgb_item">
          <text class="rgb_label">B</text>
          <input class="input_sm" type="number" v-model="bVal" placeholder="0-255" @input="onRGBInput" />
        </view>
      </view>
    </view>

    <!-- 转换结果 -->
    <view class="card" v-if="results">
      <view class="card_title">✅ 转换结果</view>
      <view class="result_item" v-for="r in results" :key="r.label" @tap="copyText(r.value)">
        <text class="r_label">{{ r.label }}</text>
        <text class="r_value selectable">{{ r.value }}</text>
        <text class="r_copy">复制</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'

onMounted(() => {
  // 统计工具使用次数
  const count = Taro.getStorageSync('nj_tools_used_count') || 0
  Taro.setStorageSync('nj_tools_used_count', count + 1)
})

// ---- 工具函数 ----
const hexToRgb = (hex: string): [number, number, number] | null => {
  const clean = hex.replace(/^#/, '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)]
}

const rgbToHex = (r: number, g: number, b: number): string =>
  '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

// ---- 状态 ----
const hexInput = ref('')
const rVal = ref('')
const gVal = ref('')
const bVal = ref('')
const hexError = ref('')

const hexVal = computed(() => hexInput.value ? `#${hexInput.value.toUpperCase()}` : '')
const previewColor = computed(() => {
  const rgb = hexToRgb(hexInput.value)
  return rgb ? `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` : '#f8f8f8'
})

const results = computed(() => {
  const rgb = hexToRgb(hexInput.value)
  if (!rgb) return null
  const [r, g, b] = rgb
  const [h, s, l] = rgbToHsl(r, g, b)
  return [
    { label: 'HEX', value: rgbToHex(r, g, b) },
    { label: 'RGB', value: `rgb(${r}, ${g}, ${b})` },
    { label: 'RGBA', value: `rgba(${r}, ${g}, ${b}, 1)` },
    { label: 'HSL', value: `hsl(${h}, ${s}%, ${l}%)` },
    { label: 'R / G / B', value: `${r} / ${g} / ${b}` },
  ]
})

const onHexInput = () => {
  hexError.value = ''
  const clean = hexInput.value.replace(/^#/, '').trim()
  hexInput.value = clean
  const rgb = hexToRgb(clean)
  if (rgb) {
    rVal.value = String(rgb[0])
    gVal.value = String(rgb[1])
    bVal.value = String(rgb[2])
  } else if (clean.length >= 3) {
    hexError.value = '请输入有效的 HEX 值（如 ff6b6b）'
  }
}

const onRGBInput = () => {
  const r = Math.min(255, Math.max(0, Number(rVal.value) || 0))
  const g = Math.min(255, Math.max(0, Number(gVal.value) || 0))
  const b = Math.min(255, Math.max(0, Number(bVal.value) || 0))
  hexInput.value = rgbToHex(r, g, b).replace('#', '')
  hexError.value = ''
}

const applyPreset = (color: string) => {
  hexInput.value = color.replace('#', '')
  const rgb = hexToRgb(color)
  if (rgb) {
    rVal.value = String(rgb[0])
    gVal.value = String(rgb[1])
    bVal.value = String(rgb[2])
  }
}

const presetColors = [
  '#FF6B6B', '#FF8E53', '#FFA62B', '#FECA57',
  '#48CAE4', '#4FC3F7', '#66BB6A', '#26A69A',
  '#7986CB', '#EC407A', '#AB47BC', '#8D6E63',
  '#BDBDBD', '#455A64', '#1A1A2E', '#FFFFFF',
]

const copyText = (text: string) => {
  if (!text) return
  Taro.setClipboardData({
    data: text,
    success: () => Taro.showToast({ title: '已复制', icon: 'success' }),
  })
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 16px;
  box-sizing: border-box;
}

.preview_card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  gap: 14px;
}

.color_block {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0,0,0,0.06);
}

.preview_info {
  flex: 1;
}

.preview_hex {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  font-family: monospace;
  letter-spacing: 1px;
}

.preview_sub {
  font-size: 11px;
  color: #ccc;
  margin-top: 4px;
}

.copy_icon {
  font-size: 13px;
  color: #fda085;
  padding: 4px 8px;
  &:active { opacity: 0.7; }
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card_title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.preset_grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preset_dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(0,0,0,0.06);
  &:active { transform: scale(1.15); }
}

.input_row {
  display: flex;
  align-items: center;
  background: #f7f7f7;
  border-radius: 8px;
  border: 1px solid #eee;
  overflow: hidden;
  height: 42px;
}

.prefix {
  padding: 0 10px 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #999;
  font-family: monospace;
}

.input {
  flex: 1;
  height: 42px;
  font-size: 15px;
  color: #333;
  font-family: monospace;
  letter-spacing: 1px;
  background: transparent;
}

.rgb_row {
  display: flex;
  gap: 10px;
}

.rgb_item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.rgb_label {
  font-size: 12px;
  font-weight: 700;
  color: #999;
}

.input_sm {
  width: 100%;
  height: 38px;
  background: #f7f7f7;
  border-radius: 8px;
  text-align: center;
  font-size: 15px;
  color: #333;
  border: 1px solid #eee;
  box-sizing: border-box;
}

.result_item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  &:last-child { border-bottom: none; }
  &:active { opacity: 0.7; }
}

.r_label {
  font-size: 12px;
  color: #aaa;
  width: 70px;
  flex-shrink: 0;
}

.r_value {
  flex: 1;
  font-size: 13px;
  color: #333;
  font-family: monospace;
  font-weight: 500;
}

.r_copy {
  font-size: 12px;
  color: #fda085;
}

.error_tip {
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 6px;
}
</style>
