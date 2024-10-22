// hooks/useDiagnosticStatus.ts
import { useState, useEffect, useCallback } from 'react';
import { userCollection } from '../firebase/firebaseConfig'; // Adjust the path if necessary
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface DiagnosticStatus {
  isDiagnostic: boolean;
  setIsDiagnostic: (status: boolean) => void;
  loading: boolean;
  error: Error | null;
}

export const useDiagnosticStatus = (userId: string): DiagnosticStatus => {
  const [isDiagnostic, setIsDiagnostic] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDiagnosticStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!userId) {
      setLoading(false);
      setError(new Error('User ID is missing.'));
      return;
    }

    try {
      const userDocRef = doc(userCollection, userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.hasCompletedDiagnostic) {
          setIsDiagnostic(false);
        } else {
          setIsDiagnostic(true);
        }
      } else {
        // If user document doesn't exist, create it with hasCompletedDiagnostic set to false
        await setDoc(userDocRef, { hasCompletedDiagnostic: false });
        setIsDiagnostic(true);
      }
    } catch (err) {
      console.error('Error fetching diagnostic status:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDiagnosticStatus();
  }, [fetchDiagnosticStatus]);

  return { isDiagnostic, setIsDiagnostic, loading, error };
};
