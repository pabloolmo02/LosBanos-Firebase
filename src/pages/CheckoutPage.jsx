
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, CreditCard, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getCart, clearCart } from '@/lib/cart';
import { createOrder } from '@/services/orderService';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.jsx"; // Extensión explícita
import { Label } from "@/components/ui/label.jsx";
import { Input } from "@/components/ui/input.jsx";
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = "service_id"; 
const EMAILJS_TEMPLATE_ID_ORDER = "template_id_order"; 
const EMAILJS_PUBLIC_KEY = "public_key";

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const cart = getCart();
  const [loading, setLoading] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');

  if (cart.length === 0) {
    return (
        <div className="container mx-auto px-4 py-20 text-center">
            <h2 className="text-2xl font-bold mb-4">No hay pedido en curso</h2>
            <Button asChild><Link to="/productos">Volver al catálogo</Link></Button>
        </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
        const orderData = {
            userId: user.uid,
            userEmail: user.email,
            company: user.company,
            items: cart.map(i => ({ id: i.id, name: i.name, reference: i.reference, quantity: i.quantity })), // Solo guardamos info relevante
            // total: 0, // No guardamos total
            paymentMethod: paymentMethod,
            shippingAddress: shippingAddress || 'Dirección Principal Cliente',
            notes: notes,
            status: 'pendiente',
            createdAt: new Date().toISOString()
        };

        const orderId = await createOrder(orderData);

        if (EMAILJS_SERVICE_ID !== "service_id") {
            const templateParams = {
                order_id: orderId,
                customer_name: user.company || user.email,
                customer_email: user.email,
                // total_amount: "Pendiente de valorar",
                order_items: cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
                payment_method: paymentMethod,
                notes: notes
            };
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_ORDER, templateParams, EMAILJS_PUBLIC_KEY);
        }

        clearCart();
        
        toast({
            title: "¡Solicitud Enviada!",
            description: `Ref: ${orderId}. Contactaremos con usted para confirmar precios y entrega.`,
        });

        navigate('/dashboard');

    } catch (error) {
        console.error("Error al procesar pedido:", error);
        toast({ title: "Error", description: "Hubo un problema. Inténtelo de nuevo.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Confirmar Solicitud | Quimxel</title></Helmet>

      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-6"><Link to="/carrito"><ChevronLeft className="mr-2 h-4 w-4" /> Volver</Link></Button>
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Confirmar Solicitud</h1>
        
        <div className="grid lg:grid-cols-3 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-8">
            
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="flex items-center space-x-3 mb-6">
                <Truck className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Datos de Entrega</h2>
              </div>
              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div><Label>Empresa</Label><Input value={user?.company || ''} disabled className="bg-slate-50" /></div>
                    <div><Label>Email</Label><Input value={user?.email || ''} disabled className="bg-slate-50" /></div>
                </div>
                <div><Label>Dirección de Entrega</Label><Input placeholder="Calle, Ciudad, CP..." value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} /></div>
                <div><Label>Notas (Horario, etc.)</Label><Input placeholder="Instrucciones especiales..." value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Forma de Pago Preferida</h2>
              </div>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <RadioGroupItem value="transferencia" id="r1" />
                  <Label htmlFor="r1" className="cursor-pointer">Transferencia (A la recepción de factura)</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <RadioGroupItem value="domiciliacion" id="r2" />
                  <Label htmlFor="r2" className="cursor-pointer">Domiciliación Bancaria (Habitual)</Label>
                </div>
              </RadioGroup>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Resumen</h2>
              <div className="space-y-3 mb-6 text-sm text-slate-600">
                {cart.map(item => (
                    <div key={item.id} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                    </div>
                ))}
                <div className="border-t my-4 pt-4 text-center font-medium text-slate-800">
                    Precios según tarifa vigente acordada.
                </div>
              </div>
              
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
