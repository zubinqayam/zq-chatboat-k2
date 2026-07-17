/**
 * Firebase client configuration loader.
 *
 * Values are read from Vite public env vars (VITE_ prefix) so they are
 * available in browser bundles via import.meta.env.  These are standard
 * Firebase web-SDK client identifiers that are safe to expose publicly.
 *
 * Set them in a local `.env.local` file (never committed) during development.
 * See `.env.example` for the full list of required and optional variables.
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  /** Optional: custom Firestore database ID (leave unset to use the default database). */
  firestoreDatabaseId?: string;
  /** Optional: Google Analytics measurement ID. */
  measurementId?: string;
  /** Optional: Google OAuth client ID used for additional scopes in signInWithPopup. */
  googleOAuthClientId?: string;
  /** Optional: reCAPTCHA v3 site key for Firebase App Check. */
  recaptchaSiteKey?: string;
}

const REQUIRED_KEYS: (keyof FirebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

/**
 * Loads and validates the Firebase client configuration from Vite env vars.
 * Throws a descriptive error listing every missing required variable.
 */
export function loadFirebaseConfig(): FirebaseConfig {
  const config: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
    firestoreDatabaseId: import.meta.env.VITE_FIRESTORE_DATABASE_ID || undefined,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
    googleOAuthClientId: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || undefined,
    recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || undefined,
  };

  const missing = REQUIRED_KEYS.filter((key) => !config[key]);

  if (missing.length > 0) {
    const envVarNames = missing.map((key) => {
      const map: Record<string, string> = {
        apiKey: 'VITE_FIREBASE_API_KEY',
        authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
        projectId: 'VITE_FIREBASE_PROJECT_ID',
        storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
        messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
        appId: 'VITE_FIREBASE_APP_ID',
      };
      return map[key] ?? key;
    });
    throw new Error(
      `Firebase configuration is incomplete. Add the following to your .env.local file:\n` +
        envVarNames.map((v) => `  ${v}=`).join('\n'),
    );
  }

  return config;
}

export const firebaseConfig = loadFirebaseConfig();
