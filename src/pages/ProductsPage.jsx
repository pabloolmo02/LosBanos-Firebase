
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Lock, ShoppingCart, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getAllProducts, getProductsByCategory } from '@/services/productService'; 

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation(); // Hook para obtener la location actual
  const category = searchParams.get('cat');
  const { isApproved } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [isLimpiezaGeneralExpanded, setIsLimpiezaGeneralExpanded] = useState(false); // State for collapsible menu
  const [loading, setLoading] = useState(true);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let fetchedProducts = [];
        // Always fetch all needed products first to determine subcategories
        if (selectedCategory === 'all' || selectedCategory === 'productos-certificados') {
          fetchedProducts = await getAllProducts();
        } else {
          fetchedProducts = await getProductsByCategory(selectedCategory);
        }
        setProducts(fetchedProducts);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [selectedCategory]);

  // Effect to update subcategories and filtered list
  useEffect(() => {
    let result = products;

    // Filter by Special Categories (Certificados)
    if (selectedCategory === 'productos-certificados') {
      result = result.filter(p => p.certifications && (p.certifications.includes('ecolabel') || p.certifications.includes('aemps')));
    }

    // Determine available subcategories for the current view
    if (selectedCategory === 'limpieza-general') {
        const uniqueUsages = [...new Set(result.map(p => p.usage).filter(Boolean))].sort();
        setSubcategories(uniqueUsages);
    } else {
        setSubcategories([]);
        setSelectedSubcategory('all'); // Reset subcategory if leaving Limpieza General
    }

    // Filter by Subcategory (Usage)
    if (selectedCategory === 'limpieza-general' && selectedSubcategory !== 'all') {
        result = result.filter(p => p.usage === selectedSubcategory);
    }

    // Filter by Search Term
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, selectedSubcategory, searchTerm]);

  useEffect(() => {
    setSelectedCategory(category || 'all');
    setSelectedSubcategory('all'); // Reset subcategory when URL param changes
    
    // Auto-expand if category is Limpieza General
    if (category === 'limpieza-general') {
        setIsLimpiezaGeneralExpanded(true);
    } else {
        setIsLimpiezaGeneralExpanded(false);
    }
  }, [category]);

  const handleCategoryClick = (catValue) => {
      if (catValue === 'limpieza-general') {
          // If already selected, toggle expansion
          if (selectedCategory === 'limpieza-general') {
              setIsLimpiezaGeneralExpanded(!isLimpiezaGeneralExpanded);
          } else {
              // If not selected, select it and expand
              setSelectedCategory('limpieza-general');
              setIsLimpiezaGeneralExpanded(true);
          }
      } else {
          setSelectedCategory(catValue);
          setIsLimpiezaGeneralExpanded(false); // Collapse when moving to another category
      }
  };

  const categories = [
    { value: 'all', label: 'Todos los Productos' },
    { value: 'limpieza-general', label: 'HORECA' }, // Visualmente HORECA, internamente limpieza-general
    { value: 'lavanderia-profesional', label: 'Lavandería Profesional' },
    { value: 'industria-alimentaria', label: 'Industria Alimentaria' },
    { value: 'automocion', label: 'Automoción' },
    { value: 'sanitaria', label: 'Sanitaria' },
    { value: 'industria-construccion', label: 'Industria / Construcción' },
    { value: 'piscinas', label: 'Piscinas' },
    { value: 'sistemas-concentrados', label: 'Sistemas Concentrados' },
    { value: 'productos-certificados', label: 'Productos Certificados' },
  ];

  // Helper to safely format price
  const formatPrice = (price) => {
      return (typeof price === 'number') ? price.toFixed(2) : '0.00';
  };

  return (
    <>
      <Helmet><title>Catálogo | Los Baños</title></Helmet>

      <div className="bg-slate-50 min-h-screen">
        <div className="text-white py-12 bg-cover bg-center relative" style={{ backgroundImage: "url('/images/products-hero.jpg')" }}>
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="container mx-auto px-4 relative z-10"><h1 className="text-4xl font-bold">Catálogo</h1></div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1 space-y-6">
              {/* Main Categories */}
              <div className="bg-white rounded-xl shadow-sm p-6 border sticky top-24 flex flex-col max-h-[calc(100vh-8rem)]">
                {/* Header Fijo */}
                <div className="pb-2 border-b border-gray-100 bg-white z-20">
                    <h2 className="font-semibold text-lg flex items-center"><Filter className="h-5 w-5 mr-2" /> Filtros</h2>
                </div>
                
                {/* Lista Scrollable */}
                <div className="pt-2 overflow-y-auto custom-scrollbar flex-1">
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <div key={cat.value}>
                          <button 
                              onClick={() => handleCategoryClick(cat.value)} 
                              className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm flex justify-between items-center ${selectedCategory === cat.value ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-100 text-slate-700'}`}
                          >
                            {cat.label}
                            {cat.value === 'limpieza-general' && (
                                <ChevronDown 
                                  className={`h-4 w-4 transition-transform duration-200 ${isLimpiezaGeneralExpanded ? 'rotate-180' : ''}`} 
                                />
                            )}
                          </button>

                          {/* Nested Subcategories for Limpieza General */}
                          {cat.value === 'limpieza-general' && isLimpiezaGeneralExpanded && subcategories.length > 0 && (
                              <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-1 ml-4 border-l-2 border-blue-100 pl-2 space-y-1 overflow-hidden"
                              >
                                  <button
                                      onClick={() => setSelectedSubcategory('all')}
                                      className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors ${selectedSubcategory === 'all' ? 'text-blue-700 font-bold bg-blue-50' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'}`}
                                  >
                                      Ver todo
                                  </button>
                                  {subcategories.map((sub) => (
                                      <button
                                          key={sub}
                                          onClick={() => setSelectedSubcategory(sub)}
                                          className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors ${selectedSubcategory === sub ? 'text-blue-700 font-bold bg-blue-50' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'}`}
                                      >
                                          {sub}
                                      </button>
                                  ))}
                              </motion.div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border"><input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-4 pr-4 py-2 border-none focus:ring-0" /></div>

              {loading ? (
                 <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
              ) : (
                <>
                    <div className="mb-4 text-sm text-slate-500">
                        Mostrando {filteredProducts.length} productos
                        {selectedSubcategory !== 'all' && <span className="font-medium text-slate-800"> en "{selectedSubcategory}"</span>}
                    </div>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <motion.div key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Link 
                            to={`/producto/${product.id}`} 
                            state={{ fromCategory: selectedCategory }} // Pasamos el estado aquí
                            className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border group overflow-hidden h-full flex flex-col"
                        >
                            
                            <div className="aspect-square relative bg-cover bg-center p-4 flex items-center justify-center border-b" style={{ backgroundImage: "url('/images/ProductBackground.PNG')" }}>
                                {product.images && product.images[0] ? (
                                    <img 
                                        className="w-full h-full object-contain transition-transform group-hover:scale-105" 
                                        alt={product.name}
                                        src={product.images[0]}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <div className="text-center">
                                            <span className="block text-4xl mb-2 opacity-50">🧴</span>
                                            <span className="text-xs uppercase font-medium">Sin imagen</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4 flex-grow flex flex-col">
                            <div className="mb-2">
                                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{product.reference}</span>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                                {product.name}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">{product.description}</p>
                            
                            <div className="mt-auto pt-3 border-t border-slate-100">
                                {isApproved ? (
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-900 text-lg">
                                            {product.variants && product.variants.length > 1 ? (
                                                <span className="text-sm font-normal text-slate-500 mr-1">Desde</span>
                                            ) : null}
                                            {formatPrice(product.price)}€
                                        </span>
                                        <div className="flex items-center text-blue-700 font-medium text-xs bg-blue-50 px-2 py-1 rounded-full">
                                            <ShoppingCart className="h-3 w-3 mr-1" /> Pedir
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center text-slate-400 text-sm">
                                        <Lock className="h-3 w-3 mr-1" /> 
                                        <span>Precio oculto</span>
                                    </div>
                                )}
                            </div>
                            </div>
                        </Link>
                        </motion.div>
                    ))}
                    </div>
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                            <p className="text-slate-500 text-lg">No se encontraron productos con estos filtros.</p>
                            <button onClick={() => { setSearchTerm(''); setSelectedSubcategory('all'); }} className="text-blue-600 font-medium mt-2 hover:underline">
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
