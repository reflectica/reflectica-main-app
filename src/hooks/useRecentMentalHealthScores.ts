import {useState, useEffect, useCallback} from 'react';
import {summaryCollection} from '../firebase/firebaseConfig';
import {query, where, getDocs, orderBy, limit} from 'firebase/firestore';

export const useRecentMentalHealthScores = (userId: string) => {
  const [mentalHealthScores, setMentalHealthScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecentScores = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!userId) {
      setLoading(false);
      console.log('User ID is missing.');
      return;
    }

    try {
      const q = query(
        summaryCollection,
        where('uid', '==', userId),
        orderBy('time', 'desc'),
        limit(7),
      );

      const querySnapshot = await getDocs(q);
      const scoresArray = [];

      querySnapshot.forEach(doc => {
        const sessionData = doc.data();
        if (sessionData.mentalHealthScore) {
          scoresArray.push(parseFloat(sessionData.mentalHealthScore));
        }
      });

      if (scoresArray.length > 0) {
        console.log('Mental health scores fetched:', scoresArray);
        setMentalHealthScores(scoresArray.reverse()); // Reverse to get chronological order
      } else {
        console.log('No sessions found for the given UID.');
        setMentalHealthScores([]);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error('Error fetching scores'),
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecentScores();
  }, [fetchRecentScores]);

  return {loading, error, mentalHealthScores};
};
