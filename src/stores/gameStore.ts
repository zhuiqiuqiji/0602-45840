import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState, BikeState, TrackConfig, PhysicsConfig, InputState } from '@/types/game'
import { DEFAULT_BIKE_STATE, DEFAULT_TRACK_CONFIG, DEFAULT_PHYSICS_CONFIG } from '@/types/game'
import { addLeaderboardEntry, getLeaderboard } from '@/utils/storage'
import type { LeaderboardEntry } from '@/types/game'

export const useGameStore = defineStore('game', () => {
  const bike = ref<BikeState>({ ...DEFAULT_BIKE_STATE })
  const track = ref<TrackConfig>({ ...DEFAULT_TRACK_CONFIG })
  const physics = ref<PhysicsConfig>({ ...DEFAULT_PHYSICS_CONFIG })
  const status = ref<'idle' | 'playing' | 'ended'>('idle')
  const time = ref(0)
  const distance = ref(0)
  const isFootDown = ref(false)
  const isOutOfTrack = ref(false)
  const isFallen = ref(false)
  const failReason = ref<string | undefined>(undefined)
  const zeroSpeedTime = ref(0)
  const input = ref<InputState>({
    left: false,
    right: false,
    pedal: false,
  })
  const leaderboard = ref<LeaderboardEntry[]>([])

  const gameState = computed<GameState>(() => ({
    status: status.value,
    bike: bike.value,
    track: track.value,
    time: time.value,
    distance: distance.value,
    isFootDown: isFootDown.value,
    isOutOfTrack: isOutOfTrack.value,
    isFallen: isFallen.value,
    failReason: failReason.value,
    zeroSpeedTime: zeroSpeedTime.value,
  }))

  const balancePercent = computed(() => {
    const angle = bike.value.angle
    const maxAngle = physics.value.fallAngle
    return Math.max(-100, Math.min(100, (angle / maxAngle) * 100))
  })

  const isWarning = computed(() => {
    return Math.abs(balancePercent.value) > 70 || isFootDown.value || isOutOfTrack.value
  })

  function initGame() {
    bike.value = { ...DEFAULT_BIKE_STATE }
    track.value = { ...DEFAULT_TRACK_CONFIG }
    physics.value = { ...DEFAULT_PHYSICS_CONFIG }
    status.value = 'idle'
    time.value = 0
    distance.value = 0
    isFootDown.value = false
    isOutOfTrack.value = false
    isFallen.value = false
    failReason.value = undefined
    zeroSpeedTime.value = 0
    input.value = { left: false, right: false, pedal: false }
    loadLeaderboard()
  }

  function startGame() {
    initGame()
    status.value = 'playing'
  }

  function endGame(reason: string) {
    status.value = 'ended'
    failReason.value = reason
    saveScore()
  }

  function saveScore() {
    addLeaderboardEntry({
      time: time.value,
      distance: distance.value,
      isCompleted: distance.value >= track.value.length,
    })
    loadLeaderboard()
  }

  function loadLeaderboard() {
    leaderboard.value = getLeaderboard()
  }

  function updateInput(newInput: Partial<InputState>) {
    input.value = { ...input.value, ...newInput }
  }

  function updateBike(updates: Partial<BikeState>) {
    bike.value = { ...bike.value, ...updates }
  }

  function updateGameState(updates: Partial<{
    time: number
    distance: number
    isFootDown: boolean
    isOutOfTrack: boolean
    isFallen: boolean
    zeroSpeedTime: number
  }>) {
    if (updates.time !== undefined) time.value = updates.time
    if (updates.distance !== undefined) distance.value = updates.distance
    if (updates.isFootDown !== undefined) isFootDown.value = updates.isFootDown
    if (updates.isOutOfTrack !== undefined) isOutOfTrack.value = updates.isOutOfTrack
    if (updates.isFallen !== undefined) isFallen.value = updates.isFallen
    if (updates.zeroSpeedTime !== undefined) zeroSpeedTime.value = updates.zeroSpeedTime
  }

  return {
    bike,
    track,
    physics,
    status,
    time,
    distance,
    isFootDown,
    isOutOfTrack,
    isFallen,
    failReason,
    zeroSpeedTime,
    input,
    leaderboard,
    gameState,
    balancePercent,
    isWarning,
    initGame,
    startGame,
    endGame,
    updateInput,
    updateBike,
    updateGameState,
    loadLeaderboard,
  }
})
