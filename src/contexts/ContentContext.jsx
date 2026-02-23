import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ContentContext = createContext(null);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within ContentProvider');
  }
  return context;
};

const getContentRef = () => {
  if (!db) return null;
  return doc(db, 'siteContent', 'main');
};

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = getContentRef();
    if (!ref) {
      setLoading(false);
      return;
    }

    const fetchContent = async () => {
      try {
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          setContent(snapshot.data() || {});
        }
      } catch (error) {
        console.warn('Error cargando contenido editable:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const getValue = (key, fallback) => {
    if (Object.prototype.hasOwnProperty.call(content, key)) {
      return content[key];
    }
    return fallback;
  };

  const setValue = async (key, value) => {
    setContent((prev) => ({
      ...prev,
      [key]: value
    }));

    const ref = getContentRef();
    if (!ref) return;

    try {
      await updateDoc(ref, { [key]: value });
    } catch (error) {
      await setDoc(ref, { [key]: value }, { merge: true });
    }
  };

  const value = useMemo(() => ({
    content,
    loading,
    getValue,
    setValue
  }), [content, loading]);

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};
