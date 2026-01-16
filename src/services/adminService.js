
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';

// Obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc')); // Ordenar por fecha, más recientes primero
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Aprobar usuario (cambiar rol a 'approved')
export const approveUser = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      role: 'approved',
      approvedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error approving user:", error);
    return false;
  }
};

// Convertir usuario en admin (opcional, por si quieres dar poder a alguien más)
export const makeUserAdmin = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role: 'admin' });
      return true;
    } catch (error) {
      console.error("Error making user admin:", error);
      return false;
    }
};
