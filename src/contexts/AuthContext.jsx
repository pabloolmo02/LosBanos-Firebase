
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createOrUpdateUserProfile, getUserProfile } from '@/services/customerService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // PROTECCIÓN: Si auth es null o undefined (fallo init Firebase), no hacemos nada o mostramos error.
    if (!auth) {
        console.error("Auth instance is not initialized. Check Firebase config.");
        setError("Error de configuración: Firebase no está disponible.");
        setLoading(false);
        return;
    }

    // Escuchar cambios en el estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Si el usuario está logueado en Firebase, obtenemos su perfil completo de Firestore
        const userProfile = await getUserProfile(firebaseUser.uid);
        if (userProfile) {
          setUser(userProfile);
        } else {
            // Fallback si no hay perfil en DB (raro, pero posible)
            setUser({ 
                uid: firebaseUser.uid, 
                email: firebaseUser.email, 
                role: 'pending' 
            });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    if (!auth) throw new Error("Firebase Auth no está disponible");
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return true;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
        await signOut(auth);
        localStorage.removeItem('quimxel_cart'); // Limpiar carrito local al salir
    } catch (error) {
        console.error("Logout error:", error);
    }
  };

  const register = async (userData) => {
    if (!auth) throw new Error("Firebase Auth no está disponible");
    try {
        // 1. Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const firebaseUser = userCredential.user;

        // 2. Crear perfil extendido en Firestore (Base de datos de clientes)
        const profileData = {
            email: userData.email,
            company: userData.company,
            cif: userData.cif,
            phone: userData.phone,
            role: 'pending', // Por defecto pendiente de aprobación B2B
            marketingConsent: userData.marketingConsent || false,
            sector: userData.sector || 'general'
        };

        await createOrUpdateUserProfile(firebaseUser.uid, profileData);
        
        // Actualizar estado local inmediatamente para feedback rápido
        setUser({ uid: firebaseUser.uid, ...profileData });
        return firebaseUser;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
  };

  const value = {
    user,
    loading,
    error, // Exponemos el error
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isApproved: user?.role === 'approved' || user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
