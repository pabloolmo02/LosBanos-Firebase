
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, FileText, Download, Shield, ChevronLeft, Plus, Minus, AlertCircle } from 'lucide-react'; // ShoppingBag quitado
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getProductById } from '@/services/productService'; 
import { addToCart } from '@/lib/cart';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isApproved } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
     return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }
  if (!product) return <div className="text-center py-20"><h2 className="text-2xl font-bold">Producto no encontrado</h2></div>;

  const handleUnavailableDoc = () => toast({ title: "Documentación no disponible", duration: 3000 });

  return (
    <>
      <Helmet><title>{product.name} | Quimxel B2B</title></Helmet>
      <div className="bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" asChild className="mb-6"><Link to="/productos"><ChevronLeft className="mr-2 h-4 w-4" /> Volver</Link></Button>

          <div className="grid lg:grid-cols-2 gap-12 mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border">
                <div className="aspect-square relative bg-cover bg-center p-4" style={{ backgroundImage: "url('/images/ProductBackground.PNG')" }}>
                  <img className="w-full h-full object-contain" alt={product.name} src={product.images && product.images[0] ? product.images[0] : ""} />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-white rounded-2xl shadow-lg p-8 h-full">
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-slate-500 mb-6 font-mono">Ref: {product.reference}</p>
                <p className="text-lg mb-6">{product.description}</p>
                
                {isApproved ? (
                  <div className="border-t pt-6">
                      <div className="flex items-center space-x-4 mb-6">
                        <span className="font-medium">Cantidad:</span>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                          <span className="w-12 text-center font-semibold">{quantity}</span>
                          <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <Button size="lg" className="w-full" onClick={() => addToCart(product, quantity)}>
                        <ShoppingCart className="mr-2 h-5 w-5" /> Añadir a Pedido
                      </Button>
                  </div>
                ) : (
                  <div className="border-t pt-6"><Button size="lg" className="w-full" asChild><Link to="/registro">Solicitar Acceso</Link></Button></div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <Tabs defaultValue="documentation" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="documentation">Documentación</TabsTrigger>
                <TabsTrigger value="technical">Datos Técnicos</TabsTrigger>
              </TabsList>
              <TabsContent value="documentation" className="mt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 flex items-center justify-between">
                    <p className="font-semibold flex items-center"><FileText className="mr-2 h-5 w-5 text-blue-600"/> Ficha Técnica</p>
                    {product.technicalSheetUrl ? (
                        <Button variant="outline" asChild><a href={product.technicalSheetUrl} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a></Button>
                    ) : (
                        <Button variant="ghost" onClick={handleUnavailableDoc}><AlertCircle className="h-4 w-4 text-slate-400" /></Button>
                    )}
                  </div>
                  <div className="border rounded-lg p-4 flex items-center justify-between">
                    <p className="font-semibold flex items-center"><Shield className="mr-2 h-5 w-5 text-blue-600"/> Ficha de Seguridad (FDS)</p>
                    <Button variant="ghost" onClick={handleUnavailableDoc}><AlertCircle className="h-4 w-4 text-slate-400" /></Button>
                  </div>
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
