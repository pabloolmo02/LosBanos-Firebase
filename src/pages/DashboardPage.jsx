
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, FileText, Repeat, LogOut, Info, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders } from '@/services/orderService'; 

const DashboardPage = () => {
  const { user, logout, isApproved } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
        if (user?.uid) {
            const userOrders = await getUserOrders(user.uid);
            setOrders(userOrders);
        }
        setLoadingOrders(false);
    };
    
    if (isApproved) {
        fetchOrders();
    } else {
        setLoadingOrders(false);
    }
  }, [user, isApproved]);

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
      <Helmet><title>Panel de Cliente | Quimxel</title></Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Panel de Cliente</h1>
        <p className="text-xl text-slate-600 mb-8">Bienvenido, {user.company || user.email}</p>

        {!isApproved && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 flex items-start space-x-3">
              <Info className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Cuenta Pendiente de Aprobación</h3>
                <p className="text-yellow-800">Su cuenta está siendo revisada. Recibirá una notificación cuando sea aprobada.</p>
              </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center space-x-3 mb-4">
                <User className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-slate-900">Mi Cuenta</h2>
              </div>
              <div className="space-y-2 text-slate-700 text-sm">
                <p><span className="font-semibold">Empresa:</span> {user.company || '-'}</p>
                <p><span className="font-semibold">CIF/NIF:</span> {user.cif || '-'}</p>
                <p><span className="font-semibold">Email:</span> {user.email}</p>
                <p><span className="font-semibold">Sector:</span> {user.sector || '-'}</p>
                <div className="pt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {isApproved ? 'CUENTA ACTIVA' : 'PENDIENTE'}
                    </span>
                    {user.role === 'admin' && <span className="ml-2 px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">ADMIN</span>}
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
              </Button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-slate-900">Accesos Rápidos</h2>
              </div>
              <div className="space-y-3">
                <Button variant="ghost" asChild className="w-full justify-start"><Link to="/productos">Ver Catálogo</Link></Button>
                <Button variant="ghost" asChild className="w-full justify-start"><Link to="/documentacion">Buscador de Documentación</Link></Button>
                {user.role === 'admin' && <Button variant="ghost" asChild className="w-full justify-start text-purple-700 hover:text-purple-900 hover:bg-purple-50"><Link to="/admin-users"><Shield className="w-4 h-4 mr-2"/> Gestión Usuarios</Link></Button>}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center space-x-3 mb-6">
              <Repeat className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-slate-900">Historial de Solicitudes</h2>
            </div>
            
            {loadingOrders ? (
                <p className="text-center py-8">Cargando...</p>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-900">Ref: {order.id.slice(0,8).toUpperCase()}</p>
                      <p className="text-sm text-slate-600">Fecha: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-center my-2 sm:my-0">
                      <p className="font-medium text-slate-700">{order.items?.length || 0} artículos</p>
                    </div>
                    <div className="text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold uppercase">{order.status || 'Recibido'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                   <p className="text-slate-500 mb-4">No ha realizado ninguna solicitud aún.</p>
                   {isApproved && <Button asChild><Link to="/productos">Nueva Solicitud</Link></Button>}
               </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
