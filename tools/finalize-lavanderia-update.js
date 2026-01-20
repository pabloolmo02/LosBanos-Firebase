
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURACIÓN ---
const PRODUCTS_JS_PATH = path.join(__dirname, '../src/lib/products.js');
const LAVANDERIA_DESC_PATH = path.join(__dirname, '../public/products_long_description.js');
const DRIVE_FOLDER_ID = '15K95l7NN5BhOXLKWetGVHCAipeZg1vy_'; // Carpeta Lavandería
const KEY_FILENAME = 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-f653f6cda0.json';
const KEY_PATH = path.join(__dirname, KEY_FILENAME);

// --- HELPERS ---

function parseJsFile(content, varName) {
    // Intenta extraer array de "const products = [...]" o similar
    // Si no encuentra varName, intenta limpiar comentarios y parsear todo
    let arrayString = null;
    
    if (varName) {
        const regex = new RegExp(`const ${varName} = ([\\[\\s\\S]*?);`);
        const match = content.match(regex);
        if (match) arrayString = match[1];
    }

    if (!arrayString) {
        // Fallback: Quitar comentarios y asumir que es un array
        arrayString = content.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    }

    try {
        return new Function(`return ${arrayString}`)();
    } catch (e) {
        console.error("Error parsing JS content:", e.message);
        return null;
    }
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

async function main() {
    console.log("🚀 Iniciando FINALIZACIÓN de Lavandería (Info + Imágenes)...");

    // 1. Cargar Datos Locales
    const productsContent = fs.readFileSync(PRODUCTS_JS_PATH, 'utf8');
    const descContent = fs.readFileSync(LAVANDERIA_DESC_PATH, 'utf8');

    const allProducts = parseJsFile(productsContent, 'products');
    // El archivo de descripciones es un array directo tras comentarios
    const lavanderiaUpdates = parseJsFile(descContent); 

    if (!allProducts || !lavanderiaUpdates) {
        console.error("❌ Error cargando archivos locales. Abortando.");
        return;
    }

    console.log(`📚 Productos totales: ${allProducts.length}`);
    console.log(`📝 Actualizaciones Lavandería disponibles: ${lavanderiaUpdates.length}`);

    // 2. Conectar a Drive para Imágenes
    if (!fs.existsSync(KEY_PATH)) {
        console.error("❌ No encuentro credenciales de Drive.");
        return;
    }
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const drive = google.drive({ version: 'v3', auth });

    let driveFiles = [];
    try {
        console.log(`☁️ Leyendo carpeta Drive: ${DRIVE_FOLDER_ID}...`);
        let pageToken = null;
        do {
            const res = await drive.files.list({
                q: `'${DRIVE_FOLDER_ID}' in parents and trashed = false`,
                fields: 'nextPageToken, files(id, name)',
                pageToken: pageToken,
                pageSize: 1000
            });
            driveFiles = driveFiles.concat(res.data.files);
            pageToken = res.data.nextPageToken;
        } while (pageToken);
        console.log(`   ✅ Encontradas ${driveFiles.length} imágenes en Drive.`);
    } catch (error) {
        console.error("❌ Error leyendo Drive:", error.message);
        return;
    }

    // 3. Procesar Actualizaciones
    // Mapa de actualizaciones por referencia
    const updatesMap = new Map(lavanderiaUpdates.map(p => [p.reference, p]));
    
    // Filtramos solo los productos de lavandería del array principal para saber su orden
    // (Asumimos que el orden en products.js de la categoría 'lavanderia-profesional' coincide con el orden de las imágenes 1..N)
    const lavanderiaProducts = allProducts.filter(p => p.category === 'lavanderia-profesional');
    
    // Creamos un mapa de índice para las imágenes
    const lavanderiaIndexMap = new Map();
    lavanderiaProducts.forEach((p, idx) => {
        lavanderiaIndexMap.set(p.id, idx + 1); // 1-based index
    });

    let infoUpdatedCount = 0;
    let imageUpdatedCount = 0;

    const finalProducts = allProducts.map(p => {
        // Solo tocamos lavandería profesional
        if (p.category === 'lavanderia-profesional') {
            
            // A. Actualizar INFO extendida
            if (updatesMap.has(p.reference)) {
                const update = updatesMap.get(p.reference);
                p.long_description = update.long_description || p.long_description;
                p.ph = update.ph || p.ph;
                p.usage = update.usage || p.usage;
                // p.description = update.description || p.description; // Mantener corta original si se prefiere

                // Formatos
                if (update.formats) {
                    const formatList = update.formats.split(';').map(f => f.trim());
                    // Reconstruir variantes con los nuevos formatos, manteniendo el precio base si no hay info
                    // OJO: Si ya teníamos variantes con precio del Excel anterior, intentamos preservarlo si coincide
                    // Si no, sobrescribimos con formato nuevo y precio base.
                    
                    p.variants = formatList.map((fmt, idx) => {
                        // Intentar buscar si ya existía una variante parecida para mantener precio específico?
                        // Por simplicidad, usamos precio base del producto para todas las variantes nuevas de formato
                        // a menos que podamos inferir algo.
                        return {
                            id: `${p.id}_v${idx}`,
                            format: fmt,
                            price: p.price, 
                            originalName: p.name
                        };
                    });
                }
                infoUpdatedCount++;
            }

            // B. Actualizar IMAGEN desde Drive (por orden 1..N)
            const index = lavanderiaIndexMap.get(p.id);
            if (index) {
                // Buscar imagen que empiece por "1 ", "1.", "01."
                const imageFile = driveFiles.find(f => {
                    const name = f.name.split('.')[0].trim();
                    return parseInt(name) === index;
                });

                if (imageFile) {
                    const imageUrl = `https://drive.google.com/thumbnail?id=${imageFile.id}&sz=w1000`;
                    p.images = [imageUrl];
                    imageUpdatedCount++;
                }
            }
        }
        return p;
    });

    // 4. Guardar
    fs.writeFileSync(PRODUCTS_JS_PATH, formatProductsFile(finalProducts), 'utf8');
    console.log(`\n✨ PROCESO TERMINADO:`);
    console.log(`   - Info actualizada en: ${infoUpdatedCount} productos.`);
    console.log(`   - Imágenes vinculadas: ${imageUpdatedCount} productos.`);
}

main();
