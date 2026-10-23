import { describe, it, expect, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { homeworkState, type ClassLesson, type HomeworkSubmission } from "./classes";

const lesson = { id: "l1", status: "done" } as ClassLesson;
const sub = (status: HomeworkSubmission["status"]) => ({ id: "s", lesson_id: "l1", status } as HomeworkSubmission);

describe("estado de la tarea", () => {
  it("una lección terminada sin evidencia sigue pidiendo evidencia", () => {
    expect(homeworkState(lesson, [])).toBe("pending");
  });
  it("con corrección pedida queda en reviewed", () => {
    expect(homeworkState(lesson, [sub("reviewed")])).toBe("reviewed");
  });
  it("solo se termina cuando el teacher la marca terminada", () => {
    expect(homeworkState(lesson, [sub("submitted"), sub("done")])).toBe("done");
  });
});
