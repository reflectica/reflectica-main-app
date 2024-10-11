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

export type SessionDetailProp = {
  sessionId: string;
  sessionNumber: number;
  mentalHealthScore: number;
  normalizedScores?: {
    'PHQ-9 Score'?: number | 'Not Applicable';
    'GAD-7 Score'?: number | 'Not Applicable';
    'CBT Behavioral Activation'?: number | 'Not Applicable';
    'PSQI Score'?: number | 'Not Applicable';
    'SFQ Score'?: number | 'Not Applicable';
    'PSS Score'?: number | 'Not Applicable';
    'SSRS Assessment'?: number | 'Not Applicable';
    'Rosenberg Self Esteem'?: number | 'Not Applicable';
  };
  emotions?: Array<{ label: string; score: number }>;
  shortSummary: string;
  longSummary?: string;
};

export interface SessionBoxesProp {
  sessionId: Key | null | undefined;
  shortSummary: ReactNode;
  id: number;
  // index: number;
  description: string;
}
