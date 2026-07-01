'use client'
import { useRef, useEffect } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'
import * as THREE from 'three'

// ── Soft round particle texture (canvas circle gradient) ──────────────────────
function makeCircleTex(): THREE.Texture {
  const sz = 64
  const canvas = document.createElement('canvas')
  canvas.width = sz; canvas.height = sz
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(sz/2, sz/2, 0, sz/2, sz/2, sz/2)
  g.addColorStop(0,    'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.9)')
  g.addColorStop(0.75, 'rgba(255,255,255,0.3)')
  g.addColorStop(1,    'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, sz, sz)
  return new THREE.CanvasTexture(canvas)
}

// ── Colour palette ────────────────────────────────────────────────────────────
const BLUE = new THREE.Color(0x60a5fa)
const BAND = new THREE.Color(0xa78bfa)
const MIC  = new THREE.Color(0x22d3ee)
const NECK = new THREE.Color(0x4f46e5)
const SHLD = new THREE.Color(0x3730a3)

type Pt = { x: number; y: number; z: number; c: THREE.Color }

// ── 3-D face feature displacement ────────────────────────────────────────────
// bx, sy = normalised sphere coords (−1…+1)
// bz     = depth component: +1 = facing camera, 0 = side, <0 = back
// Returns extra Z offset that deforms the sphere into a human face shape.
function faceDelta(bx: number, sy: number, bz: number): number {
  if (bz <= 0.02) return 0
  const w = bz   // weight fades toward sides
  let d = 0

  // Nose bridge + body (biggest protrusion)
  const nd = bx * bx * 2.2 + (sy + 0.02) * (sy + 0.02) * 2.2
  d += 0.32 * Math.exp(-nd * 5.5) * w

  // Nose tip
  const nt = bx * bx * 7 + (sy + 0.20) * (sy + 0.20) * 7
  d += 0.14 * Math.exp(-nt * 13) * w

  // Nostril wings
  for (const s of [-0.10, 0.10] as const) {
    const nb = (bx - s) * (bx - s) * 22 + (sy + 0.30) * (sy + 0.30) * 22
    d += 0.04 * Math.exp(-nb * 22) * w
  }

  // Brow ridge (above eye sockets)
  for (const s of [-0.26, 0.26] as const) {
    const bd = (bx - s) * (bx - s) * 9 + (sy - 0.30) * (sy - 0.30) * 28
    d += 0.07 * Math.exp(-bd * 18) * w
  }

  // Eye sockets (indented)
  for (const s of [-0.28, 0.28] as const) {
    const ed = (bx - s) * (bx - s) * 6 + (sy - 0.18) * (sy - 0.18) * 9
    d -= 0.09 * Math.exp(-ed * 11) * w
  }

  // Cheekbones (slight forward bulge)
  for (const s of [-0.40, 0.40] as const) {
    const cd = (bx - s) * (bx - s) * 5 + sy * sy * 6
    d += 0.04 * Math.exp(-cd * 11) * w
  }

  // Upper lip / philtrum
  const ul = bx * bx * 4 + (sy + 0.42) * (sy + 0.42) * 5
  d += 0.07 * Math.exp(-ul * 11) * w

  // Lower lip (fuller)
  const ll = bx * bx * 3 + (sy + 0.54) * (sy + 0.54) * 4
  d += 0.10 * Math.exp(-ll * 9) * w

  // Chin
  const ch = bx * bx * 1.8 + (sy + 0.74) * (sy + 0.74) * 2
  d += 0.07 * Math.exp(-ch * 7) * w

  return d
}

// ── Build the 3-D head ────────────────────────────────────────────────────────
function buildHead(total: number): Pt[] {
  const pts: Pt[] = []
  const jit = (a: number) => (Math.random() - 0.5) * a
  const HX = 0.84, HY = 1.06, HZ = 0.90
  const golden = Math.PI * (3 - Math.sqrt(5))

  // ─── HEAD SURFACE (65% of budget)
  // Dense Fibonacci sphere — displacement creates face features.
  // All the same base colour; front-facing particles slightly brighter.
  const headN = Math.floor(total * 0.65)
  for (let i = 0; i < headN; i++) {
    const y01 = (i + 0.5) / headN
    const sy  = 1 - y01 * 2          // +1 top → −1 bottom
    const r   = Math.sqrt(Math.max(0, 1 - sy * sy))
    const theta = golden * i
    const bx = Math.cos(theta) * r
    const bz = Math.sin(theta) * r

    if (sy < -0.90) continue          // neck handles bottom

    // Jaw taper
    let scaleX = 1.0
    if (sy < -0.28) {
      scaleX = 1.0 - Math.max(0, (-sy - 0.28) / 0.64) * 0.42
    }

    const disp = faceDelta(bx, sy, bz)

    const x = bx * HX * scaleX + jit(0.007)
    const y = sy * HY + 0.06         + jit(0.007)
    const z = bz * HZ + disp         + jit(0.007)

    // Subtle depth cue: front particles a touch brighter
    const bright = 0.80 + Math.max(0, bz) * 0.24
    pts.push({ x, y, z, c: BLUE.clone().multiplyScalar(bright) })
  }

  // ─── NECK
  const neckN = Math.floor(total * 0.05)
  for (let i = 0; i < neckN; i++) {
    const a = (i / neckN) * Math.PI * 2 + Math.random() * 0.4
    const t = Math.random()
    pts.push({
      x: Math.cos(a) * (0.17 + t * 0.02),
      y: -1.10 - t * 0.42,
      z: Math.sin(a) * (0.14 + t * 0.02),
      c: NECK,
    })
  }

  // ─── HEADSET BAND
  const bandN = Math.floor(total * 0.07)
  for (let i = 0; i < bandN; i++) {
    const t = i / bandN
    const a = Math.PI * (1 - t)
    pts.push({
      x: Math.cos(a) * 0.92 + jit(0.022),
      y: Math.sin(a) * 0.78 + 0.16 + jit(0.022),
      z: jit(0.028),
      c: BAND,
    })
  }

  // ─── EAR CUPS
  for (const side of [-1, 1] as const) {
    const ecN = Math.floor(total * 0.028)
    for (let i = 0; i < ecN; i++) {
      const a = (i / ecN) * Math.PI * 2
      pts.push({
        x: side * 0.92 + jit(0.05),
        y: 0.03 + Math.cos(a) * 0.14 * (0.4 + Math.random() * 0.6),
        z: Math.sin(a) * 0.10 * Math.random(),
        c: BAND,
      })
    }
  }

  // ─── MIC BOOM
  const boomN = Math.floor(total * 0.055)
  for (let i = 0; i < boomN; i++) {
    const t = i / boomN
    pts.push({
      x: -0.92 - Math.sin(t * Math.PI * 0.44) * 0.18 + jit(0.017),
      y: -t * 0.65 + jit(0.017),
      z:  t * 0.55 + jit(0.017),
      c: MIC,
    })
  }
  const capN = Math.floor(total * 0.016)
  for (let i = 0; i < capN; i++) {
    pts.push({ x: -0.97 + jit(0.08), y: -0.61 + jit(0.08), z: 0.52 + jit(0.08), c: MIC })
  }

  // ─── SHOULDERS
  const shN = Math.floor(total * 0.065)
  for (let i = 0; i < shN; i++) {
    const t  = i / shN
    const a  = -Math.PI * 0.52 + t * Math.PI * 1.04
    const rr = 0.48 + Math.random() * 0.12
    pts.push({ x: Math.cos(a) * 1.44 * rr, y: -1.46 - Math.random() * 0.12, z: Math.sin(a) * 0.42 * rr, c: SHLD })
  }

  // Shuffle + trim
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pts[i], pts[j]] = [pts[j], pts[i]]
  }
  return pts.slice(0, total)
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ParticleFormation({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>
}) {
  const mountRef    = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef as React.RefObject<HTMLElement>,
    offset: ['start 85%', 'center 40%'],
  })
  useMotionValueEvent(scrollYProgress, 'change', v => {
    progressRef.current = Math.min(1, Math.max(0, v))
  })

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const COUNT    = isMobile ? 1600 : 2800

    const W = container.clientWidth  || 480
    const H = container.clientHeight || 560

    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(38, W / H, 0.1, 100)
    camera.position.set(0, 0.06, 5.4)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const circleTex = makeCircleTex()

    const targets   = buildHead(COUNT)
    const N         = targets.length
    const targetPos = new Float32Array(N * 3)
    const startPos  = new Float32Array(N * 3)
    const workPos   = new Float32Array(N * 3)
    const colBuf    = new Float32Array(N * 3)

    for (let i = 0; i < N; i++) {
      const t = targets[i]
      targetPos[i*3]   = t.x; targetPos[i*3+1] = t.y; targetPos[i*3+2] = t.z
      colBuf[i*3]      = t.c.r; colBuf[i*3+1]  = t.c.g; colBuf[i*3+2]  = t.c.b

      const rad = 3.0 + Math.random() * 2.5
      const phi = Math.acos(2 * Math.random() - 1)
      const th  = Math.random() * Math.PI * 2
      startPos[i*3]   = rad * Math.sin(phi) * Math.cos(th)
      startPos[i*3+1] = rad * Math.sin(phi) * Math.sin(th)
      startPos[i*3+2] = rad * Math.cos(phi)
    }
    workPos.set(startPos)

    const geo     = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(workPos, 3)
    geo.setAttribute('position', posAttr)
    geo.setAttribute('color',    new THREE.BufferAttribute(colBuf, 3))

    const mat = new THREE.PointsMaterial({
      size: isMobile ? 0.052 : 0.044,
      vertexColors: true,
      transparent: true,
      opacity: 0.05,
      sizeAttenuation: true,
      depthWrite: false,
      map: circleTex,
    })

    const points = new THREE.Points(geo, mat)
    scene.add(points)

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth, h = container.clientHeight
      if (!w || !h) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(container)

    let raf  = 0
    let rotY = 0
    const eio = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    const tick = () => {
      raf = requestAnimationFrame(tick)

      const p     = progressRef.current
      const eased = eio(p)
      const inv   = 1 - eased

      for (let i = 0; i < N; i++) {
        const i3 = i * 3
        workPos[i3]   = startPos[i3]   * inv + targetPos[i3]   * eased
        workPos[i3+1] = startPos[i3+1] * inv + targetPos[i3+1] * eased
        workPos[i3+2] = startPos[i3+2] * inv + targetPos[i3+2] * eased
      }
      posAttr.needsUpdate = true

      mat.opacity = Math.min(0.95, 0.05 + eased * 0.92)

      if (eased > 0.84) {
        const ramp = (eased - 0.84) / 0.16
        rotY += 0.0030 * ramp
      }
      points.rotation.y = rotY

      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      circleTex.dispose()
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="w-full h-full" style={{ background: 'transparent' }} />
}
