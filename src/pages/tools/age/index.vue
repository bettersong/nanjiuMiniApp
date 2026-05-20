<template>
  <view class="page">
    <!-- 日期选择 -->
    <view class="card">
      <view class="card_title">🎂 选择出生日期</view>
      <picker mode="date" :value="birthday" @change="onDateChange" :end="today">
        <view class="date_picker">
          <text class="date_text">{{ birthday || '点击选择日期' }}</text>
          <text class="date_arrow">›</text>
        </view>
      </picker>
    </view>

    <!-- 结果展示 -->
    <view class="card result_card" v-if="result">
      <view class="result_header">
        <view class="result_age">{{ result.years }}</view>
        <view class="result_unit">岁</view>
      </view>
      <view class="result_sub">{{ result.years }}年{{ result.months }}个月{{ result.days }}天</view>

      <view class="info_grid">
        <view class="info_item">
          <view class="info_num">{{ result.totalDays }}</view>
          <view class="info_label">总天数</view>
        </view>
        <view class="info_item">
          <view class="info_num">{{ result.totalWeeks }}</view>
          <view class="info_label">总周数</view>
        </view>
        <view class="info_item">
          <view class="info_num">{{ result.totalHours }}</view>
          <view class="info_label">总小时</view>
        </view>
      </view>
    </view>

    <!-- 星座 & 生肖 -->
    <view class="card" v-if="result">
      <view class="card_title">✨ 更多信息</view>
      <view class="extra_grid">
        <view class="extra_item">
          <view class="extra_icon">{{ result.zodiacEmoji }}</view>
          <view class="extra_label">星座</view>
          <view class="extra_val">{{ result.zodiac }}</view>
        </view>
        <view class="extra_item">
          <view class="extra_icon">{{ result.animalEmoji }}</view>
          <view class="extra_label">生肖</view>
          <view class="extra_val">{{ result.animal }}</view>
        </view>
        <view class="extra_item">
          <view class="extra_icon">🎂</view>
          <view class="extra_label">下次生日</view>
          <view class="extra_val">{{ result.nextBirthday }}天后</view>
        </view>
      </view>
    </view>

    <!-- 有趣数据 -->
    <view class="card" v-if="result">
      <view class="card_title">🎯 趣味数据</view>
      <view class="fun_row" v-for="item in funFacts" :key="item.label">
        <text class="fun_label">{{ item.label }}</text>
        <text class="fun_val">{{ item.value }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'

onMounted(() => {
  const count = Taro.getStorageSync('nj_tools_used_count') || 0
  Taro.setStorageSync('nj_tools_used_count', count + 1)
})

const birthday = ref('')
const today = new Date().toISOString().slice(0, 10)

interface AgeResult {
  years: number
  months: number
  days: number
  totalDays: number
  totalWeeks: number
  totalHours: string
  zodiac: string
  zodiacEmoji: string
  animal: string
  animalEmoji: string
  nextBirthday: number
}

const result = ref<AgeResult | null>(null)

const onDateChange = (e: any) => {
  birthday.value = e.detail.value
  calculate()
}

const calculate = () => {
  if (!birthday.value) return

  const birth = new Date(birthday.value)
  const now = new Date()

  // 精确年龄
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  let days = now.getDate() - birth.getDate()

  if (days < 0) {
    months--
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }

  // 总天数
  const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
  const totalWeeks = Math.floor(totalDays / 7)
  const totalHours = (totalDays * 24).toLocaleString()

  // 星座
  const { zodiac, zodiacEmoji } = getZodiac(birth.getMonth() + 1, birth.getDate())

  // 生肖
  const { animal, animalEmoji } = getAnimal(birth.getFullYear())

  // 下次生日
  let nextBirth = new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
  if (nextBirth.getTime() <= now.getTime()) {
    nextBirth = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate())
  }
  const nextBirthday = Math.ceil((nextBirth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  result.value = { years, months, days, totalDays, totalWeeks, totalHours, zodiac, zodiacEmoji, animal, animalEmoji, nextBirthday }
}

const getZodiac = (month: number, day: number): { zodiac: string; zodiacEmoji: string } => {
  const zodiacs = [
    { name: '摩羯座', emoji: '♑', start: [1, 1], end: [1, 19] },
    { name: '水瓶座', emoji: '♒', start: [1, 20], end: [2, 18] },
    { name: '双鱼座', emoji: '♓', start: [2, 19], end: [3, 20] },
    { name: '白羊座', emoji: '♈', start: [3, 21], end: [4, 19] },
    { name: '金牛座', emoji: '♉', start: [4, 20], end: [5, 20] },
    { name: '双子座', emoji: '♊', start: [5, 21], end: [6, 21] },
    { name: '巨蟹座', emoji: '♋', start: [6, 22], end: [7, 22] },
    { name: '狮子座', emoji: '♌', start: [7, 23], end: [8, 22] },
    { name: '处女座', emoji: '♍', start: [8, 23], end: [9, 22] },
    { name: '天秤座', emoji: '♎', start: [9, 23], end: [10, 23] },
    { name: '天蝎座', emoji: '♏', start: [10, 24], end: [11, 22] },
    { name: '射手座', emoji: '♐', start: [11, 23], end: [12, 21] },
    { name: '摩羯座', emoji: '♑', start: [12, 22], end: [12, 31] },
  ]
  for (const z of zodiacs) {
    const [sm, sd] = z.start
    const [em, ed] = z.end
    if ((month === sm && day >= sd) || (month === em && day <= ed)) {
      return { zodiac: z.name, zodiacEmoji: z.emoji }
    }
  }
  return { zodiac: '摩羯座', zodiacEmoji: '♑' }
}

const getAnimal = (year: number): { animal: string; animalEmoji: string } => {
  const animals = [
    { name: '鼠', emoji: '🐭' }, { name: '牛', emoji: '🐮' },
    { name: '虎', emoji: '🐯' }, { name: '兔', emoji: '🐰' },
    { name: '龙', emoji: '🐲' }, { name: '蛇', emoji: '🐍' },
    { name: '马', emoji: '🐴' }, { name: '羊', emoji: '🐑' },
    { name: '猴', emoji: '🐵' }, { name: '鸡', emoji: '🐔' },
    { name: '狗', emoji: '🐶' }, { name: '猪', emoji: '🐷' },
  ]
  const idx = (year - 4) % 12
  return { animal: animals[idx].name, animalEmoji: animals[idx].emoji }
}

const funFacts = computed(() => {
  if (!result.value) return []
  const r = result.value
  return [
    { label: '心跳约', value: (r.totalDays * 100000).toLocaleString() + ' 次' },
    { label: '呼吸约', value: (r.totalDays * 20000).toLocaleString() + ' 次' },
    { label: '睡眠约', value: Math.floor(r.totalDays * 8) .toLocaleString() + ' 小时' },
    { label: '眨眼约', value: (r.totalDays * 15000).toLocaleString() + ' 次' },
  ]
})
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

.date_picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f7f7f7;
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid #eee;
}

.date_text { font-size: 15px; color: #333; }
.date_arrow { font-size: 20px; color: #ccc; }

// 结果
.result_card { text-align: center; }

.result_header {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 4px;
}

.result_age { font-size: 48px; font-weight: 800; color: #d81e06; }
.result_unit { font-size: 18px; color: #d81e06; font-weight: 600; }
.result_sub { font-size: 13px; color: #999; margin-bottom: 16px; }

.info_grid {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid #f5f5f5;
}

.info_item { text-align: center; }
.info_num { font-size: 18px; font-weight: 700; color: #333; margin-bottom: 4px; }
.info_label { font-size: 11px; color: #999; }

// 星座生肖
.extra_grid {
  display: flex;
  justify-content: space-around;
}

.extra_item { text-align: center; }
.extra_icon { font-size: 28px; margin-bottom: 6px; }
.extra_label { font-size: 11px; color: #999; margin-bottom: 2px; }
.extra_val { font-size: 13px; font-weight: 600; color: #333; }

// 趣味数据
.fun_row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f8f8f8;
  &:last-child { border-bottom: none; }
}

.fun_label { font-size: 13px; color: #666; }
.fun_val { font-size: 13px; color: #333; font-weight: 500; }
</style>
