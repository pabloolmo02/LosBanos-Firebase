
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Polyfills para Node.js
import { XMLHttpRequest } from 'xmlhttprequest';
global.XMLHttpRequest = XMLHttpRequest;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno manualmente
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

console.log("🔥 Conectando a Firebase...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Carpeta donde están los PDFs
const SHEETS_DIR = path.resolve(__dirname, '../FICHAS TECNICAS');

async function uploadTechnicalSheets() {
  if (!fs.existsSync(SHEETS_DIR)) {
    console.error(`❌ La carpeta ${SHEETS_DIR} no existe.`);
    process.exit(1);
  }

  const files = fs.readdirSync(SHEETS_DIR).filter(file => file.toLowerCase().endsWith('.pdf'));
  
  if (files.length === 0) {
    console.log("⚠️ No hay archivos PDF en la carpeta.");
    process.exit(0);
  }

  console.log(`📂 Encontrados ${files.length} documentos PDF. Iniciando proceso...`);

  let successCount = 0;
  let errorCount = 0;
  let notFoundCount = 0;

  for (const file of files) {
    // Limpieza del nombre: Quitar " FT ES.pdf" y espacios extra
    let cleanName = file.replace(/ FT ES\.pdf$/i, '').trim();
    
    // Normalización adicional para mejorar coincidencias (opcional)
    // Ejemplo: Quitar espacios dobles que a veces hay en nombres de archivos
    cleanName = cleanName.replace(/\s+/g, ' ');

    console.log(`\n📄 Procesando archivo: "${file}"`);
    console.log(`   🔍 Buscando producto con nombre: "${cleanName}"`);

    // 1. Buscar producto por NOMBRE EXACTO
    const productsRef = collection(db, "products");
    let q = query(productsRef, where("name", "==", cleanName));
    let querySnapshot = await getDocs(q);

    // Intento 2: Búsqueda insensible a mayúsculas/minúsculas (manual) si falla la exacta
    if (querySnapshot.empty) {
        // Traemos todos y filtramos en memoria (solo si falla la query directa)
        // Nota: Esto no es eficiente para miles de productos, pero para <500 está bien.
        const allProductsSnapshot = await getDocs(productsRef);
        const match = allProductsSnapshot.docs.find(doc => 
            doc.data().name.toLowerCase() === cleanName.toLowerCase() ||
            doc.data().name.replace(/\s+/g, '').toLowerCase() === cleanName.replace(/\s+/g, '').toLowerCase() // Match quitando espacios
        );
        
        if (match) {
            querySnapshot = { empty: false, docs: [match] };
            console.log(`   💡 Encontrado por coincidencia aproximada: "${match.data().name}"`);
        }
    }

    if (querySnapshot.empty) {
      console.warn(`   ⚠️ Producto NO ENCONTRADO en base de datos. Saltando.`);
      notFoundCount++;
      continue;
    }

    const productDoc = querySnapshot.docs[0];
    const productId = productDoc.id;
    const productName = productDoc.data().name;

    console.log(`   ✅ Producto vinculado: ${productName} (ID: ${productId})`);

    // 2. Leer archivo local
    const filePath = path.join(SHEETS_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(fileBuffer);

    // 3. Subir a Firebase Storage
    // Usamos una ruta limpia en Storage: technical-sheets/[ID_PRODUCTO].pdf
    // Esto evita problemas con nombres de archivo largos o con caracteres raros
    const storageRef = ref(storage, `technical-sheets/${productId}.pdf`);
    const metadata = { contentType: 'application/pdf' };

    try {
      console.log(`   ⬆️ Subiendo a Storage...`);
      const snapshot = await uploadBytes(storageRef, uint8Array, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log(`   🔗 URL pública: ${downloadURL}`);

      // 4. Actualizar documento en Firestore
      await updateDoc(doc(db, "products", productId), {
        technicalSheetUrl: downloadURL,
        hasTechnicalSheet: true
      });
      console.log(`   💾 Documento actualizado.`);
      successCount++;

    } catch (error) {
      console.error(`   ❌ Error subiendo archivo:`, error.message);
      errorCount++;
    }
  }

  console.log("\n---------------------------------------------------");
  console.log(`✨ Resumen Final:`);
  console.log(`✅ Subidos correctamente: ${successCount}`);
  console.log(`⚠️ Productos no encontrados: ${notFoundCount}`);
  console.log(`❌ Errores de subida: ${errorCount}`);
  console.log("---------------------------------------------------");
}

uploadTechnicalSheets().catch(console.error);
