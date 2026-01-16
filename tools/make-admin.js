
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TARGET_EMAIL = process.argv[2]; 

if (!TARGET_EMAIL) {
    console.error("Falta el email");
    process.exit(1);
}

async function makeAdmin() {
    console.log(`Buscando ${TARGET_EMAIL}...`);
    const q = query(collection(db, "users"), where("email", "==", TARGET_EMAIL));
    const snap = await getDocs(q);

    if (snap.empty) {
        console.error("Usuario no encontrado.");
        process.exit(1);
    }

    const userDoc = snap.docs[0];
    await updateDoc(doc(db, "users", userDoc.id), { role: 'admin' });
    console.log(`Usuario ${TARGET_EMAIL} es ahora ADMIN.`);
    process.exit(0);
}

makeAdmin();
