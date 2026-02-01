
import { google } from 'googleapis';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURACIÓN DE CARPETAS Y RANGOS DE IDS ---
const CONFIG = [
    {
        category: 'lavanderia-profesional',
        folderId: '1VRNWPaop-Et16Edi-imXd-fwpjxLwB1N',
        idStart: 301,
        idEnd: 335
    },
    {
        category: 'automocion',
        folderId: '1e69hgvzhA6en64XChKnqHM4RDIYyL4iR',
        idStart: 501,
        idEnd: 553
    },
    {
        category: 'sanitaria',
        folderId: '1D-IJvIblrBw2_GN0nLRSqJc6U1fc_IYq',
        idStart: 601,
        idEnd: 607
    },
    {
        category: 'industria-construccion',
        folderId: '1X3j-UWIYPFVUpUM3LatVjx56ZIgJwEdk',
        idStart: 701,
        idEnd: 729
    },
    {
        category: 'piscinas',
        folderId: '1ABqJrqV3LL66IGK6eSja_WnO0vKMDILV',
        idStart: 801,
        idEnd: 816
    },
    {
        category: 'sistemas-concentrados',
        folderId: '1dDcW_mELA0QVLLlW1BIPL-h9xo4cA0CM',
        idStart: 901,
        idEnd: 940
    }
];

// Buscar el archivo de credenciales de Firebase (cualquier archivo que coincida con el patrón)
const files = fs.readdirSync(__dirname);
const keyFile = files.find(f => f.startsWith('losbanosdata-1f79f-firebase-adminsdk') && f.endsWith('.json'));

if (!keyFile) {
    console.error('❌ Error: No se encontró el archivo de credenciales de Firebase.');
    console.error('Busca un archivo que empiece con "losbanosdata-1f79f-firebase-adminsdk" en la carpeta tools/');
    process.exit(1);
}

const keyPath = path.join(__dirname, keyFile);
console.log(`🔑 Usando credenciales: ${keyFile}\n`);
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
const drive = google.drive({ version: 'v3', auth });

/**
 * Busca "principal.jpg" dentro de una carpeta específica
 */
async function findPrincipalImage(folderId) {
    try {
        const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false and name = 'principal.jpg'`,
            fields: 'files(id, name)',
            pageSize: 1
        });
        
        if (res.data.files && res.data.files.length > 0) {
            return res.data.files[0];
        }
        return null;
    } catch (error) {
        console.error(`Error buscando principal.jpg en carpeta ${folderId}:`, error.message);
        return null;
    }
}

/**
 * Lista las subcarpetas de una carpeta padre
 */
async function listSubfolders(parentFolderId) {
    try {
        const res = await drive.files.list({
            q: `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            fields: 'files(id, name)',
            pageSize: 100
        });
        return res.data.files || [];
    } catch (error) {
        console.error(`Error listando subcarpetas:`, error.message);
        return [];
    }
}

/**
 * Busca un producto por nombre en la categoría especificada
 */
async function findProductByName(productName, category) {
    try {
        // Normalizar el nombre (mayúsculas, trim)
        const normalizedName = productName.trim().toUpperCase();
        
        // Buscar en Firestore
        const snapshot = await db.collection('products')
            .where('category', '==', category)
            .where('name', '==', normalizedName)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            return null;
        }
        
        return snapshot.docs[0].id; // Retornar el ID del producto
    } catch (error) {
        console.error(`Error buscando producto "${productName}":`, error.message);
        return null;
    }
}

async function syncCategoryBySubfolders() {
    console.log("🚀 Iniciando sincronización de imágenes por subcarpetas...\n");

    for (const config of CONFIG) {
        console.log(`-----------------------------------------`);
        console.log(`📂 Categoría: ${config.category.toUpperCase()}`);
        console.log(`📂 Carpeta Drive ID: ${config.folderId}`);

        try {
            // 1. Listar todas las subcarpetas
            const subfolders = await listSubfolders(config.folderId);
            console.log(`✅ Encontradas ${subfolders.length} subcarpetas`);

            if (subfolders.length === 0) {
                console.warn(`⚠️ No se encontraron subcarpetas en esta categoría`);
                continue;
            }

            const batch = db.batch();
            let updateCount = 0;
            let notFoundCount = 0;

            // 2. Para cada subcarpeta, buscar "principal.jpg"
            for (const subfolder of subfolders) {
                // Buscar el producto por nombre en Firebase
                const productId = await findProductByName(subfolder.name, config.category);
                
                if (!productId) {
                    console.warn(`⚠️ No se encontró producto con nombre: "${subfolder.name}"`);
                    notFoundCount++;
                    continue;
                }

                // Buscar "principal.jpg" dentro de esta subcarpeta
                const principalImage = await findPrincipalImage(subfolder.id);

                if (principalImage) {
                    // Generar URL de thumbnail
                    const imageUrl = `https://drive.google.com/thumbnail?id=${principalImage.id}&sz=w1000`;
                    
                    // Actualizar en Firebase
                    const productRef = db.collection('products').doc(productId);
                    batch.update(productRef, {
                        images: [imageUrl]
                    });

                    console.log(`✅ ${productId}: "${subfolder.name}" -> principal.jpg encontrado`);
                    updateCount++;
                } else {
                    console.warn(`❌ ${productId}: "${subfolder.name}" -> principal.jpg NO encontrado`);
                    notFoundCount++;
                }
            }

            // 3. Commit del batch
            if (updateCount > 0) {
                await batch.commit();
                console.log(`\n✨ ${config.category}: ${updateCount} productos actualizados`);
            }
            
            if (notFoundCount > 0) {
                console.log(`⚠️ ${config.category}: ${notFoundCount} productos sin imagen`);
            }

        } catch (error) {
            console.error(`❌ Error procesando ${config.category}:`, error.message);
        }

        console.log(''); // Línea en blanco entre categorías
    }

    console.log(`\n✅ Proceso completo.`);
}

syncCategoryBySubfolders();
