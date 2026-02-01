
import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ShoppingCart, CheckCircle, ChevronLeft } from 'lucide-react';
import { getProductById } from '@/services/productService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast"
import { addToCart } from '@/lib/cart';

// Helper component for pH indicator
const PhIndicator = ({ phString }) => {
    if (!phString) return null;

    // Extract number from string like "7,5 (Puro)" -> 7.5
    const match = phString.match(/(\d+[\.,]?\d*)/);
    const phValue = match ? parseFloat(match[1].replace(',', '.')) : null;

    if (phValue === null) return <span className="text-sm text-slate-500">pH: {phString}</span>;

    // Map pH 0-14 to a blue scale (Light to Dark)
    // 0 = Lightest Blue, 14 = Darkest Blue
    // Tailwind slate/blue scale: 50, 100, 200, ..., 900, 950
    let colorClass = 'bg-blue-500'; 
    let textColor = 'text-white';

    if (phValue <= 2) { colorClass = 'bg-blue-200'; textColor = 'text-blue-900'; }
    else if (phValue <= 4) { colorClass = 'bg-blue-300'; textColor = 'text-blue-900'; }
    else if (phValue <= 6) { colorClass = 'bg-blue-400'; }
    else if (phValue <= 8) { colorClass = 'bg-blue-500'; } // Neutral-ish
    else if (phValue <= 10) { colorClass = 'bg-blue-600'; }
    else if (phValue <= 12) { colorClass = 'bg-blue-700'; }
    else if (phValue <= 13) { colorClass = 'bg-blue-800'; }
    else { colorClass = 'bg-blue-900'; }

    return (
        <div className="flex items-center mt-4 mb-6">
            <span className="font-semibold text-slate-700 mr-3">pH:</span>
            <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${colorClass} ${textColor}`}
                title={`pH: ${phString}`}
            >
                {phValue}
            </div>
            <span className="text-sm text-slate-500 ml-2">({phString})</span>
        </div>
    );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isApproved } = useAuth();
  const { toast } = useToast();

  const backLink = location.state?.fromCategory 
      ? `/productos?cat=${location.state.fromCategory}` 
      : '/productos';

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const fetchedProduct = await getProductById(id);
        setProduct(fetchedProduct);
        
        if (fetchedProduct && fetchedProduct.variants && fetchedProduct.variants.length > 0) {
           setSelectedVariant(fetchedProduct.variants[0]);
        } else if (fetchedProduct) {
           setSelectedVariant({ 
               id: fetchedProduct.id, 
               format: 'Estándar', 
               price: fetchedProduct.price 
           });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);
  
  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    
    const itemToAdd = {
      ...product, 
      price: selectedVariant.price, 
      variant: selectedVariant 
    };
    
    addToCart(itemToAdd);

    toast({
      title: (
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span>Añadido al carrito</span>
        </div>
      ),
      description: `${product.name} - ${selectedVariant.format} añadido.`,
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!product) {
    return <div className="text-center py-20">Producto no encontrado.</div>;
  }

  return (
    <>
      <Helmet><title>{product.name} | Los Baños</title></Helmet>

      <div className="bg-slate-50">
        <div className="container mx-auto px-4 py-10">
          <Link to={backLink} className="inline-flex items-center text-sm text-slate-600 hover:text-blue-700 mb-6">
            <ChevronLeft className="h-4 w-4 mr-1" /> Volver al Catálogo
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-sm border">
            {/* Image Gallery */}
            <div className="flex items-center justify-center p-4 rounded-xl bg-cover bg-center" style={{ backgroundImage: "url('/images/ProductBackground.PNG')" }}>
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} className="max-w-full h-auto max-h-[400px] object-contain"/>
                ) : (
                    <div className="w-full h-[400px] flex items-center justify-center text-slate-400 rounded-lg">
                        <div className="text-center">
                            <span className="block text-6xl mb-2 opacity-50">🧴</span>
                            <span className="text-sm uppercase font-medium">Sin imagen</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Details */}
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{product.reference}</span>
              <h1 className="text-4xl font-bold text-slate-800 mt-2 mb-4">{product.name}</h1>
              
              {/* DESCRIPTION: Prioritize long_description */}
              <p className="text-slate-600 leading-relaxed mb-6">
                  {product.long_description || product.description}
              </p>

              {/* pH Indicator */}
              {product.ph && <PhIndicator phString={product.ph} />}
              
              {/* Variant Selector */}
              {product.variants && product.variants.length > 1 && (
                  <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Seleccionar Formato:</label>
                      <div className="flex flex-wrap gap-3">
                          {product.variants.map((v) => (
                              <button
                                  key={v.id}
                                  onClick={() => setSelectedVariant(v)}
                                  className={`px-4 py-2 border rounded-md text-sm font-medium transition-all ${
                                      selectedVariant?.id === v.id
                                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                              >
                                  {v.format}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
              
              {/* Single Variant Info */}
              {product.variants && product.variants.length === 1 && product.variants[0].format !== 'Estándar' && (
                  <div className="mb-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          Formato: {product.variants[0].format}
                      </span>
                  </div>
              )}

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  {isApproved && selectedVariant ? (
                      <div>
                          <span className="text-4xl font-extrabold text-slate-900">{selectedVariant.price.toFixed(2)}€</span>
                          <span className="block text-xs text-slate-500 mt-1">Precio por unidad (sin IVA)</span>
                      </div>
                  ) : (
                    <span className="text-lg text-slate-500">Inicia sesión para ver precios</span>
                  )}
                  {isApproved && (
                    <Button size="lg" onClick={handleAddToCart} disabled={!selectedVariant}>
                      <ShoppingCart className="h-5 w-5 mr-2" /> Añadir al Carrito
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-8 space-y-4 text-sm border-t pt-6 border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block font-semibold text-slate-900">Categoría</span>
                        <span className="text-slate-500">{product.sector}</span>
                    </div>
                    <div>
                        <span className="block font-semibold text-slate-900">Uso</span>
                        <span className="text-slate-500">{product.usage}</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  {product.technicalSheetUrl && (
                    <a 
                        href={product.technicalSheetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Ficha Técnica
                    </a>
                  )}
                  {product.safetySheetUrl && (
                    <a 
                        href={product.safetySheetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        Ficha de Seguridad
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
