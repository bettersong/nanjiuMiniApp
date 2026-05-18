<template>
  <view class="page">
    <!-- 模式切换 -->
    <view class="mode_switch">
      <view
        :class="['mode_btn', mode === 'encode' ? 'mode_active' : '']"
        @tap="switchMode('encode')"
      >🔒 编码</view>
      <view
        :class="['mode_btn', mode === 'decode' ? 'mode_active' : '']"
        @tap="switchMode('decode')"
      >🔓 解码</view>
    </view>

    <!-- 输入 -->
    <view class="card">
      <view class="label_row">
        <text class="label">{{ mode === 'encode' ? '原始文本' : 'Base64 字符串' }}</text>
        <text class="op_btn" @tap="pasteFromClipboard">粘贴</text>
      </view>
      <textarea
        class="textarea"
        v-model="input"
        :placeholder="mode === 'encode' ? '输入需要编码的文本...' : '输入 Base64 字符串...'"
      />
      <view class="char_count">{{ input.length }} 字符</view>
    </view>

    <!-- 操作按钮 -->
    <view class="btn_row">
      <view class="btn btn_primary" @tap="process">
        {{ mode === 'encode' ? '编码' : '解码' }}
      </view>
      <view class="btn btn_ghost" @tap="swapContent">⇅ 互换</view>
      <view class="btn btn_ghost" @tap="clearAll">清空</view>
    </view>

    <!-- 输出 -->
    <view class="card" v-if="output || error">
      <view class="label_row">
        <text class="label">{{ error ? '❌ 错误' : (mode === 'encode' ? 'Base64 结果' : '解码结果') }}</text>
        <text class="op_btn" v-if="!error" @tap="copyOutput">复制</text>
      </view>
      <view class="error_box" v-if="error">{{ error }}</view>
      <scroll-view v-else scroll-y class="output_scroll">
        <text class="output_text selectable">{{ output }}</text>
      </scroll-view>
      <view class="char_count" v-if="!error">{{ output.length }} 字符</view>
    </view>

    <!-- 说明 -->
    <view class="tips_card">
      <view class="tips_title">📖 说明</view>
      <view class="tips_item">• 支持中文、英文、符号编解码</view>
      <view class="tips_item">• 编码使用 UTF-8 字符集</view>
      <view class="tips_item">• 解码失败说明输入非标准 Base64</view>
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

type Mode = 'encode' | 'decode'
const mode = ref<Mode>('encode')
const input = ref('')
const output = ref('')
const error = ref('')

// 支持中文的 Base64 encode/decode
const b64Encode = (str: string): string => {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    ))
  } catch {
    // fallback: 纯 ASCII
    return btoa(str)
  }
}

const b64Decode = (str: string): string => {
  try {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(str), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  } catch {
    return atob(str)
  }
}

const process = () => {
  error.value = ''
  output.value = ''
  const raw = input.value.trim()
  if (!raw) { error.value = '请先输入内容'; return }
  try {
    if (mode.value === 'encode') {
      output.value = b64Encode(raw)
    } else {
      // 补齐 padding
      const padded = raw + '='.repeat((4 - (raw.length % 4)) % 4)
      output.value = b64Decode(padded)
    }
  } catch (e: any) {
    error.value = `处理失败: ${e.message}`
  }
}

const switchMode = (m: Mode) => {
  mode.value = m
  output.value = ''
  error.value = ''
}

const swapContent = () => {
  if (!output.value) return
  input.value = output.value
  output.value = ''
  error.value = ''
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
}

const clearAll = () => {
  input.value = ''
  output.value = ''
  error.value = ''
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
    fail: () => Taro.showToast({ title: '读取失败', icon: 'none' }),
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

.mode_switch {
  display: flex;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.mode_btn {
  flex: 1;
  text-align: center;
  height: 44px;
  line-height: 44px;
  font-size: 15px;
  color: #666;
  &:active { opacity: 0.8; }
}

.mode_active {
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

.op_btn {
  font-size: 13px;
  color: #fda085;
  &:active { opacity: 0.7; }
}

.textarea {
  width: 100%;
  height: 140px;
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

.char_count {
  font-size: 11px;
  color: #ccc;
  text-align: right;
  margin-top: 6px;
}

.btn_row {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.btn {
  flex: 1;
  height: 42px;
  line-height: 42px;
  border-radius: 10px;
  font-size: 14px;
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
}

.output_scroll {
  height: 140px;
  background: #f7f7f7;
  border-radius: 8px;
  padding: 10px;
  box-sizing: border-box;
}

.output_text {
  font-size: 13px;
  color: #333;
  font-family: monospace;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
}

.tips_card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.tips_title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.tips_item {
  font-size: 12px;
  color: #aaa;
  line-height: 2;
}
</style>
