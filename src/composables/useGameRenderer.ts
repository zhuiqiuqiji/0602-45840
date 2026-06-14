import { useGameStore } from '@/stores/gameStore'
import { ref, onMounted, onUnmounted } from 'vue'

interface Cloud {
  x: number
  y: number
  size: number
  speed: number
}

export function useGameRenderer(canvasRef: { value: HTMLCanvasElement | null }) {
  const store = useGameStore()
  const ctx = ref<CanvasRenderingContext2D | null>(null)
  const clouds = ref<Cloud[]>([])
  let animationId: number | null = null
  let lastTime = 0

  function initCanvas() {
    if (!canvasRef.value) return
    ctx.value = canvasRef.value.getContext('2d')
    initClouds()
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
    for (let i = 0; i < canvasRef.value.width; i += 15) {
      const grassHeight = 5 + Math.random() * 8
      ctx.value.beginPath()
      ctx.value.moveTo(i, store.track.groundY)
      ctx.value.lineTo(i + 2, store.track.groundY - grassHeight)
      ctx.value.stroke()
    }
  }

  function drawTrack() {
    if (!ctx.value || !canvasRef.value) return
    const { track } = store
    const trackY = track.groundY

    ctx.value.fillStyle = '#8D6E63'
    ctx.value.fillRect(track.startX - 5, trackY - 5, track.width + 10, 35)

    ctx.value.fillStyle = '#D2B48C'
    ctx.value.fillRect(track.startX, trackY, track.width, 25)

    ctx.value.strokeStyle = '#A1887F'
    ctx.value.lineWidth = 1
    for (let i = 0; i < track.width; i += 8) {
      for (let j = 0; j < 25; j += 8) {
        if (Math.random() > 0.7) {
          ctx.value.beginPath()
          ctx.value.arc(track.startX + i + Math.random() * 6, trackY + j + Math.random() * 6, 1, 0, Math.PI * 2)
          ctx.value.stroke()
        }
      }
    }

    ctx.value.fillStyle = '#E53935'
    ctx.value.fillRect(track.startX - 5, trackY - 10, 5, 35)
    ctx.value.fillRect(track.startX + track.width, trackY - 10, 5, 35)

    ctx.value.fillStyle = '#FFFFFF'
    for (let i = 0; i < 25; i += 5) {
      ctx.value.fillRect(track.startX - 5, trackY - 10 + i, 5, 2)
      ctx.value.fillRect(track.startX + track.width, trackY - 10 + i, 5, 2)
    }

    const progress = store.distance / track.length
    const finishX = track.startX + track.width / 2
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

  function drawBike() {
    if (!ctx.value) return
    const { bike, track } = store
    const groundY = track.groundY

    ctx.value.save()
    ctx.value.translate(bike.x, groundY - 40)
    ctx.value.rotate(bike.angle * Math.PI / 180)

    const wheelRadius = 18
    const frameColor = '#37474F'
    const accentColor = '#FF5722'

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
    ctx.value.rotate(bike.backWheelRotation)
    ctx.value.strokeStyle = '#616161'
    ctx.value.lineWidth = 2
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      ctx.value.beginPath()
      ctx.value.moveTo(0, 0)
      ctx.value.lineTo(Math.cos(angle) * (wheelRadius - 3), Math.sin(angle) * (wheelRadius - 3))
      ctx.value.stroke()
    }
    ctx.value.restore()

    ctx.value.save()
    ctx.value.translate(25, 20)
    ctx.value.rotate(bike.frontWheelRotation)
    ctx.value.strokeStyle = '#616161'
    ctx.value.lineWidth = 2
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      ctx.value.beginPath()
      ctx.value.moveTo(0, 0)
      ctx.value.lineTo(Math.cos(angle) * (wheelRadius - 3), Math.sin(angle) * (wheelRadius - 3))
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
    ctx.value.rotate(bike.pedalRotation)
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

    ctx.value.fillStyle = '#FFCCBC'
    ctx.value.beginPath()
    ctx.value.arc(-5, -30, 8, 0, Math.PI * 2)
    ctx.value.fill()

    ctx.value.fillStyle = '#212121'
    ctx.value.beginPath()
    ctx.value.arc(-5, -32, 3, 0, Math.PI * 2)
    ctx.value.fill()

    ctx.value.restore()

    if (store.zeroSpeedTime > 1 && store.status === 'playing') {
      ctx.value.fillStyle = 'rgba(244, 67, 54, 0.8)'
      ctx.value.font = 'bold 16px sans-serif'
      ctx.value.textAlign = 'center'
      ctx.value.fillText('⚠️ 速度太慢！', bike.x, groundY - 80)
    }

    if (Math.abs(store.balancePercent) > 70 && store.status === 'playing') {
      ctx.value.fillStyle = 'rgba(255, 152, 0, 0.9)'
      ctx.value.font = 'bold 16px sans-serif'
      ctx.value.textAlign = 'center'
      ctx.value.fillText('⚠️ 快要倒了！', bike.x, groundY - 80)
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
