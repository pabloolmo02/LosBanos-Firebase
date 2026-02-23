import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Package, Users, Database, LogOut } from 'lucide-react';

const AdminDashboardPage = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Cargando...</h2>
        </div>
      </div>
    );
  }

  // Verificar que el usuario sea admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center max-w-md p-8">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Acceso Denegado</h2>
          <p className="text-red-600 mb-6">No tienes permisos para acceder al panel de administración.</p>
          <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  const adminModules = [
    {
      title: '📦 Gestionar Productos',
      description: 'Agregar, editar, eliminar productos. Gestionar imágenes, precios, categorías y detalles técnicos.',
      path: '/admin-products',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      icon: Package,
      badge: 'Activo'
    },
    {
      title: '👥 Gestionar Usuarios',
      description: 'Administrar usuarios, roles, permisos y acceso a la plataforma.',
      path: '/admin-users',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      icon: Users,
      badge: 'Activo'
    },
    {
      title: '🌱 Seeding de Datos',
      description: 'Cargar datos iniciales, migrar información y realizar operaciones en lote.',
      path: '/admin-seed',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      icon: Database,
      badge: 'Activo'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 flex items-center">
                <ShieldAlert className="h-10 w-10 mr-3 text-purple-600" />
                Panel de Administración
              </h1>
              <p className="text-slate-600 mt-2">
                Bienvenido, <span className="font-semibold text-slate-900">{user.displayName || user.email}</span>
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Módulos de Administración */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {adminModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <div
                key={module.path}
                className={`${module.color} border-2 rounded-lg p-6 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg`}
                onClick={() => navigate(module.path)}
              >
                <div className="flex items-start justify-between mb-4">
                  <IconComponent className="h-8 w-8 text-slate-700" />
                  <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {module.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{module.title}</h3>
                <p className="text-sm text-slate-700 mb-4">{module.description}</p>
                <Button
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                  onClick={() => navigate(module.path)}
                >
                  Acceder →
                </Button>
              </div>
            );
          })}
        </div>

        {/* Información Útil */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">ℹ️ Información del Administrador</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-600 font-semibold mb-1">Email</p>
              <p className="text-base text-slate-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-semibold mb-1">Rol</p>
              <p className="text-base text-slate-900 flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Administrador
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-semibold mb-1">Estado</p>
              <p className="text-base text-slate-900">Activo</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-semibold mb-1">Último acceso</p>
              <p className="text-base text-slate-900">Ahora</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
