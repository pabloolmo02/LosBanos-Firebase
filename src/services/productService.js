
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  writeBatch
} from 'firebase/firestore';

const COLLECTION_NAME = 'products';

export const getAllProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

export const getProductsByCategory = async (category) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("category", "==", category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
};

// Función para subir los productos masivamente (Seeding) optimizada con Batches
export const seedDatabase = async (products) => {
  // Firestore permite max 500 operaciones por batch.
  // Vamos a procesarlos en trozos (chunks) de 400 para estar seguros.
  const chunkSize = 400; 
  const chunks = [];
  
  for (let i = 0; i < products.length; i += chunkSize) {
    chunks.push(products.slice(i, i + chunkSize));
  }

  console.log(`Iniciando carga de ${products.length} productos en ${chunks.length} lotes...`);

  for (const chunk of chunks) {
    const batch = writeBatch(db);
    
    chunk.forEach((product) => {
      // Usamos el ID del producto como ID del documento
      const docRef = doc(db, COLLECTION_NAME, String(product.id));
      
      const { id, ...productData } = product;
      
      const dataToUpload = {
          ...productData,
          images: productData.images || ['https://images.unsplash.com/photo-1559223669-e0065fa7f142', 'https://images.unsplash.com/photo-1679104143774-d72d83a2a037'],
          stock: true,
          createdAt: new Date().toISOString()
      };

      batch.set(docRef, dataToUpload, { merge: true });
    });

    await batch.commit();
    console.log(`Lote procesado.`);
  }
  
  console.log("Database seeded successfully!");
};
