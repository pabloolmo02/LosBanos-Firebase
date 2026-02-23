/**
 * Script para listar todos los usuarios y ver sus roles
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = join(__dirname, 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-22c837deb3.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function listUsers() {
  console.log('\n📋 LISTADO DE USUARIOS EN FIRESTORE\n');
  console.log('='.repeat(80));
  
  const usersSnapshot = await db.collection('users').get();
  
  if (usersSnapshot.empty) {
    console.log('⚠️  No hay usuarios en la colección "users"\n');
    return;
  }
  
  console.log(`Total de usuarios: ${usersSnapshot.size}\n`);
  
  usersSnapshot.forEach((doc, index) => {
    const data = doc.data();
    console.log(`${index + 1}. Usuario ID: ${doc.id}`);
    console.log(`   Email: ${data.email || 'NO DEFINIDO'}`);
    console.log(`   Role: ${data.role || 'NO DEFINIDO'} ${data.role === 'admin' ? '👑' : data.role === 'approved' ? '✅' : '⏳'}`);
    console.log(`   Company: ${data.company || '-'}`);
    console.log(`   CIF: ${data.cif || '-'}`);
    console.log(`   Phone: ${data.phone || '-'}`);
    console.log(`   Created: ${data.createdAt || '-'}`);
    console.log(`   Last Login: ${data.lastLogin || '-'}`);
    console.log('   ' + '-'.repeat(76));
  });
  
  console.log('\n' + '='.repeat(80));
  
  // Resumen
  const roles = {};
  usersSnapshot.forEach(doc => {
    const role = doc.data().role || 'undefined';
    roles[role] = (roles[role] || 0) + 1;
  });
  
  console.log('\n📊 RESUMEN POR ROLES:');
  Object.entries(roles).forEach(([role, count]) => {
    const emoji = role === 'admin' ? '👑' : role === 'approved' ? '✅' : role === 'pending' ? '⏳' : '❓';
    console.log(`   ${emoji} ${role}: ${count} usuario(s)`);
  });
  console.log('');
}

listUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ ERROR:', error);
    process.exit(1);
  });
