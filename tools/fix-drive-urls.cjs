const admin = require('firebase-admin');
const serviceAccount = require('./losbanosdata-1f79f-firebase-adminsdk-fbsvc-22c837deb3.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Convierte URL de Google Drive a formato directo
function convertDriveUrl(url) {
  if (!url || typeof url !== 'string') return url;
  
  // Si ya es formato uc?export=view, dejar como está
  if (url.includes('drive.google.com/uc?')) return url;
  
  // Extraer ID de diferentes formatos de URL de Drive
  let fileId = null;
  
  // Formato: /thumbnail?id=FILE_ID
  if (url.includes('/thumbnail?id=')) {
    const match = url.match(/id=([^&]+)/);
    if (match) fileId = match[1];
  }
  // Formato: /file/d/FILE_ID
  else if (url.includes('/file/d/')) {
    const match = url.match(/\/d\/([^/]+)/);
    if (match) fileId = match[1];
  }
  // Formato: /open?id=FILE_ID
  else if (url.includes('/open?id=')) {
    const match = url.match(/id=([^&]+)/);
    if (match) fileId = match[1];
  }
  
  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  return url;
}

async function fixDriveUrls() {
  try {
    console.log('🔍 Buscando productos con URLs de Google Drive...\n');
    
    const snapshot = await db.collection('products').get();
    const batch = db.batch();
    let updatedCount = 0;
    let changesLog = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      let hasChanges = false;
      const updates = {};
      
      // Procesar product.images
      if (data.images) {
        const images = Array.isArray(data.images) ? data.images : [data.images];
        const newImages = images.map(img => {
          const converted = convertDriveUrl(img);
          if (converted !== img) {
            hasChanges = true;
            changesLog.push(`  ${data.name} - image: ${img.substring(0, 60)}... → ${converted.substring(0, 60)}...`);
          }
          return converted;
        });
        
        if (hasChanges) {
          updates.images = newImages;
        }
      }
      
      // Procesar formats
      if (data.formats && Array.isArray(data.formats)) {
        const newFormats = data.formats.map(format => {
          if (format.image) {
            const converted = convertDriveUrl(format.image);
            if (converted !== format.image) {
              hasChanges = true;
              changesLog.push(`  ${data.name} [${format.name}]: ${format.image.substring(0, 60)}... → ${converted.substring(0, 60)}...`);
              return { ...format, image: converted };
            }
          }
          return format;
        });
        
        if (hasChanges) {
          updates.formats = newFormats;
        }
      }
      
      if (hasChanges) {
        batch.update(doc.ref, updates);
        updatedCount++;
      }
    }
    
    if (updatedCount > 0) {
      console.log('📝 Cambios a realizar:\n');
      changesLog.forEach(log => console.log(log));
      console.log(`\n⚠️  Total: ${updatedCount} productos a actualizar`);
      console.log('\n¿Proceder con los cambios? Ejecuta con --commit para guardar\n');
      
      if (process.argv.includes('--commit')) {
        await batch.commit();
        console.log('\n✅ URLs de Google Drive actualizadas correctamente');
      } else {
        console.log('ℹ️  Modo preview - no se guardaron cambios');
      }
    } else {
      console.log('✅ No se encontraron URLs de Drive que necesiten actualización');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDriveUrls();
