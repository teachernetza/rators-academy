import { REF_YEARS } from "./roulette-years";

export type RouletteLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type RouletteRef = { title: string; site: string; url: string; year: number };
export type RouletteTopic = { name: string; goal: string; refs: RouletteRef[] };

const G = (path: string, title: string) => ({
  title,
  site: "Grammarly Blog",
  url: `https://www.grammarly.com/blog/${path}/`,
});

type Raw = [string, string, { title: string; site: string; url: string }[]];

const RAW: Record<RouletteLevel, Raw[]> = {
  A1: [
    ["Verbo to be", "Presentarte y describir personas y cosas con am, is, are.", [G("grammar/to-be", "To be"), G("parts-of-speech/linking-verbs", "Linking verbs")]],
    ["Saludos", "Iniciar y cerrar conversaciones de forma natural.", [G("vocabulary/greeting-words", "Greeting words")]],
    ["Pronombres personales", "Usar I, you, he, she, it, we, they.", [G("parts-of-speech/personal-pronouns", "Personal pronouns"), G("parts-of-speech/the-basics-on-subject-and-object-pronouns-b", "Subject and object pronouns")]],
    ["Presente simple", "Hablar de hábitos, gustos y datos personales.", [G("frequently-asked-questions/what-are-examples-of-the-simple-present-tense", "Simple present examples"), G("grammar/simple-tense", "Simple tenses")]],
    ["Artículos a, an, the", "Usar correctamente los artículos con sustantivos.", [G("parts-of-speech/articles", "Articles")]],
    ["Plurales", "Formar el plural de los sustantivos.", [G("parts-of-speech/plural-nouns", "Plural nouns"), G("grammar/spelling-plurals-with-s-es", "Plurals with -s and -es")]],
    ["Plurales irregulares", "Recordar plurales como children, men, feet.", [G("parts-of-speech/irregular-plural-nouns", "Irregular plural nouns")]],
    ["Posesivos", "Indicar a quién pertenece algo.", [G("parts-of-speech/possessive-pronouns", "Possessive pronouns"), G("parts-of-speech/possessive-nouns", "Possessive nouns")]],
    ["This, that, these, those", "Señalar objetos cercanos y lejanos.", [G("parts-of-speech/demonstrative-pronouns", "Demonstrative pronouns")]],
    ["Preposiciones in, on, at", "Ubicar en tiempo y lugar con in, on y at.", [G("parts-of-speech/prepositions-in-on-at", "In, on, at"), G("parts-of-speech/prepositions", "Prepositions")]],
    ["Fechas y días", "Escribir fechas, días y meses correctamente.", [G("writing-tips/how-to-write-dates", "How to write dates"), G("punctuation-capitalization/capitalization-the-days-of-the-week-the-months", "Days and months")]],
    ["Números ordinales", "Decir first, second, third…", [G("writing-tips/how-to-write-ordinal-numbers-correctly", "Ordinal numbers")]],
    ["Imperativos", "Dar instrucciones y órdenes sencillas.", [G("grammar/imperative", "Imperative"), G("parts-of-speech/imperative-verbs", "Imperative verbs")]],
    ["Preguntas con wh-", "Hacer preguntas con what, who, which.", [G("grammar/interrogative-pronouns", "Interrogative pronouns")]],
    ["Sustantivos comunes y propios", "Distinguir nombres generales y nombres propios.", [G("parts-of-speech/common-noun", "Common nouns"), G("parts-of-speech/proper-nouns", "Proper nouns")]],
  ],
  A2: [
    ["Presente continuo", "Describir acciones que ocurren ahora.", [G("grammar/present-continuous", "Present continuous")]],
    ["Pasado simple", "Contar lo que hiciste ayer o el año pasado.", [G("grammar/simple-past", "Simple past"), G("frequently-asked-questions/what-are-examples-of-the-simple-past-tense", "Simple past examples")]],
    ["Verbos irregulares", "Dominar los pasados irregulares más frecuentes.", [G("parts-of-speech/irregular-verbs", "Irregular verbs"), G("grammar/learn-the-difference-between-gone-and-went-in-less-than-a-minute", "Gone vs went")]],
    ["Futuro simple", "Hablar del futuro con will.", [G("grammar/simple-future", "Simple future")]],
    ["Comparativos", "Comparar dos personas o cosas.", [G("parts-of-speech/comparative-adjectives", "Comparative adjectives")]],
    ["Superlativos", "Decir cuál es el más o el menos de un grupo.", [G("parts-of-speech/superlative-adjectives", "Superlative adjectives")]],
    ["Contables e incontables", "Saber cuándo usar much, many, a, some.", [G("parts-of-speech/countable-and-uncountable-nouns", "Countable and uncountable nouns"), G("parts-of-speech/mass-noun", "Mass nouns")]],
    ["Adverbios de frecuencia", "Decir con qué frecuencia haces algo.", [G("frequently-asked-questions/what-are-adverbs-of-frequency", "Adverbs of frequency")]],
    ["Adverbios de tiempo y lugar", "Decir cuándo y dónde pasa algo.", [G("frequently-asked-questions/what-are-adverbs-of-time", "Adverbs of time"), G("frequently-asked-questions/adverbs-of-place", "Adverbs of place")]],
    ["Adjetivos", "Describir personas, lugares y objetos.", [G("parts-of-speech/adjective", "Adjectives"), G("parts-of-speech/adjectives-and-adverbs", "Adjectives and adverbs")]],
    ["Pronombres reflexivos", "Usar myself, yourself, themselves…", [G("parts-of-speech/reflexive-pronouns", "Reflexive pronouns")]],
    ["Pronombres indefinidos", "Usar someone, anything, nobody…", [G("parts-of-speech/indefinite-pronouns", "Indefinite pronouns"), G("commonly-confused-words/nowhere-somewhere-anywhere", "Nowhere, somewhere, anywhere")]],
    ["Can y could", "Expresar habilidad y pedir permiso.", [G("commonly-confused-words/can-vs-could", "Can vs could")]],
    ["Conectores básicos", "Unir ideas con and, but, or, so.", [G("parts-of-speech/coordinating-conjunctions", "Coordinating conjunctions"), G("parts-of-speech/conjunctions", "Conjunctions")]],
    ["Has vs have", "Conjugar have correctamente en presente.", [G("commonly-confused-words/has-vs-have", "Has vs have")]],
  ],
  B1: [
    ["Presente perfecto", "Conectar experiencias pasadas con el presente.", [G("grammar/present-perfect-tense", "Present perfect tense"), G("frequently-asked-questions/what-is-the-perfect-verb-tense", "Perfect tenses")]],
    ["Pasado continuo", "Narrar escenas e interrupciones en el pasado.", [G("grammar/past-continuous-tense", "Past continuous tense")]],
    ["Used to", "Hablar de hábitos pasados que ya no ocurren.", [G("vocabulary/used-to", "Used to"), G("vocabulary/supposed-to", "Supposed to")]],
    ["Primer condicional", "Hablar de situaciones reales y sus consecuencias.", [G("grammar/the-essentials-of-conditionals", "Conditionals"), G("grammar/will-would-in-if-clause", "Will/would in if-clauses")]],
    ["Verbos modales", "Expresar obligación, consejo y posibilidad.", [G("parts-of-speech/modal-verbs", "Modal verbs"), G("commonly-confused-words/may-might", "May vs might")]],
    ["Gerundios", "Usar el verbo con -ing como sustantivo.", [G("grammar/gerund", "Gerund")]],
    ["Infinitivos", "Usar to + verbo para propósitos y patrones.", [G("grammar/infinitives", "Infinitives")]],
    ["Voz pasiva", "Poner el foco en la acción, no en quién la hace.", [G("grammar/passive-voice", "Passive voice"), G("sentences/active-vs-passive-voice", "Active vs passive voice")]],
    ["Pronombres relativos", "Dar información extra con who, which, that.", [G("parts-of-speech/relative-pronouns", "Relative pronouns"), G("grammar/who-vs-that", "Who vs that")]],
    ["Phrasal verbs comunes", "Entender y usar phrasal verbs del día a día.", [G("parts-of-speech/common-phrasal-verbs", "Common phrasal verbs"), G("parts-of-speech/10-phrasal-verbs-that-are-useful-for-business", "Phrasal verbs for business")]],
    ["Verbos auxiliares", "Usar do, be y have para formar tiempos y preguntas.", [G("parts-of-speech/auxiliary-verbs", "Auxiliary verbs")]],
    ["Oraciones negativas", "Formar negaciones correctamente.", [G("grammar/negatives", "Negatives")]],
    ["Contracciones", "Usar I'm, don't, won't de forma natural.", [G("grammar/contractions", "Contractions")]],
    ["Linking words", "Ordenar ideas con first, then, however…", [G("grammar/linking-words", "Linking words"), G("writing-techniques/transition-words-phrases", "Transition words")]],
    ["Idioms cotidianos", "Entender expresiones idiomáticas frecuentes.", [G("idioms/english-idioms", "English idioms"), G("idioms/idioms-about-time", "Idioms about time")]],
  ],
  B2: [
    ["Condicionales 2 y 3", "Imaginar situaciones hipotéticas en presente y pasado.", [G("sentences/conditional-sentences", "Conditional sentences"), G("sentences/conditional-sentences-was-instead-of-were", "Was vs were in conditionals")]],
    ["Pasado perfecto", "Ordenar dos acciones en el pasado.", [G("grammar/past-perfect", "Past perfect")]],
    ["Pasado perfecto continuo", "Enfatizar duración antes de otro pasado.", [G("grammar/past-perfect-continuous-tense", "Past perfect continuous")]],
    ["Presente perfecto continuo", "Enfatizar la duración de una acción.", [G("grammar/present-perfect-continuous-tense", "Present perfect continuous")]],
    ["Futuro continuo", "Proyectar acciones en curso en el futuro.", [G("grammar/future-continuous-tense", "Future continuous tense")]],
    ["Reported speech", "Contar lo que otra persona dijo.", [G("grammar/direct-and-reported-speech", "Direct and reported speech"), G("vocabulary/other-ways-to-say-said", "Other ways to say said")]],
    ["Non-defining clauses", "Añadir información extra con comas.", [G("grammar/grammar-basics-what-are-non-defining-clauses", "Non-defining clauses"), G("parts-of-speech/adjective-clause", "Adjective clauses")]],
    ["Cláusulas subordinadas", "Construir oraciones complejas.", [G("grammar/subordinate-clause", "Subordinate clauses"), G("grammar/independent-and-dependent-clauses", "Independent and dependent clauses")]],
    ["Adverbios conjuntivos", "Contrastar y conectar: however, therefore, moreover.", [G("parts-of-speech/conjunctive-adverbs", "Conjunctive adverbs"), G("commonly-confused-words/nonetheless-nevertheless", "Nonetheless vs nevertheless")]],
    ["Conjunciones correlativas", "Usar either…or, neither…nor, both…and.", [G("parts-of-speech/correlative-conjunctions", "Correlative conjunctions"), G("commonly-confused-words/either-vs-neither", "Either vs neither")]],
    ["Verbos transitivos e intransitivos", "Saber cuándo un verbo necesita objeto.", [G("parts-of-speech/transitive-and-intransitive-verbs", "Transitive and intransitive verbs")]],
    ["Concordancia sujeto-verbo", "Evitar errores de concordancia.", [G("grammar/grammar-basics-what-is-subject-verb-agreement", "Subject-verb agreement")]],
    ["Who vs whom", "Elegir el pronombre relativo correcto.", [G("commonly-confused-words/who-vs-whom", "Who vs whom"), G("commonly-confused-words/whos-whose", "Who's vs whose")]],
    ["Like vs such as", "Dar ejemplos con precisión.", [G("grammar/like-vs-such-as", "Like vs such as"), G("business-writing/how-to-use-such-as-and-as-well-as-in-professional-writing", "Such as / as well as")]],
    ["Ensayo de opinión", "Escribir y defender tu punto de vista.", [G("academic-writing/opinion-essay", "Opinion essay"), G("academic-writing/argumentative-essay", "Argumentative essay")]],
  ],
  C1: [
    ["Subjuntivo", "Usar formas como if I were, I suggest he go.", [G("grammar/subjunctive", "Subjunctive mood")]],
    ["Participios", "Condensar ideas con -ing y -ed.", [G("grammar/participle", "Participle")]],
    ["Hedging", "Suavizar afirmaciones en escritura académica.", [G("writing-techniques/hedging-language", "Hedging language"), G("grammar/qualifiers", "Qualifiers")]],
    ["Énfasis en la oración", "Destacar información clave al escribir.", [G("sentences/sentence-emphasis", "Sentence emphasis")]],
    ["Ellipsis", "Omitir palabras sin perder el sentido.", [G("punctuation-capitalization/ellipsis", "Ellipsis")]],
    ["Registro formal e informal", "Adaptar el lenguaje al contexto.", [G("writing-tips/formal-vs-informal-writing", "Formal vs informal writing"), G("writing-tips/how-to-write-a-formal-letter", "Formal letter")]],
    ["Cláusulas nominales", "Usar ideas completas como sujeto u objeto.", [G("parts-of-speech/noun-clause", "Noun clauses"), G("grammar/clauses", "Clauses")]],
    ["Cláusulas adverbiales", "Expresar causa, condición y concesión.", [G("parts-of-speech/adverbial-clause", "Adverbial clauses")]],
    ["Adverbios de grado", "Intensificar o suavizar con very, fairly, utterly.", [G("frequently-asked-questions/what-are-adverbs-of-degree", "Adverbs of degree")]],
    ["Modificadores mal colocados", "Evitar ambigüedades en oraciones complejas.", [G("grammar/misplaced-modifiers", "Misplaced modifiers"), G("grammar/how-to-eliminate-dangling-modifiers-from-your-writing", "Dangling modifiers")]],
    ["Estructura paralela", "Escribir listas y comparaciones equilibradas.", [G("parts-of-speech/parallel-structure-prepositions", "Parallel structure")]],
    ["Concisión", "Decir más con menos palabras.", [G("writing-techniques/conciseness", "Conciseness"), G("writing-techniques/clarity-in-writing", "Clarity in writing")]],
    ["Ensayo persuasivo", "Argumentar con estructura y recursos retóricos.", [G("academic-writing/how-to-write-a-persuasive-essay", "Persuasive essay"), G("writing-techniques/persuasive-writing", "Persuasive writing")]],
    ["Thesis statement", "Formular la idea central de un texto académico.", [G("academic-writing/thesis-statement", "Thesis statement"), G("academic-writing/essay-structure", "Essay structure")]],
    ["Affect vs effect", "Distinguir palabras que confunden incluso a nativos.", [G("commonly-confused-words/affect-vs-effect", "Affect vs effect"), G("commonly-confused-words/assure-ensure-insure", "Assure, ensure, insure")]],
  ],
  C2: [
    ["Verbos impersonales", "Escribir con distancia y objetividad.", [G("parts-of-speech/impersonal-verbs", "Impersonal verbs")]],
    ["Morfología", "Entender cómo se construyen las palabras.", [G("grammar/morphology", "Morphology")]],
    ["Prefijos y sufijos", "Crear palabras derivadas con precisión.", [G("grammar/prefixes", "Prefixes"), G("grammar/suffixes", "Suffixes"), G("grammar/affixes", "Affixes")]],
    ["Complementos", "Enriquecer frases con complementos de sujeto y objeto.", [G("grammar/subject-complement", "Subject complement"), G("grammar/object-complement", "Object complement")]],
    ["Punto y coma, dos puntos y guion", "Puntuar como un escritor profesional.", [G("punctuation-capitalization/semicolon-vs-colon-vs-dash", "Semicolon vs colon vs dash"), G("punctuation-capitalization/semicolon", "Semicolon"), G("punctuation-capitalization/what-is-an-em-dash", "Em dash")]],
    ["Comma splice y fragmentos", "Eliminar errores de estructura avanzados.", [G("punctuation-capitalization/comma-splice", "Comma splice"), G("sentences/sentence-fragment", "Sentence fragments")]],
    ["Figuras retóricas", "Usar metáforas, símiles e hipérboles.", [G("literary-devices/whats-the-difference-between-a-simile-and-a-metaphor", "Simile vs metaphor"), G("literary-devices/hyperbole", "Hyperbole")]],
    ["Metonimia y sinécdoque", "Reconocer recursos de estilo sofisticados.", [G("literary-devices/metonymy", "Metonymy"), G("literary-devices/synecdoche", "Synecdoche")]],
    ["Circunlocución y pleonasmo", "Detectar redundancias y rodeos.", [G("literary-devices/circumlocution", "Circumlocution"), G("literary-devices/pleonasm", "Pleonasm")]],
    ["Diction y elección de palabras", "Elegir la palabra exacta para cada contexto.", [G("literary-devices/diction-in-writing", "Diction"), G("writing-techniques/word-choice", "Word choice")]],
    ["Tono y matiz", "Controlar el tono emocional de un texto.", [G("writing-techniques/tone-vs-mood", "Tone vs mood"), G("writing-techniques/tone-and-emotions", "Tone and emotions")]],
    ["Proverbios y refranes", "Usar sabiduría popular de forma natural.", [G("idioms/english-proverbs", "English proverbs"), G("idioms/what-are-idioms", "What are idioms")]],
    ["Juegos de palabras", "Entender humor y dobles sentidos.", [G("literary-devices/puns", "Puns"), G("literary-devices/wordplay", "Wordplay")]],
    ["Palabras poco comunes", "Ampliar léxico culto: albeit, indubitably, peruse.", [G("vocabulary/albeit", "Albeit"), G("vocabulary/indubitably", "Indubitably"), G("vocabulary/peruse", "Peruse")]],
    ["Paradojas y antítesis", "Expresar ideas complejas con contraste.", [G("literary-devices/paradox", "Paradox"), G("writing-techniques/amplification-in-writing", "Amplification")]],
  ],
};

export const ROULETTE_LEVELS: RouletteLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const ROULETTE: Record<RouletteLevel, RouletteTopic[]> = Object.fromEntries(
  ROULETTE_LEVELS.map((lvl) => [
    lvl,
    RAW[lvl].map(([name, goal, refs]) => ({
      name,
      goal,
      refs: refs
        .filter((r) => REF_YEARS[r.url] && REF_YEARS[r.url] >= 2022)
        .map((r) => ({ ...r, year: REF_YEARS[r.url] })),
    })),
  ]),
) as Record<RouletteLevel, RouletteTopic[]>;

export const ALL_REF_URLS = ROULETTE_LEVELS.flatMap((l) => RAW[l].flatMap((t) => t[2].map((r) => r.url)));
