
import { google } from 'googleapis';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURACIÓN ---
// 1. Crea una carpeta en Drive, sube las imágenes (JPG/PNG)
// 2. Compártela con: firebase-adminsdk-fbsvc@losbanosdata-1f79f.iam.gserviceaccount.com (Lector)
// 3. Pega el ID de la carpeta aquí abajo:
const FOLDER_ID = 'PEGA_AQUI_EL_ID_DE_LA_CARPETA_DE_IMAGENES'; 
// ---------------------

const keyPath = path.join(__dirname, 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-8208320398.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

async function syncDriveImages() {
    if (FOLDER_ID === 'PEGA_AQUI_EL_ID_DE_LA_CARPETA_DE_IMAGENES') {
        console.error("❌ Error: Debes poner el ID de tu carpeta de imágenes de Drive en el script.");
        return;
    }

    console.log("🤖 Autenticando con Google Drive...");
    const drive = google.drive({ version: 'v3', auth });

    try {
        console.log("📂 Leyendo carpeta de imágenes en Drive...");
        let allFiles = [];
        let pageToken = null;

        do {
            const res = await drive.files.list({
                q: `'${FOLDER_ID}' in parents and trashed = false and (mimeType contains 'image/')`,
                fields: 'nextPageToken, files(id, name, webContentLink, thumbnailLink)',
                pageToken: pageToken,
                pageSize: 1000
            });
            if (res.data.files) allFiles = allFiles.concat(res.data.files);
            pageToken = res.data.nextPageToken;
        } while (pageToken);

        console.log(`✅ Encontradas ${allFiles.length} imágenes.`);

        console.log("📥 Descargando catálogo...");
        const productsSnapshot = await db.collection('products').get();
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        let updatedCount = 0;
        let batch = db.batch();
        let batchCounter = 0;

        for (const file of allFiles) {
            // Limpieza nombre: "ACELEX.jpg" -> "acelex"
            let cleanName = file.name.split('.')[0].trim().toLowerCase().replace(/\s+/g, ' ');
            let cleanNameNoSpaces = cleanName.replace(/\s+/g, '');

            // Buscar producto
            let match = products.find(p => p.name.toLowerCase() === cleanName);
            if (!match) match = products.find(p => p.name.toLowerCase().replace(/\s+/g, '') === cleanNameNoSpaces);

            if (match) {
                // Truco para URL directa de imagen en Drive que funcione en <img>
                // thumbnailLink suele ser más fiable para webs, quitando el tamaño "=s220"
                // O usamos: https://drive.google.com/uc?export=view&id=ID
                const directUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`; // sz=w1000 pide ancho 1000px

                const ref = db.collection('products').doc(match.id);
                batch.update(ref, {
                    images: [directUrl] // Reemplaza la imagen actual
                });
                
                updatedCount++;
                batchCounter++;

                if (batchCounter >= 400) {
                    await batch.commit();
                    console.log(`   💾 Guardado lote...`);
                    batch = db.batch();
                    batchCounter = 0;
                }
            }
        }

        if (batchCounter > 0) await batch.commit();

        console.log(`\n✨ ¡Listo! Se han actualizado ${updatedCount} productos con fotos de Drive.`);

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

syncDriveImages();
