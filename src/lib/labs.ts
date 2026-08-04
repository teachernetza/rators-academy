export type LabLevel = "basico" | "intermedio" | "avanzado";

export const LAB_LEVELS: {
  slug: LabLevel;
  label: string;
  description: string;
}[] = [
  {
    slug: "basico",
    label: "Básico",
    description: "Primeros pasos: saludos, familia, vocabulario esencial y posesivos.",
  },
  {
    slug: "intermedio",
    label: "Intermedio",
    description: "Tiempos verbales, modales, preposiciones y narración de historias.",
  },
  {
    slug: "avanzado",
    label: "Avanzado",
    description: "Estructuras complejas y matices del idioma.",
  },
];

export type Lab = {
  level: LabLevel;
  slug: string;
  title: string;
  description: string;
  /** Ruta pública del HTML embebido. */
  file: string;
};

export const LABS: Lab[] = [
  {
    level: "basico",
    slug: "saludos-y-familia",
    title: "Saludos y Familia",
    description:
      "Presentaciones, saludos del día a día, miembros de la familia y conversación básica.",
    file: "/labs/basico/saludos-y-familia.html",
  },
  {
    level: "basico",
    slug: "familia-comida-ropa-posesivos",
    title: "Familia, Comida, Ropa y Posesivos",
    description: "Vocabulario esencial de la vida diaria y adjetivos posesivos en contexto.",
    file: "/labs/basico/familia-comida-ropa-posesivos.html",
  },
  {
    level: "intermedio",
    slug: "presente-simple-profesiones-rutinas",
    title: "Presente Simple, Profesiones y Rutinas",
    description: "Rutinas diarias, profesiones, lugares y habilidades con práctica interactiva.",
    file: "/labs/intermedio/presente-simple-profesiones-rutinas.html",
  },
  {
    level: "intermedio",
    slug: "verbos-modales",
    title: "Verbos Modales",
    description: "Can, must, should y may: permiso, obligación, consejo y posibilidad.",
    file: "/labs/intermedio/verbos-modales.html",
  },
  {
    level: "intermedio",
    slug: "preposiciones-lugar-movimiento",
    title: "Preposiciones de Lugar y Movimiento",
    description: "In, on, at, into, through y más, con ejercicios visuales paso a paso.",
    file: "/labs/intermedio/preposiciones-lugar-movimiento.html",
  },
  {
    level: "intermedio",
    slug: "storytelling-pasado-futuro",
    title: "Storytelling: Pasado y Futuro",
    description: "Narra historias usando pasado simple, pasado continuo y formas de futuro.",
    file: "/labs/intermedio/storytelling-pasado-futuro.html",
  },
  {
    level: "avanzado",
    slug: "los-4-condicionales",
    title: "Los 4 Condicionales",
    description: "Zero, first, second y third conditional con práctica guiada y retos.",
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

export function labsByLevel(level: LabLevel): Lab[] {
  return LABS.filter((l) => l.level === level);
}
