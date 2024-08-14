import {useState} from 'react';
import {summaryCollection} from '../firebase/firebaseConfig';
import {query, where, getDocs, orderBy, limit} from 'firebase/firestore';
import { useQuery } from 'react-query';

export const useRecentMentalHealthScores = (userId: string) => {
  const [mentalHealthScores, setMentalHealthScores] = useState<number[]>([]);

  const fetchRecentScores = async () => {

    if (!userId) {
      console.log('User ID is missing.');
      throw new Error('User ID is missing.');
    }

    const q = query(
      summaryCollection,
      where('uid', '==', userId),
      orderBy('time', 'desc'),
      limit(7),
    );

    const querySnapshot = await getDocs(q);
    const scoresArray: number[] = [];

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
  };

  const { data, error, isLoading } = useQuery(
    ['recentScores', userId],
    fetchRecentScores,
    {
      enabled: !userId, // only run if userId exists
      staleTime: 1000 * 60 * 10, // consider data fresh for 10 minutes
      cacheTime: 1000 * 60 * 60, // keep data in cache for 1 hour
    }
  );

  return {loading: isLoading, error, mentalHealthScores: data};
};
