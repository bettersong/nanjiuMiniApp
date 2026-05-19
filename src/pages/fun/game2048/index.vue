<template>
  <view class="page">
    <!-- 得分区 -->
    <view class="score_bar">
      <view class="score_item">
        <view class="score_label">分数</view>
        <view class="score_val">{{ score }}</view>
      </view>
      <view class="score_item">
        <view class="score_label">最高分</view>
        <view class="score_val">{{ bestScore }}</view>
      </view>
    </view>

    <!-- 游戏区域 -->
    <view
      class="board"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <view class="board_inner">
        <view
          v-for="(cell, idx) in flatGrid"
          :key="idx"
          :class="['cell', cell ? 'cell_' + Math.min(cell, 8192) : 'cell_empty']"
        >
          <text v-if="cell" class="cell_text">{{ cell }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action_bar">
      <view class="btn btn_ghost" @tap="undoMove" v-if="prevGrid">撤销</view>
      <view class="btn btn_primary" @tap="resetGame">新游戏</view>
    </view>

    <!-- 游戏说明 -->
    <view class="tips_card">
      <view class="tips_text">👆 滑动合并相同数字，目标达到 2048！</view>
    </view>

    <!-- 游戏结束弹窗 -->
    <view class="overlay" v-if="gameOver || gameWon">
      <view class="overlay_card">
        <view class="overlay_icon">{{ gameWon ? '🎉' : '😢' }}</view>
        <view class="overlay_title">{{ gameWon ? '恭喜！达到 2048！' : '游戏结束' }}</view>
        <view class="overlay_score">最终得分：{{ score }}</view>
        <view class="btn btn_primary overlay_btn" @tap="resetGame">再来一局</view>
        <view class="btn btn_ghost overlay_btn" v-if="gameWon" @tap="continueGame">继续挑战</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'

type Grid = number[][]

const grid = ref<Grid>([])
const score = ref(0)
const bestScore = ref(0)
const gameOver = ref(false)
const gameWon = ref(false)
const prevGrid = ref<Grid | null>(null)
const prevScore = ref(0)

let touchStartX = 0
let touchStartY = 0

// 扁平化 grid 给模板用
const flatGrid = computed(() => grid.value.flat())

// 初始化
onMounted(() => {
  bestScore.value = Taro.getStorageSync('nj_2048_best') || 0
  resetGame()
})

const resetGame = () => {
  grid.value = createEmptyGrid()
  score.value = 0
  gameOver.value = false
  gameWon.value = false
  prevGrid.value = null
  addRandomTile()
  addRandomTile()
}

const continueGame = () => {
  gameWon.value = false
}

const createEmptyGrid = (): Grid => {
  return Array.from({ length: 4 }, () => Array(4).fill(0))
}

const cloneGrid = (g: Grid): Grid => {
  return g.map(row => [...row])
}

// 添加随机方块（90%概率出2，10%概率出4）
const addRandomTile = () => {
  const empty: [number, number][] = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid.value[r][c] === 0) empty.push([r, c])
    }
  }
  if (empty.length === 0) return
  const [row, col] = empty[Math.floor(Math.random() * empty.length)]
  grid.value[row][col] = Math.random() < 0.9 ? 2 : 4
}

// 滑动一行（向左合并）
const slideRow = (row: number[]): { newRow: number[]; scored: number } => {
  let arr = row.filter(x => x !== 0)
  let scored = 0

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2
      scored += arr[i]
      arr.splice(i + 1, 1)
    }
  }

  while (arr.length < 4) arr.push(0)
  return { newRow: arr, scored }
}

// 移动（direction: 0=左, 1=上, 2=右, 3=下）
const move = (direction: number): boolean => {
  const prev = cloneGrid(grid.value)
  let totalScored = 0

  if (direction === 0) {
    for (let r = 0; r < 4; r++) {
      const { newRow, scored } = slideRow(grid.value[r])
      grid.value[r] = newRow
      totalScored += scored
    }
  } else if (direction === 2) {
    for (let r = 0; r < 4; r++) {
      const reversed = [...grid.value[r]].reverse()
      const { newRow, scored } = slideRow(reversed)
      grid.value[r] = newRow.reverse()
      totalScored += scored
    }
  } else if (direction === 1) {
    for (let c = 0; c < 4; c++) {
      const col = [grid.value[0][c], grid.value[1][c], grid.value[2][c], grid.value[3][c]]
      const { newRow, scored } = slideRow(col)
      for (let r = 0; r < 4; r++) grid.value[r][c] = newRow[r]
      totalScored += scored
    }
  } else if (direction === 3) {
    for (let c = 0; c < 4; c++) {
      const col = [grid.value[3][c], grid.value[2][c], grid.value[1][c], grid.value[0][c]]
      const { newRow, scored } = slideRow(col)
      const reversed = newRow.reverse()
      for (let r = 0; r < 4; r++) grid.value[r][c] = reversed[r]
      totalScored += scored
    }
  }

  // 检查是否有变化
  let changed = false
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (prev[r][c] !== grid.value[r][c]) { changed = true; break }
    }
    if (changed) break
  }

  if (changed) {
    prevGrid.value = prev
    prevScore.value = score.value
    score.value += totalScored

    if (score.value > bestScore.value) {
      bestScore.value = score.value
      Taro.setStorageSync('nj_2048_best', bestScore.value)
    }

    addRandomTile()

    // 检查是否赢了
    if (!gameWon.value) {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (grid.value[r][c] === 2048) {
            gameWon.value = true
            return true
          }
        }
      }
    }

    // 检查是否结束
    if (isGameOver()) {
      gameOver.value = true
    }
  }

  // 触发响应式更新
  grid.value = [...grid.value.map(row => [...row])]
  return changed
}

const isGameOver = (): boolean => {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid.value[r][c] === 0) return false
    }
  }
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = grid.value[r][c]
      if (c < 3 && val === grid.value[r][c + 1]) return false
      if (r < 3 && val === grid.value[r + 1][c]) return false
    }
  }
  return true
}

const undoMove = () => {
  if (prevGrid.value) {
    grid.value = cloneGrid(prevGrid.value)
    score.value = prevScore.value
    prevGrid.value = null
    gameOver.value = false
  }
}

// 触摸事件
const onTouchStart = (e: any) => {
  const touch = e.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
}

const onTouchEnd = (e: any) => {
  if (gameOver.value || gameWon.value) return

  const touch = e.changedTouches[0]
  const dx = touch.clientX - touchStartX
  const dy = touch.clientY - touchStartY

  const minSwipe = 30
  if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return

  if (Math.abs(dx) > Math.abs(dy)) {
    move(dx > 0 ? 2 : 0)
  } else {
    move(dy > 0 ? 3 : 1)
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #faf8ef;
  padding: 16px;
  box-sizing: border-box;
}

.score_bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.score_item {
  flex: 1;
  background: #bbada0;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.score_label {
  font-size: 11px;
  color: #eee4da;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.score_val {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

// 游戏面板 - 用 vw 确保正方形
.board {
  width: calc(100vw - 32px);
  height: calc(100vw - 32px);
  background: #bbada0;
  border-radius: 8px;
  padding: 8px;
  box-sizing: border-box;
}

// 内部grid容器
.board_inner {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 8px;
}

// 数字格子
.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(238, 228, 218, 0.35);
}

.cell_empty {
  background: rgba(238, 228, 218, 0.35);
}

.cell_text {
  font-weight: 700;
  font-family: -apple-system, 'Helvetica Neue', sans-serif;
}

// 各数字颜色
.cell_2 { background: #eee4da; .cell_text { color: #776e65; font-size: 32px; } }
.cell_4 { background: #ede0c8; .cell_text { color: #776e65; font-size: 32px; } }
.cell_8 { background: #f2b179; .cell_text { color: #fff; font-size: 32px; } }
.cell_16 { background: #f59563; .cell_text { color: #fff; font-size: 28px; } }
.cell_32 { background: #f67c5f; .cell_text { color: #fff; font-size: 28px; } }
.cell_64 { background: #f65e3b; .cell_text { color: #fff; font-size: 28px; } }
.cell_128 { background: #edcf72; .cell_text { color: #fff; font-size: 22px; } }
.cell_256 { background: #edcc61; .cell_text { color: #fff; font-size: 22px; } }
.cell_512 { background: #edc850; .cell_text { color: #fff; font-size: 22px; } }
.cell_1024 { background: #edc53f; .cell_text { color: #fff; font-size: 18px; } }
.cell_2048 { background: #edc22e; .cell_text { color: #fff; font-size: 18px; } }
.cell_4096 { background: #3c3a32; .cell_text { color: #fff; font-size: 18px; } }
.cell_8192 { background: #3c3a32; .cell_text { color: #fff; font-size: 18px; } }

// 操作栏
.action_bar {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn {
  flex: 1;
  height: 42px;
  line-height: 42px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  &:active { opacity: 0.75; }
}

.btn_primary {
  background: #8f7a66;
  color: #fff;
}

.btn_ghost {
  background: #fff;
  color: #8f7a66;
  border: 1px solid #8f7a66;
}

// 提示
.tips_card {
  margin-top: 14px;
  text-align: center;
}

.tips_text {
  font-size: 13px;
  color: #776e65;
}

// 弹窗
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(238, 228, 218, 0.73);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 30px;
}

.overlay_card {
  background: #fff;
  border-radius: 16px;
  padding: 30px 24px;
  text-align: center;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}

.overlay_icon { font-size: 48px; margin-bottom: 12px; }
.overlay_title { font-size: 20px; font-weight: 700; color: #776e65; margin-bottom: 8px; }
.overlay_score { font-size: 14px; color: #999; margin-bottom: 20px; }
.overlay_btn { margin-bottom: 10px; }
</style>
