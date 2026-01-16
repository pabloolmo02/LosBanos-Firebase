
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, FileText, Download, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getAllProducts } from '@/services/productService'; // Usar servicio Firebase

const DocumentationPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        const data = await getAllProducts();
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
        setFilteredProducts(products);
    } else {
        setFilteredProducts(products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.reference.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    }
  }, [searchTerm, products]);

  const handleUnavailable = (docType) => {
      toast({
          title: "No disponible",
          description: `El documento ${docType} no está digitalizado.`,
          duration: 2000,
      });
  };

  return (
    <>
      <Helmet>
        <title>Centro de Documentación Técnica y Legal | QUÍMICAS QUIMXEL</title>
      </Helmet>

      <div className="bg-slate-50 min-h-screen">
        <div className="text-white py-16" style={{ backgroundImage: "linear-gradient(rgba(27, 24, 71, 0.75), rgba(28, 37, 107, 0.75)), url('/images/products-hero.jpg')", backgroundSize: 'cover' }}>
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">Centro de Documentación</h1>
              <p className="text-xl text-blue-100">Buscador de Fichas Técnicas y FDS</p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-slate-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre de producto o referencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>
          </div>

          {loading ? (
              <div className="text-center py-12">Cargando documentación...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.slice(0, 50).map((product, index) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 p-6"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-slate-900">{product.name}</h3>
                            <p className="text-sm text-slate-500">Ref: {product.reference}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Ficha Técnica */}
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Ficha Técnica</span>
                            </div>
                            {product.technicalSheetUrl ? (
                                <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                    <a href={product.technicalSheetUrl} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                            ) : (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleUnavailable("Ficha Técnica")}>
                                    <AlertCircle className="h-4 w-4 text-slate-300" />
                                </Button>
                            )}
                        </div>

                        {/* FDS */}
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors">
                            <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Ficha Seguridad</span>
                            </div>
                            {product.safetySheetUrl ? (
                                <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                    <a href={product.safetySheetUrl} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                            ) : (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleUnavailable("Ficha Seguridad")}>
                                    <AlertCircle className="h-4 w-4 text-slate-300" />
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DocumentationPage;
