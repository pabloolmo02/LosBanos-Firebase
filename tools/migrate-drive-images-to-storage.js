import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-22c837deb3.json');
const DRY_RUN = !process.argv.includes('--commit');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('❌ No se encontró el service account:', SERVICE_ACCOUNT_PATH);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: bucketName
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_PATH,
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
});

const drive = google.drive({ version: 'v3', auth });

const isDriveUrl = (url) =>
  typeof url === 'string' &&
  (url.includes('drive.google.com') || url.includes('docs.google.com'));

const isStorageUrl = (url) =>
  typeof url === 'string' &&
  (url.startsWith('gs://') || url.includes('firebasestorage.googleapis.com') || url.includes('storage.googleapis.com'));

const extractDriveId = (url) => {
  if (!url || typeof url !== 'string') return null;

  const patterns = [
    /\/d\/([^/]+)/,
    /id=([^&]+)/,
    /thumbnail\?id=([^&]+)/,
    /open\?id=([^&]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

const sanitizeFileName = (name) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

const mimeToExt = (mimeType) => {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };
  return map[mimeType] || 'jpg';
};

const downloadDriveFile = async (fileId) => {
  const meta = await drive.files.get({
    fileId,
    fields: 'id,name,mimeType'
  });

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );

  const buffer = Buffer.from(response.data);
  return {
    buffer,
    name: meta.data.name || `${fileId}.${mimeToExt(meta.data.mimeType)}`,
    mimeType: meta.data.mimeType || 'image/jpeg'
  };
};

const uploadToStorage = async ({ buffer, name, mimeType }, productId, index) => {
  const safeName = sanitizeFileName(name);
  const extension = path.extname(safeName) || `.${mimeToExt(mimeType)}`;
  const baseName = safeName.replace(path.extname(safeName), '') || `imagen-${index + 1}`;
  const storagePath = `products/${productId}/${baseName}${extension}`;

  if (!DRY_RUN) {
    const file = bucket.file(storagePath);
    await file.save(buffer, {
      contentType: mimeType,
      metadata: {
        cacheControl: 'public, max-age=31536000'
      }
    });
  }

  return `gs://${bucketName}/${storagePath}`;
};

const migrateProductImages = async (doc) => {
  const data = doc.data();
  const images = Array.isArray(data.images) ? data.images : data.images ? [data.images] : [];

  if (images.length === 0) return { updated: false, images: [] };

  const newImages = [];
  let changed = false;

  for (let i = 0; i < images.length; i += 1) {
    const img = images[i];

    if (!img) continue;
    if (isStorageUrl(img)) {
      newImages.push(img);
      continue;
    }

    if (!isDriveUrl(img)) {
      newImages.push(img);
      continue;
    }

    const fileId = extractDriveId(img);
    if (!fileId) {
      console.warn(`⚠️ No se pudo extraer fileId para ${doc.id}:`, img);
      newImages.push(img);
      continue;
    }

    try {
      const download = await downloadDriveFile(fileId);
      const gsUrl = await uploadToStorage(download, doc.id, i);
      newImages.push(gsUrl);
      changed = true;
      console.log(`✅ ${doc.id}: ${img} -> ${gsUrl}`);
    } catch (error) {
      console.error(`❌ Error migrando imagen para ${doc.id}:`, img, error.message);
      newImages.push(img);
    }
  }

  if (changed && !DRY_RUN) {
    await doc.ref.update({ images: newImages });
  }

  return { updated: changed, images: newImages };
};

const run = async () => {
  console.log(`
🔎 Migración de imágenes Drive → Storage
Bucket: ${bucketName}
Modo: ${DRY_RUN ? 'DRY-RUN' : 'COMMIT'}
`);

  const snapshot = await db.collection('products').get();
  console.log(`Productos encontrados: ${snapshot.size}`);

  let updatedCount = 0;
  let processed = 0;

  for (const doc of snapshot.docs) {
    const result = await migrateProductImages(doc);
    if (result.updated) updatedCount += 1;
    processed += 1;

    if (processed % 50 === 0) {
      console.log(`Procesados ${processed}/${snapshot.size}`);
    }
  }

  console.log(`
✅ Procesados: ${processed}
✅ Actualizados: ${updatedCount}
✅ Modo: ${DRY_RUN ? 'DRY-RUN (sin cambios)' : 'COMMIT'}
`);

  if (DRY_RUN) {
    console.log('⚠️ Para aplicar cambios ejecuta con --commit');
  }
};

run().catch((error) => {
  console.error('❌ Error general:', error);
  process.exit(1);
});
