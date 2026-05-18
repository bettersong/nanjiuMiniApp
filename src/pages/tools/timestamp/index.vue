<template>
  <view class="page">
    <!-- 当前时间 -->
    <view class="card">
      <view class="card_title">🕐 当前时间</view>
      <view class="current_ts">{{ currentTs }}</view>
      <view class="current_date">{{ currentDate }}</view>
      <view class="btn_row">
        <view class="btn btn_primary" @tap="copyText(String(currentTs))">复制时间戳</view>
        <view class="btn btn_ghost" @tap="refreshTime">刷新</view>
      </view>
    </view>

    <!-- 时间戳 → 日期 -->
    <view class="card">
      <view class="card_title">⏱ 时间戳 → 日期</view>
      <view class="input_row">
        <input
          class="input"
          type="number"
          v-model="tsInput"
          placeholder="输入时间戳（秒或毫秒）"
          @input="tsToDate"
        />
        <view class="btn btn_sm btn_primary" @tap="tsInput = String(currentTs); tsToDate()">now</view>
      </view>
      <view class="result_box" v-if="tsResult">
        <view class="result_row">
          <text class="result_label">本地时间</text>
          <text class="result_val selectable">{{ tsResult.local }}</text>
        </view>
        <view class="result_row">
          <text class="result_label">UTC 时间</text>
          <text class="result_val selectable">{{ tsResult.utc }}</text>
        </view>
        <view class="result_row">
          <text class="result_label">星期</text>
          <text class="result_val">{{ tsResult.week }}</text>
        </view>
        <view class="btn btn_primary" style="margin-top:10px;" @tap="copyText(tsResult.local)">复制本地时间</view>
      </view>
      <view class="error_tip" v-if="tsError">{{ tsError }}</view>
    </view>

    <!-- 日期 → 时间戳 -->
    <view class="card">
      <view class="card_title">📅 日期 → 时间戳</view>
      <input
        class="input"
        type="text"
        v-model="dateInput"
        placeholder="如：2024-01-01 12:00:00"
        @input="dateToTs"
      />
      <view class="result_box" v-if="dateResult">
        <view class="result_row">
          <text class="result_label">秒级时间戳</text>
          <text class="result_val selectable">{{ dateResult.sec }}</text>
        </view>
        <view class="result_row">
          <text class="result_label">毫秒时间戳</text>
          <text class="result_val selectable">{{ dateResult.ms }}</text>
        </view>
        <view class="btn_row" style="margin-top:10px;">
          <view class="btn btn_primary" @tap="copyText(String(dateResult.sec))">复制秒级</view>
          <view class="btn btn_ghost" @tap="copyText(String(dateResult.ms))">复制毫秒</view>
        </view>
      </view>
      <view class="error_tip" v-if="dateError">{{ dateError }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Taro from '@tarojs/taro'

const WEEKS = ['日', '一', '二', '三', '四', '五', '六']

const fmt = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const fmtUTC = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`
}

// 当前时间
const currentTs = ref(Math.floor(Date.now() / 1000))
const currentDate = ref(fmt(new Date()))
let timer: ReturnType<typeof setInterval> | null = null

const refreshTime = () => {
  currentTs.value = Math.floor(Date.now() / 1000)
  currentDate.value = fmt(new Date())
}

onMounted(() => {
  timer = setInterval(refreshTime, 1000)
  // 统计工具使用次数
  const count = Taro.getStorageSync('nj_tools_used_count') || 0
  Taro.setStorageSync('nj_tools_used_count', count + 1)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 时间戳 → 日期
const tsInput = ref('')
const tsResult = ref<{ local: string; utc: string; week: string } | null>(null)
const tsError = ref('')

const tsToDate = () => {
  tsError.value = ''
  tsResult.value = null
  const raw = tsInput.value.trim()
  if (!raw) return
  let num = Number(raw)
  if (isNaN(num)) { tsError.value = '请输入有效数字'; return }
  // 自动判断秒级还是毫秒级
  if (String(Math.abs(num)).length <= 10) num = num * 1000
  const d = new Date(num)
  if (isNaN(d.getTime())) { tsError.value = '时间戳无效'; return }
  tsResult.value = {
    local: fmt(d),
    utc: fmtUTC(d),
    week: `星期${WEEKS[d.getDay()]}`,
  }
}

// 日期 → 时间戳
const dateInput = ref('')
const dateResult = ref<{ sec: number; ms: number } | null>(null)
const dateError = ref('')

const dateToTs = () => {
  dateError.value = ''
  dateResult.value = null
  const raw = dateInput.value.trim()
  if (!raw) return
  const d = new Date(raw.replace(/-/g, '/'))
  if (isNaN(d.getTime())) { dateError.value = '日期格式无效，建议 2024-01-01 12:00:00'; return }
  dateResult.value = {
    sec: Math.floor(d.getTime() / 1000),
    ms: d.getTime(),
  }
}

const copyText = (text: string) => {
  Taro.setClipboardData({
    data: text,
    success: () => Taro.showToast({ title: '已复制', icon: 'success' }),
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

.card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 16px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card_title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 14px;
}

.current_ts {
  font-size: 28px;
  font-weight: 700;
  color: #fda085;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.current_date {
  font-size: 13px;
  color: #999;
  margin-bottom: 14px;
}

.input_row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.input {
  flex: 1;
  height: 40px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
  border: 1px solid #eee;
  &:focus {
    border-color: #fda085;
  }
}

.result_box {
  background: #fafafa;
  border-radius: 10px;
  padding: 12px;
  margin-top: 4px;
}

.result_row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  &:last-of-type { margin-bottom: 0; }
}

.result_label {
  font-size: 12px;
  color: #aaa;
  width: 80px;
  flex-shrink: 0;
}

.result_val {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  word-break: break-all;
}

.btn_row {
  display: flex;
  gap: 10px;
}

.btn {
  height: 36px;
  line-height: 36px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  padding: 0 16px;
  &:active { opacity: 0.75; }
}

.btn_primary {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #fff;
  font-weight: 600;
}

.btn_ghost {
  background: #f0f0f0;
  color: #666;
}

.btn_sm {
  padding: 0 10px;
  height: 36px;
  line-height: 36px;
  font-size: 13px;
  flex-shrink: 0;
}

.error_tip {
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 8px;
}
</style>
