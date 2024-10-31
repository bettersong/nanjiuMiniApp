<template>
  <swiper :autoplay="true" :circular="true" class="swiper_container">
    <swiper-item v-for="(item, index) in imgList" :key="index">
      <image  :src="item" class="swiper_img" />
    </swiper-item>
  </swiper>
</template>

<script setup lang="ts">
  const imgList = [
    'https://images.pexels.com/photos/1193879/pexels-photo-1193879.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    // 'https://images.pexels.com/photos/1532704/pexels-photo-1532704.jpeg?auto=compress&cs=tinysrgb&w=1000&h=400&dpr=2',
    'https://images.pexels.com/photos/5108764/pexels-photo-5108764.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/1548111/pexels-photo-1548111.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',

  ]
</script>

<style lang="scss">
.swiper_container {
  border-radius: 16px;
  width: 100%;
  height: 40vw;
  max-height: 400px;
}
.swiper_img {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  object-fit: cover;
}
</style>
