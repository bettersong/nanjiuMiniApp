<template>
  <view class="menu_card">
    <view
      v-for="(item, index) in items"
      :key="item.label"
      class="menu_item"
      :class="{ 'menu_item_last': index === items.length - 1 }"
      @tap="handleTap(item)"
    >
      <view class="menu_left">
        <view class="menu_icon">{{ item.icon }}</view>
        <view class="menu_text">
          <view class="menu_label">{{ item.label }}</view>
          <view v-if="item.desc" class="menu_desc">{{ item.desc }}</view>
        </view>
      </view>
      <view class="menu_arrow">›</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { MenuItem } from '../index.d'

defineProps<{
  items: MenuItem[]
}>()

const emit = defineEmits<{
  'tap-item': [item: MenuItem]
}>()

const handleTap = (item: MenuItem) => {
  emit('tap-item', item)
}
</script>

<style lang="scss">
.menu_card {
  margin: 16px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.menu_item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  &:active {
    background: rgba(0, 0, 0, 0.02);
  }
}

.menu_item_last {
  border-bottom: none;
}

.menu_left {
  display: flex;
  align-items: center;
}

.menu_icon {
  font-size: 22px;
  margin-right: 12px;
  line-height: 1;
}

.menu_text {
  display: flex;
  flex-direction: column;
}

.menu_label {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.menu_desc {
  font-size: 11px;
  color: #aaa;
  margin-top: 2px;
}

.menu_arrow {
  font-size: 20px;
  color: #ccc;
  font-weight: 300;
}
</style>
