<template>
  <view class="page">
    <!-- 模式切换 -->
    <view class="mode_switch">
      <view
        :class="['mode_btn', mode === 'encode' ? 'mode_active' : '']"
        @tap="switchMode('encode')"
      >编码 Encode</view>
      <view
        :class="['mode_btn', mode === 'decode' ? 'mode_active' : '']"
        @tap="switchMode('decode')"
      >解码 Decode</view>
    </view>

    <!-- 编码方式选择 -->
    <view class="card method_card">
      <view class="card_title">编码方式</view>
      <view class="method_options">
        <view
          :class="['method_btn', method === 'component' ? 'method_active' : '']"
          @tap="method = 'component'; process()"
        >
          <view class="method_name">encodeURIComponent</view>
          <view class="method_desc">编码所有特殊字符（推荐）</view>
        </view>
        <view
          :class="['method_btn', method === 'uri' ? 'method_active' : '']"
          @tap="method = 'uri'; process()"
        >
          <view class="method_name">encodeURI</view>
          <view class="method_desc">保留 :/?#[]@!$&'()*+,;= 等</view>
        </view>
      </view>
    </view>

    <!-- 输入区 -->
    <view class="card">
      <view class="label_row">
        <text class="label">{{ mode === 'encode' ? '原始文本' : '编码文本' }}</text>
        <text class="op_btn" @tap="pasteFromClipboard">粘贴</text>
      </view>
      <textarea
        class="textarea"
        v-model="input"
        :placeholder="mode === 'encode' ? '输入需要编码的文本或 URL...' : '输入需要解码的 URL 编码文本...'"
        @input="process"
      />
    </view>

    <!-- 操作按钮 -->
    <view class="btn_row">
      <view class="btn btn_primary" @tap="process">
        {{ mode === 'encode' ? '编码' : '解码' }}
      </view>
      <view class="btn btn_ghost" @tap="swapContent">⇅ 互换</view>
      <view class="btn btn_ghost" @tap="clearAll">清空</view>
    </view>

    <!-- 输出区 -->
    <view class="card" v-if="output || error">
      <view class="label_row">
        <text class="label">{{ error ? '❌ 错误' : '✅ 结果' }}</text>
        <text class="op_btn" v-if="!error" @tap="copyOutput">复制</text>
      </view>
      <view class="error_box" v-if="error">{{ error }}</view>
      <scroll-view v-else scroll-y class="output_scroll">
        <text class="output_text selectable">{{ output }}</text>
      </scroll-view>
    </view>

    <!-- 对比展示 -->
    <view class="card" v-if="output && !error && mode === 'encode'">
      <view class="card_title">🔍 两种方式对比</view>
      <view class="compare_row">
        <text class="compare_label">encodeURIComponent:</text>
        <text class="compare_val selectable">{{ encodeResult.component }}</text>
      </view>
      <view class="compare_row">
        <text class="compare_label">encodeURI:</text>
        <text class="compare_val selectable">{{ encodeResult.uri }}</text>
      </view>
      <view class="compare_note" v-if="encodeResult.component !== encodeResult.uri">
        💡 两者有差异！encodeURIComponent 额外编码了 URL 保留字符
      </view>
      <view class="compare_note" v-else>
        ✅ 当前文本两种方式结果一致
      </view>
    </view>

    <!-- 常用字符对照表 -->
    <view class="card">
      <view class="card_title">📋 常见编码对照</view>
      <view class="char_table">
        <view class="char_row char_header_row">
          <text class="char_col">字符</text>
          <text class="char_col">编码</text>
          <text class="char_col">说明</text>
        </view>
        <view class="char_row" v-for="item in charTable" :key="item.char">
          <text class="char_col char_val">{{ item.char }}</text>
          <text class="char_col char_code">{{ item.code }}</text>
          <text class="char_col char_desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Taro from '@tarojs/taro'

onMounted(() => {
  const count = Taro.getStorageSync('nj_tools_used_count') || 0
  Taro.setStorageSync('nj_tools_used_count', count + 1)
})

type Mode = 'encode' | 'decode'
type Method = 'component' | 'uri'

const mode = ref<Mode>('encode')
const method = ref<Method>('component')
const input = ref('')
const output = ref('')
const error = ref('')
const encodeResult = reactive({ component: '', uri: '' })

const process = () => {
  error.value = ''
  output.value = ''
  encodeResult.component = ''
  encodeResult.uri = ''

  const raw = input.value
  if (!raw) return

  try {
    if (mode.value === 'encode') {
      encodeResult.component = encodeURIComponent(raw)
      encodeResult.uri = encodeURI(raw)
      output.value = method.value === 'component' ? encodeResult.component : encodeResult.uri
    } else {
      // 解码：尝试两种方式
      try {
        output.value = decodeURIComponent(raw)
      } catch {
        output.value = decodeURI(raw)
      }
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
  process()
}

const clearAll = () => {
  input.value = ''
  output.value = ''
  error.value = ''
  encodeResult.component = ''
  encodeResult.uri = ''
}

const copyOutput = () => {
  Taro.setClipboardData({
    data: output.value,
    success: () => Taro.showToast({ title: '已复制', icon: 'success' }),
  })
}

const pasteFromClipboard = () => {
  Taro.getClipboardData({
    success: (res) => {
      input.value = res.data
      process()
    },
    fail: () => Taro.showToast({ title: '读取失败', icon: 'none' }),
  })
}

const charTable = [
  { char: '空格', code: '%20', desc: '空格符' },
  { char: '!', code: '%21', desc: '感叹号' },
  { char: '#', code: '%23', desc: '井号' },
  { char: '$', code: '%24', desc: '美元符' },
  { char: '&', code: '%26', desc: '与号' },
  { char: '+', code: '%2B', desc: '加号' },
  { char: '/', code: '%2F', desc: '斜杠' },
  { char: ':', code: '%3A', desc: '冒号' },
  { char: '=', code: '%3D', desc: '等号' },
  { char: '?', code: '%3F', desc: '问号' },
  { char: '@', code: '%40', desc: '@符号' },
  { char: '中', code: '%E4%B8%AD', desc: '中文字符' },
]
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
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.mode_btn {
  flex: 1;
  text-align: center;
  height: 44px;
  line-height: 44px;
  font-size: 14px;
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
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card_title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.method_card {
  .card_title { margin-bottom: 8px; }
}

.method_options {
  display: flex;
  gap: 10px;
}

.method_btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #eee;
  background: #fafafa;
  &:active { opacity: 0.8; }
}

.method_active {
  border-color: #fda085;
  background: rgba(253, 160, 133, 0.08);
}

.method_name {
  font-size: 11px;
  font-family: monospace;
  font-weight: 600;
  color: #333;
  margin-bottom: 3px;
}

.method_desc {
  font-size: 10px;
  color: #999;
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
  height: 120px;
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
  gap: 10px;
  margin-bottom: 12px;
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
  max-height: 160px;
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

// 对比
.compare_row {
  margin-bottom: 10px;
}

.compare_label {
  font-size: 11px;
  font-family: monospace;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.compare_val {
  font-size: 12px;
  font-family: monospace;
  color: #333;
  background: #f7f7f7;
  padding: 6px 8px;
  border-radius: 6px;
  display: block;
  word-break: break-all;
  line-height: 1.6;
}

.compare_note {
  font-size: 12px;
  color: #999;
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
}

// 字符对照表
.char_table {
  font-size: 12px;
}

.char_row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f8f8f8;
  &:last-child { border-bottom: none; }
}

.char_header_row {
  font-weight: 600;
  color: #999;
  border-bottom: 1px solid #eee;
}

.char_col {
  flex: 1;
  font-size: 12px;
}

.char_val {
  font-weight: 600;
  color: #333;
}

.char_code {
  font-family: monospace;
  color: #d81e06;
}

.char_desc {
  color: #999;
}
</style>
