import { useState, useEffect, useCallback } from 'react';
import firestore from '@react-native-firebase/firestore';
import { SessionBoxesProp, SessionDetailProp } from '../constants';

// Firebase data structure (what actually comes from Firestore)
type FirebaseSessionData = {
  sessionId: string;
  uid: string;
  time: any;
  moodPercentage?: number;
  mentalHealthScore?: string;
  normalizedScores?: {
    'CBT Behavioral Activation'?: string | number;
    'GAD-7 Score'?: string | number;
    'PHQ-9 Score'?: string | number;
    'PSQI Score'?: string | number;
    'PSS Score'?: string | number;
    'Rosenberg Self Esteem'?: string | number;
    'SFQ Score'?: string | number;
    'SSRS Assessment'?: string | number;
  };
  emotions?: Array<{ label: string; score: number }>;
  longSummary?: string;
  shortSummary?: string;
  [key: string]: any;
};

export const useAppData = (userId: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Session data states
  const [sessionSummary, setSessionSummary] = useState<SessionDetailProp[]>([]);
  const [recentSessionSummary, setRecentSessionSummary] = useState<SessionBoxesProp[]>([]);
  const [recentFeeling, setRecentFeeling] = useState<number | undefined>(undefined);
  
  // Mental health scores states
  const [last30DaysScores, setLast30DaysScores] = useState<(number | null)[]>([]);
  const [mentalHealthScores, setMentalHealthScores] = useState<number[]>([]);
  
  // Normalized scores states for last 30 sessions
  const [cbtScores, setCbtScores] = useState<(number | null)[]>([]);
  const [gad7Scores, setGad7Scores] = useState<(number | null)[]>([]);
  const [phq9Scores, setPhq9Scores] = useState<(number | null)[]>([]);
  const [psqiScores, setPsqiScores] = useState<(number | null)[]>([]);
  const [pssScores, setPssScores] = useState<(number | null)[]>([]);
  const [rosenbergScores, setRosenbergScores] = useState<(number | null)[]>([]);
  const [sfqScores, setSfqScores] = useState<(number | null)[]>([]);
  const [ssrsScores, setSsrsScores] = useState<(number | null)[]>([]);
  
  // Emotions state
  const [emotions, setEmotions] = useState<Array<{ label: string; score: number }>>([]);

  // Helper function to convert Firebase session to SessionDetailProp
  const convertToSessionDetailProp = (firebaseSession: FirebaseSessionData, index: number): SessionDetailProp => {
    const mentalHealthScore = firebaseSession.mentalHealthScore 
      ? parseFloat(firebaseSession.mentalHealthScore) 
      : 0;

    // Convert normalized scores to proper format
    const normalizedScores: SessionDetailProp['normalizedScores'] = {};
    if (firebaseSession.normalizedScores) {
      const fbScores = firebaseSession.normalizedScores;
      
      if (fbScores['PHQ-9 Score'] !== undefined) {
        normalizedScores['PHQ-9 Score'] = typeof fbScores['PHQ-9 Score'] === 'string' ? 'Not Applicable' : fbScores['PHQ-9 Score'];
      }
      if (fbScores['GAD-7 Score'] !== undefined) {
        normalizedScores['GAD-7 Score'] = typeof fbScores['GAD-7 Score'] === 'string' ? 'Not Applicable' : fbScores['GAD-7 Score'];
      }
      if (fbScores['CBT Behavioral Activation'] !== undefined) {
        normalizedScores['CBT Behavioral Activation'] = typeof fbScores['CBT Behavioral Activation'] === 'string' ? 'Not Applicable' : fbScores['CBT Behavioral Activation'];
      }
      if (fbScores['PSQI Score'] !== undefined) {
        normalizedScores['PSQI Score'] = typeof fbScores['PSQI Score'] === 'string' ? 'Not Applicable' : fbScores['PSQI Score'];
      }
      if (fbScores['SFQ Score'] !== undefined) {
        normalizedScores['SFQ Score'] = typeof fbScores['SFQ Score'] === 'string' ? 'Not Applicable' : fbScores['SFQ Score'];
      }
      if (fbScores['PSS Score'] !== undefined) {
        normalizedScores['PSS Score'] = typeof fbScores['PSS Score'] === 'string' ? 'Not Applicable' : fbScores['PSS Score'];
      }
      if (fbScores['SSRS Assessment'] !== undefined) {
        normalizedScores['SSRS Assessment'] = typeof fbScores['SSRS Assessment'] === 'string' ? 'Not Applicable' : fbScores['SSRS Assessment'];
      }
      if (fbScores['Rosenberg Self Esteem'] !== undefined) {
        normalizedScores['Rosenberg Self Esteem'] = typeof fbScores['Rosenberg Self Esteem'] === 'string' ? 'Not Applicable' : fbScores['Rosenberg Self Esteem'];
      }
    }

    return {
      sessionId: firebaseSession.sessionId,
      sessionNumber: index + 1,
      mentalHealthScore: isNaN(mentalHealthScore) ? 0 : mentalHealthScore,
      normalizedScores,
      emotions: firebaseSession.emotions || [],
      shortSummary: firebaseSession.shortSummary || '',
      longSummary: firebaseSession.longSummary,
    };
  };

  // Helper function to convert Firebase session to SessionBoxesProp
  const convertToSessionBoxesProp = (firebaseSession: FirebaseSessionData, index: number): SessionBoxesProp => {
    return {
      sessionId: firebaseSession.sessionId,
      shortSummary: firebaseSession.shortSummary || 'No summary available',
      id: index,
      description: firebaseSession.shortSummary || firebaseSession.longSummary || 'No description available',
    };
  };

  const fetchAllData = useCallback(async () => {
    if (!userId) {
      console.log('useAppData: User ID is missing');
      setLoading(false);
      return;
    }

    console.log('useAppData: Starting React Native Firebase fetch for user:', userId);
    setLoading(true);
    setError(null);

    try {
      // Use React Native Firebase
      const querySnapshot = await firestore()
        .collection('summaries')
        .where('uid', '==', userId)
        .orderBy('time', 'desc')
        .get();
      
      if (querySnapshot.empty) {
        console.log('useAppData: No sessions found for user:', userId);
        setLoading(false);
        return;
      }

      const allSessions: FirebaseSessionData[] = [];
      querySnapshot.forEach((doc) => {
        const sessionData = doc.data() as FirebaseSessionData;
        allSessions.push({ id: doc.id, ...sessionData });
      });

      console.log(`useAppData: Found ${allSessions.length} sessions for user:`, userId);

      // Process session summary data (convert to proper types)
      const chronologicalSessions = [...allSessions].reverse(); // Oldest first for session detail
      const convertedSessionSummary = chronologicalSessions.map((session, index) => 
        convertToSessionDetailProp(session, index)
      );
      setSessionSummary(convertedSessionSummary);

      // Process recent sessions data (most recent 3 sessions)
      const mostRecentSessions = allSessions.slice(0, 3);
      const convertedRecentSessions = mostRecentSessions.map((session, index) => 
        convertToSessionBoxesProp(session, index)
      );
      setRecentSessionSummary(convertedRecentSessions);
      setRecentFeeling(allSessions[0]?.moodPercentage);

      // Process recent mental health scores (last 7 sessions for compatibility)
      const recent7Sessions = allSessions.slice(0, 7);
      const recentScoresArray: number[] = [];
      recent7Sessions.forEach(session => {
        if (session.mentalHealthScore) {
          const score = parseFloat(session.mentalHealthScore);
          if (!isNaN(score)) {
            recentScoresArray.push(score);
          }
        }
      });
      setMentalHealthScores(recentScoresArray.reverse()); // Chronological order

      // Process last 30 sessions data
      const last30Sessions = allSessions.slice(0, 30);
      
      // Initialize arrays for all score types
      const mentalHealthArray: (number | null)[] = [];
      const cbtArray: (number | null)[] = [];
      const gad7Array: (number | null)[] = [];
      const phq9Array: (number | null)[] = [];
      const psqiArray: (number | null)[] = [];
      const pssArray: (number | null)[] = [];
      const rosenbergArray: (number | null)[] = [];
      const sfqArray: (number | null)[] = [];
      const ssrsArray: (number | null)[] = [];

      last30Sessions.forEach((session) => {
        // Extract mental health score
        if (session.mentalHealthScore) {
          const score = parseFloat(session.mentalHealthScore);
          mentalHealthArray.push(!isNaN(score) ? score : null);
        } else {
          mentalHealthArray.push(null);
        }

        // Extract normalized scores
        if (session.normalizedScores) {
          const {
            'CBT Behavioral Activation': cbtScore,
            'GAD-7 Score': gad7Score,
            'PHQ-9 Score': phq9Score,
            'PSQI Score': psqiScore,
            'PSS Score': pssScore,
            'Rosenberg Self Esteem': rosenbergScore,
            'SFQ Score': sfqScore,
            'SSRS Assessment': ssrsScore,
          } = session.normalizedScores;

          cbtArray.push(typeof cbtScore === 'string' ? null : cbtScore ?? null);
          gad7Array.push(typeof gad7Score === 'string' ? null : gad7Score ?? null);
          phq9Array.push(typeof phq9Score === 'string' ? null : phq9Score ?? null);
          psqiArray.push(typeof psqiScore === 'string' ? null : psqiScore ?? null);
          pssArray.push(typeof pssScore === 'string' ? null : pssScore ?? null);
          rosenbergArray.push(typeof rosenbergScore === 'string' ? null : rosenbergScore ?? null);
          sfqArray.push(typeof sfqScore === 'string' ? null : sfqScore ?? null);
          ssrsArray.push(typeof ssrsScore === 'string' ? null : ssrsScore ?? null);
        } else {
          // Push null for sessions without normalized scores
          cbtArray.push(null);
          gad7Array.push(null);
          phq9Array.push(null);
          psqiArray.push(null);
          pssArray.push(null);
          rosenbergArray.push(null);
          sfqArray.push(null);
          ssrsArray.push(null);
        }
      });

      // Set all scores (reverse to get chronological order)
      setLast30DaysScores(mentalHealthArray.reverse());
      setCbtScores(cbtArray.reverse());
      setGad7Scores(gad7Array.reverse());
      setPhq9Scores(phq9Array.reverse());
      setPsqiScores(psqiArray.reverse());
      setPssScores(pssArray.reverse());
      setRosenbergScores(rosenbergArray.reverse());
      setSfqScores(sfqArray.reverse());
      setSsrsScores(ssrsArray.reverse());

      // Process emotions from the most recent session
      const mostRecentSession = allSessions[0];
      if (mostRecentSession?.emotions && Array.isArray(mostRecentSession.emotions)) {
        setEmotions(mostRecentSession.emotions);
      } else {
        setEmotions([]);
      }

    } catch (err) {
      console.error('useAppData: React Native Firebase error:', err);
      setError(err instanceof Error ? err : new Error('Error fetching app data'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Single delayed call to prevent Firebase connection conflicts
    const timeoutId = setTimeout(() => {
      fetchAllData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchAllData]);

  return {
    loading,
    error,
    // Session data
    sessionSummary,
    recentSessionSummary,
    recentFeeling,
    // Mental health scores
    mentalHealthScores, // Recent 7 sessions
    last30DaysScores,   // Last 30 sessions
    // Normalized scores (last 30 sessions)
    cbtScores,
    gad7Scores,
    phq9Scores,
    psqiScores,
    pssScores,
    rosenbergScores,
    sfqScores,
    ssrsScores,
    // Emotions
    emotions,
  };
};