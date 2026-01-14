import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';


const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="shadow-md sticky top-0 z-50 bg-white border-b border-brand-base/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3">
            {<img src="/images/logo-letra.png" alt="Quimxel Logo" className="h-12 w-auto" />}
            {/* <div className="flex flex-col font-logo">
              <span className="font-bold text-xl text-white">Los Baños</span>
              <span className="text-xs text-white">comercial</span>
            </div> */}
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
              <Link to="/documentacion" className="text-brand-dark hover:text-brand-blue font-semibold py-2 px-3 rounded-lg hover:bg-brand-base/20 transition-all" onClick={() => setMobileMenuOpen(false)}>
                Documentación
              </Link>
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
