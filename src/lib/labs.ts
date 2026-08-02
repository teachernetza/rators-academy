export const GITHUB_OWNER = "teachernetza";
export const GITHUB_REPO = "labs";

export type LabLevel = "basico" | "intermedio" | "avanzado";

export const LAB_LEVELS: {
  slug: LabLevel;
  folder: string;
  label: string;
  description: string;
}[] = [
  {
    slug: "basico",
    folder: "básico",
    label: "Básico",
    description: "Primeros pasos: vocabulario esencial, verbo to be, presente simple.",
  },
  {
    slug: "intermedio",
    folder: "intermedio",
    label: "Intermedio",
    description: "Tiempos verbales, conectores y práctica de comprensión.",
  },
  {
    slug: "avanzado",
    folder: "avanzado",
    label: "Avanzado",
    description: "Estructuras complejas, matices y práctica de producción.",
  },
];

export type Lab = {
  level: LabLevel;
  slug: string;
  title: string;
  fileName: string;
  htmlUrl: string;
};

/** "verbo-to-be.html" -> "Verbo To Be" */
export function titleFromFileName(fileName: string): string {
  const base = fileName.replace(/\.html?$/i, "");
  const words = base
    .replace(/[_\-]+/g, " ")
    .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, "$1 $2")
    .trim()
    .split(/\s+/);
  return words
    .map((w) => (w.length ? w.charAt(0).toLocaleUpperCase("es") + w.slice(1) : w))
    .join(" ");
}

/** URL-safe slug that still maps back to the file name. */
export function slugFromFileName(fileName: string): string {
  return fileName
    .replace(/\.html?$/i, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isLabLevel(v: string): v is LabLevel {
  return LAB_LEVELS.some((l) => l.slug === v);
}

export function levelMeta(slug: string) {
  return LAB_LEVELS.find((l) => l.slug === slug);
}
