import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search, FileText, Shield, ChevronDown, Pencil } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import EditableNavLink from '@/components/editable/EditableNavLink';


const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { enabled: isEditMode, isDesktop, toggle: toggleEditMode } = useEditMode();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';
  const navItems = [
    { key: 'home', label: 'Inicio', href: '/' },
    { key: 'products', label: 'Productos', href: '/productos' },
    { key: 'company', label: 'Empresa', href: '/empresa' },
    { key: 'advantages', label: 'Ventajas', href: '/ventajas' },
    { key: 'docs', label: 'Documentación', href: '/documentacion' }
  ];

  return (
    <header className="shadow-md sticky top-0 z-50 bg-white border-b border-brand-base/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3">
            {<img src="/images/logo-letra.png" alt="Quimxel Logo" className="h-12 w-auto" />}
          </Link>

          <nav className="hidden xl:flex items-center space-x-8">
            {navItems.map((item) => (
              <EditableNavLink
                key={item.key}
                contentKeyLabel={`nav.${item.key}.label`}
                contentKeyHref={`nav.${item.key}.href`}
                fallbackLabel={item.label}
                fallbackHref={item.href}
                className="text-brand-dark hover:text-brand-blue font-semibold transition-colors text-sm tracking-wide"
              />
            ))}
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
                      <Link to="/admin-products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-semibold">
                        PRODUCTOS
                      </Link>
                      <Link to="/admin-users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-semibold">
                        CLIENTES
                      </Link>
                      <Link to="/admin-orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-semibold">
                        PEDIDOS
                      </Link>
                    </div>
                  </div>
                )}

                {isAdmin && isDesktop && (
                  <Button
                    variant={isEditMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleEditMode}
                    className={isEditMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-brand-dark border-brand-dark'}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    {isEditMode ? 'Edicion activada' : 'Editar contenido'}
                  </Button>
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
              {navItems.map((item) => (
                <EditableNavLink
                  key={item.key}
                  contentKeyLabel={`nav.${item.key}.label`}
                  contentKeyHref={`nav.${item.key}.href`}
                  fallbackLabel={item.label}
                  fallbackHref={item.href}
                  className="text-brand-dark hover:text-brand-blue font-semibold py-2 px-3 rounded-lg hover:bg-brand-base/20 transition-all"
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              ))}
              {isAdmin && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link to="/admin-products" className="text-purple-700 hover:text-purple-900 font-semibold py-2 px-3 rounded-lg hover:bg-purple-100 transition-all" onClick={() => setMobileMenuOpen(false)}>
                    PRODUCTOS
                  </Link>
                  <Link to="/admin-users" className="text-purple-700 hover:text-purple-900 font-semibold py-2 px-3 rounded-lg hover:bg-purple-100 transition-all" onClick={() => setMobileMenuOpen(false)}>
                    CLIENTES
                  </Link>
                  <Link to="/admin-orders" className="text-purple-700 hover:text-purple-900 font-semibold py-2 px-3 rounded-lg hover:bg-purple-100 transition-all" onClick={() => setMobileMenuOpen(false)}>
                    PEDIDOS
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
