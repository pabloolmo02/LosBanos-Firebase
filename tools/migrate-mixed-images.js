import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-22c837deb3.json');
const LOCAL_ROOT = process.env.LOCAL_IMAGES_ROOT || 'C:/Users/Pablo/Desktop/Pablo/Catalogo_Descargado';
const DRIVE_HORECA_FOLDER_ID = process.env.DRIVE_HORECA_FOLDER_ID || '1_6WkFUv26Dkq8PSixaJD3pizyrCt0pZ_';
const DRY_RUN = !process.argv.includes('--commit');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('❌ No se encontró el service account:', SERVICE_ACCOUNT_PATH);
  process.exit(1);
}

if (!fs.existsSync(LOCAL_ROOT)) {
  console.error('❌ No existe la carpeta local:', LOCAL_ROOT);
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

const normalizeKey = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const sanitizeFileName = (name) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

const isImageFile = (fileName) =>
  /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);

const listLocalImageFiles = (productFolder) => {
  const files = fs.readdirSync(productFolder)
    .filter((file) => isImageFile(file))
    .sort((a, b) => a.localeCompare(b));
  return files.map((file) => path.join(productFolder, file));
};

const uploadLocalFile = async (filePath, productId) => {
  const fileName = sanitizeFileName(path.basename(filePath));
  const storagePath = `products/${productId}/${fileName}`;

  if (!DRY_RUN) {
    await bucket.upload(filePath, {
      destination: storagePath,
      metadata: {
        cacheControl: 'public, max-age=31536000'
      }
    });
  }

  return `gs://${bucketName}/${storagePath}`;
};

const findDriveSubfolderId = async (parentId, folderName) => {
  const q = `'${parentId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`;
  const res = await drive.files.list({
    q,
    fields: 'files(id, name)'
  });

  const normalized = normalizeKey(folderName);
  const match = res.data.files.find((file) => normalizeKey(file.name) === normalized);
  return match?.id || null;
};

const listDriveImagesInFolder = async (folderId) => {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)'
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

const uploadBuffer = async ({ buffer, name, mimeType }, productId, index) => {
  const safeName = sanitizeFileName(name) || `imagen-${index + 1}`;
  const storagePath = `products/${productId}/${safeName}`;

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

const migrateFromLocal = async (product) => {
  const folderKey = normalizeKey(product.name || '');
  if (!folderKey) return [];

  const categoryFolder = product.category ? path.join(LOCAL_ROOT, product.category) : null;
  if (!categoryFolder || !fs.existsSync(categoryFolder)) {
    return [];
  }

  const folders = fs.readdirSync(categoryFolder, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  const match = folders.find((entry) => normalizeKey(entry.name) === folderKey);
  if (!match) return [];

  const productFolder = path.join(categoryFolder, match.name);
  const files = listLocalImageFiles(productFolder);
  if (files.length === 0) return [];

  const urls = [];
  for (const filePath of files) {
    const gsUrl = await uploadLocalFile(filePath, product.id);
    urls.push(gsUrl);
  }

  return urls;
};

const migrateFromDrive = async (product) => {
  if (DRIVE_HORECA_FOLDER_ID === 'PON_AQUI_EL_ID_DE_LA_CARPETA_HORECA') {
    console.warn('⚠️ Falta DRIVE_HORECA_FOLDER_ID, se omite Drive.');
    return [];
  }

  const folderId = await findDriveSubfolderId(DRIVE_HORECA_FOLDER_ID, product.name || '');
  if (!folderId) return [];

  const images = await listDriveImagesInFolder(folderId);
  if (images.length === 0) return [];

  const urls = [];
  for (let i = 0; i < images.length; i += 1) {
    const download = await downloadDriveFile(images[i].id);
    const gsUrl = await uploadBuffer(download, product.id, i);
    urls.push(gsUrl);
  }

  return urls;
};

const run = async () => {
  console.log(`\n🔎 Migración mixta (Drive HORECA + Local resto)`);
  console.log(`Local root: ${LOCAL_ROOT}`);
  console.log(`Drive HORECA folder: ${DRIVE_HORECA_FOLDER_ID}`);
  console.log(`Modo: ${DRY_RUN ? 'DRY-RUN' : 'COMMIT'}\n`);

  const snapshot = await db.collection('products').get();
  console.log(`Productos encontrados: ${snapshot.size}`);

  let updatedCount = 0;
  let processed = 0;

  for (const doc of snapshot.docs) {
    const product = { id: doc.id, ...doc.data() };
    const category = product.category || '';

    let newImages = [];
    if (category === 'limpieza-general') {
      newImages = await migrateFromDrive(product);
    } else {
      newImages = await migrateFromLocal(product);
    }

    if (newImages.length > 0) {
      if (!DRY_RUN) {
        await doc.ref.update({ images: newImages });
      }
      updatedCount += 1;
      console.log(`✅ ${product.id} (${product.name}) -> ${newImages.length} imagen(es)`);
    }

    processed += 1;
    if (processed % 50 === 0) {
      console.log(`Procesados ${processed}/${snapshot.size}`);
    }
  }

  console.log(`\n✅ Procesados: ${processed}`);
  console.log(`✅ Actualizados: ${updatedCount}`);
  console.log(`✅ Modo: ${DRY_RUN ? 'DRY-RUN (sin cambios)' : 'COMMIT'}`);
  if (DRY_RUN) console.log('⚠️ Para aplicar cambios ejecuta con --commit');
};

run().catch((error) => {
  console.error('❌ Error general:', error);
  process.exit(1);
});
