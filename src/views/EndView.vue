<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { formatTime } from '@/utils/storage'
import { Trophy, RotateCcw, Home, Clock, MapPin, Percent, Star, Medal, Target, Lightbulb, Award, ChevronRight, TrendingUp, Sparkles } from 'lucide-vue-next'
import { BIKE_TYPES, TRACK_TYPES } from '@/types/game'

const router = useRouter()
const store = useGameStore()

const unlockedThisGame = ref<string[]>([])

onMounted(() => {
  store.loadLeaderboard()
  detectNewUnlocks()
})

function detectNewUnlocks() {
  const newlyUnlocked: string[] = []
  store.challenges.forEach(challenge => {
    if (challenge.completed) {
      newlyUnlocked.push(challenge.reward)
    }
  })
  unlockedThisGame.value = newlyUnlocked
}

const isWin = computed(() => store.distance >= store.track.length && !store.failReason)

const resultInfo = computed(() => {
  if (isWin.value) {
    return {
      emoji: '🏆',
      title: '完成比赛！',
      subtitle: '恭喜你成功冲过终点线',
      gradient: 'from-amber-400 via-yellow-400 to-orange-400',
      bgGradient: 'from-amber-50 to-yellow-50',
      borderColor: 'border-amber-300',
    }
  }
  if (store.failReason?.includes('倒地')) {
    return {
      emoji: '💥',
      title: '不慎摔倒',
      subtitle: '平衡感还需要多加练习哦',
      gradient: 'from-rose-400 via-red-400 to-pink-400',
      bgGradient: 'from-rose-50 to-pink-50',
      borderColor: 'border-rose-300',
    }
  }
  if (store.failReason?.includes('脚落地')) {
    return {
      emoji: '🦶',
      title: '脚落地了',
      subtitle: '保持速度，别让自行车停下来',
      gradient: 'from-orange-400 via-amber-400 to-red-400',
      bgGradient: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-300',
    }
  }
  if (store.failReason?.includes('越界')) {
    return {
      emoji: '⚠️',
      title: '骑出赛道',
      subtitle: '注意控制方向，别偏离赛道',
      gradient: 'from-sky-400 via-blue-400 to-indigo-400',
      bgGradient: 'from-sky-50 to-blue-50',
      borderColor: 'border-sky-300',
    }
  }
  return {
    emoji: '😢',
    title: '游戏结束',
    subtitle: store.failReason || '再接再厉！',
    gradient: 'from-slate-400 via-gray-400 to-zinc-400',
    bgGradient: 'from-slate-50 to-gray-50',
    borderColor: 'border-slate-300',
  }
})

const completionPercent = computed(() => {
  return Math.min(100, Math.floor((store.distance / store.track.length) * 100))
})

const highScore = computed(() => {
  const completed = store.leaderboard.filter(e => e.isCompleted)
  if (completed.length === 0) return 0
  return Math.max(...completed.map(e => e.time))
})

const performanceStars = computed(() => {
  if (!isWin.value) return 0
  const pct = completionPercent.value
  if (store.time >= 180) return 3
  if (store.time >= 120) return 2
  return 1
})

const aiRanking = computed(() => {
  const all = [
    {
      id: 'player',
      name: store.playerName,
      emoji: '🧑',
      distance: store.distance,
      time: store.time,
      isFinished: isWin.value,
      failReason: store.failReason,
      isPlayer: true,
      color: '#22c55e',
    },
    ...store.aiOpponents.map(ai => ({
      id: ai.id,
      name: ai.name,
      emoji: ai.emoji,
      distance: ai.distance,
      time: ai.time,
      isFinished: ai.isFinished && !ai.failReason,
      failReason: ai.failReason,
      isPlayer: false,
      color: ai.color,
    })),
  ]
  all.sort((a, b) => {
    if (a.isFinished !== b.isFinished) return a.isFinished ? -1 : 1
    if (a.isFinished) return b.time - a.time
    return b.distance - a.distance
  })
  return all
})

const hasAIOpponents = computed(() => {
  return store.aiOpponents.length > 0
})

function getMedalEmoji(index: number): string {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return `${index + 1}`
}

function getRankBadgeClass(index: number): string {
  if (index === 0) return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
  if (index === 1) return 'bg-gradient-to-r from-slate-300 to-slate-400 text-white'
  if (index === 2) return 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
  return 'bg-gray-100 text-gray-600'
}

const gameTips = [
  '保持速度适中，太快或太慢都容易失去平衡',
  '左右键要轻轻按，微调方向不要用力过猛',
  '感觉要倒时，提前向反方向轻轻调整',
  '想要好成绩，需要耐心慢慢骑，稳才是王道',
  '练习平衡训练模式，提升你的平衡感',
]

const currentBikeInfo = computed(() => {
  return BIKE_TYPES.find(b => b.id === store.currentBikeType)
})

const currentTrackInfo = computed(() => {
  return TRACK_TYPES.find(t => t.id === store.currentTrackId)
})

function playAgain() {
  store.initGame()
  router.push('/game')
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen w-full bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-300 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto space-y-5">

      <!-- 结果展示卡片 -->
      <div
        class="relative overflow-hidden rounded-3xl shadow-2xl"
        :class="`bg-gradient-to-br ${resultInfo.bgGradient} border-2 ${resultInfo.borderColor}`"
      >
        <div class="absolute top-0 right-0 w-40 h-40 opacity-10">
          <Trophy class="w-full h-full text-amber-500" />
        </div>

        <div class="relative p-6 sm:p-8">
          <div class="flex flex-col items-center text-center">
            <div
              class="text-7xl sm:text-8xl mb-4 animate-bounce"
              style="animation-duration: 2s;"
            >
              {{ resultInfo.emoji }}
            </div>

            <h1
              class="text-3xl sm:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r"
              :class="resultInfo.gradient"
              style="font-family: 'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif;"
            >
              {{ resultInfo.title }}
            </h1>

            <p class="text-gray-600 text-base sm:text-lg mb-4">
              {{ resultInfo.subtitle }}
            </p>

            <p v-if="store.failReason && !isWin" class="text-rose-500 font-semibold mb-4 px-4 py-2 bg-rose-50 rounded-full text-sm">
              {{ store.failReason }}
            </p>

            <!-- 星级评价 -->
            <div v-if="isWin" class="flex items-center gap-1 mb-5">
              <Star
                v-for="i in 3"
                :key="i"
                class="w-8 h-8 transition-all duration-500"
                :class="i <= performanceStars ? 'text-yellow-400 fill-yellow-400 scale-110' : 'text-gray-300'"
                :style="{ animationDelay: `${i * 150}ms` }"
              />
            </div>
          </div>

          <!-- 核心统计数据 -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <div class="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-white">
              <div class="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">
                <Clock class="w-3.5 h-3.5" />
                最终用时
              </div>
              <div class="text-2xl font-bold text-emerald-700 font-mono">
                {{ formatTime(store.time) }}
              </div>
            </div>

            <div class="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-white">
              <div class="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">
                <MapPin class="w-3.5 h-3.5" />
                骑行距离
              </div>
              <div class="text-2xl font-bold text-blue-600">
                {{ Math.floor(store.distance) }}<span class="text-sm font-normal text-gray-500 ml-0.5">m</span>
              </div>
            </div>

            <div class="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-white col-span-2 sm:col-span-1">
              <div class="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">
                <Percent class="w-3.5 h-3.5" />
                完成度
              </div>
              <div class="flex items-end gap-2">
                <div class="text-2xl font-bold text-purple-600">{{ completionPercent }}%</div>
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    class="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000"
                    :style="{ width: `${completionPercent}%` }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 得分与排名 -->
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-4 border border-emerald-200">
              <div class="flex items-center gap-2 text-emerald-700 text-xs font-medium uppercase tracking-wide mb-1">
                <Award class="w-3.5 h-3.5" />
                本局得分
              </div>
              <div class="text-2xl font-bold text-emerald-700">
                {{ Math.floor(store.score) }}
                <span class="text-sm font-normal text-emerald-500 ml-1">分</span>
              </div>
            </div>

            <div class="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl p-4 border border-amber-200">
              <div class="flex items-center gap-2 text-amber-700 text-xs font-medium uppercase tracking-wide mb-1">
                <TrendingUp class="w-3.5 h-3.5" />
                最高纪录
              </div>
              <div class="text-2xl font-bold text-amber-700 font-mono">
                {{ formatTime(highScore) }}
              </div>
            </div>
          </div>

          <!-- 玩家排名（有AI时显示） -->
          <div v-if="hasAIOpponents" class="bg-gradient-to-br from-indigo-50 to-violet-100 rounded-2xl p-4 border border-indigo-200 mb-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-indigo-700 text-xs font-medium uppercase tracking-wide">
                <Medal class="w-3.5 h-3.5" />
                本局排名
              </div>
              <div class="flex items-center gap-1.5">
                <span
                  class="inline-flex items-center justify-center w-9 h-9 rounded-xl text-lg font-bold shadow"
                  :class="getRankBadgeClass(store.playerRank - 1)"
                >
                  {{ store.playerRank <= 3 ? getMedalEmoji(store.playerRank - 1) : store.playerRank }}
                </span>
                <span class="text-indigo-700 font-bold text-lg">/{{ store.aiOpponents.length + 1 }}</span>
              </div>
            </div>
          </div>

          <!-- 车辆赛道信息 -->
          <div class="flex flex-wrap gap-2 justify-center text-xs text-gray-500">
            <span v-if="currentBikeInfo" class="px-3 py-1 bg-white/70 rounded-full">
              {{ currentBikeInfo.emoji }} {{ currentBikeInfo.name }}
            </span>
            <span v-if="currentTrackInfo" class="px-3 py-1 bg-white/70 rounded-full">
              🛣️ {{ currentTrackInfo.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- AI 对手排名列表 -->
      <div v-if="hasAIOpponents" class="bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <Medal class="w-5 h-5" />
            比赛排名
          </h2>
        </div>
        <div class="divide-y divide-gray-100">
          <div
            v-for="(player, index) in aiRanking"
            :key="player.id"
            class="flex items-center gap-3 px-5 py-3 transition-colors"
            :class="player.isPlayer ? 'bg-emerald-50' : 'hover:bg-gray-50'"
          >
            <span
              class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm"
              :class="getRankBadgeClass(index)"
            >
              {{ index < 3 ? getMedalEmoji(index) : index + 1 }}
            </span>

            <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-2xl" :style="{ backgroundColor: player.color + '20' }">
              {{ player.emoji }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-800 truncate">
                  {{ player.name }}
                </span>
                <span v-if="player.isPlayer" class="px-2 py-0.5 text-xs font-medium bg-emerald-500 text-white rounded-full">
                  你
                </span>
              </div>
              <div class="text-xs text-gray-500 mt-0.5">
                <span v-if="player.isFinished" class="text-emerald-600 font-medium">✅ 完成比赛</span>
                <span v-else-if="player.failReason" class="text-rose-500">{{ player.failReason }}</span>
                <span v-else class="text-gray-500">进行中...</span>
              </div>
            </div>

            <div class="text-right flex-shrink-0">
              <div class="font-mono font-bold text-gray-800">
                {{ formatTime(player.time) }}
              </div>
              <div class="text-xs text-gray-500">
                {{ Math.floor(player.distance) }}m
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 成就解锁提示 -->
      <div v-if="unlockedThisGame.length > 0" class="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-2xl shadow-xl overflow-hidden border-2 border-amber-200">
        <div class="px-5 py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles class="w-5 h-5" />
            新成就解锁！
          </h2>
        </div>
        <div class="p-4 space-y-2">
          <div
            v-for="(reward, index) in unlockedThisGame"
            :key="index"
            class="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-amber-100"
          >
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Target class="w-5 h-5 text-white" />
            </div>
            <div class="flex-1">
              <div class="font-semibold text-amber-800">{{ reward }}</div>
              <div class="text-xs text-amber-600">已永久解锁</div>
            </div>
            <ChevronRight class="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          @click="playAgain"
          class="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <RotateCcw class="w-5 h-5" />
          再玩一次
        </button>
        <button
          @click="goHome"
          class="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Home class="w-5 h-5" />
          返回首页
        </button>
      </div>

      <!-- 排行榜 Top5 -->
      <div v-if="store.leaderboard.length > 0" class="bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-r from-amber-500 to-orange-500">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <Trophy class="w-5 h-5" />
            排行榜 Top 5
          </h2>
        </div>
        <div class="p-3">
          <div class="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span class="col-span-2">排名</span>
            <span class="col-span-4">用时</span>
            <span class="col-span-3">距离</span>
            <span class="col-span-3 text-center">状态</span>
          </div>
          <div class="space-y-1">
            <div
              v-for="(entry, index) in store.leaderboard.slice(0, 5)"
              :key="entry.id"
              class="grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-xl transition-all"
              :class="[
                index < 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50' : 'bg-gray-50',
                entry.time === store.time && Math.abs(entry.distance - store.distance) < 1 ? 'ring-2 ring-emerald-400 bg-emerald-50' : ''
              ]"
            >
              <span class="col-span-2">
                <span
                  class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold"
                  :class="getRankBadgeClass(index)"
                >
                  {{ index < 3 ? getMedalEmoji(index) : index + 1 }}
                </span>
              </span>
              <span class="col-span-4 font-mono font-bold text-gray-800">
                {{ formatTime(entry.time) }}
              </span>
              <span class="col-span-3 text-gray-600 text-sm">
                {{ Math.floor(entry.distance) }}m
              </span>
              <span class="col-span-3 text-center">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="entry.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
                >
                  {{ entry.isCompleted ? '✓ 完成' : '✗ 未完成' }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 游戏技巧提示 -->
      <div class="bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-r from-sky-500 to-cyan-500">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <Lightbulb class="w-5 h-5" />
            游戏技巧
          </h2>
        </div>
        <div class="p-4">
          <ul class="space-y-2.5">
            <li
              v-for="(tip, index) in gameTips"
              :key="index"
              class="flex items-start gap-3 p-3 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl border-l-4 border-sky-400"
            >
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {{ index + 1 }}
              </span>
              <span class="text-gray-700 text-sm leading-relaxed">{{ tip }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="text-center text-xs text-white/70 pb-2 pt-1">
        🚲 自行车慢骑 · 越慢越精彩
      </div>
    </div>
  </div>
</template>
