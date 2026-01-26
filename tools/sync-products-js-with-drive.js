
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Importamos el catálogo actual
import { getProducts } from '../src/lib/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IDs de las carpetas de Drive
const FOLDER_ID_FS = '11X15Z_fnyD0XwVIBBlgaHaGxt8RJ5D5v'; // Fichas Seguridad
const FOLDER_ID_FT = '1eY4JkAsbGU1Mgsn1DL2q_wl-oHMB8cxU'; // Fichas Técnicas

// Ruta a la llave de servicio (detectar el nuevo nombre)
const KEY_PATH = path.join(__dirname, 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-f653f6cda0.json');

// Ruta del archivo products.js a sobrescribir
const PRODUCTS_FILE_PATH = path.join(__dirname, '../src/lib/products.js');

async function main() {
    console.log("🚀 Iniciando sincronización con Drive...");

    // 1. Autenticación
    if (!fs.existsSync(KEY_PATH)) {
        console.error("❌ No se encontró el archivo de credenciales en:", KEY_PATH);
        return;
    }
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const drive = google.drive({ version: 'v3', auth });

    // 2. Función helper para listar archivos
    async function getDriveFiles(folderId) {
        console.log(`📂 Leyendo carpeta ${folderId}...`);
        let allFiles = [];
        let pageToken = null;
        do {
            const res = await drive.files.list({
                q: `'${folderId}' in parents and trashed = false`,
                fields: 'nextPageToken, files(id, name, webViewLink, webContentLink)',
                pageToken: pageToken,
                pageSize: 1000
            });
            allFiles = allFiles.concat(res.data.files);
            pageToken = res.data.nextPageToken;
        } while (pageToken);
        return allFiles;
    }

    try {
        // 3. Obtener archivos de ambas carpetas
        const filesFS = await getDriveFiles(FOLDER_ID_FS);
        console.log(`   ✅ Encontradas ${filesFS.length} Fichas de Seguridad (FS).`);

        const filesFT = await getDriveFiles(FOLDER_ID_FT);
        console.log(`   ✅ Encontradas ${filesFT.length} Fichas Técnicas (FT).`);

        // 4. Copia de los productos para modificar
        let products = getProducts();
        let updatedCount = 0;

        // Helper para normalizar nombres para la búsqueda
        const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

        // 5. Procesar Fichas Técnicas (FT)
        filesFT.forEach(file => {
            // Limpieza del nombre del archivo para encontrar coincidencia
            // Ej: "PRODUCTO FT ES.pdf" -> "producto"
            let cleanName = file.name
                .replace(/\.pdf$/i, '')
                .replace(/ FT ES$/i, '')
                .replace(/ FT$/i, '')
                .trim();
            
            const fileKey = normalize(cleanName);

            // Buscar en productos
            const product = products.find(p => normalize(p.name) === fileKey);
            
            if (product) {
                product.technicalSheetUrl = file.webViewLink; // Enlace para ver/descargar en Drive
                updatedCount++;
            }
        });

        // 6. Procesar Fichas de Seguridad (FS)
        filesFS.forEach(file => {
            let cleanName = file.name
                .replace(/\.pdf$/i, '')
                .replace(/ FS ES$/i, '')
                .replace(/ FS$/i, '')
                .trim();
            
            const fileKey = normalize(cleanName);

            const product = products.find(p => normalize(p.name) === fileKey);
            
            if (product) {
                product.safetySheetUrl = file.webViewLink;
                updatedCount++;
            }
        });

        console.log(`✨ Se han actualizado enlaces para ${updatedCount} coincidencias.`);

        // 7. Reescribir el archivo products.js
        const fileContent = `
const products = ${JSON.stringify(products, null, 2)};

export const getProducts = () => {
  return products;
};

export const getProductById = (id) => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category) => {
  if (category === 'all') return products;
  return products.filter(p => p.category === category);
};
`;

        fs.writeFileSync(PRODUCTS_FILE_PATH, fileContent, 'utf8');
        console.log("💾 Archivo src/lib/products.js actualizado correctamente.");

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

main();
