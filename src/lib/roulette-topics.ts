import { REF_YEARS } from "./roulette-years";

export type RouletteLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type RouletteRef = { title: string; site: string; url: string; year: number };
export type RouletteTopic = { name: string; goal: string; refs: RouletteRef[] };

const P = (slug: string, title: string) => ({
  title,
  site: "Perfect English Grammar",
  url: `https://www.perfect-english-grammar.com/${slug}.html`,
});
const C = (slug: string, title: string) => ({
  title,
  site: "Cambridge Dictionary · Grammar",
  url: `https://dictionary.cambridge.org/grammar/british-grammar/${slug}`,
});

type Raw = [string, string, { title: string; site: string; url: string }[]];

const RAW: Record<RouletteLevel, Raw[]> = {
  A1: [
    ["Verbo to be", "Presentarte y describir personas y cosas con am, is, are.", [C("be", "Be"), C("pronouns-personal-i-me-you-him-it-they-etc", "Personal pronouns")]],
    ["Saludos y despedidas", "Iniciar y cerrar conversaciones de forma natural.", [C("greetings-and-farewells-hello-goodbye-happy-new-year", "Greetings and farewells"), C("names-and-titles-addressing-people", "Names and titles")]],
    ["Presente simple", "Hablar de hábitos, gustos y datos personales.", [P("present-simple", "Present simple form"), P("present-simple-use", "Present simple use"), C("present-simple-i-work", "Present simple")]],
    ["Artículos a, an, the", "Usar correctamente los artículos con sustantivos.", [C("a-an-and-the", "A/an and the")]],
    ["Plurales", "Formar el plural regular e irregular de los sustantivos.", [C("nouns-singular-and-plural", "Nouns: singular and plural")]],
    ["Adjetivos posesivos", "Indicar a quién pertenece algo: my, your, his, her…", [P("possessive-adjectives", "Possessive adjectives"), C("pronouns-possessive-my-mine-your-yours-etc", "Possessives")]],
    ["This, that, these, those", "Señalar objetos cercanos y lejanos.", [C("determiners-this-that-or-these-those", "This, that, these, those")]],
    ["There is / there are", "Describir lo que hay en un lugar.", [C("here-and-there", "Here and there"), C("dummy-subjects", "Dummy subjects")]],
    ["Números y fechas", "Decir edades, precios, fechas y cantidades.", [C("numbers", "Numbers"), C("dates", "Dates")]],
    ["La hora", "Preguntar y decir la hora con seguridad.", [C("time", "Time"), C("approximations-around-four-o-clock", "Approximations")]],
    ["Preposiciones de tiempo", "Usar at, in y on con horas, días y meses.", [P("prepositions-of-time", "Prepositions of time"), C("at-on-and-in-time", "At, on and in (time)")]],
    ["Preposiciones de lugar", "Ubicar personas y objetos en el espacio.", [P("prepositions-of-place", "Prepositions of place"), C("at-on-and-in-place", "At, on and in (place)")]],
    ["Can para habilidades", "Decir lo que sabes y no sabes hacer.", [P("modal-verbs-of-ability", "Modal verbs of ability"), C("can", "Can")]],
    ["Preguntas con wh-", "Hacer preguntas básicas: what, where, who, when.", [P("questions", "Questions"), C("questions-wh-questions", "Wh-questions")]],
    ["Imperativos", "Dar instrucciones y órdenes sencillas.", [C("imperative-clauses-be-quiet", "Imperative clauses"), C("commands-and-instructions", "Commands and instructions")]],
  ],
  A2: [
    ["Presente continuo", "Describir acciones que ocurren ahora.", [P("present-continuous", "Present continuous"), P("present-continuous-use", "Present continuous use"), C("present-continuous-i-am-working", "Present continuous")]],
    ["Presente simple vs continuo", "Elegir entre rutina y acción en curso.", [P("present-simple-or-present-continuous", "Present simple or continuous"), C("present-simple-or-present-continuous", "Present simple or continuous")]],
    ["Pasado simple", "Contar lo que hiciste ayer o el año pasado.", [P("past-simple", "Past simple form"), P("past-simple-use", "Past simple use"), C("past-simple-i-worked", "Past simple")]],
    ["Verbos irregulares", "Dominar los pasados irregulares más frecuentes.", [P("irregular-verbs", "Irregular verbs")]],
    ["Pronunciación de -ed", "Pronunciar /t/, /d/ e /ɪd/ en el pasado regular.", [P("how-to-pronounce-ed", "How to pronounce -ed")]],
    ["Comparativos", "Comparar dos personas o cosas.", [P("comparatives", "Comparatives"), C("comparison-adjectives-bigger-biggest-more-interesting", "Comparison: adjectives")]],
    ["Superlativos", "Decir cuál es el más o el menos de un grupo.", [P("superlatives", "Superlatives"), P("adjectives-comparative-and-superlative", "Comparative and superlative")]],
    ["Some y any", "Hablar de cantidades en afirmativo, negativo y pregunta.", [P("some-and-any", "Some and any"), C("any", "Any")]],
    ["Contables e incontables", "Usar much, many, a lot of correctamente.", [C("much-many-a-lot-of-lots-of-quantifiers", "Much, many, a lot of"), P("a-little-a-few", "A little / a few")]],
    ["Going to", "Hablar de planes e intenciones futuras.", [C("future-be-going-to-i-am-going-to-work", "Be going to"), C("going-to", "Going to")]],
    ["Adverbios de frecuencia", "Decir con qué frecuencia haces algo.", [P("adverbs-of-frequency", "Adverbs of frequency"), C("always", "Always")]],
    ["Must y have to", "Expresar obligación y necesidad.", [P("modal-verbs-of-obligation", "Modal verbs of obligation"), C("must", "Must")]],
    ["Would like", "Pedir y ofrecer cosas con cortesía.", [C("would-like", "Would like"), C("word-patterns-would-like", "Would like (patterns)")]],
    ["Pronombres objeto y reflexivos", "Usar me, him, them, myself…", [P("reflexive-pronouns", "Reflexive pronouns"), C("pronouns-reflexive-myself-themselves-etc", "Reflexive pronouns")]],
    ["Conectores básicos", "Unir ideas con and, but, so, because.", [C("conjunctions", "Conjunctions"), C("because-because-of-and-cos-cos-of", "Because / because of")]],
  ],
  B1: [
    ["Presente perfecto", "Conectar experiencias pasadas con el presente.", [P("present-perfect", "Present perfect"), P("present-perfect-use", "Present perfect use"), C("present-perfect-simple-i-have-worked", "Present perfect simple")]],
    ["Presente perfecto vs pasado simple", "Elegir el tiempo según el momento de la acción.", [P("present-perfect-or-past-simple", "Present perfect or past simple"), C("past-simple-or-present-perfect", "Past simple or present perfect")]],
    ["For, since, already, yet", "Expresar duración y acciones esperadas.", [C("for-or-since", "For or since"), C("already-still-or-yet", "Already, still or yet")]],
    ["Pasado continuo", "Narrar escenas e interrupciones en el pasado.", [P("past-continuous", "Past continuous"), C("past-continuous-or-past-simple", "Past continuous or simple")]],
    ["Used to", "Hablar de hábitos pasados que ya no ocurren.", [P("used-to", "Used to"), C("used-to", "Used to")]],
    ["Will vs going to", "Distinguir predicciones, decisiones y planes.", [P("will-or-be-going-to", "Will or be going to"), C("future-will-and-shall", "Will and shall")]],
    ["Primer condicional", "Hablar de situaciones reales y sus consecuencias.", [P("first-conditional", "First conditional"), C("conditionals-if", "Conditionals: if")]],
    ["Zero conditional", "Expresar verdades generales y hechos.", [P("zero-conditional", "Zero conditional"), C("conditionals", "Conditionals")]],
    ["Modales de consejo", "Dar recomendaciones con should y ought to.", [C("should", "Should"), P("modal-verbs", "Modal verbs")]],
    ["Gerundios e infinitivos", "Elegir entre -ing y to + verbo.", [P("gerunds-and-infinitives", "Gerunds and infinitives"), C("verb-patterns-verb-infinitive-or-verb-ing", "Verb patterns")]],
    ["Voz pasiva (presente y pasado)", "Poner el foco en la acción, no en quién la hace.", [P("passive", "The passive"), C("passive-voice", "Passive voice")]],
    ["Relative clauses", "Dar información extra con who, which, that.", [P("relative-clauses", "Relative clauses"), C("relative-pronouns", "Relative pronouns")]],
    ["Make vs do", "Usar las colocaciones correctas de make y do.", [P("make-or-do", "Make or do"), C("collocation-do-or-make", "Do or make")]],
    ["Phrasal verbs comunes", "Entender y usar phrasal verbs del día a día.", [P("phrasal-verbs-1", "Phrasal verbs 1"), C("phrasal-verbs-and-multi-word-verbs", "Phrasal verbs")]],
    ["Tag questions", "Confirmar información de forma natural.", [P("tag-questions", "Tag questions"), C("tags", "Tags")]],
  ],
  B2: [
    ["Segundo condicional", "Imaginar situaciones hipotéticas en el presente.", [P("second-conditional", "Second conditional"), C("conditionals-and-wishes", "Conditionals and wishes")]],
    ["Tercer condicional", "Hablar de pasados imposibles y arrepentimientos.", [P("third-conditional", "Third conditional"), C("conditionals-typical-errors", "Conditionals: errors")]],
    ["Pasado perfecto", "Ordenar dos acciones en el pasado.", [P("past-perfect", "Past perfect"), C("past-perfect-simple-i-had-worked", "Past perfect simple")]],
    ["Presente perfecto continuo", "Enfatizar la duración de una acción.", [P("present-perfect-continuous", "Present perfect continuous"), C("present-perfect-simple-or-present-perfect-continuous", "Simple or continuous")]],
    ["Futuro continuo y perfecto", "Proyectar acciones en momentos futuros.", [P("future-continuous", "Future continuous"), P("future-perfect", "Future perfect"), C("future-perfect-simple-i-will-have-worked-eight-hours", "Future perfect")]],
    ["Reported speech", "Contar lo que otra persona dijo.", [P("reported-speech", "Reported speech"), C("reported-speech-indirect-speech", "Indirect speech")]],
    ["Verbos para reportar", "Usar suggest, admit, deny, warn…", [P("reporting-verbs", "Reporting verbs"), C("reported-speech-reporting-nouns", "Reporting nouns")]],
    ["Modales de deducción", "Expresar certeza o posibilidad: must, might, can't.", [P("modal-verbs-of-probability", "Modals of probability"), C("could-may-and-might", "Could, may and might")]],
    ["Modales en pasado", "Deducir y criticar el pasado: should have, might have.", [P("past-modals", "Past modals"), C("modality-tense", "Modality: tense")]],
    ["Wish e if only", "Expresar deseos y lamentos.", [P("wish", "Wish"), C("wish", "Wish")]],
    ["Causativo have/get", "Decir que alguien hace algo por ti.", [P("causatives-have-get", "Causatives"), C("have-something-done", "Have something done")]],
    ["Defining vs non-defining", "Usar cláusulas relativas con y sin comas.", [C("relative-clauses-defining-and-non-defining", "Defining and non-defining"), P("relative-pronouns", "Relative pronouns")]],
    ["Conectores de contraste", "Contrastar ideas: although, however, despite.", [C("conjunctions-contrasting", "Contrasting"), C("although-or-though", "Although or though")]],
    ["Indirect questions", "Preguntar con más cortesía y formalidad.", [P("indirect-questions", "Indirect questions"), C("questions", "Questions")]],
    ["Stative verbs", "Saber qué verbos no van en continuo.", [P("stative-verbs", "Stative verbs"), P("present-simple-or-present-continuous", "Simple or continuous")]],
  ],
  C1: [
    ["Inversión enfática", "Dar énfasis formal: Never have I…, Not only…", [C("inversion", "Inversion"), C("negation-emphasising", "Emphasising negation")]],
    ["Cleft sentences", "Resaltar información: It was… that, What I need is…", [C("cleft-sentences-it-was-in-june-we-got-married", "Cleft sentences"), C("fronting", "Fronting")]],
    ["Condicionales mixtos", "Combinar tiempos en situaciones hipotéticas.", [C("conditionals-other-expressions-unless-should-as-long-as", "Other conditional expressions"), P("third-conditional", "Third conditional")]],
    ["Pasiva avanzada", "Usar pasivas con reporting verbs y get.", [C("passive-other-forms", "Passive: other forms"), C("get-passive", "Get passive"), C("passives-with-and-without-an-agent", "Passives with/without agent")]],
    ["Participle clauses", "Condensar ideas con -ing y -ed.", [C("clauses-finite-and-non-finite", "Finite and non-finite clauses"), P("participle-adjectives", "Participle adjectives")]],
    ["Hedging", "Suavizar afirmaciones en escritura académica.", [C("hedges-just", "Hedges"), C("modality-other-modal-words-and-expressions", "Other modal expressions")]],
    ["Discourse markers", "Organizar el discurso oral y escrito.", [C("discourse-markers-so-right-okay", "Discourse markers"), C("adverbs-as-discourse-markers-anyway-finally", "Adverbs as discourse markers")]],
    ["Ellipsis y substitution", "Evitar repeticiones como un hablante nativo.", [C("ellipsis", "Ellipsis"), C("substitution", "Substitution")]],
    ["Registro formal e informal", "Adaptar el lenguaje al contexto.", [C("formal-and-informal-language", "Formal and informal language"), C("register", "Register")]],
    ["Colocaciones", "Combinar palabras de forma natural.", [C("collocation", "Collocation"), C("collocation-big-or-great", "Big or great")]],
    ["Frases nominales complejas", "Construir sustantivos con información densa.", [C("noun-phrases", "Noun phrases"), C("noun-phrases-dependent-words", "Dependent words")]],
    ["Adjetivos graduables", "Intensificar con absolutely, utterly, fairly.", [P("gradable-and-ungradable-adjectives", "Gradable adjectives"), P("intensifiers", "Intensifiers")]],
    ["It's time, would rather", "Expresar preferencias y urgencia con pasado irreal.", [C("it-s-time", "It's time"), C("would-rather-would-sooner", "Would rather")]],
    ["Verb patterns avanzados", "Dominar patrones: stop/remember/regret + -ing/to.", [C("stop-ing-form-or-to-infinitive", "Stop + -ing or to"), P("gerunds-and-infinitives-verbs-3", "Gerunds & infinitives 3")]],
    ["Futuro en el pasado", "Hablar de planes pasados que no ocurrieron.", [C("future-in-the-past", "Future in the past"), C("future-other-expressions-to-talk-about-the-future", "Other future expressions")]],
  ],
  C2: [
    ["Fronting", "Reordenar la oración para efecto estilístico.", [C("fronting", "Fronting"), C("inversion", "Inversion")]],
    ["Estilo impersonal", "Escribir con distancia y objetividad.", [C("detached-impersonal-style", "Detached impersonal style"), C("pronouns-one-you-we-they", "One, you, we, they")]],
    ["Modalidad avanzada", "Matizar significado con todo el sistema modal.", [C("modality-meanings-and-uses", "Modality: meanings"), C("modality-other-verbs", "Modality: other verbs")]],
    ["Present forms for the past", "Usar el presente para narrar con viveza.", [C("present-verb-forms-referring-to-the-past", "Present forms for the past"), C("past-verb-forms-referring-to-the-present", "Past forms for the present")]],
    ["Supposing / what if", "Plantear hipótesis sofisticadas.", [C("suppose-supposing-and-what-if", "Suppose and what if"), C("as-if-and-as-though", "As if / as though")]],
    ["Inglés hablado", "Entender rasgos de la conversación nativa.", [C("spoken-english", "Spoken English"), C("thing-and-stuff", "Thing and stuff")]],
    ["Del habla a la escritura", "Transformar ideas orales en texto pulido.", [C("speech-into-writing", "Speech into writing"), C("writing", "Writing")]],
    ["Puntuación experta", "Usar ; : — y comas con precisión.", [C("punctuation", "Punctuation"), C("apostrophe", "Apostrophe")]],
    ["Downtoners e intensificadores", "Graduar la fuerza de tus afirmaciones.", [C("downtoners", "Downtoners"), P("intensifiers", "Intensifiers")]],
    ["Formación de palabras", "Crear sustantivos, adjetivos y verbos derivados.", [C("nouns-forming-nouns-from-other-words", "Forming nouns"), C("compounds", "Compounds")]],
    ["Apposition y complementos", "Enriquecer frases con información añadida.", [C("apposition", "Apposition"), C("complements", "Complements")]],
    ["Palabras fácilmente confundidas", "Distinguir pares como affect/effect, economic/economical.", [C("affect-or-effect", "Affect or effect"), C("economic-or-economical", "Economic or economical")]],
    ["Inglés británico vs americano", "Reconocer diferencias de uso y vocabulario.", [C("british-and-american-english", "British and American English"), C("dialect", "Dialect")]],
    ["Perfect infinitive", "Expresar pasado con to have + participio.", [C("perfect-infinitive-with-to-to-have-worked", "Perfect infinitive"), C("infinitive-active-or-passive", "Active or passive infinitive")]],
    ["Exclamaciones y énfasis", "Expresar emoción con such, so, what a…", [C("exclamations", "Exclamations"), C("such-or-so", "Such or so")]],
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
