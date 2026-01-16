
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Lock, ShoppingCart } from 'lucide-react'; // Cambiado ShoppingBag a ShoppingCart
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getAllProducts, getProductsByCategory } from '@/services/productService'; 

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('cat');
  const { isApproved } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let fetchedProducts = [];
      
      try {
        if (selectedCategory === 'all' || selectedCategory === 'productos-certificados') {
          fetchedProducts = await getAllProducts();
        } else {
          fetchedProducts = await getProductsByCategory(selectedCategory);
        }

        let filtered = fetchedProducts;
        
        if (selectedCategory === 'productos-certificados') {
          filtered = filtered.filter(p => p.certifications && (p.certifications.includes('ecolabel') || p.certifications.includes('aemps')));
        }
        
        if (searchTerm) {
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.reference.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setProducts(filtered);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
        <title>Catálogo de Productos | Quimxel B2B</title>
      </Helmet>

      <div className="bg-slate-50 min-h-screen">
        <div className="text-white py-12 bg-cover bg-center" style={{ backgroundImage: "url('/images/products-hero.jpg')" }}>
          <div className="container mx-auto px-4"><h1 className="text-4xl font-bold">Catálogo</h1></div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 border">
                <h2 className="font-semibold text-lg mb-4 flex items-center"><Filter className="h-5 w-5 mr-2" /> Filtros</h2>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button key={cat.value} onClick={() => setSelectedCategory(cat.value)} className={`w-full text-left px-4 py-2 rounded-lg ${selectedCategory === cat.value ? 'bg-blue-100 text-blue-800 font-bold' : 'hover:bg-slate-100'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border"><input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-4 pr-4 py-2 border-none focus:ring-0" /></div>

              {loading ? (
                 <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <motion.div key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                      <Link to={`/producto/${product.id}`} className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border group">
                        
                        <div className="aspect-square relative bg-cover bg-center p-2" style={{ backgroundImage: "url('/images/ProductBackground.PNG')" }}>
                            <img 
                                className="w-full h-full object-contain transition-transform group-hover:scale-105" 
                                alt={product.name}
                                src={product.images && product.images[0] ? product.images[0] : ""}
                            />
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold h-12">{product.name}</h3>
                          {/* SIN PRECIO */}
                          {isApproved ? (
                            <div className="flex items-center text-blue-700 font-medium text-sm">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Disponible para pedido
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500"><Lock className="h-3 w-3 inline mr-1" /> Acceso B2B</span>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
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
