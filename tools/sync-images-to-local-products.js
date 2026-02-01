
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. IMPORTAR PRODUCTOS LOCALES
import { getProducts } from '../src/lib/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURACIÓN ---
// Buscar el archivo de credenciales de Firebase (cualquier archivo que coincida con el patrón)
const files = fs.readdirSync(__dirname);
const keyFile = files.find(f => f.startsWith('losbanosdata-1f79f-firebase-adminsdk') && f.endsWith('.json'));

if (!keyFile) {
    console.error('❌ Error: No se encontró el archivo de credenciales de Firebase.');
    console.error('Busca un archivo que empiece con "losbanosdata-1f79f-firebase-adminsdk" en la carpeta tools/');
    process.exit(1);
}

const KEY_PATH = path.join(__dirname, keyFile);
console.log(`🔑 Usando credenciales: ${keyFile}\n`);

const PRODUCTS_FILE_PATH = path.join(__dirname, '../src/lib/products.js');

// Configuración de Carpetas de Drive (IDs extraídos de tu script anterior)
const CATEGORY_MAP = [
    {
        category: 'limpieza-general',
        folderId: '1_6WkFUv26Dkq8PSixaJD3pizyrCt0pZ_',
        // Los IDs que tenías mapeados en el otro script, en orden:
        productIds: ['101','102','103','104','105','106','107','108','109','110','111','112','113','114','115','116','117','118','119','120','121','122','123','124','125','126','127','128','129','130','131','132','133','134','135','136','137','138','139','140','141','142','143','144','145','146','147','148','149','150','151','152','153','154','155','156','157','158','159','160','161','162','163','164','165','166','167','168','169','170','171','172','173','174','175','176','177','178','179','180','181','182','183','184','185','186','187','188','189','190','191','192','193','194','195','196','197','198','199','200','201','202','203','204','205','206','207','208','209','210','211','212','213','214','215','216','217','218','219','220','221','222','223','224','225','226','227','228','229']
    },
    {
        category: 'industria-alimentaria',
        folderId: '1Kj0i06fPkccmymGAqj2kmN_EaFzAz7BH',
        productIds: ['401','402','403','404','405','406','407','408','409','410','411','412','413','414','415','416','417','418','419','420','421','422','423','424','425','426','427','428','429']
    }
];

async function main() {
    console.log("🚀 Iniciando sincronización de IMÁGENES a products.js local...");

    // Verificar credenciales
    if (!fs.existsSync(KEY_PATH)) {
        console.error(`❌ ERROR: No encuentro el archivo de clave: ${KEY_FILENAME}`);
        console.error("Asegúrate de que el nombre coincida con el que descargaste.");
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
                // Buscar archivo que empiece por el número (ej: "1.jpg", "01.png", etc.)
                const fileMatch = allFiles.find(f => {
                    const name = f.name.split('.')[0].trim();
                    return parseInt(name) === productNumber;
                });

                if (fileMatch) {
                    // Encontrar el producto en el array local
                    const productIndex = products.findIndex(p => p.id === prodId);
                    if (productIndex !== -1) {
                        // Construir URL directa de miniatura grande
                        const imageUrl = `https://drive.google.com/thumbnail?id=${fileMatch.id}&sz=w1000`;
                        products[productIndex].images = [imageUrl];
                        totalUpdated++;
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
    console.log("💾 Archivo src/lib/products.js sobrescrito con los nuevos enlaces de imágenes.");
}

main();
