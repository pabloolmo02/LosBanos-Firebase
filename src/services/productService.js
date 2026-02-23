
import { getProducts, getProductById as getLocalProductById, getProductsByCategory as getLocalProductsByCategory } from '@/lib/products';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, query, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';

const normalizeImages = (images, fallbackImage) => {
  if (Array.isArray(images)) {
    return images
      .map((img) => {
        if (typeof img === 'string') {
          return img.trim();
        }

        if (img && typeof img === 'object') {
          return (
            img.url ||
            img.downloadURL ||
            img.src ||
            img.path ||
            ''
          ).toString().trim();
        }

        return '';
      })
      .filter(Boolean);
  }

  if (typeof images === 'string') {
    const parsed = images
      .split(/\r?\n|,\s*/g)
      .map((img) => img.trim())
      .filter(Boolean);

    if (parsed.length > 0) {
      return parsed;
    }
  }

  if (typeof fallbackImage === 'string' && fallbackImage.trim()) {
    return [fallbackImage.trim()];
  }

  return [];
};

const normalizeDriveUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return url;
  }

  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/([^/]+)/);
    if (match?.[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }

  if (url.includes('drive.google.com/open?id=')) {
    const match = url.match(/open\?id=([^&]+)/);
    if (match?.[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }

  if (url.includes('drive.google.com/thumbnail?id=')) {
    const match = url.match(/thumbnail\?id=([^&]+)/);
    if (match?.[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }

  return url;
};

const normalizeStoragePath = (url) => {
  if (!url || typeof url !== 'string') {
    return url;
  }

  if (url.startsWith('/')) {
    return url;
  }

  if (url.startsWith('http') || url.startsWith('gs://')) {
    return url;
  }

  return url;
};

const resolveImageUrls = async (images) => {
  if (!Array.isArray(images) || images.length === 0) {
    return [];
  }

  const normalized = images.map((img) => normalizeStoragePath(normalizeDriveUrl(img)));

  if (!storage) {
    return normalized;
  }

  const resolved = await Promise.all(
    normalized.map(async (img) => {
      if (typeof img === 'string' && img.startsWith('gs://')) {
        try {
          return await getDownloadURL(storageRef(storage, img));
        } catch (error) {
          console.warn('No se pudo resolver gs://', img, error);
          return img;
        }
      }

      if (typeof img === 'string' && !img.startsWith('http') && !img.startsWith('/')) {
        try {
          return await getDownloadURL(storageRef(storage, img));
        } catch (error) {
          console.warn('No se pudo resolver ruta de Storage', img, error);
          return img;
        }
      }

      return img;
    })
  );

  return resolved;
};

const normalizeProduct = (product) => {
  if (!product) {
    return product;
  }

  const normalized = {
    ...product,
    images: normalizeImages(product.images, product.imageUrl || product.image),
  };

  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => value !== undefined)
  );
};

const isFirestoreEnabled = () => Boolean(db);

export const getAllProducts = async () => {
  if (!isFirestoreEnabled()) {
    // Simulamos una promesa para mantener compatibilidad con componentes que esperan async
    return new Promise((resolve) => {
      resolve(getProducts().map(normalizeProduct));
    });
  }

  const snapshot = await getDocs(collection(db, 'products'));
  const products = snapshot.docs.map((docItem) => normalizeProduct({ id: docItem.id, ...docItem.data() }));
  return Promise.all(
    products.map(async (product) => ({
      ...product,
      images: await resolveImageUrls(product.images)
    }))
  );
};

export const getProductById = async (id) => {
  if (!isFirestoreEnabled()) {
    return new Promise((resolve) => {
      resolve(normalizeProduct(getLocalProductById(id)));
    });
  }

  const docRef = doc(db, 'products', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    return null;
  }

  const product = normalizeProduct({ id: snapshot.id, ...snapshot.data() });
  return {
    ...product,
    images: await resolveImageUrls(product.images)
  };
};

export const getProductsByCategory = async (category) => {
  if (!isFirestoreEnabled()) {
    return new Promise((resolve) => {
      resolve(getLocalProductsByCategory(category).map(normalizeProduct));
    });
  }

  const productsRef = collection(db, 'products');
  const q = query(productsRef, where('category', '==', category));
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((docItem) => normalizeProduct({ id: docItem.id, ...docItem.data() }));
  return Promise.all(
    products.map(async (product) => ({
      ...product,
      images: await resolveImageUrls(product.images)
    }))
  );
};

export const createProduct = async (product) => {
  if (!isFirestoreEnabled()) {
    throw new Error('Firebase no está configurado.');
  }

  const payload = normalizeProduct({
    ...product,
    createdAt: product.createdAt || new Date().toISOString(),
  });

  const docRef = await addDoc(collection(db, 'products'), payload);
  return docRef.id;
};

export const updateProduct = async (productId, updates) => {
  if (!isFirestoreEnabled()) {
    throw new Error('Firebase no está configurado.');
  }

  const payload = normalizeProduct({ ...updates });
  const docRef = doc(db, 'products', productId);
  await updateDoc(docRef, payload);
};

export const deleteProduct = async (productId) => {
  if (!isFirestoreEnabled()) {
    throw new Error('Firebase no está configurado.');
  }

  const docRef = doc(db, 'products', productId);
  await deleteDoc(docRef);
};

export const seedDatabase = async () => {
  console.log("Seed database function disabled in local mode.");
};
