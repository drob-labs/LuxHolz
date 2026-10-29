<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const props = defineProps<{ active: number; label: string }>()
const host = ref<HTMLDivElement>()
let setActive = (_: number) => {}
let cleanup = () => {}

watch(() => props.active, (i) => setActive(i))

onMounted(() => {
  const el = host.value!
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.5

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  camera.position.set(0, 1.4, 8)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.AmbientLight(0xffe9d2, 0.35))
  const key = new THREE.DirectionalLight(0xfff1dd, 2.2)
  key.position.set(3, 6, 4)
  const rimA = new THREE.PointLight(0xb23a5b, 45, 20)
  rimA.position.set(-4, 1.5, -2.5)
  const rimB = new THREE.PointLight(0xe8b86a, 35, 20)
  rimB.position.set(4, -1, -2)
  scene.add(key, rimA, rimB)

  // ---- Textures ----
  const loader = new THREE.TextureLoader()
  // Clones share the image but each needs its own upload flag once it arrives
  const clones = new Map<THREE.Texture, THREE.Texture[]>()
  const loadTex = (url: string) => {
    const tex: THREE.Texture = loader.load(url, () => clones.get(tex)?.forEach((c) => (c.needsUpdate = true)))
    clones.set(tex, [])
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
    return tex
  }
  const oakTex = loadTex('/images/parquet-detail.webp')
  const vinylTex = loadTex('/images/vinyl-detail.webp')
  const disposables: { dispose(): void }[] = [oakTex, vinylTex]

  const cloneTex = (tex: THREE.Texture) => {
    const c = tex.clone()
    clones.get(tex)!.push(c)
    if (tex.image) c.needsUpdate = true
    return c
  }
  const plankTop = (tex: THREE.Texture, i: number, count: number, roughness: number) => {
    const t = cloneTex(tex)
    t.repeat.set(1 / count, 0.9)
    t.offset.set(i / count, (i % 2) * 0.08)
    disposables.push(t)
    return new THREE.MeshPhysicalMaterial({ map: t, roughness, clearcoat: 0.6, clearcoatRoughness: 0.35 })
  }

  // ---- Flooring samples ----
  const PLANKS = 5
  const W = 0.5
  const L = 2.9
  const stagger = [0, 0.38, -0.22, 0.18, -0.34]

  interface Sample { group: THREE.Group; parts: { mesh: THREE.Object3D; base: THREE.Vector3; dir: THREE.Vector3 }[]; scale: number }

  function floorSample(tex: THREE.Texture, edgeColor: number, thickness: number, roughness: number, underlay?: number): Sample {
    const group = new THREE.Group()
    const parts: Sample['parts'] = []
    const edge = new THREE.MeshStandardMaterial({ color: edgeColor, roughness: 0.8 })
    disposables.push(edge)
    const geo = new THREE.BoxGeometry(W - 0.025, thickness, L)
    disposables.push(geo)
    for (let i = 0; i < PLANKS; i++) {
      const top = plankTop(tex, i, PLANKS, roughness)
      disposables.push(top)
      const plank = new THREE.Mesh(geo, [edge, edge, top, edge, edge, edge])
      const x = (i - (PLANKS - 1) / 2) * W
      plank.position.set(x, 0, stagger[i]!)
      group.add(plank)
      parts.push({ mesh: plank, base: plank.position.clone(), dir: new THREE.Vector3(x * 0.35, (i % 2 ? 0.18 : 0.32), 0) })
    }
    if (underlay !== undefined) {
      const ul = new THREE.Mesh(
        new THREE.BoxGeometry(PLANKS * W, 0.05, L + 0.2),
        new THREE.MeshStandardMaterial({ color: underlay, roughness: 1 }),
      )
      disposables.push(ul.geometry, ul.material as THREE.Material)
      ul.position.y = -thickness / 2 - 0.04
      group.add(ul)
      parts.push({ mesh: ul, base: ul.position.clone(), dir: new THREE.Vector3(0, -0.35, 0) })
    }
    return { group, parts, scale: 0 }
  }

  function skirtingSample(): Sample {
    const group = new THREE.Group()
    const parts: Sample['parts'] = []
    // Profile (x = depth, y = height) with a rounded top edge and a rear cable channel
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(0.16, 0)
    s.lineTo(0.16, 0.72)
    s.quadraticCurveTo(0.16, 0.82, 0.08, 0.84)
    s.lineTo(0, 0.85)
    s.lineTo(0, 0.42)
    s.lineTo(0.07, 0.42)
    s.lineTo(0.07, 0.22)
    s.lineTo(0, 0.22)
    s.lineTo(0, 0)
    const extrude = (length: number) => {
      const geo = new THREE.ExtrudeGeometry(s, { depth: length, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 })
      geo.center()
      disposables.push(geo)
      return geo
    }
    const lacquer = new THREE.MeshPhysicalMaterial({ color: 0xf4f1ea, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 })
    const veneerTex = cloneTex(oakTex)
    veneerTex.wrapS = veneerTex.wrapT = THREE.RepeatWrapping
    veneerTex.repeat.set(0.8, 0.25)
    const veneer = new THREE.MeshPhysicalMaterial({ map: veneerTex, roughness: 0.45, clearcoat: 0.5 })
    disposables.push(lacquer, veneer, veneerTex)

    // Oak floor with two skirting finishes meeting in a corner: white lacquer at the back, oak veneer on the side
    const floor = floorSample(oakTex, 0x7a5a3d, 0.12, 0.5)
    group.add(floor.group)
    floor.parts.forEach((p) => parts.push({ ...p, dir: p.dir.clone().multiplyScalar(0.35) }))
    const back = new THREE.Mesh(extrude(PLANKS * W + 0.2), lacquer)
    back.rotation.y = -Math.PI / 2 // length along x, rounded face toward the room
    back.position.set(0.08, 0.485, -L / 2 - 0.45)
    const side = new THREE.Mesh(extrude(L + 0.8), veneer)
    side.position.set(-(PLANKS * W) / 2 - 0.1, 0.485, -0.05)
    group.add(back, side)
    parts.push({ mesh: back, base: back.position.clone(), dir: new THREE.Vector3(0, 0.3, -0.35) })
    parts.push({ mesh: side, base: side.position.clone(), dir: new THREE.Vector3(-0.35, 0.3, 0) })
    return { group, parts, scale: 0 }
  }

  const samples: Sample[] = [
    floorSample(oakTex, 0x7a5a3d, 0.16, 0.5),
    floorSample(vinylTex, 0x3b3a3c, 0.09, 0.32, 0x5a2a36),
    skirtingSample(),
  ]
  const stage = new THREE.Group()
  samples.forEach((s) => {
    s.group.scale.setScalar(0.001)
    s.group.visible = false
    stage.add(s.group)
  })
  scene.add(stage)

  // Orbit rings + soft floor glow
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.007, 8, 220), new THREE.MeshBasicMaterial({ color: 0xe0b46a, transparent: true, opacity: 0.5 }))
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.005, 8, 220), new THREE.MeshBasicMaterial({ color: 0xb23a5b, transparent: true, opacity: 0.45 }))
  ringA.rotation.x = Math.PI / 2.15
  ringB.rotation.set(Math.PI / 1.9, 0.25, 0)
  const bead = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffd9a0 }))
  ringA.add(bead)
  scene.add(ringA, ringB)
  disposables.push(ringA.geometry, ringB.geometry, bead.geometry, ringA.material as THREE.Material, ringB.material as THREE.Material, bead.material as THREE.Material)

  const glowCanvas = document.createElement('canvas')
  glowCanvas.width = glowCanvas.height = 128
  const g = glowCanvas.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(224,180,106,.55)')
  grad.addColorStop(1, 'rgba(224,180,106,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  const glowTex = new THREE.CanvasTexture(glowCanvas)
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
  glow.rotation.x = -Math.PI / 2
  glow.position.y = -1.3
  scene.add(glow)
  disposables.push(glowTex, glow.geometry, glow.material as THREE.Material)

  // Warm dust
  const count = 500
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) pos.set([(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8 - 2], i * 3)
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const dustMat = new THREE.PointsMaterial({ color: 0xf0c98a, size: 0.022, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })
  const dust = new THREE.Points(dustGeo, dustMat)
  scene.add(dust)
  disposables.push(dustGeo, dustMat)

  // ---- Interaction ----
  let current = props.active
  let spinBoost = 0
  setActive = (i) => {
    current = i
    spinBoost = 0.12
  }

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  let hover = false
  let explode = 0
  let spin = 0
  let spinVel = 0
  let dragging = false
  let lastX = 0
  let scrollT = 0

  const onMove = (e: PointerEvent) => {
    pointer.tx = (e.clientX / innerWidth) * 2 - 1
    pointer.ty = (e.clientY / innerHeight) * 2 - 1
    if (dragging) {
      spinVel = (e.clientX - lastX) * 0.005
      lastX = e.clientX
    }
  }
  const onDown = (e: PointerEvent) => {
    dragging = true
    lastX = e.clientX
    el.setPointerCapture(e.pointerId)
  }
  const onUp = () => (dragging = false)
  const onEnter = () => (hover = true)
  const onLeave = () => (hover = false)
  const onScroll = () => (scrollT = Math.min(scrollY / innerHeight, 1.2))
  addEventListener('pointermove', onMove, { passive: true })
  addEventListener('scroll', onScroll, { passive: true })
  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointerup', onUp)
  el.addEventListener('pointercancel', onUp)
  el.addEventListener('pointerenter', onEnter)
  el.addEventListener('pointerleave', onLeave)

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = el
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.position.z = w / h < 0.9 ? 10.5 : 8
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(el)
  resize()

  let visible = true
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
  io.observe(el)

  const motion = reduced ? 0.25 : 1
  const start = performance.now()
  let frame = 0

  const tick = () => {
    frame = requestAnimationFrame(tick)
    if (!visible || document.hidden) return
    const t = (performance.now() - start) / 1000

    pointer.x += (pointer.tx - pointer.x) * 0.05
    pointer.y += (pointer.ty - pointer.y) * 0.05
    spin += spinVel + spinBoost
    spinBoost *= 0.92
    if (!dragging) spinVel *= 0.95

    // Planks drift apart while hovered (or as the visitor scrolls away)
    explode += ((hover ? 1 : 0.15 + Math.sin(t * 0.8) * 0.1) * motion + scrollT * 0.6 - explode) * 0.06

    samples.forEach((s, i) => {
      const target = i === current ? 1 : 0
      s.scale += (target - s.scale) * 0.09
      s.group.visible = s.scale > 0.01
      const k = 1 - Math.pow(1 - s.scale, 3)
      s.group.scale.setScalar(Math.max(k, 0.001))
      s.parts.forEach((p) => p.mesh.position.copy(p.base).addScaledVector(p.dir, explode))
    })

    stage.rotation.y = spin + t * 0.18 * motion + pointer.x * 0.5 + scrollT * 1.2 - 0.6
    stage.rotation.x = 0.28 + pointer.y * 0.15
    stage.rotation.z = Math.sin(t * 0.6) * 0.04 * motion
    stage.position.y = Math.sin(t * 1.1 * motion) * 0.1 - scrollT * 0.6

    ringA.rotation.z = t * 0.2 * motion
    ringB.rotation.z = -t * 0.12 * motion
    bead.position.set(2.6, 0, 0)
    dust.rotation.y = t * 0.015
    glow.material.opacity = 0.7 + Math.sin(t * 1.1) * 0.15

    renderer.render(scene, camera)
  }
  tick()

  cleanup = () => {
    cancelAnimationFrame(frame)
    removeEventListener('pointermove', onMove)
    removeEventListener('scroll', onScroll)
    ro.disconnect()
    io.disconnect()
    disposables.forEach((d) => d.dispose())
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
})

onBeforeUnmount(() => cleanup())
</script>

<template>
  <div ref="host" class="material-scene" role="img" :aria-label="label"></div>
</template>

<style scoped>
.material-scene{position:absolute;inset:0;cursor:grab;touch-action:pan-y}
.material-scene:active{cursor:grabbing}
.material-scene :deep(canvas){width:100%!important;height:100%!important;display:block}
</style>
