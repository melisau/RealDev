# RealDev account sign-in

RealDev supports email/password registration and sign-in through Firebase Authentication. The browser uses Firebase's public web configuration and the Worker checks each ID token against Google's Identity Toolkit `accounts:lookup` endpoint before accepting account-scoped API requests.

Configure these Site runtime environment variables after creating a Firebase project and enabling **Authentication → Email/Password**:

- `FIREBASE_PROJECT_ID`: the Firebase project ID.
- `FIREBASE_API_KEY`: the Firebase Web API key. This is a public client identifier, not a password; restrict it to the Firebase APIs and the exact production/preview web domains in Google Cloud Console.

Set the Firebase Authentication authorized domain to the exact Site hostname. Do not add service-account credentials or private keys to the browser or Site. The auth page keeps the session in tab-scoped storage and sends the Firebase ID token to the same-origin Worker API; the Worker validates the token with Google before mapping it to a namespaced account. Anonymous API access remains denied. Existing Site-platform accounts are not silently linked to Firebase accounts.

The Site remains owner-private until Firebase settings and registration/login are verified. RealDev data deletion removes learning records only; it does not delete the Firebase identity.
