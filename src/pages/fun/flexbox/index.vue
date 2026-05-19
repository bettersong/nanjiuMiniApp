<template>
  <view class="page">
    <!-- 关卡信息 -->
    <view class="level_header">
      <view class="level_badge">第 {{ currentLevel + 1 }} 关</view>
      <view class="level_title">{{ levels[currentLevel].title }}</view>
      <view class="level_desc">{{ levels[currentLevel].desc }}</view>
    </view>

    <!-- 目标预览 -->
    <view class="card">
      <view class="card_title">🎯 目标效果</view>
      <view class="playground target_area" :style="levels[currentLevel].targetStyle">
        <view
          v-for="(item, i) in levels[currentLevel].items"
          :key="i"
          class="frog"
          :style="item.style || {}"
        >{{ item.text || '🐸' }}</view>
      </view>
    </view>

    <!-- 你的答案 -->
    <view class="card">
      <view class="card_title">✍️ 你的布局</view>
      <view class="playground user_area" :style="userStyle">
        <view
          v-for="(item, i) in levels[currentLevel].items"
          :key="i"
          class="frog"
          :style="item.style || {}"
        >{{ item.text || '🐸' }}</view>
      </view>
    </view>

    <!-- 属性选择 -->
    <view class="card options_card">
      <view class="card_title">选择属性值</view>
      <view
        v-for="opt in levels[currentLevel].options"
        :key="opt.property"
        class="option_group"
      >
        <view class="option_label">{{ opt.property }}:</view>
        <view class="option_values">
          <view
            v-for="val in opt.values"
            :key="val"
            :class="['val_btn', userAnswers[opt.property] === val ? 'val_active' : '']"
            @tap="selectValue(opt.property, val)"
          >{{ val }}</view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="btn_row">
      <view class="btn btn_ghost" @tap="resetLevel">重置</view>
      <view class="btn btn_primary" @tap="checkAnswer">验证答案</view>
    </view>

    <!-- 成功弹窗 -->
    <view class="success_overlay" v-if="showSuccess">
      <view class="success_card">
        <view class="success_icon">🎉</view>
        <view class="success_title">恭喜过关！</view>
        <view class="success_desc" v-if="currentLevel < levels.length - 1">准备好挑战下一关了吗？</view>
        <view class="success_desc" v-else>你已完成所有关卡！太厉害了！</view>
        <view class="btn btn_primary" v-if="currentLevel < levels.length - 1" @tap="nextLevel">下一关</view>
        <view class="btn btn_primary" v-else @tap="restartAll">重新开始</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import Taro from '@tarojs/taro'

interface LevelItem {
  text?: string
  style?: Record<string, string>
}

interface LevelOption {
  property: string
  values: string[]
}

interface Level {
  title: string
  desc: string
  targetStyle: Record<string, string>
  items: LevelItem[]
  options: LevelOption[]
  answer: Record<string, string>
}

const levels: Level[] = [
  {
    title: '居中对齐',
    desc: '使用 justify-content 将青蛙移到中间',
    targetStyle: { display: 'flex', justifyContent: 'center' },
    items: [{ text: '🐸' }],
    options: [{ property: 'justify-content', values: ['flex-start', 'center', 'flex-end', 'space-between'] }],
    answer: { 'justify-content': 'center' },
  },
  {
    title: '靠右对齐',
    desc: '将青蛙移到右边',
    targetStyle: { display: 'flex', justifyContent: 'flex-end' },
    items: [{ text: '🐸' }],
    options: [{ property: 'justify-content', values: ['flex-start', 'center', 'flex-end', 'space-around'] }],
    answer: { 'justify-content': 'flex-end' },
  },
  {
    title: '均匀分布',
    desc: '让三只青蛙均匀分布',
    targetStyle: { display: 'flex', justifyContent: 'space-between' },
    items: [{ text: '🐸' }, { text: '🐸' }, { text: '🐸' }],
    options: [{ property: 'justify-content', values: ['center', 'space-between', 'space-around', 'space-evenly'] }],
    answer: { 'justify-content': 'space-between' },
  },
  {
    title: '环绕分布',
    desc: '让青蛙们环绕分布',
    targetStyle: { display: 'flex', justifyContent: 'space-around' },
    items: [{ text: '🐸' }, { text: '🐸' }, { text: '🐸' }],
    options: [{ property: 'justify-content', values: ['space-between', 'space-around', 'space-evenly', 'center'] }],
    answer: { 'justify-content': 'space-around' },
  },
  {
    title: '垂直居中',
    desc: '使用 align-items 垂直居中',
    targetStyle: { display: 'flex', alignItems: 'center', height: '100px' },
    items: [{ text: '🐸' }],
    options: [{ property: 'align-items', values: ['flex-start', 'center', 'flex-end', 'stretch'] }],
    answer: { 'align-items': 'center' },
  },
  {
    title: '底部对齐',
    desc: '把青蛙移到底部',
    targetStyle: { display: 'flex', alignItems: 'flex-end', height: '100px' },
    items: [{ text: '🐸' }, { text: '🐸' }],
    options: [{ property: 'align-items', values: ['flex-start', 'center', 'flex-end', 'stretch'] }],
    answer: { 'align-items': 'flex-end' },
  },
  {
    title: '列方向',
    desc: '改变主轴方向为竖向',
    targetStyle: { display: 'flex', flexDirection: 'column' },
    items: [{ text: '🐸' }, { text: '🐸' }, { text: '🐸' }],
    options: [{ property: 'flex-direction', values: ['row', 'column', 'row-reverse', 'column-reverse'] }],
    answer: { 'flex-direction': 'column' },
  },
  {
    title: '反转排列',
    desc: '让青蛙从右到左排列',
    targetStyle: { display: 'flex', flexDirection: 'row-reverse' },
    items: [{ text: '1️⃣' }, { text: '2️⃣' }, { text: '3️⃣' }],
    options: [{ property: 'flex-direction', values: ['row', 'column', 'row-reverse', 'column-reverse'] }],
    answer: { 'flex-direction': 'row-reverse' },
  },
  {
    title: '综合挑战',
    desc: '同时设置两个属性完成布局',
    targetStyle: { display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100px' },
    items: [{ text: '🐸' }, { text: '🐸' }],
    options: [
      { property: 'justify-content', values: ['flex-start', 'center', 'flex-end', 'space-between'] },
      { property: 'align-items', values: ['flex-start', 'center', 'flex-end', 'stretch'] },
    ],
    answer: { 'justify-content': 'center', 'align-items': 'flex-end' },
  },
  {
    title: '终极挑战',
    desc: '三个属性配合完成布局',
    targetStyle: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '120px' },
    items: [{ text: '🐸' }, { text: '🐸' }],
    options: [
      { property: 'flex-direction', values: ['row', 'column'] },
      { property: 'justify-content', values: ['flex-start', 'center', 'flex-end'] },
      { property: 'align-items', values: ['flex-start', 'center', 'flex-end'] },
    ],
    answer: { 'flex-direction': 'column', 'justify-content': 'center', 'align-items': 'center' },
  },
]

const currentLevel = ref(0)
const userAnswers = reactive<Record<string, string>>({})
const showSuccess = ref(false)

const userStyle = computed(() => {
  const base: Record<string, string> = { display: 'flex' }
  const level = levels[currentLevel.value]
  // 保留 height 如果目标有
  if (level.targetStyle.height) {
    base.height = level.targetStyle.height as string
  }
  return { ...base, ...userAnswers }
})

const selectValue = (property: string, value: string) => {
  userAnswers[property] = value
}

const checkAnswer = () => {
  const level = levels[currentLevel.value]
  const isCorrect = Object.entries(level.answer).every(
    ([key, val]) => userAnswers[key] === val
  )

  if (isCorrect) {
    showSuccess.value = true
  } else {
    Taro.showToast({ title: '还不对哦，再试试', icon: 'none' })
  }
}

const nextLevel = () => {
  showSuccess.value = false
  currentLevel.value++
  resetLevel()
}

const resetLevel = () => {
  Object.keys(userAnswers).forEach(key => delete userAnswers[key])
}

const restartAll = () => {
  showSuccess.value = false
  currentLevel.value = 0
  resetLevel()
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 16px;
  box-sizing: border-box;
  padding-bottom: 40px;
}

.level_header {
  text-align: center;
  margin-bottom: 14px;
}

.level_badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  padding: 4px 12px;
  border-radius: 12px;
  margin-bottom: 8px;
}

.level_title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.level_desc {
  font-size: 13px;
  color: #999;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.card_title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.playground {
  min-height: 80px;
  border: 2px dashed #e0e0e0;
  border-radius: 10px;
  padding: 8px;
  background: #fafafa;
}

.target_area {
  border-color: #27ae60;
  background: rgba(39, 174, 96, 0.05);
}

.user_area {
  border-color: #fda085;
  background: rgba(253, 160, 133, 0.05);
}

.frog {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.options_card {
  .card_title {
    margin-bottom: 12px;
  }
}

.option_group {
  margin-bottom: 12px;
  &:last-child { margin-bottom: 0; }
}

.option_label {
  font-size: 13px;
  font-family: monospace;
  color: #666;
  margin-bottom: 6px;
  font-weight: 600;
}

.option_values {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.val_btn {
  padding: 6px 12px;
  font-size: 12px;
  font-family: monospace;
  color: #666;
  background: #f5f5f5;
  border-radius: 6px;
  border: 1px solid transparent;
  &:active { opacity: 0.8; }
}

.val_active {
  background: rgba(253, 160, 133, 0.15);
  color: #fda085;
  border-color: #fda085;
  font-weight: 600;
}

.btn_row {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.btn {
  flex: 1;
  height: 44px;
  line-height: 44px;
  border-radius: 12px;
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

// 成功弹窗
.success_overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 30px;
}

.success_card {
  background: #fff;
  border-radius: 20px;
  padding: 30px 24px;
  text-align: center;
  width: 100%;
}

.success_icon { font-size: 48px; margin-bottom: 12px; }
.success_title { font-size: 20px; font-weight: 700; color: #333; margin-bottom: 8px; }
.success_desc { font-size: 13px; color: #999; margin-bottom: 20px; }
</style>
