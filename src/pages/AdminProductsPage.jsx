
import React, { useState, useEffect } from 'react';
import { getAllProducts } from '@/services/productService';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx'; // Import explícito
import { useToast } from '@/components/ui/use-toast';
import { Search, Save, ImageIcon } from 'lucide-react';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.reference.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
  }, [searchTerm, products]);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getAllProducts();
    // Ordenar por nombre
    data.sort((a, b) => a.name.localeCompare(b.name));
    setProducts(data);
    setFilteredProducts(data);
    setLoading(false);
  };

  const handleUpdateImage = async (productId, newImageUrl) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        images: [newImageUrl]
      });

      toast({
        title: "Imagen actualizada",
        description: "El producto se ha actualizado correctamente.",
      });
      
      setProducts(products.map(p => 
        p.id === productId ? { ...p, images: [newImageUrl] } : p
      ));

    } catch (error) {
      console.error("Error updating image:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la imagen (Revisa permisos).",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Gestión Rápida de Imágenes</h1>
      <p className="text-slate-600 mb-6">Pega una URL de imagen válida para actualizar la foto del producto.</p>
      
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input 
          className="pl-10" 
          placeholder="Buscar por nombre o referencia..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-center py-12">Cargando productos...</p>
      ) : (
        <div className="grid gap-6">
          {filteredProducts.map(product => (
            <ProductRow key={product.id} product={product} onSave={handleUpdateImage} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductRow = ({ product, onSave }) => {
  const [imageUrl, setImageUrl] = useState(product.images && product.images[0] ? product.images[0] : '');
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e) => {
    setImageUrl(e.target.value);
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave(product.id, imageUrl);
    setIsDirty(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row items-center gap-4 border border-slate-200">
      <div className="w-24 h-24 flex-shrink-0 bg-slate-100 rounded-md overflow-hidden border relative group">
        {imageUrl ? (
          <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Error'} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <ImageIcon />
          </div>
        )}
      </div>
      
      <div className="flex-grow w-full">
        <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-lg text-slate-900">{product.name}</span>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">{product.reference}</span>
        </div>
        <div className="flex gap-2">
            <Input 
                value={imageUrl} 
                onChange={handleChange} 
                placeholder="https://..." 
                className="flex-grow font-mono text-xs"
            />
            <Button onClick={handleSave} disabled={!isDirty} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Guardar
            </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;
