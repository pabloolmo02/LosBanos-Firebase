
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // This is a placeholder for actual authentication
    // In a real app, you would validate credentials against a backend/service
    const mockUser = {
      id: '123',
      email,
      name: 'Usuario B2B',
      status: 'approved', // 'approved' for demo, could be 'pending'
      company: 'Mi Empresa S.L.',
      cif: 'B12345678',
    };
    
    login(mockUser);
    
    toast({
      title: 'Inicio de sesión exitoso',
      description: 'Bienvenido de nuevo.',
    });
    
    navigate('/dashboard');
  };

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión - Acceso B2B | QUÍMICAS QUIMXEL</title>
        <meta name="description" content="Acceda a su cuenta profesional B2B para ver precios personalizados, realizar pedidos y gestionar su cuenta en la plataforma de QUÍMICAS QUIMXEL." />
      </Helmet>

      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <LogIn className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Acceso Profesional B2B</h1>
              <p className="text-slate-600 mt-2">Inicie sesión para acceder a sus tarifas y realizar pedidos.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="email">
                  Correo Electrónico
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="su-email@empresa.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="password">
                  Contraseña
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <Button size="lg" type="submit" className="w-full">
                Iniciar Sesión
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-slate-600">
                ¿No tiene una cuenta?{' '}
                <Link to="/registro" className="font-medium text-blue-600 hover:underline">
                  Solicite acceso B2B
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
