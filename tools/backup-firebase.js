const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./losbanosdata-1f79f-firebase-adminsdk-fbsvc-22c837deb3.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function backupProducts() {
  console.log('📦 Haciendo backup de productos...\n');
  
  const snapshot = await db.collection('products').get();
  const products = [];
  
  snapshot.forEach(doc => {
    products.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-products-${timestamp}.json`;
  
  fs.writeFileSync(filename, JSON.stringify(products, null, 2));
  
  console.log(`✅ Backup guardado: ${filename}`);
  console.log(`📊 ${products.length} productos respaldados\n`);
  
  await admin.app().delete();
}

backupProducts().catch(console.error);
