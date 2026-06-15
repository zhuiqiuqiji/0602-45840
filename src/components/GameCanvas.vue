<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useGameRenderer } from '@/composables/useGameRenderer'
import { useGameStore } from '@/stores/gameStore'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const store = useGameStore()

const { resizeCanvas, startRender, stopRender } = useGameRenderer(canvasRef)

function handleResize() {
  if (!containerRef.value) return
  const container = containerRef.value
  const width = Math.min(container.clientWidth, 800)
  const height = Math.min(width * 0.5625, 450)
  resizeCanvas(width, height)
}

onMounted(() => {
  store.initGame()
  handleResize()
  window.addEventListener('resize', handleResize)
  startRender()
})

watch(
  () => store.status,
  (newStatus) => {
    if (newStatus === 'idle') {
      stopRender()
      setTimeout(() => {
        startRender()
      }, 100)
    }
  }
)
</script>

<template>
  <div ref="containerRef" class="canvas-container">
    <canvas
      ref="canvasRef"
      class="game-canvas"
    />
  </div>
</template>

<style scoped>
.canvas-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.game-canvas {
  display: block;
  border-radius: 12px;
}
</style>
