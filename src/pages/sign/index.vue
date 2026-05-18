<template>
  <view class="index_container">
    <view class="top_title">
      <view class="index_title">ONE DAY ONE SIGN</view>
      <view class="index_subtitle">每日一签</view>
    </view>

    <view class="index_center">
      <image mode="widthFix" :src="seasonObj.bg" />
      <view class="index_time">
        <view class="index_year">{{ yearText }}</view>
        <view class="index_md">{{ md }}</view>
      </view>
      <view class="season_text">{{ seasonObj.text }}</view>
    </view>
    <view class="today_text">{{ randomText }}</view>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { onMounted, ref } from 'vue'
import Taro from '@tarojs/taro'
import type { Season } from './index.d'

const yearText = ref('')
const md = ref('')
const seasonObj = ref<Season>({})

const getTime = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  yearText.value = `${year}`
  md.value = `${month}/${day}`
}

const getSeason = () => {
  const date = new Date()
  const month = date.getMonth() + 1
  let season: Season = {}
  switch (month) {
    case 3:
    case 4:
    case 5:
      season = {
        text: '春',
        color: '#FFD700',
        enText: 'spring',
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
        bg: 'https://gitee.com/bettersong/imgs/raw/main/images/autumn.jpg'
      }
      break
    case 12:
    case 1:
    case 2:
      season = {
        text: '冬',
        color: '#4682B4',
        enText: 'winter',
        bg: 'https://gitee.com/bettersong/imgs/raw/main/images/winter.jpg'
      }
      break
  }
  seasonObj.value = season
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
    '锲而舍之，朽木不折；锲而不舍，金石可镂。',
    '自古逢秋悲寂寥，我言秋日胜春朝。',
    '书山有路勤为径，学海无涯苦作舟。',
    '海纳百川，有容乃大；壁立千仞，无欲则刚。',
    '会当凌绝顶，一览众山小。',
]

const randomText = textList[Math.floor(Math.random() * textList.length)]
onMounted(() => {
  getTime()
  getSeason()
  // 统计签到次数
  const count = Taro.getStorageSync('nj_sign_count') || 0
  Taro.setStorageSync('nj_sign_count', count + 1)
})
</script>
