<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { formatTime } from '@/utils/storage'
import { onMounted } from 'vue'

const router = useRouter()
const store = useGameStore()

onMounted(() => {
  store.loadLeaderboard()
})

function startGame() {
  router.push('/game')
}

function getMedalEmoji(index: number): string {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return `${index + 1}.`
}
</script>

<template>
  <div class="start-view">
    <div class="hero-section">
      <div class="bike-animation">
        <span class="bike-emoji">🚲</span>
      </div>
      <h1 class="game-title">自行车慢骑</h1>
      <p class="game-subtitle">越慢越好，保持平衡才是关键！</p>
    </div>

    <div class="instructions-card">
      <h2 class="card-title">🎮 操作说明</h2>
      <div class="instruction-list">
        <div class="instruction-item">
          <span class="key">← →</span>
          <span class="desc">左右方向键控制平衡</span>
        </div>
        <div class="instruction-item">
          <span class="key">↑ / 空格</span>
          <span class="desc">踩踏板加速前进</span>
        </div>
        <div class="instruction-item">
          <span class="key">R</span>
          <span class="desc">重新开始游戏</span>
        </div>
      </div>
    </div>

    <div class="rules-card">
      <h2 class="card-title">📜 游戏规则</h2>
      <ul class="rules-list">
        <li>🚫 不能倒地（倾斜角度超过45度）</li>
        <li>🚫 不能脚落地（速度为0超过2秒）</li>
        <li>🚫 不能骑出赛道边界</li>
        <li>🏆 用时最长者获胜</li>
      </ul>
    </div>

    <button class="start-btn" @click="startGame">
      <span class="btn-text">开始游戏</span>
      <span class="btn-icon">🚀</span>
    </button>

    <div v-if="store.leaderboard.length > 0" class="leaderboard-card">
      <h2 class="card-title">🏆 排行榜</h2>
      <div class="leaderboard-list">
        <div
          v-for="(entry, index) in store.leaderboard.slice(0, 5)"
          :key="entry.id"
          class="leaderboard-item"
          :class="{ 'top-three': index < 3 }"
        >
          <span class="rank">{{ getMedalEmoji(index) }}</span>
          <span class="time">{{ formatTime(entry.time) }}</span>
          <span class="distance">{{ Math.floor(entry.distance) }}m</span>
          <span class="status" :class="{ completed: entry.isCompleted }">
            {{ entry.isCompleted ? '✅' : '❌' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.start-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: linear-gradient(180deg, #87ceeb 0%, #b0e0e6 50%, #7cb342 100%);
  gap: 24px;
}

.hero-section {
  text-align: center;
  margin-bottom: 16px;
}

.bike-animation {
  font-size: 80px;
  animation: bounce 2s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

.game-title {
  font-family: 'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif;
  font-size: 48px;
  color: #1b5e20;
  text-shadow: 3px 3px 0 rgba(255, 255, 255, 0.5);
  margin: 0 0 8px 0;
}

.game-subtitle {
  font-size: 18px;
  color: #2e7d32;
  font-weight: 500;
  margin: 0;
}

.instructions-card,
.rules-card,
.leaderboard-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1b5e20;
  margin: 0 0 16px 0;
  text-align: center;
}

.instruction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #455a64, #37474f);
  color: white;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.desc {
  color: #455a64;
  font-size: 15px;
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rules-list li {
  color: #455a64;
  font-size: 15px;
  padding: 8px 0;
  border-bottom: 1px dashed #e0e0e0;
}

.rules-list li:last-child {
  border-bottom: none;
}

.start-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  max-width: 400px;
  padding: 18px 32px;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 22px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  transition: all 0.3s ease;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4); }
  50% { box-shadow: 0 6px 30px rgba(76, 175, 80, 0.7); }
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(76, 175, 80, 0.5);
}

.start-btn:active {
  transform: translateY(0);
}

.btn-text {
  font-family: 'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif;
}

.btn-icon {
  font-size: 28px;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f5f5f5;
  transition: all 0.2s;
}

.leaderboard-item.top-three {
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  font-weight: 600;
}

.rank {
  width: 30px;
  font-size: 18px;
  text-align: center;
}

.time {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #1b5e20;
  flex: 1;
}

.distance {
  color: #666;
  font-size: 14px;
}

.status {
  font-size: 16px;
}
</style>
