export interface Shortcut {
  id: string;
  shortcut: string;
  meaning: string;
  created_at?: string;
  updated_at?: string;
}

export interface Chapter {
  id: string;
  name: string;
  shortcuts: Shortcut[];
  created_at?: string;
  updated_at?: string;
}

export interface AnswerAttempt {
  shortcut: string;
  meaning: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface ChapterScores {
  [key: string]: number;
}