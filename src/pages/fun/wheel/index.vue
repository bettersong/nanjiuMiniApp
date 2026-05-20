<template>
  <view class="page">
    <!-- 转盘区域 -->
    <view class="wheel_section">
      <!-- 外圈灯光 -->
      <view class="lights_ring">
        <view
          v-for="i in 20"
          :key="i"
          :class="['light_dot', spinning ? 'light_blink' : '']"
          :style="getLightStyle(i)"
        ></view>
      </view>

      <!-- 转盘主体 -->
      <view class="wheel_container">
        <!-- 指针 -->
        <view class="pointer_wrap">
          <view class="pointer_triangle"></view>
        </view>

        <!-- 转盘 -->
        <view class="wheel_body" :style="wheelStyle">
          <!-- 用 conic-gradient 渲染扇区背景 -->
          <view class="wheel_bg" :style="{ background: conicBg }"></view>
          <!-- 文字标签 -->
          <view
            v-for="(item, idx) in options"
            :key="idx"
            class="label_wrap"
            :style="getLabelStyle(idx)"
          >
            <text class="segment_label">{{ item }}</text>
          </view>
        </view>

        <!-- 中心按钮 -->
        <view class="center_btn" :class="{ center_spinning: spinning }" @tap="spin">
          <view class="center_btn_inner">
            <text class="center_text">{{ spinning ? 'GO' : 'GO' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 结果 -->
    <view class="card result_card" v-if="resultText && !spinning">
      <view class="result_emoji">🎉</view>
      <view class="result_title">恭喜抽中</view>
      <view class="result_text">{{ resultText }}</view>
    </view>

    <!-- 选项管理 -->
    <view class="card">
      <view class="card_title">⚙️ 自定义选项（{{ options.length }}个）</view>
      <view class="option_list">
        <view class="option_item" v-for="(item, idx) in options" :key="idx">
          <view class="option_dot" :style="{ background: segmentColors[idx % segmentColors.length] }"></view>
          <text class="option_text">{{ item }}</text>
          <text class="option_del" @tap="removeOption(idx)">×</text>
        </view>
      </view>
      <view class="add_row">
        <input class="add_input" v-model="newOption" placeholder="输入新选项..." @confirm="addOption" />
        <view class="add_btn" @tap="addOption">添加</view>
      </view>
    </view>

    <!-- 预设模板 -->
    <view class="card">
      <view class="card_title">📋 快速模板</view>
      <view class="preset_list">
        <view class="preset_btn" @tap="loadPreset('lunch')">🍜 今天吃什么</view>
        <view class="preset_btn" @tap="loadPreset('decision')">🤔 做决定</view>
        <view class="preset_btn" @tap="loadPreset('punishment')">😈 惩罚大冒险</view>
        <view class="preset_btn" @tap="loadPreset('number')">🎲 1-6</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Taro from '@tarojs/taro'

const options = ref<string[]>(['火锅', '烧烤', '奶茶', '麻辣烫', '汉堡', '寿司'])
const newOption = ref('')
const rotation = ref(0)
const spinning = ref(false)
const resultText = ref('')

const segmentColors = [
  '#FF6B6B', '#FFA502', '#FECA57', '#48DBFB', '#6C5CE7', '#27ae60',
  '#fd79a8', '#00cec9', '#e17055', '#0984e3', '#fdcb6e', '#a29bfe',
]

// 转盘旋转样式
const wheelStyle = computed(() => ({
  transform: `rotate(${rotation.value}deg)`,
  transition: spinning.value ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
}))

// 用 conic-gradient 生成扇区背景（无间隙）
const conicBg = computed(() => {
  const count = options.value.length
  const angle = 360 / count
  const stops: string[] = []
  for (let i = 0; i < count; i++) {
    const color = segmentColors[i % segmentColors.length]
    stops.push(`${color} ${angle * i}deg ${angle * (i + 1)}deg`)
  }
  return `conic-gradient(from 0deg, ${stops.join(', ')})`
})

// 文字标签定位（每个扇区中心方向）
const getLabelStyle = (idx: number) => {
  const count = options.value.length
  const angle = 360 / count
  const rotation = angle * idx + angle / 2 - 90 // -90 因为 conic 从顶部开始
  const rad = (rotation * Math.PI) / 180
  // 放在半径 35% 的位置
  const x = 50 + 33 * Math.cos(rad)
  const y = 50 + 33 * Math.sin(rad)
  return {
    left: x + '%',
    top: y + '%',
    transform: `translate(-50%, -50%) rotate(${rotation + 90}deg)`,
  }
}

// 灯光小圆点定位
const lightColors = ['#feca57', '#ff6b6b', '#48dbfb', '#27ae60', '#6c5ce7', '#fd79a8', '#ffa502', '#00cec9']

const getLightStyle = (i: number) => {
  const angle = (i / 20) * 360 - 90
  const rad = (angle * Math.PI) / 180
  const radius = 48.5 // %
  const x = 50 + radius * Math.cos(rad)
  const y = 50 + radius * Math.sin(rad)
  const color = lightColors[i % lightColors.length]
  return {
    left: x + '%',
    top: y + '%',
    animationDelay: (i * 0.1) + 's',
    background: color,
    boxShadow: `0 0 6px ${color}`,
  }
}

const spin = () => {
  if (spinning.value || options.value.length < 2) {
    if (options.value.length < 2) {
      Taro.showToast({ title: '至少需要2个选项', icon: 'none' })
    }
    return
  }

  spinning.value = true
  resultText.value = ''

  const count = options.value.length
  const segmentAngle = 360 / count
  const randomIdx = Math.floor(Math.random() * count)

  // conic-gradient 从顶部(0deg)开始顺时针画，第i个扇区中心角度 = i*seg + seg/2
  // 指针固定在顶部(0度位置)
  // 转盘顺时针旋转R度后，指针指向的原始角度 = (360 - R%360) % 360
  // 要让指针指向第 randomIdx 个扇区中心：
  // (360 - R%360) % 360 = randomIdx * segmentAngle + segmentAngle / 2
  // 即 R%360 = 360 - (randomIdx * segmentAngle + segmentAngle / 2)
  const targetMod = (360 - (randomIdx * segmentAngle + segmentAngle / 2) + 360) % 360
  const currentMod = ((rotation.value % 360) + 360) % 360
  // 从当前位置到目标的增量
  let delta = targetMod - currentMod
  if (delta <= 0) delta += 360
  const fullSpins = 360 * (5 + Math.floor(Math.random() * 3))
  const targetAngle = fullSpins + delta

  rotation.value = rotation.value + targetAngle

  setTimeout(() => {
    spinning.value = false
    resultText.value = options.value[randomIdx]
    Taro.vibrateShort({ type: 'medium' }).catch(() => {})
  }, 4200)
}

const addOption = () => {
  const text = newOption.value.trim()
  if (!text) return
  if (options.value.length >= 12) {
    Taro.showToast({ title: '最多12个选项', icon: 'none' })
    return
  }
  options.value.push(text)
  newOption.value = ''
}

const removeOption = (idx: number) => {
  if (options.value.length <= 2) {
    Taro.showToast({ title: '至少保留2个', icon: 'none' })
    return
  }
  options.value.splice(idx, 1)
}

const presets: Record<string, string[]> = {
  lunch: ['火锅', '烧烤', '麻辣烫', '快餐', '面条', '饺子', '炒菜', '外卖'],
  decision: ['做！', '不做', '明天再说', '随缘', '问问别人', '抛硬币'],
  punishment: ['做10个俯卧撑', '学猫叫', '发红包', '请喝奶茶', '唱一首歌', '跳一段舞'],
  number: ['1', '2', '3', '4', '5', '6'],
}

const loadPreset = (key: string) => {
  options.value = [...presets[key]]
  resultText.value = ''
  rotation.value = 0
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding: 16px;
  box-sizing: border-box;
}

// 转盘区域
.wheel_section {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 0 20px;
}

// 灯光圈
.lights_ring {
  position: absolute;
  width: 290px;
  height: 290px;
  border-radius: 50%;
}

.light_dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.light_blink {
  animation: blink 0.5s infinite alternate;
}

@keyframes blink {
  0% { opacity: 0.3; filter: brightness(0.6); }
  100% { opacity: 1; filter: brightness(1.3); }
}

// 转盘容器
.wheel_container {
  position: relative;
  width: 260px;
  height: 260px;
}

// 指针
.pointer_wrap {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
}

.pointer_triangle {
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 20px solid #e74c3c;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

// 转盘主体
.wheel_body {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  border: 6px solid #2c3e50;
  box-shadow: 0 0 0 3px #f39c12, 0 8px 30px rgba(0,0,0,0.4);
  box-sizing: border-box;
}

.wheel_bg {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.label_wrap {
  position: absolute;
  z-index: 5;
}

.segment_label {
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  white-space: nowrap;
  max-width: 56px;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 中心按钮
.center_btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(145deg, #e74c3c, #c0392b);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.5), inset 0 2px 4px rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  &:active {
    transform: translate(-50%, -50%) scale(0.92);
  }
}

.center_spinning {
  animation: pulse_btn 1s infinite;
}

@keyframes pulse_btn {
  0%, 100% { box-shadow: 0 4px 15px rgba(231, 76, 60, 0.5); }
  50% { box-shadow: 0 4px 25px rgba(231, 76, 60, 0.8), 0 0 40px rgba(231, 76, 60, 0.3); }
}

.center_btn_inner {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.center_text {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 1px;
}

// 结果卡片
.card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.card_title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.result_card {
  text-align: center;
  background: linear-gradient(135deg, #fff9e6, #fff);
  border: 1px solid #feca57;
}

.result_emoji { font-size: 36px; margin-bottom: 8px; }
.result_title { font-size: 13px; color: #999; margin-bottom: 6px; }
.result_text { font-size: 24px; font-weight: 700; color: #e74c3c; }

// 选项列表
.option_list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.option_item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f8f8f8;
  padding: 6px 10px;
  border-radius: 8px;
}

.option_dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.option_text { font-size: 13px; color: #333; }

.option_del {
  font-size: 16px;
  color: #ccc;
  margin-left: 2px;
  &:active { color: #e74c3c; }
}

.add_row {
  display: flex;
  gap: 8px;
}

.add_input {
  flex: 1;
  height: 38px;
  background: #f7f7f7;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  color: #333;
  border: 1px solid #eee;
}

.add_btn {
  height: 38px;
  line-height: 38px;
  padding: 0 16px;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  &:active { opacity: 0.75; }
}

// 预设
.preset_list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset_btn {
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 12px;
  color: #666;
  &:active { opacity: 0.7; background: rgba(253, 160, 133, 0.15); color: #fda085; }
}
</style>
