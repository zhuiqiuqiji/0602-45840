<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { computed } from 'vue'

const store = useGameStore()

const balancePercent = computed(() => store.balancePercent)

const indicatorStyle = computed(() => {
  const percent = balancePercent.value
  const translateX = percent * 1.2
  const color = percent > 70 ? '#f44336' : percent > 40 ? '#ff9800' : '#4caf50'
  return {
    transform: `translateX(${translateX}px)`,
    backgroundColor: color,
    boxShadow: `0 0 10px ${color}`,
  }
})

const barGradient = computed(() => {
  const percent = Math.abs(balancePercent.value)
  if (percent > 70) return 'from-red-500 to-red-600'
  if (percent > 40) return 'from-orange-400 to-orange-500'
  return 'from-green-400 to-green-500'
})
</script>

<template>
  <div class="balance-meter">
    <div class="label">
      <span class="left-label">← 左</span>
      <span class="center-label">平衡</span>
      <span class="right-label">右 →</span>
    </div>
    <div class="bar-container">
      <div class="bar-bg">
        <div class="zone left-zone" />
        <div class="zone center-zone" />
        <div class="zone right-zone" />
      </div>
      <div class="indicator" :style="indicatorStyle" />
    </div>
    <div class="angle-display">
      <span :class="barGradient">{{ Math.abs(balancePercent).toFixed(0) }}%</span>
    </div>
  </div>
</template>

<style scoped>
.balance-meter {
  width: 100%;
  max-width: 300px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.left-label,
.right-label {
  color: #ff7043;
  font-weight: 600;
}

.center-label {
  color: #4caf50;
  font-weight: 700;
  font-size: 14px;
}

.bar-container {
  position: relative;
  height: 20px;
}

.bar-bg {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}

.zone {
  flex: 1;
}

.left-zone {
  background: linear-gradient(to right, #ef5350, #ffa726);
}

.center-zone {
  background: linear-gradient(to right, #ffa726, #66bb6a, #ffa726);
}

.right-zone {
  background: linear-gradient(to right, #ffa726, #ef5350);
}

.indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4caf50;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.05s ease-out, background-color 0.2s;
  z-index: 10;
}

.angle-display {
  text-align: center;
  margin-top: 6px;
  font-size: 14px;
  font-weight: 700;
}

.angle-display span {
  padding: 2px 8px;
  border-radius: 4px;
  color: white;
}
</style>
