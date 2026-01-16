
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'users';

// Crear o actualizar perfil de usuario extendido
export const createOrUpdateUserProfile = async (uid, userData) => {
  try {
    const userRef = doc(db, COLLECTION_NAME, uid);
    
    // Datos base para marketing y gestión
    const marketingData = {
      email: userData.email,
      company: userData.company || '',
      cif: userData.cif || '',
      phone: userData.phone || '',
      role: userData.role || 'pending', // pending, approved, admin
      sector: userData.sector || 'general', // Para segmentación (HORECA, Sanitaria, etc.)
      marketingConsent: userData.marketingConsent || false,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Si es un registro nuevo (creationTime cercano a ahora), añadimos createdAt
    // Esto se podría mejorar comprobando si el doc existe primero
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
        marketingData.createdAt = new Date().toISOString();
        marketingData.orderCount = 0;
        marketingData.totalSpent = 0;
        marketingData.tags = []; // Etiquetas para marketing (ej: 'comprador-frecuente', 'interes-ecologico')
    }

    await setDoc(userRef, marketingData, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
};

export const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// Función para añadir notas de marketing o tags
export const addUserTag = async (uid, tag) => {
    try {
        const userRef = doc(db, COLLECTION_NAME, uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const currentTags = userDoc.data().tags || [];
            if (!currentTags.includes(tag)) {
                await updateDoc(userRef, {
                    tags: [...currentTags, tag]
                });
            }
        }
    } catch (error) {
        console.error("Error adding tag:", error);
    }
}
