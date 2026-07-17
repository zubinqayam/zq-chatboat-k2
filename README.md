<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bfbd7e22-68c0-4ddf-8a35-4a00da186def

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```sh
   npm install
   ```

2. Create a `.env.local` file from the example template:
   ```sh
   cp .env.example .env.local
   ```

3. Fill in the required values in `.env.local`:

   | Variable | Description |
   |---|---|
   | `GEMINI_API_KEY` | Your Gemini API key (from [Google AI Studio](https://aistudio.google.com/)) |
   | `VITE_FIREBASE_API_KEY` | Firebase project API key |
   | `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain (e.g. `your-project.firebaseapp.com`) |
   | `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
   | `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
   | `VITE_FIREBASE_APP_ID` | Firebase app ID |

   Find these values in the [Firebase console](https://console.firebase.google.com/) under **Project settings → Your apps → SDK setup and configuration**.

   Optional variables (`VITE_FIRESTORE_DATABASE_ID`, `VITE_FIREBASE_MEASUREMENT_ID`, `VITE_GOOGLE_OAUTH_CLIENT_ID`, `VITE_RECAPTCHA_SITE_KEY`) can be left blank or omitted if not needed.

4. Run the app:
   ```sh
   npm run dev
   ```

> **Note:** `.env.local` is git-ignored and should never be committed. All `VITE_*` variables are public client-side values (safe to expose in browser bundles); do not put server secrets there.
