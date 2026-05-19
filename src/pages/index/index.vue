<template>
  <view class="index_container">
    <!-- 渐变头部 -->
    <view class="index_header" :style="{ paddingTop: titleBottom + 12 + 'px' }">
      <view class="header_content">
        <view class="header_greeting">{{ greeting }}</view>
        <view class="header_date">{{ dateText }}</view>
      </view>
    </view>

    <!-- 主体内容 -->
    <view class="index_body">
      <!-- 签到卡片 -->
      <SignCard />

      <!-- 轮播图 -->
      <view class="section_card">
        <Banner />
      </view>

      <!-- 每日一言 -->
      <view class="quote_card">
        <view class="quote_icon">💡</view>
        <view class="quote_content">
          <view class="quote_text">{{ dailyQuote }}</view>
          <view class="quote_label">每日一言</view>
        </view>
      </view>

      <!-- 工具箱 -->
      <view class="tools_card">
        <view class="tools_header">
          <view class="tools_title">🔧 开发工具箱</view>
          <view class="tools_more" @tap="gotoTools">全部 ›</view>
        </view>
        <view class="tools_grid">
          <view
            class="tool_item"
            v-for="tool in toolList"
            :key="tool.path"
            @tap="gotoTool(tool.path)"
          >
            <view class="tool_icon">{{ tool.icon }}</view>
            <view class="tool_name">{{ tool.name }}</view>
          </view>
        </view>
      </view>

      <!-- 趣味练习入口 -->
      <view class="fun_entry" @tap="gotoFun">
        <view class="fun_entry_left">
          <view class="fun_entry_icon">🎮</view>
          <view class="fun_entry_info">
            <view class="fun_entry_title">趣味练习</view>
            <view class="fun_entry_sub">打字练习 · Flexbox 闯关</view>
          </view>
        </view>
        <view class="fun_entry_arrow">›</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { ref, computed } from 'vue'
import { getTitleBarHeight } from '../../utils/index'
import SignCard from './components/sign.vue'
import Banner from './components/banner.vue'
import Taro, { useShareAppMessage } from '@tarojs/taro'

const { titleBottom } = getTitleBarHeight()

// 问候语（根据时间段）
const getGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了 🌙'
  if (hour < 12) return '早上好 👋'
  if (hour < 14) return '中午好 ☀️'
  if (hour < 18) return '下午好 🌤'
  return '晚上好 🌙'
}

const greeting = ref(getGreeting())

// 日期显示
const dateText = computed(() => {
  const now = new Date()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const d = now.getDate()
  const w = weekDays[now.getDay()]
  return `${y}年${m}月${d}日 星期${w}`
})

// 每日一言
const quoteList = [
  '不积跬步，无以至千里；不积小流，无以成江海。',
  '智者一切求自己，愚者一切求他人。',
  '人生没有所谓的正确答案，只有不断探索，找到适合自己的路。',
  '天生我材必有用，千金散尽还复来。',
  '古之立大事者，不惟有超世之才，亦必有坚忍不拔之志。',
  '业精于勤，荒于嬉；行成于思，毁于随。',
  '老骥伏枥，志在千里；烈士暮年，壮心不已。',
  '盛年不重来，一日难再晨。及时当勉励，岁月不待人。',
  '山重水复疑无路，柳暗花明又一村。',
  '生活就像海洋，只有意志坚强的人，才能到达彼岸。',
  '长风破浪会有时，直挂云帆济沧海。',
  '宝剑锋从磨砺出，梅花香自苦寒来。',
  '书山有路勤为径，学海无涯苦作舟。',
  '会当凌绝顶，一览众山小。',
  '今天的努力，会让明天更美好。',
  '一寸光阴一寸金，寸金难买寸光阴。',
]
const dailyQuote = quoteList[Math.floor(Math.random() * quoteList.length)]

// 工具箱列表
const toolList = [
  { icon: '⏱', name: '时间戳', path: '/pages/tools/timestamp/index' },
  { icon: '{ }', name: 'JSON', path: '/pages/tools/json/index' },
  { icon: '🔐', name: 'Base64', path: '/pages/tools/base64/index' },
  { icon: '🎨', name: '颜色', path: '/pages/tools/color/index' },
  { icon: '🔍', name: '正则', path: '/pages/tools/regex/index' },
]

const gotoTools = () => {
  Taro.navigateTo({ url: '/pages/tools/index' })
}

const gotoTool = (path: string) => {
  Taro.navigateTo({ url: path })
}

const gotoFun = () => {
  Taro.navigateTo({ url: '/pages/fun/index' })
}

// 分享
useShareAppMessage(() => {
  return {
    title: '前端南玖 - 开发者工具箱',
    path: '/pages/index/index',
    imageUrl: 'https://images.pexels.com/photos/1193879/pexels-photo-1193879.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
})
</script>
