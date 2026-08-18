// Diagnostic exam question bank & level-based scoring logic (v2).
// Each question has 4 options: 2 wrong (level = null) and 2 correct,
// each correct option mapped to a different CEFR level.

import aiUseAudio from "@/assets/B2_C1_Audio_AI_Use.mp3.asset.json";

export type Cefr = "A1" | "A2" | "B1" | "B2" | "C1";

export const CEFR_SCALE: Cefr[] = ["A1", "A2", "B1", "B2", "C1"];

export const CEFR_VALUE: Record<Cefr, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };

export function levelFromValue(v: number): Cefr {
  const i = Math.max(0, Math.min(4, Math.round(v) - 1));
  return CEFR_SCALE[i];
}

export const CEFR_DESCRIPTION: Record<Cefr, string> = {
  A1: "Comprendes y usas expresiones cotidianas muy básicas.",
  A2: "Te comunicas en situaciones simples y rutinarias.",
  B1: "Manejas conversaciones cotidianas y textos claros con independencia.",
  B2: "Te expresas con fluidez y precisión sobre temas complejos.",
  C1: "Usas el idioma de forma flexible, natural y sofisticada.",
};

/** An answer option. `level` = null means incorrect (no value). */
export type Option = { text: string; level: Cefr | null };

export type Question = {
  id: string;
  q: string;
  opts: Option[];
};

export type AudioItem = {
  id: string;
  /** Public URL of the real recording (CDN asset). */
  src: string;
  title: string;
  subtitle?: string;
  questions: Question[];
};

export type ReadingPassage = {
  id: string;
  title: string;
  kind: "short" | "long";
  text: string;
  questions: Question[];
};

export type SectionKey = "listening" | "reading" | "vocab";

export const SECTION_NAMES: Record<SectionKey, string> = {
  listening: "Listening",
  reading: "Reading",
  vocab: "Vocabulary & Use of Language",
};

export const SECTION_ORDER: SectionKey[] = ["listening", "reading", "vocab"];

/* ------------------------------ LISTENING ------------------------------ */

const listening: AudioItem[] = [
  {
    id: "weekend-plans",
    title: "Conversation: Plans for the Weekend",
    subtitle: "Two friends talking about a possible trip · B1",
    src: weekendAudio.url,
    questions: [
      {
        id: "wpq1",
        q: "What is Mark thinking about doing this weekend?",
        opts: [
          { text: "Moving to another city permanently.", level: null },
          { text: "Working extra hours at the office.", level: null },
          { text: "Going to the mountains and renting a cabin.", level: "A2" },
          {
            text: "Heading up to the mountains and booking a cabin for a couple of days.",
            level: "B1",
          },
        ],
      },
      {
        id: "wpq2",
        q: "What does his plan depend on?",
        opts: [
          { text: "Whether his friends can pay for the trip.", level: null },
          { text: "Whether his car gets repaired in time.", level: null },
          { text: "The weather.", level: "A2" },
          { text: "Whether the weather turns out to be nice.", level: "B1" },
        ],
      },
      {
        id: "wpq3",
        q: "Who is Mark likely to travel with?",
        opts: [
          { text: "With his whole family.", level: null },
          { text: "With a group of coworkers.", level: null },
          { text: "Nobody, he goes alone.", level: "A2" },
          { text: "Probably no one — he says he'd go by himself.", level: "B1" },
        ],
      },
      {
        id: "wpq4",
        q: "What will Mark do if it rains all weekend?",
        opts: [
          { text: "He will go to the cabin anyway.", level: null },
          { text: "He will visit his friend's house.", level: null },
          { text: "He will stay at home and rest.", level: "A2" },
          { text: "He'll stay home and catch up on some rest instead.", level: "B1" },
        ],
      },
      {
        id: "wpq5",
        q: "Why is the other person interested in the trip?",
        opts: [
          { text: "Because she wants to drive Mark there.", level: null },
          { text: "Because she owns a cabin in the mountains.", level: null },
          { text: "She is looking for a good cabin too.", level: "A2" },
          {
            text: "She's been looking for a good cabin to stay at and wants the details.",
            level: "B1",
          },
        ],
      },
    ],
  },
  {
    id: "ai-use",
    title: "Interview: AI in Daily Life",
    subtitle: "Sarah (interviewer) & Dr. Evans (AI specialist) · B2–C1",
    src: aiUseAudio.url,
    questions: [
      {
        id: "aiq1",
        q: "According to Dr. Evans, how is AI currently used in healthcare?",
        opts: [
          { text: "It is completely replacing medical staff.", level: null },
          { text: "It is strictly used for administrative billing.", level: null },
          { text: "It helps doctors find out what is wrong faster.", level: "B1" },
          { text: "It assists physicians in diagnosing conditions far more rapidly.", level: "C1" },
        ],
      },
      {
        id: "aiq2",
        q: "Which workplace tasks does he say generative AI is taking over?",
        opts: [
          { text: "Hiring and firing employees.", level: null },
          { text: "Repairing office equipment.", level: null },
          { text: "Writing reports, working with data and personalising learning.", level: "B1" },
          {
            text: "Routine work such as drafting reports, analysing data and tailoring learning experiences.",
            level: "C1",
          },
        ],
      },
      {
        id: "aiq3",
        q: 'What does Dr. Evans mean by describing AI as a "double-edged sword"?',
        opts: [
          { text: "It is extremely dangerous and offers no real benefits.", level: null },
          { text: "It can only be used by software engineers.", level: null },
          { text: "It brings big benefits but also serious problems.", level: "B1" },
          {
            text: "It drives record productivity while raising critical risks at the same time.",
            level: "B2",
          },
        ],
      },
      {
        id: "aiq4",
        q: "Which concerns does he specifically mention?",
        opts: [
          { text: "Rising electricity bills and slow internet.", level: null },
          { text: "A shortage of computers worldwide.", level: null },
          { text: "Privacy, unfair algorithms and losing jobs.", level: "B1" },
          { text: "Data privacy, algorithmic bias and job displacement.", level: "C1" },
        ],
      },
      {
        id: "aiq5",
        q: "What is the speakers' conclusion about the relationship between AI and humans?",
        opts: [
          { text: "AI will eliminate the need for human creativity at work.", level: null },
          { text: "Humans must stop using AI until every privacy issue is solved.", level: null },
          { text: "People should work with AI instead of fighting it.", level: "B1" },
          {
            text: "AI should augment human capabilities rather than replace human ingenuity.",
            level: "C1",
          },
        ],
      },
    ],
  },
];


/* ------------------------------- READING ------------------------------- */

const reading: ReadingPassage[] = [
  {
    id: "r1",
    kind: "short",
    title: "The new cafe",
    text: "The new cafe downtown is already very popular. It serves organic coffee and fresh pastries baked every morning. However, it is quite small, so finding a table during the morning rush can be difficult. Prices are reasonable considering the quality, and regulars say the staff remember their usual order after just a couple of visits.",
    questions: [
      {
        id: "r1q1",
        q: "What is the main problem with the cafe?",
        opts: [
          { text: "The coffee is expensive.", level: null },
          { text: "The pastries are not fresh.", level: null },
          { text: "There are not enough tables.", level: "A2" },
          { text: "Its limited seating makes it hard to get a table at peak times.", level: "B2" },
        ],
      },
      {
        id: "r1q2",
        q: "What does the text say about the prices?",
        opts: [
          { text: "They are the lowest in town.", level: null },
          { text: "They keep going up.", level: null },
          { text: "They are fair for the quality.", level: "B1" },
          { text: "They are justified by the quality on offer.", level: "C1" },
        ],
      },
      {
        id: "r1q3",
        q: "What do regular customers appreciate?",
        opts: [
          { text: "The free wifi.", level: null },
          { text: "The large terrace.", level: null },
          { text: "The staff know their usual order.", level: "A2" },
          { text: "The personal attention they receive from the staff.", level: "B2" },
        ],
      },
    ],
  },
  {
    id: "r2",
    kind: "short",
    title: "Library event",
    text: "Next Thursday the city library will host a local author. Visitors can meet the writer, buy signed copies of her latest mystery novel and attend a free writing workshop. Places for the workshop are limited, so registration must be completed online before Friday. Those who miss the deadline may still attend the talk, but not the workshop.",
    questions: [
      {
        id: "r2q1",
        q: "What must attendees do to join the workshop?",
        opts: [
          { text: "Buy the novel.", level: null },
          { text: "Arrive one hour early.", level: null },
          { text: "Register on the internet.", level: "A1" },
          { text: "Complete an online registration before the deadline.", level: "B2" },
        ],
      },
      {
        id: "r2q2",
        q: "Why is registration necessary?",
        opts: [
          { text: "Because the workshop costs money.", level: null },
          { text: "Because the author asked for it.", level: null },
          { text: "Because there are only a few places.", level: "A2" },
          { text: "Because capacity for the workshop is restricted.", level: "B2" },
        ],
      },
      {
        id: "r2q3",
        q: "What can people who register late still do?",
        opts: [
          { text: "Nothing at all.", level: null },
          { text: "Join the workshop anyway.", level: null },
          { text: "Go to the talk.", level: "B1" },
          { text: "Attend the talk, though not the workshop itself.", level: "C1" },
        ],
      },
    ],
  },
  {
    id: "r3",
    kind: "long",
    title: "Remote work",
    text: "When companies were forced to send their employees home, many managers feared that productivity would collapse. In practice, the opposite often happened: several studies found that people working from home completed the same amount of work in less time, largely because they were interrupted less frequently.\n\nStill, the picture is far from perfect. Younger employees, in particular, reported feeling isolated and said they were learning less from their colleagues, since the informal conversations that happen in an office rarely take place on a video call. Managers also struggled to assess performance without visible signs of effort, and some fell back on counting hours online rather than looking at results.\n\nMost organisations have therefore settled on a hybrid arrangement. Employees come into the office two or three days a week for meetings and collaborative work, and stay at home for tasks that require deep concentration. Experts warn, however, that hybrid work only succeeds when it is designed deliberately: if the days in the office are not planned around collaboration, staff simply do the same solitary work in a noisier place.",
    questions: [
      {
        id: "r3q1",
        q: "What did the studies mentioned find?",
        opts: [
          { text: "Productivity fell sharply at home.", level: null },
          { text: "Employees worked longer hours.", level: null },
          { text: "People did the same work in less time.", level: "B1" },
          { text: "Output was maintained thanks to fewer interruptions.", level: "C1" },
        ],
      },
      {
        id: "r3q2",
        q: "What problem affected younger employees most?",
        opts: [
          { text: "They had slower internet.", level: null },
          { text: "They were given too much work.", level: null },
          { text: "They felt alone and learned less.", level: "A2" },
          { text: "Isolation limited the informal learning they got from colleagues.", level: "B2" },
        ],
      },
      {
        id: "r3q3",
        q: "According to the experts, when does hybrid work fail?",
        opts: [
          { text: "When employees come in every day.", level: null },
          { text: "When managers work from home too.", level: null },
          { text: "When office days are not planned for working together.", level: "B1" },
          {
            text: "When the in-office days are not deliberately designed around collaboration.",
            level: "C1",
          },
        ],
      },
    ],
  },
];

/* ------------------- VOCABULARY & USE OF LANGUAGE ------------------- */

const vocab: Question[] = [
  {
    id: "v1",
    q: '"Excuse me, how much ___ this jacket?"',
    opts: [
      { text: "are", level: null },
      { text: "do", level: null },
      { text: "is", level: "A1" },
      { text: "does this jacket cost", level: "A2" },
    ],
  },
  {
    id: "v2",
    q: "Complete: “I ___ in this city since 2019.”",
    opts: [
      { text: "am living", level: null },
      { text: "lived", level: null },
      { text: "have lived", level: "B1" },
      { text: "have been living", level: "B2" },
    ],
  },
  {
    id: "v3",
    q: "Your boss asks for a report you have not finished. What do you say?",
    opts: [
      { text: "No, I don't do it.", level: null },
      { text: "I no finish yet.", level: null },
      { text: "I haven't finished it yet, sorry.", level: "B1" },
      { text: "I'm still putting the finishing touches to it.", level: "C1" },
    ],
  },
  {
    id: "v4",
    q: 'Choose the natural completion: "I\'m really looking ___ to the weekend."',
    opts: [
      { text: "ahead", level: null },
      { text: "front", level: null },
      { text: "forward", level: "A2" },
      { text: "forward to unwinding", level: "B2" },
    ],
  },
  {
    id: "v5",
    q: 'What does "out of the blue" mean?',
    opts: [
      { text: "In a sad mood.", level: null },
      { text: "Outdoors.", level: null },
      { text: "Suddenly and unexpectedly.", level: "B1" },
      { text: "Without any warning whatsoever.", level: "C1" },
    ],
  },
  {
    id: "v6",
    q: 'Complete: "If I ___ more time, I would travel across Asia."',
    opts: [
      { text: "will have", level: null },
      { text: "have had", level: null },
      { text: "had", level: "B1" },
      { text: "were to have", level: "C1" },
    ],
  },
  {
    id: "v7",
    q: "Someone is very careful with small details. He is…",
    opts: [
      { text: "reckless", level: null },
      { text: "stubborn", level: null },
      { text: "very careful", level: "A2" },
      { text: "meticulous", level: "B2" },
    ],
  },
  {
    id: "v8",
    q: 'Complete: "Please bear in ___ that the schedule may change."',
    opts: [
      { text: "head", level: null },
      { text: "thought", level: null },
      { text: "mind", level: "B1" },
      { text: "mind, as it is subject to change", level: "C1" },
    ],
  },
  {
    id: "v9",
    q: "How do you politely decline an invitation?",
    opts: [
      { text: "No, I don't want.", level: null },
      { text: "Maybe no, bye.", level: null },
      { text: "Sorry, I can't make it, but thank you.", level: "B1" },
      { text: "I'm afraid I won't be able to make it, but thanks for thinking of me.", level: "C1" },
    ],
  },
  {
    id: "v10",
    q: 'Choose the best word: "Children are often highly ___ and recover quickly from difficulties."',
    opts: [
      { text: "inevitable", level: null },
      { text: "eloquent", level: null },
      { text: "strong", level: "A2" },
      { text: "resilient", level: "B2" },
    ],
  },
  {
    id: "v11",
    q: 'Complete: "By the time we arrived, the film ___."',
    opts: [
      { text: "has started", level: null },
      { text: "starts", level: null },
      { text: "had started", level: "B2" },
      { text: "had already been running for a while", level: "C1" },
    ],
  },
  {
    id: "v12",
    q: 'What does "to call it a day" mean?',
    opts: [
      { text: "To make a phone call.", level: null },
      { text: "To plan the next day.", level: null },
      { text: "To stop working for now.", level: "B1" },
      { text: "To wrap things up for the time being.", level: "C1" },
    ],
  },
];

export const QuestionBank = { listening, reading, vocab };

/** All questions of a section, flattened. */
export function sectionQuestions(section: SectionKey): Question[] {
  if (section === "listening") return listening.flatMap((a) => a.questions);
  if (section === "reading") return reading.flatMap((p) => p.questions);
  return vocab;
}

export const TOTAL_QUESTIONS =
  sectionQuestions("listening").length +
  sectionQuestions("reading").length +
  sectionQuestions("vocab").length;

/* ------------------------------ SCORING ------------------------------ */

/** answers: questionId -> selected option index */
export type Answers = Record<string, number>;

export type SectionResult = {
  key: SectionKey;
  label: string;
  correct: number;
  total: number;
  /** 0..100, how well the learner performed relative to a C1 ceiling */
  score: number;
  level: Cefr;
};

export type ExamResult = {
  sections: SectionResult[];
  overall: Cefr;
  overallScore: number;
  totalCorrect: number;
  totalQuestions: number;
  version: 2;
};

function scoreSection(key: SectionKey): (answers: Answers) => SectionResult {
  return (answers) => {
    const qs = sectionQuestions(key);
    let sum = 0;
    let correct = 0;
    qs.forEach((q) => {
      const idx = answers[q.id];
      const opt = typeof idx === "number" ? q.opts[idx] : undefined;
      if (opt?.level) {
        correct++;
        sum += CEFR_VALUE[opt.level];
      }
    });
    // Average level value across ALL questions of the section: wrong answers
    // count as 0, so a learner who answers few items cannot reach C1.
    const avg = qs.length ? sum / qs.length : 0;
    const score = Math.round((avg / 5) * 100);
    // Map the average back onto the scale with a soft floor at A1.
    const level = levelFromValue(Math.max(1, avg));
    return { key, label: SECTION_NAMES[key], correct, total: qs.length, score, level };
  };
}

export function computeResult(answers: Answers): ExamResult {
  const sections = SECTION_ORDER.map((k) => scoreSection(k)(answers));
  const overallScore = Math.round(sections.reduce((a, s) => a + s.score, 0) / sections.length);
  const overall = levelFromValue(Math.max(1, (overallScore / 100) * 5));
  const totalCorrect = sections.reduce((a, s) => a + s.correct, 0);
  return {
    sections,
    overall,
    overallScore,
    totalCorrect,
    totalQuestions: TOTAL_QUESTIONS,
    version: 2,
  };
}
