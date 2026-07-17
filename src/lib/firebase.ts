import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore pointing to the designated database instance
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure the Google Auth Provider with requested Workspace scopes
googleProvider.addScope('https://www.googleapis.com/auth/tasks');
googleProvider.addScope('https://www.googleapis.com/auth/drive');
googleProvider.addScope('https://www.googleapis.com/auth/documents');
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');

let cachedAccessToken: string | null = null;

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || null;
    if (accessToken) {
      cachedAccessToken = accessToken;
    }
    return { user: result.user, accessToken };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export function getCachedAccessToken() {
  return cachedAccessToken;
}

export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;
}


// Mandatory custom error handling for Firestore Permission Denied issues
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Info:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
