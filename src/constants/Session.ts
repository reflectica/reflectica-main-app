export interface SessionBoxesProp {
  sessionID: number;
  // index: number;
  description: string;
}

interface SessionScore {
  score: number;
  day: string;
}

interface EmotionalStateModeling {
  happy: number;
  excited: number;
  nervous: number;
  other: string;
}
export interface SessionDetailProp {
  id: string;
  sessionID: number;
  sessionScore: SessionScore[];
  phq9: number[];
  gad7: number[];
  cbt: number[];
  sfq: number[];
  pss: number;
  ssrs: number;
  esteemBar: number[];
  emotionalStateModeling: EmotionalStateModeling[];
  keyConversationTopics: string[];
}
