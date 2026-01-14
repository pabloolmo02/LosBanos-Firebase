
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, FileText, Download, Package, Truck, Shield, ChevronLeft, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getProductById } from '@/lib/products';
import { addToCart } from '@/lib/cart';

const ProductDetailPage = () => {
  const { id } = useParams();
  const product = getProductById(id);
  const { isApproved } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Producto no encontrado</h2>
        <Button asChild>
          <Link to="/productos">Volver al catálogo</Link>
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isApproved) {
      toast({
        title: "Acceso Restringido",
        description: "Necesita una cuenta B2B aprobada para realizar compras.",
        variant: "destructive"
      });
      return;
    }

    addToCart(product, quantity);
    toast({
      title: "Producto añadido",
      description: `${quantity}x ${product.name} añadido al carrito`
    });
  };

  return (
    <>
      <Helmet>
        <title>{product.name} - {product.reference} | Productos Químicos Quimxel</title>
        <meta name="description" content={`${product.description} - Producto químico profesional certificado para ${product.sector}. Documentación técnica y FDS disponibles.`} />
      </Helmet>

      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/productos">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver al catálogo
            </Link>
          </Button>

          <div className="grid lg:grid-cols-2 gap-12 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="aspect-square bg-slate-100">
                  <img 
                    className="w-full h-full object-cover" 
                    alt={`${product.name} - Producto químico profesional certificado`}
                   src="https://images.unsplash.com/photo-1679104143774-d72d83a2a037" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 flex-grow">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {product.category.toUpperCase()}
                  </span>
                  {product.certifications.includes('ecolabel') && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      ECOLABEL
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
                <p className="text-slate-600 mb-6">Referencia: {product.reference}</p>

                <p className="text-lg text-slate-700 mb-6">{product.description}</p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3 text-slate-700">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span>Sector: {product.sector}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-700">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span>Uso: {product.usage}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-700">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-green-600">Stock disponible - Entrega en 48h</span>
                  </div>
                </div>

                {isApproved ? (
                  <>
                    <div className="border-t border-slate-200 pt-6 mb-6">
                      <div className="flex items-baseline space-x-2 mb-6">
                        <span className="text-4xl font-bold text-blue-600">{product.price}€</span>
                        <span className="text-slate-600">/ unidad</span>
                      </div>

                      <div className="flex items-center space-x-4 mb-6">
                        <span className="text-slate-700 font-medium">Cantidad:</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-semibold">{quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity(quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Button size="lg" className="w-full" onClick={handleAddToCart}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Añadir al Carrito
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-slate-200 pt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-blue-900 font-medium mb-2">Acceso Restringido a Precios</p>
                      <p className="text-blue-800 text-sm">
                        Solicite una cuenta B2B para ver precios y realizar pedidos.
                      </p>
                    </div>
                    <Button size="lg" className="w-full" asChild>
                      <Link to="/registro">Solicitar Acceso B2B</Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <Tabs defaultValue="documentation" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="documentation">Documentación Técnica</TabsTrigger>
                <TabsTrigger value="technical">Ficha Técnica</TabsTrigger>
                <TabsTrigger value="logistics">Logística</TabsTrigger>
              </TabsList>

              <TabsContent value="documentation" className="mt-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Documentación Legal y Certificados</h3>
                <p className="text-slate-600 mb-6">
                  Descargue toda la documentación técnica y legal necesaria para el cumplimiento normativo.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-semibold text-slate-900">Ficha de Datos de Seguridad</p>
                          <p className="text-sm text-slate-600">FDS actualizada</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-semibold text-slate-900">Ficha Técnica</p>
                          <p className="text-sm text-slate-600">Dosis y aplicación</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {product.certifications.includes('aemps') && (
                    <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="font-semibold text-slate-900">Registro AEMPS</p>
                            <p className="text-sm text-slate-600">Biocida certificado</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {product.certifications.includes('ecolabel') && (
                    <div className="border border-slate-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="font-semibold text-slate-900">Certificado Ecolabel</p>
                            <p className="text-sm text-slate-600">Sostenibilidad certificada</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="technical" className="mt-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Información Técnica</h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold text-slate-900">Dilución recomendada:</span>
                    <p className="text-slate-700 mt-1">{product.dilution}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-slate-900">Modo de aplicación:</span>
                    <p className="text-slate-700 mt-1">{product.application}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-slate-900">Sector de aplicación:</span>
                    <p className="text-slate-700 mt-1">{product.sector}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900">Uso primario:</span>
                    <p className="text-slate-700 mt-1">{product.usage}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="logistics" className="mt-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Información Logística</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Package className="h-6 w-6 text-green-600" />
                      <span className="font-semibold text-green-900">Stock Disponible</span>
                    </div>
                    <p className="text-green-800">
                      Producto disponible en almacén regional de Sevilla y Córdoba
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Truck className="h-6 w-6 text-blue-600" />
                      <span className="font-semibold text-blue-900">Entrega Garantizada</span>
                    </div>
                    <p className="text-blue-800">
                      Entrega en 48 horas en Sevilla y Córdoba
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">
                    <strong>Nota:</strong> Los tiempos de entrega pueden variar según la ubicación exacta y disponibilidad. 
                    Para pedidos urgentes o grandes volúmenes, contacte con nuestro equipo comercial.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
