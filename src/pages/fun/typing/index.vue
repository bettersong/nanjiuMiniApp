<template>
  <view class="page">
    <!-- 未开始 -->
    <view v-if="!started && !finished" class="start_view">
      <view class="start_card">
        <view class="start_icon">⌨️</view>
        <view class="start_title">前端打字练习</view>
        <view class="start_desc">测试你的打字速度和准确率</view>
      </view>

      <!-- 类别选择 -->
      <view class="card">
        <view class="card_title">选择类型</view>
        <view class="category_list">
          <view
            v-for="(cat, key) in textGroups"
            :key="key"
            :class="['cat_btn', selectedCategory === key ? 'cat_active' : '']"
            @tap="selectedCategory = key"
          >{{ key }}</view>
        </view>
      </view>

      <view class="btn btn_primary start_btn" @tap="startGame">开始练习</view>
    </view>

    <!-- 进行中 -->
    <view v-if="started && !finished" class="game_view">
      <!-- 计时 -->
      <view class="timer_bar">
        <view class="timer_text">⏱ {{ elapsedTime }}s</view>
        <view class="progress_text">{{ currentIdx + 1 }} / {{ currentTexts.length }}</view>
      </view>

      <!-- 目标文本 -->
      <view class="target_card">
        <view class="target_label">请输入：</view>
        <view class="target_text">
          <text
            v-for="(ch, i) in currentTarget.split('')"
            :key="i"
            :class="{
              'char': true,
              'char_correct': i < userInput.length && userInput[i] === ch,
              'char_wrong': i < userInput.length && userInput[i] !== ch,
              'char_current': i === userInput.length,
            }"
          >{{ ch }}</text>
        </view>
      </view>

      <!-- 输入框 -->
      <view class="input_card">
        <input
          class="type_input"
          type="text"
          v-model="userInput"
          :focus="inputFocus"
          placeholder="在此输入..."
          @input="onInput"
        />
      </view>

      <!-- 跳过按钮 -->
      <view class="skip_row">
        <view class="btn btn_ghost skip_btn" @tap="skipCurrent">跳过</view>
      </view>
    </view>

    <!-- 结束 -->
    <view v-if="finished" class="result_view">
      <view class="result_card">
        <view class="result_icon">🎉</view>
        <view class="result_title">练习完成！</view>

        <view class="result_stats">
          <view class="stat_item">
            <view class="stat_num">{{ stats.speed }}</view>
            <view class="stat_label">字/分钟</view>
          </view>
          <view class="stat_divider"></view>
          <view class="stat_item">
            <view class="stat_num">{{ stats.accuracy }}%</view>
            <view class="stat_label">正确率</view>
          </view>
          <view class="stat_divider"></view>
          <view class="stat_item">
            <view class="stat_num">{{ stats.time }}s</view>
            <view class="stat_label">总用时</view>
          </view>
        </view>

        <view class="result_detail">
          <view class="detail_row">
            <text class="detail_label">完成数量</text>
            <text class="detail_val">{{ stats.completed }} / {{ currentTexts.length }}</text>
          </view>
          <view class="detail_row">
            <text class="detail_label">正确字符</text>
            <text class="detail_val">{{ stats.correctChars }} / {{ stats.totalChars }}</text>
          </view>
        </view>
      </view>

      <view class="btn btn_primary" @tap="restart">再来一次</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const textGroups: Record<string, string[]> = {
  'JS 关键词': [
    'const', 'function', 'return', 'async', 'await',
    'import', 'export', 'default', 'class', 'extends',
    'typeof', 'instanceof', 'Promise', 'setTimeout',
    'addEventListener', 'querySelector',
  ],
  'CSS 属性': [
    'display: flex', 'justify-content: center', 'align-items: center',
    'border-radius: 8px', 'box-shadow: 0 2px 10px', 'position: absolute',
    'transform: translateX', 'transition: all 0.3s', 'grid-template-columns',
    'background: linear-gradient',
  ],
  'HTML 标签': [
    '<div></div>', '<section></section>', '<article></article>',
    '<header></header>', '<footer></footer>', '<nav></nav>',
    '<button></button>', '<input type="text" />', '<template></template>',
    '<component :is="comp" />',
  ],
  '代码片段': [
    'const arr = [1, 2, 3]',
    'arr.map(x => x * 2)',
    'arr.filter(x => x > 1)',
    'const [a, b] = arr',
    'Object.keys(obj)',
    'async function fetch() {}',
    'export default defineConfig',
    'ref<string>()',
    'computed(() => val)',
    'onMounted(() => {})',
  ],
}

const selectedCategory = ref('JS 关键词')
const started = ref(false)
const finished = ref(false)
const currentTexts = ref<string[]>([])
const currentIdx = ref(0)
const userInput = ref('')
const inputFocus = ref(false)
const startTime = ref(0)
const elapsedTime = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

// 统计
const totalCorrectChars = ref(0)
const totalChars = ref(0)
const completedCount = ref(0)

const currentTarget = computed(() => currentTexts.value[currentIdx.value] || '')

const stats = computed(() => {
  const time = elapsedTime.value || 1
  const speed = Math.round((totalChars.value / time) * 60)
  const accuracy = totalChars.value > 0 ? Math.round((totalCorrectChars.value / totalChars.value) * 100) : 0
  return {
    speed,
    accuracy,
    time,
    completed: completedCount.value,
    correctChars: totalCorrectChars.value,
    totalChars: totalChars.value,
  }
})

const startGame = () => {
  // 随机取 8 个
  const pool = textGroups[selectedCategory.value]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  currentTexts.value = shuffled.slice(0, 8)
  currentIdx.value = 0
  userInput.value = ''
  totalCorrectChars.value = 0
  totalChars.value = 0
  completedCount.value = 0
  started.value = true
  finished.value = false
  inputFocus.value = true
  startTime.value = Date.now()
  elapsedTime.value = 0

  timer = setInterval(() => {
    elapsedTime.value = Math.round((Date.now() - startTime.value) / 1000)
  }, 1000)
}

const onInput = () => {
  const target = currentTarget.value
  if (userInput.value === target) {
    // 完成当前词
    totalChars.value += target.length
    totalCorrectChars.value += target.length
    completedCount.value++
    nextWord()
  }
}

const skipCurrent = () => {
  const target = currentTarget.value
  // 计算已输入部分的正确字符
  let correct = 0
  for (let i = 0; i < userInput.value.length; i++) {
    if (userInput.value[i] === target[i]) correct++
  }
  totalChars.value += target.length
  totalCorrectChars.value += correct
  nextWord()
}

const nextWord = () => {
  if (currentIdx.value >= currentTexts.value.length - 1) {
    endGame()
  } else {
    currentIdx.value++
    userInput.value = ''
    inputFocus.value = false
    setTimeout(() => { inputFocus.value = true }, 50)
  }
}

const endGame = () => {
  started.value = false
  finished.value = true
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const restart = () => {
  finished.value = false
  started.value = false
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 16px;
  box-sizing: border-box;
}

.start_view {
  padding-top: 20px;
}

.start_card {
  text-align: center;
  padding: 30px 20px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

.start_icon { font-size: 48px; margin-bottom: 12px; }
.start_title { font-size: 20px; font-weight: 700; color: #333; margin-bottom: 6px; }
.start_desc { font-size: 13px; color: #999; }

.card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.card_title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.category_list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat_btn {
  padding: 8px 14px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  border-radius: 8px;
  &:active { opacity: 0.8; }
}

.cat_active {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #fff;
  font-weight: 600;
}

.btn {
  height: 44px;
  line-height: 44px;
  border-radius: 12px;
  font-size: 16px;
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

.start_btn { margin-top: 8px; }

// 游戏中
.game_view { padding-top: 8px; }

.timer_bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.timer_text { font-size: 16px; font-weight: 700; color: #d81e06; }
.progress_text { font-size: 13px; color: #999; }

.target_card {
  background: #fff;
  border-radius: 14px;
  padding: 20px 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.target_label {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.target_text {
  font-size: 20px;
  font-family: monospace;
  letter-spacing: 1px;
  line-height: 1.6;
  word-break: break-all;
}

.char { color: #ccc; }
.char_correct { color: #27ae60; }
.char_wrong { color: #e74c3c; background: rgba(231, 76, 60, 0.1); border-radius: 2px; }
.char_current { border-bottom: 2px solid #fda085; }

.input_card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.type_input {
  width: 100%;
  height: 44px;
  background: #f7f7f7;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 16px;
  font-family: monospace;
  color: #333;
  border: 2px solid #eee;
  box-sizing: border-box;
}

.skip_row {
  display: flex;
  justify-content: center;
}

.skip_btn {
  width: 120px;
  height: 36px;
  line-height: 36px;
  font-size: 13px;
}

// 结果
.result_view { padding-top: 20px; }

.result_card {
  background: #fff;
  border-radius: 16px;
  padding: 30px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  text-align: center;
}

.result_icon { font-size: 48px; margin-bottom: 8px; }
.result_title { font-size: 20px; font-weight: 700; color: #333; margin-bottom: 20px; }

.result_stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16px 0;
  border-top: 1px solid #f5f5f5;
  border-bottom: 1px solid #f5f5f5;
  margin-bottom: 16px;
}

.stat_item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat_num { font-size: 24px; font-weight: 700; color: #d81e06; margin-bottom: 4px; }
.stat_label { font-size: 11px; color: #999; }
.stat_divider { width: 1px; height: 30px; background: #f0f0f0; }

.result_detail { text-align: left; }

.detail_row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.detail_label { font-size: 13px; color: #999; }
.detail_val { font-size: 13px; color: #333; font-weight: 500; }
</style>
