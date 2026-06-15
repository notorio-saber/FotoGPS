import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAvB6LYq7K73M0lzlotaxUexpAV1Ym9ZqE',
  authDomain: 'fotogps-3a54e.firebaseapp.com',
  projectId: 'fotogps-3a54e',
  storageBucket: 'fotogps-3a54e.firebasestorage.app',
  messagingSenderId: '181223241304',
  appId: '1:181223241304:web:effc6004b84a1aae617c2d',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});
