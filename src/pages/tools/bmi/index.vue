<template>
  <view class="page">
    <!-- 输入区 -->
    <view class="card">
      <view class="card_title">📏 输入身体数据</view>
      <view class="input_group">
        <view class="input_item">
          <view class="input_label">身高</view>
          <view class="input_row">
            <input class="input" type="digit" v-model="height" placeholder="170" />
            <text class="input_unit">cm</text>
          </view>
        </view>
        <view class="input_item">
          <view class="input_label">体重</view>
          <view class="input_row">
            <input class="input" type="digit" v-model="weight" placeholder="65" />
            <text class="input_unit">kg</text>
          </view>
        </view>
      </view>
      <view class="btn btn_primary" @tap="calculate">计算 BMI</view>
    </view>

    <!-- 结果 -->
    <view class="card result_card" v-if="bmiResult">
      <view class="bmi_header">
        <view class="bmi_value">{{ bmiResult.bmi }}</view>
        <view :class="['bmi_category', bmiResult.categoryClass]">{{ bmiResult.category }}</view>
      </view>

      <!-- BMI 进度条 -->
      <view class="bmi_bar_wrap">
        <view class="bmi_bar">
          <view class="bmi_segment seg_thin"></view>
          <view class="bmi_segment seg_normal"></view>
          <view class="bmi_segment seg_over"></view>
          <view class="bmi_segment seg_fat"></view>
        </view>
        <view class="bmi_indicator" :style="{ left: indicatorLeft + '%' }">▼</view>
        <view class="bmi_labels">
          <text>偏瘦</text>
          <text>正常</text>
          <text>偏胖</text>
          <text>肥胖</text>
        </view>
      </view>

      <!-- 详细信息 -->
      <view class="detail_list">
        <view class="detail_row">
          <text class="detail_label">BMI 指数</text>
          <text class="detail_val">{{ bmiResult.bmi }}</text>
        </view>
        <view class="detail_row">
          <text class="detail_label">体重分类</text>
          <text :class="['detail_val', bmiResult.categoryClass]">{{ bmiResult.category }}</text>
        </view>
        <view class="detail_row">
          <text class="detail_label">正常体重范围</text>
          <text class="detail_val">{{ bmiResult.normalRange }}</text>
        </view>
        <view class="detail_row" v-if="bmiResult.suggestion">
          <text class="detail_label">建议</text>
          <text class="detail_val">{{ bmiResult.suggestion }}</text>
        </view>
      </view>
    </view>

    <!-- BMI 标准表 -->
    <view class="card">
      <view class="card_title">📋 BMI 分类标准（中国）</view>
      <view class="table">
        <view class="table_header">
          <text class="table_col">分类</text>
          <text class="table_col">BMI 范围</text>
        </view>
        <view class="table_row">
          <text class="table_col cat_thin">偏瘦</text>
          <text class="table_col">&lt; 18.5</text>
        </view>
        <view class="table_row">
          <text class="table_col cat_normal">正常</text>
          <text class="table_col">18.5 ~ 23.9</text>
        </view>
        <view class="table_row">
          <text class="table_col cat_over">偏胖</text>
          <text class="table_col">24.0 ~ 27.9</text>
        </view>
        <view class="table_row">
          <text class="table_col cat_fat">肥胖</text>
          <text class="table_col">≥ 28.0</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'

onMounted(() => {
  const count = Taro.getStorageSync('nj_tools_used_count') || 0
  Taro.setStorageSync('nj_tools_used_count', count + 1)
})

const height = ref('')
const weight = ref('')

interface BmiResult {
  bmi: string
  category: string
  categoryClass: string
  normalRange: string
  suggestion: string
}

const bmiResult = ref<BmiResult | null>(null)

const indicatorLeft = computed(() => {
  if (!bmiResult.value) return 0
  const bmi = parseFloat(bmiResult.value.bmi)
  // 映射 BMI 15~35 到 0%~100%
  const percent = ((bmi - 15) / 20) * 100
  return Math.max(2, Math.min(98, percent))
})

const calculate = () => {
  const h = parseFloat(height.value)
  const w = parseFloat(weight.value)

  if (!h || !w || h <= 0 || w <= 0) {
    Taro.showToast({ title: '请输入有效数据', icon: 'none' })
    return
  }

  const heightM = h / 100
  const bmi = w / (heightM * heightM)
  const bmiStr = bmi.toFixed(1)

  // 正常体重范围
  const minWeight = (18.5 * heightM * heightM).toFixed(1)
  const maxWeight = (23.9 * heightM * heightM).toFixed(1)
  const normalRange = `${minWeight} ~ ${maxWeight} kg`

  let category = ''
  let categoryClass = ''
  let suggestion = ''

  if (bmi < 18.5) {
    category = '偏瘦'
    categoryClass = 'cat_thin'
    suggestion = '建议适当增加营养摄入，加强锻炼'
  } else if (bmi < 24) {
    category = '正常'
    categoryClass = 'cat_normal'
    suggestion = '身材标准，继续保持健康生活方式'
  } else if (bmi < 28) {
    category = '偏胖'
    categoryClass = 'cat_over'
    suggestion = '建议控制饮食，增加有氧运动'
  } else {
    category = '肥胖'
    categoryClass = 'cat_fat'
    suggestion = '建议咨询医生，制定科学的减重计划'
  }

  bmiResult.value = { bmi: bmiStr, category, categoryClass, normalRange, suggestion }
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
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.card_title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 14px;
}

.input_group {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.input_item { flex: 1; }
.input_label { font-size: 12px; color: #999; margin-bottom: 6px; }

.input_row {
  display: flex;
  align-items: center;
  background: #f7f7f7;
  border-radius: 8px;
  border: 1px solid #eee;
  overflow: hidden;
}

.input {
  flex: 1;
  height: 42px;
  padding: 0 12px;
  font-size: 16px;
  color: #333;
}

.input_unit {
  padding: 0 12px;
  font-size: 13px;
  color: #999;
}

.btn {
  height: 44px;
  line-height: 44px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  &:active { opacity: 0.75; }
}

.btn_primary {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #fff;
}

// 结果
.result_card { text-align: center; }

.bmi_header {
  margin-bottom: 20px;
}

.bmi_value {
  font-size: 48px;
  font-weight: 800;
  color: #333;
}

.bmi_category {
  font-size: 16px;
  font-weight: 600;
  margin-top: 4px;
}

// BMI 条形图
.bmi_bar_wrap {
  position: relative;
  margin-bottom: 20px;
  padding: 0 4px;
}

.bmi_bar {
  display: flex;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
}

.bmi_segment { flex: 1; }
.seg_thin { background: #5dade2; }
.seg_normal { background: #27ae60; }
.seg_over { background: #f39c12; }
.seg_fat { background: #e74c3c; }

.bmi_indicator {
  position: absolute;
  top: -16px;
  transform: translateX(-50%);
  font-size: 14px;
  color: #333;
}

.bmi_labels {
  display: flex;
  justify-content: space-around;
  margin-top: 6px;
  font-size: 10px;
  color: #999;
}

// 详细信息
.detail_list {
  text-align: left;
  border-top: 1px solid #f5f5f5;
  padding-top: 12px;
}

.detail_row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #fafafa;
  &:last-child { border-bottom: none; }
}

.detail_label { font-size: 13px; color: #999; }
.detail_val { font-size: 13px; font-weight: 500; color: #333; }

// 分类颜色
.cat_thin { color: #5dade2; }
.cat_normal { color: #27ae60; }
.cat_over { color: #f39c12; }
.cat_fat { color: #e74c3c; }

// 表格
.table { font-size: 13px; }

.table_header {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  color: #666;
}

.table_row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #f8f8f8;
  &:last-child { border-bottom: none; }
}

.table_col {
  flex: 1;
  font-size: 13px;
  color: #333;
}
</style>
