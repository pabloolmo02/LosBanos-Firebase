/**
 * Script de Migración: products.js → Firebase Firestore
 * 
 * Este script migra todos los productos desde el archivo estático products.js
 * a Firebase Firestore, preservando los IDs originales y toda la información
 * incluyendo los nuevos campos (ph, formato, long_description, etc.)
 * 
 * Usa Firebase Admin SDK para bypasear las reglas de seguridad
 * 
 * Uso:
 *   node tools/migrate-to-firebase.js
 * 
 * IMPORTANTE:
 * - Solo ejecutar UNA VEZ o cuando la base de datos esté vacía
 * - Requiere el archivo de credenciales de Firebase Admin SDK
 * - El script verificará si ya existen productos antes de migrar
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Buscar el archivo de credenciales de Firebase Admin
const serviceAccountPath = join(__dirname, 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-22c837deb3.json');

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
  console.log('✅ Credenciales de Firebase Admin cargadas');
} catch (error) {
  console.error('❌ ERROR: No se pudo cargar el archivo de credenciales de Firebase Admin');
  console.error('   Ruta esperada:', serviceAccountPath);
  console.error('   Error:', error.message);
  process.exit(1);
}

// Inicializar Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
  console.log('✅ Firebase Admin SDK inicializado');
} catch (error) {
  console.error('❌ ERROR inicializando Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// Importar productos
let products;
try {
  // Intentar cargar el archivo products.js
  const productsPath = join(__dirname, '..', 'src', 'lib', 'products.js');
  const productsContent = readFileSync(productsPath, 'utf-8');
  
  // Evaluar el contenido (asumiendo que exporta con export default)
  const productsMatch = productsContent.match(/const products = (\[[\s\S]*?\]);/);
  if (productsMatch) {
    products = JSON.parse(productsMatch[1]);
  } else {
    throw new Error('No se pudo parsear el archivo products.js');
  }
} catch (error) {
  console.error('❌ ERROR cargando products.js:', error.message);
  process.exit(1);
}

console.log(`📦 Productos encontrados en products.js: ${products.length}`);

async function migrateProducts() {
  console.log('\n🚀 Iniciando migración a Firebase Firestore...\n');
  
  const collectionName = 'products';
  const collectionRef = db.collection(collectionName);
  
  // Verificar argumentos de línea de comandos
  const forceOverwrite = process.argv.includes('--force') || process.argv.includes('-f');
  
  // Verificar si ya hay datos
  console.log('🔍 Verificando si la base de datos ya tiene productos...');
  const snapshot = await collectionRef.limit(1).get();
  
  if (!snapshot.empty) {
    console.warn(`\n⚠️  ADVERTENCIA: La base de datos ya contiene productos.`);
    
    if (forceOverwrite) {
      console.log('🔄 Flag --force detectado. Procediendo a sobrescribir productos...\n');
      return proceedWithMigration(collectionRef);
    }
    
    console.warn('La migración se cancelará para evitar duplicados.\n');
    console.log('💡 Usa "node tools/migrate-to-firebase.js --force" para sobrescribir.\n');
    
    // Preguntar al usuario si desea continuar de todos modos
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('¿Deseas continuar de todos modos? Esto sobrescribirá los productos. (si/no): ', (answer) => {
        rl.close();
        const affirmative = ['si', 'sí', 's', 'yes', 'y'];
        if (affirmative.includes(answer.toLowerCase().trim())) {
          proceedWithMigration(collectionRef).then(resolve);
        } else {
          console.log('\n❌ Migración cancelada por el usuario.\n');
          resolve({ cancelled: true });
        }
      });
    });
  }
  
  return proceedWithMigration(collectionRef);
}

async function proceedWithMigration(collectionRef) {
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  console.log('\n📤 Subiendo productos a Firebase...\n');
  
  // Usar batch para mejor rendimiento
  let batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500; // Firestore permite hasta 500 operaciones por batch
  
  for (const product of products) {
    try {
      // Usamos el ID original del producto
      const productRef = collectionRef.doc(product.id);
      
      // Preparar datos del producto
      const productData = {
        ...product,
        // Asegurar tipos de datos correctos
        price: Number(product.price) || 0,
        stock: product.stock !== false,
        // Preservar fecha de creación original o crear una nueva
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      batch.set(productRef, productData);
      batchCount++;
      successCount++;
      
      // Commit batch cada BATCH_SIZE operaciones
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`  ✓ Migrados ${successCount} productos...`);
        batch = db.batch();
        batchCount = 0;
      }
    } catch (error) {
      errorCount++;
      errors.push({
        productId: product.id,
        productName: product.name,
        error: error.message
      });
      console.error(`  ❌ Error migrando ${product.id} (${product.name}):`, error.message);
    }
  }
  
  // Commit último batch si tiene operaciones pendientes
  if (batchCount > 0) {
    await batch.commit();
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE LA MIGRACIÓN');
  console.log('='.repeat(60));
  console.log(`✅ Productos migrados exitosamente: ${successCount}`);
  console.log(`❌ Productos con errores: ${errorCount}`);
  console.log(`📦 Total procesado: ${successCount + errorCount}`);
  console.log('='.repeat(60) + '\n');
  
  if (errors.length > 0) {
    console.log('⚠️  Detalles de errores:\n');
    errors.forEach(err => {
      console.log(`   • ${err.productId} - ${err.productName}`);
      console.log(`     Error: ${err.error}\n`);
    });
  }
  
  if (successCount > 0) {
    console.log('✅ Migración completada con éxito!');
    console.log('   Ahora puedes acceder a estos productos desde tu aplicación.');
    console.log('   Ve al panel de administración para editar productos.\n');
  }
  
  return { 
    success: successCount > 0, 
    count: successCount, 
    errors: errorCount,
    errorDetails: errors
  };
}

// Ejecutar migración
migrateProducts()
  .then((result) => {
    if (!result.cancelled) {
      process.exit(result.errors > 0 ? 1 : 0);
    } else {
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('\n❌ ERROR FATAL durante la migración:', error);
    process.exit(1);
  });
