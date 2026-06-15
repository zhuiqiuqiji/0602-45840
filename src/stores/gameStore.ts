import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  GameState,
  BikeState,
  TrackConfig,
  PhysicsConfig,
  InputState,
  AIState,
  GameMode,
  TrainingType,
  Challenge,
} from '@/types/game'
import {
  DEFAULT_BIKE_STATE,
  DEFAULT_TRACK_CONFIG,
  DEFAULT_PHYSICS_CONFIG,
  DEFAULT_INPUT_STATE,
  BIKE_TYPES,
  TRACK_TYPES,
  AI_NAMES,
  CHALLENGES,
} from '@/types/game'
import { addLeaderboardEntry, getLeaderboard } from '@/utils/storage'
import type { LeaderboardEntry } from '@/types/game'

const AI_COLORS = ['#FF5722', '#2196F3', '#9C27B0', '#FF9800', '#00BCD4']

export const useGameStore = defineStore('game', () => {
  const bike = ref<BikeState>({ ...DEFAULT_BIKE_STATE })
  const track = ref<TrackConfig>({ ...DEFAULT_TRACK_CONFIG })
  const physics = ref<PhysicsConfig>({ ...DEFAULT_PHYSICS_CONFIG })
  const status = ref<'idle' | 'playing' | 'ended' | 'paused'>('idle')
  const mode = ref<GameMode>('race')
  const trainingType = ref<TrainingType>('balance')
  const time = ref(0)
  const distance = ref(0)
  const isFootDown = ref(false)
  const isOutOfTrack = ref(false)
  const isFallen = ref(false)
  const failReason = ref<string | undefined>(undefined)
  const zeroSpeedTime = ref(0)
  const input = ref<InputState>({ ...DEFAULT_INPUT_STATE })
  const leaderboard = ref<LeaderboardEntry[]>([])
  const currentBikeType = ref('city')
  const currentTrackId = ref(DEFAULT_TRACK_CONFIG.id)
  const score = ref(0)
  const combo = ref(0)
  const perfectBalanceTime = ref(0)
  const aiOpponents = ref<AIState[]>([])
  const challenges = ref<Challenge[]>(JSON.parse(JSON.stringify(CHALLENGES)))
  const unlockedBikes = ref<string[]>(BIKE_TYPES.filter(b => b.unlocked).map(b => b.id))
  const unlockedTracks = ref<string[]>(TRACK_TYPES.filter(t => t.unlocked).map(t => t.id))
  const completedRaces = ref(0)
  const bestBalanceTime = ref(0)
  const playerName = ref('玩家')
  const matchOpponents = ref<AIState[]>([])

  const gameState = computed<GameState>(() => ({
    status: status.value,
    mode: mode.value,
    trainingType: trainingType.value,
    bike: bike.value,
    track: track.value,
    time: time.value,
    distance: distance.value,
    isFootDown: isFootDown.value,
    isOutOfTrack: isOutOfTrack.value,
    isFallen: isFallen.value,
    failReason: failReason.value,
    zeroSpeedTime: zeroSpeedTime.value,
    currentBikeType: currentBikeType.value,
    score: score.value,
    combo: combo.value,
    perfectBalanceTime: perfectBalanceTime.value,
  }))

  const balancePercent = computed(() => {
    const angle = bike.value.angle
    const maxAngle = physics.value.fallAngle
    return Math.max(-100, Math.min(100, (angle / maxAngle) * 100))
  })

  const isWarning = computed(() => {
    return Math.abs(balancePercent.value) > 70 || isFootDown.value || isOutOfTrack.value
  })

  const currentTrack = computed(() => {
    return TRACK_TYPES.find(t => t.id === currentTrackId.value) || DEFAULT_TRACK_CONFIG
  })

  const currentBike = computed(() => {
    return BIKE_TYPES.find(b => b.id === currentBikeType.value) || BIKE_TYPES[0]
  })

  const playerRank = computed(() => {
    const all = [
      { id: 'player', distance: distance.value, time: time.value, isFinished: status.value === 'ended' && !failReason.value },
      ...aiOpponents.value.map(ai => ({
        id: ai.id,
        distance: ai.distance,
        time: ai.time,
        isFinished: ai.isFinished,
      })),
    ]
    all.sort((a, b) => {
      if (a.isFinished !== b.isFinished) return a.isFinished ? -1 : 1
      if (a.isFinished) return a.time - b.time
      return b.distance - a.distance
    })
    return all.findIndex(p => p.id === 'player') + 1
  })

  function generateAIOpponents(count: number = 3) {
    const opponents: AIState[] = []
    const shuffled = [...AI_NAMES].sort(() => Math.random() - 0.5)
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const nameData = shuffled[i]
      opponents.push({
        id: `ai-${i}`,
        name: nameData.name,
        emoji: nameData.emoji,
        bike: {
          ...DEFAULT_BIKE_STATE,
          x: track.value.startX + track.value.width / 2,
        },
        distance: 0,
        time: 0,
        skill: 0.5 + Math.random() * 0.4,
        aggressiveness: 0.2 + Math.random() * 0.5,
        isFinished: false,
        color: AI_COLORS[i % AI_COLORS.length],
      })
    }
    return opponents
  }

  function initGame() {
    const currentGroundY = track.value.groundY
    bike.value = { ...DEFAULT_BIKE_STATE }
    track.value = { ...currentTrack.value }
    if (currentGroundY > 0) {
      track.value.groundY = currentGroundY
    }
    physics.value = { ...DEFAULT_PHYSICS_CONFIG }
    status.value = 'idle'
    time.value = 0
    distance.value = 0
    isFootDown.value = false
    isOutOfTrack.value = false
    isFallen.value = false
    failReason.value = undefined
    zeroSpeedTime.value = 0
    input.value = { ...DEFAULT_INPUT_STATE }
    score.value = 0
    combo.value = 0
    perfectBalanceTime.value = 0
    bike.value.x = track.value.startX + track.value.width / 2

    if (mode.value === 'race' || mode.value === 'challenge' || mode.value === 'online') {
      aiOpponents.value = generateAIOpponents(mode.value === 'online' ? 5 : 3)
    } else {
      aiOpponents.value = []
    }

    loadLeaderboard()
  }

  function startGame() {
    initGame()
    status.value = 'playing'
  }

  function setMode(newMode: GameMode) {
    mode.value = newMode
  }

  function setTrainingType(type: TrainingType) {
    trainingType.value = type
  }

  function selectBike(bikeId: string) {
    if (unlockedBikes.value.includes(bikeId)) {
      currentBikeType.value = bikeId
    }
  }

  function selectTrack(trackId: string) {
    if (unlockedTracks.value.includes(trackId)) {
      currentTrackId.value = trackId
    }
  }

  function endGame(reason: string, isSuccess: boolean = false) {
    status.value = 'ended'
    if (!isSuccess) {
      failReason.value = reason
    }

    aiOpponents.value.forEach(ai => {
      if (!ai.isFinished) {
        ai.isFinished = true
        if (!ai.failReason) {
          ai.failReason = isSuccess ? undefined : '比赛结束'
        }
      }
    })

    saveScore()
    checkChallenges()
    updateBestRecords()
  }

  function saveScore() {
    addLeaderboardEntry({
      time: time.value,
      distance: distance.value,
      isCompleted: distance.value >= track.value.length,
      mode: mode.value,
      bikeId: currentBikeType.value,
      trackId: currentTrackId.value,
      playerName: playerName.value,
    })
    if (distance.value >= track.value.length) {
      completedRaces.value += 1
    }
    loadLeaderboard()
  }

  function checkChallenges() {
    challenges.value.forEach(challenge => {
      if (challenge.completed || !challenge.unlocked) return

      let completed = false
      switch (challenge.id) {
        case 'balance-10s':
          completed = bestBalanceTime.value >= challenge.target
          if (completed) unlockedBikes.value.push('road')
          break
        case 'finish-3':
          completed = completedRaces.value >= challenge.target
          if (completed) unlockedTracks.value.push('curve-gentle')
          break
        case 'slow-2min':
          completed = time.value >= challenge.target && distance.value >= track.value.length
          if (completed) unlockedBikes.value.push('unicycle')
          break
        case 'hard-track':
          completed = currentTrackId.value === 'straight-hard' && distance.value >= track.value.length
          if (completed) unlockedTracks.value.push('curve-sharp')
          break
        case 'master-time':
          completed = time.value >= challenge.target && distance.value >= track.value.length
          if (completed) unlockedTracks.value.push('championship')
          break
      }

      if (completed) {
        challenge.completed = true
      }
    })
  }

  function updateBestRecords() {
    if (perfectBalanceTime.value > bestBalanceTime.value) {
      bestBalanceTime.value = perfectBalanceTime.value
    }
    if (mode.value === 'training' && trainingType.value === 'balance') {
      if (time.value > bestBalanceTime.value) {
        bestBalanceTime.value = time.value
      }
    }
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

  function updateAI(index: number, updates: Partial<AIState>) {
    if (aiOpponents.value[index]) {
      aiOpponents.value[index] = { ...aiOpponents.value[index], ...updates }
    }
  }

  function resetProgress() {
    challenges.value = JSON.parse(JSON.stringify(CHALLENGES))
    unlockedBikes.value = BIKE_TYPES.filter(b => b.unlocked).map(b => b.id)
    unlockedTracks.value = TRACK_TYPES.filter(t => t.unlocked).map(t => t.id)
    completedRaces.value = 0
    bestBalanceTime.value = 0
  }

  return {
    bike,
    track,
    physics,
    status,
    mode,
    trainingType,
    time,
    distance,
    isFootDown,
    isOutOfTrack,
    isFallen,
    failReason,
    zeroSpeedTime,
    input,
    leaderboard,
    currentBikeType,
    currentTrackId,
    score,
    combo,
    perfectBalanceTime,
    aiOpponents,
    challenges,
    unlockedBikes,
    unlockedTracks,
    completedRaces,
    bestBalanceTime,
    playerName,
    matchOpponents,
    gameState,
    balancePercent,
    isWarning,
    currentTrack,
    currentBike,
    playerRank,
    initGame,
    startGame,
    endGame,
    setMode,
    setTrainingType,
    selectBike,
    selectTrack,
    updateInput,
    updateBike,
    updateGameState,
    updateAI,
    loadLeaderboard,
    resetProgress,
  }
})
