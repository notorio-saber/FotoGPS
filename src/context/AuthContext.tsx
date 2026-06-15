import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

async function loadOrCreateProfile(firebaseUser: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  const newProfile: UserProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    nome: firebaseUser.displayName || 'Usuário',
    photoURL: firebaseUser.photoURL || '',
    licenseStatus: 'trial',
    createdAt: Date.now(),
    photoCount: 0,
  };
  await setDoc(userRef, newProfile);
  return newProfile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start redirect check immediately (resolves fast when no redirect pending)
    const redirectPromise = getRedirectResult(auth).catch((err) => {
      console.warn('getRedirectResult:', err?.code);
      return null;
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // When auth says "no user", wait for redirect result before concluding
      // so we don't flash /login during the redirect-back window
      if (!firebaseUser) {
        await redirectPromise;
        // If redirect resolved with a user, onAuthStateChanged fires again below
        // If it resolved with null, the user genuinely isn't logged in
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const p = await loadOrCreateProfile(firebaseUser);
          setProfile(p);
        } catch (err) {
          console.error('Error loading profile:', err);
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            nome: firebaseUser.displayName || 'Usuário',
            photoURL: firebaseUser.photoURL || '',
            licenseStatus: 'trial',
            createdAt: Date.now(),
            photoCount: 0,
          });
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Popup works on all modern browsers (mobile + desktop) when triggered by user gesture.
      // signInWithRedirect is increasingly broken due to 3rd-party cookie restrictions.
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked') {
        // Last resort: redirect for browsers that block all popups (rare in-app browsers)
        await signInWithRedirect(auth, googleProvider);
      } else if (err.code !== 'auth/popup-cancelled-by-user') {
        throw err;
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export { AuthContext };
