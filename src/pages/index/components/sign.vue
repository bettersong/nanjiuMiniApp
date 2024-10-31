<template>
  <view class="sign_box">每日一签</view>
  <view class="sign_list">
    <view :class="{
      sign_item :true,
      sign_item_act: weekToDay==item.week
      }" v-for="item in signList" :key="item.week">
      <view class="sign_week">{{ item.week }}</view>
      <view class="sign_date">{{ item.date }}</view>
    </view>
    <view class="sign_item" @tap="gotoSign">
      <view class="sign_week">
        <image src="../../../assets/icons/sign.svg" />
      </view>
      <view class="sign_date">打卡</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { SignItemInfo } from '../../../types/index';
import Taro from '@tarojs/taro';



const signList = ref<SignItemInfo[]>([])
const weekToDay = ref('')

const generateSignList = () => {
  const date = new Date()
  // 根据当天的星期数生成七天的签到列表, 包含日期和星期
  const week = date.getDay()
  console.log('week', week)
  const weekList = ['日', '一', '二', '三', '四', '五', '六']
  const list: SignItemInfo[] = []
  if(week === 0) {
    for (let i = 0; i < 7; i++) {
      const day = new Date(date.getTime() + i * 24 * 60 * 60 * 1000)
      list.push({
        date: day.getDate().toString(),
        week: weekList[(week + i) % 7],
        sort: (week + i) % 7,
      })
    }
  }else {
    // 如果当天不是周日，则需分今天之前的日期和今天之后的日期
    let before = weekList.length - week + 1
    for (let i = 0; i < before; i++) {
      const day = new Date(date.getTime() - (before - i) * 24 * 60 * 60 * 1000)
      list.push({
        date: day.getDate().toString(),
        week: weekList[(week - before + i) % 7],
        sort: (week - before + i) % 7,
      })
    }
    for (let i = 0; i < weekList.length-before; i++) {
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
  console.log('signList', signList.value)
}

const gotoSign = () => {

  Taro.navigateTo({
    url: '/pages/sign/index'
  })
}

onMounted(() => {
  generateSignList()
})

</script>

<style lang="scss">
.sign_box {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
}
.sign_list {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.sign_item {
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  &:last-child {
    font-weight: 500;
  }
}
.sign_week {
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 2px;
  image {
    width: 24px;
    height: 24px;
  }
}
.sign_item_act {
  background: #ffffff;
  border-radius: 6px;
  .sign_week {
    color: #FDA085;
  }
}
.sign_date {
  font-size: 12px;
  font-weight: 500;
}
</style>
