export type LabLevel = "a1" | "a2" | "b1" | "b2" | "c1";

export const LAB_LEVELS: {
  slug: LabLevel;
  label: string;
  /** Frase corta que describe el nivel. */
  tagline: string;
  description: string;
  color: string;
}[] = [
  {
    slug: "a1",
    label: "A1 · Principiante",
    tagline: "Tus primeras palabras en inglés.",
    description:
      "Saludos, presentaciones, familia y vocabulario esencial del día a día.",
    color: "#35d1a8",
  },
  {
    slug: "a2",
    label: "A2 · Básico",
    tagline: "Habla de tu rutina y de lo que te rodea.",
    description: "Presente simple, profesiones, lugares y preposiciones.",
    color: "#2bb3c9",
  },
  {
    slug: "b1",
    label: "B1 · Intermedio",
    tagline: "Cuenta historias y expresa intenciones.",
    description: "Verbos modales, pasado, futuro y narración con fluidez.",
    color: "#3f7fd6",
  },
  {
    slug: "b2",
    label: "B2 · Intermedio alto",
    tagline: "Argumenta con estructuras complejas.",
    description: "Condicionales, hipótesis y matices del idioma.",
    color: "#7a6bea",
  },
  {
    slug: "c1",
    label: "C1 · Avanzado",
    tagline: "Inglés natural, preciso y con estilo.",
    description: "Próximamente: labs de expresión avanzada y registro formal.",
    color: "#f0a83c",
  },
];

export type Lab = {
  level: LabLevel;
  slug: string;
  title: string;
  description: string;
  /** Nombre de ícono de lucide-react. */
  icon: string;
  /** Color de acento de la tarjeta. */
  color: string;
  /** Ruta pública del HTML embebido. */
  file: string;
  /**
   * "public" = visible en el catálogo abierto del sitio.
   * "lms" = solo para alumnos con el lab asignado (y para staff).
   */
  scope?: "public" | "lms";
  /** Objetivos de aprendizaje (labs del LMS). */
  objectives?: string[];
  /** Número de ejercicios calificables (labs del LMS). */
  exercises?: number;
};

export const LABS: Lab[] = [
  {
    level: "a1",
    slug: "saludos-y-familia",
    title: "Saludos y Familia",
    description:
      "Presentaciones, saludos del día a día, miembros de la familia y conversación básica.",
    icon: "HandHeart",
    color: "#35d1a8",
    file: "/labs/basico/saludos-y-familia.html",
  },
  {
    level: "a1",
    slug: "familia-comida-ropa-posesivos",
    title: "Familia, Comida, Ropa y Posesivos",
    description: "Vocabulario esencial de la vida diaria y adjetivos posesivos en contexto.",
    icon: "Shirt",
    color: "#f2a541",
    file: "/labs/basico/familia-comida-ropa-posesivos.html",
  },
  {
    level: "a2",
    slug: "presente-simple-profesiones-rutinas",
    title: "Presente Simple, Profesiones y Rutinas",
    description: "Rutinas diarias, profesiones, lugares y habilidades con práctica interactiva.",
    icon: "Clock",
    color: "#2bb3c9",
    file: "/labs/intermedio/presente-simple-profesiones-rutinas.html",
  },
  {
    level: "a2",
    slug: "preposiciones-lugar-movimiento",
    title: "Preposiciones de Lugar y Movimiento",
    description: "In, on, at, into, through y más, con ejercicios visuales paso a paso.",
    icon: "Compass",
    color: "#e0698a",
    file: "/labs/intermedio/preposiciones-lugar-movimiento.html",
  },
  {
    level: "a2",
    slug: "profesiones-can-conectores",
    title: "Profesiones, Can/Can't y Conectores",
    description: "Habilidades y profesiones, y cómo unir ideas con so y but.",
    icon: "Briefcase",
    color: "#14b8a6",
    file: "/labs/basico/profesiones-can-conectores.html",
  },
  {
    level: "b1",
    slug: "verbos-modales",
    title: "Verbos Modales",
    description: "Can, must, should y may: permiso, obligación, consejo y posibilidad.",
    icon: "KeyRound",
    color: "#3f7fd6",
    file: "/labs/intermedio/verbos-modales.html",
  },
  {
    level: "b1",
    slug: "storytelling-pasado-futuro",
    title: "Storytelling: Pasado y Futuro",
    description: "Narra historias usando pasado simple, pasado continuo y formas de futuro.",
    icon: "BookOpen",
    color: "#59b36b",
    file: "/labs/intermedio/storytelling-pasado-futuro.html",
  },
  {
    level: "b1",
    slug: "present-progressive",
    title: "Present Progressive en Acción",
    description: "Acciones en curso, conversaciones reales y práctica guiada paso a paso.",
    icon: "Activity",
    color: "#0284c7",
    file: "/labs/intermedio/present-progressive.html",
  },
  {
    level: "b1",
    slug: "fonetica-verbos-regulares",
    title: "Fonética de los Verbos Regulares (-ed)",
    description: "Los tres sonidos del pasado regular: /t/, /d/ y /ɪd/, con escucha y práctica.",
    icon: "AudioLines",
    color: "#ec4899",
    file: "/labs/intermedio/fonetica-verbos-regulares.html",
  },
  {
    level: "b2",
    slug: "los-4-condicionales",
    title: "Los 4 Condicionales",
    description: "Zero, first, second y third conditional con práctica guiada y retos.",
    icon: "GitBranch",
    color: "#7a6bea",
    file: "/labs/avanzado/los-4-condicionales.html",
  },
  {
    level: "b2",
    slug: "pasados-conectores-narrativos",
    title: "Pasados y Conectores Narrativos",
    description: "Pasado simple, continuo y perfecto con conectores para narrar con fluidez.",
    icon: "Clapperboard",
    color: "#4f46e5",
    file: "/labs/avanzado/pasados-conectores-narrativos.html",
  },
  {
    level: "b2",
    slug: "voz-pasiva-presente-pasado",
    title: "Voz Pasiva: Presente y Pasado",
    description: "Transforma activa a pasiva con flashcards, retos y ejemplos en contexto.",
    icon: "Repeat",
    color: "#e11d48",
    file: "/labs/avanzado/voz-pasiva-presente-pasado.html",
  },
];


/** Labs que viven dentro del LMS: se asignan y guardan puntaje. */
export const LMS_LABS: Lab[] = [
  {
    level: "a1",
    slug: "daily-routine-time",
    title: "Daily Routine & Time",
    description:
      "Rutina diaria, la hora y present simple con adverbios de frecuencia. Con ejercicios y puntaje.",
    icon: "Sunrise",
    color: "#35d1a8",
    file: "/labs/lms/a1-daily-routine.html",
    scope: "lms",
    objectives: [
      "Vocabulario de rutina diaria",
      "La hora y at / in / on",
      "Present simple y adverbios de frecuencia",
    ],
    exercises: 15,
  },
  {
    level: "a2",
    slug: "travel-transport",
    title: "Travel & Transport",
    description:
      "Viajes, transporte y past simple (regulares e irregulares). Con ejercicios y puntaje.",
    icon: "Plane",
    color: "#2bb3c9",
    file: "/labs/lms/a2-travel-transport.html",
    scope: "lms",
    objectives: ["Vocabulario de viajes", "Past simple", "Preguntas con did"],
    exercises: 15,
  },
  {
    level: "b1",
    slug: "work-career",
    title: "Work & Career",
    description:
      "Trabajo, entrevistas y la diferencia entre present perfect y past simple. Con puntaje.",
    icon: "Briefcase",
    color: "#3f7fd6",
    file: "/labs/lms/b1-work-career.html",
    scope: "lms",
    objectives: [
      "Vocabulario de trabajo",
      "Present perfect vs past simple",
      "for, since, already, yet",
    ],
    exercises: 15,
  },
  {
    level: "b2",
    slug: "media-technology",
    title: "Media & Technology",
    description: "Medios, redes y tecnología con voz pasiva y estilo indirecto. Con puntaje.",
    icon: "Radio",
    color: "#7a6bea",
    file: "/labs/lms/b2-media-technology.html",
    scope: "lms",
    objectives: ["Vocabulario de medios", "Voz pasiva", "Reported speech"],
    exercises: 15,
  },
  {
    level: "c1",
    slug: "environment-society",
    title: "Environment & Society",
    description:
      "Medio ambiente y sociedad con condicionales mixtos e inversión enfática. Con puntaje.",
    icon: "Leaf",
    color: "#f0a83c",
    file: "/labs/lms/c1-environment-society.html",
    scope: "lms",
    objectives: ["Léxico académico", "Condicionales mixtos y wish", "Inversión formal"],
    exercises: 15,
  },
];

/** Catálogo completo: labs públicos + labs del LMS. */
export const ALL_LABS: Lab[] = [...LABS, ...LMS_LABS];

export function isLmsLab(lab: Lab) {
  return lab.scope === "lms";
}

export function isLabLevel(v: string): v is LabLevel {
  return LAB_LEVELS.some((l) => l.slug === v);
}

export function levelMeta(slug: string) {
  return LAB_LEVELS.find((l) => l.slug === slug);
}

export function findLab(level: string, slug: string): Lab | undefined {
  return LABS.find((l) => l.level === level && l.slug === slug);
}

export function labsByLevel(level: string): Lab[] {
  return LABS.filter((l) => l.level === level);
}
