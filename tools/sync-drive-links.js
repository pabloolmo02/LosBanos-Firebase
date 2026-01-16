
import { google } from 'googleapis';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ID de TU carpeta de Drive
const FOLDER_ID = '1eY4JkAsbGU1Mgsn1DL2q_wl-oHMB8cxU';

// 1. Cargar credenciales
const keyPath = path.join(__dirname, 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-8208320398.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

// 2. Init Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

// 3. Init Google Drive
const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly'],
});

async function syncDriveFiles() {
    console.log("🤖 Autenticando con Google Drive...");
    const drive = google.drive({ version: 'v3', auth });

    try {
        // 1. Listar archivos de la carpeta
        console.log("📂 Leyendo carpeta de Drive...");
        let allFiles = [];
        let pageToken = null;

        do {
            const res = await drive.files.list({
                q: `'${FOLDER_ID}' in parents and trashed = false and mimeType = 'application/pdf'`,
                fields: 'nextPageToken, files(id, name, webViewLink)',
                pageToken: pageToken,
                pageSize: 1000 // Máximo permitido
            });
            
            const files = res.data.files;
            if (files && files.length > 0) {
                allFiles = allFiles.concat(files);
            }
            pageToken = res.data.nextPageToken;
        } while (pageToken);

        console.log(`✅ Encontrados ${allFiles.length} PDFs en Drive.`);

        if (allFiles.length === 0) {
            console.error("❌ No se encontraron archivos. ¿Seguro que compartiste la carpeta con el email de servicio?");
            console.error(`Email de servicio: ${serviceAccount.client_email}`);
            return;
        }

        // 2. Cargar productos de Firebase (optimizado: 1 lectura)
        console.log("📥 Cargando catálogo de productos...");
        const productsSnapshot = await db.collection('products').get();
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`📦 Catálogo: ${products.length} productos.`);

        let updatedCount = 0;
        let notFoundCount = 0;

        // 3. Cruzar datos
        const batchSize = 400;
        let batch = db.batch();
        let batchCounter = 0;

        for (const file of allFiles) {
            let cleanName = file.name.replace(/ FT ES\.pdf$/i, '').trim();
            let normalizedName = cleanName.replace(/\s+/g, ' ').toLowerCase();
            let normalizedNameNoSpaces = cleanName.replace(/\s+/g, '').toLowerCase();

            // Buscar producto
            let match = products.find(p => p.name.toLowerCase() === normalizedName);
            if (!match) {
                match = products.find(p => p.name.replace(/\s+/g, '').toLowerCase() === normalizedNameNoSpaces);
            }

            if (match) {
                // Añadir a Batch
                const ref = db.collection('products').doc(match.id);
                batch.update(ref, {
                    technicalSheetUrl: file.webViewLink, // Enlace de visor de Drive
                    hasTechnicalSheet: true
                });
                
                // console.log(`   🔗 Vinculado: ${cleanName}`);
                updatedCount++;
                batchCounter++;

                // Ejecutar lote si está lleno
                if (batchCounter >= batchSize) {
                    await batch.commit();
                    console.log(`   💾 Lote de ${batchCounter} guardado.`);
                    batch = db.batch();
                    batchCounter = 0;
                }
            } else {
                // console.warn(`   ⚠️ No match: ${cleanName}`);
                notFoundCount++;
            }
        }

        // Guardar lote final
        if (batchCounter > 0) {
            await batch.commit();
            console.log(`   💾 Lote final de ${batchCounter} guardado.`);
        }

        console.log("\n--- RESUMEN ---");
        console.log(`✅ Vinculados: ${updatedCount}`);
        console.log(`⚠️ Sin producto: ${notFoundCount}`);

    } catch (error) {
        console.error("❌ Error:", error.message);
        if (error.code === 404) {
            console.error("💡 Pista: Verifica que el ID de la carpeta es correcto y está compartida.");
        }
    }
}

syncDriveFiles();
