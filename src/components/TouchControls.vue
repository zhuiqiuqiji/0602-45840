<script setup lang="ts">
import { useGameInput } from '@/composables/useGameInput'

const { handleTouchStart, handleTouchEnd, handleMouseDown, handleMouseUp } = useGameInput()
</script>

<template>
  <div class="touch-controls">
    <div class="control-row balance-controls">
      <button
        class="control-btn left-btn"
        @touchstart="(e) => handleTouchStart(e, 'left')"
        @touchend="(e) => handleTouchEnd(e, 'left')"
        @mousedown="() => handleMouseDown('left')"
        @mouseup="() => handleMouseUp('left')"
        @mouseleave="() => handleMouseUp('left')"
      >
        <span class="btn-icon">⬅️</span>
        <span class="btn-label">左平衡</span>
      </button>
      <button
        class="control-btn right-btn"
        @touchstart="(e) => handleTouchStart(e, 'right')"
        @touchend="(e) => handleTouchEnd(e, 'right')"
        @mousedown="() => handleMouseDown('right')"
        @mouseup="() => handleMouseUp('right')"
        @mouseleave="() => handleMouseUp('right')"
      >
        <span class="btn-icon">➡️</span>
        <span class="btn-label">右平衡</span>
      </button>
    </div>
    <div class="control-row pedal-control">
      <button
        class="control-btn pedal-btn"
        @touchstart="(e) => handleTouchStart(e, 'pedal')"
        @touchend="(e) => handleTouchEnd(e, 'pedal')"
        @mousedown="() => handleMouseDown('pedal')"
        @mouseup="() => handleMouseUp('pedal')"
        @mouseleave="() => handleMouseUp('pedal')"
      >
        <span class="btn-icon">🚴</span>
        <span class="btn-label">踩踏板</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.touch-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.control-row {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.balance-controls {
  display: flex;
  gap: 12px;
}

.pedal-control {
  display: flex;
  justify-content: center;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.left-btn {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
}

.right-btn {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
}

.pedal-btn {
  background: linear-gradient(135deg, #4caf50, #388e3c);
  color: white;
  min-width: 160px;
}

.control-btn:active {
  transform: scale(0.95);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
}

.control-btn:hover {
  filter: brightness(1.1);
}

.btn-icon {
  font-size: 28px;
}

.btn-label {
  font-size: 12px;
  font-weight: 600;
}

@media (min-width: 768px) {
  .touch-controls {
    display: none;
  }
}
</style>
