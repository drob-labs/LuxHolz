<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  language: 'en' | 'de'
  initialInterest?: string
}>()
const emit = defineEmits<{ close: [] }>()

const copy = {
  en: {
    eyebrow: 'LET’S MAKE IT YOURS',
    title: 'Every great space\nbegins with a conversation.',
    intro: 'Tell us a little about your project. We’ll help you find the right foundation.',
    close: 'Close consultation form',
    name: 'Your name',
    email: 'Email address',
    project: 'Your project',
    interest: 'What are you considering?',
    message: 'A little about your vision',
    optional: 'optional',
    placeholder: 'The space, the feeling, the details you have in mind…',
    home: 'Private home',
    architecture: 'Architecture & design',
    trade: 'Trade & wholesale',
    parquet: 'Parquet',
    vinyl: 'Vinyl',
    skirting: 'Skirting',
    unsure: 'Not sure yet',
    prepare: 'Prepare my inquiry',
    note: 'Next, review your inquiry and open it in your email app.',
    readyEyebrow: 'YOUR NEXT STEP',
    readyTitle: 'Your project,\nready to share.',
    readyIntro: 'Your inquiry is prepared. Open your email app to review and send it to info@luxholz.ch.',
    notSent: 'Nothing has been sent yet. Send the email from your email app to get in touch.',
    emailAction: 'Open email app',
    edit: 'Edit my inquiry',
    recipient: 'TO',
    summary: 'YOUR INQUIRY',
    subject: 'Project inquiry',
    messageFallback: 'I would like to discuss my project with LuxHolz.',
    call: 'Prefer a conversation?',
    callLabel: 'Call LuxHolz at +41 76 492 30 08',
    nameValidation: 'Please enter your name.',
    longInquiry: 'For this longer inquiry, copy the text below and paste it into the email that opens.',
    copyInquiry: 'Copy inquiry',
    copied: 'Inquiry copied',
    copyFallback: 'Select and copy the inquiry below, then paste it into your email.',
    preparedText: 'Prepared email text',
  },
  de: {
    eyebrow: 'RAUM FÜR IHRE IDEEN',
    title: 'Jeder besondere Raum\nbeginnt mit einem Gespräch.',
    intro: 'Erzählen Sie uns von Ihrem Projekt. Gemeinsam finden wir die passende Grundlage.',
    close: 'Beratungsformular schliessen',
    name: 'Ihr Name',
    email: 'E-Mail-Adresse',
    project: 'Ihr Projekt',
    interest: 'Wofür interessieren Sie sich?',
    message: 'Ihre Ideen und Wünsche',
    optional: 'optional',
    placeholder: 'Der Raum, die Atmosphäre, die Details, die Ihnen wichtig sind …',
    home: 'Privates Wohnen',
    architecture: 'Architektur & Design',
    trade: 'Handel & Grosshandel',
    parquet: 'Parkett',
    vinyl: 'Vinyl',
    skirting: 'Sockelleisten',
    unsure: 'Noch unentschieden',
    prepare: 'Anfrage vorbereiten',
    note: 'Im nächsten Schritt prüfen Sie Ihre Anfrage und öffnen Ihr E-Mail-Programm.',
    readyEyebrow: 'IHR NÄCHSTER SCHRITT',
    readyTitle: 'Ihr Projekt.\nBereit zum Teilen.',
    readyIntro: 'Ihre Anfrage ist vorbereitet. Öffnen Sie Ihr E-Mail-Programm, um sie zu prüfen und an info@luxholz.ch zu senden.',
    notSent: 'Es wurde noch nichts gesendet. Senden Sie die E-Mail in Ihrem E-Mail-Programm, um uns zu kontaktieren.',
    emailAction: 'E-Mail-Programm öffnen',
    edit: 'Anfrage bearbeiten',
    recipient: 'AN',
    summary: 'IHRE ANFRAGE',
    subject: 'Projektanfrage',
    messageFallback: 'Ich möchte mein Projekt mit LuxHolz besprechen.',
    call: 'Lieber persönlich sprechen?',
    callLabel: 'LuxHolz anrufen unter +41 76 492 30 08',
    nameValidation: 'Bitte geben Sie Ihren Namen ein.',
    longInquiry: 'Kopieren Sie für diese längere Anfrage den Text unten und fügen Sie ihn in die E-Mail ein, die geöffnet wird.',
    copyInquiry: 'Anfrage kopieren',
    copied: 'Anfrage kopiert',
    copyFallback: 'Markieren und kopieren Sie die Anfrage unten und fügen Sie sie in Ihre E-Mail ein.',
    preparedText: 'Vorbereiteter E-Mail-Text',
  },
} as const

const t = computed(() => copy[props.language])
type ProjectType = 'home' | 'architecture' | 'trade'
type Interest = 'parquet' | 'vinyl' | 'skirting' | 'unsure'
const form = reactive({ name: '', email: '', project: 'home' as ProjectType, interest: 'unsure' as Interest, message: '' })
const ready = ref(false)
const panel = ref<HTMLElement | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)
const reviewHeading = ref<HTMLHeadingElement | null>(null)
const preparedText = ref<HTMLTextAreaElement | null>(null)
const copyState = ref<'idle' | 'copied' | 'manual'>('idle')
let previousFocus: HTMLElement | null = null
let lastPageFocus: HTMLElement | null = null
let previousOverflow = ''
let scrollLocked = false

const projectLabel = computed(() => t.value[form.project])
const interestLabel = computed(() => t.value[form.interest])
const emailSubject = computed(() => `${t.value.subject} — ${form.name.trim()}`)
const emailBody = computed(() => [
    `${t.value.name}: ${form.name.trim()}`,
    `${t.value.email}: ${form.email.trim()}`,
    `${t.value.project}: ${projectLabel.value}`,
    `${t.value.interest}: ${interestLabel.value}`,
    '',
    form.message.trim() || t.value.messageFallback,
  ].join('\n'))
const emailLink = computed(() => `mailto:info@luxholz.ch?subject=${encodeURIComponent(emailSubject.value)}`)
const fullEmailLink = computed(() => `${emailLink.value}&body=${encodeURIComponent(emailBody.value)}`)
// Keep long text available to copy rather than depending on a mail client's URL handling.
const longInquiry = computed(() => fullEmailLink.value.length > 1900)
const mailto = computed(() => longInquiry.value ? emailLink.value : fullEmailLink.value)

function setInitialInterest(value?: string) {
  if (!value) {
    form.project = 'home'
    form.interest = 'unsure'
    return
  }
  const normalized = value.toLowerCase()
  if (normalized.includes('trade') || normalized.includes('wholesale') || normalized.includes('grosshandel')) {
    form.project = 'trade'
    form.interest = 'unsure'
    return
  }
  form.project = 'home'
  form.interest = normalized.includes('parq') || normalized.includes('park') ? 'parquet'
    : normalized.includes('vinyl') ? 'vinyl'
      : normalized.includes('skirt') || normalized.includes('sockel') ? 'skirting' : 'unsure'
}

function focusableElements() {
  return Array.from(panel.value?.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
  ) ?? []).filter((element) => element.getClientRects().length > 0)
}

function onKeydown(event: KeyboardEvent) {
  if (!props.open) return
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    emit('close')
  }
  if (event.key !== 'Tab') return
  const elements = focusableElements()
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (!first || !last) {
    event.preventDefault()
    panel.value?.focus()
    return
  }
  const active = document.activeElement
  if (event.shiftKey && (active === first || !panel.value?.contains(active))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (active === last || !panel.value?.contains(active))) {
    event.preventDefault()
    first.focus()
  }
}

function onFocusIn(event: FocusEvent) {
  if (!props.open && event.target instanceof HTMLElement && !event.target.closest('dialog, [role="dialog"]') && canRestoreFocus(event.target)) {
    lastPageFocus = event.target
  }
  if (props.open && panel.value && event.target instanceof Node && !panel.value.contains(event.target)) {
    ;(focusableElements()[0] ?? panel.value).focus()
  }
}

function canRestoreFocus(element: HTMLElement | null): element is HTMLElement {
  return !!element && element !== document.body && element.isConnected && element.getClientRects().length > 0
    && !element.closest('[inert], dialog:not([open])')
}

function restoreFocus() {
  const target = canRestoreFocus(previousFocus) ? previousFocus : lastPageFocus
  if (canRestoreFocus(target)) target.focus({ preventScroll: true })
}

function unlock() {
  document.removeEventListener('keydown', onKeydown, true)
  if (scrollLocked) {
    document.body.style.overflow = previousOverflow
    scrollLocked = false
  }
}

watch(() => props.open, async (open) => {
  if (open) {
    previousFocus = document.activeElement instanceof HTMLElement && canRestoreFocus(document.activeElement)
      ? document.activeElement : lastPageFocus
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    scrollLocked = true
    ready.value = false
    copyState.value = 'idle'
    setInitialInterest(props.initialInterest)
    await nextTick()
    if (!props.open) return
    nameInput.value?.focus({ preventScroll: true })
    document.addEventListener('keydown', onKeydown, true)
  } else {
    unlock()
    restoreFocus()
  }
}, { immediate: true })

watch(() => props.initialInterest, (value) => { if (props.open) setInitialInterest(value) })

async function prepareInquiry() {
  if (!form.name.trim()) {
    nameInput.value?.setCustomValidity(t.value.nameValidation)
    nameInput.value?.reportValidity()
    return
  }
  form.name = form.name.trim()
  form.email = form.email.trim()
  ready.value = true
  await nextTick()
  reviewHeading.value?.focus({ preventScroll: true })
  panel.value?.scrollTo({ top: 0 })
}

async function editInquiry() {
  ready.value = false
  copyState.value = 'idle'
  await nextTick()
  nameInput.value?.focus({ preventScroll: true })
}

async function copyInquiry() {
  try {
    await navigator.clipboard.writeText(emailBody.value)
    copyState.value = 'copied'
  } catch {
    copyState.value = 'manual'
    await nextTick()
    preparedText.value?.focus()
    preparedText.value?.select()
  }
}

onMounted(() => {
  document.addEventListener('focusin', onFocusIn)
})

onBeforeUnmount(() => {
  unlock()
  document.removeEventListener('focusin', onFocusIn)
  if (props.open) restoreFocus()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="inquiry">
      <div v-if="open" class="inquiry-overlay" @click.self="emit('close')">
        <section
          ref="panel"
          class="inquiry-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-title"
          aria-describedby="inquiry-description"
          :lang="language"
          tabindex="-1"
        >
          <button type="button" class="inquiry-close" :aria-label="t.close" @click="emit('close')">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>

          <div class="inquiry-content">
            <p class="inquiry-eyebrow">{{ ready ? t.readyEyebrow : t.eyebrow }}</p>
            <h2 id="inquiry-title" ref="reviewHeading" tabindex="-1">{{ ready ? t.readyTitle : t.title }}</h2>
            <p id="inquiry-description" class="inquiry-intro">{{ ready ? t.readyIntro : t.intro }}</p>

            <form v-if="!ready" class="inquiry-form" @submit.prevent="prepareInquiry">
              <div class="inquiry-grid">
                <label class="inquiry-field" for="inquiry-name">
                  <span>{{ t.name }} <span class="required-mark" aria-hidden="true">*</span></span>
                  <input id="inquiry-name" ref="nameInput" v-model="form.name" name="name" autocomplete="name" required maxlength="120" @input="nameInput?.setCustomValidity('')" />
                </label>
                <label class="inquiry-field" for="inquiry-email">
                  <span>{{ t.email }} <span class="required-mark" aria-hidden="true">*</span></span>
                  <input id="inquiry-email" v-model="form.email" name="email" type="email" autocomplete="email" required maxlength="254" :spellcheck="false" />
                </label>
                <label class="inquiry-field" for="inquiry-project">
                  <span>{{ t.project }}</span>
                  <span class="inquiry-select">
                    <select id="inquiry-project" v-model="form.project" name="project">
                      <option value="home">{{ t.home }}</option>
                      <option value="architecture">{{ t.architecture }}</option>
                      <option value="trade">{{ t.trade }}</option>
                    </select>
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
                  </span>
                </label>
                <label class="inquiry-field" for="inquiry-interest">
                  <span>{{ t.interest }}</span>
                  <span class="inquiry-select">
                    <select id="inquiry-interest" v-model="form.interest" name="interest">
                      <option value="unsure">{{ t.unsure }}</option>
                      <option value="parquet">{{ t.parquet }}</option>
                      <option value="vinyl">{{ t.vinyl }}</option>
                      <option value="skirting">{{ t.skirting }}</option>
                    </select>
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
                  </span>
                </label>
              </div>
              <label class="inquiry-field" for="inquiry-message">
                <span>{{ t.message }} <span class="inquiry-optional">({{ t.optional }})</span></span>
                <textarea id="inquiry-message" v-model="form.message" name="message" :placeholder="t.placeholder" rows="3" maxlength="3000"></textarea>
              </label>
              <button class="inquiry-primary" type="submit">
                <span>{{ t.prepare }}</span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
              </button>
              <p class="inquiry-note">{{ t.note }}</p>
            </form>

            <div v-else class="inquiry-review">
              <div class="inquiry-summary">
                <p class="inquiry-summary-label">{{ t.recipient }}</p>
                <a class="inquiry-recipient" href="mailto:info@luxholz.ch">info@luxholz.ch</a>
                <p class="inquiry-summary-label inquiry-summary-spacer">{{ t.summary }}</p>
                <p class="inquiry-summary-name">{{ form.name }}</p>
                <p class="inquiry-summary-email">{{ form.email }}</p>
                <p class="inquiry-summary-details">{{ projectLabel }} <span aria-hidden="true">·</span> {{ interestLabel }}</p>
                <p v-if="form.message.trim()" class="inquiry-summary-message">{{ form.message }}</p>
              </div>
              <p class="inquiry-note inquiry-not-sent">{{ t.notSent }}</p>
              <div v-if="longInquiry" class="inquiry-long-message">
                <p class="inquiry-note inquiry-not-sent">{{ t.longInquiry }}</p>
                <label class="inquiry-field" for="inquiry-prepared-text">
                  <span>{{ t.preparedText }}</span>
                  <textarea id="inquiry-prepared-text" ref="preparedText" :value="emailBody" readonly rows="4"></textarea>
                </label>
                <button class="inquiry-copy" type="button" @click="copyInquiry">{{ copyState === 'copied' ? t.copied : t.copyInquiry }}</button>
                <p v-if="copyState !== 'idle'" class="inquiry-note inquiry-not-sent" role="status">{{ copyState === 'copied' ? t.copied : t.copyFallback }}</p>
              </div>
              <a class="inquiry-primary" :href="mailto">
                <span>{{ t.emailAction }}</span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>
              </a>
              <button type="button" class="inquiry-edit" @click="editInquiry">{{ t.edit }}</button>
            </div>

            <div class="inquiry-footer">
              <span>{{ t.call }}</span>
              <a href="tel:+41764923008" :aria-label="t.callLabel">+41 76 492 30 08</a>
            </div>
          </div>
          <div class="inquiry-signature" aria-hidden="true"><img src="/images/luxholz-logo.svg" alt="" width="100" height="28" /></div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.inquiry-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(27 15 18 / 64%);
  backdrop-filter: blur(9px);
  -webkit-backdrop-filter: blur(9px);
  color: #3b1620;
  font-family: inherit;
  text-align: left;
  box-sizing: border-box;
}
.inquiry-panel {
  position: relative;
  width: 100%;
  max-width: 720px;
  max-height: min(900px, calc(100dvh - 48px));
  overflow-y: auto;
  overscroll-behavior: contain;
  background: #f5f1e9;
  border: 1px solid rgb(181 154 119 / 35%);
  box-shadow: 0 28px 100px rgb(19 7 11 / 24%);
  scrollbar-width: thin;
  scrollbar-color: #b59a77 #f5f1e9;
  outline: none;
}
.inquiry-content { padding: 54px 58px 30px; }
.inquiry-close {
  position: absolute;
  top: 17px;
  right: 17px;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid rgb(59 22 32 / 16%);
  border-radius: 50%;
  background: transparent;
  color: #3b1620;
  cursor: pointer;
  transition: background 180ms, transform 180ms;
}
.inquiry-close:hover { background: #e9e0d4; transform: rotate(90deg); }
.inquiry-close svg { width: 17px; height: 17px; stroke: currentColor; stroke-width: 1.4; }
.inquiry-eyebrow {
  margin: 0 0 19px;
  color: #81674b;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: .17em;
}
.inquiry-panel h2 {
  margin: 0;
  color: #3b1620;
  font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  font-size: clamp(30px, 4.2vw, 41px);
  font-weight: 400;
  line-height: 1.16;
  letter-spacing: -.035em;
  white-space: pre-line;
  outline: none;
}
.inquiry-intro { max-width: 480px; margin: 19px 0 29px; color: #77675e; font-size: 13px; line-height: 1.75; }
.inquiry-form { display: grid; gap: 23px; }
.inquiry-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 23px 24px; }
.inquiry-field { display: grid; gap: 9px; min-width: 0; color: #3b1620; font-size: 11px; font-weight: 500; line-height: 1.5; }
.required-mark { color: #907452; }
.inquiry-optional { color: #82776c; font-weight: 400; }
.inquiry-field input, .inquiry-field textarea, .inquiry-field select {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 12px 13px;
  border: 1px solid #d7cdbf;
  border-radius: 0;
  background: rgb(255 255 255 / 25%);
  color: #3b1620;
  font: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  transition: border-color 180ms, background 180ms;
}
.inquiry-field input:hover, .inquiry-field textarea:hover, .inquiry-field select:hover { border-color: #b59a77; }
.inquiry-field input:focus, .inquiry-field textarea:focus, .inquiry-field select:focus { outline: 2px solid #b59a77; outline-offset: 2px; border-color: #b59a77; background: #fcfaf6; }
.inquiry-field textarea { resize: vertical; min-height: 98px; max-height: 240px; }
.inquiry-field textarea::placeholder { color: #968b7e; opacity: 1; }
.inquiry-select { position: relative; display: block; }
.inquiry-select select { appearance: none; padding-right: 34px; cursor: pointer; }
.inquiry-select svg { position: absolute; top: 50%; right: 13px; width: 14px; height: 14px; transform: translateY(-50%); stroke: currentColor; stroke-width: 1.2; pointer-events: none; }
.inquiry-primary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  box-sizing: border-box;
  width: 100%;
  min-height: 52px;
  padding: 15px 21px;
  border: 1px solid #3b1620;
  border-radius: 0;
  background: #3b1620;
  color: #f5f1e9;
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  text-decoration: none;
  cursor: pointer;
  transition: background 200ms;
}
.inquiry-primary:hover { background: #562532; }
.inquiry-primary svg { flex-shrink: 0; width: 21px; height: 21px; stroke: currentColor; stroke-width: 1.2; transition: transform 200ms; }
.inquiry-primary:hover svg { transform: translateX(3px); }
.inquiry-close:focus-visible, .inquiry-primary:focus-visible, .inquiry-edit:focus-visible, .inquiry-footer a:focus-visible, .inquiry-recipient:focus-visible { outline: 2px solid #967851; outline-offset: 4px; }
.inquiry-note { margin: -12px 0 0; color: #82766a; font-size: 10px; line-height: 1.7; }
.inquiry-footer { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px 20px; margin-top: 28px; padding-top: 21px; border-top: 1px solid #dfd5c8; font-size: 11px; line-height: 1.6; color: #82766a; }
.inquiry-footer a { color: #3b1620; font-weight: 500; text-decoration: none; }
.inquiry-footer a:hover { text-decoration: underline; text-underline-offset: 4px; }
.inquiry-signature { padding: 0 58px 26px; }
.inquiry-signature img { display: block; width: 100px; height: auto; opacity: .7; }
.inquiry-review { display: grid; gap: 20px; }
.inquiry-summary { padding: 22px 25px; border: 1px solid #ded2c2; background: #eee7dc; overflow-wrap: anywhere; }
.inquiry-summary-label { margin: 0 0 7px; color: #927955; font-size: 9px; font-weight: 600; letter-spacing: .15em; line-height: 1.5; }
.inquiry-summary-spacer { margin-top: 24px; }
.inquiry-recipient { color: #3b1620; font-size: 14px; text-decoration-color: #b59a77; text-underline-offset: 4px; }
.inquiry-summary-name { margin: 0 0 3px; font-size: 14px; line-height: 1.5; }
.inquiry-summary-email { margin: 0; color: #77675e; font-size: 12px; line-height: 1.7; }
.inquiry-summary-details { margin: 13px 0 0; font-size: 12px; line-height: 1.7; }
.inquiry-summary-details span { padding: 0 6px; color: #b59a77; }
.inquiry-summary-message { margin: 15px 0 0; padding-top: 15px; border-top: 1px solid #d9cdbb; color: #77675e; font-size: 12px; line-height: 1.75; white-space: pre-wrap; }
.inquiry-not-sent { margin: 0; }
.inquiry-long-message { display: grid; gap: 13px; }
.inquiry-copy { justify-self: start; padding: 9px 14px; border: 1px solid #b59a77; border-radius: 0; background: transparent; color: #3b1620; font: inherit; font-size: 11px; cursor: pointer; }
.inquiry-copy:hover { background: #eee7dc; }
.inquiry-copy:focus-visible { outline: 2px solid #967851; outline-offset: 4px; }
.inquiry-edit { justify-self: center; padding: 3px 0; border: 0; border-bottom: 1px solid #b59a77; border-radius: 0; background: none; color: #77675e; font: inherit; font-size: 11px; cursor: pointer; }
.inquiry-edit:hover { color: #3b1620; }
.inquiry-enter-active, .inquiry-leave-active { transition: opacity 260ms ease; }
.inquiry-enter-active .inquiry-panel, .inquiry-leave-active .inquiry-panel { transition: transform 350ms cubic-bezier(.2, .7, .2, 1); }
.inquiry-enter-from, .inquiry-leave-to { opacity: 0; }
.inquiry-enter-from .inquiry-panel, .inquiry-leave-to .inquiry-panel { transform: translateY(22px) scale(.985); }
@media (max-width: 600px) {
  .inquiry-overlay { padding: 12px; }
  .inquiry-panel { max-height: calc(100dvh - 24px); }
  .inquiry-content { padding: 54px 25px 24px; }
  .inquiry-panel h2 { font-size: 31px; }
  .inquiry-grid { grid-template-columns: 1fr; gap: 18px; }
  .inquiry-form { gap: 19px; }
  .inquiry-field input, .inquiry-field textarea, .inquiry-field select { font-size: 16px; }
  .inquiry-intro { font-size: 12px; }
  .inquiry-signature { padding: 0 25px 24px; }
  .inquiry-summary { padding: 20px; }
  .inquiry-note { margin-top: -7px; }
  .inquiry-not-sent { margin-top: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .inquiry-overlay, .inquiry-panel, .inquiry-close, .inquiry-primary, .inquiry-primary svg, .inquiry-field input, .inquiry-field select, .inquiry-field textarea { transition: none !important; }
}
</style>
