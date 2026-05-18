<template>
  <swiper
    :autoplay="true"
    :circular="true"
    :indicator-dots="true"
    indicator-color="rgba(255,255,255,0.4)"
    indicator-active-color="#fff"
    class="swiper_container"
  >
    <swiper-item v-for="(item, index) in imgList" :key="index">
      <image :src="item" class="swiper_img" mode="aspectFill" />
    </swiper-item>
  </swiper>
</template>

<script setup lang="ts">
const imgList = [
  'https://images.pexels.com/photos/1193879/pexels-photo-1193879.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/5108764/pexels-photo-5108764.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/1548111/pexels-photo-1548111.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
]
</script>

<style lang="scss">
.swiper_container {
  border-radius: 12px;
  width: 100%;
  height: 38vw;
  max-height: 360px;
  overflow: hidden;
}

.swiper_img {
  width: 100%;
  height: 100%;
  border-radius: 12px;
}
</style>
