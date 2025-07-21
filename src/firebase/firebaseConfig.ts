import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// React Native Firebase doesn't need manual initialization
// It reads from google-services.json (Android) and GoogleService-Info.plist (iOS)
console.log('React Native Firebase configured');

// Export React Native Firebase modules
export { default as auth } from '@react-native-firebase/auth';
export { default as firestore } from '@react-native-firebase/firestore';

// Helper functions for collections
export const getUserCollection = () => firestore().collection('users');
export const getSummaryCollection = () => firestore().collection('summary'); // Changed from 'summaries'

// For backward compatibility
export const userCollection = getUserCollection();
export const summaryCollection = getSummaryCollection();