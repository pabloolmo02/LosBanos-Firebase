
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. IMPORTAR PRODUCTOS LOCALES
import { getProducts } from '../src/lib/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURACIÓN ---
// Archivo de credenciales
const KEY_FILENAME = 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-f653f6cda0.json';
const KEY_PATH = path.join(__dirname, KEY_FILENAME);

const PRODUCTS_FILE_PATH = path.join(__dirname, '../src/lib/products.js');

// Configuración de Carpetas de Drive
const CATEGORY_MAP = [
    {
        category: 'sistemas-concentrados',
        folderId: '1xpsA43_H7-ik_Dh-lpbYuD1NEeci21FI',
        productIds: [
            // EcoConnect
            '901', '902', '903', 
            // EcoSave
            '904', '905', '906', 
            // Quimbox System
            '907', 
            // Gama ED
            '908', '909', '910', '911', '912', '913', '914', '915', '916', '917', '918', '919',
            // Gama Capxel
            '920', '921', '922', '923', '924', '925', '926', '927', '928', '929', '930', '931',
            // Gama Quimbox Products
            '932', '933', '934', '935', '936', '937', '938', '939', '940'
        ]
    }
];

async function main() {
    console.log("🚀 Iniciando sincronización de IMÁGENES CONCENTRADOS...");

    // Verificar credenciales
    if (!fs.existsSync(KEY_PATH)) {
        console.error(`❌ ERROR: No encuentro el archivo de clave: ${KEY_FILENAME}`);
        return;
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const drive = google.drive({ version: 'v3', auth });

    // Copia de los productos actuales
    let products = getProducts();
    let totalUpdated = 0;

    for (const config of CATEGORY_MAP) {
        console.log(`\n📂 Procesando categoría: ${config.category} (Folder: ${config.folderId})`);
        
        try {
            // Listar archivos de la carpeta
            let allFiles = [];
            let pageToken = null;
            do {
                const res = await drive.files.list({
                    q: `'${config.folderId}' in parents and trashed = false`,
                    fields: 'nextPageToken, files(id, name)',
                    pageToken: pageToken,
                    pageSize: 1000
                });
                allFiles = allFiles.concat(res.data.files);
                pageToken = res.data.nextPageToken;
            } while (pageToken);

            console.log(`   ✅ Encontrados ${allFiles.length} archivos en Drive.`);

            // Asignar imágenes por número
            config.productIds.forEach((prodId, index) => {
                const productNumber = index + 1;
                
                // Buscar archivo que se llame igual al número (ej: "1.jpg", "01.png")
                // Ignoramos la extensión para la comparación
                const fileMatch = allFiles.find(f => {
                    const name = f.name.split('.')[0].trim();
                    return parseInt(name) === productNumber;
                });

                if (fileMatch) {
                    // Encontrar el producto en el array local
                    const productIndex = products.findIndex(p => p.id === prodId);
                    if (productIndex !== -1) {
                        const imageUrl = `https://drive.google.com/thumbnail?id=${fileMatch.id}&sz=w1000`;
                        products[productIndex].images = [imageUrl];
                        totalUpdated++;
                        // console.log(`      📸 Asignada imagen ${fileMatch.name} al producto ${products[productIndex].name}`);
                    }
                }
            });

        } catch (error) {
            console.error(`❌ Error leyendo Drive para ${config.category}:`, error.message);
        }
    }

    console.log(`\n✨ Total imágenes actualizadas: ${totalUpdated}`);

    // Guardar en archivo
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
    console.log("💾 Archivo src/lib/products.js sobrescrito con los nuevos enlaces.");
}

main();
