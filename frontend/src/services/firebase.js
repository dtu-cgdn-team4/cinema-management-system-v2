import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

/**
 * Khởi tạo Firebase App và Authentication từ biến môi trường Vite.
 * Chỉ dùng Web SDK cho phía client (browser); không dùng Admin SDK hay secret keys.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'fake-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'localhost',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-cinema',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Hỗ trợ kết nối Firebase Auth Emulator cho môi trường local (mặc định cổng 9099 theo backend/firebase.json)
const emulatorHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST;
if (emulatorHost && !auth.emulatorConfig) {
  try {
    const formattedUrl = emulatorHost.startsWith('http') ? emulatorHost : `http://${emulatorHost}`;
    connectAuthEmulator(auth, formattedUrl, { disableWarnings: true });
  } catch (err) {
    // Tránh lỗi khi Vite Fast Refresh (HMR) re-import file
    if (!/already has been called/i.test(err?.message || '')) {
      console.warn('Lỗi kết nối Firebase Auth Emulator:', err);
    }
  }
}

export { app, auth };
