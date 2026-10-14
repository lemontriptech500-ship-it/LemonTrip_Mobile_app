// Local previews use the deployed app backend unless explicitly overridden.
// Keep dot notation so Expo can inline this public environment variable.
export const APP_API_URL = (process.env.EXPO_PUBLIC_API_URL?.trim() || 'https://lemontripapp-backend.onrender.com').replace(/\/+$/, '');
