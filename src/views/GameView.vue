<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GameCanvas from '@/components/GameCanvas.vue'
import Timer from '@/components/Timer.vue'
import Speedometer from '@/components/Speedometer.vue'
import BalanceMeter from '@/components/BalanceMeter.vue'
import TouchControls from '@/components/TouchControls.vue'
import { useGameLoop } from '@/composables/useGameLoop'
import { useGameInput } from '@/composables/useGameInput'
import { useGameStore } from '@/stores/gameStore'

const router = useRouter()
const store = useGameStore()
const { startGameLoop, stopGameLoop } = useGameLoop()
useGameInput()

const modeLabel = computed(() => {
  switch (store.mode) {
    case 'training':
      return store.trainingType === 'balance' ? '🎯 平衡训练' : '⚡ 速度训练'
    case 'race':
      return '🏁 竞赛模式'
    case 'challenge':
      return '🏆 挑战模式'
    case 'online':
      return '🌐 联机模式'
    default:
      return '🎮 游戏中'
  }
})

const hasAIOpponents = computed(() => store.aiOpponents.length > 0)

const warningText = computed(() => {
  if (Math.abs(store.balancePercent) > 70) {
    return '⚠️ 注意平衡！快要倒了！'
  }
  if (store.zeroSpeedTime > 1) {
    return '⚠️ 速度太慢！快踩踏板！'
  }
  if (store.isOutOfTrack) {
    return '⚠️ 骑出赛道了！'
  }
  return ''
})

function goBack() {
  stopGameLoop()
  router.push('/')
}

onMounted(() => {
  startGameLoop()
})

onUnmounted(() => {
  stopGameLoop()
})
</script>

<template>
  <div class="game-view">
    <div class="game-header">
      <button class="back-btn" @click="goBack">
        ← 返回
      </button>
      <div class="header-stats">
        <Timer />
        <Speedometer />
      </div>
      <div class="header-info">
        <div class="mode-badge">{{ modeLabel }}</div>
        <div v-if="hasAIOpponents" class="rank-badge">
          <span class="rank-icon">🏅</span>
          <span class="rank-text">第 {{ store.playerRank }} / {{ store.aiOpponents.length + 1 }} 名</span>
        </div>
      </div>
    </div>

    <div class="game-content">
      <div class="canvas-wrapper">
        <GameCanvas />

        <div v-if="store.status === 'idle'" class="game-overlay">
          <div class="overlay-content">
            <div class="countdown-icon">🚲</div>
            <h2 class="overlay-title">准备好了吗？</h2>
            <p class="overlay-text">按住 ↑ 或 空格 开始前进</p>
            <p class="overlay-tip">保持平衡，越慢越好！</p>
          </div>
        </div>
      </div>

      <div class="game-controls">
        <div class="balance-section">
          <BalanceMeter />
        </div>

        <div class="keyboard-hints">
          <div class="hint-row">
            <div class="hint-group">
              <span class="hint-key">←</span>
              <span class="hint-label">左平衡</span>
            </div>
            <div class="hint-group">
              <span class="hint-key">→</span>
              <span class="hint-label">右平衡</span>
            </div>
            <div class="hint-group">
              <span class="hint-key">↑ / 空格</span>
              <span class="hint-label">踩踏板</span>
            </div>
            <div class="hint-group">
              <span class="hint-key">Q</span>
              <span class="hint-label">左重心</span>
            </div>
            <div class="hint-group">
              <span class="hint-key">E</span>
              <span class="hint-label">右重心</span>
            </div>
            <div class="hint-group">
              <span class="hint-key">R</span>
              <span class="hint-label">重开</span>
            </div>
          </div>
        </div>

        <TouchControls />
      </div>
    </div>

    <Transition name="warning">
      <div v-if="store.isWarning && store.status === 'playing' && warningText" class="warning-banner">
        <span class="warning-text">{{ warningText }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.game-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #87ceeb 0%, #b0e0e6 100%);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.back-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #455a64;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-btn:hover {
  background: white;
  transform: translateX(-2px);
}

.header-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.header-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.mode-badge {
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #1b5e20;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rank-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rank-icon {
  font-size: 18px;
}

.rank-text {
  font-size: 14px;
  font-weight: 700;
  color: #f57c00;
}

.game-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.canvas-wrapper {
  width: 100%;
  max-width: 800px;
  position: relative;
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  backdrop-filter: blur(4px);
}

.overlay-content {
  text-align: center;
  color: white;
  padding: 40px;
}

.countdown-icon {
  font-size: 80px;
  margin-bottom: 16px;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.overlay-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  font-family: 'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif;
}

.overlay-text {
  font-size: 18px;
  margin: 0 0 8px 0;
  opacity: 0.9;
}

.overlay-tip {
  font-size: 16px;
  color: #ffd54f;
  margin: 0;
}

.game-controls {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.balance-section {
  width: 100%;
  display: flex;
  justify-content: center;
}

.keyboard-hints {
  width: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.hint-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.hint-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.hint-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #455a64, #37474f);
  color: white;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.hint-label {
  font-size: 12px;
  color: #78909c;
  font-weight: 500;
}

.warning-banner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px 40px;
  background: rgba(244, 67, 54, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(244, 67, 54, 0.4);
  animation: shake 0.5s ease-in-out infinite;
  z-index: 100;
}

@keyframes shake {
  0%, 100% { transform: translate(-50%, -50%) rotate(0); }
  25% { transform: translate(-50%, -50%) rotate(-2deg); }
  75% { transform: translate(-50%, -50%) rotate(2deg); }
}

.warning-text {
  color: white;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}

.warning-enter-active,
.warning-leave-active {
  transition: opacity 0.3s ease;
}

.warning-enter-from,
.warning-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .keyboard-hints {
    display: none;
  }

  .header-stats {
    width: 100%;
    justify-content: space-between;
  }

  .header-info {
    width: 100%;
    justify-content: space-between;
  }

  .game-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
