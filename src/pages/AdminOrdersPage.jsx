import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { getAllOrders, updateOrderStatus } from '@/services/orderService';

const statusOptions = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' }
];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredOrders(orders);
      return;
    }

    const lower = searchTerm.toLowerCase();
    setFilteredOrders(
      orders.filter((order) =>
        [order.id, order.userEmail, order.company]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(lower))
      )
    );
  }, [searchTerm, orders]);

  const loadOrders = async () => {
    setLoading(true);
    const data = await getAllOrders();
    setOrders(data);
    setFilteredOrders(data);
    setLoading(false);
  };

  const handleStatusChange = async (orderId, nextStatus) => {
    const ok = await updateOrderStatus(orderId, nextStatus);
    if (!ok) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pedido.',
        variant: 'destructive'
      });
      return;
    }

    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order))
    );

    toast({
      title: 'Estado actualizado',
      description: `Pedido ${orderId} -> ${nextStatus}`
    });
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('es-ES');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>Gestión de Pedidos | Admin Los Baños</title>
      </Helmet>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Pedidos</h1>
          <p className="text-sm text-slate-500 mt-1">Total: {orders.length}</p>
        </div>
        <div className="w-full md:w-80">
          <Input
            placeholder="Buscar por id, empresa o email..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando pedidos...</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-700">Pedido</th>
                  <th className="p-4 font-semibold text-slate-700">Cliente</th>
                  <th className="p-4 font-semibold text-slate-700">Fecha</th>
                  <th className="p-4 font-semibold text-slate-700">Items</th>
                  <th className="p-4 font-semibold text-slate-700">Estado</th>
                  <th className="p-4 font-semibold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{order.id}</div>
                      <div className="text-xs text-slate-500">{order.paymentMethod || '—'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{order.company || 'Sin empresa'}</div>
                      <div className="text-sm text-slate-500">{order.userEmail || 'Sin email'}</div>
                    </td>
                    <td className="p-4 text-slate-700">{formatDate(order.createdAt)}</td>
                    <td className="p-4 text-slate-700">
                      {Array.isArray(order.items) ? order.items.length : 0}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                        {order.status || 'pendiente'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        <select
                          className="border border-slate-200 rounded-md text-sm px-2 py-1"
                          value={order.status || 'pendiente'}
                          onChange={(event) => handleStatusChange(order.id, event.target.value)}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(order.id)}
                        >
                          Copiar ID
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="p-8 text-center text-slate-500">No se encontraron pedidos.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
