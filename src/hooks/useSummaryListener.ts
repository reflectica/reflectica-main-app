import {useState, useEffect, useCallback} from 'react';
import firestore from '@react-native-firebase/firestore'; // Use React Native Firebase directly
import {SessionBoxesProp, SessionDetailProp} from '../constants';

export const useAllSummaryListener = (userId: string) => {
  const [sessionSummary, setSessionSummary] = useState<SessionDetailProp[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      console.log('useAllSummaryListener: User ID is missing');
      return;
    }

    console.log('useAllSummaryListener: Starting fetch for user:', userId);
    setLoading(true);
    setError(null);

    try {
      // Step 1: Test connection to summaries collection
      console.log('🔍 useAllSummaryListener Step 1: Testing connection...');
      const testSnapshot = await firestore().collection('summaries').limit(1).get();
      console.log('✅ Connection successful. Collection size:', testSnapshot.size);

      // Step 2: Get all documents to debug
      console.log('🔍 useAllSummaryListener Step 2: Getting all documents...');
      const allDocsSnapshot = await firestore().collection('summaries').get();
      console.log('📊 Total documents in summaries:', allDocsSnapshot.size);

      if (!allDocsSnapshot.empty) {
        const firstDoc = allDocsSnapshot.docs[0];
        const firstDocData = firstDoc.data();
        console.log('📝 Sample document keys:', Object.keys(firstDocData));
        console.log('📝 Sample uid value:', firstDocData.uid, 'type:', typeof firstDocData.uid);
        
        // Check for matching UIDs
        let foundMatch = false;
        allDocsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.uid === userId) {
            foundMatch = true;
            console.log('✅ Found matching document:', doc.id);
          }
        });
        
        if (!foundMatch) {
          console.log('❌ No documents found with uid:', userId);
          const uniqueUids = new Set();
          allDocsSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.uid) uniqueUids.add(data.uid);
          });
          console.log('📋 Available UIDs:', Array.from(uniqueUids));
        }
      }

      // Step 3: Try filtered query
      console.log('🔍 useAllSummaryListener Step 3: Testing filtered query...');
      const filteredSnapshot = await firestore()
        .collection('summaries')
        .where('uid', '==', userId)
        .get();
      
      console.log('📊 Filtered query results:', filteredSnapshot.size);

      if (filteredSnapshot.empty) {
        console.log('❌ Filtered query returned empty');
        setSessionSummary([]);
        setLoading(false);
        return;
      }

      // Step 4: Try with orderBy
      console.log('🔍 useAllSummaryListener Step 4: Testing with orderBy...');
      const querySnapshot = await firestore()
        .collection('summaries')
        .where('uid', '==', userId)
        .orderBy('time', 'asc')
        .get();

      console.log('📊 Final query results:', querySnapshot.size);

      const sessionDataArray: SessionDetailProp[] = [];

      querySnapshot.forEach((doc) => {
        const sessionData = doc.data();
        console.log('📄 Processing document:', doc.id, 'sessionId:', sessionData.sessionId);
        
        // Convert to proper format if needed
        const convertedSession: SessionDetailProp = {
          sessionId: sessionData.sessionId,
          sessionNumber: sessionDataArray.length + 1,
          mentalHealthScore: sessionData.mentalHealthScore ? parseFloat(sessionData.mentalHealthScore) : 0,
          normalizedScores: sessionData.normalizedScores || {},
          emotions: sessionData.emotions || [],
          shortSummary: sessionData.shortSummary || '',
          longSummary: sessionData.longSummary || '',
        };
        
        sessionDataArray.push(convertedSession);
      });

      if (sessionDataArray.length > 0) {
        console.log(`✅ useAllSummaryListener: Found ${sessionDataArray.length} sessions for user ${userId}`);
        setSessionSummary(sessionDataArray);
      } else {
        console.log('❌ useAllSummaryListener: No sessions found after processing');
        setSessionSummary([]);
      }
    } catch (err) {
      console.error('❌ useAllSummaryListener error:', err);
      setError(err instanceof Error ? err : new Error('Error fetching sessions'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSessions();
    }, 800); // Stagger after other hooks

    return () => clearTimeout(timeoutId);
  }, [fetchSessions]);

  return { loading, error, sessionSummary };
};

export const useRecentSummaryListener = (userId: string) => {
  const [recentSessionSummary, setRecentSessionSummary] = useState<SessionBoxesProp[]>([]);
  const [recentFeeling, setRecentFeeling] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const fetchRecentSessions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      console.log('useRecentSummaryListener: User ID is missing');
      return;
    }

    console.log('useRecentSummaryListener: Starting fetch for user:', userId);
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 useRecentSummaryListener: Fetching recent sessions...');
      
      const querySnapshot = await firestore()
        .collection('summaries')
        .where('uid', '==', userId)
        .orderBy('time', 'desc') // Most recent first
        .limit(3) // Only get 3 most recent
        .get();

      console.log('📊 Recent sessions query results:', querySnapshot.size);

      const sessionDataArray: any = [];
      querySnapshot.forEach(doc => {
        const sessionData = doc.data();
        console.log('📄 Processing recent session:', doc.id);
        sessionDataArray.push(sessionData);
      });

      const mostRecentFeeling = sessionDataArray[0]?.moodPercentage;
      setRecentFeeling(mostRecentFeeling);

      // Convert to SessionBoxesProp format
      const convertedSessions: SessionBoxesProp[] = sessionDataArray.map((session: any, index: number) => ({
        sessionId: session.sessionId,
        shortSummary: session.shortSummary || 'No summary available',
        id: index,
        description: session.shortSummary || session.longSummary || 'No description available',
      }));

      if (convertedSessions.length > 0) {
        console.log('✅ useRecentSummaryListener: Recent session summaries fetched:', convertedSessions.length);
        setRecentSessionSummary(convertedSessions);
      } else {
        console.log('❌ useRecentSummaryListener: No recent sessions found');
        setRecentSessionSummary([]);
      }
    } catch (err) {
      console.error('❌ useRecentSummaryListener error:', err);
      setError(err instanceof Error ? err : new Error('Error fetching recent sessions'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRecentSessions();
    }, 1000); // Stagger after other hooks

    return () => clearTimeout(timeoutId);
  }, [fetchRecentSessions]);

  return {loading, error, recentSessionSummary, recentFeeling};
};