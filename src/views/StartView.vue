<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { formatTime } from '@/utils/storage'
import { BIKE_TYPES, TRACK_TYPES, CHALLENGES } from '@/types/game'
import type { GameMode, TrainingType, Challenge, BikeType, TrackConfig } from '@/types/game'

const router = useRouter()
const store = useGameStore()

const selectedMode = ref<GameMode>('training')
const selectedTrainingType = ref<TrainingType>('balance')
const showChallenges = ref(false)
const activeSection = ref<string>('modes')

const sections = [
  { key: 'modes', icon: '🎮', label: '游戏模式' },
  { key: 'bikes', icon: '🚲', label: '选择车辆' },
  { key: 'tracks', icon: '🛣️', label: '选择赛道' },
  { key: 'leaderboard', icon: '🏆', label: '排行榜' }
]

const gameModes: GameMode[] = ['training', 'race', 'challenge', 'online']

const availableBikes = computed(() => {
  return BIKE_TYPES.map(bike => ({
    ...bike,
    isUnlocked: store.unlockedBikes.includes(bike.id),
    isSelected: store.currentBikeType === bike.id
  }))
})

const availableTracks = computed(() => {
  return TRACK_TYPES.map(track => ({
    ...track,
    isUnlocked: store.unlockedTracks.includes(track.id),
    isSelected: store.currentTrackId === track.id
  }))
})

const sortedLeaderboard = computed(() => {
  return [...store.leaderboard].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? -1 : 1
    return b.time - a.time
  }).slice(0, 5)
})

const getDifficultyStars = (difficulty: number) => {
  return '⭐'.repeat(difficulty) + '☆'.repeat(5 - difficulty)
}

const getModeInfo = (mode: GameMode) => {
  const info = {
    training: { icon: '🎯', title: '训练模式', desc: '无压力练习，提升技术', color: 'from-sky-400 to-blue-500' },
    race: { icon: '🏁', title: '比赛模式', desc: '与AI对手一决高下', color: 'from-emerald-400 to-green-600' },
    challenge: { icon: '🏆', title: '挑战模式', desc: '完成成就解锁奖励', color: 'from-amber-400 to-orange-500' },
    online: { icon: '🌐', title: '在线比赛', desc: '模拟5人在线竞技', color: 'from-purple-400 to-indigo-600' }
  }
  return info[mode]
}

function selectMode(mode: GameMode) {
  selectedMode.value = mode
  store.setMode(mode)
  if (mode === 'challenge') {
    showChallenges.value = true
  }
}

function selectTrainingType(type: TrainingType) {
  selectedTrainingType.value = type
  store.setTrainingType(type)
}

function selectBike(bike: BikeType) {
  if (store.unlockedBikes.includes(bike.id)) {
    store.selectBike(bike.id)
  }
}

function selectTrack(track: TrackConfig) {
  if (store.unlockedTracks.includes(track.id)) {
    store.selectTrack(track.id)
  }
}

function startGame() {
  store.setMode(selectedMode.value)
  store.setTrainingType(selectedTrainingType.value)
  store.initGame()
  router.push('/game')
}

function getMedalEmoji(index: number): string {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return `${index + 1}.`
}

function getBikeNameById(id: string): string {
  return BIKE_TYPES.find(b => b.id === id)?.name || '未知'
}

function getTrackNameById(id: string): string {
  return TRACK_TYPES.find(t => t.id === id)?.name || '未知'
}

function getChallengeProgress(challenge: Challenge): number {
  let progress = 0
  switch (challenge.id) {
    case 'balance-10s':
      progress = Math.min(100, (store.bestBalanceTime / challenge.target) * 100)
      break
    case 'finish-3':
      progress = Math.min(100, (store.completedRaces / challenge.target) * 100)
      break
    case 'slow-2min':
    case 'master-time':
      progress = 0
      break
    case 'hard-track':
      progress = 0
      break
  }
  return progress
}

onMounted(() => {
  store.loadLeaderboard()
  store.setMode(selectedMode.value)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-200 via-cyan-100 to-green-200 relative overflow-x-hidden">
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-10 left-10 text-6xl opacity-20 animate-float-slow">☁️</div>
      <div class="absolute top-20 right-20 text-5xl opacity-15 animate-float-medium">☁️</div>
      <div class="absolute top-40 left-1/3 text-4xl opacity-10 animate-float-fast">☁️</div>
      <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-400/40 to-transparent"></div>
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-10">
      <div class="text-center mb-8">
        <div class="relative inline-block mb-4">
          <span class="text-7xl md:text-8xl inline-block animate-bike-bounce">🚲</span>
          <div class="absolute -top-2 -right-4 text-3xl animate-wiggle">✨</div>
          <div class="absolute -bottom-2 -left-4 text-2xl animate-wiggle-delayed">🌟</div>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold text-green-800 mb-2 drop-shadow-lg tracking-wider" style="font-family: 'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif;">
          自行车慢骑
        </h1>
        <p class="text-lg md:text-xl text-green-700 font-medium">
          🐢 越慢越好 · 保持平衡才是王道 🐢
        </p>
      </div>

      <div class="flex flex-wrap justify-center gap-2 md:gap-3 mb-6">
        <button
          v-for="section in sections"
          :key="section.key"
          @click="activeSection = section.key"
          :class="[
            'px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-300 transform',
            activeSection === section.key
              ? 'bg-green-500 text-white shadow-lg scale-105 ring-4 ring-green-300'
              : 'bg-white/80 text-green-700 hover:bg-white hover:shadow-md'
          ]"
        >
          <span class="mr-1">{{ section.icon }}</span>{{ section.label }}
        </button>
      </div>

      <div v-show="activeSection === 'modes'" class="space-y-6 animate-fade-in">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div
            v-for="mode in gameModes"
            :key="mode"
            @click="selectMode(mode)"
            :class="[
              'relative rounded-2xl p-5 md:p-6 cursor-pointer transition-all duration-300 transform border-4',
              selectedMode === mode
                ? 'bg-white shadow-2xl scale-[1.02] border-green-400'
                : 'bg-white/70 hover:bg-white hover:shadow-xl border-transparent'
            ]"
          >
            <div :class="[
              'absolute top-0 left-0 right-0 h-2 rounded-t-xl bg-gradient-to-r',
              getModeInfo(mode).color
            ]"></div>

            <div v-if="selectedMode === mode" class="absolute top-3 right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-md">
              ✓
            </div>

            <div class="flex items-start gap-4 mt-2">
              <div :class="[
                'w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl md:text-4xl bg-gradient-to-br shadow-lg',
                getModeInfo(mode).color
              ]">
                {{ getModeInfo(mode).icon }}
              </div>
              <div class="flex-1">
                <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-1">{{ getModeInfo(mode).title }}</h3>
                <p class="text-gray-500 text-sm md:text-base">{{ getModeInfo(mode).desc }}</p>
              </div>
            </div>

            <div v-if="mode === 'training'" class="mt-5 grid grid-cols-2 gap-3">
              <button
                @click.stop="selectTrainingType('balance')"
                :class="[
                  'py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200',
                  selectedTrainingType === 'balance' && selectedMode === mode
                    ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                <span class="text-lg mr-1">⚖️</span>平衡练习
              </button>
              <button
                @click.stop="selectTrainingType('speed')"
                :class="[
                  'py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200',
                  selectedTrainingType === 'speed' && selectedMode === mode
                    ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                <span class="text-lg mr-1">⚡</span>速度控制
              </button>
            </div>

            <div v-if="mode === 'challenge'" class="mt-5 space-y-2">
              <div
                v-for="challenge in CHALLENGES.slice(0, 5)"
                :key="challenge.id"
                :class="[
                  'flex items-center gap-3 p-3 rounded-xl transition-all',
                  challenge.completed
                    ? 'bg-green-50 border border-green-200'
                    : challenge.unlocked
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-gray-100 border border-gray-200 opacity-60'
                ]"
              >
                <span class="text-2xl">{{ challenge.completed ? '✅' : challenge.unlocked ? '🎯' : '🔒' }}</span>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm text-gray-800 truncate">{{ challenge.name }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ challenge.reward }}</p>
                </div>
                <div v-if="!challenge.completed && challenge.unlocked" class="w-16">
                  <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all" :style="{ width: getChallengeProgress(challenge) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="mode === 'race' || mode === 'online'" class="mt-5 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
              <span class="text-xl">{{ mode === 'online' ? '👥' : '🤖' }}</span>
              <span>
                {{ mode === 'online' ? '5个AI对手同台竞技' : '3个AI对手等你挑战' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeSection === 'bikes'" class="animate-fade-in">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            v-for="bike in availableBikes"
            :key="bike.id"
            @click="selectBike(bike)"
            :class="[
              'relative rounded-2xl p-4 transition-all duration-300 transform text-center',
              bike.isUnlocked
                ? bike.isSelected
                  ? 'bg-white shadow-2xl scale-105 border-4 border-green-400 cursor-pointer'
                  : 'bg-white/80 hover:bg-white hover:shadow-xl border-4 border-transparent cursor-pointer'
                : 'bg-gray-200/70 cursor-not-allowed opacity-70 border-4 border-transparent'
            ]"
          >
            <div v-if="!bike.isUnlocked" class="absolute inset-0 flex items-center justify-center bg-black/10 rounded-2xl z-10">
              <span class="text-4xl">🔒</span>
            </div>

            <div
              v-if="bike.isSelected && bike.isUnlocked"
              class="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-20"
            >
              ✓
            </div>

            <div
              class="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl md:text-5xl mb-3 shadow-inner"
              :style="{ background: `linear-gradient(135deg, ${bike.color}33, ${bike.accentColor}33)` }"
            >
              {{ bike.emoji }}
            </div>

            <h4 class="font-bold text-gray-800 text-sm md:text-base mb-1">{{ bike.name }}</h4>
            <div class="text-xs mb-2">{{ getDifficultyStars(bike.difficulty) }}</div>

            <div class="space-y-1 text-xs">
              <div class="flex justify-between px-2">
                <span class="text-gray-500">平衡</span>
                <span :class="bike.balanceBonus >= 0 ? 'text-green-600' : 'text-red-500'">
                  {{ bike.balanceBonus >= 0 ? '+' : '' }}{{ bike.balanceBonus }}
                </span>
              </div>
              <div class="flex justify-between px-2">
                <span class="text-gray-500">速度</span>
                <span :class="bike.speedBonus >= 0 ? 'text-green-600' : 'text-red-500'">
                  {{ bike.speedBonus >= 0 ? '+' : '' }}{{ bike.speedBonus }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="store.currentBike" class="mt-6 bg-white/80 rounded-2xl p-5 shadow-lg">
          <div class="flex items-start gap-4">
            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0"
              :style="{ background: `linear-gradient(135deg, ${store.currentBike.color}33, ${store.currentBike.accentColor}33)` }"
            >
              {{ store.currentBike.emoji }}
            </div>
            <div class="flex-1">
              <h4 class="text-lg font-bold text-gray-800">{{ store.currentBike.name }}</h4>
              <p class="text-gray-600 text-sm mt-1">{{ store.currentBike.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeSection === 'tracks'" class="animate-fade-in">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="track in availableTracks"
            :key="track.id"
            @click="selectTrack(track)"
            :class="[
              'relative rounded-2xl overflow-hidden transition-all duration-300 transform',
              track.isUnlocked
                ? track.isSelected
                  ? 'shadow-2xl scale-[1.02] border-4 border-green-400 cursor-pointer'
                  : 'hover:shadow-xl border-4 border-transparent cursor-pointer'
                : 'cursor-not-allowed opacity-60 border-4 border-transparent'
            ]"
          >
            <div
              class="h-28 relative"
              :style="{
                background: track.curves.length > 0
                  ? 'linear-gradient(135deg, #a8e6cf 0%, #88d8b0 50%, #7fcdbb 100%)'
                  : 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 50%, #81c784 100%)'
              }"
            >
              <div v-if="!track.isUnlocked" class="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-10">
                <span class="text-5xl">🔒</span>
              </div>

              <div class="absolute top-3 left-3 flex items-center gap-2">
                <span class="bg-white/90 px-3 py-1 rounded-full text-sm font-bold text-gray-700">
                  {{ getDifficultyStars(track.difficulty) }}
                </span>
              </div>

              <div v-if="track.hasObstacles" class="absolute top-3 right-3">
                <span class="bg-red-500/90 px-2 py-1 rounded-full text-xs font-bold text-white">
                  ⚠️ 有障碍
                </span>
              </div>

              <div v-if="track.curves.length > 0" class="absolute bottom-3 right-3">
                <span class="bg-amber-500/90 px-2 py-1 rounded-full text-xs font-bold text-white">
                  🔄 {{ track.curves.length }}弯道
                </span>
              </div>

              <div class="absolute bottom-3 left-3">
                <span class="bg-blue-500/90 px-2 py-1 rounded-full text-xs font-bold text-white">
                  📏 {{ (track.length / 1000).toFixed(1) }}km
                </span>
              </div>
            </div>

            <div class="bg-white/90 p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-bold text-gray-800">{{ track.name }}</h4>
                <div v-if="track.isSelected && track.isUnlocked" class="bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow">
                  ✓
                </div>
              </div>
              <p class="text-gray-500 text-sm">{{ track.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeSection === 'leaderboard'" class="animate-fade-in">
        <div class="bg-white/90 rounded-3xl p-6 shadow-2xl">
          <div class="text-center mb-6">
            <div class="inline-flex items-center gap-3 bg-gradient-to-r from-amber-100 to-yellow-100 px-6 py-3 rounded-full">
              <span class="text-3xl">🏆</span>
              <h3 class="text-2xl font-bold text-amber-700">荣誉殿堂</h3>
              <span class="text-3xl">🏆</span>
            </div>
          </div>

          <div v-if="sortedLeaderboard.length > 0" class="space-y-3">
            <div
              v-for="(entry, index) in sortedLeaderboard"
              :key="entry.id"
              :class="[
                'flex items-center gap-4 p-4 rounded-2xl transition-all duration-300',
                index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-100 border-2 border-yellow-300 shadow-lg scale-[1.02]' :
                index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-100 border-2 border-gray-300' :
                index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200' :
                'bg-gray-50 border border-gray-200'
              ]"
            >
              <div class="text-3xl md:text-4xl w-14 text-center shrink-0">
                {{ getMedalEmoji(index) }}
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span class="font-bold text-gray-800">{{ entry.playerName || '匿名玩家' }}</span>
                  <span :class="[
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    entry.mode === 'training' ? 'bg-sky-100 text-sky-700' :
                    entry.mode === 'race' ? 'bg-green-100 text-green-700' :
                    entry.mode === 'challenge' ? 'bg-amber-100 text-amber-700' :
                    'bg-purple-100 text-purple-700'
                  ]">
                    {{ entry.mode === 'training' ? '训练' : entry.mode === 'race' ? '比赛' : entry.mode === 'challenge' ? '挑战' : '在线' }}
                  </span>
                </div>
                <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>🚲 {{ getBikeNameById(entry.bikeId) }}</span>
                  <span>🛣️ {{ getTrackNameById(entry.trackId) }}</span>
                  <span>📅 {{ entry.date }}</span>
                </div>
              </div>

              <div class="text-right shrink-0">
                <div class="text-xl md:text-2xl font-mono font-bold text-green-700">{{ formatTime(entry.time) }}</div>
                <div class="text-xs text-gray-500">{{ Math.floor(entry.distance) }}m</div>
                <div class="text-xs mt-1">
                  {{ entry.isCompleted ? '✅ 完成' : '❌ 未完成' }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <div class="text-6xl mb-4">🎮</div>
            <p class="text-gray-500 text-lg">还没有记录</p>
            <p class="text-gray-400 text-sm mt-1">快去完成你的第一场比赛吧！</p>
          </div>
        </div>
      </div>

      <div class="mt-8 pb-6">
        <button
          @click="startGame"
          class="w-full max-w-xl mx-auto block py-5 px-8 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white text-xl md:text-2xl font-bold rounded-3xl shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
          style="font-family: 'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif;"
        >
          <span class="relative z-10 flex items-center justify-center gap-3">
            <span class="text-3xl animate-wiggle">🚀</span>
            <span>
              开始游戏
              <span class="text-base font-normal ml-2 opacity-90">
                ({{ getModeInfo(selectedMode).title }}
                <template v-if="selectedMode === 'training'">
                  · {{ selectedTrainingType === 'balance' ? '平衡练习' : '速度控制' }}
                </template>
                )
              </span>
            </span>
            <span class="text-3xl animate-wiggle-delayed">🌟</span>
          </span>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>

        <div class="mt-5 text-center">
          <p class="text-green-700/80 text-sm">
            当前选择: 🚲 {{ store.currentBike?.name }} · 🛣️ {{ store.currentTrack?.name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bike-bounce {
  0%, 100% { transform: translateY(0) rotate(-6deg); }
  25% { transform: translateY(-8px) rotate(-3deg); }
  50% { transform: translateY(-12px) rotate(6deg); }
  75% { transform: translateY(-4px) rotate(3deg); }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-15deg) scale(1.1); }
  75% { transform: rotate(15deg) scale(1.1); }
}

@keyframes wiggle-delayed {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(15deg) scale(1.1); }
  75% { transform: rotate(-15deg) scale(1.1); }
}

@keyframes float-slow {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -15px); }
}

@keyframes float-medium {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-15px, -10px); }
}

@keyframes float-fast {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(10px, -8px); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-bike-bounce {
  animation: bike-bounce 2.5s ease-in-out infinite;
}

.animate-wiggle {
  animation: wiggle 1.5s ease-in-out infinite;
}

.animate-wiggle-delayed {
  animation: wiggle-delayed 1.5s ease-in-out infinite;
  animation-delay: 0.3s;
}

.animate-float-slow {
  animation: float-slow 8s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 6s ease-in-out infinite;
}

.animate-float-fast {
  animation: float-fast 4s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out;
}
</style>
