<template>
  <view class="stats_card">
    <view class="stats_item" @tap="$emit('tap-stat', 'sign')">
      <view class="stats_number">{{ stats.signInDays }}</view>
      <view class="stats_label">签到天数</view>
    </view>
    <view class="stats_divider"></view>
    <view class="stats_item" @tap="$emit('tap-stat', 'visit')">
      <view class="stats_number">{{ stats.visitDays }}</view>
      <view class="stats_label">访问天数</view>
    </view>
    <view class="stats_divider"></view>
    <view class="stats_item" @tap="$emit('tap-stat', 'tools')">
      <view class="stats_number">{{ stats.toolsUsed }}</view>
      <view class="stats_label">工具使用</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { UserStats } from '../index.d'

defineProps<{
  stats: UserStats
}>()

defineEmits<{
  'tap-stat': [key: string]
}>()
</script>

<style lang="scss">
.stats_card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: -20px 16px 0;
  padding: 20px 12px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 10;
}

.stats_item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  &:active {
    opacity: 0.7;
  }
}

.stats_number {
  font-size: 24px;
  font-weight: 700;
  color: #d81e06;
  margin-bottom: 4px;
}

.stats_label {
  font-size: 12px;
  color: #999;
}

.stats_divider {
  width: 1px;
  height: 30px;
  background: rgba(0, 0, 0, 0.06);
}
</style>
