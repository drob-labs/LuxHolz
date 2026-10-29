<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { company, getCollections, getCopy, navIds, type Interest, type Language, type ProjectType } from './content'
import { onScroll, scrollToTarget, startSmoothScroll, vMagnetic, vParallax, vReveal, vTilt } from './composables/motion'

const MaterialScene = defineAsyncComponent(() => import('./components/MaterialScene.vue'))

const language = ref<Language>('de')
const t = computed(() => getCopy(language.value))
const collections = computed(() => getCollections(language.value))
const year = new Date().getFullYear()

const active = ref(0)
const material = computed(() => collections.value[active.value]!)
const detailIndex = ref(0)
const detail = computed(() => collections.value[detailIndex.value]!)
const productDialog = ref<HTMLDialogElement>()
const openQuestion = ref<number | null>(0)

const activeSection = ref('')
const progress = ref(0)
const scrolled = ref(false)
const menuOpen = ref(false)
const menuButton = ref<HTMLButtonElement>()
const cursor = ref<HTMLDivElement>()

function chooseLanguage(next: Language) {
  language.value = next
  try { localStorage.setItem('luxholz-language', next) } catch { /* Storage is optional. */ }
}
watch(language, (value) => {
  document.documentElement.lang = value
  document.title = t.value.title
})

const go = (id: string) => {
  menuOpen.value = false
  scrollToTarget(`#${id}`)
}
function closeMenu() {
  menuOpen.value = false
  menuButton.value?.focus()
}

function showCollection(i: number) {
  detailIndex.value = i
  productDialog.value?.showModal()
}
const closeProduct = () => productDialog.value?.close()
const productBackdrop = (e: MouseEvent) => e.target === productDialog.value && closeProduct()
function viewIn3d(i: number) {
  closeProduct()
  active.value = i
  go('top')
}
function moveTab(e: KeyboardEvent, dir: number) {
  active.value = (active.value + dir + 3) % 3
  ;(e.currentTarget as HTMLElement).parentElement?.querySelectorAll('button')[active.value]?.focus()
}

// Enquiry form: prepares an email in the visitor's mail app (no server involved)
const form = reactive({ name: '', email: '', project: 'home' as ProjectType, interest: 'unsure' as Interest, message: '' })
const errors = reactive({ name: '', email: '' })
const sent = ref(false)
function enquire(interest: Interest, project: ProjectType = form.project) {
  closeProduct()
  form.interest = interest
  form.project = project
  go('contact')
}
function submit() {
  const f = t.value.form
  errors.name = form.name.trim() ? '' : f.nameError
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : f.emailError
  if (errors.name || errors.email) return
  const body = [
    `${f.name}: ${form.name.trim()}`,
    `${f.email}: ${form.email.trim()}`,
    `${f.project}: ${f[form.project]}`,
    `${f.interest.replace('?', '')}: ${f[form.interest]}`,
    '',
    form.message.trim() || f.fallback,
  ].join('\n')
  const subject = `${f.subject} — ${form.name.trim()}`
  window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  sent.value = true
}

let offScroll: (() => void) | undefined
let sectionObserver: IntersectionObserver | undefined
const moveCursor = (e: PointerEvent) => cursor.value?.style.setProperty('translate', `${e.clientX}px ${e.clientY}px`)

onMounted(() => {
  try {
    const saved = localStorage.getItem('luxholz-language')
    if (saved === 'de' || saved === 'en') language.value = saved
  } catch { /* German by default. */ }
  startSmoothScroll()
  offScroll = onScroll((y) => {
    const max = document.documentElement.scrollHeight - innerHeight
    progress.value = max > 0 ? y / max : 0
    scrolled.value = y > 30
  })
  sectionObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (activeSection.value = e.target.id)),
    { rootMargin: '-45% 0px -50% 0px' },
  )
  document.querySelectorAll('section[id]').forEach((s) => sectionObserver!.observe(s))
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) addEventListener('pointermove', moveCursor, { passive: true })
})

onBeforeUnmount(() => {
  offScroll?.()
  sectionObserver?.disconnect()
  removeEventListener('pointermove', moveCursor)
})
</script>

<template>
  <a class="skip-link" href="#main">{{ t.skip }}</a>
  <div class="progress" :style="{ transform: `scaleX(${progress})` }" aria-hidden="true"></div>
  <div ref="cursor" class="cursor-glow" aria-hidden="true"></div>

  <div class="backdrop" aria-hidden="true">
    <span class="blob blob-a"></span>
    <span class="blob blob-b"></span>
    <span class="blob blob-c"></span>
    <span class="grain-lines"></span>
  </div>

  <header class="header" :class="{ 'is-scrolled': scrolled, 'menu-open': menuOpen }" @keydown.esc="closeMenu">
    <nav class="nav glass" :aria-label="language === 'en' ? 'Main navigation' : 'Hauptnavigation'">
      <a class="logo" href="#top" :aria-label="t.home" @click.prevent="go('top')">
        <span class="logo-img" aria-hidden="true"></span>
      </a>
      <ul class="nav-links">
        <li v-for="(label, i) in t.nav.slice(0, 3)" :key="navIds[i]">
          <a :href="`#${navIds[i]}`" :class="{ active: activeSection === navIds[i] }" @click.prevent="go(navIds[i]!)">{{ label }}</a>
        </li>
      </ul>
      <div class="lang" role="group" :aria-label="t.langLabel">
        <button :class="{ on: language === 'de' }" :aria-pressed="language === 'de'" @click="chooseLanguage('de')">DE</button>
        <button :class="{ on: language === 'en' }" :aria-pressed="language === 'en'" @click="chooseLanguage('en')">EN</button>
      </div>
      <a class="btn btn-small btn-primary nav-cta" href="#contact" @click.prevent="go('contact')" v-magnetic="0.25">{{ t.nav[3] }}</a>
      <button ref="menuButton" class="menu-btn" :aria-expanded="menuOpen" aria-controls="mobile-menu" :aria-label="menuOpen ? t.menuClose : t.menuOpen" @click="menuOpen = !menuOpen">
        <span></span><span></span>
      </button>
    </nav>
    <div id="mobile-menu" class="mobile-menu glass" :class="{ open: menuOpen }" :inert="!menuOpen">
      <a v-for="(label, i) in t.nav" :key="navIds[i]" :href="`#${navIds[i]}`" @click.prevent="go(navIds[i]!)">{{ label }}<span>0{{ i + 1 }}</span></a>
      <a :href="company.phoneHref" class="mobile-phone">{{ company.phone }}</a>
    </div>
  </header>

  <main id="main">
    <!-- Hero with interactive 3D flooring sample -->
    <section id="top" class="hero" aria-labelledby="hero-heading">
      <div class="hero-copy">
        <p class="badge glass intro-anim" style="--d: 100ms"><span class="dot"></span>{{ t.heroLabel }}</p>
        <h1 id="hero-heading" class="hero-title" :key="language">
          <span class="line"><span style="--d: 250ms">{{ t.heroA }}</span></span>
          <span class="line"><span style="--d: 370ms">{{ t.heroB }}</span></span>
          <span class="line"><em class="gradient-text" style="--d: 490ms">{{ t.heroC }}</em></span>
        </h1>
        <p class="hero-intro intro-anim" style="--d: 750ms">{{ t.heroText }}</p>
        <div class="hero-actions intro-anim" style="--d: 850ms">
          <a class="btn btn-primary" href="#collections" @click.prevent="go('collections')" v-magnetic>
            {{ t.discover }} <span class="btn-arrow" aria-hidden="true">→</span>
          </a>
          <a class="btn btn-glass" href="#contact" @click.prevent="go('contact')" v-magnetic>{{ t.talk }}</a>
        </div>
        <ul class="hero-meta intro-anim" style="--d: 950ms">
          <li>{{ t.heroNote }}</li>
          <li><a :href="company.phoneHref">{{ company.phone }}</a></li>
        </ul>
      </div>

      <div class="hero-stage">
        <div class="halo"></div>
        <MaterialScene :active="active" :label="`${t.sceneLabel}: ${material.name}`" />
        <Transition name="chips" mode="out-in">
          <ul class="spec-chips" :key="`${language}-${active}`" aria-hidden="true">
            <li v-for="(s, i) in material.specs" :key="s" class="chip glass" :class="`chip-${i}`">{{ s }}</li>
          </ul>
        </Transition>
        <div class="switcher glass" role="group" :aria-label="t.viewer">
          <span class="switcher-label">{{ t.viewer }}</span>
          <div class="switcher-buttons">
            <button v-for="(c, i) in collections" :key="c.id" :class="{ on: active === i }" :aria-pressed="active === i" @click="active = i">
              <img :src="c.image" alt="" width="28" height="28" />{{ c.name }}
            </button>
          </div>
        </div>
        <p class="drag-hint">{{ t.dragHint }}</p>
      </div>

      <button class="scroll-cue" :aria-label="t.discover" @click="go('introduction')"><span class="mouse"><span></span></span></button>
    </section>

    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        <span v-for="(m, i) in [...t.marquee, ...t.marquee]" :key="i">{{ m }} <i>✦</i></span>
      </div>
    </div>

    <!-- Introduction -->
    <section id="introduction" class="section intro">
      <p class="eyebrow" v-reveal>{{ t.introLabel }}</p>
      <div class="intro-grid">
        <h2 v-reveal="100">{{ t.introA }}<br /><em class="serif">{{ t.introB }}</em></h2>
        <p class="section-lede" v-reveal="200">{{ t.introText }}</p>
      </div>
      <p class="intro-foot" v-reveal="250">
        <span class="swiss" aria-hidden="true">+</span>{{ language === 'en' ? 'Gossau, Switzerland' : 'Gossau, Schweiz' }}
        <span class="rule"></span>{{ collections.map((c) => c.name).join(' / ') }}
      </p>
    </section>

    <!-- Collections -->
    <section id="collections" class="section">
      <div class="section-head">
        <p class="eyebrow" v-reveal>{{ t.collectionLabel }}</p>
        <h2 v-reveal="100">{{ t.collectionA }}<br /><em class="serif gradient-text">{{ t.collectionB }}</em></h2>
        <p class="section-lede" v-reveal="200">{{ t.collectionText }}</p>
      </div>
      <div class="collection-grid">
        <div v-for="(c, i) in collections" :key="c.id" class="collection-wrap" v-parallax="i === 1 ? -0.05 : 0.02">
          <article class="collection glass" v-tilt="8" v-reveal="i * 120">
            <button class="collection-image" :aria-label="`${t.explore}: ${c.name}`" @click="showCollection(i)">
              <img :src="c.image" :alt="c.name" loading="lazy" width="1024" height="1024" />
              <span class="collection-num">0{{ i + 1 }}</span>
            </button>
            <div class="collection-body">
              <p class="eyebrow">{{ c.tag }}</p>
              <h3>{{ c.name }}</h3>
              <p>{{ c.short }}</p>
              <div class="collection-actions">
                <button class="link-btn" @click="showCollection(i)">{{ t.explore }} <span aria-hidden="true">↗</span></button>
                <button class="link-btn muted" @click="viewIn3d(i)">{{ t.view3d }}</button>
              </div>
            </div>
            <span class="glare" aria-hidden="true"></span>
          </article>
        </div>
      </div>
    </section>

    <!-- Compare materials -->
    <section id="compare" class="section compare">
      <div class="compare-visual" v-reveal>
        <div class="compare-frame glass">
          <Transition name="fade" mode="out-in">
            <img :key="active" :src="material.image" :alt="material.name" loading="lazy" width="1024" height="1024" />
          </Transition>
          <span class="compare-caption">0{{ active + 1 }} / {{ material.name }}</span>
        </div>
      </div>
      <div class="compare-copy">
        <p class="eyebrow" v-reveal>{{ t.editLabel }}</p>
        <h2 v-reveal="100">{{ t.editA }}<br /><em class="serif gradient-text">{{ t.editB }}</em></h2>
        <p class="section-lede" v-reveal="150">{{ t.editText }}</p>
        <div class="tabs glass" role="tablist" :aria-label="t.editLabel" v-reveal="200">
          <button v-for="(c, i) in collections" :id="`tab-${i}`" :key="c.id" role="tab" :aria-selected="active === i" aria-controls="tab-panel" :tabindex="active === i ? 0 : -1"
            :class="{ on: active === i }" @click="active = i" @keydown.right.prevent="moveTab($event, 1)" @keydown.left.prevent="moveTab($event, -1)">{{ c.name }}</button>
        </div>
        <Transition name="fade" mode="out-in">
          <div id="tab-panel" :key="`${language}-${active}`" role="tabpanel" :aria-labelledby="`tab-${active}`" class="tab-panel">
            <h3>{{ material.mood }}</h3>
            <p>{{ material.description }}</p>
            <ul class="specs">
              <li v-for="s in material.specs" :key="s"><span aria-hidden="true">✓</span>{{ s }}</li>
            </ul>
            <button class="btn btn-glass btn-small" @click="enquire(material.id)" v-magnetic="0.2">{{ t.inquire }} <span class="btn-arrow" aria-hidden="true">→</span></button>
          </div>
        </Transition>
        <p class="fine-print">{{ t.materialNote }}</p>
      </div>
    </section>

    <!-- Philosophy -->
    <section id="philosophy" class="section story">
      <div class="story-copy">
        <p class="eyebrow" v-reveal>{{ t.storyLabel }}</p>
        <h2 v-reveal="100">{{ t.storyA }}<br /><em class="serif gradient-text">{{ t.storyB }}</em></h2>
        <p class="section-lede" v-reveal="150">{{ t.storyText }}</p>
        <div class="values">
          <div v-for="(v, i) in t.values" :key="i" class="value glass" v-reveal="200 + i * 90" v-tilt="6">
            <span class="value-num">0{{ i + 1 }}</span>
            <div><h3>{{ v[0] }}</h3><p>{{ v[1] }}</p></div>
          </div>
        </div>
      </div>
      <figure class="story-visual" v-reveal="150">
        <div class="story-frame" v-parallax="-0.06">
          <img src="/images/vinyl-detail.webp" :alt="language === 'en' ? 'Close-up of a flooring sample in a home' : 'Nahaufnahme eines Bodenmusters in einem Wohnraum'" loading="lazy" width="1024" height="1024" />
        </div>
        <figcaption class="glass">{{ t.samples }} — LuxHolz, Gossau</figcaption>
      </figure>
    </section>

    <!-- Professionals -->
    <section id="professionals" class="section">
      <div class="trade glass" v-reveal>
        <div class="trade-orb" aria-hidden="true" v-parallax="0.08"></div>
        <p class="eyebrow">{{ t.tradeLabel }}</p>
        <div class="trade-grid">
          <h2>{{ t.tradeA }}<br /><em class="serif gradient-text">{{ t.tradeB }}</em></h2>
          <div>
            <p class="section-lede">{{ t.tradeText }}</p>
            <div class="trade-actions">
              <button class="btn btn-primary" @click="enquire('unsure', 'trade')" v-magnetic>{{ t.tradeCta }} <span class="btn-arrow" aria-hidden="true">→</span></button>
              <a class="text-link" :href="`mailto:${company.salesEmail}`">{{ t.tradeLink }} ↗</a>
            </div>
          </div>
        </div>
        <ul class="tags trade-areas">
          <li v-for="a in t.tradeAreas" :key="a">{{ a }}</li>
        </ul>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section faq">
      <div>
        <p class="eyebrow" v-reveal>{{ t.faqLabel }}</p>
        <h2 v-reveal="100">{{ t.faqTitle }}</h2>
      </div>
      <div class="faq-list" v-reveal="150">
        <div v-for="(q, i) in t.questions" :key="i" class="faq-item glass" :class="{ open: openQuestion === i }">
          <h3>
            <button :aria-expanded="openQuestion === i" :aria-controls="`answer-${i}`" @click="openQuestion = openQuestion === i ? null : i">
              <span>{{ q[0] }}</span><span class="faq-icon" aria-hidden="true"></span>
            </button>
          </h3>
          <div :id="`answer-${i}`" class="faq-answer" :inert="openQuestion !== i"><div><p>{{ q[1] }}</p></div></div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="section contact">
      <div class="contact-card glass" v-reveal>
        <div class="contact-copy">
          <p class="eyebrow">{{ t.contactLabel }}</p>
          <h2>{{ t.contactA }}<br /><em class="serif gradient-text">{{ t.contactB }}</em></h2>
          <p class="section-lede">{{ t.contactText }}</p>
          <div class="contact-info">
            <div>
              <p class="label">{{ t.visit }}</p>
              <address>{{ company.street }}<br />{{ company.city }}<br />{{ t.country }}</address>
              <a class="text-link" :href="company.maps" target="_blank" rel="noopener noreferrer">{{ t.directions }} ↗</a>
            </div>
            <div>
              <p class="label">{{ t.hoursLabel }}</p>
              <dl class="hours">
                <dt>{{ t.weekdays }}</dt><dd>{{ company.hours.weekdays }}</dd>
                <dt>{{ t.saturday }}</dt><dd>{{ company.hours.saturday }}</dd>
              </dl>
              <a class="contact-big" :href="company.phoneHref">{{ company.phone }}</a>
              <a class="contact-mail" :href="`mailto:${company.email}`">{{ company.email }}</a>
            </div>
          </div>
        </div>
        <form class="contact-form" novalidate @submit.prevent="submit">
          <label class="field" :class="{ invalid: errors.name }">
            <input v-model="form.name" name="name" autocomplete="name" placeholder=" " :aria-invalid="!!errors.name" />
            <span>{{ t.form.name }}</span>
            <small v-if="errors.name" role="alert">{{ errors.name }}</small>
          </label>
          <label class="field" :class="{ invalid: errors.email }">
            <input v-model="form.email" name="email" type="email" autocomplete="email" placeholder=" " :aria-invalid="!!errors.email" />
            <span>{{ t.form.email }}</span>
            <small v-if="errors.email" role="alert">{{ errors.email }}</small>
          </label>
          <fieldset class="choices">
            <legend>{{ t.form.project }}</legend>
            <label v-for="p in (['home', 'architecture', 'trade'] as const)" :key="p" class="choice">
              <input v-model="form.project" type="radio" name="project" :value="p" /><span>{{ t.form[p] }}</span>
            </label>
          </fieldset>
          <fieldset class="choices">
            <legend>{{ t.form.interest }}</legend>
            <label v-for="p in (['parquet', 'vinyl', 'skirting', 'unsure'] as const)" :key="p" class="choice">
              <input v-model="form.interest" type="radio" name="interest" :value="p" /><span>{{ t.form[p] }}</span>
            </label>
          </fieldset>
          <label class="field">
            <textarea v-model="form.message" name="message" rows="4" maxlength="1200" placeholder=" "></textarea>
            <span>{{ t.form.message }}</span>
          </label>
          <button class="btn btn-primary btn-block" type="submit" v-magnetic="0.12">{{ t.form.submit }} <span class="btn-arrow" aria-hidden="true">→</span></button>
          <p class="form-note" aria-live="polite">{{ sent ? t.form.sent : t.form.note }}</p>
        </form>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="footer-top">
      <div>
        <span class="logo-img footer-logo" role="img" aria-label="LuxHolz"></span>
        <p>{{ t.footerLine }}</p>
      </div>
      <nav :aria-label="language === 'en' ? 'Footer' : 'Fusszeile'">
        <a v-for="(label, i) in t.nav" :key="navIds[i]" :href="`#${navIds[i]}`" @click.prevent="go(navIds[i]!)">{{ label }}</a>
      </nav>
      <div class="footer-contact">
        <a :href="`mailto:${company.email}`">{{ company.email }}</a>
        <a :href="company.phoneHref">{{ company.phone }}</a>
        <span>{{ company.city }}</span>
      </div>
    </div>
    <div class="footer-large" aria-hidden="true">LuxHolz.</div>
    <div class="footer-bottom">
      <span>© {{ year }} LuxHolz. {{ t.rights }}</span>
      <div>
        <a :href="`https://www.luxholz.ch/${language}/privacy`" target="_blank" rel="noopener noreferrer">{{ t.privacy }} ↗</a>
        <a :href="`https://www.luxholz.ch/${language}/terms`" target="_blank" rel="noopener noreferrer">{{ t.terms }} ↗</a>
        <a href="#top" @click.prevent="go('top')">{{ t.top }} ↑</a>
      </div>
    </div>
  </footer>

  <dialog ref="productDialog" class="product-dialog" aria-labelledby="product-heading" @click="productBackdrop">
    <div class="product-inner glass">
      <button class="dialog-close" :aria-label="t.close" @click="closeProduct">×</button>
      <img :src="detail.image" :alt="detail.name" width="1024" height="1024" />
      <div class="product-copy">
        <p class="eyebrow">{{ detail.tag }}</p>
        <h2 id="product-heading">{{ detail.name }}</h2>
        <h3>{{ detail.mood }}</h3>
        <p>{{ detail.description }}</p>
        <ul class="specs">
          <li v-for="s in detail.specs" :key="s"><span aria-hidden="true">✓</span>{{ s }}</li>
        </ul>
        <div class="product-actions">
          <button class="btn btn-primary" @click="enquire(detail.id)">{{ t.inquire }}</button>
          <button class="btn btn-glass" @click="viewIn3d(detailIndex)">{{ t.view3d }}</button>
        </div>
        <p class="fine-print">{{ t.materialNote }}</p>
      </div>
    </div>
  </dialog>
</template>
