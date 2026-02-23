import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search, FileText, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';


const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="shadow-md sticky top-0 z-50 bg-white border-b border-brand-base/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3">
            {<img src="/images/logo-letra.png" alt="Quimxel Logo" className="h-12 w-auto" />}
          </Link>

          <nav className="hidden xl:flex items-center space-x-8">
             <Link to="/" className="text-brand-dark hover:text-brand-blue font-semibold transition-colors text-sm tracking-wide">
              Inicio
            </Link>
            <Link to="/productos" className="text-brand-dark hover:text-brand-blue font-semibold transition-colors text-sm tracking-wide">
              Productos
            </Link>
             <Link to="/empresa" className="text-brand-dark hover:text-brand-blue font-semibold transition-colors text-sm tracking-wide">
              Empresa
            </Link>
            <Link to="/ventajas" className="text-brand-dark hover:text-brand-blue font-semibold transition-colors text-sm tracking-wide">
              Ventajas
            </Link>
            <Link to="/documentacion" className="text-brand-dark hover:text-brand-blue font-semibold transition-colors text-sm tracking-wide">
              Documentación
            </Link>
          </nav>

          <div className="hidden lg:flex items-center space-x-3">
            <Button variant="ghost" size="icon" asChild className="text-brand-dark hover:text-brand-blue hover:bg-brand-base/20">
              <Link to="/documentacion">
                <FileText className="h-5 w-5" />
              </Link>
            </Button>
            
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <div className="relative group">
                    <Button variant="ghost" size="sm" className="text-purple-700 hover:text-purple-900 hover:bg-purple-100 flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      Admin
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                    
                    {/* Desktop Dropdown */}
                    <div className="hidden group-hover:block absolute right-0 mt-0 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-semibold">
                        📋 Panel Principal
                      </Link>
                      <hr className="my-1" />
                      <Link to="/admin-products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                        📦 Gestionar Productos
                      </Link>
                      <Link to="/admin-users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                        👥 Gestionar Usuarios
                      </Link>
                      <Link to="/admin-seed" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                        🌱 Seeding de Datos
                      </Link>
                    </div>
                  </div>
                )}

                <Button variant="ghost" size="icon" asChild className="text-brand-dark hover:text-brand-blue hover:bg-brand-base/20">
                  <Link to="/carrito">
                    <ShoppingCart className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="text-brand-dark hover:text-brand-blue hover:bg-brand-base/20">
                  <Link to="/dashboard">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleLogout} className="text-brand-dark border-brand-dark hover:bg-brand-dark hover:text-white transition-all">
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild className="text-brand-dark border-brand-dark hover:bg-brand-dark hover:text-white transition-all">
                  <Link to="/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild className="bg-brand-dark text-white hover:bg-brand-blue transition-all shadow-sm">
                  <Link to="/registro">Solicitar Acceso B2B</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-brand-dark hover:text-brand-blue transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-brand-base/30 bg-white shadow-lg"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col space-y-3">
              <Link to="/" className="text-brand-dark hover:text-brand-blue font-semibold py-2 px-3 rounded-lg hover:bg-brand-base/20 transition-all" onClick={() => setMobileMenuOpen(false)}>
                Inicio
              </Link>
              <Link to="/productos" className="text-brand-dark hover:text-brand-blue font-semibold py-2 px-3 rounded-lg hover:bg-brand-base/20 transition-all" onClick={() => setMobileMenuOpen(false)}>
                Productos
              </Link>
              <Link to="/empresa" className="text-brand-dark hover:text-brand-blue font-semibold py-2 px-3 rounded-lg hover:bg-brand-base/20 transition-all" onClick={() => setMobileMenuOpen(false)}>
                Empresa
              </Link>
              <Link to="/ventajas" className="text-brand-dark hover:text-brand-blue font-semibold py-2 px-3 rounded-lg hover:bg-brand-base/20 transition-all" onClick={() => setMobileMenuOpen(false)}>
                Ventajas
              </Link>
              {isAdmin && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link to="/admin" className="text-purple-700 hover:text-purple-900 font-semibold py-2 px-3 rounded-lg hover:bg-purple-100 transition-all flex items-center" onClick={() => setMobileMenuOpen(false)}>
                    📋 Panel Principal Admin
                  </Link>
                  <Link to="/admin-products" className="text-purple-700 hover:text-purple-900 font-semibold py-2 px-3 rounded-lg hover:bg-purple-100 transition-all flex items-center" onClick={() => setMobileMenuOpen(false)}>
                    📦 Gestionar Productos
                  </Link>
                  <Link to="/admin-users" className="text-purple-700 hover:text-purple-900 font-semibold py-2 px-3 rounded-lg hover:bg-purple-100 transition-all flex items-center" onClick={() => setMobileMenuOpen(false)}>
                    👥 Gestionar Usuarios
                  </Link>
                  <Link to="/admin-seed" className="text-purple-700 hover:text-purple-900 font-semibold py-2 px-3 rounded-lg hover:bg-purple-100 transition-all flex items-center" onClick={() => setMobileMenuOpen(false)}>
                    🌱 Seeding de Datos
                  </Link>
                </>
              )}
              {isAuthenticated ? (
                <>
                  <Link to="/carrito" className="text-brand-dark hover:text-brand-blue font-semibold py-2 px-3 rounded-lg hover:bg-brand-base/20 transition-all" onClick={() => setMobileMenuOpen(false)}>
                    Carrito
                  </Link>
                  <Link to="/dashboard" className="text-brand-dark hover:text-brand-blue font-semibold py-2 px-3 rounded-lg hover:bg-brand-base/20 transition-all" onClick={() => setMobileMenuOpen(false)}>
                    Mi Cuenta
                  </Link>
                  <Button variant="outline" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-brand-dark border-brand-dark hover:bg-brand-dark hover:text-white transition-all mt-2">
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild onClick={() => setMobileMenuOpen(false)} className="text-brand-dark border-brand-dark hover:bg-brand-dark hover:text-white transition-all mt-2">
                    <Link to="/login">Iniciar Sesión</Link>
                  </Button>
                  <Button asChild onClick={() => setMobileMenuOpen(false)} className="bg-brand-dark text-white hover:bg-brand-blue transition-all shadow-sm">
                    <Link to="/registro">Solicitar Acceso B2B</Link>
                  </Button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
