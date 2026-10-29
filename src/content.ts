// LuxHolz content in German and English. Facts come from www.luxholz.ch (see README).

export type Language = 'de' | 'en'

export const company = {
  name: 'LuxHolz',
  street: 'Neuchlenstrasse 37b',
  city: '9200 Gossau SG',
  phone: '+41 76 492 30 08',
  phoneHref: 'tel:+41764923008',
  email: 'info@luxholz.ch',
  salesEmail: 'sales@luxholz.ch',
  maps: 'https://www.google.com/maps/search/?api=1&query=Neuchlenstrasse+37b+9200+Gossau+SG+Switzerland',
  hours: { weekdays: '08:00 – 17:00', saturday: '08:00 – 12:00' },
}

export type Interest = 'parquet' | 'vinyl' | 'skirting' | 'unsure'
export type ProjectType = 'home' | 'architecture' | 'trade'

export interface Collection {
  id: Exclude<Interest, 'unsure'>
  name: string
  tag: string
  image: string
  mood: string
  short: string
  description: string
  specs: string[]
}

const collections: Record<Language, Collection[]> = {
  en: [
    { id: 'parquet', name: 'Parquet', tag: 'NATURAL OAK', image: '/images/parquet-detail.webp', mood: 'Oak flooring for your home.', short: 'Oak flooring with a natural grain.', description: 'Real oak has a visible grain and natural variation. Compare the available finishes and choose one that suits your room.', specs: ['Natural oak character', 'Can be sanded & refinished', 'Underfloor heating compatible'] },
    { id: 'vinyl', name: 'Vinyl', tag: 'EASY TO CARE FOR', image: '/images/vinyl-detail.webp', mood: 'A practical choice for busy rooms.', short: 'Wood and stone looks for everyday use.', description: 'Choose from wood and stone designs made for everyday use. Ask us about waterproof options and acoustic underlay.', specs: ['Waterproof options', 'Integrated acoustic underlay', 'Easy-care surface'] },
    { id: 'skirting', name: 'Skirting', tag: 'FINISHING DETAILS', image: '/images/skirting-profile.svg', mood: 'A neat finish where floor meets wall.', short: 'A clean edge where floor meets wall.', description: 'Skirting boards cover the joint between floor and wall. Choose from white lacquer or oak veneer, with options for discreet cable routing.', specs: ['White lacquer & oak veneer options', 'Discreet cable management', 'Coordinated finishing details'] },
  ],
  de: [
    { id: 'parquet', name: 'Parkett', tag: 'NATÜRLICHE EICHE', image: '/images/parquet-detail.webp', mood: 'Eichenparkett für Ihr Zuhause.', short: 'Eichenparkett mit natürlicher Maserung.', description: 'Echtes Eichenholz zeigt eine sichtbare Maserung und natürliche Farbunterschiede. Vergleichen Sie die Oberflächen und wählen Sie einen passenden Ton.', specs: ['Natürlicher Eichencharakter', 'Schleifbar & renovierbar', 'Für Fussbodenheizung geeignet'] },
    { id: 'vinyl', name: 'Vinyl', tag: 'PFLEGELEICHT', image: '/images/vinyl-detail.webp', mood: 'Praktisch für viel genutzte Räume.', short: 'Holz- und Steinoptiken für den Alltag.', description: 'Wählen Sie aus Holz- und Steinoptiken für den Alltag. Fragen Sie uns nach wasserfesten Ausführungen und integrierter Trittschalldämmung.', specs: ['Wasserfeste Optionen', 'Integrierte Trittschalldämmung', 'Pflegeleichte Oberfläche'] },
    { id: 'skirting', name: 'Sockelleisten', tag: 'ABSCHLUSSDETAILS', image: '/images/skirting-profile.svg', mood: 'Ein sauberer Übergang zur Wand.', short: 'Der passende Abschluss zwischen Boden und Wand.', description: 'Sockelleisten decken die Fuge zwischen Boden und Wand ab. Zur Auswahl stehen Weisslack oder Eichenfurnier, auch mit dezenter Kabelführung.', specs: ['Weisslack & Eichenfurnier zur Auswahl', 'Dezente Kabelführung', 'Abgestimmte Abschlussdetails'] },
  ],
}

const copy = {
  en: {
    skip: 'Skip to content', home: 'LuxHolz home', menuOpen: 'Open navigation', menuClose: 'Close navigation', langLabel: 'Language',
    nav: ['Collections', 'Our philosophy', 'For professionals', 'Contact'],
    heroLabel: 'FLOORING FOR EVERYDAY LIVING', heroA: 'Find a floor', heroB: 'for the way', heroC: 'you live.',
    heroText: 'Browse parquet, vinyl and skirting options. We’re based in Gossau and happy to help you choose.',
    discover: 'View our flooring', talk: 'Talk to our team', heroNote: 'Based in Gossau, Switzerland.',
    viewer: 'Material in view', dragHint: 'Drag to rotate', sceneLabel: 'Interactive 3D flooring sample',
    marquee: ['Parquet', 'Vinyl', 'Skirting', 'Natural oak', 'Gossau SG', 'Personal advice', 'Trade & wholesale'],
    introLabel: 'ABOUT LUXHOLZ', introA: 'A good floor.', introB: 'Chosen for your home.',
    introText: 'Oak brings warmth and visible grain to a room. Vinyl is practical and easy to care for. We’ll help you compare the options and find a floor that suits your space and routine.',
    collectionLabel: '01 — FLOORING & FINISHES', collectionA: 'Choose a floor.', collectionB: 'See the details.', collectionText: 'Parquet, vinyl and skirting boards for your home or project.',
    explore: 'Explore collection', close: 'Close collection', inquire: 'Enquire about this material', view3d: 'View in 3D',
    editLabel: '02 — COMPARE MATERIALS', editA: 'See what', editB: 'suits your space.', editText: 'Compare finishes and practical details. If you’re unsure, our team can help you narrow down the options.',
    materialNote: 'Finishes and availability can change. Contact us to confirm current options.',
    storyLabel: '03 — ABOUT LUXHOLZ', storyA: 'Flooring advice', storyB: 'from our team in Gossau.',
    storyText: 'We help homeowners and trade professionals choose parquet, vinyl and finishing details. Tell us about your rooms and plans; we’ll talk you through the available options and answer your questions.',
    values: [['Natural oak', 'Visible grain and variation give every oak floor its own look.'], ['For everyday use', 'Compare surfaces and care requirements before you decide.'], ['Advice from our team', 'We’ll talk through your plans and help you compare materials.']],
    samples: 'FLOORING SAMPLES',
    tradeLabel: 'FOR ARCHITECTS, DESIGNERS & TRADE', tradeA: 'Flooring for', tradeB: 'your next project.',
    tradeText: 'Tell us what you’re working on. We can help with product options, quantities and a wholesale quote.',
    tradeCta: 'Discuss your project', tradeLink: 'Contact our sales team', tradeAreas: ['Architecture', 'Interior design', 'Trade & wholesale'],
    faqLabel: 'COMMON QUESTIONS', faqTitle: 'Before you choose.',
    questions: [
      ['How do I choose between parquet and vinyl?', 'Parquet is real wood, with natural grain and variation. Vinyl is a practical option for busy rooms and comes in wood and stone designs. Tell us about the room and we can help you compare them.'],
      ['Can I use these floors with underfloor heating?', 'Some options in our parquet and vinyl ranges are suitable for underfloor heating. Ask us to check the specifications and installation requirements for the floor you have in mind.'],
      ['Do you work with architects and trade customers?', 'Yes. We work with architects, interior designers, contractors and wholesale buyers. Contact us with your project details to discuss products, quantities and pricing.'],
      ['How can I see the available finishes?', 'Get in touch with the material and colour you’re considering. We’ll let you know which finishes are currently available and how to view them.'],
    ],
    contactLabel: 'VISIT OR GET IN TOUCH', contactA: 'Planning a new', contactB: 'floor?', contactText: 'Tell us what you have in mind. We’ll help you compare materials, finishes and next steps.',
    visit: 'Our address', hoursLabel: 'Opening hours', weekdays: 'Monday – Friday', saturday: 'Saturday', directions: 'Get directions', country: 'Switzerland',
    form: {
      name: 'Your name', email: 'Email address', project: 'Your project', interest: 'What are you considering?', message: 'Anything else we should know? (optional)',
      home: 'Private home', architecture: 'Architecture & design', trade: 'Trade & wholesale', parquet: 'Parquet', vinyl: 'Vinyl', skirting: 'Skirting', unsure: 'Not sure yet',
      submit: 'Prepare email', note: 'Opens your email app with the enquiry filled in — you send it from there.', sent: 'Your email app should now open. Send the message from there to reach us.',
      nameError: 'Please enter your name.', emailError: 'Please enter a valid email address.', subject: 'Project inquiry', fallback: 'I would like to discuss my project with LuxHolz.',
    },
    footerLine: 'Parquet, vinyl and finishing details from Gossau.', privacy: 'Privacy', terms: 'Terms', rights: 'All rights reserved.', top: 'Back to top',
    title: 'LuxHolz | Parquet, vinyl and skirting in Gossau',
  },
  de: {
    skip: 'Zum Inhalt', home: 'LuxHolz Startseite', menuOpen: 'Navigation öffnen', menuClose: 'Navigation schliessen', langLabel: 'Sprache',
    nav: ['Kollektionen', 'Unsere Philosophie', 'Für Profis', 'Kontakt'],
    heroLabel: 'PARKETT, VINYL & BODENDETAILS', heroA: 'Der passende', heroB: 'Boden für', heroC: 'Ihr Zuhause.',
    heroText: 'Entdecken Sie Parkett, Vinyl und Sockelleisten. Wir sind in Gossau zuhause und beraten Sie gerne bei der Auswahl.',
    discover: 'Böden entdecken', talk: 'Mit uns sprechen', heroNote: 'Zu Hause in Gossau, Schweiz.',
    viewer: 'Material im Blick', dragHint: 'Ziehen zum Drehen', sceneLabel: 'Interaktives 3D-Bodenmuster',
    marquee: ['Parkett', 'Vinyl', 'Sockelleisten', 'Natürliche Eiche', 'Gossau SG', 'Persönliche Beratung', 'Handel & Grosshandel'],
    introLabel: 'ÜBER LUXHOLZ', introA: 'Ein guter Boden.', introB: 'Passend zu Ihrem Zuhause.',
    introText: 'Eiche bringt Wärme und eine sichtbare Maserung in den Raum. Vinyl ist pflegeleicht und praktisch. Wir helfen Ihnen, die Möglichkeiten zu vergleichen und den passenden Boden für Ihre Räume und Ihren Alltag zu finden.',
    collectionLabel: '01 — BÖDEN & ABSCHLÜSSE', collectionA: 'Boden auswählen.', collectionB: 'Details entdecken.', collectionText: 'Parkett, Vinyl und Sockelleisten für Ihr Zuhause oder Ihr Projekt.',
    explore: 'Kollektion entdecken', close: 'Kollektion schliessen', inquire: 'Dieses Material anfragen', view3d: 'In 3D ansehen',
    editLabel: '02 — MATERIALIEN VERGLEICHEN', editA: 'Was passt', editB: 'zu Ihrem Raum?', editText: 'Vergleichen Sie Oberflächen und Eigenschaften. Wenn Sie unsicher sind, helfen wir Ihnen gerne bei der Auswahl.',
    materialNote: 'Oberflächen und Verfügbarkeit können sich ändern. Fragen Sie uns nach den aktuellen Optionen.',
    storyLabel: '03 — ÜBER LUXHOLZ', storyA: 'Bodenberatung', storyB: 'aus Gossau.',
    storyText: 'Wir beraten Privatkunden und Fachleute zu Parkett, Vinyl und passenden Abschlussdetails. Erzählen Sie uns von Ihren Räumen und Plänen – wir zeigen Ihnen die verfügbaren Möglichkeiten und beantworten Ihre Fragen.',
    values: [['Natürliche Eiche', 'Maserung und Farbton machen jeden Eichenboden besonders.'], ['Für den Alltag', 'Vergleichen Sie Pflege und Eigenschaften, bevor Sie sich entscheiden.'], ['Persönliche Beratung', 'Wir besprechen Ihre Wünsche und helfen beim Materialvergleich.']],
    samples: 'BODENMUSTER',
    tradeLabel: 'FÜR ARCHITEKTUR, DESIGN & HANDEL', tradeA: 'Böden für', tradeB: 'Ihr nächstes Projekt.',
    tradeText: 'Erzählen Sie uns von Ihrem Vorhaben. Wir beraten Sie zu Produkten, Mengen und einer passenden Grosshandelsofferte.',
    tradeCta: 'Projekt besprechen', tradeLink: 'Unser Verkaufsteam kontaktieren', tradeAreas: ['Architektur', 'Innenarchitektur', 'Handel & Grosshandel'],
    faqLabel: 'HÄUFIGE FRAGEN', faqTitle: 'Vor der Auswahl.',
    questions: [
      ['Parkett oder Vinyl – was passt zu mir?', 'Parkett ist echtes Holz und zeigt eine natürliche Maserung. Vinyl ist pflegeleicht und in Holz- und Steinoptiken erhältlich. Erzählen Sie uns, wie Sie den Raum nutzen – wir helfen Ihnen beim Vergleich.'],
      ['Eignen sich die Böden für eine Fussbodenheizung?', 'Einige Parkett- und Vinylböden sind für Fussbodenheizungen geeignet. Fragen Sie uns nach den Spezifikationen und Verlegehinweisen für Ihren Wunschboden.'],
      ['Arbeiten Sie mit Architekten und Fachkunden?', 'Ja. Wir arbeiten mit Architekten, Innenarchitekten, Bauunternehmen und Grosshandelskunden. Senden Sie uns die wichtigsten Angaben zu Ihrem Projekt, damit wir Produkte, Mengen und Preise besprechen können.'],
      ['Welche Oberflächen sind erhältlich?', 'Nennen Sie uns das Material und den Farbton, den Sie suchen. Wir informieren Sie über die aktuell verfügbaren Oberflächen und zeigen Ihnen gerne die nächsten Schritte.'],
    ],
    contactLabel: 'BESUCHEN SIE UNS ODER KONTAKTIEREN SIE UNS', contactA: 'Sie planen einen', contactB: 'neuen Boden?', contactText: 'Erzählen Sie uns, was Sie vorhaben. Wir helfen Ihnen, Materialien, Oberflächen und die nächsten Schritte zu vergleichen.',
    visit: 'Unsere Adresse', hoursLabel: 'Öffnungszeiten', weekdays: 'Montag – Freitag', saturday: 'Samstag', directions: 'Route planen', country: 'Schweiz',
    form: {
      name: 'Ihr Name', email: 'E-Mail-Adresse', project: 'Ihr Projekt', interest: 'Wofür interessieren Sie sich?', message: 'Was sollten wir noch wissen? (optional)',
      home: 'Privates Wohnen', architecture: 'Architektur & Design', trade: 'Handel & Grosshandel', parquet: 'Parkett', vinyl: 'Vinyl', skirting: 'Sockelleisten', unsure: 'Noch unentschieden',
      submit: 'E-Mail vorbereiten', note: 'Öffnet Ihr E-Mail-Programm mit der ausgefüllten Anfrage – Sie senden sie von dort.', sent: 'Ihr E-Mail-Programm sollte sich jetzt öffnen. Senden Sie die Nachricht von dort an uns.',
      nameError: 'Bitte geben Sie Ihren Namen ein.', emailError: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.', subject: 'Projektanfrage', fallback: 'Ich möchte mein Projekt mit LuxHolz besprechen.',
    },
    footerLine: 'Parkett, Vinyl und Abschlussdetails aus Gossau.', privacy: 'Datenschutz', terms: 'AGB', rights: 'Alle Rechte vorbehalten.', top: 'Nach oben',
    title: 'LuxHolz | Parkett, Vinyl und Sockelleisten in Gossau',
  },
}

export const getCopy = (lang: Language) => copy[lang]
export const getCollections = (lang: Language) => collections[lang]
export const navIds = ['collections', 'philosophy', 'professionals', 'contact']
