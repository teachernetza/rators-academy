import { describe, expect, it } from "vitest";
import {
  CEFR_SCALE,
  QuestionBank,
  computeResult,
  modeListening,
  modeReading,
  modeVocab,
  sectionQuestions,
  totalQuestions,
  type Answers,
  type ExamMode,
} from "./diagnostic-bank";

const allQuestions = [
  ...QuestionBank.listening.flatMap((item) => item.questions),
  ...QuestionBank.reading.flatMap((passage) => passage.questions),
  ...QuestionBank.vocab,
];

describe("diagnostic bank integrity", () => {
  it("keeps unique ids and exactly one answer key per item", () => {
    expect(new Set(allQuestions.map((question) => question.id)).size).toBe(allQuestions.length);
    for (const question of allQuestions) {
      expect(CEFR_SCALE).toContain(question.level);
      expect(question.opts).toHaveLength(3);
      expect(question.opts.filter((option) => option.correct)).toHaveLength(1);
    }
  });

  it("keeps the promised mode counts and samples advanced material", () => {
    expect(totalQuestions("quick")).toBe(29);
    expect(totalQuestions("full")).toBe(66);
    expect(modeListening("quick").some((item) => item.id === "ai-use")).toBe(true);
    expect(modeReading("quick").some((item) => item.id === "r3")).toBe(true);
    expect(modeVocab("quick").some((question) => question.level === "C1")).toBe(true);
  });

  it.each(["quick", "full"] as ExamMode[])("scores a fully correct %s exam at 100", (mode) => {
    const answers: Answers = {};
    for (const section of ["listening", "reading", "vocab"] as const) {
      for (const question of sectionQuestions(section, mode)) {
        answers[question.id] = question.opts.findIndex((option) => option.correct);
      }
    }
    const result = computeResult(answers, mode);
    expect(result.overallScore).toBe(100);
    expect(result.totalCorrect).toBe(result.totalQuestions);
    expect(result.unanswered).toBe(0);
  });
});