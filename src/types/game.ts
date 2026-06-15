export interface BikeState {
  x: number
  y: number
  angle: number
  speed: number
  angularVelocity: number
  pedalRotation: number
  frontWheelRotation: number
  backWheelRotation: number
  centerOfGravity: number
  handlebarAngle: number
}

export interface BikeType {
  id: string
  name: string
  description: string
  emoji: string
  difficulty: 1 | 2 | 3 | 4 | 5
  physics: Partial<PhysicsConfig>
  balanceBonus: number
  speedBonus: number
  color: string
  accentColor: string
  unlocked: boolean
}

export interface TrackCurve {
  startDist: number
  endDist: number
  curvature: number
}

export interface TrackConfig {
  id: string
  name: string
  description: string
  difficulty: 1 | 2 | 3 | 4 | 5
  width: number
  length: number
  startX: number
  groundY: number
  curves: TrackCurve[]
  hasObstacles: boolean
  unlocked: boolean
}

export interface PhysicsConfig {
  gravity: number
  balanceForce: number
  maxSpeed: number
  minSpeed: number
  fallAngle: number
  friction: number
  pedalForce: number
  steeringSpeed: number
  cogInfluence: number
  gyroscopicEffect: number
}

export type GameMode = 'training' | 'race' | 'challenge' | 'online'
export type TrainingType = 'balance' | 'speed'

export interface GameState {
  status: 'idle' | 'playing' | 'ended' | 'paused'
  mode: GameMode
  trainingType?: TrainingType
  bike: BikeState
  track: TrackConfig
  time: number
  distance: number
  isFootDown: boolean
  isOutOfTrack: boolean
  isFallen: boolean
  failReason?: string
  zeroSpeedTime: number
  currentBikeType: string
  score: number
  combo: number
  perfectBalanceTime: number
}

export interface AIState {
  id: string
  name: string
  emoji: string
  bike: BikeState
  distance: number
  time: number
  skill: number
  aggressiveness: number
  isFinished: boolean
  color: string
  failReason?: string
}

export interface LeaderboardEntry {
  id: string
  time: number
  distance: number
  date: string
  isCompleted: boolean
  mode: GameMode
  bikeId: string
  trackId: string
  playerName?: string
  rank?: number
}

export interface InputState {
  left: boolean
  right: boolean
  pedal: boolean
  leanLeft: boolean
  leanRight: boolean
  shiftUp: boolean
  shiftDown: boolean
}

export interface Challenge {
  id: string
  name: string
  description: string
  type: 'time' | 'distance' | 'balance'
  target: number
  reward: string
  completed: boolean
  unlocked: boolean
}

export interface MatchRoom {
  id: string
  name: string
  players: MatchPlayer[]
  trackId: string
  isPrivate: boolean
  maxPlayers: number
  status: 'waiting' | 'ready' | 'racing' | 'finished'
}

export interface MatchPlayer {
  id: string
  name: string
  avatar: string
  bikeId: string
  isReady: boolean
  isAI?: boolean
  finalTime?: number
  finalDistance?: number
  rank?: number
}

export const BIKE_TYPES: BikeType[] = [
  {
    id: 'beginner',
    name: '初学者自行车',
    description: '最稳定的入门车型，宽大轮胎提供出色的平衡感',
    emoji: '🚲',
    difficulty: 1,
    physics: {
      balanceForce: 0.12,
      fallAngle: 55,
      maxSpeed: 4,
      gyroscopicEffect: 1.3,
    },
    balanceBonus: 20,
    speedBonus: 0,
    color: '#4CAF50',
    accentColor: '#2E7D32',
    unlocked: true,
  },
  {
    id: 'city',
    name: '城市通勤车',
    description: '平衡的选择，适合日常骑行的稳健车型',
    emoji: '🚴',
    difficulty: 2,
    physics: {
      balanceForce: 0.09,
      fallAngle: 48,
      maxSpeed: 5,
      gyroscopicEffect: 1.1,
    },
    balanceBonus: 10,
    speedBonus: 5,
    color: '#2196F3',
    accentColor: '#1565C0',
    unlocked: true,
  },
  {
    id: 'mountain',
    name: '山地自行车',
    description: '宽胎和坚固车架，适合颠簸路面',
    emoji: '🏔️',
    difficulty: 3,
    physics: {
      balanceForce: 0.075,
      fallAngle: 42,
      maxSpeed: 6,
      gyroscopicEffect: 0.95,
      pedalForce: 0.35,
    },
    balanceBonus: 0,
    speedBonus: 15,
    color: '#FF9800',
    accentColor: '#EF6C00',
    unlocked: true,
  },
  {
    id: 'road',
    name: '公路竞赛车',
    description: '超轻量设计，速度极快但平衡难度大',
    emoji: '⚡',
    difficulty: 4,
    physics: {
      balanceForce: 0.06,
      fallAngle: 38,
      maxSpeed: 8,
      gyroscopicEffect: 0.8,
      friction: 0.99,
    },
    balanceBonus: -10,
    speedBonus: 30,
    color: '#E91E63',
    accentColor: '#AD1457',
    unlocked: false,
  },
  {
    id: 'unicycle',
    name: '独轮车挑战',
    description: '终极挑战！没有第二个轮子，全靠平衡感',
    emoji: '🎪',
    difficulty: 5,
    physics: {
      balanceForce: 0.04,
      fallAngle: 30,
      maxSpeed: 3.5,
      gyroscopicEffect: 0.5,
    },
    balanceBonus: -30,
    speedBonus: -10,
    color: '#9C27B0',
    accentColor: '#6A1B9A',
    unlocked: false,
  },
]

export const TRACK_TYPES: TrackConfig[] = [
  {
    id: 'straight-easy',
    name: '初学者直道',
    description: '宽阔平坦的直道，最适合新手练习',
    difficulty: 1,
    width: 100,
    length: 1500,
    startX: 80,
    groundY: 0,
    curves: [],
    hasObstacles: false,
    unlocked: true,
  },
  {
    id: 'straight-medium',
    name: '标准直道',
    description: '标准宽度的直道，考验平衡稳定性',
    difficulty: 2,
    width: 60,
    length: 2000,
    startX: 100,
    groundY: 0,
    curves: [],
    hasObstacles: false,
    unlocked: true,
  },
  {
    id: 'straight-hard',
    name: '钢丝直道',
    description: '极窄的赛道，像走钢丝一样惊险',
    difficulty: 3,
    width: 35,
    length: 2500,
    startX: 112,
    groundY: 0,
    curves: [],
    hasObstacles: false,
    unlocked: true,
  },
  {
    id: 'curve-gentle',
    name: '平缓弯道',
    description: '带有平缓弯道的赛道，练习转向控制',
    difficulty: 3,
    width: 70,
    length: 2500,
    startX: 95,
    groundY: 0,
    curves: [
      { startDist: 500, endDist: 800, curvature: 15 },
      { startDist: 1500, endDist: 1800, curvature: -15 },
    ],
    hasObstacles: false,
    unlocked: false,
  },
  {
    id: 'curve-sharp',
    name: '连续急弯',
    description: '连续急转弯，考验反应和平衡能力',
    difficulty: 4,
    width: 50,
    length: 3000,
    startX: 105,
    groundY: 0,
    curves: [
      { startDist: 400, endDist: 700, curvature: 25 },
      { startDist: 1000, endDist: 1300, curvature: -25 },
      { startDist: 1600, endDist: 1900, curvature: 20 },
      { startDist: 2200, endDist: 2500, curvature: -30 },
    ],
    hasObstacles: true,
    unlocked: false,
  },
  {
    id: 'championship',
    name: '冠军赛道',
    description: '终极挑战赛道，包含所有高难度元素',
    difficulty: 5,
    width: 30,
    length: 3500,
    startX: 115,
    groundY: 0,
    curves: [
      { startDist: 300, endDist: 600, curvature: 30 },
      { startDist: 800, endDist: 1100, curvature: -35 },
      { startDist: 1400, endDist: 1700, curvature: 25 },
      { startDist: 1900, endDist: 2200, curvature: -40 },
      { startDist: 2500, endDist: 2800, curvature: 35 },
      { startDist: 3000, endDist: 3300, curvature: -30 },
    ],
    hasObstacles: true,
    unlocked: false,
  },
]

export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  gravity: 0.15,
  balanceForce: 0.08,
  maxSpeed: 5,
  minSpeed: 0.5,
  fallAngle: 45,
  friction: 0.98,
  pedalForce: 0.3,
  steeringSpeed: 0.5,
  cogInfluence: 0.1,
  gyroscopicEffect: 1.0,
}

export const DEFAULT_TRACK_CONFIG: TrackConfig = TRACK_TYPES[1]

export const DEFAULT_BIKE_STATE: BikeState = {
  x: 0,
  y: 0,
  angle: 0,
  speed: 0,
  angularVelocity: 0,
  pedalRotation: 0,
  frontWheelRotation: 0,
  backWheelRotation: 0,
  centerOfGravity: 0,
  handlebarAngle: 0,
}

export const DEFAULT_INPUT_STATE: InputState = {
  left: false,
  right: false,
  pedal: false,
  leanLeft: false,
  leanRight: false,
  shiftUp: false,
  shiftDown: false,
}

export const AI_NAMES = [
  { name: '慢骑老王', emoji: '👴' },
  { name: '闪电李', emoji: '⚡' },
  { name: '平衡大师', emoji: '🧘' },
  { name: '速度狂人', emoji: '🏎️' },
  { name: '稳如泰山', emoji: '🗿' },
  { name: '飘逸侠', emoji: '💨' },
  { name: '蜗牛选手', emoji: '🐌' },
  { name: '不倒翁', emoji: '🪀' },
]

export const CHALLENGES: Challenge[] = [
  {
    id: 'balance-10s',
    name: '平衡10秒',
    description: '在速度低于1km/h时保持平衡10秒',
    type: 'balance',
    target: 10,
    reward: '解锁公路竞赛车',
    completed: false,
    unlocked: true,
  },
  {
    id: 'finish-3',
    name: '完成3场比赛',
    description: '完成任意3场比赛',
    type: 'distance',
    target: 3,
    reward: '解锁平缓弯道赛道',
    completed: false,
    unlocked: true,
  },
  {
    id: 'slow-2min',
    name: '慢骑大师',
    description: '单场比赛用时超过2分钟',
    type: 'time',
    target: 120,
    reward: '解锁独轮车挑战',
    completed: false,
    unlocked: true,
  },
  {
    id: 'hard-track',
    name: '钢丝赛道通关',
    description: '完成钢丝直道比赛',
    type: 'distance',
    target: 1,
    reward: '解锁连续急弯赛道',
    completed: false,
    unlocked: true,
  },
  {
    id: 'master-time',
    name: '永恒慢骑',
    description: '单场比赛用时超过5分钟',
    type: 'time',
    target: 300,
    reward: '解锁冠军赛道',
    completed: false,
    unlocked: false,
  },
]
