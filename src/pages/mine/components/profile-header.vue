<template>
  <view class="profile_header" :style="{ paddingTop: titleBottom + 12 + 'px' }">
    <view class="profile_info">
      <view class="profile_avatar" @tap="$emit('edit-nickname')">
        <image v-if="profile.avatar" class="avatar_img" :src="profile.avatar" mode="aspectFill" />
        <view v-else class="avatar_placeholder">{{ profile.nickname.slice(0, 1) }}</view>
      </view>
      <view class="profile_detail">
        <view class="profile_nickname" @tap="$emit('edit-nickname')">
          {{ profile.nickname }}
          <view class="edit_icon">✏️</view>
        </view>
        <view class="profile_bio">{{ profile.bio }}</view>
        <view class="profile_id">ID: {{ profile.userId }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getTitleBarHeight } from '../../../utils/index'
import type { UserProfile } from '../index.d'

const { titleBottom } = getTitleBarHeight()

defineProps<{
  profile: UserProfile
}>()

defineEmits<{
  'edit-nickname': []
}>()
</script>

<style lang="scss">
.profile_header {
  width: 100%;
  padding-bottom: 40px;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-radius: 0 0 24px 24px;
}

.profile_info {
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.profile_avatar {
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar_img {
  width: 100%;
  height: 100%;
}

.avatar_placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.3);
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.profile_detail {
  margin-left: 16px;
  flex: 1;
}

.profile_nickname {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.edit_icon {
  margin-left: 6px;
  font-size: 14px;
  opacity: 0.8;
}

.profile_bio {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 6px;
}

.profile_id {
  display: inline-block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.25);
  padding: 2px 8px;
  border-radius: 10px;
}
</style>
