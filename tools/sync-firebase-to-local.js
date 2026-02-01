
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Buscar el archivo de credenciales
const files = fs.readdirSync(__dirname);
const keyFile = files.find(f => f.startsWith('losbanosdata-1f79f-firebase-adminsdk') && f.endsWith('.json'));

if (!keyFile) {
    console.error('❌ Error: No se encontró el archivo de credenciales de Firebase.');
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
const PRODUCTS_FILE_PATH = path.join(__dirname, '../src/lib/products.js');

async function syncFirebaseToLocal() {
    console.log('🚀 Sincronizando productos de Firebase a archivo local...\n');

    try {
        // 1. Leer todos los productos de Firebase
        console.log('📥 Leyendo productos de Firebase...');
        const snapshot = await db.collection('products').get();
        
        const products = [];
        snapshot.forEach(doc => {
            products.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Ordenar por ID numérico
        products.sort((a, b) => parseInt(a.id) - parseInt(b.id));

        console.log(`✅ Leídos ${products.length} productos de Firebase\n`);

        // 2. Generar el contenido del archivo
        const fileContent = `const products = ${JSON.stringify(products, null, 2)};\n\nexport default products;\n\nexport const getProducts = () => products;\n\nexport const getProductById = (id) => {\n  return products.find(p => p.id === id);\n};\n\nexport const getProductsByCategory = (category) => {\n  return products.filter(p => p.category === category);\n};\n`;

        // 3. Escribir al archivo
        fs.writeFileSync(PRODUCTS_FILE_PATH, fileContent, 'utf8');

        console.log('✨ Archivo actualizado exitosamente!');
        console.log(`📁 Ubicación: ${PRODUCTS_FILE_PATH}`);
        
        // 4. Mostrar estadísticas
        const withImages = products.filter(p => p.images && p.images.length > 0);
        console.log(`\n📊 Estadísticas:`);
        console.log(`   Total productos: ${products.length}`);
        console.log(`   Con imágenes: ${withImages.length}`);
        console.log(`   Sin imágenes: ${products.length - withImages.length}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

syncFirebaseToLocal();
