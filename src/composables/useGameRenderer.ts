import { useGameStore } from '@/stores/gameStore'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { BIKE_TYPES } from '@/types/game'

interface Cloud {
  x: number
  y: number
  size: number
  speed: number
}

interface TexturePoint {
  x: number
  y: number
  show: boolean
}

export function useGameRenderer(canvasRef: { value: HTMLCanvasElement | null }) {
  const store = useGameStore()
  const ctx = ref<CanvasRenderingContext2D | null>(null)
  const clouds = ref<Cloud[]>([])
  const grassHeights = ref<number[]>([])
  const trackTextures = ref<TexturePoint[]>([])
  let animationId: number | null = null
  let lastTime = 0

  const currentBike = computed(() => BIKE_TYPES.find(b => b.id === store.currentBikeType) || BIKE_TYPES[0])

  function initCanvas() {
    if (!canvasRef.value) return
    ctx.value = canvasRef.value.getContext('2d')
    initClouds()
  }

  function generateStaticTextures(width: number) {
    grassHeights.value = []
    for (let i = 0; i < width; i += 15) {
      grassHeights.value.push(5 + Math.random() * 8)
    }

    trackTextures.value = []
    for (let i = 0; i < store.track.width; i += 8) {
      for (let j = 0; j < 25; j += 8) {
        trackTextures.value.push({
          x: i + Math.random() * 6,
          y: j + Math.random() * 6,
          show: Math.random() > 0.7,
        })
      }
    }
  }

  function initClouds() {
    clouds.value = []
    for (let i = 0; i < 5; i++) {
      clouds.value.push({
        x: Math.random() * 800,
        y: 30 + Math.random() * 80,
        size: 20 + Math.random() * 30,
        speed: 0.2 + Math.random() * 0.3,
      })
    }
  }

  function resizeCanvas(width: number, height: number) {
    if (!canvasRef.value) return
    canvasRef.value.width = width
    canvasRef.value.height = height
    store.track.groundY = height - 80
    generateStaticTextures(width)
  }

  function getCurveOffset(distance: number): number {
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

  function updateClouds() {
    clouds.value.forEach(cloud => {
      cloud.x += cloud.speed
      if (cloud.x > 850) {
        cloud.x = -50
        cloud.y = 30 + Math.random() * 80
      }
    })
  }

  function drawSky() {
    if (!ctx.value || !canvasRef.value) return
    const gradient = ctx.value.createLinearGradient(0, 0, 0, canvasRef.value.height)
    gradient.addColorStop(0, '#87CEEB')
    gradient.addColorStop(0.7, '#B0E0E6')
    gradient.addColorStop(1, '#E0F7FA')
    ctx.value.fillStyle = gradient
    ctx.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }

  function drawClouds() {
    if (!ctx.value) return
    ctx.value.fillStyle = 'rgba(255, 255, 255, 0.9)'
    clouds.value.forEach(cloud => {
      ctx.value!.beginPath()
      ctx.value!.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2)
      ctx.value!.arc(cloud.x + cloud.size * 0.6, cloud.y - cloud.size * 0.2, cloud.size * 0.7, 0, Math.PI * 2)
      ctx.value!.arc(cloud.x + cloud.size * 1.2, cloud.y, cloud.size * 0.8, 0, Math.PI * 2)
      ctx.value!.fill()
    })
  }

  function drawGrass() {
    if (!ctx.value || !canvasRef.value) return
    const gradient = ctx.value.createLinearGradient(0, store.track.groundY, 0, canvasRef.value.height)
    gradient.addColorStop(0, '#7CB342')
    gradient.addColorStop(1, '#558B2F')
    ctx.value.fillStyle = gradient
    ctx.value.fillRect(0, store.track.groundY, canvasRef.value.width, canvasRef.value.height - store.track.groundY)

    ctx.value.strokeStyle = '#689F38'
    ctx.value.lineWidth = 2
    grassHeights.value.forEach((grassHeight, index) => {
      const x = index * 15
      ctx.value!.beginPath()
      ctx.value!.moveTo(x, store.track.groundY)
      ctx.value!.lineTo(x + 2, store.track.groundY - grassHeight)
      ctx.value!.stroke()
    })
  }

  function drawTrack() {
    if (!ctx.value || !canvasRef.value) return
    const { track } = store
    const trackY = track.groundY
    const curveOffset = getCurveOffset(store.distance)

    const startX = track.startX + curveOffset

    ctx.value.fillStyle = '#8D6E63'
    ctx.value.fillRect(startX - 5, trackY - 5, track.width + 10, 35)

    ctx.value.fillStyle = '#D2B48C'
    ctx.value.fillRect(startX, trackY, track.width, 25)

    ctx.value.strokeStyle = '#A1887F'
    ctx.value.lineWidth = 1
    trackTextures.value.forEach(point => {
      if (point.show) {
        ctx.value!.beginPath()
        ctx.value!.arc(startX + point.x, trackY + point.y, 1, 0, Math.PI * 2)
        ctx.value!.stroke()
      }
    })

    if (track.curves && track.curves.length > 0) {
      ctx.value.fillStyle = '#FF5722'
      ctx.value.beginPath()
      ctx.value.arc(startX + track.width / 2, trackY - 15, 6, 0, Math.PI * 2)
      ctx.value.fill()
      ctx.value.fillStyle = 'white'
      ctx.value.font = 'bold 10px sans-serif'
      ctx.value.textAlign = 'center'
      ctx.value.fillText('↔', startX + track.width / 2, trackY - 11)
    }

    ctx.value.fillStyle = '#E53935'
    ctx.value.fillRect(startX - 5, trackY - 10, 5, 35)
    ctx.value.fillRect(startX + track.width, trackY - 10, 5, 35)

    ctx.value.fillStyle = '#FFFFFF'
    for (let i = 0; i < 25; i += 5) {
      ctx.value.fillRect(startX - 5, trackY - 10 + i, 5, 2)
      ctx.value.fillRect(startX + track.width, trackY - 10 + i, 5, 2)
    }

    const progress = store.distance / track.length
    const finishX = startX + track.width / 2
    const finishY = trackY - 150 * progress

    if (progress > 0) {
      ctx.value.strokeStyle = '#FFD700'
      ctx.value.lineWidth = 3
      ctx.value.setLineDash([5, 5])
      ctx.value.beginPath()
      ctx.value.moveTo(finishX, trackY)
      ctx.value.lineTo(finishX, finishY)
      ctx.value.stroke()
      ctx.value.setLineDash([])

      ctx.value.fillStyle = '#FFD700'
      ctx.value.beginPath()
      ctx.value.moveTo(finishX, finishY)
      ctx.value.lineTo(finishX + 20, finishY - 10)
      ctx.value.lineTo(finishX, finishY - 20)
      ctx.value.closePath()
      ctx.value.fill()
    }
  }

  function drawBikeGeneric(
    x: number,
    y: number,
    angle: number,
    bikeState: any,
    frameColor: string,
    accentColor: string,
    scale: number = 1,
    isPlayer: boolean = true
  ) {
    if (!ctx.value) return
    const groundY = store.track.groundY

    ctx.value.save()
    ctx.value.translate(x, groundY - 40 - y)
    ctx.value.rotate(angle * Math.PI / 180)
    ctx.value.scale(scale, scale)

    const wheelRadius = 18
    const opacity = isPlayer ? 1 : 0.75

    ctx.value.globalAlpha = opacity

    ctx.value.strokeStyle = '#424242'
    ctx.value.lineWidth = 3
    ctx.value.beginPath()
    ctx.value.arc(-25, 20, wheelRadius, 0, Math.PI * 2)
    ctx.value.stroke()
    ctx.value.beginPath()
    ctx.value.arc(25, 20, wheelRadius, 0, Math.PI * 2)
    ctx.value.stroke()

    ctx.value.save()
    ctx.value.translate(-25, 20)
    ctx.value.rotate(bikeState.backWheelRotation)
    ctx.value.strokeStyle = '#616161'
    ctx.value.lineWidth = 2
    for (let i = 0; i < 8; i++) {
      const rotAngle = (i / 8) * Math.PI * 2
      ctx.value.beginPath()
      ctx.value.moveTo(0, 0)
      ctx.value.lineTo(Math.cos(rotAngle) * (wheelRadius - 3), Math.sin(rotAngle) * (wheelRadius - 3))
      ctx.value.stroke()
    }
    ctx.value.restore()

    ctx.value.save()
    ctx.value.translate(25, 20)
    ctx.value.rotate(bikeState.frontWheelRotation)
    ctx.value.strokeStyle = '#616161'
    ctx.value.lineWidth = 2
    for (let i = 0; i < 8; i++) {
      const rotAngle = (i / 8) * Math.PI * 2
      ctx.value.beginPath()
      ctx.value.moveTo(0, 0)
      ctx.value.lineTo(Math.cos(rotAngle) * (wheelRadius - 3), Math.sin(rotAngle) * (wheelRadius - 3))
      ctx.value.stroke()
    }
    ctx.value.restore()

    ctx.value.strokeStyle = frameColor
    ctx.value.lineWidth = 4
    ctx.value.lineCap = 'round'

    ctx.value.beginPath()
    ctx.value.moveTo(-25, 20)
    ctx.value.lineTo(0, -10)
    ctx.value.lineTo(25, 20)
    ctx.value.stroke()

    ctx.value.beginPath()
    ctx.value.moveTo(0, -10)
    ctx.value.lineTo(0, 10)
    ctx.value.stroke()

    ctx.value.beginPath()
    ctx.value.moveTo(-10, 0)
    ctx.value.lineTo(10, 0)
    ctx.value.stroke()

    ctx.value.strokeStyle = accentColor
    ctx.value.lineWidth = 3
    ctx.value.beginPath()
    ctx.value.arc(0, 10, 8, 0, Math.PI * 2)
    ctx.value.stroke()

    ctx.value.save()
    ctx.value.translate(0, 10)
    ctx.value.rotate(bikeState.pedalRotation)
    ctx.value.strokeStyle = '#546E7A'
    ctx.value.lineWidth = 3
    ctx.value.beginPath()
    ctx.value.moveTo(-8, 0)
    ctx.value.lineTo(8, 0)
    ctx.value.stroke()
    ctx.value.fillStyle = '#78909C'
    ctx.value.fillRect(-10, -3, 4, 6)
    ctx.value.fillRect(6, -3, 4, 6)
    ctx.value.restore()

    ctx.value.strokeStyle = frameColor
    ctx.value.lineWidth = 3
    ctx.value.beginPath()
    ctx.value.moveTo(25, 20)
    ctx.value.lineTo(30, -15)
    ctx.value.stroke()

    ctx.value.strokeStyle = accentColor
    ctx.value.lineWidth = 4
    ctx.value.beginPath()
    ctx.value.moveTo(22, -18)
    ctx.value.lineTo(38, -18)
    ctx.value.stroke()

    ctx.value.fillStyle = '#455A64'
    ctx.value.beginPath()
    ctx.value.ellipse(-8, -15, 12, 6, 0, 0, Math.PI * 2)
    ctx.value.fill()

    if (isPlayer) {
      ctx.value.fillStyle = '#FFCCBC'
      ctx.value.beginPath()
      ctx.value.arc(-5, -30, 8, 0, Math.PI * 2)
      ctx.value.fill()

      ctx.value.fillStyle = '#212121'
      ctx.value.beginPath()
      ctx.value.arc(-5, -32, 3, 0, Math.PI * 2)
      ctx.value.fill()
    } else {
      ctx.value.fillStyle = frameColor
      ctx.value.beginPath()
      ctx.value.arc(-5, -30, 8, 0, Math.PI * 2)
      ctx.value.fill()

      ctx.value.fillStyle = 'white'
      ctx.value.font = 'bold 10px sans-serif'
      ctx.value.textAlign = 'center'
      ctx.value.fillText('AI', -5, -27)
    }

    ctx.value.restore()
  }

  function drawAIOpponents() {
    if (!ctx.value) return

    store.aiOpponents.forEach((ai, index) => {
      if (ai.isFinished && ai.failReason) return

      const progressDiff = (ai.distance - store.distance) / 50
      const aiX = store.bike.x + progressDiff * 30
      const aiY = progressDiff * 15
      const baseCenter = store.track.startX + store.track.width / 2
      const curveOffset = getCurveOffset(ai.distance)
      const finalX = Math.max(
        store.track.startX + 15,
        Math.min(
          store.track.startX + store.track.width - 15,
          baseCenter + curveOffset + (ai.bike.angle || 0) * 0.15
        )
      )

      if (progressDiff > -2 && progressDiff < 3) {
        drawBikeGeneric(
          finalX,
          Math.min(60, Math.max(0, -progressDiff * 20)),
          ai.bike.angle || 0,
          ai.bike,
          ai.color,
          ai.color,
          Math.max(0.5, Math.min(1, 1 - progressDiff * 0.15)),
          false
        )

        ctx.value!.save()
        ctx.value!.globalAlpha = 0.9
        ctx.value!.font = 'bold 11px sans-serif'
        ctx.value!.textAlign = 'center'
        ctx.value!.fillStyle = ai.color
        const labelY = store.track.groundY - 75 - Math.min(60, Math.max(0, -progressDiff * 20))
        ctx.value!.fillText(`${ai.emoji} ${ai.name}`, finalX, labelY)
        ctx.value!.restore()
      } else if (progressDiff >= 3) {
        ctx.value!.save()
        ctx.value!.globalAlpha = 0.7
        ctx.value!.fillStyle = ai.color
        ctx.value!.font = 'bold 12px sans-serif'
        ctx.value!.textAlign = 'center'
        ctx.value!.fillText(`${ai.emoji} ${ai.name} 领先`, store.track.startX + store.track.width + 50, store.track.groundY - 60)
        ctx.value!.restore()
      }
    })
  }

  function drawBike() {
    if (!ctx.value) return
    const { bike } = store
    const bikeType = currentBike.value

    drawBikeGeneric(
      bike.x,
      0,
      bike.angle,
      bike,
      bikeType.color,
      bikeType.accentColor,
      1,
      true
    )

    if (store.zeroSpeedTime > 1 && store.status === 'playing') {
      ctx.value.fillStyle = 'rgba(244, 67, 54, 0.8)'
      ctx.value.font = 'bold 16px sans-serif'
      ctx.value.textAlign = 'center'
      ctx.value.fillText('⚠️ 速度太慢！', bike.x, store.track.groundY - 80)
    }

    if (Math.abs(store.balancePercent) > 70 && store.status === 'playing') {
      ctx.value.fillStyle = 'rgba(255, 152, 0, 0.9)'
      ctx.value.font = 'bold 16px sans-serif'
      ctx.value.textAlign = 'center'
      ctx.value.fillText('⚠️ 快要倒了！', bike.x, store.track.groundY - 80)
    }

    if (store.combo > 0 && store.status === 'playing') {
      ctx.value.fillStyle = 'rgba(76, 175, 80, 0.9)'
      ctx.value.font = 'bold 16px sans-serif'
      ctx.value.textAlign = 'center'
      ctx.value.fillText(`✨ 完美平衡 x${store.combo} +${store.score}`, bike.x, store.track.groundY - 100)
    }
  }

  function drawProgress() {
    if (!ctx.value || !canvasRef.value) return
    const { track, distance } = store
    const progress = Math.min(1, distance / track.length)

    const barWidth = 200
    const barHeight = 10
    const barX = canvasRef.value.width - barWidth - 20
    const barY = 20

    ctx.value.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.value.fillRect(barX, barY, barWidth, barHeight)

    ctx.value.fillStyle = '#4CAF50'
    ctx.value.fillRect(barX, barY, barWidth * progress, barHeight)

    ctx.value.strokeStyle = '#2E7D32'
    ctx.value.lineWidth = 2
    ctx.value.strokeRect(barX, barY, barWidth, barHeight)

    ctx.value.fillStyle = '#1B5E20'
    ctx.value.font = '12px sans-serif'
    ctx.value.textAlign = 'right'
    ctx.value.fillText(`${Math.floor(progress * 100)}%`, barX + barWidth, barY - 5)

    if (store.mode !== 'training') {
      ctx.value.font = 'bold 11px sans-serif'
      ctx.value.textAlign = 'right'
      ctx.value.fillStyle = '#FF9800'
      ctx.value.fillText(`分数: ${store.score}`, barX + barWidth, barY + barHeight + 18)
    }
  }

  function render(timestamp: number) {
    if (!ctx.value || !canvasRef.value) return

    const deltaTime = lastTime ? (timestamp - lastTime) / 1000 : 1 / 60
    lastTime = timestamp

    updateClouds()

    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    drawSky()
    drawClouds()
    drawGrass()
    drawTrack()
    drawAIOpponents()
    drawBike()
    drawProgress()

    animationId = requestAnimationFrame(render)
  }

  function startRender() {
    if (animationId) cancelAnimationFrame(animationId)
    lastTime = 0
    animationId = requestAnimationFrame(render)
  }

  function stopRender() {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  onMounted(() => {
    initCanvas()
    startRender()
  })

  onUnmounted(() => {
    stopRender()
  })

  return {
    initCanvas,
    resizeCanvas,
    startRender,
    stopRender,
  }
}
