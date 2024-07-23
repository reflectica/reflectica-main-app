interface SessionScoreProp {
  score: number;
  day: string;
}

interface EmotionalStateModelingProp {
  happy: number;
  excited: number;
  nervous: number;
  other: string;
}
export interface SessionDetailProp {
  id: string;
  sessionID: number;
  sessionScore: SessionScoreProp[];
  phq9: number[];
  gad7: number[];
  cbt: number[];
  sfq: number[];
  pss: number;
  ssrs: number;
  esteemBar: number[];
  emotionalStateModeling: EmotionalStateModelingProp[];
  keyConversationTopics: string[];
}

export interface SessionBoxesProp {
  id: number;
  // index: number;
  description: string;
}
