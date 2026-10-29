import Lenis from 'lenis'
import type { Directive } from 'vue'

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches

let lenis: Lenis | undefined
const scrollListeners = new Set<(y: number) => void>()

/** Smooth inertial scrolling (skipped for reduced motion) with a shared scroll feed for parallax. */
export function startSmoothScroll() {
  const emit = () => scrollListeners.forEach((fn) => fn(scrollY))
  if (!prefersReducedMotion()) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) })
    const raf = (time: number) => {
      lenis!.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    lenis.on('scroll', emit)
  } else {
    addEventListener('scroll', emit, { passive: true })
  }
  emit()
}

export function onScroll(fn: (y: number) => void) {
  scrollListeners.add(fn)
  fn(scrollY)
  return () => scrollListeners.delete(fn)
}

export function scrollToTarget(selector: string) {
  const target = document.querySelector<HTMLElement>(selector)
  if (!target) return
  if (lenis) lenis.scrollTo(target, { offset: -20 })
  else target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

/** v-reveal="delayMs" — fades/slides content in when it enters the viewport. */
const revealObserver =
  typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('is-in')
              revealObserver?.unobserve(e.target)
            }
          }),
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
      )
    : undefined

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, { value }) {
    el.classList.add('reveal')
    el.style.setProperty('--d', `${value ?? 0}ms`)
    revealObserver?.observe(el)
  },
  unmounted(el) {
    revealObserver?.unobserve(el)
  },
}

/** v-parallax="speed" — translates an element relative to scroll. */
export const vParallax: Directive<HTMLElement & { _off?: () => void }, number> = {
  mounted(el, { value }) {
    if (prefersReducedMotion()) return
    el._off = onScroll(() => {
      const r = el.getBoundingClientRect()
      const offset = (r.top + r.height / 2 - innerHeight / 2) * value
      el.style.translate = `0 ${offset.toFixed(1)}px`
    })
  },
  unmounted(el) {
    el._off?.()
  },
}

type Cleanable = HTMLElement & { _cleanup?: () => void }

/** v-tilt — 3D tilt toward the pointer with a moving glare highlight. */
export const vTilt: Directive<Cleanable, number | undefined> = {
  mounted(el, { value }) {
    if (!finePointer() || prefersReducedMotion()) return
    const max = value ?? 10
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateZ(0)`
      el.style.setProperty('--mx', `${px * 100}%`)
      el.style.setProperty('--my', `${py * 100}%`)
    }
    const leave = () => (el.style.transform = '')
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el._cleanup = () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  },
  unmounted(el) {
    el._cleanup?.()
  },
}

/** v-magnetic — element drifts toward the pointer while hovered. */
export const vMagnetic: Directive<Cleanable, number | undefined> = {
  mounted(el, { value }) {
    if (!finePointer() || prefersReducedMotion()) return
    const strength = value ?? 0.3
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.translate = `${(e.clientX - r.left - r.width / 2) * strength}px ${(e.clientY - r.top - r.height / 2) * strength}px`
    }
    const leave = () => (el.style.translate = '')
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el._cleanup = () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  },
  unmounted(el) {
    el._cleanup?.()
  },
}
