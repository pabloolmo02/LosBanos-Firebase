
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/products';
import { seedDatabase } from '@/services/productService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';

const AdminSeedingPage = () => {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSeed = async () => {
    setStatus('loading');
    try {
      const localProducts = getProducts();
      await seedDatabase(localProducts);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Terminal className="w-6 h-6 text-slate-700"/>
                Administración de Base de Datos
            </h1>
            <p className="text-slate-600 mb-6">
                Esta herramienta migra todos los productos del archivo local (products.js) a la base de datos de Firebase Firestore.
            </p>

            <Button 
                onClick={handleSeed} 
                disabled={status === 'loading'}
                className="w-full mb-4"
            >
                {status === 'loading' ? 'Migrando datos...' : 'Migrar Productos a Firebase'}
            </Button>

            {status === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                    <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
                    <AlertDescription className="text-green-700">
                        Todos los productos se han subido correctamente a la base de datos.
                    </AlertDescription>
                </Alert>
            )}

            {status === 'error' && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Hubo un fallo al conectar con Firebase. Revisa la consola y tu configuración .env.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    </div>
  );
};

export default AdminSeedingPage;
