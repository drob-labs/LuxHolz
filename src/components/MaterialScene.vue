<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { generateWood, type WoodOptions } from './woodTexture'

const props = defineProps<{ active: number; label: string }>()
const host = ref<HTMLDivElement>()
let setActive = (_: number) => {}
let cleanup = () => {}

watch(() => props.active, (i) => setActive(i))

// Scene units: 1 unit = 100 mm, so the samples are modelled at real-world proportions.
const MM = 0.01

onMounted(() => {
  const el = host.value!
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  el.appendChild(renderer.domElement)
  const anisotropy = renderer.capabilities.getMaxAnisotropy()

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.45

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  const lookAt = new THREE.Vector3(0, -0.1, 0)

  // Soft daylight key with real shadows, warm fill and faint brand-coloured rims
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x2a1a14, 0.35))
  const key = new THREE.DirectionalLight(0xfff0dc, 2.2)
  key.position.set(4, 8, 5)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 25 })
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.015
  key.shadow.radius = 4
  const fill = new THREE.DirectionalLight(0xffe2c4, 0.6)
  fill.position.set(-6, 3, -1)
  const rimA = new THREE.PointLight(0xb23a5b, 14, 18)
  rimA.position.set(-4, 1.5, -3.5)
  const rimB = new THREE.PointLight(0xe8b86a, 12, 18)
  rimB.position.set(4.5, 0.5, -3)
  scene.add(key, fill, rimA, rimB)

  const disposables: { dispose(): void }[] = []
  const track = <T extends { dispose(): void }>(d: T) => (disposables.push(d), d)

  // ---- Materials (textures are generated asynchronously and swapped in) ----
  const oakTop = track(new THREE.MeshPhysicalMaterial({ color: 0xb98a52, roughness: 0.62, clearcoat: 0.14, clearcoatRoughness: 0.5, bumpScale: 1.6 }))
  const oakEdge = track(new THREE.MeshStandardMaterial({ color: 0xb48a5a, roughness: 0.8 }))
  const oakBevel = track(new THREE.MeshStandardMaterial({ color: 0x5e3d20, roughness: 0.7 }))
  const oakEnd = track(new THREE.MeshStandardMaterial({ color: 0x8c6641, roughness: 0.9 }))
  const vinylTop = track(new THREE.MeshPhysicalMaterial({ color: 0xbb8c5d, roughness: 0.48, clearcoat: 0.25, clearcoatRoughness: 0.42, bumpScale: 0.7 }))
  const vinylBevel = track(new THREE.MeshStandardMaterial({ color: 0x4e3420, roughness: 0.55 }))
  const vinylCore = track(new THREE.MeshStandardMaterial({ color: 0xa3a39f, roughness: 0.6 }))
  const underlay = track(new THREE.MeshStandardMaterial({ color: 0x4a4d52, roughness: 1 }))
  const lacquer = track(new THREE.MeshPhysicalMaterial({ color: 0xf2efe9, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2 }))
  const mdf = track(new THREE.MeshStandardMaterial({ color: 0xc4b294, roughness: 0.95 }))
  const veneer = track(new THREE.MeshPhysicalMaterial({ color: 0xb98a52, roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.45, bumpScale: 1.2 }))
  const plaster = track(new THREE.MeshStandardMaterial({ color: 0xe9e3da, roughness: 0.95 }))

  const OAK: WoodOptions = {
    width: 1024, height: 1024, bands: 8, lengthMm: 1000, widthMm: 140,
    early: [196, 140, 76], late: [122, 78, 36], ringMm: 3.6, ringContrast: 0.8,
    pores: 1, fibre: 1, knots: 2, mottle: 0.7, seed: 7,
  }
  const VINYL: WoodOptions = {
    width: 1024, height: 1024, bands: 8, lengthMm: 1200, widthMm: 180,
    early: [178, 124, 76], late: [138, 90, 52], ringMm: 7, ringContrast: 0.6,
    pores: 0, fibre: 0.55, knots: 1, mottle: 0.45, seed: 21,
  }

  const applyWood = (mats: THREE.MeshPhysicalMaterial[], maps: Awaited<ReturnType<typeof generateWood>>) => {
    const tex = (c: HTMLCanvasElement, srgb: boolean) => {
      const t = track(new THREE.CanvasTexture(c))
      t.flipY = false
      t.anisotropy = anisotropy
      if (srgb) t.colorSpace = THREE.SRGBColorSpace
      return t
    }
    const [map, bump, rough] = [tex(maps.map, true), tex(maps.bump, false), tex(maps.rough, false)]
    for (const m of mats) {
      m.color.set(0xffffff)
      Object.assign(m, { map, bumpMap: bump, roughnessMap: rough })
      m.needsUpdate = true
    }
  }
  let alive = true
  generateWood(OAK).then((maps) => alive && applyWood([oakTop, veneer], maps))
  generateWood(VINYL).then((maps) => alive && applyWood([vinylTop], maps))

  // ---- Geometry helpers ----
  const rand = (() => {
    let s = 11
    return () => ((s = (s * 16807) % 2147483647) / 2147483647)
  })()

  /** Reorders triangles into material groups chosen by face normal and centroid. */
  function regroup(src: THREE.BufferGeometry, groups: number, pick: (n: THREE.Vector3, c: THREE.Vector3) => number) {
    const pos = src.attributes.position!.array as Float32Array
    const uv = src.attributes.uv!.array as Float32Array
    const buckets: number[][] = Array.from({ length: groups }, () => [])
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()
    const n = new THREE.Vector3(), cen = new THREE.Vector3()
    for (let t = 0; t < pos.length / 9; t++) {
      a.fromArray(pos, t * 9)
      b.fromArray(pos, t * 9 + 3)
      c.fromArray(pos, t * 9 + 6)
      n.subVectors(c, b).cross(cen.subVectors(a, b)).normalize()
      cen.copy(a).add(b).add(c).divideScalar(3)
      buckets[pick(n, cen)]!.push(t)
    }
    const P = new Float32Array(pos.length)
    const U = new Float32Array(uv.length)
    const out = new THREE.BufferGeometry()
    let o = 0
    buckets.forEach((list, gi) => {
      const start = o
      for (const t of list) {
        P.set(pos.subarray(t * 9, t * 9 + 9), o * 9)
        U.set(uv.subarray(t * 6, t * 6 + 6), o * 6)
        o++
      }
      out.addGroup(start * 3, list.length * 3, gi)
    })
    out.setAttribute('position', new THREE.BufferAttribute(P, 3))
    out.setAttribute('uv', new THREE.BufferAttribute(U, 2))
    src.dispose()
    return out
  }
  const finish = (g: THREE.BufferGeometry) => track(toCreasedNormals(g, Math.PI / 5))

  interface PlankSpec { W: number; T: number; bevel: number; tongue: number; ty0: number; ty1: number; opts: WoodOptions }

  /** Click / tongue-and-groove plank cross-section with micro-bevelled top edges. */
  function plankShape(p: PlankSpec) {
    const h = p.W / 2
    const g = 0.004
    const s = new THREE.Shape()
    s.moveTo(-h, 0)
    s.lineTo(h, 0)
    s.lineTo(h, p.ty0)
    s.lineTo(h + p.tongue, p.ty0 + (p.ty1 - p.ty0) * 0.2)
    s.lineTo(h + p.tongue, p.ty1 - (p.ty1 - p.ty0) * 0.2)
    s.lineTo(h, p.ty1)
    s.lineTo(h, p.T - p.bevel)
    s.lineTo(h - p.bevel, p.T)
    s.lineTo(-h + p.bevel, p.T)
    s.lineTo(-h, p.T - p.bevel)
    s.lineTo(-h, p.ty1 + g)
    s.lineTo(-h + p.tongue + g, p.ty1 + g)
    s.lineTo(-h + p.tongue + g, p.ty0 - g)
    s.lineTo(-h, p.ty0 - g)
    s.lineTo(-h, 0)
    return s
  }

  function plankGeometry(p: PlankSpec, len: number, band: number) {
    const geo = new THREE.ExtrudeGeometry(plankShape(p), { depth: len, bevelEnabled: false, curveSegments: 4 })
    const pos = geo.attributes.position!.array as Float32Array
    const uv = geo.attributes.uv!.array as Float32Array
    const span = (len / MM) / p.opts.lengthMm
    const uOff = rand() * Math.max(0, 1 - span)
    const h = p.W / 2
    for (let i = 0, j = 0; i < pos.length; i += 3, j += 2) {
      const across = Math.min(Math.max((pos[i]! + h) / p.W, 0), 1)
      uv[j] = uOff + (pos[i + 2]! / MM) / p.opts.lengthMm
      uv[j + 1] = (band + 0.03 + across * 0.94) / p.opts.bands
      pos[i + 2]! -= len / 2
    }
    // groups: 0 = finished top, 1 = edges, 2 = end grain, 3 = darker V-groove bevels that make each joint read
    const pick = (n: THREE.Vector3, c: THREE.Vector3) => (Math.abs(n.z) > 0.9 ? 2 : n.y > 0.95 ? 0 : n.y > 0.4 && c.y > p.T - p.bevel * 2 ? 3 : 1)
    return finish(regroup(geo, 4, pick))
  }

  function plank(p: PlankSpec, len: number, band: number, mats: THREE.Material[], under?: number) {
    const mesh = new THREE.Mesh(plankGeometry(p, len, band), mats)
    mesh.castShadow = mesh.receiveShadow = true
    if (under) {
      const u = new THREE.Mesh(track(new THREE.BoxGeometry(p.W, under, len)), underlay)
      u.position.y = -under / 2
      u.castShadow = u.receiveShadow = true
      mesh.add(u)
    }
    return mesh
  }

  /** A patch of floor: rows of planks with staggered end joints, cut flush like a showroom sample. */
  function floorPatch(p: PlankSpec, rows: number, length: number, mats: THREE.Material[], under?: number) {
    const group = new THREE.Group()
    let band = 0
    for (let r = 0; r < rows; r++) {
      const x = (r - (rows - 1) / 2) * p.W
      const joint = -length / 2 + length * (r % 2 ? 0.28 + rand() * 0.14 : 0.58 + rand() * 0.14)
      for (const [z0, z1] of [[-length / 2, joint], [joint, length / 2]] as const) {
        const m = plank(p, z1 - z0, band++ % p.opts.bands, mats, under)
        m.position.set(x, 0, (z0 + z1) / 2)
        group.add(m)
      }
    }
    return group
  }

  function shadowCatcher(y: number) {
    const m = new THREE.Mesh(track(new THREE.PlaneGeometry(40, 40)), track(new THREE.ShadowMaterial({ opacity: 0.5 })))
    m.rotation.x = -Math.PI / 2
    m.position.y = y
    m.receiveShadow = true
    return m
  }

  interface Sample { group: THREE.Group; hero: THREE.Object3D; base: THREE.Vector3; baseRot: THREE.Euler; lift: number; size: number; scale: number }
  const sample = (group: THREE.Group, hero: THREE.Object3D, lift: number, size: number): Sample => {
    group.add(hero)
    return { group, hero, base: hero.position.clone(), baseRot: hero.rotation.clone(), lift, size, scale: 0 }
  }

  // ---- 01 Parquet: 140 × 14 mm oak planks ----
  const oakSpec: PlankSpec = { W: 140 * MM, T: 14 * MM, bevel: 2 * MM, tongue: 5 * MM, ty0: 5 * MM, ty1: 9 * MM, opts: OAK }
  const oakMats = [oakTop, oakEdge, oakEnd, oakBevel]
  function parquet() {
    const g = new THREE.Group()
    g.add(floorPatch(oakSpec, 6, 7, oakMats), shadowCatcher(-0.002))
    const hero = plank(oakSpec, 6.2, 7, oakMats)
    hero.position.set(0.5, oakSpec.T + 0.85, 0.6)
    hero.rotation.set(-0.1, 0.42, 0.07)
    return sample(g, hero, 0.6, 6 * oakSpec.W)
  }

  // ---- 02 Vinyl: 180 mm click planks, 4 mm core with integrated 1 mm underlay ----
  const vinylSpec: PlankSpec = { W: 180 * MM, T: 4 * MM, bevel: 1 * MM, tongue: 4 * MM, ty0: 1.4 * MM, ty1: 2.6 * MM, opts: VINYL }
  const vinylMats = [vinylTop, vinylCore, vinylCore, vinylBevel]
  function vinyl() {
    const g = new THREE.Group()
    g.add(floorPatch(vinylSpec, 4, 7.2, vinylMats, 1 * MM), shadowCatcher(-1.2 * MM))
    const hero = plank(vinylSpec, 6.4, 6, vinylMats, 1 * MM)
    hero.position.set(0.55, 0.8, 0.55)
    hero.rotation.set(-0.12, 0.4, 0.08)
    return sample(g, hero, 0.55, 4 * vinylSpec.W)
  }

  // ---- 03 Skirting: 16 × 70 mm profile, mitred into a room corner ----
  const SK = { t: 16 * MM, H: 70 * MM, r: 6 * MM }
  function skirtingShape() {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(SK.t, 0)
    s.lineTo(SK.t, SK.H - SK.r)
    s.absarc(SK.t - SK.r, SK.H - SK.r, SK.r, 0, Math.PI / 2, false)
    s.lineTo(0, SK.H)
    s.lineTo(0, 32 * MM) // rear cable channel
    s.lineTo(6 * MM, 32 * MM)
    s.lineTo(6 * MM, 12 * MM)
    s.lineTo(0, 12 * MM)
    s.lineTo(0, 0)
    return s
  }
  /** Extrudes the profile; `place` maps local (depth, height, along) to world, `mitre` cuts the start end at 45°. */
  function skirtingGeometry(len: number, place: 'x' | 'z' | 'loose', mitre: boolean) {
    const geo = new THREE.ExtrudeGeometry(skirtingShape(), { depth: len, bevelEnabled: false, curveSegments: 10 })
    const pos = geo.attributes.position!.array as Float32Array
    const uv = geo.attributes.uv!.array as Float32Array
    for (let i = 0, j = 0; i < pos.length; i += 3, j += 2) {
      uv[j] = 0.1 + (pos[i + 2]! / MM) / OAK.lengthMm
      uv[j + 1] = (5 + 0.05 + (pos[i + 1]! / SK.H) * 0.45) / OAK.bands
    }
    const out = regroup(geo, 2, (n) => (Math.abs(n.z) > 0.9 ? 1 : 0))
    const p = out.attributes.position!.array as Float32Array
    for (let i = 0; i < p.length; i += 3) {
      const [d, z] = [p[i]!, p[i + 2]!]
      const along = mitre && z < 1e-6 ? d : z
      if (place === 'x') {
        p[i] = along
        p[i + 2] = d
      } else if (place === 'z') {
        p[i + 2] = along
      } else {
        p[i + 2] = z - len / 2
      }
    }
    if (place === 'x') {
      // swapping x and z mirrors the mesh, so flip the winding back
      const u = out.attributes.uv!.array as Float32Array
      for (let t = 0; t < p.length; t += 9) {
        for (let k = 0; k < 3; k++) [p[t + 3 + k], p[t + 6 + k]] = [p[t + 6 + k]!, p[t + 3 + k]!]
      }
      for (let t = 0; t < u.length; t += 6) {
        for (let k = 0; k < 2; k++) [u[t + 2 + k], u[t + 4 + k]] = [u[t + 4 + k]!, u[t + 2 + k]!]
      }
    }
    return finish(out)
  }
  function skirting() {
    const g = new THREE.Group()
    const rows = 5
    const length = 6
    g.add(floorPatch(oakSpec, rows, length, oakMats), shadowCatcher(-0.002))
    const xmin = -(rows * oakSpec.W) / 2
    const xmax = -xmin + oakSpec.tongue
    const zmin = -length / 2
    const zmax = length / 2
    const wallH = 2.2
    const wall = (w: number, d: number, x: number, z: number) => {
      const m = new THREE.Mesh(track(new THREE.BoxGeometry(w, wallH, d)), plaster)
      m.position.set(x, wallH / 2, z)
      m.castShadow = m.receiveShadow = true
      g.add(m)
    }
    wall(xmax - xmin + 0.14, 0.14, (xmin + xmax) / 2 - 0.07, zmin - 0.07)
    wall(0.14, zmax - zmin, xmin - 0.07, 0)

    const back = new THREE.Mesh(skirtingGeometry(xmax - xmin, 'x', true), [lacquer, mdf])
    back.position.set(xmin, oakSpec.T, zmin)
    const side = new THREE.Mesh(skirtingGeometry(zmax - zmin, 'z', true), [lacquer, mdf])
    side.position.set(xmin, oakSpec.T, zmin)
    for (const m of [back, side]) {
      m.castShadow = m.receiveShadow = true
      g.add(m)
    }
    // Loose oak-veneer length in front, lying on its back so the veneer and profile show
    const loose = new THREE.Mesh(skirtingGeometry(4.2, 'loose', false), [veneer, mdf])
    loose.castShadow = loose.receiveShadow = true
    const hero = new THREE.Group()
    loose.rotation.z = Math.PI / 2
    loose.position.x = SK.H / 2
    hero.add(loose)
    hero.position.set(0.35, oakSpec.T + 0.02, 1.2)
    hero.rotation.set(0, 1.1, 0)
    return sample(g, hero, 0.45, rows * oakSpec.W)
  }

  const samples = [parquet(), vinyl(), skirting()]
  const stage = new THREE.Group()
  samples.forEach((s) => {
    s.group.visible = false
    stage.add(s.group)
  })
  scene.add(stage)

  // Subtle orbit ring, floor glow and dust keep the futuristic mood
  const ring = new THREE.Mesh(track(new THREE.TorusGeometry(3.4, 0.006, 8, 240)), track(new THREE.MeshBasicMaterial({ color: 0xe0b46a, transparent: true, opacity: 0.35 })))
  ring.rotation.x = Math.PI / 2.1
  ring.position.y = -0.3
  const bead = new THREE.Mesh(track(new THREE.SphereGeometry(0.05, 16, 16)), track(new THREE.MeshBasicMaterial({ color: 0xffd9a0 })))
  bead.position.x = 3.4
  ring.add(bead)
  scene.add(ring)

  const glowCanvas = document.createElement('canvas')
  glowCanvas.width = glowCanvas.height = 128
  const g2 = glowCanvas.getContext('2d')!
  const grad = g2.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(224,180,106,.4)')
  grad.addColorStop(1, 'rgba(224,180,106,0)')
  g2.fillStyle = grad
  g2.fillRect(0, 0, 128, 128)
  const glow = new THREE.Mesh(
    track(new THREE.PlaneGeometry(8, 8)),
    track(new THREE.MeshBasicMaterial({ map: track(new THREE.CanvasTexture(glowCanvas)), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })),
  )
  glow.rotation.x = -Math.PI / 2
  glow.position.y = -0.45
  scene.add(glow)

  const count = 400
  const dustPos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) dustPos.set([(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8 - 2], i * 3)
  const dustGeo = track(new THREE.BufferGeometry())
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dust = new THREE.Points(dustGeo, track(new THREE.PointsMaterial({ color: 0xf0c98a, size: 0.02, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })))
  scene.add(dust)

  // ---- Interaction ----
  let current = props.active
  setActive = (i) => (current = i)

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  let hover = false
  let hoverT = 0
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
    const dist = (w < 600 ? 9.2 : 7.6) * Math.max(1, 0.9 / (w / h))
    camera.position.set(0, dist * 0.46, dist)
    camera.lookAt(lookAt)
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
    spin += spinVel
    if (!dragging) spinVel *= 0.95
    hoverT += ((hover ? 1 : 0) - hoverT) * 0.06

    samples.forEach((s, i) => {
      s.scale += ((i === current ? 1 : 0) - s.scale) * 0.08
      s.group.visible = s.scale > 0.01
      const k = 1 - Math.pow(1 - s.scale, 3)
      s.group.scale.setScalar(Math.max(k, 0.001) * (3.9 / s.size))
      // The loose plank or board rises and turns toward the visitor on hover
      const lift = s.lift * (hoverT + scrollT * 0.5) + Math.sin(t * 1.3) * 0.06 * motion
      s.hero.position.set(s.base.x, s.base.y + lift, s.base.z + hoverT * 0.3)
      s.hero.rotation.set(s.baseRot.x - hoverT * 0.18, s.baseRot.y - hoverT * 0.25, s.baseRot.z + hoverT * 0.06)
    })

    stage.rotation.y = spin + Math.sin(t * 0.25 * motion) * 0.35 + pointer.x * 0.35 - 0.45 + scrollT * 0.9
    stage.rotation.x = pointer.y * 0.06
    stage.position.y = Math.sin(t * 0.9 * motion) * 0.05 - scrollT * 0.5

    ring.rotation.z = t * 0.15 * motion
    dust.rotation.y = t * 0.015

    renderer.render(scene, camera)
  }
  tick()

  cleanup = () => {
    alive = false
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
