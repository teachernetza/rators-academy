import { describe, it, expect } from "vitest";
import { planDefaults, hoursSummary, carryOver, nextMonth } from "./plans";

describe("planes mensuales", () => {
  it("2 h/semana = 4 lecciones y 8 h", () => {
    expect(planDefaults("essential")).toEqual({ hours_contracted: 8, lessons_total: 4 });
  });
  it("3 h/semana = 6 lecciones y 12 h", () => {
    expect(planDefaults("progress")).toEqual({ hours_contracted: 12, lessons_total: 6 });
  });
  it("4 h/semana = 8 lecciones y 16 h", () => {
    expect(planDefaults("intensive")).toEqual({ hours_contracted: 16, lessons_total: 8 });
  });
  it("una semana con solo 1 h deja 1 h por reponer", () => {
    const s = hoursSummary({
      plan_key: "essential", hours_contracted: 8, carried_hours: 0, given: [1],
      month: "2026-10-01", today: new Date("2026-10-05T12:00:00"),
    });
    expect(s.toMakeUp).toBe(1);
    expect(s.remaining).toBe(7);
  });
  it("las horas arrastradas se suman al total del mes", () => {
    const s = hoursSummary({
      plan_key: "essential", hours_contracted: 8, carried_hours: 2, given: [2],
      month: "2026-10-01", today: new Date("2026-10-30T12:00:00"),
    });
    expect(s.total).toBe(10);
    expect(s.remaining).toBe(8);
  });
  it("al cerrar el mes pasan las horas no dadas", () => {
    expect(carryOver(12, 9.5)).toBe(2.5);
    expect(carryOver(8, 9)).toBe(0);
  });
  it("diciembre pasa a enero", () => {
    expect(nextMonth("2026-12-01")).toBe("2027-01-01");
  });
});
