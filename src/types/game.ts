export interface BikeState {
  x: number
  y: number
  angle: number
  speed: number
  angularVelocity: number
  pedalRotation: number
  frontWheelRotation: number
  backWheelRotation: number
}

export interface TrackConfig {
  width: number
  length: number
  startX: number
  groundY: number
}

export interface PhysicsConfig {
  gravity: number
  balanceForce: number
  maxSpeed: number
  minSpeed: number
  fallAngle: number
  friction: number
  pedalForce: number
}

export interface GameState {
  status: 'idle' | 'playing' | 'ended'
  bike: BikeState
  track: TrackConfig
  time: number
  distance: number
  isFootDown: boolean
  isOutOfTrack: boolean
  isFallen: boolean
  failReason?: string
  zeroSpeedTime: number
}

export interface LeaderboardEntry {
  id: string
  time: number
  distance: number
  date: string
  isCompleted: boolean
}

export interface InputState {
  left: boolean
  right: boolean
  pedal: boolean
}

export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  gravity: 0.15,
  balanceForce: 0.08,
  maxSpeed: 5,
  minSpeed: 0.5,
  fallAngle: 45,
  friction: 0.98,
  pedalForce: 0.3,
}

export const DEFAULT_TRACK_CONFIG: TrackConfig = {
  width: 60,
  length: 2000,
  startX: 100,
  groundY: 0,
}

export const DEFAULT_BIKE_STATE: BikeState = {
  x: 0,
  y: 0,
  angle: 0,
  speed: 0,
  angularVelocity: 0,
  pedalRotation: 0,
  frontWheelRotation: 0,
  backWheelRotation: 0,
}
