import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-22c837deb3.json');
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || '1_6WkFUv26Dkq8PSixaJD3pizyrCt0pZ_';
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

const sanitizeFileName = (name) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

const DRIVE_ID_OFFSET = Number(process.env.DRIVE_ID_OFFSET || 100);

const extractProductId = (fileName) => {
  const match = fileName.match(/^(\d+)/);
  if (!match?.[1]) return null;
  const driveId = Number(match[1]);
  if (!Number.isFinite(driveId)) return null;
  return String(driveId + DRIVE_ID_OFFSET);
};

const listDriveImages = async () => {
  const res = await drive.files.list({
    q: `'${DRIVE_FOLDER_ID}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)',
    pageSize: 1000
  });

  return res.data.files
    .filter((file) => file.mimeType.startsWith('image/'))
    .sort((a, b) => a.name.localeCompare(b.name));
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

  return {
    buffer: Buffer.from(response.data),
    name: meta.data.name || fileId,
    mimeType: meta.data.mimeType || 'image/jpeg'
  };
};

const uploadBuffer = async ({ buffer, name, mimeType }, productId) => {
  const safeName = sanitizeFileName(name) || `imagen-${productId}`;
  const storagePath = `products/${productId}/${safeName}`;

  if (!DRY_RUN) {
    const file = bucket.file(storagePath);
    await file.save(buffer, {
      contentType: mimeType,
      metadata: { cacheControl: 'public, max-age=31536000' }
    });
  }

  return `gs://${bucketName}/${storagePath}`;
};

const run = async () => {
  console.log(`\n🔎 Migración Drive → Storage (por ID numérico)`);
  console.log(`Drive folder: ${DRIVE_FOLDER_ID}`);
  console.log(`Bucket: ${bucketName}`);
  console.log(`Modo: ${DRY_RUN ? 'DRY-RUN' : 'COMMIT'}\n`);

  const files = await listDriveImages();
  console.log(`Imágenes encontradas: ${files.length}`);

  let updated = 0;
  for (const file of files) {
    const productId = extractProductId(file.name);
    if (!productId) {
      console.warn(`⚠️ Sin ID en nombre: ${file.name}`);
      continue;
    }

    const docRef = db.collection('products').doc(productId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      console.warn(`⚠️ No existe producto con id ${productId} (${file.name})`);
      continue;
    }

    try {
      const download = await downloadDriveFile(file.id);
      const gsUrl = await uploadBuffer(download, productId);

      if (!DRY_RUN) {
        await docRef.update({ images: [gsUrl] });
      }

      updated += 1;
      console.log(`✅ ${productId}: ${file.name} -> ${gsUrl}`);
    } catch (error) {
      console.error(`❌ Error en ${file.name}:`, error.message);
    }
  }

  console.log(`\n✅ Actualizados: ${updated}`);
  if (DRY_RUN) console.log('⚠️ Para aplicar cambios ejecuta con --commit');
};

run().catch((error) => {
  console.error('❌ Error general:', error);
  process.exit(1);
});
