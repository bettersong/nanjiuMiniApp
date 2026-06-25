<template>
  <view class="sign_card">
    <view class="sign_header">
      <view class="sign_title">
        <view class="sign_title_text">📅 每日签到</view>
        <view class="sign_streak" v-if="signCount > 0">已签{{ signCount }}天</view>
      </view>
      <view class="sign_btn" @tap="gotoSign">打卡</view>
    </view>
    <view class="sign_days">
      <view
        v-for="item in signList"
        :key="item.week"
        :class="{
          sign_day: true,
          sign_day_active: item.signed,
          sign_day_today: weekToDay === item.week
        }"
      >
        <view class="sign_day_week">{{ item.week }}</view>
        <view class="sign_day_date">
          <text v-if="item.signed">✓</text>
          <text v-else>{{ item.date }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'

interface SignItemInfo {
  date: string
  week: string
  sort: number
  dateStr: string
  signed: boolean
}

const signList = ref<SignItemInfo[]>([])
const weekToDay = ref('')
const signCount = ref(0)

const formatDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const generateSignList = () => {
  const records: string[] = Taro.getStorageSync('nj_sign_records') || []
  const date = new Date()
  const week = date.getDay()
  const weekList = ['日', '一', '二', '三', '四', '五', '六']
  const list: SignItemInfo[] = []

  // 本周从周日开始生成7天
  for (let i = 0; i < 7; i++) {
    const day = new Date(date.getTime() + (i - week) * 86400000)
    const dateStr = formatDate(day)
    list.push({
      date: day.getDate().toString(),
      week: weekList[i],
      sort: i,
      dateStr,
      signed: records.includes(dateStr),
    })
  }

  signList.value = list
  weekToDay.value = weekList[week]
}

const gotoSign = () => {
  Taro.navigateTo({ url: '/pages/sign/index' })
}

onMounted(() => {
  generateSignList()
})

useDidShow(() => {
  generateSignList()
  signCount.value = Taro.getStorageSync('nj_sign_count') || 0
})
</script>

<style lang="scss">
.sign_card {
  background: #fff;
  border-radius: 16px;
  padding: 20px 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.sign_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sign_title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sign_title_text {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.sign_streak {
  font-size: 11px;
  color: #fda085;
  background: rgba(253, 160, 133, 0.12);
  padding: 2px 8px;
  border-radius: 10px;
}

.sign_btn {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  padding: 6px 16px;
  border-radius: 16px;
  &:active {
    opacity: 0.75;
  }
}

.sign_days {
  display: flex;
  justify-content: space-between;
}

.sign_day {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 0;
  width: 36px;
  border-radius: 8px;
}

.sign_day_active {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  .sign_day_week,
  .sign_day_date {
    color: #fff;
  }
}

.sign_day_today {
  border: 1px solid #fda085;
  box-sizing: border-box;
}

.sign_day_week {
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}

.sign_day_date {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
</style>
