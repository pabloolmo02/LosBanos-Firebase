import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const EditModeContext = createContext(null);

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error('useEditMode must be used within EditModeProvider');
  }
  return context;
};

const getStoredValue = () => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('edit_mode_enabled') === '1';
  } catch {
    return false;
  }
};

const getIsDesktop = () => {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(min-width: 1024px)').matches;
};

export const EditModeProvider = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(getIsDesktop);
  const [enabled, setEnabled] = useState(() => (getIsDesktop() ? getStoredValue() : false));

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event) => {
      setIsDesktop(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (!isDesktop && enabled) {
      setEnabled(false);
    }
  }, [isDesktop, enabled]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('edit-mode', enabled && isDesktop);
    try {
      localStorage.setItem('edit_mode_enabled', enabled && isDesktop ? '1' : '0');
    } catch {
      // Ignore storage errors
    }
  }, [enabled, isDesktop]);

  const value = useMemo(() => ({
    enabled: enabled && isDesktop,
    isDesktop,
    setEnabled,
    toggle: () => {
      if (!isDesktop) return;
      setEnabled((prev) => !prev);
    }
  }), [enabled, isDesktop]);

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
};
