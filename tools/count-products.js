
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Buscar el archivo de credenciales
const files = fs.readdirSync(__dirname);
const keyFile = files.find(f => f.startsWith('losbanosdata-1f79f-firebase-adminsdk') && f.endsWith('.json'));

if (!keyFile) {
    console.error('❌ Error: No se encontró el archivo de credenciales de Firebase.');
    process.exit(1);
}

const keyPath = path.join(__dirname, keyFile);
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
