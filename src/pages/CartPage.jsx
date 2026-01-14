
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCart, updateCartItemQuantity, removeFromCart, getCartTotal } from '@/lib/cart';
import { useToast } from '@/components/ui/use-toast';

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const cartItems = getCart();
    setCart(cartItems);
    setTotal(getCartTotal());
  }, []);

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    const updatedCart = updateCartItemQuantity(id, quantity);
    setCart(updatedCart);
    setTotal(getCartTotal());
  };

  const handleRemoveItem = (id, name) => {
    const updatedCart = removeFromCart(id);
    setCart(updatedCart);
    setTotal(getCartTotal());
    toast({
      title: "Producto eliminado",
      description: `${name} ha sido eliminado del carrito.`,
    });
  };

  return (
    <>
      <Helmet>
        <title>Carrito de Compra | QUÍMICAS QUIMXEL</title>
        <meta name="description" content="Revise y gestione los productos en su carrito de compra. Finalice su pedido de productos químicos profesionales." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center space-x-3 mb-8">
          <ShoppingCart className="h-8 w-8 text-slate-900" />
          <h1 className="text-4xl font-bold text-slate-900">Carrito de Compra</h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">Su carrito está vacío</h2>
            <p className="text-slate-600 mb-6">Añada productos para poder finalizar su pedido.</p>
            <Button asChild>
              <Link to="/productos">Ir al catálogo de productos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Productos en su pedido</h2>
              <div className="space-y-6">
                {cart.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="flex flex-col sm:flex-row items-center justify-between"
                  >
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                      <img src="https://images.unsplash.com/photo-1679104143774-d72d83a2a037" alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                      <div>
                        <Link to={`/producto/${item.id}`} className="font-semibold text-slate-900 hover:text-blue-600">{item.name}</Link>
                        <p className="text-sm text-slate-600">Ref: {item.reference}</p>
                        <p className="text-sm text-slate-600">{item.price.toFixed(2)}€ / unidad</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-semibold">{item.quantity}</span>
                        <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className="font-bold text-lg w-24 text-right">{(item.price * item.quantity).toFixed(2)}€</span>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id, item.name)}>
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Resumen del Pedido</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>IVA (21%)</span>
                    <span>{(total * 0.21).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl text-slate-900 pt-3 border-t border-slate-200">
                    <span>Total</span>
                    <span>{(total * 1.21).toFixed(2)}€</span>
                  </div>
                </div>
                <Button size="lg" className="w-full" onClick={() => navigate('/checkout')}>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceder al Pago
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
