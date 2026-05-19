<template>
  <view class="fun_container">
    <view class="fun_header">
      <view class="fun_header_title">🎮 趣味练习</view>
      <view class="fun_header_sub">寓教于乐，提升前端技能</view>
    </view>

    <view class="fun_grid">
      <view
        class="fun_card"
        v-for="item in funList"
        :key="item.path"
        @tap="navigate(item.path)"
      >
        <view class="fun_icon">{{ item.icon }}</view>
        <view class="fun_info">
          <view class="fun_name">{{ item.name }}</view>
          <view class="fun_desc">{{ item.desc }}</view>
        </view>
        <view class="fun_arrow">›</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'

const funList = [
  {
    icon: '⌨️',
    name: '打字练习',
    desc: '前端关键词打字速度测试',
    path: '/pages/fun/typing/index',
  },
  {
    icon: '🐸',
    name: 'Flexbox 闯关',
    desc: '像游戏一样学习 Flex 布局',
    path: '/pages/fun/flexbox/index',
  },
  {
    icon: '🎲',
    name: '2048',
    desc: '经典数字合并小游戏',
    path: '/pages/fun/game2048/index',
  },
  {
    icon: '🧠',
    name: 'MBTI 测试',
    desc: '16题快速测出你的性格类型',
    path: '/pages/fun/mbti/index',
  },
]

const navigate = (path: string) => {
  Taro.navigateTo({ url: path })
}
</script>

<style lang="scss">
.fun_container {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 20px 16px 40px;
  box-sizing: border-box;
}

.fun_header {
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-radius: 16px;
}

.fun_header_title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
}

.fun_header_sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.fun_grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fun_card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 14px;
  padding: 18px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  &:active {
    opacity: 0.75;
  }
}

.fun_icon {
  font-size: 32px;
  margin-right: 14px;
  line-height: 1;
}

.fun_info {
  flex: 1;
}

.fun_name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.fun_desc {
  font-size: 12px;
  color: #999;
}

.fun_arrow {
  font-size: 22px;
  color: #ccc;
  font-weight: 300;
}
</style>
