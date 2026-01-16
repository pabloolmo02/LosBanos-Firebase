
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Cargar credenciales
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-8208320398.json'), 'utf8')
);

const bucketName = 'losbanosdata-1f79f.firebasestorage.app';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: bucketName
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const SHEETS_DIR = path.resolve(__dirname, '../FICHAS TECNICAS');

async function uploadTechnicalSheets() {
  if (!fs.existsSync(SHEETS_DIR)) {
    console.error(`❌ La carpeta ${SHEETS_DIR} no existe.`);
    process.exit(1);
  }

  const files = fs.readdirSync(SHEETS_DIR).filter(file => file.toLowerCase().endsWith('.pdf'));
  console.log(`📂 Encontrados ${files.length} documentos PDF.`);

  // PASO 1: Descargar TODOS los productos de una vez para ahorrar cuota
  console.log("📥 Descargando catálogo de productos (1 operación de lectura)...");
  let allProducts = [];
  try {
      const snapshot = await db.collection('products').get();
      allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`✅ Catálogo cargado: ${allProducts.length} productos en memoria.`);
  } catch (error) {
      console.error("❌ Error descargando catálogo. Posible límite de cuota.", error.message);
      return;
  }

  let successCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;

  for (const file of files) {
    let cleanName = file.replace(/ FT ES\.pdf$/i, '').trim();
    // Normalizar espacios: "BRIXOL T 107" -> "BRIXOL T107"
    let normalizedName = cleanName.replace(/\s+/g, ' ').toLowerCase(); 
    let normalizedNameNoSpaces = cleanName.replace(/\s+/g, '').toLowerCase();

    // console.log(`\n📄 Procesando: "${file}"`);

    // 2. Buscar en memoria (GRATIS, no consume cuota de Firebase)
    let productMatch = allProducts.find(p => p.name.toLowerCase() === normalizedName);

    if (!productMatch) {
        // Intento 2: Sin espacios
        productMatch = allProducts.find(p => p.name.replace(/\s+/g, '').toLowerCase() === normalizedNameNoSpaces);
    }

    if (!productMatch) {
      console.warn(`   ⚠️ NO ENCONTRADO: ${cleanName}`);
      notFoundCount++;
      continue;
    }

    // console.log(`   ✅ Match: ${productMatch.name}`);
    const productId = productMatch.id;

    // 3. Subir archivo
    const filePath = path.join(SHEETS_DIR, file);
    const destination = `technical-sheets/${productId}.pdf`;

    try {
      // Verificar si ya tiene ficha para no resubir si no quieres (opcional)
      // if (productMatch.technicalSheetUrl) { console.log('   ⏭️ Ya tiene ficha. Saltando.'); continue; }

      process.stdout.write(`   ⬆️ Subiendo ${cleanName}... `);
      
      await bucket.upload(filePath, {
        destination: destination,
        metadata: {
          contentType: 'application/pdf',
        },
        public: true,
      });

      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(destination)}?alt=media`;

      // 4. Actualizar Firestore (Esto sí consume 1 escritura)
      await db.collection('products').doc(productId).update({
        technicalSheetUrl: publicUrl,
        hasTechnicalSheet: true
      });

      console.log(`OK.`);
      successCount++;

    } catch (error) {
      console.log(`❌ Error`);
      console.error(error.message);
      if (error.code === 8 || error.message.includes('Quota')) {
          console.error("⛔ DETENIENDO: Límite de cuota alcanzado.");
          break;
      }
      errorCount++;
    }
  }

  console.log("\n--- RESUMEN ---");
  console.log(`✅ Subidos: ${successCount}`);
  console.log(`⚠️ Sin producto: ${notFoundCount}`);
  console.log(`❌ Errores: ${errorCount}`);
}

uploadTechnicalSheets().catch(console.error);
