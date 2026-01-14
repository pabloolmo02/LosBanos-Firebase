
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, FileText, Download, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/products';

const DocumentationPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const products = getProducts();

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Centro de Documentación Técnica y Legal | QUÍMICAS QUIMXEL</title>
        <meta name="description" content="Acceso centralizado a Fichas de Datos de Seguridad (FDS), fichas técnicas, certificados AEMPS y documentación legal de productos químicos profesionales Quimxel." />
      </Helmet>

      <div className="bg-slate-50 min-h-screen">
        <div className="text-white py-16" style={{
          backgroundImage: "linear-gradient(rgba(27, 24, 71, 0.75), rgba(28, 37, 107, 0.75)), url('/images/products-hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Centro de Documentación Técnica
              </h1>
              <p className="text-xl text-blue-100">
                Acceso inmediato a FDS, fichas técnicas y certificados de cumplimiento normativo
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Search className="h-6 w-6" style={{ color: '#15277a' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1b1847' }}>Buscador de Documentación</h2>
            </div>
            
            <p className="text-slate-600 mb-6">
              Busque por nombre de producto, número de referencia o palabra clave para acceder instantáneamente a toda la documentación técnica y legal.
            </p>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre de producto, referencia o palabra clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: '#1b1847' }}>{product.name}</h3>
                    <p className="text-sm text-slate-600">Ref: {product.reference}</p>
                  </div>
                  {product.certifications.includes('ecolabel') && (
                    <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                      ECOLABEL
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" style={{ color: '#15277a' }} />
                      <span className="text-sm font-medium" style={{ color: '#1b1847' }}>FDS</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" style={{ color: '#15277a' }} />
                      <span className="text-sm font-medium" style={{ color: '#1b1847' }}>Ficha Técnica</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  {product.certifications.includes('aemps') && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium" style={{ color: '#1b1847' }}>Registro AEMPS</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {product.certifications.includes('ecolabel') && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium" style={{ color: '#1b1847' }}>Certificado Ecolabel</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">No se encontraron productos con el término de búsqueda especificado.</p>
            </div>
          )}

          <div className="mt-12 border rounded-xl p-8" style={{ backgroundColor: '#e3f2fd', borderColor: '#a5d2f2' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#15277a' }}>
              ¿Necesita Asesoramiento para su Plan de Limpieza APPCC/HACCP?
            </h3>
            <p className="mb-6" style={{ color: '#1b1847' }}>
              Nuestro equipo técnico está disponible para ayudarle a elaborar un plan de limpieza y desinfección que cumpla con todos los requisitos normativos de su sector.
            </p>
            <Button size="lg">
              Solicitar Asesoramiento Gratuito
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentationPage;
