import {useState, useEffect, useCallback} from 'react';
import { useQuery } from 'react-query';
import {summaryCollection} from '../firebase/firebaseConfig';
import {query, where, getDocs} from 'firebase/firestore';
import {SessionBoxesProp, SessionDetailProp} from '../constants';

export const useAllSummaryListener = (userId: string) => {
  const [sessionSummary, setSessionSummary] = useState<SessionDetailProp[]>([]);

  const fetchSessions = async () => {
    if (!userId) {
      console.log('User ID is missing.');
      throw new Error('User ID is missing.');
    }
    
    const q = query(summaryCollection, where('uid', '==', userId)); // can add .orderBy here to sort by time
    const querySnapshot = await getDocs(q);
    const sessionDataArray: any = [];

    querySnapshot.forEach(doc => {
      const sessionData = doc.data();
      sessionDataArray.push(sessionData);
    });

    if (sessionDataArray.length > 0) {
      console.log('Session summaries fetched:', sessionDataArray);
    } else {
      console.log('No sessions found for the given UID.');
    }
    return sessionDataArray
  };

  // useEffect(() => {
  //   fetchSessions();
  // }, [fetchSessions]);

  const { data, error, isLoading } = useQuery(
    ['sessionSummary', userId],
    fetchSessions,
    { enabled: !userId } // only run if userId exists
  );

  return {loading: isLoading, error, sessionSummary: data };
};

export const useRecentSummaryListener = (userId: string) => {
  const [recentSessionSummary, setRecentSessionSummary] = useState<
    SessionBoxesProp[]
  >([]);
  const [recentFeeling, setRecentFeeling] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const fetchRecentSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!userId) {
      setLoading(false);
      console.log('User ID is missing.');
      return;
    }

    try {
      const q = query(summaryCollection, where('uid', '==', userId));
      const querySnapshot = await getDocs(q);
      const sessionDataArray: any = [];

      querySnapshot.forEach(doc => {
        const sessionData = doc.data();
        sessionDataArray.push(sessionData);
      });

      sessionDataArray.sort(
        (a: any, b: any) =>
          new Date(b.time).getTime() - new Date(a.time).getTime(),
      );
      const mostRecentSessions = sessionDataArray.slice(0, 3);
      const mostRecentFeeling = sessionDataArray[0].moodPercentage;

      setRecentFeeling(mostRecentFeeling);

      if (mostRecentSessions.length > 0) {
        console.log('Recent session summaries fetched:', mostRecentSessions);
        setRecentSessionSummary(mostRecentSessions);
      } else {
        console.log('No recent sessions found for the given UID.');
        setRecentSessionSummary([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Error fetching recent sessions'),
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecentSessions();
  }, [fetchRecentSessions]);

  return {loading, error, recentSessionSummary, recentFeeling};
};
