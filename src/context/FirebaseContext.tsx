import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';
import { auth, db, signInWithGoogle as googleSignIn, getCachedAccessToken, setCachedAccessToken } from '../lib/firebase';

interface FirebaseContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  signIn: () => Promise<{ user: User; accessToken: string | null }>;
  signOut: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    setCachedAccessToken(token);
  };

  useEffect(() => {
    // Check connection on boot as mandated in the guidelines
    async function checkFirebaseConnection() {
      try {
        // Just a dummy document read to test the server connectivity
        // Use a safe ref that is guaranteed not to crash
        await getDocFromServer(doc(db, 'test_connection', 'ping'));
      } catch (err: any) {
        if (err?.message?.includes('the client is offline')) {
          console.error("Please check your Firebase configuration or network status.");
        }
      }
    }
    checkFirebaseConnection();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAccessTokenState(getCachedAccessToken());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const res = await googleSignIn();
    setUser(res.user);
    setAccessTokenState(res.accessToken);
    return res;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setAccessTokenState(null);
    setCachedAccessToken(null);
  };

  return (
    <FirebaseContext.Provider value={{ user, accessToken, loading, signIn, signOut, setAccessToken }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
