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
    level: "b2",
    slug: "los-4-condicionales",
    title: "Los 4 Condicionales",
    description: "Zero, first, second y third conditional con práctica guiada y retos.",
    icon: "GitBranch",
    color: "#7a6bea",
    file: "/labs/avanzado/los-4-condicionales.html",
  },
];

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
