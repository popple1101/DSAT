export type StudentAssignment = {
  assignmentId: number;
  examId: number;
  examTitle: string;
  versionName: string;
  submissionStatus: string;
  routeType: string | null;
  assignedAt: string;
  dueAt: string | null;
};

export type StudentQuestion = {
  questionId: number;
  questionOrder: number;
  title: string;
  passageText: string | null;
  assetImagePath: string | null;
  questionText: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  selectedAnswer: "A" | "B" | "C" | "D" | null;
};

export type StudentExamDetail = {
  assignmentId: number;
  submissionId: number;
  examId: number;
  examTitle: string;
  versionName: string;
  submissionStatus: string;
  currentModuleType: "MODULE_1" | "MODULE_2";
  currentRouteType: "COMMON" | "UPPER" | "LOWER";
  module1DurationSeconds: number | null;
  module2DurationSeconds: number | null;
  questions: StudentQuestion[];
};

export type ModuleSubmitResponse = {
  submissionId: number;
  submissionStatus: string;
  routeType: "UPPER" | "LOWER" | "COMMON" | null;
  module1CorrectCount: number | null;
  module2CorrectCount: number | null;
  sectionScore: number | null;
};

export type StudentAnswerPayload = {
  questionId: number;
  moduleType: "MODULE_1" | "MODULE_2";
  routeType: "COMMON" | "UPPER" | "LOWER";
  selectedAnswer: "A" | "B" | "C" | "D";
};

export type StudentResultRow = {
  moduleType: string;
  routeType: string;
  questionOrder: number;
  questionId: number;
  title: string;
  correctAnswer: string | null;
  selectedAnswer: string | null;
  correct: boolean;
};

export type StudentResult = {
  assignmentId: number;
  submissionId: number;
  examId: number;
  examTitle: string;
  versionName: string;
  routeType: string;
  totalScore: number;
  sectionScore: number;
  module1DurationSeconds: number;
  module2DurationSeconds: number;
  module1CorrectCount: number;
  module2CorrectCount: number;
  questionResults: StudentResultRow[];
};
