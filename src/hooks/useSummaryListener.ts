import {useState, useEffect, useCallback} from 'react';
import {summaryCollection} from '../firebase/firebaseConfig';
import {query, where, getDocs} from 'firebase/firestore';

export const useAllSummaryListener = (userId: string) => {
  const [sessionSummary, setSessionSummary] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!userId) {
      setLoading(false);
      console.log('User ID is missing.');
      return;
    }

    try {
      // can add .orderBy here to sort by time
      const q = query(summaryCollection, where('uid', '==', userId));
      const querySnapshot = await getDocs(q);

      const sessionDataArray = [];

      querySnapshot.forEach(doc => {
        const sessionData = doc.data();
        sessionDataArray.push(sessionData);
      });

      if (sessionDataArray.length > 0) {
        console.log('Session summaries fetched:', sessionDataArray);
        setSessionSummary(sessionDataArray);
      } else {
        console.log('No sessions found for the given UID.');
        setSessionSummary([]);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error('Error fetching sessions'),
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {loading, error, sessionSummary};
};

export const useRecentSummaryListener = (userId: string) => {
  const [recentSessionSummary, setRecentSessionSummary] = useState([]);
  const [recentFeeling, setRecentFeeling] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const sessionDataArray = [];

      querySnapshot.forEach(doc => {
        const sessionData = doc.data();
        sessionDataArray.push(sessionData);
      });

      sessionDataArray.sort((a, b) => new Date(b.time) - new Date(a.time));
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
    } catch (error) {
      setError(
        error instanceof Error
          ? error
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
