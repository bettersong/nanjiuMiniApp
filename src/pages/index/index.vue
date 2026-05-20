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

      <!-- 猜你想用 -->
      <view class="guess_card">
        <view class="guess_title">🎯 猜你想用</view>
        <view class="guess_list">
          <view
            class="guess_item"
            v-for="item in guessItems"
            :key="item.path"
            @tap="gotoTool(item.path)"
          >
            <view class="guess_icon">{{ item.icon }}</view>
            <view class="guess_name">{{ item.name }}</view>
          </view>
        </view>
      </view>

      <!-- 时钟 + 每日一言 -->
      <view class="clock_quote_card">
        <view class="clock_area">
          <view class="clock_time">
            <text class="clock_h">{{ clockH }}</text>
            <text class="clock_sep" :class="{ clock_sep_blink: clockBlink }">:</text>
            <text class="clock_m">{{ clockM }}</text>
            <text class="clock_sep" :class="{ clock_sep_blink: clockBlink }">:</text>
            <text class="clock_s">{{ clockS }}</text>
          </view>
          <view class="clock_meta">
            <text class="clock_week">{{ clockWeek }}</text>
            <text class="clock_dot">·</text>
            <text class="clock_progress">今年已过 {{ yearProgress }}%</text>
          </view>
        </view>
        <view class="clock_divider"></view>
        <view class="clock_quote">
          <text class="clock_quote_text">{{ dailyQuote }}</text>
        </view>
      </view>

      <!-- 工具箱 -->
      <view class="tools_card">
        <view class="tools_header">
          <view class="tools_title">🔧 实用工具</view>
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

      <!-- 趣味互动入口 -->
      <view class="fun_entry" @tap="gotoFun">
        <view class="fun_entry_left">
          <view class="fun_entry_icon">🎮</view>
          <view class="fun_entry_info">
            <view class="fun_entry_title">趣味互动</view>
            <view class="fun_entry_sub">2048 · MBTI · 转盘 · Flexbox · 打字</view>
          </view>
        </view>
        <view class="fun_entry_arrow">›</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getTitleBarHeight } from '../../utils/index'
import SignCard from './components/sign.vue'
import Taro, { useShareAppMessage } from '@tarojs/taro'

const { titleBottom } = getTitleBarHeight()

// ====== 问候语 ======
const getGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了 🌙'
  if (hour < 12) return '早上好 👋'
  if (hour < 14) return '中午好 ☀️'
  if (hour < 18) return '下午好 🌤'
  return '晚上好 🌙'
}
const greeting = ref(getGreeting())

// ====== 日期 ======
const dateText = computed(() => {
  const now = new Date()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const d = now.getDate()
  const w = weekDays[now.getDay()]
  return `${y}年${m}月${d}日 星期${w}`
})

// ====== 猜你想用（根据时间段推荐） ======
const guessItems = computed(() => {
  const hour = new Date().getHours()
  if (hour < 9) {
    // 早上：签到相关 + 轻松工具
    return [
      { icon: '📅', name: '签到', path: '/pages/sign/index' },
      { icon: '🧠', name: 'MBTI', path: '/pages/fun/mbti/index' },
      { icon: '⚖️', name: 'BMI', path: '/pages/tools/bmi/index' },
    ]
  } else if (hour < 12) {
    // 上午：开发工具
    return [
      { icon: '{ }', name: 'JSON', path: '/pages/tools/json/index' },
      { icon: '⏱', name: '时间戳', path: '/pages/tools/timestamp/index' },
      { icon: '🔍', name: '正则', path: '/pages/tools/regex/index' },
    ]
  } else if (hour < 14) {
    // 午休：休闲
    return [
      { icon: '🎲', name: '2048', path: '/pages/fun/game2048/index' },
      { icon: '🎡', name: '转盘', path: '/pages/fun/wheel/index' },
      { icon: '⌨️', name: '打字', path: '/pages/fun/typing/index' },
    ]
  } else if (hour < 18) {
    // 下午：工作工具
    return [
      { icon: '🎨', name: '颜色', path: '/pages/tools/color/index' },
      { icon: '✨', name: 'CSS', path: '/pages/tools/css/index' },
      { icon: '📝', name: 'Markdown', path: '/pages/tools/markdown/index' },
    ]
  } else {
    // 晚上：放松
    return [
      { icon: '🎲', name: '2048', path: '/pages/fun/game2048/index' },
      { icon: '🧠', name: 'MBTI', path: '/pages/fun/mbti/index' },
      { icon: '🎂', name: '年龄', path: '/pages/tools/age/index' },
    ]
  }
})

// ====== 极简时钟 ======
const clockH = ref('00')
const clockM = ref('00')
const clockS = ref('00')
const clockBlink = ref(true)
const clockWeek = ref('')
let clockTimer: ReturnType<typeof setInterval> | null = null

const updateClock = () => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  clockH.value = pad(now.getHours())
  clockM.value = pad(now.getMinutes())
  clockS.value = pad(now.getSeconds())
  clockBlink.value = now.getSeconds() % 2 === 0
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  clockWeek.value = weeks[now.getDay()]
}

const yearProgress = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const end = new Date(now.getFullYear() + 1, 0, 1)
  const progress = ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100
  return progress.toFixed(1)
})

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

// ====== 每日一言 ======
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

// ====== 工具箱 ======
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
