<template>
  <view class="page">
    <!-- 操作栏 -->
    <view class="toolbar">
      <view
        :class="['tab', activeTab === 'format' ? 'tab_active' : '']"
        @tap="activeTab = 'format'"
      >格式化</view>
      <view
        :class="['tab', activeTab === 'compress' ? 'tab_active' : '']"
        @tap="activeTab = 'compress'"
      >压缩</view>
      <view
        :class="['tab', activeTab === 'escape' ? 'tab_active' : '']"
        @tap="activeTab = 'escape'"
      >转义</view>
      <view
        :class="['tab', activeTab === 'unescape' ? 'tab_active' : '']"
        @tap="activeTab = 'unescape'"
      >去转义</view>
    </view>

    <!-- 输入区 -->
    <view class="card">
      <view class="label_row">
        <text class="label">输入 JSON</text>
        <text class="clear_btn" @tap="clearAll">清空</text>
      </view>
      <textarea
        class="textarea"
        v-model="input"
        placeholder="在此粘贴或输入 JSON 内容..."
        :auto-height="false"
      />
    </view>

    <!-- 按钮 -->
    <view class="btn_row">
      <view class="btn btn_primary" @tap="process">执行</view>
      <view class="btn btn_ghost" @tap="pasteFromClipboard">粘贴</view>
    </view>

    <!-- 输出区 -->
    <view class="card" v-if="output || error">
      <view class="label_row">
        <text class="label">{{ error ? '❌ 错误' : '✅ 结果' }}</text>
        <text class="clear_btn" v-if="!error" @tap="copyOutput">复制</text>
      </view>
      <view class="error_box" v-if="error">{{ error }}</view>
      <scroll-view v-else scroll-y class="output_scroll">
        <text class="output_text selectable">{{ output }}</text>
      </scroll-view>
    </view>

    <!-- 统计信息 -->
    <view class="stats_row" v-if="stats">
      <text class="stat_item">字符: {{ stats.chars }}</text>
      <text class="stat_item">字节: {{ stats.bytes }}</text>
      <text class="stat_item">层级: {{ stats.depth }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'

onMounted(() => {
  // 统计工具使用次数
  const count = Taro.getStorageSync('nj_tools_used_count') || 0
  Taro.setStorageSync('nj_tools_used_count', count + 1)
})

type Tab = 'format' | 'compress' | 'escape' | 'unescape'

const activeTab = ref<Tab>('format')
const input = ref('')
const output = ref('')
const error = ref('')
const stats = ref<{ chars: number; bytes: number; depth: number } | null>(null)

const getDepth = (obj: any, d = 0): number => {
  if (typeof obj !== 'object' || obj === null) return d
  return Math.max(...Object.values(obj).map((v) => getDepth(v, d + 1)), d)
}

const process = () => {
  error.value = ''
  output.value = ''
  stats.value = null
  const raw = input.value.trim()
  if (!raw) { error.value = '请先输入内容'; return }

  try {
    if (activeTab.value === 'format') {
      const parsed = JSON.parse(raw)
      output.value = JSON.stringify(parsed, null, 2)
      stats.value = {
        chars: output.value.length,
        bytes: new TextEncoder().encode(output.value).length,
        depth: getDepth(parsed),
      }
    } else if (activeTab.value === 'compress') {
      const parsed = JSON.parse(raw)
      output.value = JSON.stringify(parsed)
      stats.value = {
        chars: output.value.length,
        bytes: new TextEncoder().encode(output.value).length,
        depth: getDepth(parsed),
      }
    } else if (activeTab.value === 'escape') {
      // 先校验是否合法 JSON
      JSON.parse(raw)
      output.value = raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
      stats.value = { chars: output.value.length, bytes: new TextEncoder().encode(output.value).length, depth: 0 }
    } else if (activeTab.value === 'unescape') {
      output.value = raw.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      JSON.parse(output.value) // 验证结果
      stats.value = { chars: output.value.length, bytes: new TextEncoder().encode(output.value).length, depth: 0 }
    }
  } catch (e: any) {
    error.value = `JSON 解析错误: ${e.message}`
  }
}

const clearAll = () => {
  input.value = ''
  output.value = ''
  error.value = ''
  stats.value = null
}

const copyOutput = () => {
  Taro.setClipboardData({
    data: output.value,
    success: () => Taro.showToast({ title: '已复制', icon: 'success' }),
  })
}

const pasteFromClipboard = () => {
  Taro.getClipboardData({
    success: (res) => { input.value = res.data },
    fail: () => Taro.showToast({ title: '读取剪贴板失败', icon: 'none' }),
  })
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 16px;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tab {
  flex: 1;
  text-align: center;
  height: 40px;
  line-height: 40px;
  font-size: 13px;
  color: #666;
  &:active { opacity: 0.8; }
}

.tab_active {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #fff;
  font-weight: 600;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.label_row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.clear_btn {
  font-size: 13px;
  color: #fda085;
  &:active { opacity: 0.7; }
}

.textarea {
  width: 100%;
  height: 180px;
  background: #f7f7f7;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  color: #333;
  box-sizing: border-box;
  font-family: monospace;
  line-height: 1.6;
  border: 1px solid #eee;
}

.btn_row {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.btn {
  flex: 1;
  height: 42px;
  line-height: 42px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  &:active { opacity: 0.75; }
}

.btn_primary {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #fff;
}

.btn_ghost {
  background: #f0f0f0;
  color: #666;
}

.error_box {
  background: #fff2f0;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #ff4d4f;
  line-height: 1.6;
  word-break: break-all;
}

.output_scroll {
  height: 200px;
  background: #f7f7f7;
  border-radius: 8px;
  padding: 10px;
  box-sizing: border-box;
}

.output_text {
  font-size: 12px;
  color: #333;
  font-family: monospace;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
}

.stats_row {
  display: flex;
  gap: 16px;
  padding: 0 4px;
}

.stat_item {
  font-size: 12px;
  color: #aaa;
}
</style>
