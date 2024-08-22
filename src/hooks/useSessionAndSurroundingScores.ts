import { useState, useEffect, useCallback } from 'react';
import { summaryCollection } from '../firebase/firebaseConfig';
import { query, where, getDocs, orderBy } from 'firebase/firestore';

type SessionData = {
  sessionId: string;
  mentalHealthScore?: string; // Assuming it's stored as a string
  time: any; // Replace with Firestore Timestamp if needed
};

export const useSessionAndSurroundingScores = (userId: string, sessionId: string) => {
  const [mentalHealthScores, setMentalHealthScores] = useState<(number | null)[]>([]);
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

      // Get the previous 6 sessions and include the current session
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
            return NaN; // Return NaN for invalid scores, still included in the array
          }
        } else {
          console.warn('Missing mentalHealthScore for sessionId:', session.sessionId);
          return NaN; // Return NaN for missing scores, still included in the array
        }
      });

      console.log('Final scores array:', scoresArray);
      setMentalHealthScores(scoresArray); // Include NaN values
    } catch (err) {
      console.error('Error fetching scores:', err);
      setError(err instanceof Error ? err : new Error('Error fetching scores'));
    } finally {
      setLoading(false);
    }
  }, [userId, sessionId]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  return { loading, error, mentalHealthScores };
};
