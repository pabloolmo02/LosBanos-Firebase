import { google } from 'googleapis';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURACIÓN ---
// ID de la carpeta "Catalogo_Descargado" en Drive
const CATALOG_FOLDER_ID = '1jS0Jb2DB_446vXBTUFXIOg-K5l7B6DOv';
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

async function syncCatalogImages() {
    console.log("🤖 Autenticando con Google Drive...");
    const drive = google.drive({ version: 'v3', auth });

    try {
        console.log("📂 Explorando estructura del catálogo...");
        
        // 1. Obtener carpetas de categorías (sanitaria, sistemas-concentrados, etc.)
        const categoryFolders = await listFolders(drive, CATALOG_FOLDER_ID);
        console.log(`✅ Encontradas ${categoryFolders.length} categorías`);

        const productImageMap = new Map(); // Mapa: nombre_producto -> URL_imagen

        // 2. Para cada categoría, obtener las carpetas de productos
        for (const category of categoryFolders) {
            console.log(`📁 Procesando categoría: ${category.name}`);
            const productFolders = await listFolders(drive, category.id);
            
            // 3. Para cada producto, buscar principal.jpg
            for (const productFolder of productFolders) {
                const images = await listFiles(drive, productFolder.id, 'principal.jpg');
                if (images.length > 0) {
                    const imageFile = images[0];
                    const directUrl = `https://drive.google.com/thumbnail?id=${imageFile.id}&sz=w1000`;
                    productImageMap.set(productFolder.name, directUrl);
                    console.log(`   ✓ ${productFolder.name} -> imagen encontrada`);
                }
            }
        }

        console.log(`\n📊 Total de imágenes encontradas: ${productImageMap.size}`);
        
        // 4. Actualizar productos en Firestore
        console.log("📥 Descargando catálogo de productos...");
        const productsSnapshot = await db.collection('products').get();
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        let updatedCount = 0;
        let notFoundCount = 0;
        let batch = db.batch();
        let batchCounter = 0;

        for (const [productName, imageUrl] of productImageMap.entries()) {
            // Buscar coincidencia con el nombre del producto
            let cleanName = productName.trim().toLowerCase();
            
            // Intentar varias formas de matching
            let match = products.find(p => p.name.toLowerCase() === cleanName);
            if (!match) match = products.find(p => p.name.toLowerCase().replace(/\s+/g, '') === cleanName.replace(/\s+/g, ''));
            if (!match) match = products.find(p => p.name.toLowerCase().includes(cleanName) || cleanName.includes(p.name.toLowerCase()));

            if (match) {
                const ref = db.collection('products').doc(match.id);
                batch.update(ref, {
                    images: [imageUrl]
                });
                
                console.log(`   ✓ Actualizado: ${match.name}`);
                updatedCount++;
                batchCounter++;

                if (batchCounter >= 400) {
                    await batch.commit();
                    console.log(`   💾 Guardado lote de ${batchCounter} productos...`);
                    batch = db.batch();
                    batchCounter = 0;
                }
            } else {
                console.log(`   ⚠️  No se encontró producto para: ${productName}`);
                notFoundCount++;
            }
        }

        if (batchCounter > 0) {
            await batch.commit();
            console.log(`   💾 Guardado lote final de ${batchCounter} productos...`);
        }

        console.log(`\n✨ ¡Proceso completado!`);
        console.log(`   ✅ Productos actualizados: ${updatedCount}`);
        console.log(`   ⚠️  Productos no encontrados: ${notFoundCount}`);

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error(error);
    }
}

// Función auxiliar para listar carpetas
async function listFolders(drive, parentId) {
    const folders = [];
    let pageToken = null;

    do {
        const res = await drive.files.list({
            q: `'${parentId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
            fields: 'nextPageToken, files(id, name)',
            pageToken: pageToken,
            pageSize: 1000
        });
        if (res.data.files) folders.push(...res.data.files);
        pageToken = res.data.nextPageToken;
    } while (pageToken);

    return folders;
}

// Función auxiliar para listar archivos con un nombre específico
async function listFiles(drive, parentId, fileName) {
    const files = [];
    let pageToken = null;

    do {
        const res = await drive.files.list({
            q: `'${parentId}' in parents and trashed = false and name = '${fileName}' and mimeType contains 'image/'`,
            fields: 'nextPageToken, files(id, name)',
            pageToken: pageToken,
            pageSize: 100
        });
        if (res.data.files) files.push(...res.data.files);
        pageToken = res.data.nextPageToken;
    } while (pageToken);

    return files;
}

syncCatalogImages();