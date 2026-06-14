<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { computed } from 'vue'
import { formatTime } from '@/utils/storage'

const store = useGameStore()

const displayTime = computed(() => formatTime(store.time))
</script>

<template>
  <div class="timer">
    <div class="timer-icon">⏱️</div>
    <div class="timer-content">
      <div class="timer-label">用时</div>
      <div class="timer-value">{{ displayTime }}</div>
    </div>
  </div>
</template>

<style scoped>
.timer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.timer-icon {
  font-size: 28px;
}

.timer-content {
  display: flex;
  flex-direction: column;
}

.timer-label {
  font-size: 11px;
  color: #9e9e9e;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.timer-value {
  font-family: 'Courier New', monospace;
  font-size: 24px;
  font-weight: 700;
  color: #1b5e20;
  letter-spacing: 2px;
}
</style>
