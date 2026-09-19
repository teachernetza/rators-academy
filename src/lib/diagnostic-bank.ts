// Diagnostic exam question bank & criterion-based scoring logic (v4).
// Legacy option-level tags are normalized below into one keyed answer and an
// item difficulty. Only the strongest authored answer is retained as correct.
import readingCafe from "@/assets/reading-cafe.jpg";
import readingLibrary from "@/assets/reading-library.jpg";

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
export type Option = { text: string; level: Cefr | null; correct?: boolean };

export type EvidenceType =
  | "detail"
  | "main-idea"
  | "inference"
  | "meaning-in-context"
  | "grammar"
  | "vocabulary"
  | "register";

export type Question = {
  id: string;
  q: string;
  opts: Option[];
  /** Difficulty of the item, independent from the answer wording. */
  level?: Cefr;
  evidence?: EvidenceType;
  /** Included in the short (7 min) version of the exam. */
  quick?: boolean;
};

export type AudioItem = {
  id: string;
  /** Public URL of the real recording. */
  src: string;
  title: string;
  subtitle?: string;
  /** Included in the short version of the exam. */
  quick?: boolean;
  questions: Question[];
};

export type ReadingPassage = {
  id: string;
  title: string;
  kind: "short" | "long";
  text: string;
  image?: string;
  imageAlt?: string;
  quick?: boolean;
  questions: Question[];
};

export type SectionKey = "listening" | "reading" | "vocab";

export const SECTION_NAMES: Record<SectionKey, string> = {
  listening: "Listening",
  reading: "Reading",
  vocab: "Vocabulary & Use of Language",
};

export const SECTION_ORDER: SectionKey[] = ["listening", "reading", "vocab"];

/* ------------------------------ EXAM MODES ------------------------------ */

export type ExamMode = "quick" | "full";

export const EXAM_MODES: Record<
  ExamMode,
  { label: string; duration: string; description: string }
> = {
  quick: {
    label: "Examen rápido",
    duration: "~7 minutos",
    description: "5 audios cortos y una selección de lecturas y gramática.",
  },
  full: {
    label: "Examen completo",
    duration: "15–20 minutos",
    description: "Los 7 audios, todas las lecturas y la sección completa de uso del idioma.",
  },
};

/* ------------------------------ LISTENING ------------------------------ */

const listening: AudioItem[] = [
  {
    id: "coffee-shop",
    title: "The Coffee Shop",
    subtitle: "Ordering at a café · A1–A2",
    src: "/audio/A1_Shorts_1.mp3",
    quick: true,
    questions: [
      {
        id: "csq1",
        q: "What does the customer order?",
        quick: true,
        opts: [
          { text: "A large tea and a toasted cheese sandwich.", level: null },
          { text: "Two espressos to share with a friend.", level: null },
          { text: "A medium cappuccino and a chocolate muffin.", level: "A1" },
          { text: "A medium cappuccino plus a chocolate muffin.", level: "A2" },
        ],
      },
      {
        id: "csq2",
        q: "Is the order for here or to go?",
        quick: true,
        opts: [
          { text: "For here, at one of the small tables.", level: null },
          { text: "The customer never actually decides.", level: null },
          { text: "To go.", level: "A1" },
          { text: "To take away.", level: "A2" },
        ],
      },
      {
        id: "csq3",
        q: "How does the customer pay?",
        opts: [
          { text: "With a credit card he keeps in his wallet.", level: null },
          { text: "With a payment app on his phone.", level: null },
          { text: "With five dollars in cash.", level: "A1" },
          { text: "With a five-dollar bill.", level: "A2" },
        ],
      },
      {
        id: "csq4",
        q: 'What does "You can keep the change" mean?',
        opts: [
          { text: "Please give me all my money back now.", level: null },
          { text: "I would prefer coins instead of bills.", level: null },
          { text: "The extra money is a tip.", level: "A2" },
          { text: "The rest is a tip.", level: "B1" },
        ],
      },
      {
        id: "csq5",
        q: "How does the barista start the conversation?",
        quick: true,
        opts: [
          { text: "By asking the customer for his name.", level: null },
          { text: "By saying the shop is about to close.", level: null },
          { text: 'By asking "What can I get for you?"', level: "A1" },
          { text: "By greeting him and taking his order.", level: "A2" },
        ],
      },
    ],
  },
  {
    id: "lost-in-city",
    title: "Lost in the City",
    subtitle: "Asking for directions in the street · A2–B1",
    src: "/audio/B1_Shorts_2.mp3",
    quick: true,
    questions: [
      {
        id: "lcq1",
        q: "What is the tourist looking for?",
        quick: true,
        opts: [
          { text: "A hotel somewhere near the city park.", level: null },
          { text: "The bus stop for the airport shuttle.", level: null },
          { text: "The main train station.", level: "A2" },
          { text: "The central railway station.", level: "B1" },
        ],
      },
      {
        id: "lcq2",
        q: "How far away is the place?",
        quick: true,
        opts: [
          { text: "About an hour away if you walk there.", level: null },
          { text: "In a completely different part of the city.", level: null },
          { text: "Very close, two blocks away.", level: "A2" },
          { text: "Only a couple of blocks ahead.", level: "B1" },
        ],
      },
      {
        id: "lcq3",
        q: "Which landmark does the local mention?",
        opts: [
          { text: "An old church on the corner.", level: null },
          { text: "A supermarket next to the square.", level: null },
          { text: "A bank.", level: "A2" },
          { text: "A bank he has to walk past.", level: "B1" },
        ],
      },
      {
        id: "lcq4",
        q: "Where is the station once you pass the landmark?",
        opts: [
          { text: "On the right-hand side of the avenue.", level: null },
          { text: "Behind the tourist, back the other way.", level: null },
          { text: "On the left.", level: "A2" },
          { text: "Right there, on your left.", level: "B1" },
        ],
      },
      {
        id: "lcq5",
        q: 'What does the local mean by "You can\'t miss it"?',
        quick: true,
        opts: [
          { text: "You must hurry or the train will leave.", level: null },
          { text: "It is a place where people often get lost.", level: null },
          { text: "It is very easy to find.", level: "A2" },
          { text: "It is impossible to overlook.", level: "B2" },
        ],
      },
    ],
  },
  {
    id: "rescheduling",
    title: "Rescheduling",
    subtitle: "Two colleagues changing a meeting time · B1",
    src: "/audio/B1_Shorts_3.mp3",
    quick: true,
    questions: [
      {
        id: "rsq1",
        q: "What was originally planned?",
        quick: true,
        opts: [
          { text: "A lunch with an important client.", level: null },
          { text: "A job interview early in the morning.", level: null },
          { text: "A project meeting at 3 PM.", level: "A2" },
          { text: "A project meeting at three o'clock.", level: "B1" },
        ],
      },
      {
        id: "rsq2",
        q: "Why does Sarah want to change it?",
        quick: true,
        opts: [
          { text: "She is feeling ill and wants to go home.", level: null },
          { text: "She completely forgot about the meeting.", level: null },
          { text: "Something happened with a client.", level: "A2" },
          { text: "Something urgent came up with a client.", level: "B1" },
        ],
      },
      {
        id: "rsq3",
        q: "What new time does she suggest?",
        opts: [
          { text: "Two o'clock, an hour earlier than planned.", level: null },
          { text: "Tomorrow morning, first thing in the day.", level: null },
          { text: "Four o'clock.", level: "A2" },
          { text: "4 PM, an hour later.", level: "B1" },
        ],
      },
      {
        id: "rsq4",
        q: "How does her colleague react?",
        opts: [
          { text: "He is clearly annoyed about the change.", level: null },
          { text: "He decides to cancel the meeting completely.", level: null },
          { text: "He agrees, it is no problem.", level: "A2" },
          { text: "He accepts without any objection.", level: "B1" },
        ],
      },
      {
        id: "rsq5",
        q: 'What does "push it back" mean here?',
        quick: true,
        opts: [
          { text: "To make the meeting a little shorter.", level: null },
          { text: "To move it to an earlier time slot.", level: null },
          { text: "To move it to a later time.", level: "B1" },
          { text: "To postpone it.", level: "B2" },
        ],
      },
    ],
  },
  {
    id: "tech-support",
    title: "Tech Support",
    subtitle: "A helpdesk phone call · B1–B2",
    src: "/audio/B2_Shorts_4.mp3",
    quick: true,
    questions: [
      {
        id: "tsq1",
        q: "What problem does the user report?",
        quick: true,
        opts: [
          { text: "She has lost the password to her account.", level: null },
          { text: "Her office printer has stopped working.", level: null },
          { text: "Her laptop screen froze and does not respond.", level: "B1" },
          { text: "Her laptop is completely unresponsive.", level: "B2" },
        ],
      },
      {
        id: "tsq2",
        q: "Why is the situation urgent for her?",
        quick: true,
        opts: [
          { text: "She has a flight leaving in about an hour.", level: null },
          { text: "Her laptop battery is almost completely empty.", level: null },
          { text: "She is in the middle of a report.", level: "B1" },
          { text: "She is halfway through a report.", level: "B2" },
        ],
      },
      {
        id: "tsq3",
        q: "What does Jason suggest?",
        opts: [
          { text: "Taking the laptop to a repair shop nearby.", level: null },
          { text: "Installing a completely new operating system.", level: null },
          { text: "Holding the power button for ten seconds.", level: "B1" },
          { text: "Forcing a restart with the power button.", level: "B2" },
        ],
      },
      {
        id: "tsq4",
        q: "What is the result of the suggestion?",
        opts: [
          { text: "Nothing happens, so she has to call again later.", level: null },
          { text: "The laptop shuts down and never turns on again.", level: null },
          { text: "The laptop starts working again.", level: "B1" },
          { text: "The machine boots up again.", level: "B2" },
        ],
      },
      {
        id: "tsq5",
        q: "How would you describe Jason's tone?",
        quick: true,
        opts: [
          { text: "Angry and impatient with the caller.", level: null },
          { text: "Confused and unsure about the problem.", level: null },
          { text: "Calm and helpful.", level: "B1" },
          { text: "Patient and methodical.", level: "B2" },
        ],
      },
    ],
  },
  {
    id: "weekend-recap",
    title: "Weekend Recap",
    subtitle: "Two friends chatting on Monday morning · B2",
    src: "/audio/B2_Shorts_5.mp3",
    quick: true,
    questions: [
      {
        id: "wrq1",
        q: "What did the second friend do at the weekend?",
        quick: true,
        opts: [
          { text: "He travelled to the coast with some friends.", level: null },
          { text: "He worked overtime at the office on Saturday.", level: null },
          { text: "He stayed at home and watched a series.", level: "B1" },
          { text: "He binge-watched a sci-fi series at home.", level: "B2" },
        ],
      },
      {
        id: "wrq2",
        q: "Why did he stay in?",
        quick: true,
        opts: [
          { text: "He was ill and needed to stay in bed.", level: null },
          { text: "His car broke down on Friday evening.", level: null },
          { text: "The weather was bad.", level: "B1" },
          { text: "The weather was awful.", level: "B2" },
        ],
      },
      {
        id: "wrq3",
        q: 'What does "Did you get up to anything exciting?" mean?',
        opts: [
          { text: "Did you manage to wake up early on Sunday?", level: null },
          { text: "Did you climb up anywhere during the weekend?", level: null },
          { text: "Did you do anything interesting?", level: "B1" },
          { text: "Did you do anything worth mentioning?", level: "B2" },
        ],
      },
      {
        id: "wrq4",
        q: "How does the first friend react to the answer?",
        opts: [
          { text: "He thinks the whole weekend was completely wasted.", level: null },
          { text: "He is disappointed that his friend did not call him.", level: null },
          { text: "He thinks it sounds perfect.", level: "B1" },
          { text: "He says it sounds ideal.", level: "B2" },
        ],
      },
      {
        id: "wrq5",
        q: 'What does "take it easy and recharge" refer to?',
        quick: true,
        opts: [
          { text: "Charging your electronic devices before the week starts.", level: null },
          { text: "Doing intense exercise to get back into shape.", level: null },
          { text: "Resting to get your energy back.", level: "B1" },
          { text: "Slowing down to restore your energy.", level: "C1" },
        ],
      },
    ],
  },
  {
    id: "weekend-plans",
    title: "Conversation: Plans for the Weekend",
    subtitle: "Two friends talking about a possible trip · B1",
    src: "/audio/B1_Plans_for_the_weekend.mp3",
    questions: [
      {
        id: "wpq1",
        q: "What is Mark thinking about doing this weekend?",
        opts: [
          { text: "Moving to another city permanently for work.", level: null },
          { text: "Working extra hours at the office all weekend.", level: null },
          { text: "Going to the mountains and renting a cabin.", level: "A2" },
          { text: "Heading to the mountains and booking a cabin.", level: "B1" },
        ],
      },
      {
        id: "wpq2",
        q: "What does his plan depend on?",
        opts: [
          { text: "Whether his friends can help him pay for the trip.", level: null },
          { text: "Whether his car gets repaired before Saturday.", level: null },
          { text: "The weather.", level: "A2" },
          { text: "Whether the weather is nice.", level: "B1" },
        ],
      },
      {
        id: "wpq3",
        q: "Who is Mark likely to travel with?",
        opts: [
          { text: "With his whole family, including the children.", level: null },
          { text: "With a group of coworkers from his office.", level: null },
          { text: "Nobody, he goes alone.", level: "A2" },
          { text: "Probably no one — he'd go by himself.", level: "B1" },
        ],
      },
      {
        id: "wpq4",
        q: "What will Mark do if it rains all weekend?",
        opts: [
          { text: "He will go to the cabin anyway and wait indoors.", level: null },
          { text: "He will visit a friend's house in the countryside.", level: null },
          { text: "He will stay at home and rest.", level: "A2" },
          { text: "He'll stay home and catch up on rest.", level: "B1" },
        ],
      },
      {
        id: "wpq5",
        q: "Why is the other person interested in the trip?",
        opts: [
          { text: "Because she offered to drive Mark to the mountains.", level: null },
          { text: "Because she already owns a cabin in that area.", level: null },
          { text: "She is looking for a good cabin too.", level: "A2" },
          { text: "She's been hunting for a good cabin herself.", level: "B1" },
        ],
      },
    ],
  },
  {
    id: "ai-use",
    title: "Interview: AI in Daily Life",
    subtitle: "Sarah (interviewer) & Dr. Evans (AI specialist) · B2–C1",
    src: "/audio/B2_C1_Audio_AI_Use.mp3",
    questions: [
      {
        id: "aiq1",
        q: "According to Dr. Evans, how is AI currently used in healthcare?",
        opts: [
          { text: "It is completely replacing doctors and medical staff.", level: null },
          { text: "It is strictly limited to administrative billing tasks.", level: null },
          { text: "It helps doctors find out what is wrong faster.", level: "B1" },
          { text: "It speeds up diagnosis for physicians.", level: "C1" },
        ],
      },
      {
        id: "aiq2",
        q: "Which workplace tasks does he say generative AI is taking over?",
        opts: [
          { text: "Hiring and firing employees across whole departments.", level: null },
          { text: "Repairing office equipment and computer hardware.", level: null },
          { text: "Writing reports, working with data and personalising learning.", level: "B1" },
          { text: "Drafting reports, analysing data and tailoring learning.", level: "C1" },
        ],
      },
      {
        id: "aiq3",
        q: 'What does Dr. Evans mean by describing AI as a "double-edged sword"?',
        opts: [
          { text: "That it is extremely dangerous and offers no real benefits.", level: null },
          { text: "That only trained software engineers are able to use it.", level: null },
          { text: "It brings big benefits but also serious problems.", level: "B1" },
          { text: "It boosts productivity yet creates critical risks.", level: "B2" },
        ],
      },
      {
        id: "aiq4",
        q: "Which concerns does he specifically mention?",
        opts: [
          { text: "Rising electricity bills and unreliable internet connections.", level: null },
          { text: "A worldwide shortage of computers and other devices.", level: null },
          { text: "Privacy, unfair algorithms and losing jobs.", level: "B1" },
          { text: "Data privacy, algorithmic bias and job displacement.", level: "C1" },
        ],
      },
      {
        id: "aiq5",
        q: "What is the speakers' conclusion about the relationship between AI and humans?",
        opts: [
          { text: "That AI will remove the need for human creativity at work.", level: null },
          { text: "That people must stop using AI until privacy is solved.", level: null },
          { text: "People should work with AI instead of fighting it.", level: "B1" },
          { text: "AI should augment, not replace, human ingenuity.", level: "C1" },
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
    quick: true,
    text: "The new cafe downtown is already very popular. It serves organic coffee and fresh pastries baked every morning. However, it is quite small, so finding a table during the morning rush can be difficult. Prices are reasonable considering the quality, and regulars say the staff remember their usual order after just a couple of visits.",
    image: readingCafe,
    imageAlt: "Interior de una cafetería luminosa con pocas mesas, café y pan recién horneado.",
    questions: [
      {
        id: "r1q1",
        q: "What is the main problem with the cafe?",
        quick: true,
        opts: [
          { text: "The coffee is far more expensive than elsewhere.", level: null },
          { text: "The pastries are not baked on the same day.", level: null },
          { text: "There are not enough tables.", level: "A2" },
          { text: "Its limited seating fills up at peak times.", level: "B2" },
        ],
      },
      {
        id: "r1q2",
        q: "What does the text say about the prices?",
        quick: true,
        opts: [
          { text: "They are said to be the lowest in the whole town.", level: null },
          { text: "They have been going up month after month.", level: null },
          { text: "They are fair for the quality.", level: "B1" },
          { text: "They are justified by the quality.", level: "C1" },
        ],
      },
      {
        id: "r1q3",
        q: "What do regular customers appreciate?",
        quick: true,
        opts: [
          { text: "The free wifi and the quiet working atmosphere.", level: null },
          { text: "The large terrace overlooking the main street.", level: null },
          { text: "The staff know their usual order.", level: "A2" },
          { text: "The personal attention from the staff.", level: "B2" },
        ],
      },
      {
        id: "r1q4",
        q: "Which sentence best summarises the text?",
        opts: [
          { text: "A cheap cafe that nobody in the area has discovered yet.", level: null },
          { text: "A large cafe with plenty of space but average coffee.", level: null },
          { text: "A good little cafe that gets very busy.", level: "B1" },
          { text: "A quality cafe let down only by its size.", level: "C1" },
        ],
      },
    ],
  },
  {
    id: "r2",
    kind: "short",
    title: "Library event",
    quick: true,
    text: "Next Thursday the city library will host a local author. Visitors can meet the writer, buy signed copies of her latest mystery novel and attend a free writing workshop. Places for the workshop are limited, so registration must be completed online before Friday. Those who miss the deadline may still attend the talk, but not the workshop.",
    image: readingLibrary,
    imageAlt: "Biblioteca durante una charla de autora y un taller de escritura.",
    questions: [
      {
        id: "r2q1",
        q: "What must attendees do to join the workshop?",
        quick: true,
        opts: [
          { text: "Buy a signed copy of the author's new novel.", level: null },
          { text: "Arrive at the library at least one hour early.", level: null },
          { text: "Register on the internet.", level: "A1" },
          { text: "Sign up online before the deadline.", level: "B2" },
        ],
      },
      {
        id: "r2q2",
        q: "Why is registration necessary?",
        quick: true,
        opts: [
          { text: "Because the writing workshop has an entrance fee.", level: null },
          { text: "Because the author personally asked the library for it.", level: null },
          { text: "Because there are only a few places.", level: "A2" },
          { text: "Because capacity is restricted.", level: "B2" },
        ],
      },
      {
        id: "r2q3",
        q: "What can people who register late still do?",
        quick: true,
        opts: [
          { text: "Nothing at all; they must wait for the next event.", level: null },
          { text: "Join the workshop anyway if there is a free seat.", level: null },
          { text: "Go to the talk.", level: "B1" },
          { text: "Attend the talk, but not the workshop.", level: "C1" },
        ],
      },
      {
        id: "r2q4",
        q: "What kind of book is the author presenting?",
        opts: [
          { text: "A historical biography of a local politician.", level: null },
          { text: "A collection of poems written during the pandemic.", level: null },
          { text: "A mystery novel.", level: "A2" },
          { text: "Her most recent mystery.", level: "B1" },
        ],
      },
    ],
  },
  {
    id: "r4",
    kind: "short",
    title: "A change of plan",
    text: "The council announced last month that the old market would be demolished to make room for a car park. After hundreds of residents signed a petition, the decision was reviewed. The building will now be restored and reopened as a food hall, with the stalls rented at a reduced price to the traders who worked there before. Work is expected to take two years, and the traders will move to a temporary site nearby in the meantime.",
    questions: [
      {
        id: "r4q1",
        q: "What was the council's original plan?",
        opts: [
          { text: "To restore the old market and rent it out cheaply.", level: null },
          { text: "To move all the traders to a new shopping centre.", level: null },
          { text: "To knock the market down and build a car park.", level: "A2" },
          { text: "To demolish the market for parking space.", level: "B1" },
        ],
      },
      {
        id: "r4q2",
        q: "Why did the plan change?",
        opts: [
          { text: "Because the building turned out to be too old to demolish.", level: null },
          { text: "Because the council could not afford the demolition work.", level: null },
          { text: "Because many residents signed a petition.", level: "B1" },
          { text: "Because of public pressure.", level: "B2" },
        ],
      },
      {
        id: "r4q3",
        q: "What will happen to the original traders?",
        opts: [
          { text: "They will have to look for premises in another district.", level: null },
          { text: "They will pay the same rent as any new business there.", level: null },
          { text: "They will move nearby and pay less rent later.", level: "B1" },
          { text: "They will relocate temporarily, then return cheaply.", level: "C1" },
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
          { text: "That productivity fell sharply once people worked at home.", level: null },
          { text: "That employees ended up working much longer hours.", level: null },
          { text: "People did the same work in less time.", level: "B1" },
          { text: "Output held up thanks to fewer interruptions.", level: "C1" },
        ],
      },
      {
        id: "r3q2",
        q: "What problem affected younger employees most?",
        opts: [
          { text: "They had slower internet connections than their colleagues.", level: null },
          { text: "They were given far too much work to handle alone.", level: null },
          { text: "They felt alone and learned less.", level: "A2" },
          { text: "Isolation cut off their informal learning.", level: "B2" },
        ],
      },
      {
        id: "r3q3",
        q: "According to the experts, when does hybrid work fail?",
        opts: [
          { text: "When employees decide to come into the office every day.", level: null },
          { text: "When the managers themselves also work from home.", level: null },
          { text: "When office days are not planned for working together.", level: "B1" },
          { text: "When in-office days lack a collaborative purpose.", level: "C1" },
        ],
      },
      {
        id: "r3q4",
        q: "How did some managers measure performance?",
        opts: [
          { text: "By asking each team to grade its own weekly output.", level: null },
          { text: "By visiting the employees at home once a month.", level: null },
          { text: "By counting the hours people were online.", level: "B1" },
          { text: "By tracking online hours rather than results.", level: "B2" },
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
    quick: true,
    opts: [
      { text: "are", level: null },
      { text: "do", level: null },
      { text: "is", level: "A1" },
      { text: "does it cost", level: "A2" },
    ],
  },
  {
    id: "v2",
    q: "Complete: “I ___ in this city since 2019.”",
    quick: true,
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
    quick: true,
    opts: [
      { text: "No, I don't do it right now, sorry.", level: null },
      { text: "I no finish yet, tomorrow maybe.", level: null },
      { text: "I haven't finished it yet, sorry.", level: "B1" },
      { text: "I'm just putting the finishing touches.", level: "C1" },
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
    quick: true,
    opts: [
      { text: "In a rather sad or gloomy mood.", level: null },
      { text: "Somewhere outdoors, under the sky.", level: null },
      { text: "Suddenly and unexpectedly.", level: "B1" },
      { text: "Without any warning.", level: "C1" },
    ],
  },
  {
    id: "v6",
    q: 'Complete: "If I ___ more time, I would travel across Asia."',
    quick: true,
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
      { text: "very careful indeed", level: "A2" },
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
      { text: "mind, as it may vary", level: "C1" },
    ],
  },
  {
    id: "v9",
    q: "How do you politely decline an invitation?",
    quick: true,
    opts: [
      { text: "No, I don't want to go with you.", level: null },
      { text: "Maybe no, bye, see you later.", level: null },
      { text: "Sorry, I can't make it, but thank you.", level: "B1" },
      { text: "I'm afraid I won't be able to make it.", level: "C1" },
    ],
  },
  {
    id: "v10",
    q: 'Choose the best word: "Children are often highly ___ and recover quickly from difficulties."',
    quick: true,
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
      { text: "had already been running", level: "C1" },
    ],
  },
  {
    id: "v12",
    q: 'What does "to call it a day" mean?',
    quick: true,
    opts: [
      { text: "To make an important phone call.", level: null },
      { text: "To plan what to do tomorrow.", level: null },
      { text: "To stop working for now.", level: "B1" },
      { text: "To wrap things up.", level: "C1" },
    ],
  },
  {
    id: "v13",
    q: 'Complete: "Could you ___ the meeting to Friday? I have a conflict on Thursday."',
    opts: [
      { text: "delay off", level: null },
      { text: "put down", level: null },
      { text: "move", level: "B1" },
      { text: "put off", level: "B2" },
    ],
  },
  {
    id: "v14",
    q: 'Choose the correct collocation: "She ___ a difficult decision after weeks of thinking."',
    opts: [
      { text: "did", level: null },
      { text: "performed", level: null },
      { text: "made", level: "A2" },
      { text: "reached", level: "B2" },
    ],
  },
  {
    id: "v15",
    q: 'Complete: "If she had left earlier, she ___ the train."',
    opts: [
      { text: "would catch", level: null },
      { text: "will have caught", level: null },
      { text: "would have caught", level: "B2" },
      { text: "wouldn't have missed", level: "C1" },
    ],
  },
  {
    id: "v16",
    q: "You are writing a formal email. Which opening is the most appropriate?",
    opts: [
      { text: "Hey! What's up? Quick thing I wanted to ask you.", level: null },
      { text: "Hello you, I write for asking one question please.", level: null },
      { text: "Dear Ms. Reed, I'm writing about the invoice.", level: "B1" },
      { text: "Dear Ms. Reed, I am writing regarding the invoice.", level: "C1" },
    ],
  },
];

/* --------------------- DETERMINISTIC OPTION SHUFFLE --------------------- */
// The bank is authored with the correct answers at the end. We shuffle each
// question's options once, deterministically (seeded by the question id), so
// the correct option can appear in any position but the exam is stable
// between renders and the stored answer index stays valid.

function seedFrom(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffleOptions(q: Question): void {
  let s = seedFrom(q.id) || 1;
  const rand = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
  for (let i = q.opts.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [q.opts[i], q.opts[j]] = [q.opts[j], q.opts[i]];
  }
}

[
  ...listening.flatMap((a) => a.questions),
  ...reading.flatMap((p) => p.questions),
  ...vocab,
].forEach((q) => {
  const keyed = q.opts
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => option.level)
    .sort(
      (a, b) =>
        CEFR_VALUE[b.option.level as Cefr] - CEFR_VALUE[a.option.level as Cefr],
    );
  const answer = keyed[0];
  if (answer?.option.level) {
    q.level = answer.option.level;
    q.evidence ??= "detail";
    // Remove the second acceptable paraphrase. Three strong options are more
    // valid than four options containing two defensible answers.
    q.opts = q.opts
      .filter((_, index) => index === answer.index || !keyed.some((x) => x.index === index))
      .map((option, index, options) => ({
        ...option,
        correct: option.text === answer.option.text && options.length > 0,
      }));
  }
  shuffleOptions(q);
});

export const QuestionBank = { listening, reading, vocab };

/** Audio items shown for a given exam mode. */
export function modeListening(mode: ExamMode): AudioItem[] {
  if (mode === "full") return listening;
  const quickIds = new Set([
    "csq1", "csq4", "csq5",
    "lcq1", "lcq2", "lcq5",
    "rsq1", "rsq2", "rsq5",
    "wrq1", "wrq3", "wrq5",
    "aiq1", "aiq3", "aiq5",
  ]);
  return listening
    .map((a) => ({ ...a, questions: a.questions.filter((q) => quickIds.has(q.id)) }))
    .filter((a) => a.questions.length > 0);
}

/** Reading passages shown for a given exam mode. */
export function modeReading(mode: ExamMode): ReadingPassage[] {
  if (mode === "full") return reading;
  const quickIds = new Set(["r1q1", "r1q2", "r1q4", "r3q1", "r3q2", "r3q3"]);
  return reading
    .map((p) => ({ ...p, questions: p.questions.filter((q) => quickIds.has(q.id)) }))
    .filter((p) => p.questions.length > 0);
}

/** Vocabulary questions for a given exam mode. */
export function modeVocab(mode: ExamMode): Question[] {
  if (mode === "full") return vocab;
  const quickIds = new Set(["v1", "v2", "v4", "v6", "v7", "v10", "v11", "v16"]);
  return vocab.filter((q) => quickIds.has(q.id));
}

/** All questions of a section, flattened, for a given exam mode. */
export function sectionQuestions(section: SectionKey, mode: ExamMode = "full"): Question[] {
  if (section === "listening") return modeListening(mode).flatMap((a) => a.questions);
  if (section === "reading") return modeReading(mode).flatMap((p) => p.questions);
  return modeVocab(mode);
}

export function totalQuestions(mode: ExamMode): number {
  return SECTION_ORDER.reduce((a, k) => a + sectionQuestions(k, mode).length, 0);
}

export const TOTAL_QUESTIONS = totalQuestions("full");
export const QUICK_QUESTIONS = totalQuestions("quick");

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
  earnedPoints: number;
  availablePoints: number;
};

export type ResultConfidence = "Orientativa" | "Moderada" | "Alta";

export type ExamResult = {
  sections: SectionResult[];
  overall: Cefr;
  overallScore: number;
  totalCorrect: number;
  totalQuestions: number;
  mode: ExamMode;
  band: string;
  confidence: ResultConfidence;
  unanswered: number;
  version: 4;
};

function levelFromScore(score: number): Cefr {
  if (score >= 78) return "C1";
  if (score >= 60) return "B2";
  if (score >= 45) return "B1";
  if (score >= 30) return "A2";
  return "A1";
}

function resultBand(score: number, level: Cefr) {
  const boundaries = [30, 45, 60, 78];
  const nearest = boundaries.find((boundary) => Math.abs(score - boundary) <= 3);
  if (!nearest) return level;
  const upper = levelFromScore(nearest + 1);
  const lower = levelFromScore(nearest - 1);
  return score < nearest ? `${lower} alto · ${upper} en desarrollo` : `${upper} inicial · ${lower} consolidado`;
}

function scoreSection(key: SectionKey, mode: ExamMode): (answers: Answers) => SectionResult {
  return (answers) => {
    const qs = sectionQuestions(key, mode);
    let sum = 0;
    let availablePoints = 0;
    let correct = 0;
    qs.forEach((q) => {
      const idx = answers[q.id];
      const opt = typeof idx === "number" ? q.opts[idx] : undefined;
      const weight = CEFR_VALUE[q.level ?? "A1"];
      availablePoints += weight;
      if (opt?.correct) {
        correct++;
        sum += weight;
      }
    });
    const score = availablePoints ? Math.round((sum / availablePoints) * 100) : 0;
    const level = levelFromScore(score);
    return { key, label: SECTION_NAMES[key], correct, total: qs.length, score, level, earnedPoints: sum, availablePoints };
  };
}

export function computeResult(answers: Answers, mode: ExamMode = "full"): ExamResult {
  const sections = SECTION_ORDER.map((k) => scoreSection(k, mode)(answers));
  const earnedPoints = sections.reduce((a, s) => a + s.earnedPoints, 0);
  const availablePoints = sections.reduce((a, s) => a + s.availablePoints, 0);
  const overallScore = availablePoints ? Math.round((earnedPoints / availablePoints) * 100) : 0;
  const overall = levelFromScore(overallScore);
  const totalCorrect = sections.reduce((a, s) => a + s.correct, 0);
  const answered = Object.keys(answers).filter((id) =>
    SECTION_ORDER.some((key) => sectionQuestions(key, mode).some((q) => q.id === id)),
  ).length;
  const unanswered = totalQuestions(mode) - answered;
  const confidence: ResultConfidence =
    mode === "quick" ? "Orientativa" : unanswered === 0 ? "Alta" : "Moderada";
  return {
    sections,
    overall,
    overallScore,
    totalCorrect,
    totalQuestions: totalQuestions(mode),
    mode,
    band: resultBand(overallScore, overall),
    confidence,
    unanswered,
    version: 4,
  };
}
