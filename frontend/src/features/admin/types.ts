export type LoginPayload = {
  loginId: string;
  password: string;
};

export type Question = {
  id: number;
  title: string;
  passageText: string | null;
  assetImagePath: string | null;
  questionText: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correctAnswer: "A" | "B" | "C" | "D";
};

export type QuestionPayload = Omit<Question, "id">;

export type ExamQuestionLink = {
  questionId: number;
  moduleType: "MODULE_1" | "MODULE_2";
  routeType: "COMMON" | "UPPER" | "LOWER";
  questionOrder: number;
};

export type Exam = {
  id: number;
  type: string;
  title: string;
  versionName: string;
  module1DurationSeconds: number;
  module2DurationSeconds: number;
  scoreTableId: string;
  questions: Array<{
    questionId: number;
    title: string;
    moduleType: string;
    routeType: string;
    questionOrder: number;
  }>;
};

export type ExamPayload = {
  title: string;
  versionName: string;
  scoreTableId: string;
  questions: ExamQuestionLink[];
};

export type Student = {
  id: number;
  loginId: string;
  name: string;
};

export type AssignmentPayload = {
  examId: number;
  studentId: number;
  dueAt: string | null;
};
