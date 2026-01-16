
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CompanyPage from '@/pages/CompanyPage';
import DocumentationPage from '@/pages/DocumentationPage';
import LoginPage from '@/pages/LoginPage.jsx';
import RegisterPage from '@/pages/RegisterPage.jsx';
import CartPage from '@/pages/CartPage.jsx';
import CheckoutPage from '@/pages/CheckoutPage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
import AdminSeedingPage from '@/pages/AdminSeedingPage.jsx';
import AdminUsersPage from '@/pages/AdminUsersPage.jsx';
import AdminProductsPage from '@/pages/AdminProductsPage.jsx'; // Nueva página

// Componente Wrapper para rutas protegidas de Admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent = () => {
  const { error } = useAuth();

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-red-50 p-4 text-center">
        <div className="max-w-md rounded-lg border border-red-200 bg-white p-8 shadow-lg">
          <h2 className="mb-2 text-2xl font-bold text-red-700">Error de Configuración</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/producto/:id" element={<ProductDetailPage />} />
            <Route path="/empresa" element={<CompanyPage />} />
            <Route path="/documentacion" element={<DocumentationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Rutas de Admin */}
            <Route path="/admin-seed" element={
                <AdminRoute><AdminSeedingPage /></AdminRoute>
            } />
            <Route path="/admin-users" element={
                <AdminRoute><AdminUsersPage /></AdminRoute>
            } />
            <Route path="/admin-products" element={
                <AdminRoute><AdminProductsPage /></AdminRoute>
            } />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
