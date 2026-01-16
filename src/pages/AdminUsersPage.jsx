
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { getAllUsers, approveUser } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Check, Clock, Shield, Search, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input.jsx'; // Extensión explícita

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      setFilteredUsers(users.filter(user => 
        (user.email && user.email.toLowerCase().includes(lowerTerm)) ||
        (user.company && user.company.toLowerCase().includes(lowerTerm)) ||
        (user.cif && user.cif.toLowerCase().includes(lowerTerm))
      ));
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setFilteredUsers(data);
    setLoading(false);
  };

  const handleApprove = async (uid, email) => {
    const success = await approveUser(uid);
    if (success) {
      toast({
        title: "Usuario Aprobado",
        description: `El usuario ${email} ahora tiene acceso B2B.`,
      });
      // Actualizar lista localmente
      setUsers(users.map(u => u.uid === uid ? { ...u, role: 'approved' } : u));
    } else {
      toast({
        title: "Error",
        description: "No se pudo aprobar al usuario.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold flex items-center w-fit"><Shield className="w-3 h-3 mr-1"/> ADMIN</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center w-fit"><Check className="w-3 h-3 mr-1"/> B2B ACTIVO</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center w-fit"><Clock className="w-3 h-3 mr-1"/> PENDIENTE</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>Gestión de Usuarios | Admin Quimxel</title>
      </Helmet>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Gestión de Usuarios B2B</h1>
        <div className="text-sm text-slate-500">
            Total: {users.length} | Pendientes: {users.filter(u => u.role === 'pending').length}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-slate-200">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
                placeholder="Buscar por empresa, email o CIF..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando usuarios...</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-700">Empresa / CIF</th>
                  <th className="p-4 font-semibold text-slate-700">Contacto</th>
                  <th className="p-4 font-semibold text-slate-700">Sector</th>
                  <th className="p-4 font-semibold text-slate-700">Estado</th>
                  <th className="p-4 font-semibold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{user.company || 'Sin Empresa'}</div>
                      <div className="text-sm text-slate-500">{user.cif || 'Sin CIF'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-slate-700">
                        <Mail className="w-3 h-3 mr-2 text-slate-400"/> {user.email}
                      </div>
                      {user.phone && <div className="text-sm text-slate-500 mt-1">📞 {user.phone}</div>}
                    </td>
                    <td className="p-4">
                      <span className="capitalize bg-slate-100 px-2 py-1 rounded text-xs">
                        {user.sector || 'General'}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(user.role)}
                    </td>
                    <td className="p-4">
                      {user.role === 'pending' && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(user.uid, user.email)}
                        >
                          Aprobar Acceso
                        </Button>
                      )}
                      {user.role === 'approved' && (
                          <span className="text-xs text-green-600 font-medium">Validado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-500">No se encontraron usuarios.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
