
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, addDoc, doc, updateDoc } from 'firebase/firestore';

// Obtener pedidos de un usuario
export const getUserOrders = async (userId) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
        ordersRef, 
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
};

// CREAR NUEVO PEDIDO
export const createOrder = async (orderData) => {
    try {
        const docRef = await addDoc(collection(db, "orders"), {
            ...orderData,
            status: 'pendiente', // Estado inicial
            createdAt: new Date().toISOString(),
            paymentStatus: 'pendiente'
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};

// Obtener todos los pedidos (admin)
export const getAllOrders = async () => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docItem => ({
      id: docItem.id,
      ...docItem.data()
    }));
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
};

// Actualizar estado del pedido (admin)
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};
