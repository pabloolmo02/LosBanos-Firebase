
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validación básica para evitar crash si faltan variables
const isFirebaseConfigured = firebaseConfig.apiKey && 
                              firebaseConfig.authDomain && 
                              firebaseConfig.projectId;

let app = null;
let db = null;
let auth = null;
let storage = null;

if (!isFirebaseConfigured) {
    console.warn("⚠️ Firebase no está configurado. Verifica que exista un archivo .env con las variables VITE_FIREBASE_*");
    console.warn("La aplicación continuará funcionando con funcionalidad limitada.");
} else {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);
        console.log("✅ Firebase inicializado correctamente");
    } catch (error) {
        console.error("❌ Error inicializando Firebase:", error);
        console.error("La aplicación continuará funcionando con funcionalidad limitada.");
    }
}

export { app, db, auth, storage };
export default app;
