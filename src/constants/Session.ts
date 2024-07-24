import {Key, ReactNode} from 'react';

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
  shortSummary: string;
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
  sessionId: Key | null | undefined;
  shortSummary: ReactNode;
  id: number;
  // index: number;
  description: string;
}
