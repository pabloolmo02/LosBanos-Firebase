const admin = require('firebase-admin');
const serviceAccount = require('./losbanosdata-1f79f-firebase-adminsdk-fbsvc-22c837deb3.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'losbanosdata-1f79f.firebasestorage.app'
});

const db = admin.firestore();

// Convert gs:// URL to public Firebase Storage URL
function gsToPublicUrl(gsUrl) {
  if (!gsUrl || !gsUrl.startsWith('gs://')) return gsUrl;
  
  const match = gsUrl.match(/gs:\/\/[^\/]+\/(.+)/);
  if (!match) return gsUrl;
  
  const filePath = match[1];
  const encodedPath = filePath.split('/').map(encodeURIComponent).join('%2F');
  return `https://firebasestorage.googleapis.com/v0/b/losbanosdata-1f79f.firebasestorage.app/o/${encodedPath}?alt=media`;
}

async function fixAllImages() {
  const commit = process.argv.includes('--commit');
  
  console.log('🔍 Convirtiendo todas las URLs gs:// a URLs públicas...\n');
  
  const snapshot = await db.collection('products').get();
  const updates = [];
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    let needsUpdate = false;
    
    // Fix product.images
    let updatedImages = data.images;
    if (Array.isArray(data.images)) {
      const converted = data.images.map(img => {
        if (img && img.startsWith('gs://')) {
          needsUpdate = true;
          return gsToPublicUrl(img);
        }
        return img;
      });
      if (needsUpdate) {
        updatedImages = converted;
      }
    }
    
    // Fix formats[].image
    let updatedFormats = data.formats;
    if (Array.isArray(data.formats)) {
      const converted = data.formats.map(format => {
        if (format.image && format.image.startsWith('gs://')) {
          needsUpdate = true;
          return { ...format, image: gsToPublicUrl(format.image) };
        }
        return format;
      });
      if (needsUpdate) {
        updatedFormats = converted;
      }
    }
    
    if (needsUpdate) {
      console.log(`  ✓ ${data.name}`);
      updates.push({
        id: doc.id,
        images: updatedImages,
        formats: updatedFormats
      });
    }
  }
  
  console.log(`\n⚠️  Total: ${updates.length} productos a actualizar\n`);
  
  if (!commit) {
    console.log('ℹ️  Ejecuta con --commit para guardar los cambios');
    process.exit(0);
  }
  
  // Apply updates in batches
  const batchSize = 500;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = db.batch();
    const chunk = updates.slice(i, i + batchSize);
    
    chunk.forEach(update => {
      const ref = db.collection('products').doc(update.id);
      batch.update(ref, {
        images: update.images,
        formats: update.formats
      });
    });
    
    await batch.commit();
    console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} guardado`);
  }
  
  console.log('\n✅ Todas las URLs gs:// convertidas a URLs públicas');
  process.exit(0);
}

fixAllImages().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
