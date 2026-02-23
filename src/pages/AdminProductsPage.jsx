
import React, { useEffect, useMemo, useState } from 'react';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '@/services/productService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { useToast } from '@/components/ui/use-toast';
import { Search, Save, ImageIcon, Plus, Edit2, X, Trash2, Upload } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const emptyForm = {
  name: '',
  reference: '',
  description: '',
  category: '',
  price: '',
  usage: '',
  sector: '',
  certifications: '',
  stock: true,
  technicalSheetUrl: '',
  hasTechnicalSheet: false,
  images: ''
};

const categories = [
  { value: 'limpieza-general', label: 'HORECA' },
  { value: 'lavanderia-profesional', label: 'Lavandería Profesional' },
  { value: 'industria-alimentaria', label: 'Industria Alimentaria' },
  { value: 'automocion', label: 'Automoción' },
  { value: 'sanitaria', label: 'Sanitaria' },
  { value: 'industria-construccion', label: 'Industria / Construcción' },
  { value: 'piscinas', label: 'Piscinas' },
  { value: 'sistemas-concentrados', label: 'Sistemas Concentrados' },
  { value: 'productos-certificados', label: 'Productos Certificados' }
];

const parseLines = (value) =>
  value
    .split(/\r?\n|,\s*/g)
    .map((item) => item.trim())
    .filter(Boolean);

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const formRef = React.useRef(null);

  const previewImage = useMemo(() => {
    const images = parseLines(formData.images || '');
    return images[0] || '';
  }, [formData.images]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredProducts(products);
      return;
    }

    setFilteredProducts(
      products.filter((product) =>
        [product.name, product.reference]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [searchTerm, products]);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getAllProducts();
    data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    setProducts(data);
    setFilteredProducts(data);
    setLoading(false);
  };

  const handleChange = (field) => (event) => {
    const value = field === 'stock' || field === 'hasTechnicalSheet'
      ? event.target.checked
      : event.target.value;

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      reference: product.reference || '',
      description: product.description || '',
      category: product.category || '',
      price: typeof product.price === 'number' ? String(product.price) : product.price || '',
      usage: product.usage || '',
      sector: product.sector || '',
      certifications: (product.certifications || []).join(', '),
      stock: Boolean(product.stock),
      technicalSheetUrl: product.technicalSheetUrl || '',
      hasTechnicalSheet: Boolean(product.hasTechnicalSheet),
      images: (product.images || []).join('\n')
    });
    
    // Scroll automático arriba para ver el formulario
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const buildPayload = () => {
    const images = parseLines(formData.images || '');
    const certifications = parseLines(formData.certifications || '');
    const priceNumber = Number(formData.price);

    return {
      name: formData.name.trim(),
      reference: formData.reference.trim(),
      description: formData.description.trim(),
      category: formData.category,
      price: Number.isFinite(priceNumber) ? priceNumber : 0,
      usage: formData.usage.trim(),
      sector: formData.sector.trim(),
      certifications,
      stock: Boolean(formData.stock),
      technicalSheetUrl: formData.technicalSheetUrl.trim(),
      hasTechnicalSheet: Boolean(formData.hasTechnicalSheet),
      images
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.reference.trim() || !formData.category) {
      toast({
        title: 'Faltan campos obligatorios',
        description: 'Nombre, referencia y categoría son obligatorios.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const payload = buildPayload();

      if (editingId) {
        await updateProduct(editingId, payload);
        toast({
          title: 'Producto actualizado',
          description: 'Los cambios se guardaron correctamente.'
        });
      } else {
        await createProduct(payload);
        toast({
          title: 'Producto creado',
          description: 'El producto se añadió correctamente.'
        });
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el producto. Revisa permisos y conexión.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteProduct(productId);
      toast({
        title: 'Producto eliminado',
        description: 'El producto se eliminó correctamente.'
      });
      await loadProducts();
      if (editingId === productId) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto.',
        variant: 'destructive'
      });
    }
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!storage) {
      toast({
        title: 'Storage no configurado',
        description: 'Configura Firebase Storage para subir imágenes.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploading(true);
      const baseId = editingId || `draft-${Date.now()}`;
      const storageRef = ref(storage, `products/${baseId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setFormData((prev) => {
        const currentImages = parseLines(prev.images || '');
        return {
          ...prev,
          images: [...currentImages, url].join('\n')
        };
      });

      toast({
        title: 'Imagen subida',
        description: 'La imagen se añadió al producto.'
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'No se pudo subir la imagen.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <p className="text-slate-600">Crea y edita productos, imágenes y fichas técnicas desde el panel admin.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <form ref={formRef} onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                <X className="w-4 h-4 mr-2" /> Cancelar
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nombre *</label>
            <Input value={formData.name} onChange={handleChange('name')} placeholder="Nombre del producto" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Referencia *</label>
            <Input value={formData.reference} onChange={handleChange('reference')} placeholder="Código interno" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Categoría *</label>
            <select
              value={formData.category}
              onChange={handleChange('category')}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Precio (€)</label>
            <Input value={formData.price} onChange={handleChange('price')} placeholder="0.00" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Descripción</label>
            <textarea
              value={formData.description}
              onChange={handleChange('description')}
              rows={4}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Descripción corta"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Certificaciones (separadas por coma)</label>
            <Input value={formData.certifications} onChange={handleChange('certifications')} placeholder="ecolabel, aemps" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Uso / Subcategoría</label>
            <Input value={formData.usage} onChange={handleChange('usage')} placeholder="Ej: Preparación de Suelos" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Sector</label>
            <Input value={formData.sector} onChange={handleChange('sector')} placeholder="Ej: Limpieza General" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Imágenes (una URL por línea)</label>
            <textarea
              value={formData.images}
              onChange={handleChange('images')}
              rows={4}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-mono"
              placeholder="https://..."
            />
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
                <span className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5">
                  <Upload className="w-4 h-4" /> Subir imagen
                </span>
              </label>
              {uploading && <span className="text-xs text-slate-500">Subiendo...</span>}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-md border bg-slate-100 overflow-hidden flex items-center justify-center">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = '/images/logo-letra.png';
                    }}
                  />
                ) : (
                  <ImageIcon className="text-slate-400" />
                )}
              </div>
              <span className="text-xs text-slate-500">Previsualización de la primera imagen.</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Ficha técnica (URL)</label>
            <Input value={formData.technicalSheetUrl} onChange={handleChange('technicalSheetUrl')} placeholder="https://..." />
          </div>

          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.stock} onChange={handleChange('stock')} />
              En stock
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hasTechnicalSheet}
                onChange={handleChange('hasTechnicalSheet')}
              />
              Tiene ficha técnica
            </label>
          </div>

          <Button type="submit" className="w-full">
            {editingId ? (
              <>
                <Save className="w-4 h-4 mr-2" /> Guardar cambios
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" /> Crear producto
              </>
            )}
          </Button>
        </form>

        <div className="lg:col-span-2">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              className="pl-10"
              placeholder="Buscar por nombre o referencia..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {loading ? (
            <p className="text-center py-12">Cargando productos...</p>
          ) : (
            <div className="grid gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center gap-4"
                >
                  <div className="w-20 h-20 flex-shrink-0 bg-slate-100 rounded-md overflow-hidden border">
                    {(() => {
                      const primaryImage = Array.isArray(product.images)
                        ? product.images[0]
                        : product.images;

                      return primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(event) => {
                          console.warn('Imagen no cargada:', primaryImage);
                          event.currentTarget.src = '/images/logo-letra.png';
                        }}
                      />
                      ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      );
                    })()}
                  </div>

                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{product.name}</span>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
                        {product.reference}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {product.category || 'Sin categoría'} · {product.price ? `${product.price}€` : 'Sin precio'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      <Edit2 className="w-4 h-4 mr-2" /> Editar
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;
