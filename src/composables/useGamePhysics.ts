import { useGameStore } from '@/stores/gameStore'
import { computed } from 'vue'

export function useGamePhysics() {
  const store = useGameStore()

  const trackCenterX = computed(() => store.track.startX + store.track.width / 2)

  function updatePhysics(deltaTime: number = 1 / 60) {
    if (store.status !== 'playing') return

    const { bike, physics, track, input } = store

    if (input.pedal && bike.speed < physics.maxSpeed) {
      bike.speed += physics.pedalForce * deltaTime * 60
    }

    bike.speed *= Math.pow(physics.friction, deltaTime * 60)
    bike.speed = Math.max(0, Math.min(physics.maxSpeed, bike.speed))

    const balanceInput = (input.right ? 1 : 0) - (input.left ? 1 : 0)
    const balanceTorque = balanceInput * physics.balanceForce * 3

    const gravityTorque = Math.sin(bike.angle * Math.PI / 180) * physics.gravity

    const speedFactor = Math.max(0.3, bike.speed / physics.minSpeed)
    const stabilityTorque = -bike.angle * physics.balanceForce * speedFactor

    const totalTorque = balanceTorque + gravityTorque + stabilityTorque
    bike.angularVelocity += totalTorque * deltaTime * 60
    bike.angularVelocity *= 0.92
    bike.angle += bike.angularVelocity * deltaTime * 60

    bike.angle = Math.max(-89, Math.min(89, bike.angle))

    if (Math.abs(bike.angle) > physics.fallAngle) {
      store.endGame('倒地了！倾斜角度过大')
      return
    }

    const horizontalShift = bike.angle * 0.15
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

  return {
    updatePhysics,
  }
}
