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
          sign_day_active: weekToDay === item.week
        }"
      >
        <view class="sign_day_week">{{ item.week }}</view>
        <view class="sign_day_date">{{ item.date }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Taro from '@tarojs/taro'

interface SignItemInfo {
  date: string
  week: string
  sort: number
}

const signList = ref<SignItemInfo[]>([])
const weekToDay = ref('')
const signCount = ref(0)

const generateSignList = () => {
  const date = new Date()
  const week = date.getDay()
  const weekList = ['日', '一', '二', '三', '四', '五', '六']
  const list: SignItemInfo[] = []

  if (week === 0) {
    for (let i = 0; i < 7; i++) {
      const day = new Date(date.getTime() + i * 24 * 60 * 60 * 1000)
      list.push({
        date: day.getDate().toString(),
        week: weekList[(week + i) % 7],
        sort: (week + i) % 7,
      })
    }
  } else {
    let before = week
    for (let i = 0; i < before; i++) {
      const day = new Date(date.getTime() - (before - i) * 24 * 60 * 60 * 1000)
      list.push({
        date: day.getDate().toString(),
        week: weekList[(week - before + i) % 7],
        sort: (week - before + i) % 7,
      })
    }
    for (let i = 0; i < weekList.length - before; i++) {
      const day = new Date(date.getTime() + i * 24 * 60 * 60 * 1000)
      list.push({
        date: day.getDate().toString(),
        week: weekList[(week + i) % 7],
        sort: (week + i) % 7,
      })
    }
  }

  signList.value = list.sort((a, b) => a.sort - b.sort)
  weekToDay.value = weekList[week]
}

const gotoSign = () => {
  Taro.navigateTo({ url: '/pages/sign/index' })
}

onMounted(() => {
  generateSignList()
  signCount.value = Taro.getStorageSync('nj_sign_count') || 0
})
</script>

<style lang="scss">
.sign_card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
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
