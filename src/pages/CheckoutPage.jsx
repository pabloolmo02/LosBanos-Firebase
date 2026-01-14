
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Truck, User, MapPin, Building, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getCartTotal, clearCart } from '@/lib/cart';

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const total = getCartTotal();

  if (total === 0) {
    navigate('/carrito');
    return null;
  }

  const handlePlaceOrder = () => {
    // In a real application, this would connect to a payment gateway
    // and create an order in the backend.
    
    // Simulate order placement
    clearCart();

    toast({
      title: "Pedido Realizado con Éxito",
      description: "Su pedido ha sido procesado. Recibirá una confirmación por correo electrónico.",
    });

    navigate('/dashboard');
  };

  return (
    <>
      <Helmet>
        <title>Finalizar Pedido | QUÍMICAS QUIMXEL</title>
        <meta name="description" content="Complete los datos de envío y pago para finalizar su pedido de productos químicos profesionales." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/carrito">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver al carrito
          </Link>
        </Button>
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Finalizar Pedido</h1>
        
        <div className="grid lg:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Truck className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Información de Envío</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6 text-slate-700">
                <div className="flex items-start space-x-3">
                  <Building className="h-5 w-5 mt-1 text-slate-500" />
                  <div>
                    <span className="font-semibold block">{user.company}</span>
                    <span className="text-sm">Empresa</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 mt-1 text-slate-500" />
                  <div>
                    <span className="font-semibold block">{user.email}</span>
                    <span className="text-sm">Email de contacto</span>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-start space-x-3">
                  <MapPin className="h-5 w-5 mt-1 text-slate-500" />
                  <div>
                    <span className="font-semibold block">Dirección de Envío Principal</span>
                    <span className="text-sm">Sevilla / Córdoba. Entrega 48h.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Método de Pago</h2>
              </div>
              <p className="text-slate-600">
                El método de pago será el acordado en sus condiciones de cliente B2B (transferencia bancaria, domiciliación, etc.). Un agente comercial confirmará los detalles de facturación.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
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
                  <span>Total a Facturar</span>
                  <span>{(total * 1.21).toFixed(2)}€</span>
                </div>
              </div>
              <Button size="lg" className="w-full" onClick={handlePlaceOrder}>
                Realizar Pedido
              </Button>
              <p className="text-xs text-slate-500 mt-4 text-center">
                Al hacer clic, acepta nuestros términos y condiciones de venta B2B.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
