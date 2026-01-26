
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURACIÓN ---
const DRIVE_FOLDER_ID = '15K95l7NN5BhOXLKWetGVHCAipeZg1vy_';
const KEY_FILENAME = 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-f653f6cda0.json';
const KEY_PATH = path.join(__dirname, KEY_FILENAME);

const PRODUCTS_JS_PATH = path.join(__dirname, '../src/lib/products.js');
const INFO_JS_PATH = path.join(__dirname, '../public/products_long_description.js');

// --- HELPERS ---

function getProductsFromJs(content) {
    const match = content.match(/const products = ([\s\S]*?);/);
    if (!match) return null;
    try {
        return new Function(`return ${match[1]}`)();
    } catch (e) {
        console.error("Error parsing products array:", e);
        return null;
    }
}

function getInfoFromJs(content) {
    // Limpiar comentarios y espacios extra
    const cleaned = content.replace(/\/\/[^\n]*/g, '').trim();
    try {
        return new Function(`return ${cleaned}`)();
    } catch (e) {
        console.error("Error parsing info array:", e);
        return null;
    }
}

async function getDriveImages(auth) {
    const drive = google.drive({ version: 'v3', auth });
    let allFiles = [];
    let pageToken = null;

    do {
        const res = await drive.files.list({
            q: `'${DRIVE_FOLDER_ID}' in parents and trashed = false`,
            fields: 'nextPageToken, files(id, name)',
            pageToken: pageToken,
            pageSize: 1000
        });
        if (res.data.files) {
            allFiles = allFiles.concat(res.data.files);
        }
        pageToken = res.data.nextPageToken;
    } while (pageToken);

    // Ordenar numéricamente por nombre (asumiendo "1.jpg", "2.jpg", etc.)
    return allFiles.sort((a, b) => {
        const numA = parseInt(a.name.split('.')[0]);
        const numB = parseInt(b.name.split('.')[0]);
        return numA - numB;
    });
}

function formatProductsFile(products) {
    const productsString = JSON.stringify(products, null, 2);
    return `const products = ${productsString};

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
}

// --- MAIN ---

async function sync() {
    console.log("🚀 Iniciando sincronización completa de Lavandería...");

    // 1. Auth Drive
    if (!fs.existsSync(KEY_PATH)) {
        console.error(`❌ ERROR: No encuentro la clave: ${KEY_FILENAME}`);
        return;
    }
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    // 2. Obtener imágenes ordenadas
    console.log("📂 Leyendo imágenes de Drive...");
    const allImages = await getDriveImages(auth);
    console.log(`✅ ${allImages.length} imágenes encontradas.`);

    // 3. Leer archivos locales
    const productsContent = fs.readFileSync(PRODUCTS_JS_PATH, 'utf8');
    const infoContent = fs.readFileSync(INFO_JS_PATH, 'utf8');

    const products = getProductsFromJs(productsContent);
    const lavanderiaInfoList = getInfoFromJs(infoContent);

    if (!products || !lavanderiaInfoList) {
        console.error("❌ Error leyendo archivos JS locales.");
        return;
    }

    // 4. Cruzar datos
    let updatedCount = 0;
    
    // Convertir array de info a mapa para búsqueda rápida por referencia
    // Pero como el usuario dijo "mismo orden", iteraremos por el array de info
    // y asumiremos que el orden de las imágenes coincide con el orden de este array.
    
    // Primero, mapa de productos existentes por ID o Referencia para actualizar
    const productsMap = new Map(products.map(p => [p.reference, p]));

    lavanderiaInfoList.forEach((info, index) => {
        const product = productsMap.get(info.reference);
        
        if (product) {
            // A. Actualizar Info
            product.long_description = info.long_description || "";
            product.ph = info.ph || "";
            product.usage = info.usage || product.usage; // Mantener si no hay nuevo
            // product.description = info.description; // Opcional, si queremos sobreescribir la corta

            // Actualizar Variantes (Formatos)
            if (info.formats) {
                const formatList = info.formats.split(';').map(s => s.trim());
                // Crear variantes preservando el precio base si no se especifica otro
                product.variants = formatList.map((fmt, vIndex) => ({
                    id: `${product.id}_v${vIndex}`,
                    format: fmt,
                    price: product.price, // Asumimos precio base por ahora, usuario no especificó precios por formato aquí
                    originalName: product.name
                }));
            }

            // B. Actualizar Imagen desde Drive (usando el índice del array de info)
            // El usuario dijo: "imagenes enumeradas en el mismo orden que products_long_description.js"
            // Por tanto: lavanderiaInfoList[0] -> allImages[0] ("1.jpg")
            
            if (index < allImages.length) {
                const imgFile = allImages[index];
                const directUrl = `https://drive.google.com/thumbnail?id=${imgFile.id}&sz=w1000`;
                product.images = [directUrl];
                // console.log(`   📸 Imagen asignada a ${product.name}: ${imgFile.name}`);
            } else {
                console.warn(`   ⚠️ No hay imagen para el índice ${index} (${product.name})`);
            }

            updatedCount++;
        } else {
            console.warn(`   ⚠️ Producto de la lista de info no encontrado en products.js: ${info.name} (${info.reference})`);
        }
    });

    // 5. Guardar
    fs.writeFileSync(PRODUCTS_JS_PATH, formatProductsFile(products), 'utf8');
    console.log(`\n✨ Proceso completado. ${updatedCount} productos actualizados.`);
}

sync();
