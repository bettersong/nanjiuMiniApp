<template>
  <view class="tools_container">
    <view class="tools_header">
      <view class="tools_header_title">🔧 工具箱</view>
      <view class="tools_header_sub">常用开发工具，随时随地用</view>
    </view>

    <view class="tools_section" v-for="group in toolGroups" :key="group.title">
      <view class="section_title">{{ group.title }}</view>
      <view class="tools_grid">
        <view
          class="tool_card"
          v-for="tool in group.tools"
          :key="tool.path"
          @tap="navigate(tool.path)"
        >
          <view class="tool_icon">{{ tool.icon }}</view>
          <view class="tool_name">{{ tool.name }}</view>
          <view class="tool_desc">{{ tool.desc }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'

const toolGroups = [
  {
    title: '开发者工具',
    tools: [
      {
        icon: '⏱',
        name: '时间戳',
        desc: '时间戳与日期互转',
        path: '/pages/tools/timestamp/index',
      },
      {
        icon: '{ }',
        name: 'JSON',
        desc: '格式化与压缩',
        path: '/pages/tools/json/index',
      },
      {
        icon: '🔐',
        name: 'Base64',
        desc: '编码与解码',
        path: '/pages/tools/base64/index',
      },
      {
        icon: '🎨',
        name: '颜色转换',
        desc: 'HEX / RGB / HSL',
        path: '/pages/tools/color/index',
      },
      {
        icon: '🔍',
        name: '正则测试',
        desc: '正则表达式调试',
        path: '/pages/tools/regex/index',
      },
      {
        icon: '✨',
        name: 'CSS 片段',
        desc: '常用 CSS 效果',
        path: '/pages/tools/css/index',
      },
      {
        icon: '📝',
        name: 'Markdown',
        desc: '实时预览',
        path: '/pages/tools/markdown/index',
      },
      {
        icon: '📱',
        name: '二维码',
        desc: '生成二维码',
        path: '/pages/tools/qrcode/index',
      },
      {
        icon: '🌐',
        name: 'URL 编解码',
        desc: 'encode / decode',
        path: '/pages/tools/urlencode/index',
      },
    ],
  },
]

const navigate = (path: string) => {
  Taro.navigateTo({ url: path })
}
</script>

<style lang="scss">
.tools_container {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 20px 16px 40px;
  box-sizing: border-box;
}

.tools_header {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-radius: 16px;
}

.tools_header_title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
}

.tools_header_sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.tools_section {
  margin-bottom: 20px;
}

.section_title {
  font-size: 14px;
  font-weight: 600;
  color: #999;
  margin-bottom: 12px;
  padding-left: 4px;
}

.tools_grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.tool_card {
  background: #fff;
  border-radius: 14px;
  padding: 16px 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  &:active {
    opacity: 0.7;
  }
}

.tool_icon {
  font-size: 28px;
  margin-bottom: 8px;
  line-height: 1;
}

.tool_name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.tool_desc {
  font-size: 11px;
  color: #aaa;
  text-align: center;
}
</style>
