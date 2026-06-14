import { useGameStore } from '@/stores/gameStore'
import { useGamePhysics } from './useGamePhysics'
import { watch } from 'vue'
import { useRouter } from 'vue-router'

export function useGameLoop() {
  const store = useGameStore()
  const router = useRouter()
  const { updatePhysics } = useGamePhysics()

  let animationId: number | null = null
  let lastTime = 0

  function gameLoop(timestamp: number) {
    if (store.status !== 'playing') return

    const deltaTime = lastTime ? Math.min((timestamp - lastTime) / 1000, 1 / 30) : 1 / 60
    lastTime = timestamp

    updatePhysics(deltaTime)

    if (store.status === 'playing') {
      animationId = requestAnimationFrame(gameLoop)
    }
  }

  function startGameLoop() {
    if (animationId) cancelAnimationFrame(animationId)
    lastTime = 0
    store.startGame()
    animationId = requestAnimationFrame(gameLoop)
  }

  function stopGameLoop() {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  watch(
    () => store.status,
    (newStatus) => {
      if (newStatus === 'ended') {
        stopGameLoop()
        router.push('/end')
      }
    }
  )

  return {
    startGameLoop,
    stopGameLoop,
  }
}
