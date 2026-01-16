
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath = path.join(__dirname, 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-8208320398.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function countProducts() {
    const snapshot = await db.collection('products').count().get();
    console.log(`\n📊 Productos en la base de datos: ${snapshot.data().count}`);
    
    // Opcional: Contar cuántos tienen ficha técnica
    const withFicha = await db.collection('products').where('hasTechnicalSheet', '==', true).count().get();
    console.log(`📑 Con Ficha Técnica: ${withFicha.data().count}`);
}

countProducts();
