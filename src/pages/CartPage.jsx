
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCart, updateCartItemQuantity, removeFromCart } from '@/lib/cart';
import { useToast } from '@/components/ui/use-toast';

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCart(updateCartItemQuantity(id, quantity));
  };

  const handleRemoveItem = (id, name) => {
    setCart(removeFromCart(id));
    toast({ title: "Producto eliminado", description: `${name} ha sido eliminado.` });
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <Helmet><title>Solicitud de Pedido | Quimxel</title></Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center space-x-3 mb-8">
          <ShoppingCart className="h-8 w-8 text-slate-900" />
          <h1 className="text-4xl font-bold text-slate-900">Solicitud de Pedido</h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">No hay productos seleccionados</h2>
            <Button asChild><Link to="/productos">Ir al catálogo</Link></Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Artículos seleccionados</h2>
              <div className="space-y-6">
                {cart.map(item => (
                  <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }} className="flex flex-col sm:flex-row items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0 w-full sm:w-auto">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.images && item.images[0] ? item.images[0] : ""} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <Link to={`/producto/${item.id}`} className="font-semibold text-slate-900 hover:text-blue-600 block">{item.name}</Link>
                        <p className="text-sm text-slate-500">Ref: {item.reference}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2 bg-slate-50 rounded-lg p-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveItem(item.id, item.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Resumen</h2>
                <div className="space-y-3 mb-6 text-slate-700">
                  <div className="flex justify-between">
                    <span>Artículos totales:</span>
                    <span className="font-bold">{totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Referencias distintas:</span>
                    <span className="font-bold">{cart.length}</span>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-800">
                    <p>Los precios finales y condiciones de transporte se calcularán al procesar su pedido.</p>
                </div>
                <Button size="lg" className="w-full" onClick={() => navigate('/checkout')}>
                  Continuar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;
