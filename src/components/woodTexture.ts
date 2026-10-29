// Procedural wood textures (colour, bump and roughness) for the 3D flooring samples.
// The canvas is split into horizontal bands; each band is one plank-sized board with
// its own growth rings, knots and tone, so neighbouring planks never repeat.

export interface WoodOptions {
  width: number
  height: number
  bands: number
  lengthMm: number // real length covered by one band (canvas x)
  widthMm: number // real width covered by one band (band height)
  early: [number, number, number] // earlywood colour
  late: [number, number, number] // latewood colour
  ringMm: number // average growth-ring spacing
  ringContrast: number
  pores: number // ring-porous oak pores, 0–1
  fibre: number
  knots: number // max knots per band
  mottle: number
  seed: number
}

export interface WoodMaps {
  map: HTMLCanvasElement
  bump: HTMLCanvasElement
  rough: HTMLCanvasElement
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function valueNoise(rand: () => number) {
  const perm = new Uint8Array(512)
  const vals = new Float32Array(256)
  const p = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[p[i], p[j]] = [p[j]!, p[i]!]
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]!
  for (let i = 0; i < 256; i++) vals[i] = rand()
  return (x: number, y: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi
    const X = xi & 255
    const Y = yi & 255
    const u = xf * xf * (3 - 2 * xf)
    const v = yf * yf * (3 - 2 * yf)
    const a = vals[perm[X + perm[Y]!]!]!
    const b = vals[perm[X + 1 + perm[Y]!]!]!
    const c = vals[perm[X + perm[Y + 1]!]!]!
    const d = vals[perm[X + 1 + perm[Y + 1]!]!]!
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
  }
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

const yieldFrame = () => new Promise((r) => setTimeout(r, 0))

export async function generateWood(o: WoodOptions): Promise<WoodMaps> {
  const rand = mulberry32(o.seed)
  const noise = valueNoise(rand)
  const fbm = (x: number, y: number, oct = 3) => {
    let sum = 0
    let amp = 0.5
    let norm = 0
    for (let i = 0; i < oct; i++) {
      sum += noise(x, y) * amp
      norm += amp
      x *= 2.03
      y *= 2.03
      amp *= 0.5
    }
    return sum / norm
  }

  const { width: W, height: H, bands } = o
  const bandH = H / bands
  const pxU = W / o.lengthMm
  const pxV = bandH / o.widthMm
  const make = () => {
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    return c
  }
  const [mapC, bumpC, roughC] = [make(), make(), make()]
  const colour = new Uint8ClampedArray(W * H * 4)
  const bump = new Uint8ClampedArray(W * H * 4)
  const rough = new Uint8ClampedArray(W * H * 4)
  const knotColour = [62, 38, 20]

  for (let b = 0; b < bands; b++) {
    // Each board is cut at a different distance from the pith: close = cathedral arches, far = straight grain
    const pithDepth = 6 + rand() * 45
    const pithOffset = (rand() - 0.5) * o.widthMm * 1.4
    const taper = (rand() - 0.5) * 0.09
    const tone = 1 + (rand() - 0.5) * 0.2
    const knots = Array.from({ length: Math.floor(rand() * (o.knots + 1)) }, () => ({
      u: o.lengthMm * (0.1 + rand() * 0.8),
      v: o.widthMm * (0.15 + rand() * 0.7),
      r: 2.5 + rand() * 5,
      crack: rand() < 0.7 ? (rand() - 0.5) * 0.08 : null, // slope of a dark filled check running from the knot
    }))

    for (let row = 0; row < bandH; row++) {
      const y = b * bandH + row
      const vmm = (row + 0.5) / pxV
      for (let x = 0; x < W; x++) {
        const umm = (x + 0.5) / pxU
        const warp = (fbm(umm * 0.005, vmm * 0.025 + b * 7.13) - 0.5) * 2
        const dy = vmm - pithOffset + warp * 7
        let r = Math.sqrt(dy * dy + pithDepth * pithDepth) + umm * taper + (fbm(umm * 0.02 + 3.1, vmm * 0.12 + b) - 0.5) * 1.6

        let knot = 0
        for (const k of knots) {
          const du = (umm - k.u) * 0.45
          const dv = vmm - k.v
          const dist = Math.sqrt(du * du + dv * dv)
          r += Math.exp(-(dist * dist) / (k.r * k.r * 10)) * k.r * 2.4
          knot = Math.max(knot, smooth(k.r, k.r * 0.3, dist))
          if (k.crack !== null) {
            const off = Math.abs(vmm - k.v - (umm - k.u) * k.crack + (noise(umm * 0.08, k.v) - 0.5) * 1.2)
            const reach = 1 - smooth(k.r * 2, k.r * 9, Math.abs(umm - k.u))
            knot = Math.max(knot, smooth(0.45, 0.1, off) * reach * 0.9)
          }
        }

        const t = r / o.ringMm
        const phase = t - Math.floor(t)
        const late = smooth(0.6, 0.93, phase) * (1 - smooth(0.93, 1, phase) * 0.5)
        const poreZone = 1 - smooth(0, 0.25, phase)
        const pore = poreZone * smooth(0.58, 0.82, noise(umm * 0.35 + b * 3, vmm * 3.2)) * o.pores
        const fibre = (noise(umm * 0.06, vmm * 2.4 + b * 5.3) - 0.5) * o.fibre
        const mottle = (fbm(umm * 0.003 + b * 1.7, vmm * 0.015) - 0.5) * o.mottle

        const mix = Math.min(1, late * o.ringContrast + pore * 0.55)
        const shade = tone + mottle * 0.25 + fibre * 0.12
        const i = (y * W + x) * 4
        for (let ch = 0; ch < 3; ch++) {
          const base = (o.early[ch]! + (o.late[ch]! - o.early[ch]!) * mix) * shade
          colour[i + ch] = base + (knotColour[ch]! - base) * knot * 0.92
        }
        colour[i + 3] = 255

        const h = 200 - late * 55 - pore * 150 - knot * 40 + fibre * 60
        bump[i] = bump[i + 1] = bump[i + 2] = h
        bump[i + 3] = 255
        const ro = 150 + pore * 70 + knot * 40 - late * 15
        rough[i] = rough[i + 1] = rough[i + 2] = ro
        rough[i + 3] = 255
      }
      if (row % 24 === 0) await yieldFrame()
    }
  }

  mapC.getContext('2d')!.putImageData(new ImageData(colour, W, H), 0, 0)
  bumpC.getContext('2d')!.putImageData(new ImageData(bump, W, H), 0, 0)
  roughC.getContext('2d')!.putImageData(new ImageData(rough, W, H), 0, 0)
  return { map: mapC, bump: bumpC, rough: roughC }
}
