<template>
  <view class="mine_container">
    <ProfileHeader
      :profile="userProfile"
      @edit-nickname="handleEditNickname"
    />
    <view class="mine_body">
      <StatsCard
        :stats="userStats"
        @tap-stat="handleStatTap"
      />
      <MenuList
        :items="menuItems"
        @tap-item="handleMenuTap"
      />
      <view class="mine_footer">
        <view class="footer_version">v1.0.0</view>
        <view class="footer_brand">Made with ❤️ by 前端南玖</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { ref } from 'vue'
import Taro, { useShareAppMessage, useDidShow } from '@tarojs/taro'
import ProfileHeader from './components/profile-header.vue'
import StatsCard from './components/stats-card.vue'
import MenuList from './components/menu-list.vue'
import type { UserProfile, UserStats, MenuItem } from './index.d'

// Storage keys
const STORAGE_KEYS = {
  profile: 'nj_user_profile',
  stats: 'nj_user_stats',
  signCount: 'nj_sign_count',
  toolsCount: 'nj_tools_used_count',
}

// 生成用户ID
const generateUserId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'NJ-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 默认数据
const defaultProfile: UserProfile = {
  nickname: '前端南玖',
  avatar: '',
  bio: '专注前端技术分享',
  userId: generateUserId(),
}

const defaultStats: UserStats = {
  signInDays: 0,
  visitDays: 0,
  toolsUsed: 0,
  lastVisitDate: '',
}

// 响应式数据
const userProfile = ref<UserProfile>(
  Taro.getStorageSync(STORAGE_KEYS.profile) || { ...defaultProfile }
)
const userStats = ref<UserStats>(
  Taro.getStorageSync(STORAGE_KEYS.stats) || { ...defaultStats }
)

// 如果是首次使用，保存默认 profile
if (!Taro.getStorageSync(STORAGE_KEYS.profile)) {
  Taro.setStorageSync(STORAGE_KEYS.profile, userProfile.value)
}

// 菜单项配置
const menuItems: MenuItem[] = [
  {
    icon: '📅',
    label: '我的签到',
    desc: '每日一签，坚持打卡',
    action: 'navigate',
    path: '/pages/sign/index',
  },
  {
    icon: '🔧',
    label: '我的工具箱',
    desc: '时间戳 · JSON · Base64 · 颜色 · 正则',
    action: 'navigate',
    path: '/pages/tools/index',
  },
  {
    icon: 'ℹ️',
    label: '关于南玖',
    desc: '了解更多',
    action: 'about',
  },
  {
    icon: '🗑',
    label: '清除缓存',
    desc: '清除本地数据',
    action: 'clear-cache',
  },
]

// 页面显示时更新统计
useDidShow(() => {
  const today = new Date().toISOString().slice(0, 10)
  const stats: UserStats = Taro.getStorageSync(STORAGE_KEYS.stats) || { ...defaultStats }

  // 更新访问天数
  if (stats.lastVisitDate !== today) {
    stats.visitDays++
    stats.lastVisitDate = today
  }

  // 读取签到和工具使用计数
  stats.signInDays = Taro.getStorageSync(STORAGE_KEYS.signCount) || 0
  stats.toolsUsed = Taro.getStorageSync(STORAGE_KEYS.toolsCount) || 0

  Taro.setStorageSync(STORAGE_KEYS.stats, stats)
  userStats.value = { ...stats }

  // 同步 profile（可能在其他地方修改了）
  const savedProfile = Taro.getStorageSync(STORAGE_KEYS.profile)
  if (savedProfile) {
    userProfile.value = savedProfile
  }
})

// 编辑昵称
const handleEditNickname = () => {
  Taro.showModal({
    title: '修改昵称',
    // @ts-ignore
    editable: true,
    placeholderText: '请输入新昵称',
    success: (res: any) => {
      if (res.confirm && res.content) {
        const newName = res.content.trim()
        if (newName) {
          userProfile.value.nickname = newName
          Taro.setStorageSync(STORAGE_KEYS.profile, userProfile.value)
          Taro.showToast({ title: '修改成功', icon: 'success' })
        }
      }
    }
  })
}

// 统计项点击
const handleStatTap = (key: string) => {
  switch (key) {
    case 'sign':
      Taro.navigateTo({ url: '/pages/sign/index' })
      break
    case 'tools':
      Taro.navigateTo({ url: '/pages/tools/index' })
      break
    default:
      break
  }
}

// 菜单项点击
const handleMenuTap = (item: MenuItem) => {
  switch (item.action) {
    case 'navigate':
      if (item.path) {
        Taro.navigateTo({ url: item.path })
      }
      break
    case 'about':
      Taro.showModal({
        title: '关于前端南玖',
        content: '前端南玖 v1.0.0\n\n一个专注前端技术分享的开发者工具小程序。\n\n包含开发者常用工具：时间戳转换、JSON格式化、Base64编解码、颜色转换、正则测试等。\n\n感谢您的使用！',
        showCancel: false,
        confirmText: '知道了'
      })
      break
    case 'clear-cache':
      Taro.showModal({
        title: '清除缓存',
        content: '确定要清除所有本地缓存数据吗？\n（包括签到记录、使用统计等）',
        confirmText: '确定清除',
        confirmColor: '#d81e06',
        success: (res) => {
          if (res.confirm) {
            Taro.clearStorageSync()
            // 重置数据
            userProfile.value = { ...defaultProfile }
            userStats.value = { ...defaultStats }
            Taro.setStorageSync(STORAGE_KEYS.profile, userProfile.value)
            Taro.showToast({ title: '缓存已清除', icon: 'success' })
          }
        }
      })
      break
  }
}

// 分享功能
useShareAppMessage(() => {
  return {
    title: '前端南玖 - 开发者工具箱',
    path: '/pages/index/index',
    imageUrl: 'https://images.pexels.com/photos/1193879/pexels-photo-1193879.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
})
</script>
