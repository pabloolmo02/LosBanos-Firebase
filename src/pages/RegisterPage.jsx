
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Building, FileText, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    cif: '',
    email: '',
    password: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    register(formData);

    toast({
      title: "Solicitud de registro enviada",
      description: "Su solicitud ha sido enviada. Un administrador la revisará y recibirá una notificación cuando su cuenta sea aprobada.",
    });

    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>Solicitar Acceso B2B | QUÍMICAS QUIMXEL</title>
        <meta name="description" content="Regístrese para obtener una cuenta profesional B2B. Acceda a precios exclusivos, soporte técnico y pedidos rápidos en QUÍMICAS QUIMXEL." />
      </Helmet>

      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Solicitud de Acceso B2B</h1>
              <p className="text-slate-600 mt-2">
                Rellene el formulario para solicitar una cuenta profesional. Las cuentas se validan manualmente.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="companyName">
                  Nombre de la Empresa
                </label>
                <div className="relative mt-1">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input id="companyName" type="text" required onChange={handleChange} value={formData.companyName} placeholder="Nombre de su empresa S.L." className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="cif">
                  NIF/CIF
                </label>
                <div className="relative mt-1">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input id="cif" type="text" required onChange={handleChange} value={formData.cif} placeholder="A12345678" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="email">
                  Correo Electrónico de Contacto
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input id="email" type="email" required onChange={handleChange} value={formData.email} placeholder="compras@su-empresa.com" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="password">
                  Crear Contraseña
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input id="password" type="password" required onChange={handleChange} value={formData.password} placeholder="••••••••" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <Button size="lg" type="submit" className="w-full">
                Enviar Solicitud
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-slate-600">
                ¿Ya tiene una cuenta?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:underline">
                  Inicie sesión aquí
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;
