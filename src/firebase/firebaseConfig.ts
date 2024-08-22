import { initializeApp } from 'firebase/app';
import { collection, getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import Config from "react-native-config";


const firebaseConfig = { 
  apiKey: Config.FIREBASE_API_KEY,
  authDomain: Config.FIREBASE_AUTH_DOMAIN,
  databaseURL: Config.FIREBASE_DATABASE_URL,
  projectId: Config.FIREBASE_PROJECT_ID,
  storageBucket: Config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID,
  appId: Config.FIREBASE_APP_ID,};

const app = initializeApp(firebaseConfig);
console.log('Firebase initialized');
initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const fbAuth = getAuth(app);
const db = getFirestore(app);

const userCollection = collection(db, 'users');
const summaryCollection = collection(db, 'summaries');

export { app, fbAuth, db, userCollection, summaryCollection };
