// Reglas de planes mensuales para clases particulares.
export type PlanKey = "essential" | "progress" | "intensive";

export const LESSON_HOURS = 2;
export const WEEKS_PER_MONTH = 4;

export const PLAN_RULES: Record<PlanKey, { name: string; hoursPerWeek: number; lessons: number }> = {
  essential: { name: "Essential", hoursPerWeek: 2, lessons: 4 },
  progress: { name: "Progress", hoursPerWeek: 3, lessons: 6 },
  intensive: { name: "Intensive", hoursPerWeek: 4, lessons: 8 },
};

export function planDefaults(key: PlanKey) {
  const r = PLAN_RULES[key];
  return { hours_contracted: r.hoursPerWeek * WEEKS_PER_MONTH, lessons_total: r.lessons };
}

/** Horas del mes: contratadas + arrastradas, dadas, restantes y por reponer a la fecha. */
export function hoursSummary(opts: {
  plan_key: PlanKey;
  hours_contracted: number;
  carried_hours: number;
  given: number[];
  month: string; // YYYY-MM-01
  today?: Date;
}) {
  const total = Number(opts.hours_contracted) + Number(opts.carried_hours || 0);
  const given = round1(opts.given.reduce((a, b) => a + Number(b), 0));
  const remaining = round1(Math.max(0, total - given));
  const today = opts.today ?? new Date();
  const start = new Date(opts.month + "T00:00:00");
  const days = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const weeksElapsed = Math.min(WEEKS_PER_MONTH, Math.max(0, Math.floor(days / 7) + (days >= 0 ? 1 : 0)));
  const expected = PLAN_RULES[opts.plan_key].hoursPerWeek * weeksElapsed;
  const toMakeUp = round1(Math.max(0, Math.min(expected, Number(opts.hours_contracted)) - given));
  return { total, given, remaining, toMakeUp, weeksElapsed };
}

/** Horas que pasan al siguiente mes al cerrar el actual. */
export function carryOver(total: number, given: number) {
  return round1(Math.max(0, total - given));
}

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function currentMonth(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function nextMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
}

export function monthLabel(month: string) {
  return new Date(month + "T00:00:00").toLocaleDateString("es-MX", { month: "long", year: "numeric" });
}
