<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import InquiryDialog from './components/InquiryDialog.vue'

type Language = 'en' | 'de'
const language = ref<Language>('en')
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
    heroLabel: 'NATURAL CHARACTER. EXCEPTIONAL LIVING.', heroA: 'A beautiful life', heroB: 'starts from', heroC: 'the ground up.',
    heroText: 'Thoughtfully selected parquet, vinyl and finishing details. For spaces that feel unmistakably yours.', discover: 'Discover the collections',
    heroNote: 'Rooted in nature. Selected in Switzerland.', heroCard: 'THE ART OF FEELING AT HOME', heroCardText: 'Discover the warmth of wood', scroll: 'SCROLL TO DISCOVER',
    introLabel: 'THE LUXHOLZ APPROACH', introA: 'More than a floor.', introB: 'A feeling of home.',
    introText: 'The quiet warmth of oak. The texture beneath your feet. The detail that makes everything feel right. We help you find the foundation for the way you want to live.',
    introLink: 'Meet LuxHolz', collectionLabel: '01 / THE COLLECTIONS', collectionA: 'Considered materials.', collectionB: 'Enduring character.', collectionText: 'Three collections. One thoughtful approach to your space.',
    explore: 'Explore collection', details: 'The details', close: 'Close collection', inquire: 'Enquire about this material',
    editLabel: '02 / THE MATERIAL EDIT', editA: 'Find your', editB: 'kind of living.', editText: 'Every space asks for something different. Explore the material that feels right for yours.',
    selected: 'SELECTED MATERIAL', materialNote: 'Imagery for inspiration. Explore finishes and availability with our team.',
    storyLabel: '03 / OUR PHILOSOPHY', storyA: 'Good design', storyB: 'begins with nature.', storyText: 'Based in Gossau, Switzerland, LuxHolz brings together natural character, lasting practicality and a considered eye for design. We believe beautiful spaces begin with materials you love to live with.',
    values: [ ['Character in every grain', 'Natural textures that bring depth and warmth to a room.'], ['Made for everyday life', 'Thoughtful choices for quiet mornings, busy households and everything in between.'], ['A personal approach', 'From your first idea to the right material, we’re here to help.'] ],
    tradeLabel: 'FOR ARCHITECTS, DESIGNERS & TRADE', tradeA: 'Your vision.', tradeB: 'Our foundation.', tradeText: 'A considered partner for your next project. Explore flooring collections, discuss quantities and receive a tailored wholesale offer.', tradeCta: 'Discuss a project', tradeLink: 'Contact our sales team',
    faqLabel: 'A FEW THINGS WORTH KNOWING', faqTitle: 'Thoughtful answers.',
    questions: [ ['Which floor is right for my space?', 'Parquet brings the natural warmth of wood. Vinyl offers a practical, water-resistant choice for busy spaces. Tell us how you use your room and we’ll help you explore the right collection.'], ['Can I use these floors with underfloor heating?', 'Our parquet and vinyl collections include options compatible with underfloor heating. Contact us to confirm the specifications and installation requirements for your chosen floor.'], ['Do you work with architects and trade customers?', 'Yes. We work with architects, interior designers, contractors and wholesale buyers. Our team can discuss your requirements and prepare an offer for your project.'], ['How can I see available finishes?', 'Get in touch to discuss your preferred material, colour and project. We’ll guide you through the current options and the next steps for making your selection.'] ],
    contactLabel: 'LET’S CREATE SOMETHING BEAUTIFUL', contactA: 'Your next chapter.', contactB: 'On a beautiful floor.', contactText: 'A new home. A fresh perspective. An ambitious project. It all starts with a conversation.', contactCta: 'Start your project', visit: 'FIND US', hours: 'LET’S CONNECT', weekdays: 'Monday – Friday', saturday: 'Saturday', directions: 'Get directions',
    footerLine: 'Natural character. Considered living.', footerNav: 'EXPLORE', footerContact: 'GET IN TOUCH', privacy: 'Privacy', terms: 'Terms', rights: 'All rights reserved.', menuOpen: 'Open navigation', menuClose: 'Close navigation',
  },
  de: {
    nav: ['Kollektionen', 'Unsere Philosophie', 'Für Profis', 'Kontakt'],
    heroLabel: 'NATÜRLICHER CHARAKTER. BESONDERES WOHNEN.', heroA: 'Schönes Wohnen', heroB: 'beginnt mit', heroC: 'gutem Boden.',
    heroText: 'Sorgfältig ausgewähltes Parkett, Vinyl und stimmige Details. Für Räume, die sich nach Ihnen anfühlen.', discover: 'Kollektionen entdecken',
    heroNote: 'In der Natur verwurzelt. In der Schweiz ausgewählt.', heroCard: 'DIE KUNST, SICH ZUHAUSE ZU FÜHLEN', heroCardText: 'Die Wärme von Holz entdecken', scroll: 'WEITER ENTDECKEN',
    introLabel: 'DER LUXHOLZ GEDANKE', introA: 'Mehr als ein Boden.', introB: 'Ein Gefühl von Zuhause.',
    introText: 'Die sanfte Wärme der Eiche. Die Struktur unter Ihren Füssen. Das Detail, das alles stimmig macht. Wir helfen Ihnen, die Grundlage für Ihr persönliches Wohngefühl zu finden.',
    introLink: 'LuxHolz kennenlernen', collectionLabel: '01 / DIE KOLLEKTIONEN', collectionA: 'Bewusste Materialien.', collectionB: 'Bleibender Charakter.', collectionText: 'Drei Kollektionen. Ein durchdachtes Konzept für Ihren Raum.',
    explore: 'Kollektion entdecken', details: 'Die Details', close: 'Kollektion schliessen', inquire: 'Dieses Material anfragen',
    editLabel: '02 / DIE MATERIALWELT', editA: 'Finden Sie Ihr', editB: 'Wohngefühl.', editText: 'Jeder Raum ist anders. Entdecken Sie das Material, das zu Ihrem Leben passt.',
    selected: 'AUSGEWÄHLTES MATERIAL', materialNote: 'Bilder zur Inspiration. Oberflächen und Verfügbarkeit besprechen wir gerne persönlich.',
    storyLabel: '03 / UNSERE PHILOSOPHIE', storyA: 'Gutes Design', storyB: 'beginnt in der Natur.', storyText: 'In Gossau zuhause, verbindet LuxHolz natürlichen Charakter, Alltagstauglichkeit und ein Gespür für Design. Wir glauben, dass schöne Räume mit Materialien beginnen, mit denen man gerne lebt.',
    values: [ ['Charakter in jeder Maserung', 'Natürliche Strukturen, die einem Raum Tiefe und Wärme verleihen.'], ['Für den Alltag gedacht', 'Bewusste Entscheidungen für ruhige Morgen, lebendige Haushalte und alles dazwischen.'], ['Persönlich an Ihrer Seite', 'Von Ihrer ersten Idee bis zum passenden Material begleiten wir Sie gerne.'] ],
    tradeLabel: 'FÜR ARCHITEKTUR, DESIGN & HANDEL', tradeA: 'Ihre Vision.', tradeB: 'Unsere Grundlage.', tradeText: 'Ein verlässlicher Partner für Ihr nächstes Projekt. Entdecken Sie unsere Bodenbeläge, besprechen Sie Mengen und erhalten Sie eine individuelle Grosshandelsofferte.', tradeCta: 'Projekt besprechen', tradeLink: 'Unser Verkaufsteam kontaktieren',
    faqLabel: 'GUT ZU WISSEN', faqTitle: 'Durchdachte Antworten.',
    questions: [ ['Welcher Boden passt zu meinem Raum?', 'Parkett bringt die natürliche Wärme von Holz. Vinyl ist eine praktische, wasserbeständige Wahl für belebte Räume. Erzählen Sie uns von Ihrem Alltag – wir helfen Ihnen bei der Auswahl.'], ['Sind die Böden für Fussbodenheizung geeignet?', 'Unsere Parkett- und Vinylkollektionen bieten geeignete Optionen. Kontaktieren Sie uns, um die Spezifikationen und Verlegeanforderungen Ihres gewünschten Bodens abzuklären.'], ['Arbeiten Sie mit Architekten und Fachkunden?', 'Ja. Wir arbeiten mit Architekten, Innenarchitekten, Bauunternehmen und Grosshandelskunden. Gerne besprechen wir Ihre Anforderungen und erstellen eine individuelle Offerte.'], ['Wie kann ich verfügbare Oberflächen entdecken?', 'Kontaktieren Sie uns mit Ihren Vorstellungen zu Material, Farbe und Projekt. Wir zeigen Ihnen die aktuellen Möglichkeiten und begleiten Sie bei der Auswahl.'] ],
    contactLabel: 'GEMEINSAM ETWAS SCHÖNES SCHAFFEN', contactA: 'Ihr nächstes Kapitel.', contactB: 'Auf schönem Boden.', contactText: 'Ein neues Zuhause. Eine frische Perspektive. Ein ambitioniertes Projekt. Alles beginnt mit einem Gespräch.', contactCta: 'Ihr Projekt starten', visit: 'HIER FINDEN SIE UNS', hours: 'WIR SIND FÜR SIE DA', weekdays: 'Montag – Freitag', saturday: 'Samstag', directions: 'Route planen',
    footerLine: 'Natürlicher Charakter. Bewusstes Wohnen.', footerNav: 'ENTDECKEN', footerContact: 'KONTAKT', privacy: 'Datenschutz', terms: 'AGB', rights: 'Alle Rechte vorbehalten.', menuOpen: 'Navigation öffnen', menuClose: 'Navigation schliessen',
  },
}
const t = computed(() => copy[language.value])
const navIds = ['collections', 'philosophy', 'professionals', 'contact']
const collections = computed(() => language.value === 'en' ? [
  { name: 'Parquet', tag: 'NATURALLY TIMELESS', image: '/images/parquet-detail.webp', room: '/images/hero-interior.webp', mood: 'For the love of natural living.', description: 'The warmth of real oak. A living texture. A floor with a character all its own, ready to become part of your story.', specs: ['Natural oak character', 'Can be sanded & refinished', 'Underfloor heating compatible'], number: '01', interest: 'Parquet', short: 'The warmth of wood. The soul of a room.' },
  { name: 'Vinyl', tag: 'BEAUTIFULLY PRACTICAL', image: '/images/vinyl-detail.webp', room: '/images/vinyl-detail.webp', mood: 'For wherever life happens.', description: 'Beautiful wood and stone looks meet everyday resilience. A thoughtful choice for spaces that work as hard as you do.', specs: ['Waterproof options', 'Integrated acoustic underlay', 'Easy-care surface'], number: '02', interest: 'Vinyl', short: 'Effortless style, made for real life.' },
  { name: 'Skirting', tag: 'PERFECTLY RESOLVED', image: '/images/skirting-detail.webp', room: '/images/skirting-detail.webp', mood: 'For a beautifully finished space.', description: 'The quiet detail that ties it all together. Refined profiles to frame your floor and bring a sense of harmony to every room.', specs: ['White lacquer & oak veneer options', 'Discreet cable management', 'Coordinated finishing details'], number: '03', interest: 'Skirting', short: 'Small details. A complete picture.' },
] : [
  { name: 'Parkett', tag: 'NATÜRLICH ZEITLOS', image: '/images/parquet-detail.webp', room: '/images/hero-interior.webp', mood: 'Für die Liebe zum natürlichen Wohnen.', description: 'Die Wärme echter Eiche. Eine lebendige Struktur. Ein Boden mit eigenem Charakter, der Teil Ihrer Geschichte wird.', specs: ['Natürlicher Eichencharakter', 'Schleifbar & renovierbar', 'Für Fussbodenheizung geeignet'], number: '01', interest: 'Parquet', short: 'Die Wärme von Holz. Die Seele eines Raumes.' },
  { name: 'Vinyl', tag: 'SCHÖN UND PRAKTISCH', image: '/images/vinyl-detail.webp', room: '/images/vinyl-detail.webp', mood: 'Für das Leben in all seinen Facetten.', description: 'Edle Holz- und Steinoptiken treffen auf Alltagstauglichkeit. Eine bewusste Wahl für Räume, in denen das Leben spielt.', specs: ['Wasserfeste Optionen', 'Integrierte Trittschalldämmung', 'Pflegeleichte Oberfläche'], number: '02', interest: 'Vinyl', short: 'Müheloser Stil, für das echte Leben.' },
  { name: 'Sockelleisten', tag: 'STIMMIG VOLLENDET', image: '/images/skirting-detail.webp', room: '/images/skirting-detail.webp', mood: 'Für einen harmonischen Abschluss.', description: 'Das leise Detail, das alles verbindet. Edle Profile, die Ihren Boden einrahmen und jedem Raum Harmonie verleihen.', specs: ['Weisslack & Eichenfurnier zur Auswahl', 'Dezente Kabelführung', 'Abgestimmte Abschlussdetails'], number: '03', interest: 'Skirting', short: 'Kleine Details. Ein stimmiges Gesamtbild.' },
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
  document.title = value === 'en' ? 'LuxHolz — The Art of Living, From the Ground Up' : 'LuxHolz — Schönes Wohnen beginnt mit gutem Boden'
})
onMounted(() => {
  try { if (localStorage.getItem('luxholz-language') === 'de') language.value = 'de' } catch { /* Use English by default. */ }
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
    <div class="header-actions"><div class="language-switch" aria-label="Language"><button :class="{ active: language === 'en' }" :aria-pressed="language === 'en'" @click="chooseLanguage('en')">EN</button><span>/</span><button :class="{ active: language === 'de' }" :aria-pressed="language === 'de'" @click="chooseLanguage('de')">DE</button></div><a class="header-contact" href="#contact">{{ t.nav[3] }}<span aria-hidden="true">↗</span></a><button ref="menuButton" class="menu-toggle" :aria-label="mobileMenu ? t.menuClose : t.menuOpen" :aria-expanded="mobileMenu" aria-controls="mobile-navigation" @click="mobileMenu = !mobileMenu"><span></span><span></span></button></div>
    <nav v-if="mobileMenu" id="mobile-navigation" class="mobile-nav" :aria-label="t.menuOpen" @keydown.esc="closeMobileMenu"><a v-for="(label, i) in t.nav" :key="i" :href="`#${navIds[i]}`" @click="mobileMenu = false"><span>0{{ i + 1 }}</span>{{ label }}<span>↗</span></a><a href="tel:+41764923008">+41 76 492 30 08</a></nav>
  </header>
  <main id="main">
    <section class="hero" aria-labelledby="hero-heading">
      <img class="hero-image" src="/images/hero-interior.webp" :alt="language === 'en' ? 'Sunlit living room with natural oak flooring and warm neutral furnishings' : 'Sonniges Wohnzimmer mit natürlichem Eichenboden und warmen, neutralen Möbeln'" fetchpriority="high" width="1024" height="1024" /><div class="hero-shade"></div>
      <div class="hero-content"><p class="eyebrow hero-eyebrow"><span class="small-line"></span>{{ t.heroLabel }}</p><h1 id="hero-heading" :aria-label="`${t.heroA} ${t.heroB} ${t.heroC}`"><span>{{ t.heroA }}</span><span>{{ t.heroB }}</span><em>{{ t.heroC }}</em></h1><p class="hero-description">{{ t.heroText }}</p><a class="button button-cream" href="#collections">{{ t.discover }}<span aria-hidden="true">↗</span></a></div>
      <div class="hero-bottom"><a href="#introduction" class="scroll-cue"><span class="scroll-circle" aria-hidden="true">↓</span><span>{{ t.scroll }}</span></a><p>{{ t.heroNote }}</p></div>
      <button class="hero-material" @click="showCollection(0)"><img src="/images/parquet-detail.webp" alt="" width="66" height="72" /><span><small>{{ t.heroCard }}</small><span>{{ t.heroCardText }}</span></span><span class="material-arrow" aria-hidden="true">↗</span></button><span class="hero-index" aria-hidden="true">01 <i></i> 03</span>
    </section>
    <section id="introduction" class="introduction section-pad reveal"><p class="eyebrow">{{ t.introLabel }}</p><div class="intro-grid"><h2>{{ t.introA }}<br /><em>{{ t.introB }}</em></h2><div class="intro-copy"><p>{{ t.introText }}</p><a class="text-link" href="#philosophy">{{ t.introLink }} <span aria-hidden="true">↗</span></a></div></div><div class="intro-foot"><span class="swiss-cross" aria-hidden="true">+</span><span>{{ language === 'en' ? 'GOSSAU, SWITZERLAND' : 'GOSSAU, SCHWEIZ' }}</span><div class="fine-rule"></div><span>{{ language === 'en' ? 'PARQUET' : 'PARKETT' }} &nbsp; / &nbsp; VINYL &nbsp; / &nbsp; {{ language === 'en' ? 'FINISHING DETAILS' : 'ABSCHLUSSDETAILS' }}</span></div></section>
    <section id="collections" class="collections section-pad"><div class="section-heading reveal"><div><p class="eyebrow">{{ t.collectionLabel }}</p><h2>{{ t.collectionA }}<br /><em>{{ t.collectionB }}</em></h2></div><p class="section-aside">{{ t.collectionText }}</p></div><div class="collection-grid"><article v-for="(collection, i) in collections" :key="collection.interest" class="collection-card reveal" :style="{ '--delay': `${i * 100}ms` }"><button class="collection-image" @click="showCollection(i)" :aria-label="`${t.explore}: ${collection.name}`"><img :src="collection.image" :alt="collection.name" loading="lazy" width="1024" height="1024" /><span class="collection-number">{{ collection.number }}</span><span class="image-cta" aria-hidden="true">↗</span></button><div class="collection-info"><span class="eyebrow">{{ collection.tag }}</span><h3><button @click="showCollection(i)">{{ collection.name }}<span aria-hidden="true">↗</span></button></h3><p>{{ collection.short }}</p></div></article></div></section>
    <section id="material-edit" class="material-edit"><div class="material-visual"><Transition name="material-fade" mode="out-in"><img :key="selectedMaterial" :src="material.room" :alt="material.name" loading="lazy" width="1024" height="1024" /></Transition><div class="material-image-caption"><span>{{ t.selected }}</span><span>{{ material.number }} / {{ material.name }}</span></div><span class="material-pin" aria-hidden="true">+</span></div><div class="material-content"><div class="reveal"><p class="eyebrow">{{ t.editLabel }}</p><h2>{{ t.editA }}<br /><em>{{ t.editB }}</em></h2><p class="material-intro">{{ t.editText }}</p></div><div class="material-tabs" role="tablist" :aria-label="t.details"><button v-for="(item, i) in collections" :key="item.interest" :id="`material-tab-${i}`" role="tab" :aria-selected="selectedMaterial === i" aria-controls="material-panel" :tabindex="selectedMaterial === i ? 0 : -1" @click="selectedMaterial = i" @keydown.right.prevent="moveMaterial($event, 1)" @keydown.left.prevent="moveMaterial($event, -1)"><img :src="item.image" alt="" loading="lazy" width="52" height="52" /><span>{{ item.name }}</span><span v-if="selectedMaterial === i" class="tab-check" aria-hidden="true">✓</span></button></div><div id="material-panel" role="tabpanel" :aria-labelledby="`material-tab-${selectedMaterial}`" aria-live="polite"><h3>{{ material.mood }}</h3><p>{{ material.description }}</p><ul class="material-specs"><li v-for="spec in material.specs" :key="spec"><span aria-hidden="true">↗</span>{{ spec }}</li></ul><button class="text-link light" @click="showCollection(selectedMaterial)">{{ t.explore }} <span aria-hidden="true">↗</span></button></div><p class="material-disclaimer">{{ t.materialNote }}</p></div></section>
    <section id="philosophy" class="philosophy section-pad"><div class="story-copy reveal"><p class="eyebrow">{{ t.storyLabel }}</p><h2>{{ t.storyA }}<br /><em>{{ t.storyB }}</em></h2><p class="story-description">{{ t.storyText }}</p><div class="values"><div v-for="(value, i) in t.values" :key="i"><span class="value-number">0{{ i + 1 }}</span><div><h3>{{ value[0] }}</h3><p>{{ value[1] }}</p></div></div></div></div><div class="story-visual reveal"><img src="/images/bedroom-interior.webp" :alt="language === 'en' ? 'A calm bedroom with oak parquet flooring' : 'Ein ruhiges Schlafzimmer mit Eichenparkett'" loading="lazy" width="1024" height="1536" /><div class="story-caption"><span>{{ language === 'en' ? 'THE BEAUTY OF EVERYDAY' : 'DIE SCHÖNHEIT DES ALLTAGS' }}</span><span aria-hidden="true">↗</span></div><span class="image-note">{{ language === 'en' ? 'LUXHOLZ — A NATURAL PERSPECTIVE' : 'LUXHOLZ — EINE NATÜRLICHE PERSPEKTIVE' }}</span></div></section>
    <section id="professionals" class="trade section-pad"><div class="trade-top reveal"><p class="eyebrow">{{ t.tradeLabel }}</p><span class="trade-symbol" aria-hidden="true">✳</span></div><div class="trade-grid reveal"><h2>{{ t.tradeA }}<br /><em>{{ t.tradeB }}</em></h2><div><p>{{ t.tradeText }}</p><button class="button button-cream" @click="openInquiry('Trade & wholesale')">{{ t.tradeCta }}<span aria-hidden="true">↗</span></button><a href="mailto:sales@luxholz.ch" class="trade-email">{{ t.tradeLink }} <span aria-hidden="true">↗</span></a></div></div><div class="trade-bottom"><span>{{ language === 'en' ? 'ARCHITECTURE' : 'ARCHITEKTUR' }}</span><span>{{ language === 'en' ? 'INTERIOR DESIGN' : 'INNENARCHITEKTUR' }}</span><span>{{ language === 'en' ? 'TRADE & WHOLESALE' : 'HANDEL & GROSSHANDEL' }}</span><span class="trade-signature">LuxHolz</span></div></section>
    <section class="faq section-pad"><div class="reveal"><p class="eyebrow">{{ t.faqLabel }}</p><h2>{{ t.faqTitle }}</h2></div><div class="faq-list reveal"><div v-for="(question, i) in t.questions" :key="i" class="faq-item" :class="{ 'is-open': activeQuestion === i }"><h3><button :aria-expanded="activeQuestion === i" :aria-controls="`answer-${i}`" @click="activeQuestion = activeQuestion === i ? null : i"><span>{{ question[0] }}</span><span class="faq-icon" aria-hidden="true">{{ activeQuestion === i ? '−' : '+' }}</span></button></h3><div :id="`answer-${i}`" class="faq-answer" :inert="activeQuestion !== i"><div><p>{{ question[1] }}</p></div></div></div></div></section>
    <section id="contact" class="contact section-pad"><div class="contact-heading reveal"><p class="eyebrow">{{ t.contactLabel }}</p><h2>{{ t.contactA }}<br /><em>{{ t.contactB }}</em></h2><p>{{ t.contactText }}</p><button class="button button-wine" @click="openInquiry()">{{ t.contactCta }}<span aria-hidden="true">↗</span></button></div><div class="contact-details reveal"><div class="contact-address"><p class="eyebrow">{{ t.visit }}</p><p>Neuchlenstrasse 37b<br />9200 Gossau SG<br />{{ language === 'en' ? 'Switzerland' : 'Schweiz' }}</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=Neuchlenstrasse+37b+9200+Gossau+SG+Switzerland" target="_blank" rel="noopener noreferrer">{{ t.directions }} <span aria-hidden="true">↗</span></a></div><div><p class="eyebrow">{{ t.hours }}</p><a class="contact-phone" href="tel:+41764923008">+41 76 492 30 08</a><a href="mailto:info@luxholz.ch">info@luxholz.ch</a><div class="opening-hours"><span>{{ t.weekdays }}</span><span>08:00 – 17:00</span><span>{{ t.saturday }}</span><span>08:00 – 12:00</span></div></div></div></section>
  </main>
  <footer class="site-footer section-pad"><div class="footer-top"><div><a href="#" :aria-label="language === 'en' ? 'LuxHolz home' : 'LuxHolz Startseite'"><img class="footer-logo" src="/images/luxholz-logo.svg" alt="LuxHolz" width="126" height="35" /></a><p>{{ t.footerLine }}</p></div><nav :aria-label="t.footerNav"><span class="eyebrow">{{ t.footerNav }}</span><a v-for="(label, i) in t.nav" :key="i" :href="`#${navIds[i]}`">{{ label }}</a></nav><div class="footer-connect"><span class="eyebrow">{{ t.footerContact }}</span><a href="mailto:info@luxholz.ch">info@luxholz.ch ↗</a><a href="tel:+41764923008">+41 76 492 30 08</a><span>{{ language === 'en' ? 'Gossau, Switzerland' : 'Gossau, Schweiz' }}</span></div></div><div class="footer-large" aria-hidden="true">Naturally, LuxHolz.</div><div class="footer-bottom"><span>© {{ currentYear }} LuxHolz. {{ t.rights }}</span><div><a :href="`https://www.luxholz.ch/${language}/privacy`" target="_blank" rel="noopener noreferrer">{{ t.privacy }} ↗</a><a :href="`https://www.luxholz.ch/${language}/terms`" target="_blank" rel="noopener noreferrer">{{ t.terms }} ↗</a><a href="#" :aria-label="language === 'en' ? 'Back to top' : 'Nach oben'">↑</a></div></div></footer>
  <dialog ref="productDialog" class="product-dialog" aria-labelledby="product-detail-heading" @click="productBackdrop"><div class="product-dialog-inner"><button class="dialog-close" :aria-label="t.close" @click="closeProduct">×</button><img :src="detail.image" :alt="detail.name" width="1024" height="1024" /><div class="product-detail-copy"><p class="eyebrow">{{ detail.tag }}</p><h2 id="product-detail-heading">{{ detail.name }}</h2><h3>{{ detail.mood }}</h3><p>{{ detail.description }}</p><ul><li v-for="spec in detail.specs" :key="spec">{{ spec }}</li></ul><button class="button button-wine" @click="openInquiry(detail.interest)">{{ t.inquire }}<span aria-hidden="true">↗</span></button><p class="detail-note">{{ t.materialNote }}</p></div></div></dialog>
  <InquiryDialog :open="inquiryOpen" :language="language" :initial-interest="inquiryInterest" @close="inquiryOpen = false" />
</template>
