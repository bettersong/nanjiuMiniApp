<template>
  <view class="page">
    <!-- 开始页 -->
    <view v-if="stage === 'start'" class="start_view">
      <view class="start_card">
        <view class="start_icon">🧠</view>
        <view class="start_title">MBTI 性格测试</view>
        <view class="start_desc">16 道题快速测出你的性格类型</view>
        <view class="start_sub">约 2 分钟完成</view>
      </view>
      <view class="btn btn_primary" @tap="startTest">开始测试</view>
      <view class="intro_card">
        <view class="intro_title">什么是 MBTI？</view>
        <view class="intro_text">MBTI 将人的性格分为 16 种类型，基于四个维度：</view>
        <view class="intro_dims">
          <view class="dim_row">
            <view class="dim_left">E 外向</view>
            <view class="dim_vs">vs</view>
            <view class="dim_right">I 内向</view>
          </view>
          <view class="dim_row">
            <view class="dim_left">S 实感</view>
            <view class="dim_vs">vs</view>
            <view class="dim_right">N 直觉</view>
          </view>
          <view class="dim_row">
            <view class="dim_left">T 思考</view>
            <view class="dim_vs">vs</view>
            <view class="dim_right">F 情感</view>
          </view>
          <view class="dim_row">
            <view class="dim_left">J 判断</view>
            <view class="dim_vs">vs</view>
            <view class="dim_right">P 感知</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 答题页 -->
    <view v-if="stage === 'test'" class="test_view">
      <!-- 进度条 -->
      <view class="progress_bar">
        <view class="progress_fill" :style="{ width: progressPercent + '%' }"></view>
      </view>
      <view class="progress_text">{{ currentIdx + 1 }} / {{ questions.length }}</view>

      <!-- 题目 -->
      <view class="question_card">
        <view class="question_text">{{ questions[currentIdx].text }}</view>
      </view>

      <!-- 选项 -->
      <view class="options">
        <view class="option_btn option_a" @tap="answer('A')">
          <view class="option_label">A</view>
          <view class="option_text">{{ questions[currentIdx].optionA }}</view>
        </view>
        <view class="option_btn option_b" @tap="answer('B')">
          <view class="option_label">B</view>
          <view class="option_text">{{ questions[currentIdx].optionB }}</view>
        </view>
      </view>
    </view>

    <!-- 结果页 -->
    <view v-if="stage === 'result'" class="result_view">
      <view class="result_card">
        <view class="result_type">{{ resultType }}</view>
        <view class="result_name">{{ resultInfo.name }}</view>
        <view class="result_emoji">{{ resultInfo.emoji }}</view>
        <view class="result_desc">{{ resultInfo.desc }}</view>

        <view class="result_dims">
          <view class="rdim" v-for="dim in resultDims" :key="dim.result">
            <view class="rdim_header">
              <text class="rdim_left">{{ dim.leftLabel }}</text>
              <text class="rdim_right">{{ dim.rightLabel }}</text>
            </view>
            <view class="rdim_bar">
              <view class="rdim_fill" :style="{ width: dim.percent + '%' }"></view>
            </view>
            <view class="rdim_percent">{{ dim.percent }}% {{ dim.result }}</view>
          </view>
        </view>
      </view>

      <view class="result_traits">
        <view class="traits_title">性格特点</view>
        <view class="trait_item" v-for="trait in resultInfo.traits" :key="trait">• {{ trait }}</view>
      </view>

      <view class="btn_row">
        <view class="btn btn_primary" @tap="restart">重新测试</view>
        <view class="btn btn_ghost" @tap="copyResult">复制结果</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Taro, { useShareAppMessage } from '@tarojs/taro'

type Stage = 'start' | 'test' | 'result'

interface Question {
  text: string
  optionA: string
  optionB: string
  dimension: 'EI' | 'SN' | 'TF' | 'JP'
  // A 选项对应的字母
  aType: string
}

const stage = ref<Stage>('start')
const currentIdx = ref(0)
const answers = ref<string[]>([])
const resultType = ref('')

const questions: Question[] = [
  // E/I 维度 (4题)
  { text: '在社交聚会中，你通常会？', optionA: '主动和不认识的人聊天', optionB: '待在熟悉的朋友身边', dimension: 'EI', aType: 'E' },
  { text: '周末休息时，你更愿意？', optionA: '约朋友出去玩', optionB: '一个人待在家里', dimension: 'EI', aType: 'E' },
  { text: '工作中你更喜欢？', optionA: '团队协作讨论', optionB: '独立思考完成', dimension: 'EI', aType: 'E' },
  { text: '充电方式通常是？', optionA: '和朋友聊天倾诉', optionB: '独处安静思考', dimension: 'EI', aType: 'E' },

  // S/N 维度 (4题)
  { text: '你更关注？', optionA: '当下具体的事实和细节', optionB: '未来的可能性和趋势', dimension: 'SN', aType: 'S' },
  { text: '学习新东西时，你倾向于？', optionA: '按步骤实践操作', optionB: '先理解整体框架和原理', dimension: 'SN', aType: 'S' },
  { text: '解决问题时，你更依赖？', optionA: '过去的经验和已验证的方法', optionB: '创新思路和直觉灵感', dimension: 'SN', aType: 'S' },
  { text: '描述一件事时，你更常？', optionA: '说具体的细节和数据', optionB: '用比喻和抽象概念', dimension: 'SN', aType: 'S' },

  // T/F 维度 (4题)
  { text: '做决定时，你更看重？', optionA: '逻辑分析和客观事实', optionB: '个人价值观和他人感受', dimension: 'TF', aType: 'T' },
  { text: '朋友遇到困难向你倾诉，你会？', optionA: '帮他分析问题给出建议', optionB: '先倾听和安慰他的感受', dimension: 'TF', aType: 'T' },
  { text: '你认为更重要的是？', optionA: '公平和真相', optionB: '和谐和体谅', dimension: 'TF', aType: 'T' },
  { text: '面对批评，你通常？', optionA: '理性思考是否合理', optionB: '容易感到受伤', dimension: 'TF', aType: 'T' },

  // J/P 维度 (4题)
  { text: '对于计划和安排，你更倾向？', optionA: '提前规划好每个步骤', optionB: '灵活应变随机而动', dimension: 'JP', aType: 'J' },
  { text: '你的工作桌面通常？', optionA: '整齐有序各归其位', optionB: '有些凌乱但我能找到东西', dimension: 'JP', aType: 'J' },
  { text: '做项目时你更习惯？', optionA: '设定截止日期并按时完成', optionB: '在最后期限前突击完成', dimension: 'JP', aType: 'J' },
  { text: '旅行时你更喜欢？', optionA: '详细的行程计划', optionB: '走到哪算哪随性探索', dimension: 'JP', aType: 'J' },
]

const progressPercent = computed(() => ((currentIdx.value) / questions.length) * 100)

const startTest = () => {
  stage.value = 'test'
  currentIdx.value = 0
  answers.value = []
}

const answer = (choice: 'A' | 'B') => {
  answers.value.push(choice)

  if (currentIdx.value < questions.length - 1) {
    currentIdx.value++
  } else {
    calculateResult()
  }
}

// 计算结果
const scores = ref({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 })

const calculateResult = () => {
  const s = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }

  answers.value.forEach((choice, idx) => {
    const q = questions[idx]
    if (choice === 'A') {
      s[q.aType as keyof typeof s]++
    } else {
      // B 是对立面
      const opposite: Record<string, string> = { E: 'I', I: 'E', S: 'N', N: 'S', T: 'F', F: 'T', J: 'P', P: 'J' }
      s[opposite[q.aType] as keyof typeof s]++
    }
  })

  scores.value = s

  const type = [
    s.E >= s.I ? 'E' : 'I',
    s.S >= s.N ? 'S' : 'N',
    s.T >= s.F ? 'T' : 'F',
    s.J >= s.P ? 'J' : 'P',
  ].join('')

  resultType.value = type
  stage.value = 'result'
}

// 结果维度条
const resultDims = computed(() => {
  const s = scores.value
  return [
    { leftLabel: 'E 外向', rightLabel: 'I 内向', percent: Math.round((s.E / (s.E + s.I || 1)) * 100), result: s.E >= s.I ? 'E' : 'I' },
    { leftLabel: 'S 实感', rightLabel: 'N 直觉', percent: Math.round((s.S / (s.S + s.N || 1)) * 100), result: s.S >= s.N ? 'S' : 'N' },
    { leftLabel: 'T 思考', rightLabel: 'F 情感', percent: Math.round((s.T / (s.T + s.F || 1)) * 100), result: s.T >= s.F ? 'T' : 'F' },
    { leftLabel: 'J 判断', rightLabel: 'P 感知', percent: Math.round((s.J / (s.J + s.P || 1)) * 100), result: s.J >= s.P ? 'J' : 'P' },
  ]
})

// MBTI 16 种类型描述
const mbtiTypes: Record<string, { name: string; emoji: string; desc: string; traits: string[] }> = {
  INTJ: { name: '建筑师', emoji: '🏛️', desc: '富有想象力和战略性的思想家，一切皆在计划之中。', traits: ['独立自主', '追求高效', '战略眼光', '完美主义'] },
  INTP: { name: '逻辑学家', emoji: '🔬', desc: '具有创造力的发明家，对知识有着无尽的渴望。', traits: ['逻辑严谨', '好奇心强', '独立思考', '追求真理'] },
  ENTJ: { name: '指挥官', emoji: '👑', desc: '大胆而富有想象力的领导者，总能找到或创造解决办法。', traits: ['天生领袖', '果断决策', '高效执行', '目标导向'] },
  ENTP: { name: '辩论家', emoji: '⚡', desc: '聪明好奇的思想者，不会放弃任何智力挑战。', traits: ['思维敏捷', '善于辩论', '创新求变', '挑战权威'] },
  INFJ: { name: '提倡者', emoji: '🌟', desc: '安静而神秘，同时鼓舞人心且不知疲倦的理想主义者。', traits: ['洞察力强', '理想主义', '关怀他人', '坚持原则'] },
  INFP: { name: '调停者', emoji: '🦄', desc: '诗意、善良的利他主义者，总是热情地为正义事业提供帮助。', traits: ['富有同情', '创造力强', '追求意义', '忠于自我'] },
  ENFJ: { name: '主人公', emoji: '🎭', desc: '富有魅力和鼓舞人心的领导者，能够吸引听众。', traits: ['热情洋溢', '善于激励', '高度共情', '天生导师'] },
  ENFP: { name: '竞选者', emoji: '🎪', desc: '热情、有创造力且善于社交的自由精灵，总能找到微笑的理由。', traits: ['热情奔放', '想象力丰富', '善于交际', '乐观积极'] },
  ISTJ: { name: '物流师', emoji: '📋', desc: '实际且注重事实的人，其可靠性不容怀疑。', traits: ['责任心强', '认真踏实', '遵守规则', '值得信赖'] },
  ISFJ: { name: '守卫者', emoji: '🛡️', desc: '非常专注且温暖的守护者，时刻准备保护所爱之人。', traits: ['忠诚可靠', '细心体贴', '默默奉献', '重视传统'] },
  ESTJ: { name: '总经理', emoji: '📊', desc: '出色的管理者，在管理事物或人方面无与伦比。', traits: ['组织能力强', '务实果断', '坚持标准', '领导力强'] },
  ESFJ: { name: '执政官', emoji: '🤝', desc: '非常关心他人的人，善于社交且受欢迎，总是热心助人。', traits: ['热心助人', '善于合作', '注重和谐', '社交能力强'] },
  ISTP: { name: '鉴赏家', emoji: '🔧', desc: '大胆而实际的实验家，擅长使用各种形式的工具。', traits: ['动手能力强', '冷静理性', '灵活适应', '独立自主'] },
  ISFP: { name: '探险家', emoji: '🎨', desc: '灵活而有魅力的艺术家，随时准备探索和体验新事物。', traits: ['审美敏感', '温和友善', '活在当下', '追求自由'] },
  ESTP: { name: '企业家', emoji: '🚀', desc: '聪明、精力充沛且善于感知的人，真正享受生活在边缘。', traits: ['行动力强', '善于应变', '精力充沛', '务实大胆'] },
  ESFP: { name: '表演者', emoji: '🎉', desc: '自发的、精力充沛的表演者，生活在他们周围永远不会无聊。', traits: ['热爱生活', '感染力强', '慷慨大方', '享受当下'] },
}

const resultInfo = computed(() => {
  return mbtiTypes[resultType.value] || mbtiTypes['INTJ']
})

const restart = () => {
  stage.value = 'start'
  currentIdx.value = 0
  answers.value = []
  resultType.value = ''
}

const copyResult = () => {
  const info = resultInfo.value
  const text = `我的 MBTI 是 ${resultType.value}（${info.name} ${info.emoji}）\n${info.desc}\n性格特点：${info.traits.join('、')}`
  Taro.setClipboardData({
    data: text,
    success: () => Taro.showToast({ title: '已复制', icon: 'success' }),
  })
}

useShareAppMessage(() => {
  return {
    title: `我的 MBTI 是 ${resultType.value}（${resultInfo.value.name}），来测测你的！`,
    path: '/pages/fun/mbti/index',
  }
})
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 16px;
  box-sizing: border-box;
}

// 开始页
.start_view {
  padding-top: 20px;
}

.start_card {
  text-align: center;
  padding: 30px 20px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

.start_icon { font-size: 48px; margin-bottom: 12px; }
.start_title { font-size: 22px; font-weight: 700; color: #333; margin-bottom: 6px; }
.start_desc { font-size: 14px; color: #666; margin-bottom: 4px; }
.start_sub { font-size: 12px; color: #aaa; }

.intro_card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-top: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.intro_title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.intro_text {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.intro_dims {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dim_row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.dim_left {
  flex: 1;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: #f6a365;
}

.dim_vs {
  font-size: 11px;
  color: #ccc;
}

.dim_right {
  flex: 1;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #6c5ce7;
}

// 答题页
.test_view {
  padding-top: 10px;
}

.progress_bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin-bottom: 8px;
  overflow: hidden;
}

.progress_fill {
  height: 100%;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress_text {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-bottom: 24px;
}

.question_card {
  background: #fff;
  border-radius: 16px;
  padding: 24px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question_text {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  text-align: center;
  line-height: 1.6;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option_btn {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 14px;
  padding: 18px 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 2px solid transparent;
  &:active {
    border-color: #fda085;
    background: rgba(253, 160, 133, 0.05);
  }
}

.option_label {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  margin-right: 14px;
  flex-shrink: 0;
}

.option_a .option_label {
  background: rgba(246, 211, 101, 0.2);
  color: #f6a365;
}

.option_b .option_label {
  background: rgba(108, 92, 231, 0.1);
  color: #6c5ce7;
}

.option_text {
  font-size: 15px;
  color: #333;
  line-height: 1.5;
}

// 结果页
.result_view {
  padding-top: 10px;
}

.result_card {
  background: #fff;
  border-radius: 16px;
  padding: 24px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  text-align: center;
}

.result_type {
  font-size: 36px;
  font-weight: 800;
  color: #333;
  letter-spacing: 4px;
  margin-bottom: 4px;
}

.result_name {
  font-size: 16px;
  font-weight: 600;
  color: #fda085;
  margin-bottom: 8px;
}

.result_emoji {
  font-size: 40px;
  margin-bottom: 12px;
}

.result_desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.result_dims {
  text-align: left;
}

.rdim {
  margin-bottom: 12px;
  &:last-child { margin-bottom: 0; }
}

.rdim_header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.rdim_left, .rdim_right {
  font-size: 11px;
  color: #999;
}

.rdim_bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.rdim_fill {
  height: 100%;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-radius: 4px;
  transition: width 0.5s;
}

.rdim_percent {
  font-size: 11px;
  color: #fda085;
  font-weight: 600;
  margin-top: 2px;
}

.result_traits {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.traits_title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.trait_item {
  font-size: 14px;
  color: #666;
  line-height: 2;
}

// 按钮
.btn_row {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  height: 44px;
  line-height: 44px;
  border-radius: 12px;
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
  background: #fff;
  color: #666;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}
</style>
