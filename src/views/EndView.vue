<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { formatTime } from '@/utils/storage'
import { computed, onMounted } from 'vue'

const router = useRouter()
const store = useGameStore()

const isWin = computed(() => store.failReason?.includes('完成比赛'))

const resultTitle = computed(() => {
  if (isWin.value) return '🎉 完成比赛！'
  return '💥 游戏结束'
})

const resultEmoji = computed(() => {
  if (isWin.value) return '🏆'
  if (store.failReason?.includes('倒地')) return '🚑'
  if (store.failReason?.includes('脚落地')) return '🦶'
  if (store.failReason?.includes('越界')) return '⚠️'
  return '😢'
})

const getMedalEmoji = (index: number): string => {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return `${index + 1}.`
}

function playAgain() {
  router.push('/game')
}

function goHome() {
  router.push('/')
}

onMounted(() => {
  store.loadLeaderboard()
})
</script>

<template>
  <div class="end-view">
    <div class="result-card">
      <div class="result-emoji">{{ resultEmoji }}</div>
      <h1 class="result-title">{{ resultTitle }}</h1>
      <p class="fail-reason" v-if="store.failReason">{{ store.failReason }}</p>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">最终用时</div>
          <div class="stat-value time">{{ formatTime(store.time) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">骑行距离</div>
          <div class="stat-value">{{ Math.floor(store.distance) }}m</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">完成度</div>
          <div class="stat-value">
            {{ Math.min(100, Math.floor((store.distance / store.track.length) * 100)) }}%
          </div>
        </div>
      </div>

      <div class="performance-rating" v-if="isWin">
        <div class="rating-stars">
          ⭐⭐⭐
        </div>
        <div class="rating-text">太棒了！你成功完成了比赛！</div>
      </div>

      <div class="button-group">
        <button class="btn primary-btn" @click="playAgain">
          <span>🔄</span>
          <span>再玩一次</span>
        </button>
        <button class="btn secondary-btn" @click="goHome">
          <span>🏠</span>
          <span>返回首页</span>
        </button>
      </div>
    </div>

    <div v-if="store.leaderboard.length > 0" class="leaderboard-section">
      <h2 class="section-title">🏆 排行榜</h2>
      <div class="leaderboard-card">
        <div class="leaderboard-header">
          <span class="col-rank">排名</span>
          <span class="col-time">用时</span>
          <span class="col-distance">距离</span>
          <span class="col-status">状态</span>
        </div>
        <div class="leaderboard-list">
          <div
            v-for="(entry, index) in store.leaderboard.slice(0, 5)"
            :key="entry.id"
            class="leaderboard-item"
            :class="{
              'top-three': index < 3,
              'current-entry': entry.time === store.time && Math.abs(entry.distance - store.distance) < 1
            }"
          >
            <span class="col-rank">{{ getMedalEmoji(index) }}</span>
            <span class="col-time">{{ formatTime(entry.time) }}</span>
            <span class="col-distance">{{ Math.floor(entry.distance) }}m</span>
            <span class="col-status">
              {{ entry.isCompleted ? '✅' : '❌' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="tips-section">
      <h3 class="tips-title">💡 小技巧</h3>
      <ul class="tips-list">
        <li>保持速度适中，太快或太慢都容易失去平衡</li>
        <li>左右键要轻轻按，不要用力过猛</li>
        <li>感觉要倒时，提前微调方向</li>
        <li>想要好成绩，需要耐心慢慢骑</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.end-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: linear-gradient(180deg, #87ceeb 0%, #b0e0e6 50%, #7cb342 100%);
  gap: 24px;
}

.result-card {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.result-emoji {
  font-size: 80px;
  margin-bottom: 16px;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.result-title {
  font-family: 'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif;
  font-size: 32px;
  color: #1b5e20;
  margin: 0 0 8px 0;
}

.fail-reason {
  font-size: 16px;
  color: #e53935;
  margin: 0 0 24px 0;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 16px 12px;
}

.stat-label {
  font-size: 12px;
  color: #78909c;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #2e7d32;
}

.stat-value.time {
  font-family: 'Courier New', monospace;
  color: #1b5e20;
  font-size: 18px;
}

.performance-rating {
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.rating-stars {
  font-size: 32px;
  margin-bottom: 8px;
}

.rating-text {
  font-size: 14px;
  color: #f57c00;
  font-weight: 600;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
}

.primary-btn {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(76, 175, 80, 0.5);
}

.secondary-btn {
  background: linear-gradient(135deg, #78909c, #546e7a);
  color: white;
  box-shadow: 0 4px 16px rgba(120, 144, 156, 0.4);
}

.secondary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(120, 144, 156, 0.5);
}

.btn:active {
  transform: translateY(0);
}

.leaderboard-section {
  width: 100%;
  max-width: 450px;
}

.section-title {
  font-size: 20px;
  color: #1b5e20;
  text-align: center;
  margin: 0 0 16px 0;
  font-family: 'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif;
}

.leaderboard-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.leaderboard-header {
  display: grid;
  grid-template-columns: 50px 1fr 80px 60px;
  gap: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #78909c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 8px;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.leaderboard-item {
  display: grid;
  grid-template-columns: 50px 1fr 80px 60px;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.2s;
  font-size: 14px;
}

.leaderboard-item.top-three {
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  font-weight: 600;
}

.leaderboard-item.current-entry {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border: 2px solid #4caf50;
}

.col-rank {
  text-align: center;
  font-size: 16px;
}

.col-time {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #1b5e20;
}

.col-distance {
  color: #666;
  text-align: right;
}

.col-status {
  text-align: center;
  font-size: 16px;
}

.tips-section {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.tips-title {
  font-size: 16px;
  color: #1b5e20;
  margin: 0 0 12px 0;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tips-list li {
  font-size: 14px;
  color: #546e7a;
  padding-left: 8px;
  border-left: 3px solid #81c784;
}
</style>
