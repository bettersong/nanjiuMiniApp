<template>
  <view class="page">
    <!-- 顶部信息栏 -->
    <view class="header">
      <view class="score_display">
        <text class="score_label">分数</text>
        <text class="score_value">{{ score }}</text>
      </view>
      <view class="score_display">
        <text class="score_label">最高</text>
        <text class="score_value">{{ bestScore }}</text>
      </view>
    </view>

    <!-- 游戏画布 -->
    <canvas
      canvas-id="jumpCanvas"
      id="jumpCanvas"
      class="game_canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    />

    <!-- 引导提示 -->
    <view class="tips" v-if="!gameStarted && !gameOver">
      <view class="tips_text">👆 按住蓄力，松开跳跃</view>
      <view class="tips_sub">落在方块上得分，落到中心加倍！</view>
    </view>

    <!-- 游戏结束弹窗 -->
    <view class="overlay" v-if="gameOver">
      <view class="overlay_card">
        <view class="overlay_icon">😢</view>
        <view class="overlay_title">游戏结束</view>
        <view class="overlay_score">得分：{{ score }}</view>
        <view class="overlay_best" v-if="score >= bestScore">🎉 新纪录！</view>
        <view class="btn btn_primary" @tap="restartGame">再来一局</view>
      </view>
    </view>

    <!-- 蓄力指示器 -->
    <view class="power_bar_wrapper" v-if="isCharging">
      <view class="power_bar">
        <view class="power_fill" :style="{ width: powerPercent + '%' }" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Taro from '@tarojs/taro'

// 画布尺寸
const sysInfo = Taro.getSystemInfoSync()
const canvasWidth = ref(sysInfo.windowWidth)
const canvasHeight = ref(sysInfo.windowHeight - 80)

// 游戏状态
const score = ref(0)
const bestScore = ref(0)
const gameStarted = ref(false)
const gameOver = ref(false)
const isCharging = ref(false)
const powerPercent = ref(0)

// 游戏数据
let ctx: any = null
let animFrameId: any = null
let chargeTimer: any = null
let chargeStartTime = 0
let power = 0
const maxPower = 200

// 方块相关
interface Block {
  x: number
  y: number
  width: number
  height: number
  color: string
}

let blocks: Block[] = []
let playerX = 0
let playerY = 0
let playerSize = 20
let isJumping = false
let jumpProgress = 0
let jumpStartX = 0
let jumpStartY = 0
let jumpTargetX = 0
let jumpTargetY = 0
let jumpPower = 0
let cameraX = 0

// 颜色库
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
]

// 初始化游戏
const initGame = () => {
  score.value = 0
  gameStarted.value = false
  gameOver.value = false
  isCharging.value = false
  powerPercent.value = 0
  power = 0
  isJumping = false
  cameraX = 0

  // 加载最高分
  const saved = Taro.getStorageSync('jump_best_score')
  if (saved) bestScore.value = saved

  // 生成初始方块
  blocks = []
  const firstBlock: Block = {
    x: 60,
    y: canvasHeight.value - 200,
    width: 80,
    height: 30,
    color: colors[0],
  }
  blocks.push(firstBlock)

  // 玩家站在第一个方块上
  playerX = firstBlock.x + firstBlock.width / 2
  playerY = firstBlock.y - playerSize / 2

  // 生成后续方块
  for (let i = 0; i < 5; i++) {
    generateNextBlock()
  }

  draw()
}

// 生成下一个方块
const generateNextBlock = () => {
  const lastBlock = blocks[blocks.length - 1]
  const gap = 60 + Math.random() * 80
  const width = 50 + Math.random() * 50
  const yOffset = (Math.random() - 0.5) * 60

  const newBlock: Block = {
    x: lastBlock.x + lastBlock.width + gap,
    y: Math.max(100, Math.min(canvasHeight.value - 150, lastBlock.y + yOffset)),
    width,
    height: 30,
    color: colors[Math.floor(Math.random() * colors.length)],
  }
  blocks.push(newBlock)
}

// 绘制游戏画面
const draw = () => {
  if (!ctx) return

  const w = canvasWidth.value
  const h = canvasHeight.value

  // 清空画布
  ctx.setFillStyle('#f0f0f0')
  ctx.fillRect(0, 0, w, h)

  // 绘制背景网格
  ctx.setStrokeStyle('rgba(0,0,0,0.03)')
  ctx.setLineWidth(1)
  for (let i = 0; i < w; i += 30) {
    ctx.moveTo(i - (cameraX % 30), 0)
    ctx.lineTo(i - (cameraX % 30), h)
  }
  for (let i = 0; i < h; i += 30) {
    ctx.moveTo(0, i)
    ctx.lineTo(w, i)
  }
  ctx.stroke()

  // 绘制方块
  blocks.forEach((block) => {
    const drawX = block.x - cameraX
    if (drawX > -block.width && drawX < w + block.width) {
      // 方块阴影
      ctx.setFillStyle('rgba(0,0,0,0.1)')
      ctx.fillRect(drawX + 3, block.y + 3, block.width, block.height)
      // 方块主体
      ctx.setFillStyle(block.color)
      ctx.fillRect(drawX, block.y, block.width, block.height)
      // 方块高光
      ctx.setFillStyle('rgba(255,255,255,0.3)')
      ctx.fillRect(drawX, block.y, block.width, 8)
      // 中心标记
      ctx.setFillStyle('rgba(255,255,255,0.5)')
      const centerX = drawX + block.width / 2 - 3
      ctx.fillRect(centerX, block.y + 10, 6, 6)
    }
  })

  // 绘制小袋鼠
  const drawPlayerX = playerX - cameraX
  const squish = isCharging.value ? power / maxPower * 8 : 0
  const baseY = playerY // 脚底位置

  // 辅助函数：用 scale 模拟椭圆
  const drawEllipse = (cx: number, cy: number, rx: number, ry: number, color: string) => {
    ctx.save()
    ctx.setFillStyle(color)
    ctx.translate(cx, cy)
    ctx.scale(1, ry / rx)
    ctx.beginPath()
    ctx.arc(0, 0, rx, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // 身体
  const bodyH = 22 - squish
  const bodyW = 14 + squish * 0.5
  drawEllipse(drawPlayerX, baseY - bodyH / 2 - 4, bodyW / 2, bodyH / 2, '#C2885C')

  // 肚皮（浅色）
  drawEllipse(drawPlayerX, baseY - bodyH / 2 - 2, bodyW / 3, bodyH / 3, '#F5DEB3')

  // 头
  const headY = baseY - bodyH - 8 + squish
  ctx.setFillStyle('#C2885C')
  ctx.beginPath()
  ctx.arc(drawPlayerX, headY, 9, 0, Math.PI * 2)
  ctx.fill()

  // 耳朵
  drawEllipse(drawPlayerX - 6, headY - 10, 3, 6, '#A0704A')
  drawEllipse(drawPlayerX + 6, headY - 10, 3, 6, '#A0704A')
  // 耳朵内部
  drawEllipse(drawPlayerX - 6, headY - 10, 1.5, 3.5, '#F5DEB3')
  drawEllipse(drawPlayerX + 6, headY - 10, 1.5, 3.5, '#F5DEB3')

  // 眼睛
  ctx.setFillStyle('#333')
  ctx.beginPath()
  ctx.arc(drawPlayerX - 3, headY - 1, 1.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(drawPlayerX + 3, headY - 1, 1.5, 0, Math.PI * 2)
  ctx.fill()

  // 鼻子
  ctx.setFillStyle('#222')
  ctx.beginPath()
  ctx.arc(drawPlayerX, headY + 3, 1.5, 0, Math.PI * 2)
  ctx.fill()

  // 后腿（蓄力时弯曲更明显）
  const legBend = squish * 0.5
  drawEllipse(drawPlayerX - 5, baseY - 2 + legBend, 6, 3, '#A0704A')
  drawEllipse(drawPlayerX + 5, baseY - 2 + legBend, 6, 3, '#A0704A')

  // 尾巴
  ctx.setStrokeStyle('#A0704A')
  ctx.setLineWidth(3)
  ctx.setLineCap('round')
  ctx.beginPath()
  ctx.moveTo(drawPlayerX - 6, baseY - bodyH / 2)
  ctx.quadraticCurveTo(drawPlayerX - 18, baseY - bodyH / 2 - 5, drawPlayerX - 14, baseY - 4)
  ctx.stroke()

  // 蓄力时画弧线预测
  if (isCharging.value && power > 10) {
    ctx.setStrokeStyle('rgba(255, 100, 100, 0.4)')
    ctx.setLineWidth(2)
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    const previewDist = power * 1.8
    for (let t = 0; t <= 1; t += 0.05) {
      const px = drawPlayerX + previewDist * t
      const py = playerY - (previewDist * 0.6) * Math.sin(Math.PI * t)
      if (t === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.draw()
}

// 跳跃动画
const animateJump = () => {
  if (!isJumping) return

  jumpProgress += 0.03

  if (jumpProgress >= 1) {
    jumpProgress = 1
    isJumping = false
    playerX = jumpTargetX
    playerY = jumpTargetY

    // 检测是否落在方块上
    checkLanding()
    draw()
    return
  }

  // 抛物线运动
  const t = jumpProgress
  playerX = jumpStartX + (jumpTargetX - jumpStartX) * t
  const jumpHeight = jumpPower * 0.6
  playerY = jumpStartY + (jumpTargetY - jumpStartY) * t - jumpHeight * Math.sin(Math.PI * t)

  // 移动相机
  const targetCameraX = playerX - canvasWidth.value * 0.35
  cameraX += (targetCameraX - cameraX) * 0.1

  draw()
  animFrameId = setTimeout(animateJump, 16)
}

// 检测落地
const checkLanding = () => {
  let landed = false
  let centerBonus = false

  for (const block of blocks) {
    // 判断X轴是否在方块范围内
    if (playerX >= block.x && playerX <= block.x + block.width) {
      // 落在方块上（放宽Y轴判定）
      landed = true
      playerY = block.y - playerSize / 2

      // 判断是否落在中心区域（左右各15%范围）
      const blockCenter = block.x + block.width / 2
      if (Math.abs(playerX - blockCenter) < block.width * 0.15) {
        centerBonus = true
      }
      break
    }
  }

  if (landed) {
    if (centerBonus) {
      score.value += 2
    } else {
      score.value += 1
    }
    gameStarted.value = true

    // 生成新方块，移除远处的旧方块
    generateNextBlock()
    blocks = blocks.filter(b => b.x + b.width > cameraX - 200)
  } else {
    // 游戏结束
    endGame()
  }
}

// 游戏结束
const endGame = () => {
  gameOver.value = true
  if (score.value > bestScore.value) {
    bestScore.value = score.value
    Taro.setStorageSync('jump_best_score', score.value)
  }
}

// 重新开始
const restartGame = () => {
  initGame()
}

// 触摸开始 - 蓄力
const onTouchStart = () => {
  if (gameOver.value || isJumping) return

  isCharging.value = true
  chargeStartTime = Date.now()
  power = 0
  powerPercent.value = 0

  chargeTimer = setInterval(() => {
    const elapsed = Date.now() - chargeStartTime
    power = Math.min(maxPower, elapsed * 0.15)
    powerPercent.value = (power / maxPower) * 100
    draw()
  }, 16)
}

// 触摸结束 - 跳跃
const onTouchEnd = () => {
  if (gameOver.value || isJumping || !isCharging.value) return

  isCharging.value = false
  clearInterval(chargeTimer)

  if (power < 5) return

  // 开始跳跃
  isJumping = true
  jumpProgress = 0
  jumpStartX = playerX
  jumpStartY = playerY
  jumpPower = power
  jumpTargetX = playerX + power * 1.8
  jumpTargetY = playerY // 先设为同一高度，落地检测时会调整

  // 找到目标方块Y坐标
  for (const block of blocks) {
    if (jumpTargetX >= block.x && jumpTargetX <= block.x + block.width) {
      jumpTargetY = block.y - playerSize / 2
      break
    }
  }

  power = 0
  powerPercent.value = 0
  animateJump()
}

onMounted(() => {
  ctx = Taro.createCanvasContext('jumpCanvas')
  initGame()
})

onUnmounted(() => {
  if (animFrameId) clearTimeout(animFrameId)
  if (chargeTimer) clearInterval(chargeTimer)
})
</script>

<style lang="scss">
.page {
  height: 100vh;
  background: linear-gradient(180deg, #e8f4f8 0%, #f0f0f0 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.header {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.score_display {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
}

.score_label {
  font-size: 11px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score_value {
  font-size: 28px;
  font-weight: 800;
  color: #2d3436;
  line-height: 1.2;
}

.game_canvas {
  flex: 1;
}

.tips {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  padding: 24px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.tips_text {
  font-size: 17px;
  font-weight: 700;
  color: #2d3436;
  margin-bottom: 8px;
}

.tips_sub {
  font-size: 12px;
  color: #b2bec3;
}

.power_bar_wrapper {
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.power_bar {
  height: 10px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 5px;
  overflow: hidden;
}

.power_fill {
  height: 100%;
  background: linear-gradient(90deg, #00b894, #fdcb6e, #e17055);
  border-radius: 5px;
  transition: width 0.05s linear;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.overlay_card {
  background: #fff;
  border-radius: 24px;
  padding: 36px 44px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  min-width: 240px;
}

.overlay_icon {
  font-size: 52px;
  margin-bottom: 16px;
}

.overlay_title {
  font-size: 22px;
  font-weight: 800;
  color: #2d3436;
  margin-bottom: 10px;
}

.overlay_score {
  font-size: 16px;
  color: #636e72;
  margin-bottom: 6px;
}

.overlay_best {
  font-size: 15px;
  color: #e17055;
  font-weight: 700;
  margin-bottom: 20px;
}

.btn {
  padding: 14px 40px;
  border-radius: 28px;
  font-size: 15px;
  font-weight: 700;
  margin-top: 16px;
  letter-spacing: 0.5px;

  &:active {
    transform: scale(0.95);
    opacity: 0.85;
  }
}

.btn_primary {
  background: linear-gradient(135deg, #00b894, #00cec9);
  color: #fff;
  box-shadow: 0 6px 20px rgba(0, 184, 148, 0.35);
}
</style>
