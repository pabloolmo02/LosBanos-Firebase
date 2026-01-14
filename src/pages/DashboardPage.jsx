
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, FileText, Repeat, LogOut, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const DashboardPage = () => {
  const { user, isApproved } = useAuth();

  const pastOrders = [
    { id: 'ORD-001', date: '2025-10-20', total: '145.50€', status: 'Entregado' },
    { id: 'ORD-002', date: '2025-10-15', total: '210.00€', status: 'Entregado' },
  ];

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Por favor, inicie sesión.</h1>
        <Button asChild className="mt-4"><Link to="/login">Ir a Iniciar Sesión</Link></Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Panel de Cliente | QUÍMICAS QUIMXEL</title>
        <meta name="description" content="Gestione su cuenta B2B, vea su historial de pedidos, repita pedidos anteriores y acceda a su información." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Panel de Cliente</h1>
        <p className="text-xl text-slate-600 mb-8">Bienvenido, {user.company || user.email}</p>

        {!isApproved && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Info className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Cuenta Pendiente de Aprobación</h3>
                <p className="text-yellow-800">
                  Su cuenta está siendo revisada por un administrador. Recibirá una notificación cuando sea aprobada. 
                  Una vez aprobada, podrá acceder a los precios y realizar pedidos.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-slate-900">Mi Cuenta</h2>
              </div>
              <div className="space-y-2 text-slate-700">
                <p><span className="font-semibold">Empresa:</span> {user.company}</p>
                <p><span className="font-semibold">CIF/NIF:</span> {user.cif}</p>
                <p><span className="font-semibold">Email:</span> {user.email}</p>
                <p><span className="font-semibold">Estado:</span> <span className={`font-bold ${isApproved ? 'text-green-600' : 'text-yellow-600'}`}>{isApproved ? 'Aprobada' : 'Pendiente'}</span></p>
              </div>
              <Button variant="outline" className="w-full mt-6">
                <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
              </Button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-slate-900">Accesos Rápidos</h2>
              </div>
              <div className="space-y-3">
                <Button variant="ghost" asChild className="w-full justify-start"><Link to="/productos">Ver Catálogo</Link></Button>
                <Button variant="ghost" asChild className="w-full justify-start"><Link to="/documentacion">Buscador de Documentación</Link></Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Repeat className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-slate-900">Historial de Pedidos</h2>
            </div>
            
            {isApproved ? (
              <div className="space-y-4">
                {pastOrders.map(order => (
                  <div key={order.id} className="border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-900">{order.id}</p>
                      <p className="text-sm text-slate-600">Fecha: {order.date}</p>
                    </div>
                    <div className="text-center my-2 sm:my-0">
                      <p className="font-bold text-lg">{order.total}</p>
                    </div>
                    <div className="text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">{order.status}</span>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 sm:mt-0">
                      <Repeat className="mr-2 h-4 w-4"/> Repetir Pedido
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-slate-600 text-center py-8">Su historial de pedidos aparecerá aquí una vez que su cuenta sea aprobada y realice su primer pedido.</p>
            )}

          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
