import { useGameStore } from '@/stores/gameStore'
import { computed } from 'vue'
import { BIKE_TYPES, DEFAULT_PHYSICS_CONFIG, type BikeState } from '@/types/game'

export function useGamePhysics() {
  const store = useGameStore()

  const currentBikeType = computed(() => {
    return BIKE_TYPES.find(b => b.id === store.currentBikeType) || BIKE_TYPES[0]
  })

  const mergedPhysics = computed(() => {
    const bike = currentBikeType.value
    return {
      ...DEFAULT_PHYSICS_CONFIG,
      ...bike.physics,
    }
  })

  const trackCenterX = computed(() => {
    const baseCenter = store.track.startX + store.track.width / 2
    const curve = getCurrentCurveOffset(store.distance)
    return baseCenter + curve
  })

  function getCurrentCurveOffset(distance: number): number {
    const curves = store.track.curves || []
    for (const curve of curves) {
      if (distance >= curve.startDist && distance < curve.endDist) {
        const progress = (distance - curve.startDist) / (curve.endDist - curve.startDist)
        const wave = Math.sin(progress * Math.PI)
        return curve.curvature * wave
      }
    }
    return 0
  }

  function updatePlayerPhysics(deltaTime: number = 1 / 60) {
    if (store.status !== 'playing') return

    const bike = store.bike
    const physics = mergedPhysics.value
    const track = store.track
    const input = store.input
    const bikeType = currentBikeType.value

    if (input.pedal && bike.speed < physics.maxSpeed) {
      const forceMultiplier = 1 + bikeType.speedBonus / 100
      bike.speed += physics.pedalForce * forceMultiplier * deltaTime * 60
    }

    if (input.shiftUp) {
      bike.centerOfGravity = Math.max(-1, bike.centerOfGravity - 0.02 * deltaTime * 60)
    } else if (input.shiftDown) {
      bike.centerOfGravity = Math.min(1, bike.centerOfGravity + 0.02 * deltaTime * 60)
    } else {
      bike.centerOfGravity *= 0.95
    }

    bike.speed *= Math.pow(physics.friction, deltaTime * 60)
    bike.speed = Math.max(0, Math.min(physics.maxSpeed, bike.speed))

    const leanInput = (input.leanRight ? 1 : 0) - (input.leanLeft ? 1 : 0)
    if (leanInput !== 0) {
      bike.handlebarAngle = Math.max(-30, Math.min(30, bike.handlebarAngle + leanInput * physics.steeringSpeed * deltaTime * 60))
    } else {
      bike.handlebarAngle *= 0.9
    }

    const balanceInput = (input.right ? 1 : 0) - (input.left ? 1 : 0)
    const balanceMultiplier = 1 + bikeType.balanceBonus / 100
    const balanceTorque = balanceInput * physics.balanceForce * balanceMultiplier * 3

    const cogTorque = bike.centerOfGravity * physics.cogInfluence * 2

    const gravityTorque = Math.sin(bike.angle * Math.PI / 180) * physics.gravity

    const gyroEffect = bike.speed > 0.1
      ? -bike.angularVelocity * (1 - physics.gyroscopicEffect) * 0.1
      : 0

    const speedFactor = Math.max(0.2, bike.speed / physics.minSpeed)
    const handlebarBalance = -bike.handlebarAngle * 0.02 * speedFactor
    const stabilityTorque = -bike.angle * physics.balanceForce * speedFactor * balanceMultiplier

    const curveForce = -getCurrentCurveOffset(store.distance) * 0.005

    const totalTorque = balanceTorque + gravityTorque + stabilityTorque + cogTorque + gyroEffect + handlebarBalance + curveForce
    bike.angularVelocity += totalTorque * deltaTime * 60
    bike.angularVelocity *= 0.92
    bike.angle += bike.angularVelocity * deltaTime * 60

    bike.angle = Math.max(-89, Math.min(89, bike.angle))

    if (Math.abs(bike.angle) > physics.fallAngle) {
      store.endGame('倒地了！倾斜角度过大')
      return
    }

    const horizontalShift = bike.angle * 0.15 + bike.handlebarAngle * 0.1
    bike.x = trackCenterX.value + horizontalShift

    const leftEdge = track.startX
    const rightEdge = track.startX + track.width
    const bikeWidth = 30

    if (bike.x - bikeWidth / 2 < leftEdge || bike.x + bikeWidth / 2 > rightEdge) {
      store.endGame('骑出赛道边界了！')
      return
    }

    if (bike.speed < 0.1) {
      store.zeroSpeedTime += deltaTime
      if (store.zeroSpeedTime > 2) {
        store.endGame('脚落地了！速度太慢')
        return
      }
    } else {
      store.zeroSpeedTime = 0
    }

    if (Math.abs(bike.angle) < 5 && bike.speed > 0.3 && bike.speed < 2) {
      store.perfectBalanceTime += deltaTime
      if (store.perfectBalanceTime > 1 && store.perfectBalanceTime % 1 < deltaTime) {
        store.combo += 1
        store.score += 10 * store.combo
      }
    } else {
      store.perfectBalanceTime = 0
      store.combo = 0
    }

    store.distance += bike.speed * deltaTime * 60

    if (store.distance >= track.length) {
      store.endGame('完成比赛！')
      return
    }

    bike.frontWheelRotation += bike.speed * 2 * deltaTime * 60
    bike.backWheelRotation += bike.speed * 2 * deltaTime * 60
    if (input.pedal) {
      bike.pedalRotation += 5 * deltaTime * 60
    }

    store.time += deltaTime

    store.updateGameState({
      time: store.time,
      distance: store.distance,
      zeroSpeedTime: store.zeroSpeedTime,
    })
  }

  function updateAIState(
    aiBike: BikeState,
    aiSkill: number,
    aiAggressiveness: number,
    deltaTime: number
  ): {
    bike: BikeState
    distance: number
    isFinished: boolean
    failReason?: string
  } {
    const physics = DEFAULT_PHYSICS_CONFIG
    const track = store.track
    const bike = { ...aiBike }

    const pedalChance = 0.5 + aiAggressiveness * 0.3
    if (Math.random() < pedalChance * deltaTime * 60 && bike.speed < physics.maxSpeed) {
      const targetSpeed = 0.8 + aiAggressiveness * 2
      if (bike.speed < targetSpeed) {
        bike.speed += physics.pedalForce * 0.8 * deltaTime * 60
      }
    }

    bike.speed *= Math.pow(physics.friction, deltaTime * 60)
    bike.speed = Math.max(0.3, Math.min(physics.maxSpeed, bike.speed))

    const balanceNoise = (Math.random() - 0.5) * (1 - aiSkill) * 2
    const idealAngle = -getCurrentCurveOffset(store.distance + aiBike.x) * 0.5
    const targetAngle = idealAngle + balanceNoise
    const balanceCorrection = (targetAngle - bike.angle) * aiSkill * 0.08

    const gravityTorque = Math.sin(bike.angle * Math.PI / 180) * physics.gravity
    const speedFactor = Math.max(0.3, bike.speed / physics.minSpeed)
    const stabilityTorque = -bike.angle * physics.balanceForce * speedFactor * (0.7 + aiSkill * 0.6)

    const totalTorque = balanceCorrection + gravityTorque + stabilityTorque
    bike.angularVelocity += totalTorque * deltaTime * 60
    bike.angularVelocity *= 0.93
    bike.angle += bike.angularVelocity * deltaTime * 60

    bike.angle = Math.max(-60, Math.min(60, bike.angle))

    let failReason: string | undefined
    let isFinished = false

    if (Math.abs(bike.angle) > physics.fallAngle * (0.9 + aiSkill * 0.2)) {
      failReason = '倒地'
      bike.speed = 0
    }

    const curveOffset = getCurrentCurveOffset(store.distance + aiBike.x)
    const baseCenter = track.startX + track.width / 2
    const horizontalShift = bike.angle * 0.15
    bike.x = baseCenter + curveOffset + horizontalShift

    const leftEdge = track.startX
    const rightEdge = track.startX + track.width
    const bikeWidth = 25
    if (bike.x - bikeWidth / 2 < leftEdge) {
      bike.x = leftEdge + bikeWidth / 2
      bike.angle = Math.abs(bike.angle) * 0.5
    }
    if (bike.x + bikeWidth / 2 > rightEdge) {
      bike.x = rightEdge - bikeWidth / 2
      bike.angle = -Math.abs(bike.angle) * 0.5
    }

    const newDistance = store.distance + bike.speed * deltaTime * 60

    if (newDistance >= track.length && !failReason) {
      isFinished = true
    }

    bike.frontWheelRotation += bike.speed * 2 * deltaTime * 60
    bike.backWheelRotation += bike.speed * 2 * deltaTime * 60
    bike.pedalRotation += 3 * deltaTime * 60

    return {
      bike,
      distance: newDistance,
      isFinished,
      failReason,
    }
  }

  return {
    updatePlayerPhysics,
    updateAIState,
    getCurrentCurveOffset,
    currentBikeType,
    mergedPhysics,
    trackCenterX,
  }
}
