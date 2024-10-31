<template>
  <view class="main">
    <view class="path">
      <!-- <view class="logo" src="./static/vue-logo.png" /> -->
      <view class="avatar">
        <view class="circle">南</view>
      </view>
      <view class="avatar">
        <view class="circle">玖</view>
      </view>
      <view class="avatar">
        <view class="circle">欢</view>
      </view>
      <view class="avatar">
        <view class="circle">迎</view>
      </view>
      <view class="avatar">
        <view class="circle">你</view>
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
</script>

<style lang="scss">
  .main {
    width: 100%;
    height: 529px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .path {
    width: 300px;
    height: 300px;
    border-radius: 50%;
    margin: 100px auto;
    position: relative;
    display: flex;
    border: 2px solid #fa6318;
  }
  .logo {
    width: 52px;
    margin: auto;
    background: #FFF;
  }
  .avatar {
    width: 50px;
    position: absolute;
    top: 124px; left: 124px;
    animation: circular-smooth-spin 7.5s infinite linear;
    animation-play-state: running;
  }
  .circle {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 1px solid #b4a078;
    font-size: 20px;
    font-weight: 500;
  }
  .avatar:nth-of-type(2){
    animation-delay: -1.5s;
  }

  .avatar:nth-of-type(3){
    animation-delay: -3s;
  }

  .avatar:nth-of-type(4){
    animation-delay: -4.5s;
  }

  .avatar:nth-of-type(5){
    animation-delay: -6s;
  }
  @keyframes circular-smooth-spin {
    from {
      transform: rotate(0turn) translateY(-124px) rotate(1turn)
    }
    to {
      opacity: 1;
      transform: rotate(1turn) translateY(-124px) rotate(0turn)
    }
  }
</style>
