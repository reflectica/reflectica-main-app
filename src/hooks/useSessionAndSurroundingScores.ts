// useSessionAndSurroundingScores.ts
import { useState, useEffect, useCallback } from 'react';
import { summaryCollection } from '../firebase/firebaseConfig';
import { query, where, getDocs, orderBy, limit } from 'firebase/firestore';

type SessionData = {
  sessionId: string;
  mentalHealthScore?: string; // Assuming it's stored as a string
  time: any; // Firestore Timestamp for the session time
};

type AllSessionData = {
  sessionId: string;
  mentalHealthScore?: string; // Assuming it's stored as a string
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
  time: any; // Firestore Timestamp for the session time
};

export const useSessionAndSurroundingScores = (userId: string, sessionId: string) => {
  // State for surrounding 7 sessions
  const [mentalHealthScores, setMentalHealthScores] = useState<(number | null)[]>([]);
  
  // States for the last 30 sessions
  const [last30DaysScores, setLast30DaysScores] = useState<(number | null)[]>([]);
  const [cbtScores, setCbtScores] = useState<(number | null)[]>([]);
  const [gad7Scores, setGad7Scores] = useState<(number | null)[]>([]);
  const [phq9Scores, setPhq9Scores] = useState<(number | null)[]>([]);
  const [psqiScores, setPsqiScores] = useState<(number | null)[]>([]);
  const [pssScores, setPssScores] = useState<(number | null)[]>([]);
  const [rosenbergScores, setRosenbergScores] = useState<(number | null)[]>([]);
  const [sfqScores, setSfqScores] = useState<(number | null)[]>([]);
  const [ssrsScores, setSsrsScores] = useState<(number | null)[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!userId || !sessionId) {
      setLoading(false);
      console.log('User ID or Session ID is missing.');
      return;
    }

    try {
      console.log('Fetching sessions for user:', userId);

      // Fetch all sessions for the user, ordered by time
      const allSessionsQuery = query(
        summaryCollection,
        where('uid', '==', userId),
        orderBy('time', 'asc') // Order by time in ascending order
      );

      const allSessionsSnapshot = await getDocs(allSessionsQuery);

      const allSessions: SessionData[] = [];
      allSessionsSnapshot.forEach((doc) => {
        const sessionData = doc.data() as SessionData;
        allSessions.push(sessionData);
        console.log('Fetched session:', sessionData);
      });

      console.log('Total sessions fetched:', allSessions.length);

      // Find the index of the current session
      const currentSessionIndex = allSessions.findIndex(session => session.sessionId === sessionId);

      if (currentSessionIndex === -1) {
        console.error('Current session not found:', sessionId);
        setLoading(false);
        return;
      }

      console.log('Current session index:', currentSessionIndex);

      // Get the previous 6 sessions and include the current session (total 7)
      const startIndex = Math.max(0, currentSessionIndex - 6);
      const endIndex = currentSessionIndex + 1; // Include the current session

      console.log(`Fetching sessions from index ${startIndex} to ${endIndex}`);

      const surroundingSessions = allSessions.slice(startIndex, endIndex);

      console.log('Surrounding sessions:', surroundingSessions);

      // Extract the mental health scores, with validation and conversion from string to number
      const scoresArray = surroundingSessions.map(session => {
        if (session.mentalHealthScore !== undefined) {
          const score = parseFloat(session.mentalHealthScore);
          if (!isNaN(score)) {
            console.log('Processed score:', score, 'for sessionId:', session.sessionId);
            return score;
          } else {
            console.warn('Invalid mentalHealthScore for sessionId:', session.sessionId);
            return null; // Return null for invalid scores
          }
        } else {
          console.warn('Missing mentalHealthScore for sessionId:', session.sessionId);
          return null; // Return null for missing scores
        }
      });

      console.log('Final scores array (Surrounding 7):', scoresArray);
      setMentalHealthScores(scoresArray); // Set only surrounding 7 sessions
    } catch (err) {
      console.error('Error fetching scores:', err);
      setError(err instanceof Error ? err : new Error('Error fetching scores'));
    } finally {
      setLoading(false);
    }
  }, [userId, sessionId]);

  const fetchAllScores = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!userId) {
      setLoading(false);
      console.log('User ID is missing.');
      return;
    }

    try {
      console.log('Fetching last 30 sessions for user:', userId);

      // Fetch the last 30 sessions for the user
      const last30SessionsQuery = query(
        summaryCollection,
        where('uid', '==', userId),
        orderBy('time', 'desc'),
        limit(30) // Limit to last 30 sessions
      );

      const last30SessionsSnapshot = await getDocs(last30SessionsQuery);

      const mentalHealthArray: (number | null)[] = [];
      const cbtArray: (number | null)[] = [];
      const gad7Array: (number | null)[] = [];
      const phq9Array: (number | null)[] = [];
      const psqiArray: (number | null)[] = [];
      const pssArray: (number | null)[] = [];
      const rosenbergArray: (number | null)[] = [];
      const sfqArray: (number | null)[] = [];
      const ssrsArray: (number | null)[] = [];

      last30SessionsSnapshot.forEach((doc) => {
        const allSessionData = doc.data() as AllSessionData;

        // Extract mental health score
        if (allSessionData.mentalHealthScore) {
          const score = parseFloat(allSessionData.mentalHealthScore);
          mentalHealthArray.push(!isNaN(score) ? score : null);
        } else {
          mentalHealthArray.push(null);
        }

        // Extract normalized scores
        if (allSessionData.normalizedScores) {
          const {
            'CBT Behavioral Activation': cbtScore,
            'GAD-7 Score': gad7Score,
            'PHQ-9 Score': phq9Score,
            'PSQI Score': psqiScore,
            'PSS Score': pssScore,
            'Rosenberg Self Esteem': rosenbergScore,
            'SFQ Score': sfqScore,
            'SSRS Assessment': ssrsScore,
          } = allSessionData.normalizedScores;

          cbtArray.push(
            typeof cbtScore === 'string' ? null : cbtScore ?? null
          );
          gad7Array.push(
            typeof gad7Score === 'string' ? null : gad7Score ?? null
          );
          phq9Array.push(
            typeof phq9Score === 'string' ? null : phq9Score ?? null
          );
          psqiArray.push(
            typeof psqiScore === 'string' ? null : psqiScore ?? null
          );
          pssArray.push(
            typeof pssScore === 'string' ? null : pssScore ?? null
          );
          rosenbergArray.push(
            typeof rosenbergScore === 'string' ? null : rosenbergScore ?? null
          );
          sfqArray.push(
            typeof sfqScore === 'string' ? null : sfqScore ?? null
          );
          ssrsArray.push(
            typeof ssrsScore === 'string' ? null : ssrsScore ?? null
          );
        }
      });

      // Reverse the arrays to be in chronological order
      setLast30DaysScores(mentalHealthArray.reverse());
      setCbtScores(cbtArray.reverse());
      setGad7Scores(gad7Array.reverse());
      setPhq9Scores(phq9Array.reverse());
      setPsqiScores(psqiArray.reverse());
      setPssScores(pssArray.reverse());
      setRosenbergScores(rosenbergArray.reverse());
      setSfqScores(sfqArray.reverse());
      setSsrsScores(ssrsArray.reverse());

    } catch (err) {
      console.error('Error fetching last 30 sessions:', err);
      setError(err instanceof Error ? err : new Error('Error fetching last 30 sessions'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchScores();
    fetchAllScores(); // Fetch scores from the last 30 sessions
  }, [fetchScores, fetchAllScores]);

  return {
    loading,
    error,
    mentalHealthScores, // Surrounding 7 sessions
    last30DaysScores, // Last 30 sessions
    cbtScores,
    gad7Scores,
    phq9Scores,
    psqiScores,
    pssScores,
    rosenbergScores,
    sfqScores,
    ssrsScores,
  };
};
