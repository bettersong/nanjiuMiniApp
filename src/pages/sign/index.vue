<template>
  <view class="sign_page">
    <!-- 顶部标题 -->
    <view class="top_title">
      <view class="index_title">ONE DAY ONE SIGN</view>
      <view class="index_subtitle">每日一签</view>
    </view>

    <!-- 成长等级卡片 -->
    <view class="level_card">
      <view class="level_left">
        <view class="level_badge">Lv.{{ level }}</view>
        <view class="level_title_text">{{ levelTitle }}</view>
      </view>
      <view class="level_right">
        <view class="level_score_row">
          <text class="level_score_icon">✦</text>
          <text class="level_score">{{ totalScore }}</text>
          <text class="level_score_unit">积分</text>
        </view>
        <view class="level_progress_bar">
          <view class="level_progress_fill" :style="{ width: levelProgress + '%' }" />
        </view>
        <view class="level_progress_text">距 Lv.{{ level + 1 }} 还需 {{ nextLevelNeed }} 分</view>
      </view>
    </view>

    <!-- 季节意境卡片 -->
    <view class="season_card" :class="{ festival_mode: festival }">
      <image class="season_bg" mode="aspectFill" :src="seasonObj.bg" />
      <view class="season_mask" />
      <!-- 季节/节日色光晕 -->
      <view
        class="season_glow"
        :style="{ background: `radial-gradient(circle at 20% 80%, ${(festival ? festival.color : seasonObj.color)}55 0%, transparent 60%)` }"
      />

      <!-- 飘落元素 -->
      <view class="season_particles">
        <text
          v-for="p in particleList"
          :key="p.id"
          class="particle"
          :class="'particle_' + p.type"
          :style="{
            left: p.left + '%',
            fontSize: p.size + 'px',
            opacity: p.opacity,
            animationDelay: p.delay + 's',
            animationDuration: p.duration + 's',
          }"
        >{{ festival ? festival.particle : seasonObj.particle }}</text>
      </view>

      <!-- 节日祝福横幅 -->
      <view class="festival_banner" v-if="festival">
        <text class="festival_banner_icon">{{ festival.icon }}</text>
        <text class="festival_banner_text">{{ festival.greeting }}</text>
      </view>

      <!-- 顶部徽章（节日 / 季节） -->
      <view class="season_badge" :class="{ badge_festival: festival }">
        <text class="badge_icon">{{ festival ? festival.icon : seasonObj.icon }}</text>
        <text class="badge_text">{{ festival ? festival.name : (seasonObj.text + ' · ' + seasonObj.en) }}</text>
      </view>

      <!-- 底部内容 -->
      <view class="season_bottom">
        <view class="season_left">
          <view class="season_word" :style="{ color: seasonObj.color }">{{ seasonObj.text }}</view>
          <view class="season_poem">{{ festival ? festival.greeting : seasonObj.poem }}</view>
        </view>
        <view class="season_date">
          <view class="date_md">{{ md }}</view>
          <view class="date_sub">{{ yearText }} · 星期{{ weekText }}</view>
        </view>
      </view>
    </view>

    <!-- 统计区 -->
    <view class="stat_row">
      <view class="stat_item">
        <view class="stat_num">{{ streak }}</view>
        <view class="stat_label">连续签到</view>
      </view>
      <view class="stat_divider" />
      <view class="stat_item">
        <view class="stat_num">{{ totalCount }}</view>
        <view class="stat_label">累计签到</view>
      </view>
      <view class="stat_divider" />
      <view class="stat_item">
        <view class="stat_num">{{ monthCount }}</view>
        <view class="stat_label">本月签到</view>
      </view>
    </view>

    <!-- 连续签到里程碑奖励 -->
    <view class="milestone_card">
      <view class="milestone_header">
        <view class="milestone_title">连签奖励</view>
        <view class="milestone_sub">连续签到领取更多积分</view>
      </view>
      <view class="milestone_track">
        <view class="milestone_line">
          <view class="milestone_line_fill" :style="{ width: milestoneProgress + '%' }" />
        </view>
        <view class="milestone_nodes">
          <view
            v-for="m in milestones"
            :key="m.day"
            class="milestone_node"
            :class="{ reached: streak >= m.day }"
          >
            <view class="milestone_dot">
              <text v-if="streak >= m.day">✓</text>
              <text v-else>{{ m.day }}</text>
            </view>
            <view class="milestone_reward">+{{ m.reward }}</view>
            <view class="milestone_day">{{ m.day }}天</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 本周日历 -->
    <view class="week_calendar">
      <view class="calendar_title">本周打卡</view>
      <view class="calendar_days">
        <view
          v-for="item in weekList"
          :key="item.key"
          class="cal_day"
          :class="{ cal_signed: item.signed, cal_today: item.isToday }"
        >
          <view class="cal_week">{{ item.week }}</view>
          <view class="cal_dot">
            <text v-if="item.signed" class="cal_check">✓</text>
            <text v-else class="cal_date">{{ item.date }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 每日名言卡片 -->
    <view class="quote_card">
      <view class="quote_mark">"</view>
      <view class="quote_text">{{ randomText }}</view>
      <view class="quote_actions">
        <view class="quote_btn" @tap="changeQuote">🔄 换一句</view>
      </view>
    </view>

    <!-- 签到按钮 -->
    <view
      class="sign_main_btn"
      :class="{ signed: hasSignedToday }"
      @tap="doSign"
    >
      <text v-if="hasSignedToday">✓ 今日已签到</text>
      <text v-else>立即签到 +{{ todayReward }}</text>
    </view>
    <view class="sign_tip" v-if="hasSignedToday">明天记得再来哦～</view>

    <!-- 签到成功撒花动效 -->
    <view class="confetti_layer" v-if="showConfetti">
      <view
        v-for="(c, idx) in confettiList"
        :key="idx"
        class="confetti"
        :style="{
          left: c.left + '%',
          background: c.color,
          animationDelay: c.delay + 's',
          animationDuration: c.duration + 's',
        }"
      />
    </view>

    <!-- 签到成功弹窗 -->
    <view class="success_overlay" v-if="showSuccess" @tap="showSuccess = false">
      <view class="success_card">
        <view class="success_icon">🎉</view>
        <view class="success_title">签到成功</view>
        <view class="success_reward">
          <text class="reward_plus">+{{ lastReward }}</text>
          <text class="reward_unit">积分</text>
        </view>
        <view class="success_bonus" v-if="lastBonus > 0">连签奖励 +{{ lastBonus }}</view>
        <view class="success_streak">已连续签到 {{ streak }} 天</view>
        <view class="success_desc">{{ encourageText }}</view>
        <view class="success_btn" @tap.stop="showSuccess = false">好的</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { onMounted, ref, computed } from 'vue'
import Taro from '@tarojs/taro'
import type { Season } from './index.d'

const yearText = ref('')
const md = ref('')
const weekText = ref('')
const seasonObj = ref<Season>({})

// 节日彩蛋
interface Festival {
  name: string
  icon: string
  greeting: string
  color: string
  particle: string
}
const festival = ref<Festival | null>(null)

// 签到数据
const streak = ref(0)
const totalCount = ref(0)
const monthCount = ref(0)
const hasSignedToday = ref(false)
const showConfetti = ref(false)
const showSuccess = ref(false)
const encourageText = ref('')

// 积分 / 等级
const totalScore = ref(0)
const lastReward = ref(0)
const lastBonus = ref(0)
const BASE_REWARD = 10

// 等级体系：每 100 分升一级
const level = computed(() => Math.floor(totalScore.value / 100) + 1)
const levelProgress = computed(() => totalScore.value % 100)
const nextLevelNeed = computed(() => 100 - (totalScore.value % 100))
const levelTitles = ['萌新打卡员', '坚持小将', '自律达人', '签到能手', '打卡大师', '恒心传奇']
const levelTitle = computed(() => {
  const idx = Math.min(level.value - 1, levelTitles.length - 1)
  return levelTitles[idx]
})

// 连签里程碑
const milestones = [
  { day: 3, reward: 20 },
  { day: 7, reward: 50 },
  { day: 15, reward: 100 },
  { day: 30, reward: 200 },
]
const milestoneProgress = computed(() => {
  const maxDay = milestones[milestones.length - 1].day
  return Math.min(100, (streak.value / maxDay) * 100)
})

// 今日可得积分（基础 + 连签奖励预估）
const todayReward = computed(() => {
  const nextStreak = streak.value + (hasSignedToday.value ? 0 : 1)
  return BASE_REWARD + calcBonus(nextStreak)
})

// 计算连签奖励：命中里程碑当天给额外奖励
const calcBonus = (s: number) => {
  const hit = milestones.find((m) => m.day === s)
  return hit ? hit.reward : 0
}

// 本周日历
interface WeekItem {
  key: number
  week: string
  date: string
  dateStr: string
  signed: boolean
  isToday: boolean
}
const weekList = ref<WeekItem[]>([])

// 撒花
interface Confetti {
  left: number
  color: string
  delay: number
  duration: number
}
const confettiList = ref<Confetti[]>([])

const weekMap = ['日', '一', '二', '三', '四', '五', '六']

// 季节飘落元素
interface Particle {
  id: number
  left: number
  size: number
  delay: number
  duration: number
  type: number
  opacity: number
}
const particleList = ref<Particle[]>([])
const generateParticles = () => {
  const list: Particle[] = []
  for (let i = 0; i < 14; i++) {
    list.push({
      id: i,
      left: Math.random() * 100,
      size: 12 + Math.random() * 14,
      delay: Math.random() * 6,
      duration: 5 + Math.random() * 5,
      type: i % 3,
      opacity: 0.5 + Math.random() * 0.45,
    })
  }
  particleList.value = list
}

// 格式化日期为 YYYY-MM-DD
const formatDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getTime = () => {
  const date = new Date()
  yearText.value = `${date.getFullYear()}`
  md.value = `${date.getMonth() + 1}/${date.getDate()}`
  weekText.value = weekMap[date.getDay()]
}

const getSeason = () => {
  const month = new Date().getMonth() + 1
  let season: Season = {}
  switch (month) {
    case 3:
    case 4:
    case 5:
      season = {
        text: '春',
        color: '#FFD700',
        enText: 'spring',
        en: 'SPRING',
        icon: '🌸',
        poem: '春暖花开，万物生长',
        particle: '🌸',
        bg: 'https://gitee.com/bettersong/imgs/raw/main/images/spring.jpg'
      }
      break
    case 6:
    case 7:
    case 8:
      season = {
        text: '夏',
        color: '#FF6347',
        enText: 'summer',
        en: 'SUMMER',
        icon: '🌿',
        poem: '绿树成荫，蝉鸣阵阵',
        particle: '🌿',
        bg: 'https://gitee.com/bettersong/imgs/raw/main/images/summer.jpg'
      }
      break
    case 9:
    case 10:
    case 11:
      season = {
        text: '秋',
        color: '#FF4500',
        enText: 'autumn',
        en: 'AUTUMN',
        icon: '🍂',
        poem: '秋高气爽，落叶纷飞',
        particle: '🍂',
        bg: 'https://gitee.com/bettersong/imgs/raw/main/images/autumn.jpg'
      }
      break
    case 12:
    case 1:
    case 2:
      season = {
        text: '冬',
        color: '#87CEEB',
        enText: 'winter',
        en: 'WINTER',
        icon: '❄️',
        poem: '银装素裹，岁暮天寒',
        particle: '❄️',
        bg: 'https://gitee.com/bettersong/imgs/raw/main/images/winter.jpg'
      }
      break
  }
  seasonObj.value = season
}

// 固定公历节日（MM-DD）
const fixedFestivals: Record<string, Festival> = {
  '01-01': { name: '元旦', icon: '🎉', greeting: '元旦快乐，新年新气象！', color: '#FF6B6B', particle: '🎉' },
  '02-14': { name: '情人节', icon: '💝', greeting: '情人节快乐，愿你被爱包围～', color: '#FF6B9D', particle: '💝' },
  '03-08': { name: '妇女节', icon: '🌷', greeting: '女神节快乐，你最美！', color: '#FF8FB1', particle: '🌷' },
  '04-05': { name: '清明', icon: '🌿', greeting: '清明时节，慎终追远。', color: '#88C9A1', particle: '🌿' },
  '05-01': { name: '劳动节', icon: '💪', greeting: '劳动节快乐，辛苦啦！', color: '#FF7043', particle: '✨' },
  '06-01': { name: '儿童节', icon: '🎈', greeting: '儿童节快乐，永葆童心！', color: '#4ECDC4', particle: '🎈' },
  '10-01': { name: '国庆节', icon: '🇨🇳', greeting: '国庆快乐，祝祖国繁荣昌盛！', color: '#E63946', particle: '🎊' },
  '12-24': { name: '平安夜', icon: '🎄', greeting: '平安夜，愿你岁岁平安～', color: '#2A9D8F', particle: '🌟' },
  '12-25': { name: '圣诞节', icon: '🎅', greeting: '圣诞快乐，愿你有惊喜！', color: '#E63946', particle: '🎄' },
}

// 农历节日（公历 YYYY-MM-DD 查表，2025-2028）
const lunarFestivals: Record<string, Festival> = {
  // 春节
  '2025-01-29': { name: '春节', icon: '🧧', greeting: '新春快乐，万事如意！', color: '#E63946', particle: '🧧' },
  '2026-02-17': { name: '春节', icon: '🧧', greeting: '新春快乐，万事如意！', color: '#E63946', particle: '🧧' },
  '2027-02-06': { name: '春节', icon: '🧧', greeting: '新春快乐，万事如意！', color: '#E63946', particle: '🧧' },
  '2028-01-26': { name: '春节', icon: '🧧', greeting: '新春快乐，万事如意！', color: '#E63946', particle: '🧧' },
  // 元宵
  '2025-02-12': { name: '元宵节', icon: '🏮', greeting: '元宵安康，团团圆圆！', color: '#FF6B6B', particle: '🏮' },
  '2026-03-03': { name: '元宵节', icon: '🏮', greeting: '元宵安康，团团圆圆！', color: '#FF6B6B', particle: '🏮' },
  '2027-02-20': { name: '元宵节', icon: '🏮', greeting: '元宵安康，团团圆圆！', color: '#FF6B6B', particle: '🏮' },
  // 端午
  '2025-05-31': { name: '端午节', icon: '🐉', greeting: '端午安康，粽香满满！', color: '#52B788', particle: '🍃' },
  '2026-06-19': { name: '端午节', icon: '🐉', greeting: '端午安康，粽香满满！', color: '#52B788', particle: '🍃' },
  '2027-06-09': { name: '端午节', icon: '🐉', greeting: '端午安康，粽香满满！', color: '#52B788', particle: '🍃' },
  // 七夕
  '2025-08-29': { name: '七夕', icon: '💕', greeting: '七夕快乐，愿有情人终成眷属～', color: '#FF6B9D', particle: '💕' },
  '2026-08-19': { name: '七夕', icon: '💕', greeting: '七夕快乐，愿有情人终成眷属～', color: '#FF6B9D', particle: '💕' },
  '2027-08-08': { name: '七夕', icon: '💕', greeting: '七夕快乐，愿有情人终成眷属～', color: '#FF6B9D', particle: '💕' },
  // 中秋
  '2025-10-06': { name: '中秋节', icon: '🌕', greeting: '中秋快乐，花好月圆！', color: '#F4A261', particle: '🌕' },
  '2026-09-25': { name: '中秋节', icon: '🌕', greeting: '中秋快乐，花好月圆！', color: '#F4A261', particle: '🌕' },
  '2027-09-15': { name: '中秋节', icon: '🌕', greeting: '中秋快乐，花好月圆！', color: '#F4A261', particle: '🌕' },
}

// 检测今日节日
const checkFestival = () => {
  const date = new Date()
  const ymd = formatDate(date)
  const mmdd = ymd.slice(5)

  // 【测试开关】storage 设置 nj_festival_test 为节日名即可强制预览
  // 例：wx.setStorageSync('nj_festival_test', '春节')  关闭：wx.removeStorageSync('nj_festival_test')
  const testName = Taro.getStorageSync('nj_festival_test')
  if (testName) {
    const all = [...Object.values(lunarFestivals), ...Object.values(fixedFestivals)]
    const hit = all.find((f) => f.name === testName)
    if (hit) {
      festival.value = hit
      return
    }
  }

  // 1. 农历节日优先
  if (lunarFestivals[ymd]) {
    festival.value = lunarFestivals[ymd]
    return
  }
  // 2. 固定公历节日
  if (fixedFestivals[mmdd]) {
    festival.value = fixedFestivals[mmdd]
    return
  }
  // 3. 生日（用户在 storage 设置 nj_birthday，格式 MM-DD）
  const birthday = Taro.getStorageSync('nj_birthday')
  if (birthday && birthday === mmdd) {
    festival.value = {
      name: '生日',
      icon: '🎂',
      greeting: '生日快乐！愿你被世界温柔以待～',
      color: '#FF6B9D',
      particle: '🎂',
    }
    return
  }
  festival.value = null
}

const textList = [
  '不积跬步，无以至千里；不积小流，无以成江海。',
  '💡智者一切求自己，愚者一切求他人。',
  '🌱人生没有所谓的正确答案，只有不断探索，找到适合自己的路。',
  '天生我材必有用，千金散尽还复来。',
  '人生自古谁无死，留取丹心照汗青。',
  '古之立大事者，不惟有超世之才，亦必有坚忍不拔之志。',
  '谁将平地万堆雪，剪刻作此连天花。',
  '业精于勤，荒于嬉；行成于思，毁于随。',
  '老骥伏枥，志在千里；烈士暮年，壮心不已。',
  '谁言寸草心，报得三春晖。',
  '盛年不重来，一日难再晨。及时当勉励，岁月不待人。',
  '山重水复疑无路，柳暗花明又一村。',
  '野火烧不尽，春风吹又生。',
  '生活就像海洋，只有意志坚强的人，才能到达彼岸。',
  '落红不是无情物，化作春泥更护花。',
  '一日之计在于晨，一年之计在于春。',
  '青，取之于蓝而青于蓝；冰，水为之而寒于水。',
  '锲而舍之，朽木不折；锲而不舍，金石可镂。',
  '今天的努力，会让明天更美好。',
  '农夫方夏耘，安坐吾敢食。',
  '长风破浪会有时，直挂云帆济沧海。',
  '连雨不知春去，一晴方觉夏深。',
  '清江一曲抱村流，长夏江村事事幽。',
  '芳菲歇去何须恨，夏木阳阴正可人。',
  '生如夏花之绚烂，死如秋叶之静美。',
  '一寸光阴一寸金，寸金难买寸光阴。',
  '宝剑锋从磨砺出，梅花香自苦寒来。',
  '自古逢秋悲寂寥，我言秋日胜春朝。',
  '书山有路勤为径，学海无涯苦作舟。',
  '海纳百川，有容乃大；壁立千仞，无欲则刚。',
  '会当凌绝顶，一览众山小。',
]

const encourageList = [
  '坚持就是胜利，继续加油！',
  '你已经超越了昨天的自己！',
  '日积月累，终成大器！',
  '每一天的坚持都值得被记录！',
  '自律的人最酷，就是你！',
]

const randomText = ref(textList[Math.floor(Math.random() * textList.length)])

const changeQuote = () => {
  let next = randomText.value
  while (next === randomText.value && textList.length > 1) {
    next = textList[Math.floor(Math.random() * textList.length)]
  }
  randomText.value = next
}

// 生成本周日历
const generateWeek = (records: string[]) => {
  const today = new Date()
  const todayStr = formatDate(today)
  const day = today.getDay() // 0-6
  const list: WeekItem[] = []
  // 本周从周日开始
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getTime() + (i - day) * 86400000)
    const dateStr = formatDate(d)
    list.push({
      key: i,
      week: weekMap[i],
      date: String(d.getDate()),
      dateStr,
      signed: records.includes(dateStr),
      isToday: dateStr === todayStr,
    })
  }
  weekList.value = list
}

// 计算各项统计
const loadSignData = () => {
  const records: string[] = Taro.getStorageSync('nj_sign_records') || []
  const todayStr = formatDate(new Date())

  totalCount.value = records.length
  hasSignedToday.value = records.includes(todayStr)

  // 本月签到数
  const ym = todayStr.slice(0, 7)
  monthCount.value = records.filter((r) => r.startsWith(ym)).length

  // 连续签到天数
  streak.value = calcStreak(records)

  // 总积分
  totalScore.value = Taro.getStorageSync('nj_sign_score') || 0

  // 兼容首页旧字段
  Taro.setStorageSync('nj_sign_count', records.length)

  generateWeek(records)
}

// 计算连续签到
const calcStreak = (records: string[]) => {
  if (records.length === 0) return 0
  const set = new Set(records)
  const todayStr = formatDate(new Date())
  let count = 0
  let cursor = new Date()
  // 如果今天没签，从昨天开始算
  if (!set.has(todayStr)) {
    cursor = new Date(cursor.getTime() - 86400000)
  }
  while (set.has(formatDate(cursor))) {
    count++
    cursor = new Date(cursor.getTime() - 86400000)
  }
  return count
}

// 触发撒花
const launchConfetti = () => {
  const colors = ['#f6d365', '#fda085', '#FF6347', '#4ECDC4', '#FFD700', '#FF4500', '#85C1E9']
  const list: Confetti[] = []
  for (let i = 0; i < 30; i++) {
    list.push({
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1.5,
    })
  }
  confettiList.value = list
  showConfetti.value = true
  setTimeout(() => {
    showConfetti.value = false
  }, 3000)
}

// 执行签到
const doSign = () => {
  if (hasSignedToday.value) {
    Taro.showToast({ title: '今天已经签到啦', icon: 'none' })
    return
  }

  const records: string[] = Taro.getStorageSync('nj_sign_records') || []
  const todayStr = formatDate(new Date())
  records.push(todayStr)
  Taro.setStorageSync('nj_sign_records', records)

  // 计算本次积分：基础 + 连签里程碑奖励
  const newStreak = calcStreak(records)
  const bonus = calcBonus(newStreak)
  const reward = BASE_REWARD + bonus
  const newScore = (Taro.getStorageSync('nj_sign_score') || 0) + reward
  Taro.setStorageSync('nj_sign_score', newScore)
  lastReward.value = reward
  lastBonus.value = bonus

  // 震动反馈
  Taro.vibrateShort?.({ type: 'medium' } as any)

  // 重新加载数据
  loadSignData()

  // 动效
  launchConfetti()
  encourageText.value = encourageList[Math.floor(Math.random() * encourageList.length)]
  showSuccess.value = true
}

onMounted(() => {
  getTime()
  getSeason()
  checkFestival()
  generateParticles()
  loadSignData()
})
</script>
