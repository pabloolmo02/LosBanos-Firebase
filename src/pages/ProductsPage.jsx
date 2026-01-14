
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, FileText, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getProducts } from '@/lib/products';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('cat');
  const { isApproved } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');

  useEffect(() => {
    const allProducts = getProducts();
    let filtered = allProducts;
    let finalProducts = [];

    if (selectedCategory === 'productos-certificados') {
      filtered = filtered.filter(p => p.certifications.includes('ecolabel') || p.certifications.includes('aemps'));
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (searchTerm) {
      finalProducts = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      finalProducts = filtered;
    }

    setProducts(finalProducts);
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    setSelectedCategory(category || 'all');
  }, [category]);

  const categories = [
    { value: 'all', label: 'Todos los Productos' },
    { value: 'limpieza-general', label: 'Limpieza General' },
    { value: 'lavanderia-profesional', label: 'Lavandería Profesional' },
    { value: 'industria-alimentaria', label: 'Industria Alimentaria' },
    { value: 'automocion', label: 'Automoción' },
    { value: 'sanitaria', label: 'Sanitaria' },
    { value: 'industria-construccion', label: 'Industria / Construcción' },
    { value: 'piscinas', label: 'Piscinas' },
    { value: 'sistemas-concentrados', label: 'Sistemas Concentrados' },
    { value: 'productos-certificados', label: 'Productos Certificados' },
  ];

  return (
    <>
      <Helmet>
        <title>Catálogo de Productos Químicos Profesionales Quimxel | Sevilla y Córdoba</title>
        <meta name="description" content="Catálogo completo de productos químicos profesionales certificados para HORECA, Lavandería y Limpieza Industrial. Biocidas TP2/TP4 con registro AEMPS, línea Ecolabel y más." />
      </Helmet>

      <div className="bg-slate-50 min-h-screen">
        <div
          className="text-white py-12"
          style={{
            backgroundImage: "linear-gradient(rgba(27, 24, 71, 0.75), rgba(28, 37, 107, 0.75)), url('/images/products-hero.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Catálogo de Productos</h1>
            <p className="text-xl text-blue-100">Soluciones químicas profesionales certificadas</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <div className="flex items-center space-x-2 mb-4">
                  <Filter className="h-5 w-5 text-slate-600" />
                  <span className="font-semibold text-lg" style={{ color: '#1b1847' }}>Filtros</span>
                </div>

                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === cat.value
                          ? 'font-medium'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      style={selectedCategory === cat.value ? { backgroundColor: '#a5d2f2', color: '#1b1847' } : {}}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, referencia o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {!isApproved && (
                <div className="border rounded-xl p-6 mb-6" style={{ backgroundColor: '#e3f2fd', borderColor: '#a5d2f2' }}>
                  <div className="flex items-start space-x-3">
                    <Lock className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: '#15277a' }} />
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: '#15277a' }}>Acceso Restringido a Precios</h3>
                      <p className="mb-4" style={{ color: '#1b1847' }}>
                        Los precios y la funcionalidad de compra están disponibles solo para cuentas B2B validadas.
                      </p>
                      <Button asChild>
                        <Link to="/registro">Solicitar Acceso B2B</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      to={`/producto/${product.id}`}
                      className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-200 hover:border-blue-300 group"
                    >
                      <div className="aspect-square bg-slate-100 relative overflow-hidden">
                        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={`${product.name} - Producto químico profesional`} src="https://images.unsplash.com/photo-1559223669-e0065fa7f142" />
                        {product.certifications.includes('ecolabel') && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            ECOLABEL
                          </div>
                        )}
                         {product.certifications.includes('aemps') && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            AEMPS
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="text-xs text-slate-500 mb-1">Ref: {product.reference}</div>
                        <h3 className="font-semibold mb-2 transition-colors h-12" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>
                          {product.name}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{product.description}</p>
                        
                        <div className="flex items-center justify-between">
                          {isApproved ? (
                            <span className="text-lg font-bold" style={{ color: '#15277a' }}>{product.price.toFixed(2)}€</span>
                          ) : (
                            <span className="text-sm text-slate-500 flex items-center">
                              <Lock className="h-3 w-3 mr-1" />
                              Precio B2B
                            </span>
                          )}
                          <div className="flex items-center text-sm" style={{ color: '#15277a' }}>
                            <FileText className="h-4 w-4 mr-1" />
                            <span>FDS</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-600 text-lg">No se encontraron productos con los filtros seleccionados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
