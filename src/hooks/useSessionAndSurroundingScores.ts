import { useState, useEffect, useCallback } from 'react';
import firestore from '@react-native-firebase/firestore';

export const useSessionAndSurroundingScores = (userId: string, sessionId: string) => {
  const [mentalHealthScores, setMentalHealthScores] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSessionAndSurroundingScores = useCallback(async () => {
    if (!userId || !sessionId) {
      console.log('useSessionAndSurroundingScores: Missing userId or sessionId');
      setLoading(false);
      return;
    }

    console.log('useSessionAndSurroundingScores: Fetching for session:', sessionId);
    setLoading(true);
    setError(null);

    try {
      // Get all sessions for the user, ordered by time
      const querySnapshot = await firestore()
        .collection('summaries') // Use correct collection name
        .where('uid', '==', userId)
        .orderBy('time', 'desc')
        .get();

      if (querySnapshot.empty) {
        console.log('useSessionAndSurroundingScores: No sessions found');
        setLoading(false);
        return;
      }

      const allSessions: any[] = [];
      querySnapshot.forEach((doc) => {
        const sessionData = doc.data();
        allSessions.push({ id: doc.id, ...sessionData });
      });

      // Find the index of the target session
      const targetSessionIndex = allSessions.findIndex(
        session => session.sessionId === sessionId
      );

      if (targetSessionIndex === -1) {
        console.log('useSessionAndSurroundingScores: Target session not found');
        setError(new Error('Session not found'));
        setLoading(false);
        return;
      }

      // Get surrounding sessions (e.g., 3 before + target + 3 after = 7 total)
      const surroundingRange = 3;
      const startIndex = Math.max(0, targetSessionIndex - surroundingRange);
      const endIndex = Math.min(allSessions.length, targetSessionIndex + surroundingRange + 1);
      
      const surroundingSessions = allSessions.slice(startIndex, endIndex);

      // Extract mental health scores
      const scores: number[] = [];
      surroundingSessions.forEach(session => {
        if (session.mentalHealthScore) {
          const score = parseFloat(session.mentalHealthScore);
          if (!isNaN(score)) {
            scores.push(score);
          }
        }
      });

      // Reverse to get chronological order (oldest to newest)
      setMentalHealthScores(scores.reverse());
      console.log(`useSessionAndSurroundingScores: Found ${scores.length} surrounding scores`);

    } catch (err) {
      console.error('useSessionAndSurroundingScores: Error:', err);
      setError(err instanceof Error ? err : new Error('Error fetching session scores'));
    } finally {
      setLoading(false);
    }
  }, [userId, sessionId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSessionAndSurroundingScores();
    }, 600); // Stagger after other hooks

    return () => clearTimeout(timeoutId);
  }, [fetchSessionAndSurroundingScores]);

  return {
    mentalHealthScores,
    loading,
    error,
  };
};