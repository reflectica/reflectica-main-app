import { useState, useEffect, useCallback } from 'react';
import { summaryCollection } from '../firebase/firebaseConfig'; // Adjust path as needed
import { query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface Emotion {
    label: string;
    score: number | null;
  }

interface SessionData {
  emotions?: Emotion[] | 'unavailable'; // Emotions array or 'unavailable' string
  time: any; // Firestore Timestamp or other time representation
  sessionId: string; // Session ID or other unique identifier
}

export const useEmotionsAboveThreshold = (userId: string, threshold: number = 0.1) => {
  const [emotionsAboveThreshold, setEmotionsAboveThreshold] = useState<Emotion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmotions = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!userId) {
      setLoading(false);
      console.log('User ID is missing.');
      return;
    }

    try {
      console.log('Fetching emotions for user:', userId);

      // Fetch the last 30 sessions for the user
      const last30SessionsQuery = query(
        summaryCollection,
        where('uid', '==', userId),
        orderBy('time', 'desc'),
        limit(30) // Limit to the last 30 sessions
      );

      const last30SessionsSnapshot = await getDocs(last30SessionsQuery);

      const filteredEmotions: Emotion[] = [];

      last30SessionsSnapshot.forEach((doc) => {
        const sessionData = doc.data() as SessionData;

        // Check if the session contains emotions and emotions is an array
        if (sessionData.emotions && Array.isArray(sessionData.emotions)) {
          // Filter emotions by score above the threshold
          const sessionEmotionsAboveThreshold = sessionData.emotions.filter(
            (emotion) => emotion.score !== null && emotion.score > threshold
          );

          // Add filtered emotions to the array
          filteredEmotions.push(...sessionEmotionsAboveThreshold);
        } else {
          // Emotions are unavailable or invalid
          console.log(`Emotions unavailable for session ${sessionData.sessionId}`);
        }
      });

      // Log emotions fetched for debugging

      // Set the state with the filtered emotions
      setEmotionsAboveThreshold(filteredEmotions);
    } catch (err) {
      console.error('Error fetching emotions:', err);
      setError(err instanceof Error ? err : new Error('Error fetching emotions'));
    } finally {
      setLoading(false);
    }
  }, [userId, threshold]);

  useEffect(() => {
    fetchEmotions();
  }, [fetchEmotions]);

  return { emotionsAboveThreshold, loading, error };
};
