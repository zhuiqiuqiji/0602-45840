import { useGameStore } from '@/stores/gameStore'
import { onMounted, onUnmounted } from 'vue'

export function useGameInput() {
  const store = useGameStore()

  function handleKeyDown(e: KeyboardEvent) {
    if (e.code === 'KeyR') {
      e.preventDefault()
      store.startGame()
      return
    }

    if (store.status !== 'playing') return

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        e.preventDefault()
        store.updateInput({ left: true })
        break
      case 'ArrowRight':
      case 'KeyD':
        e.preventDefault()
        store.updateInput({ right: true })
        break
      case 'ArrowUp':
      case 'Space':
      case 'KeyW':
        e.preventDefault()
        store.updateInput({ pedal: true })
        break
      case 'KeyQ':
        e.preventDefault()
        store.updateInput({ leanLeft: true, shiftUp: true })
        break
      case 'KeyE':
        e.preventDefault()
        store.updateInput({ leanRight: true, shiftDown: true })
        break
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        store.updateInput({ left: false })
        break
      case 'ArrowRight':
      case 'KeyD':
        store.updateInput({ right: false })
        break
      case 'ArrowUp':
      case 'Space':
      case 'KeyW':
        store.updateInput({ pedal: false })
        break
      case 'KeyQ':
        store.updateInput({ leanLeft: false, shiftUp: false })
        break
      case 'KeyE':
        store.updateInput({ leanRight: false, shiftDown: false })
        break
    }
  }

  function handleTouchStart(e: TouchEvent, control: 'left' | 'right' | 'pedal') {
    e.preventDefault()
    if (store.status !== 'playing') return
    store.updateInput({ [control]: true })
  }

  function handleTouchEnd(e: TouchEvent, control: 'left' | 'right' | 'pedal') {
    e.preventDefault()
    store.updateInput({ [control]: false })
  }

  function handleMouseDown(control: 'left' | 'right' | 'pedal') {
    if (store.status !== 'playing') return
    store.updateInput({ [control]: true })
  }

  function handleMouseUp(control: 'left' | 'right' | 'pedal') {
    store.updateInput({ [control]: false })
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  })

  return {
    handleKeyDown,
    handleKeyUp,
    handleTouchStart,
    handleTouchEnd,
    handleMouseDown,
    handleMouseUp,
  }
}
