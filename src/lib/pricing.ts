export const HOURLY_RATE = 149;
export const WEEKS_PER_MONTH = 4;
export const CURRENCY = "MXN";

export type Plan = {
  id: string;
  name: string;
  hoursPerWeek: number;
  discount: number;
  tagline: string;
  highlight?: boolean;
  benefits: string[];
};

export const PLANS: Plan[] = [
  {
    id: "essential",
    name: "Essential",
    hoursPerWeek: 2,
    discount: 0.1,
    tagline: "Constancia sin saturarte. Ideal para empezar en serio.",
    benefits: [
      "2 clases de 1 hora por semana",
      "Plan de estudio personalizado",
      "Acceso al LMS y a los Labs",
      "Seguimiento mensual de progreso",
    ],
  },
  {
    id: "progress",
    name: "Progress",
    hoursPerWeek: 3,
    discount: 0.15,
    tagline: "El equilibrio perfecto entre avance y ritmo de vida.",
    highlight: true,
    benefits: [
      "3 clases de 1 hora por semana",
      "Todo lo del plan Essential",
      "Conversation Club incluido",
      "Retroalimentación escrita por tarea",
      "Prioridad en horarios",
    ],
  },
  {
    id: "intensive",
    name: "Intensive",
    hoursPerWeek: 4,
    discount: 0.2,
    tagline: "Máxima velocidad para metas con fecha límite.",
    benefits: [
      "4 clases de 1 hora por semana",
      "Todo lo del plan Progress",
      "Masterclasses temáticas",
      "Preparación para exámenes y entrevistas",
      "Soporte por WhatsApp entre clases",
    ],
  },
];

export function computePlan(plan: Plan) {
  const hoursPerMonth = plan.hoursPerWeek * WEEKS_PER_MONTH;
  const listPrice = hoursPerMonth * HOURLY_RATE;
  const total = Math.round(listPrice * (1 - plan.discount));
  const savings = listPrice - total;
  const perHour = Math.round(total / hoursPerMonth);
  return { ...plan, hoursPerMonth, listPrice, total, savings, perHour };
}

export const COMPUTED_PLANS = PLANS.map(computePlan);

export const mxn = (n: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
