<template>
  <view class="page">
    <!-- 正则输入 -->
    <view class="card">
      <view class="card_title">🔍 正则表达式</view>
      <view class="regex_input_row">
        <text class="delimiter">/</text>
        <input
          class="input regex_input"
          type="text"
          v-model="pattern"
          placeholder="输入正则..."
          @input="test"
        />
        <text class="delimiter">/</text>
        <input
          class="input flag_input"
          type="text"
          v-model="flags"
          placeholder="flags"
          maxlength="5"
          @input="test"
        />
      </view>
      <view class="flag_tips">
        <text
          v-for="f in flagOptions"
          :key="f.flag"
          :class="['flag_badge', flags.includes(f.flag) ? 'flag_active' : '']"
          @tap="toggleFlag(f.flag)"
        >{{ f.flag }}: {{ f.desc }}</text>
      </view>
      <view class="error_tip" v-if="regexError">{{ regexError }}</view>
    </view>

    <!-- 测试文本 -->
    <view class="card">
      <view class="label_row">
        <text class="card_title">📝 测试文本</text>
        <text class="op_btn" @tap="clearTest">清空</text>
      </view>
      <textarea
        class="textarea"
        v-model="testText"
        placeholder="输入要测试的文本..."
        @input="test"
      />
    </view>

    <!-- 匹配结果 -->
    <view class="card" v-if="testText && pattern && !regexError">
      <view class="card_title">
        {{ matchResult.isMatch ? '✅ 匹配成功' : '❌ 未匹配' }}
        <text class="match_count" v-if="matchResult.isMatch">共 {{ matchResult.matches.length }} 处</text>
      </view>

      <view v-if="matchResult.isMatch">
        <view
          class="match_item"
          v-for="(m, idx) in matchResult.matches"
          :key="idx"
        >
          <view class="match_index">#{{ idx + 1 }}</view>
          <view class="match_content">
            <text class="match_text selectable">{{ m.value }}</text>
            <text class="match_pos">位置 {{ m.index }}–{{ m.index + m.value.length }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 常用正则 -->
    <view class="card">
      <view class="card_title">📋 常用正则</view>
      <view
        class="preset_item"
        v-for="p in presets"
        :key="p.name"
        @tap="applyPreset(p)"
      >
        <view class="preset_name">{{ p.name }}</view>
        <view class="preset_pattern">/{{ p.pattern }}/{{ p.flags }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Taro from '@tarojs/taro'

onMounted(() => {
  // 统计工具使用次数
  const count = Taro.getStorageSync('nj_tools_used_count') || 0
  Taro.setStorageSync('nj_tools_used_count', count + 1)
})

const pattern = ref('')
const flags = ref('g')
const testText = ref('')
const regexError = ref('')

const flagOptions = [
  { flag: 'g', desc: '全局' },
  { flag: 'i', desc: '忽略大小写' },
  { flag: 'm', desc: '多行' },
  { flag: 's', desc: '点匹配换行' },
]

const matchResult = reactive<{ isMatch: boolean; matches: { value: string; index: number }[] }>({
  isMatch: false,
  matches: [],
})

const test = () => {
  regexError.value = ''
  matchResult.isMatch = false
  matchResult.matches = []

  if (!pattern.value || !testText.value) return

  try {
    // 确保 g 标志存在以便 matchAll
    const f = flags.value.includes('g') ? flags.value : flags.value + 'g'
    const re = new RegExp(pattern.value, f)
    const hits = [...testText.value.matchAll(re)]
    if (hits.length > 0) {
      matchResult.isMatch = true
      matchResult.matches = hits.map((m) => ({ value: m[0], index: m.index ?? 0 }))
    }
  } catch (e: any) {
    regexError.value = `正则错误: ${e.message}`
  }
}

const toggleFlag = (f: string) => {
  if (flags.value.includes(f)) {
    flags.value = flags.value.replace(f, '')
  } else {
    flags.value += f
  }
  test()
}

const clearTest = () => {
  testText.value = ''
  matchResult.isMatch = false
  matchResult.matches = []
}

const presets = [
  { name: '手机号', pattern: '1[3-9]\\d{9}', flags: 'g' },
  { name: '邮箱', pattern: '[\\w.-]+@[\\w.-]+\\.\\w+', flags: 'gi' },
  { name: 'URL', pattern: 'https?://[\\w./?=#&%-]+', flags: 'gi' },
  { name: '身份证', pattern: '[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]', flags: 'g' },
  { name: 'IP 地址', pattern: '(\\d{1,3}\\.){3}\\d{1,3}', flags: 'g' },
  { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]+', flags: 'g' },
  { name: '数字', pattern: '-?\\d+(\\.\\d+)?', flags: 'g' },
  { name: '日期 (YYYY-MM-DD)', pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])', flags: 'g' },
]

const applyPreset = (p: { pattern: string; flags: string }) => {
  pattern.value = p.pattern
  flags.value = p.flags
  test()
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 16px;
  box-sizing: border-box;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card_title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.match_count {
  font-size: 12px;
  color: #fda085;
  font-weight: 400;
}

.label_row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.op_btn {
  font-size: 13px;
  color: #fda085;
  &:active { opacity: 0.7; }
}

.regex_input_row {
  display: flex;
  align-items: center;
  background: #f7f7f7;
  border-radius: 8px;
  border: 1px solid #eee;
  height: 42px;
  overflow: hidden;
  margin-bottom: 10px;
}

.delimiter {
  padding: 0 8px;
  font-size: 18px;
  color: #fda085;
  font-weight: 700;
  font-family: monospace;
}

.input {
  height: 42px;
  font-size: 14px;
  color: #333;
  font-family: monospace;
  background: transparent;
}

.regex_input {
  flex: 1;
}

.flag_input {
  width: 60px;
  text-align: center;
  font-size: 13px;
}

.flag_tips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.flag_badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  background: #f0f0f0;
  color: #888;
  &:active { opacity: 0.8; }
}

.flag_active {
  background: rgba(253, 160, 133, 0.2);
  color: #fda085;
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
  line-height: 1.6;
  border: 1px solid #eee;
}

.match_item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
  &:last-child { border-bottom: none; }
}

.match_index {
  font-size: 11px;
  color: #fff;
  background: linear-gradient(135deg, #f6d365, #fda085);
  border-radius: 4px;
  padding: 2px 6px;
  flex-shrink: 0;
  margin-top: 2px;
}

.match_content {
  flex: 1;
}

.match_text {
  font-size: 13px;
  color: #333;
  font-family: monospace;
  font-weight: 500;
  word-break: break-all;
  display: block;
}

.match_pos {
  font-size: 11px;
  color: #aaa;
  margin-top: 3px;
  display: block;
}

.preset_item {
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  &:last-child { border-bottom: none; }
  &:active { background: #fafafa; }
}

.preset_name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  font-weight: 500;
}

.preset_pattern {
  font-size: 11px;
  color: #aaa;
  font-family: monospace;
  word-break: break-all;
}

.error_tip {
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 8px;
}
</style>
