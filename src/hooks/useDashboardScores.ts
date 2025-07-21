import { useState, useEffect, useCallback } from 'react';
import { summaryCollection } from '../firebase/firebaseConfig';
import { query, where, getDocs, orderBy, limit } from '@react-native-firebase/firestore';

type AllSessionData = {
  sessionId: string;
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
  time: any;
};

export const useDashboardScores = (userId: string) => {
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

      const last30SessionsQuery = query(
        summaryCollection,
        where('uid', '==', userId),
        orderBy('time', 'desc'),
        limit(30)
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

          cbtArray.push(typeof cbtScore === 'string' ? null : cbtScore ?? null);
          gad7Array.push(typeof gad7Score === 'string' ? null : gad7Score ?? null);
          phq9Array.push(typeof phq9Score === 'string' ? null : phq9Score ?? null);
          psqiArray.push(typeof psqiScore === 'string' ? null : psqiScore ?? null);
          pssArray.push(typeof pssScore === 'string' ? null : pssScore ?? null);
          rosenbergArray.push(typeof rosenbergScore === 'string' ? null : rosenbergScore ?? null);
          sfqArray.push(typeof sfqScore === 'string' ? null : sfqScore ?? null);
          ssrsArray.push(typeof ssrsScore === 'string' ? null : ssrsScore ?? null);
        }
      });

      // Reverse arrays to be in chronological order
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
  // Add delay to prevent Firebase connection conflicts
  const timeoutId = setTimeout(() => {
    fetchAllScores();
  }, 600); // 600ms delay

  return () => clearTimeout(timeoutId);
}, [fetchAllScores]);
  return {
    loading,
    error,
    last30DaysScores,
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