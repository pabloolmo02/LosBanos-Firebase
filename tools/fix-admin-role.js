/**
 * Script para verificar y establecer el rol de admin
 * 
 * Uso:
 *   node tools/fix-admin-role.js <email-del-admin>
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar credenciales
const serviceAccountPath = join(__dirname, 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-22c837deb3.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function setAdminRole(email) {
  try {
    console.log(`\n🔍 Buscando usuario con email: ${email}\n`);
    
    // 1. Obtener el usuario de Firebase Auth
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Usuario encontrado en Firebase Auth`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}\n`);
    
    // 2. Verificar el documento en Firestore
    const userRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log(`📄 Documento en Firestore encontrado:`);
      console.log(`   Role actual: ${userData.role || 'NO DEFINIDO'}`);
      console.log(`   Company: ${userData.company || '-'}`);
      console.log(`   Email: ${userData.email}\n`);
      
      if (userData.role === 'admin') {
        console.log(`✅ El usuario ya tiene rol de admin en Firestore.\n`);
      }
    } else {
      console.log(`⚠️  No existe documento en Firestore para este usuario.\n`);
    }
    
    // 3. Establecer role = admin
    console.log(`🔧 Estableciendo role = 'admin'...`);
    await userRef.set({
      email: userRecord.email,
      role: 'admin',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`✅ Role de admin establecido correctamente!\n`);
    
    // 4. Establecer custom claims en Firebase Auth (opcional pero recomendado)
    console.log(`🔧 Estableciendo custom claims en Firebase Auth...`);
    await auth.setCustomUserClaims(userRecord.uid, { admin: true });
    console.log(`✅ Custom claims establecidos!\n`);
    
    console.log(`✅ TODO LISTO! El usuario ${email} ahora es admin.\n`);
    console.log(`💡 El usuario debe cerrar sesión y volver a iniciar sesión para que los cambios tengan efecto.\n`);
    
  } catch (error) {
    console.error(`❌ ERROR:`, error.message);
    process.exit(1);
  }
}

// Obtener email de los argumentos
const email = process.argv[2];

if (!email) {
  console.error(`❌ ERROR: Debes proporcionar un email`);
  console.log(`\nUso: node tools/fix-admin-role.js <email>\n`);
  console.log(`Ejemplo: node tools/fix-admin-role.js admin@losbaños.com\n`);
  process.exit(1);
}

setAdminRole(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
