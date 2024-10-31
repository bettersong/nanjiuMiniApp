<template>
  <view class="index_container">
    <view class="top_head">
      <view class="top_head_title" :style="{
        height: titleBarHeight + 'px',
        paddingTop: titleTop + 'px',
        paddingLeft: '16px',
      }">前端南玖</view>
    </view>
    <view class="index_center">
      <!-- 签到 -->
       <sign />
       <view class="center_container">
          <banner />
          <view class="center_item">
            <view class="center_item_left">
              <view class="left_text">Hi~ 欢迎访问前端南玖～</view>
              <image mode="widthFix" src="../../assets/images/logo-nj.png"  />
            </view>
            <view class="center_item_right">
              <view class="right_child" v-for="item in list" :key="item.id">
                {{ item.text }}
              </view>
             </view>
          </view>
       </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { onMounted, ref } from 'vue'
import { getTitleBarHeight } from '../../utils/index'
import sign from './components/sign.vue';
import banner from './components/banner.vue';
import { useShareAppMessage } from '@tarojs/taro';

const { titleBarHeight, titleTop } = getTitleBarHeight()
console.log('titleHeight', titleBarHeight)

const list = ref([
  {id: 1, text: '资讯'},
  {id: 2, text: '工具'},
  {id: 3, text: '留言'},
  {id: 4, text: '关于'},
])

useShareAppMessage(() => {
  return {
    title: '前端南玖',
    path: '/pages/index/index',
    imageUrl: 'https://images.pexels.com/photos/1193879/pexels-photo-1193879.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
})

</script>
