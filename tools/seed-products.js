
import { initializeApp } from "firebase/app";
import { getFirestore, doc, writeBatch } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper para __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Cargar variables de entorno manualmente desde .env
const envPath = path.resolve(__dirname, '../.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

// 2. Configuración de Firebase con las variables leídas
const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID
};

console.log("Conectando a Firebase Project:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. Importar los productos
// Importamos el archivo products.js dinámicamente
import { getProducts } from '../src/lib/products.js';

const products = getProducts();

async function seedDatabase() {
  console.log(`\n📦 Preparando para migrar ${products.length} productos...`);

  // Firestore permite max 500 operaciones por batch.
  const chunkSize = 400; 
  const chunks = [];
  
  for (let i = 0; i < products.length; i += chunkSize) {
    chunks.push(products.slice(i, i + chunkSize));
  }

  let totalUploaded = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const batch = writeBatch(db);
    
    console.log(`Processing batch ${i + 1}/${chunks.length} (${chunk.length} productos)...`);

    chunk.forEach((product) => {
      // Usamos el ID del producto como ID del documento
      const docRef = doc(db, 'products', String(product.id));
      
      const { id, ...productData } = product;
      
      const dataToUpload = {
          ...productData,
          images: productData.images || ['https://images.unsplash.com/photo-1559223669-e0065fa7f142', 'https://images.unsplash.com/photo-1679104143774-d72d83a2a037'],
          stock: true,
          createdAt: new Date().toISOString()
      };

      batch.set(docRef, dataToUpload, { merge: true });
    });

    try {
      await batch.commit();
      totalUploaded += chunk.length;
      console.log(`✅ Lote ${i + 1} completado.`);
    } catch (error) {
      console.error(`❌ Error en el lote ${i + 1}:`, error);
      process.exit(1);
    }
  }
  
  console.log(`\n✨ ¡Migración Completada! Se han subido ${totalUploaded} productos a Firestore.`);
  process.exit(0);
}

seedDatabase().catch(console.error);
