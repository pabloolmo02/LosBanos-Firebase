
import { google } from 'googleapis';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURACIÓN
const FOLDER_ID = '1FGb_axR4MjNk0IylGojARWfmNqVKV0nM';
const ALIMENTARIA_IDS = [
    '401', '402', '403', '404', '405', '406', '407', '408', '409', '410',
    '411', '412', '413', '414', '415', '416', '417', '418', '419', '420',
    '421', '422', '423', '424', '425', '426', '427', '428', '429'
];

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

async function syncNumericImages() {
    console.log("🤖 Conectando con Google Drive...");
    const drive = google.drive({ version: 'v3', auth });

    try {
        console.log("📂 Listando archivos de la carpeta de imágenes...");
        const res = await drive.files.list({
            q: `'${FOLDER_ID}' in parents and trashed = false`,
            fields: 'files(id, name)',
            pageSize: 100
        });

        const files = res.data.files;
        if (!files || files.length === 0) {
            console.error("❌ No se encontraron archivos en la carpeta de Drive.");
            return;
        }

        console.log(`✅ Encontrados ${files.length} archivos.`);

        const batch = db.batch();
        let updateCount = 0;

        // Recorremos los IDs en orden del 1 al 29
        for (let i = 0; i < ALIMENTARIA_IDS.length; i++) {
            const productNumber = i + 1; // 1, 2, 3...
            const productId = ALIMENTARIA_IDS[i];
            
            // Buscar el archivo que empiece por el número (ej: "1.jpg", "1.png", "01.jpg")
            const fileMatch = files.find(f => {
                const nameParts = f.name.split('.');
                const nameWithoutExt = nameParts[0].trim();
                return nameWithoutExt === String(productNumber) || nameWithoutExt === String(productNumber).padStart(2, '0');
            });

            if (fileMatch) {
                // Generar URL de miniatura de alta calidad (1000px)
                const directUrl = `https://drive.google.com/thumbnail?id=${fileMatch.id}&sz=w1000`;
                
                const productRef = db.collection('products').doc(productId);
                batch.update(productRef, {
                    images: [directUrl]
                });

                console.log(`🔗 Vinculado: Imagen "${fileMatch.name}" -> Producto ID ${productId}`);
                updateCount++;
            } else {
                console.warn(`⚠️ No se encontró imagen para el número ${productNumber} (Producto ${productId})`);
            }
        }

        if (updateCount > 0) {
            await batch.commit();
            console.log(`\n✨ ¡Éxito! Se han actualizado ${updateCount} productos de Alimentaria.`);
        } else {
            console.log("\n分 No se realizaron actualizaciones.");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

syncNumericImages();
