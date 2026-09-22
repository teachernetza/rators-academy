import { describe, expect, it } from "vitest";
import {
  CEFR_SCALE,
  CEFR_VALUE,
  OPTIONS_PER_QUESTION,
  QuestionBank,
  computeResult,
  modeListening,
  modeReading,
  modeVocab,
  sectionQuestions,
  totalQuestions,
  type Answers,
  type Cefr,
  type ExamMode,
  type Question,
} from "./diagnostic-bank";

const allQuestions = [
  ...QuestionBank.listening.flatMap((item) => item.questions),
  ...QuestionBank.reading.flatMap((passage) => passage.questions),
  ...QuestionBank.vocab,
];

const modeQuestions = (mode: ExamMode): Question[] =>
  (["listening", "reading", "vocab"] as const).flatMap((section) => sectionQuestions(section, mode));

const correctIndex = (question: Question) => question.opts.findIndex((option) => option.correct);

/** Deterministic wrong answer: the first option that is not the key. */
const wrongIndex = (question: Question) => question.opts.findIndex((option) => !option.correct);

function profile(mode: ExamMode, ceiling: Cefr | null): Answers {
  const answers: Answers = {};
  for (const question of modeQuestions(mode)) {
    const within = ceiling !== null && CEFR_VALUE[question.level ?? "A1"] <= CEFR_VALUE[ceiling];
    answers[question.id] = within ? correctIndex(question) : wrongIndex(question);
  }
  return answers;
}

describe("diagnostic bank integrity", () => {
  it("keeps unique ids, four options and exactly one answer key per item", () => {
    expect(new Set(allQuestions.map((question) => question.id)).size).toBe(allQuestions.length);
    for (const question of allQuestions) {
      expect(CEFR_SCALE).toContain(question.level);
      expect(question.opts).toHaveLength(OPTIONS_PER_QUESTION);
      expect(question.opts.filter((option) => option.correct)).toHaveLength(1);
      expect(new Set(question.opts.map((option) => option.text)).size).toBe(OPTIONS_PER_QUESTION);
    }
  });

  it("covers every level with enough advanced material", () => {
    const counts = allQuestions.reduce<Record<string, number>>((acc, question) => {
      const level = question.level ?? "A1";
      acc[level] = (acc[level] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts.B2).toBeGreaterThanOrEqual(20);
    expect(counts.C1).toBeGreaterThanOrEqual(12);
  });

  it("keeps the quick sample stratified", () => {
    expect(totalQuestions("quick")).toBe(29);
    expect(totalQuestions("full")).toBeGreaterThanOrEqual(80);
    expect(modeListening("quick").some((item) => item.id === "ai-use")).toBe(true);
    expect(modeReading("quick").some((item) => item.id === "r3")).toBe(true);
    expect(modeVocab("quick").some((question) => question.level === "C1")).toBe(true);
  });
});

describe("strict scoring", () => {
  it.each(["quick", "full"] as ExamMode[])("scores a fully correct %s exam at 100", (mode) => {
    const result = computeResult(profile(mode, "C1"), mode);
    expect(result.overallScore).toBe(100);
    expect(result.totalCorrect).toBe(result.totalQuestions);
    expect(result.unanswered).toBe(0);
  });

  it("only awards C1 in the full exam", () => {
    expect(computeResult(profile("full", "C1"), "full").overall).toBe("C1");
    const quick = computeResult(profile("quick", "C1"), "quick");
    expect(quick.overall).toBe("B2");
    expect(quick.band).toContain("examen completo");
  });

  it("never awards C1 to a learner who only masters up to B1", () => {
    const result = computeResult(profile("full", "B1"), "full");
    expect(["A2", "B1"]).toContain(result.overall);
  });

  it("gives A1 when nothing is answered", () => {
    const result = computeResult({}, "full");
    expect(result.overall).toBe("A1");
    expect(result.overallScore).toBe(0);
    expect(result.unanswered).toBe(result.totalQuestions);
  });

  it("does not award a level when the lower levels are not consolidated", () => {
    const answers: Answers = {};
    for (const question of modeQuestions("full")) {
      const level = CEFR_VALUE[question.level ?? "A1"];
      // Masters B2/C1 items but fails most basics: no high level may be granted.
      answers[question.id] = level >= 4 ? correctIndex(question) : wrongIndex(question);
    }
    const result = computeResult(answers, "full");
    expect(CEFR_VALUE[result.overall]).toBeLessThanOrEqual(CEFR_VALUE.B1);
  });
});
