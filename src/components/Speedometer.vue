<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { computed } from 'vue'

const store = useGameStore()

const speedKmh = computed(() => {
  const speed = store.bike.speed
  return (speed * 3.6).toFixed(1)
})

const speedPercent = computed(() => {
  const percent = (store.bike.speed / store.physics.maxSpeed) * 100
  return Math.min(100, Math.max(0, percent))
})

const speedColor = computed(() => {
  const percent = speedPercent.value
  if (percent < 20) return '#f44336'
  if (percent < 40) return '#ff9800'
  if (percent < 60) return '#4caf50'
  return '#2196f3'
})

const speedClass = computed(() => {
  const percent = speedPercent.value
  if (percent < 20) return 'text-red-500'
  if (percent < 40) return 'text-orange-500'
  if (percent < 60) return 'text-green-500'
  return 'text-blue-500'
})
</script>

<template>
  <div class="speedometer">
    <div class="speed-icon">🚲</div>
    <div class="speed-content">
      <div class="speed-label">速度</div>
      <div class="speed-value" :class="speedClass">{{ speedKmh }}<span class="unit">km/h</span></div>
    </div>
    <div class="speed-bar">
      <div
        class="speed-fill"
        :style="{ width: speedPercent + '%', backgroundColor: speedColor }"
      />
    </div>
  </div>
</template>

<style scoped>
.speedometer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  min-width: 160px;
}

.speed-icon {
  font-size: 24px;
  position: absolute;
}

.speed-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.speed-label {
  font-size: 11px;
  color: #9e9e9e;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.speed-value {
  font-family: 'Courier New', monospace;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.unit {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.7;
}

.speed-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.speed-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.1s ease-out, background-color 0.2s;
}
</style>
