<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import InquiryDialog from './components/InquiryDialog.vue'
import LuxIcon from './components/LuxIcon.vue'

type Language = 'en' | 'de'
const language = ref<Language>('de')
const mobileMenu = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const scrolled = ref(false)
const inquiryOpen = ref(false)
const inquiryInterest = ref('')
const selectedMaterial = ref(0)
const productDialog = ref<HTMLDialogElement | null>(null)
const detailIndex = ref(0)
const activeQuestion = ref<number | null>(0)
const currentYear = new Date().getFullYear()
let observer: IntersectionObserver | undefined

const copy = {
  en: {
    nav: ['Collections', 'Our philosophy', 'For professionals', 'Contact'],
    heroLabel: 'FLOORING FOR EVERYDAY LIVING', heroA: 'Find a floor', heroB: 'for the way', heroC: 'you live.',
    heroText: 'Browse parquet, vinyl and skirting options. We’re based in Gossau and happy to help you choose.', discover: 'View our flooring',
    heroNote: 'Based in Gossau, Switzerland.', heroCard: 'OUR PARQUET', heroCardText: 'Oak flooring with a natural grain', scroll: 'EXPLORE THE COLLECTIONS',
    introLabel: 'ABOUT LUXHOLZ', introA: 'A good floor.', introB: 'Chosen for your home.',
    introText: 'Oak brings warmth and visible grain to a room. Vinyl is practical and easy to care for. We’ll help you compare the options and find a floor that suits your space and routine.',
    introLink: 'How we work', collectionLabel: '01 / FLOORING & FINISHES', collectionA: 'Choose a floor.', collectionB: 'See the details.', collectionText: 'Parquet, vinyl and skirting boards for your home or project.',
    explore: 'Explore collection', details: 'The details', close: 'Close collection', inquire: 'Enquire about this material',
    editLabel: '02 / COMPARE MATERIALS', editA: 'See what', editB: 'suits your space.', editText: 'Compare finishes and practical details. If you’re unsure, our team can help you narrow down the options.',
    selected: 'MATERIAL IN VIEW', materialNote: 'Finishes and availability can change. Contact us to confirm current options.',
    storyLabel: '03 / ABOUT LUXHOLZ', storyA: 'Flooring advice', storyB: 'from our team in Gossau.', storyText: 'We help homeowners and trade professionals choose parquet, vinyl and finishing details. Tell us about your rooms and plans; we’ll talk you through the available options and answer your questions.',
    values: [ ['Natural oak', 'Visible grain and variation give every oak floor its own look.'], ['For everyday use', 'Compare surfaces and care requirements before you decide.'], ['Advice from our team', 'We’ll talk through your plans and help you compare materials.'] ],
    tradeLabel: 'FOR ARCHITECTS, DESIGNERS & TRADE', tradeA: 'Flooring for', tradeB: 'your next project.', tradeText: 'Tell us what you’re working on. We can help with product options, quantities and a wholesale quote.', tradeCta: 'Discuss your project', tradeLink: 'Contact our sales team',
    faqLabel: 'COMMON QUESTIONS', faqTitle: 'Before you choose.',
    questions: [ ['How do I choose between parquet and vinyl?', 'Parquet is real wood, with natural grain and variation. Vinyl is a practical option for busy rooms and comes in wood and stone designs. Tell us about the room and we can help you compare them.'], ['Can I use these floors with underfloor heating?', 'Some options in our parquet and vinyl ranges are suitable for underfloor heating. Ask us to check the specifications and installation requirements for the floor you have in mind.'], ['Do you work with architects and trade customers?', 'Yes. We work with architects, interior designers, contractors and wholesale buyers. Contact us with your project details to discuss products, quantities and pricing.'], ['How can I see the available finishes?', 'Get in touch with the material and colour you’re considering. We’ll let you know which finishes are currently available and how to view them.'] ],
    contactLabel: 'VISIT OR GET IN TOUCH', contactA: 'Planning a new', contactB: 'floor?', contactText: 'Tell us what you have in mind. We’ll help you compare materials, finishes and next steps.', contactCta: 'Talk to our team', visit: 'OUR ADDRESS', hours: 'CONTACT & OPENING HOURS', weekdays: 'Monday – Friday', saturday: 'Saturday', directions: 'Get directions',
    footerLine: 'Parquet, vinyl and finishing details from Gossau.', footerNav: 'EXPLORE', footerContact: 'CONTACT', privacy: 'Privacy', terms: 'Terms', rights: 'All rights reserved.', menuOpen: 'Open navigation', menuClose: 'Close navigation',
  },
  de: {
    nav: ['Kollektionen', 'Unsere Philosophie', 'Für Profis', 'Kontakt'],
    heroLabel: 'PARKETT, VINYL & BODENDETAILS', heroA: 'Der passende', heroB: 'Boden für', heroC: 'Ihr Zuhause.',
    heroText: 'Entdecken Sie Parkett, Vinyl und Sockelleisten. Wir sind in Gossau zuhause und beraten Sie gerne bei der Auswahl.', discover: 'Böden entdecken',
    heroNote: 'Zu Hause in Gossau, Schweiz.', heroCard: 'UNSER PARKETT', heroCardText: 'Eichenboden mit natürlicher Maserung', scroll: 'KOLLEKTIONEN ENTDECKEN',
    introLabel: 'ÜBER LUXHOLZ', introA: 'Ein guter Boden.', introB: 'Passend zu Ihrem Zuhause.',
    introText: 'Eiche bringt Wärme und eine sichtbare Maserung in den Raum. Vinyl ist pflegeleicht und praktisch. Wir helfen Ihnen, die Möglichkeiten zu vergleichen und den passenden Boden für Ihre Räume und Ihren Alltag zu finden.',
    introLink: 'So arbeiten wir', collectionLabel: '01 / BÖDEN & ABSCHLÜSSE', collectionA: 'Boden auswählen.', collectionB: 'Details entdecken.', collectionText: 'Parkett, Vinyl und Sockelleisten für Ihr Zuhause oder Ihr Projekt.',
    explore: 'Kollektion entdecken', details: 'Die Details', close: 'Kollektion schliessen', inquire: 'Dieses Material anfragen',
    editLabel: '02 / MATERIALIEN VERGLEICHEN', editA: 'Was passt', editB: 'zu Ihrem Raum?', editText: 'Vergleichen Sie Oberflächen und Eigenschaften. Wenn Sie unsicher sind, helfen wir Ihnen gerne bei der Auswahl.',
    selected: 'MATERIAL IM BILD', materialNote: 'Oberflächen und Verfügbarkeit können sich ändern. Fragen Sie uns nach den aktuellen Optionen.',
    storyLabel: '03 / ÜBER LUXHOLZ', storyA: 'Bodenberatung', storyB: 'aus Gossau.', storyText: 'Wir beraten Privatkunden und Fachleute zu Parkett, Vinyl und passenden Abschlussdetails. Erzählen Sie uns von Ihren Räumen und Plänen – wir zeigen Ihnen die verfügbaren Möglichkeiten und beantworten Ihre Fragen.',
    values: [ ['Natürliche Eiche', 'Maserung und Farbton machen jeden Eichenboden besonders.'], ['Für den Alltag', 'Vergleichen Sie Pflege und Eigenschaften, bevor Sie sich entscheiden.'], ['Persönliche Beratung', 'Wir besprechen Ihre Wünsche und helfen beim Materialvergleich.'] ],
    tradeLabel: 'FÜR ARCHITEKTUR, DESIGN & HANDEL', tradeA: 'Böden für', tradeB: 'Ihr nächstes Projekt.', tradeText: 'Erzählen Sie uns von Ihrem Vorhaben. Wir beraten Sie zu Produkten, Mengen und einer passenden Grosshandelsofferte.', tradeCta: 'Projekt besprechen', tradeLink: 'Unser Verkaufsteam kontaktieren',
    faqLabel: 'HÄUFIGE FRAGEN', faqTitle: 'Vor der Auswahl.',
    questions: [ ['Parkett oder Vinyl – was passt zu mir?', 'Parkett ist echtes Holz und zeigt eine natürliche Maserung. Vinyl ist pflegeleicht und in Holz- und Steinoptiken erhältlich. Erzählen Sie uns, wie Sie den Raum nutzen – wir helfen Ihnen beim Vergleich.'], ['Eignen sich die Böden für eine Fussbodenheizung?', 'Einige Parkett- und Vinylböden sind für Fussbodenheizungen geeignet. Fragen Sie uns nach den Spezifikationen und Verlegehinweisen für Ihren Wunschboden.'], ['Arbeiten Sie mit Architekten und Fachkunden?', 'Ja. Wir arbeiten mit Architekten, Innenarchitekten, Bauunternehmen und Grosshandelskunden. Senden Sie uns die wichtigsten Angaben zu Ihrem Projekt, damit wir Produkte, Mengen und Preise besprechen können.'], ['Welche Oberflächen sind erhältlich?', 'Nennen Sie uns das Material und den Farbton, den Sie suchen. Wir informieren Sie über die aktuell verfügbaren Oberflächen und zeigen Ihnen gerne die nächsten Schritte.'] ],
    contactLabel: 'BESUCHEN SIE UNS ODER KONTAKTIEREN SIE UNS', contactA: 'Sie planen einen', contactB: 'neuen Boden?', contactText: 'Erzählen Sie uns, was Sie vorhaben. Wir helfen Ihnen, Materialien, Oberflächen und die nächsten Schritte zu vergleichen.', contactCta: 'Mit uns sprechen', visit: 'UNSERE ADRESSE', hours: 'KONTAKT & ÖFFNUNGSZEITEN', weekdays: 'Montag – Freitag', saturday: 'Samstag', directions: 'Route planen',
    footerLine: 'Parkett, Vinyl und Abschlussdetails aus Gossau.', footerNav: 'ENTDECKEN', footerContact: 'KONTAKT', privacy: 'Datenschutz', terms: 'AGB', rights: 'Alle Rechte vorbehalten.', menuOpen: 'Navigation öffnen', menuClose: 'Navigation schliessen',
  },
}
const t = computed(() => copy[language.value])
const navIds = ['collections', 'philosophy', 'professionals', 'contact']
const collections = computed(() => language.value === 'en' ? [
  { name: 'Parquet', tag: 'NATURAL OAK', image: '/images/parquet-detail.webp', room: '/images/parquet-detail.webp', mood: 'Oak flooring for your home.', description: 'Real oak has a visible grain and natural variation. Compare the available finishes and choose one that suits your room.', specs: ['Natural oak character', 'Can be sanded & refinished', 'Underfloor heating compatible'], number: '01', interest: 'Parquet', short: 'Oak flooring with a natural grain.' },
  { name: 'Vinyl', tag: 'EASY TO CARE FOR', image: '/images/vinyl-detail.webp', room: '/images/vinyl-detail.webp', mood: 'A practical choice for busy rooms.', description: 'Choose from wood and stone designs made for everyday use. Ask us about waterproof options and acoustic underlay.', specs: ['Waterproof options', 'Integrated acoustic underlay', 'Easy-care surface'], number: '02', interest: 'Vinyl', short: 'Wood and stone looks for everyday use.' },
  { name: 'Skirting', tag: 'FINISHING DETAILS', image: '/images/skirting-profile.svg', room: '/images/skirting-profile.svg', mood: 'A neat finish where floor meets wall.', description: 'Skirting boards cover the joint between floor and wall. Choose from white lacquer or oak veneer, with options for discreet cable routing.', specs: ['White lacquer & oak veneer options', 'Discreet cable management', 'Coordinated finishing details'], number: '03', interest: 'Skirting', short: 'A clean edge where floor meets wall.' },
] : [
  { name: 'Parkett', tag: 'NATÜRLICHE EICHE', image: '/images/parquet-detail.webp', room: '/images/parquet-detail.webp', mood: 'Eichenparkett für Ihr Zuhause.', description: 'Echtes Eichenholz zeigt eine sichtbare Maserung und natürliche Farbunterschiede. Vergleichen Sie die Oberflächen und wählen Sie einen passenden Ton.', specs: ['Natürlicher Eichencharakter', 'Schleifbar & renovierbar', 'Für Fussbodenheizung geeignet'], number: '01', interest: 'Parquet', short: 'Eichenparkett mit natürlicher Maserung.' },
  { name: 'Vinyl', tag: 'PFLEGELEICHT', image: '/images/vinyl-detail.webp', room: '/images/vinyl-detail.webp', mood: 'Praktisch für viel genutzte Räume.', description: 'Wählen Sie aus Holz- und Steinoptiken für den Alltag. Fragen Sie uns nach wasserfesten Ausführungen und integrierter Trittschalldämmung.', specs: ['Wasserfeste Optionen', 'Integrierte Trittschalldämmung', 'Pflegeleichte Oberfläche'], number: '02', interest: 'Vinyl', short: 'Holz- und Steinoptiken für den Alltag.' },
  { name: 'Sockelleisten', tag: 'ABSCHLUSSDETAILS', image: '/images/skirting-profile.svg', room: '/images/skirting-profile.svg', mood: 'Ein sauberer Übergang zur Wand.', description: 'Sockelleisten decken die Fuge zwischen Boden und Wand ab. Zur Auswahl stehen Weisslack oder Eichenfurnier, auch mit dezenter Kabelführung.', specs: ['Weisslack & Eichenfurnier zur Auswahl', 'Dezente Kabelführung', 'Abgestimmte Abschlussdetails'], number: '03', interest: 'Skirting', short: 'Der passende Abschluss zwischen Boden und Wand.' },
])
const material = computed(() => collections.value[selectedMaterial.value]!)
const detail = computed(() => collections.value[detailIndex.value]!)

function openInquiry(interest = '') {
  productDialog.value?.close()
  inquiryInterest.value = interest
  mobileMenu.value = false
  inquiryOpen.value = true
}
function showCollection(index: number) { detailIndex.value = index; productDialog.value?.showModal() }
function closeProduct() { productDialog.value?.close() }
function productBackdrop(event: MouseEvent) { if (event.target === productDialog.value) closeProduct() }
function chooseLanguage(next: Language) {
  language.value = next
  try { localStorage.setItem('luxholz-language', next) } catch { /* Storage is optional. */ }
}
function closeMobileMenu() { mobileMenu.value = false; menuButton.value?.focus() }
function updateScroll() { scrolled.value = window.scrollY > 24 }
function moveMaterial(event: KeyboardEvent, direction: number) {
  selectedMaterial.value = (selectedMaterial.value + direction + 3) % 3
  ;(event.target as HTMLElement).parentElement?.querySelectorAll('button')[selectedMaterial.value]?.focus()
}
watch(language, value => {
  document.documentElement.lang = value
  document.title = value === 'en' ? 'LuxHolz | Parquet, vinyl and skirting in Gossau' : 'LuxHolz | Parkett, Vinyl und Sockelleisten in Gossau'
})
onMounted(() => {
  try {
    const savedLanguage = localStorage.getItem('luxholz-language')
    if (savedLanguage === 'de' || savedLanguage === 'en') language.value = savedLanguage
  } catch { /* Use German by default. */ }
  updateScroll()
  window.addEventListener('scroll', updateScroll, { passive: true })
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer?.unobserve(entry.target) }
  }, { threshold: 0.08 })
  document.querySelectorAll('.reveal').forEach(element => observer?.observe(element))
})
onUnmounted(() => { observer?.disconnect(); window.removeEventListener('scroll', updateScroll) })
</script>

<template>
  <a class="skip-link" href="#main">{{ language === 'en' ? 'Skip to content' : 'Zum Inhalt' }}</a>
  <header class="site-header" :class="{ 'is-scrolled': scrolled, 'menu-open': mobileMenu }">
    <a class="brand" href="#" :aria-label="language === 'en' ? 'LuxHolz home' : 'LuxHolz Startseite'" @click="mobileMenu = false"><img src="/images/luxholz-logo.svg" alt="LuxHolz" width="126" height="35" /></a>
    <nav class="desktop-nav" :aria-label="language === 'en' ? 'Main navigation' : 'Hauptnavigation'"><a v-for="(label, i) in t.nav.slice(0, 3)" :key="i" :href="`#${navIds[i]}`">{{ label }}</a></nav>
    <div class="header-actions"><div class="language-switch" :aria-label="language === 'de' ? 'Sprache' : 'Language'"><button :class="{ active: language === 'de' }" :aria-pressed="language === 'de'" @click="chooseLanguage('de')">DE</button><span>/</span><button :class="{ active: language === 'en' }" :aria-pressed="language === 'en'" @click="chooseLanguage('en')">EN</button></div><a class="header-contact" href="#contact">{{ t.nav[3] }}<LuxIcon name="external" /></a><button ref="menuButton" class="menu-toggle" :aria-label="mobileMenu ? t.menuClose : t.menuOpen" :aria-expanded="mobileMenu" aria-controls="mobile-navigation" @click="mobileMenu = !mobileMenu"><span></span><span></span></button></div>
    <nav v-if="mobileMenu" id="mobile-navigation" class="mobile-nav" :aria-label="t.menuOpen" @keydown.esc="closeMobileMenu"><a v-for="(label, i) in t.nav" :key="i" :href="`#${navIds[i]}`" @click="mobileMenu = false"><span>0{{ i + 1 }}</span>{{ label }}<LuxIcon name="external" /></a><a href="tel:+41764923008">+41 76 492 30 08</a></nav>
  </header>
  <main id="main">
    <section class="hero" aria-labelledby="hero-heading">
      <img class="hero-image" src="/images/parquet-detail.webp" :alt="language === 'en' ? 'Close-up of oak parquet flooring' : 'Nahaufnahme von Eichenparkett'" fetchpriority="high" width="1536" height="1024" /><div class="hero-shade"></div>
      <div class="hero-content"><p class="eyebrow hero-eyebrow"><span class="small-line"></span>{{ t.heroLabel }}</p><h1 id="hero-heading" :aria-label="`${t.heroA} ${t.heroB} ${t.heroC}`"><span>{{ t.heroA }}</span><span>{{ t.heroB }}</span><em>{{ t.heroC }}</em></h1><p class="hero-description">{{ t.heroText }}</p><a class="button button-cream" href="#collections">{{ t.discover }}<LuxIcon name="external" /></a></div>
      <div class="hero-bottom"><a href="#introduction" class="scroll-cue"><span class="scroll-circle"><LuxIcon name="down" /></span><span>{{ t.scroll }}</span></a><p>{{ t.heroNote }}</p></div>
      <button class="hero-material" @click="showCollection(0)"><img src="/images/parquet-detail.webp" alt="" width="66" height="72" /><span><small>{{ t.heroCard }}</small><span>{{ t.heroCardText }}</span></span><LuxIcon class="material-arrow" name="external" /></button><span class="hero-index" aria-hidden="true">01 <i></i> 03</span>
    </section>
    <section id="introduction" class="introduction section-pad reveal"><p class="eyebrow">{{ t.introLabel }}</p><div class="intro-grid"><h2>{{ t.introA }}<br /><em>{{ t.introB }}</em></h2><div class="intro-copy"><p>{{ t.introText }}</p><a class="text-link" href="#philosophy">{{ t.introLink }} <LuxIcon name="external" /></a></div></div><div class="intro-foot"><span class="swiss-cross"><LuxIcon name="swiss" /></span><span>{{ language === 'en' ? 'GOSSAU, SWITZERLAND' : 'GOSSAU, SCHWEIZ' }}</span><div class="fine-rule"></div><span>{{ language === 'en' ? 'PARQUET' : 'PARKETT' }} &nbsp; / &nbsp; VINYL &nbsp; / &nbsp; {{ language === 'en' ? 'FINISHING DETAILS' : 'ABSCHLUSSDETAILS' }}</span></div></section>
    <section id="collections" class="collections section-pad"><div class="section-heading reveal"><div><p class="eyebrow">{{ t.collectionLabel }}</p><h2>{{ t.collectionA }}<br /><em>{{ t.collectionB }}</em></h2></div><p class="section-aside">{{ t.collectionText }}</p></div><div class="collection-grid"><article v-for="(collection, i) in collections" :key="collection.interest" class="collection-card reveal" :style="{ '--delay': `${i * 100}ms` }"><button class="collection-image" @click="showCollection(i)" :aria-label="`${t.explore}: ${collection.name}`"><img :src="collection.image" :alt="collection.name" loading="lazy" width="1024" height="1024" /><span class="collection-number">{{ collection.number }}</span><span class="image-cta"><LuxIcon name="external" /></span></button><div class="collection-info"><span class="eyebrow">{{ collection.tag }}</span><h3><button @click="showCollection(i)">{{ collection.name }}<LuxIcon name="external" /></button></h3><p>{{ collection.short }}</p></div></article></div></section>
    <section id="material-edit" class="material-edit"><div class="material-visual"><Transition name="material-fade" mode="out-in"><img :key="selectedMaterial" :src="material.room" :alt="material.name" loading="lazy" width="1024" height="1024" /></Transition><div class="material-image-caption"><span>{{ t.selected }}</span><span>{{ material.number }} / {{ material.name }}</span></div><span class="material-pin"><LuxIcon name="plus" /></span></div><div class="material-content"><div class="reveal"><p class="eyebrow">{{ t.editLabel }}</p><h2>{{ t.editA }}<br /><em>{{ t.editB }}</em></h2><p class="material-intro">{{ t.editText }}</p></div><div class="material-tabs" role="tablist" :aria-label="t.details"><button v-for="(item, i) in collections" :key="item.interest" :id="`material-tab-${i}`" role="tab" :aria-selected="selectedMaterial === i" aria-controls="material-panel" :tabindex="selectedMaterial === i ? 0 : -1" @click="selectedMaterial = i" @keydown.right.prevent="moveMaterial($event, 1)" @keydown.left.prevent="moveMaterial($event, -1)"><img :src="item.image" alt="" loading="lazy" width="52" height="52" /><span>{{ item.name }}</span><span v-if="selectedMaterial === i" class="tab-check"><LuxIcon name="check" /></span></button></div><div id="material-panel" role="tabpanel" :aria-labelledby="`material-tab-${selectedMaterial}`" aria-live="polite"><h3>{{ material.mood }}</h3><p>{{ material.description }}</p><ul class="material-specs"><li v-for="spec in material.specs" :key="spec"><LuxIcon name="check" />{{ spec }}</li></ul><button class="text-link light" @click="showCollection(selectedMaterial)">{{ t.explore }} <LuxIcon name="external" /></button></div><p class="material-disclaimer">{{ t.materialNote }}</p></div></section>
    <section id="philosophy" class="philosophy section-pad"><div class="story-copy reveal"><p class="eyebrow">{{ t.storyLabel }}</p><h2>{{ t.storyA }}<br /><em>{{ t.storyB }}</em></h2><p class="story-description">{{ t.storyText }}</p><div class="values"><div v-for="(value, i) in t.values" :key="i"><span class="value-number">0{{ i + 1 }}</span><div><h3>{{ value[0] }}</h3><p>{{ value[1] }}</p></div></div></div></div><div class="story-visual reveal"><img src="/images/vinyl-detail.webp" :alt="language === 'en' ? 'Close-up of a flooring sample in a home' : 'Nahaufnahme eines Bodenmusters in einem Wohnraum'" loading="lazy" width="1024" height="1024" /><div class="story-caption"><span>{{ language === 'en' ? 'FLOORING SAMPLES' : 'BODENMUSTER' }}</span><LuxIcon name="external" /></div><span class="image-note">{{ language === 'en' ? 'LUXHOLZ — GOSSAU, SWITZERLAND' : 'LUXHOLZ — GOSSAU, SCHWEIZ' }}</span></div></section>
    <section id="professionals" class="trade section-pad"><div class="trade-top reveal"><p class="eyebrow">{{ t.tradeLabel }}</p><LuxIcon class="trade-symbol" name="parquet" /></div><div class="trade-grid reveal"><h2>{{ t.tradeA }}<br /><em>{{ t.tradeB }}</em></h2><div><p>{{ t.tradeText }}</p><button class="button button-cream" @click="openInquiry('Trade & wholesale')">{{ t.tradeCta }}<LuxIcon name="external" /></button><a href="mailto:sales@luxholz.ch" class="trade-email">{{ t.tradeLink }} <LuxIcon name="external" /></a></div></div><div class="trade-bottom"><span>{{ language === 'en' ? 'ARCHITECTURE' : 'ARCHITEKTUR' }}</span><span>{{ language === 'en' ? 'INTERIOR DESIGN' : 'INNENARCHITEKTUR' }}</span><span>{{ language === 'en' ? 'TRADE & WHOLESALE' : 'HANDEL & GROSSHANDEL' }}</span><span class="trade-signature">LuxHolz</span></div></section>
    <section class="faq section-pad"><div class="reveal"><p class="eyebrow">{{ t.faqLabel }}</p><h2>{{ t.faqTitle }}</h2></div><div class="faq-list reveal"><div v-for="(question, i) in t.questions" :key="i" class="faq-item" :class="{ 'is-open': activeQuestion === i }"><h3><button :aria-expanded="activeQuestion === i" :aria-controls="`answer-${i}`" @click="activeQuestion = activeQuestion === i ? null : i"><span>{{ question[0] }}</span><LuxIcon class="faq-icon" :name="activeQuestion === i ? 'minus' : 'plus'" /></button></h3><div :id="`answer-${i}`" class="faq-answer" :inert="activeQuestion !== i"><div><p>{{ question[1] }}</p></div></div></div></div></section>
    <section id="contact" class="contact section-pad"><div class="contact-heading reveal"><p class="eyebrow">{{ t.contactLabel }}</p><h2>{{ t.contactA }}<br /><em>{{ t.contactB }}</em></h2><p>{{ t.contactText }}</p><button class="button button-wine" @click="openInquiry()">{{ t.contactCta }}<LuxIcon name="external" /></button></div><div class="contact-details reveal"><div class="contact-address"><p class="eyebrow">{{ t.visit }}</p><p>Neuchlenstrasse 37b<br />9200 Gossau SG<br />{{ language === 'en' ? 'Switzerland' : 'Schweiz' }}</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=Neuchlenstrasse+37b+9200+Gossau+SG+Switzerland" target="_blank" rel="noopener noreferrer">{{ t.directions }} <LuxIcon name="external" /></a></div><div><p class="eyebrow">{{ t.hours }}</p><a class="contact-phone" href="tel:+41764923008">+41 76 492 30 08</a><a href="mailto:info@luxholz.ch">info@luxholz.ch</a><div class="opening-hours"><span>{{ t.weekdays }}</span><span>08:00 – 17:00</span><span>{{ t.saturday }}</span><span>08:00 – 12:00</span></div></div></div></section>
  </main>
  <footer class="site-footer section-pad"><div class="footer-top"><div><a href="#" :aria-label="language === 'en' ? 'LuxHolz home' : 'LuxHolz Startseite'"><img class="footer-logo" src="/images/luxholz-logo.svg" alt="LuxHolz" width="126" height="35" /></a><p>{{ t.footerLine }}</p></div><nav :aria-label="t.footerNav"><span class="eyebrow">{{ t.footerNav }}</span><a v-for="(label, i) in t.nav" :key="i" :href="`#${navIds[i]}`">{{ label }}</a></nav><div class="footer-connect"><span class="eyebrow">{{ t.footerContact }}</span><a href="mailto:info@luxholz.ch">info@luxholz.ch <LuxIcon name="external" /></a><a href="tel:+41764923008">+41 76 492 30 08</a><span>{{ language === 'en' ? 'Gossau, Switzerland' : 'Gossau, Schweiz' }}</span></div></div><div class="footer-large" aria-hidden="true">LuxHolz. Gossau.</div><div class="footer-bottom"><span>© {{ currentYear }} LuxHolz. {{ t.rights }}</span><div><a :href="`https://www.luxholz.ch/${language}/privacy`" target="_blank" rel="noopener noreferrer">{{ t.privacy }} <LuxIcon name="external" /></a><a :href="`https://www.luxholz.ch/${language}/terms`" target="_blank" rel="noopener noreferrer">{{ t.terms }} <LuxIcon name="external" /></a><a href="#" :aria-label="language === 'en' ? 'Back to top' : 'Nach oben'"><LuxIcon name="up" /></a></div></div></footer>
  <dialog ref="productDialog" class="product-dialog" aria-labelledby="product-detail-heading" @click="productBackdrop"><div class="product-dialog-inner"><button class="dialog-close" :aria-label="t.close" @click="closeProduct"><LuxIcon name="close" /></button><img :src="detail.image" :alt="detail.name" width="1024" height="1024" /><div class="product-detail-copy"><p class="eyebrow">{{ detail.tag }}</p><h2 id="product-detail-heading">{{ detail.name }}</h2><h3>{{ detail.mood }}</h3><p>{{ detail.description }}</p><ul><li v-for="spec in detail.specs" :key="spec">{{ spec }}</li></ul><button class="button button-wine" @click="openInquiry(detail.interest)">{{ t.inquire }}<LuxIcon name="external" /></button><p class="detail-note">{{ t.materialNote }}</p></div></div></dialog>
  <InquiryDialog :open="inquiryOpen" :language="language" :initial-interest="inquiryInterest" @close="inquiryOpen = false" />
</template>
