
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Truck, FileCheck, Award, ChevronRight, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Shield,
      title: 'Certificación ISO 9001/14001',
      description: 'Calidad y gestión ambiental certificada en todos nuestros productos'
    },
    {
      icon: Truck,
      title: 'Entrega en 48h',
      description: 'Logística garantizada en Sevilla y Córdoba'
    },
    {
      icon: FileCheck,
      title: 'Documentación Completa',
      description: 'FDS, fichas técnicas y certificados AEMPS disponibles'
    },
    {
      icon: Leaf,
      title: 'Línea Ecolabel',
      description: 'Productos sostenibles certificados para empresas ESG'
    }
  ];

  const categories = [
    { name: 'Alimentaria', slug: 'industria-alimentaria', description: 'Biocidas TP2/TP4 con registro AEMPS' },
    { name: 'Lavandería Profesional', slug: 'lavanderia-profesional', description: 'Detergentes industriales de alto rendimiento' },
    { name: 'HORECA', slug: 'limpieza-general', description: 'Soluciones integrales para hostelería' },
    { name: 'Sanitaria', slug: 'sanitaria', description: 'Desinfección certificada para centros de salud' },
    { name: 'Ecolabel', slug: 'productos-certificados', description: 'Productos ultraconcentrados sostenibles' },
    { name: 'Automoción', slug: 'automocion', description: 'Limpieza profesional de vehículos' }
  ];

  return (
    <>
      <Helmet>
        <title>Soluciones de Higiene y Desinfección Certificada Quimxel en Sevilla y Córdoba | Distribución B2B</title>
        <meta name="description" content="Distribución exclusiva de productos químicos profesionales QUIMXEL certificados ISO 9001/14001 y Ecolabel para HORECA, Lavandería y Limpieza Industrial en Sevilla y Córdoba. Entrega en 48h." />
      </Helmet>

      <section className="relative text-white py-20 overflow-hidden" style={{
        backgroundImage: "linear-gradient(rgba(27, 24, 71, 0.75), rgba(28, 37, 107, 0.75)), url('/images/products-hero.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex space-x-2">
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">ISO 9001</div>
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">ISO 14001</div>
                  <div className="px-3 py-1 bg-green-500/30 backdrop-blur-sm rounded-full text-xs font-semibold">ECOLABEL</div>
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Soluciones de Higiene y Desinfección Certificada
              </h1>
              
              <p className="text-xl text-blue-100 mb-8">
                Más de 35 años de experiencia en productos químicos profesionales. Calidad certificada + Soporte técnico y logística garantizada.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated ? (
                  <>
                    <Button size="lg" asChild className="bg-white text-blue-900 hover:bg-blue-50">
                      <Link to="/registro">
                        Solicitar Acceso B2B
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" asChild className="bg-white text-blue-900 hover:bg-blue-50">
                      <Link to="/productos">Ver Catálogo</Link>
                    </Button>
                  </>
                ) : (
                  <Button size="lg" asChild className="bg-white text-blue-900 hover:bg-blue-50">
                    <Link to="/productos">
                      Explorar Productos
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img 
                className="rounded-2xl shadow-2xl w-full h-auto" 
                alt="Productos químicos profesionales Quimxel para HORECA y limpieza industrial"
               src="https://images.unsplash.com/photo-1622030360273-a8d1377be08b" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Catálogos Especializados
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Productos químicos profesionales certificados para cada sector industrial
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/productos?cat=${category.slug}`}
                  className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-blue-300 group"
                >
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">{category.description}</p>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    Ver productos
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-6">
                <Leaf className="h-5 w-5" />
                <span className="font-semibold">Línea Sostenible</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Productos Ecolabel: Eficiencia y Sostenibilidad
              </h2>
              
              <p className="text-lg text-slate-700 mb-6">
                Nuestra línea EcoSave ofrece productos ultraconcentrados certificados Ecolabel, ideales para empresas con políticas ESG. Reducción de costos logísticos, menor generación de residuos y máxima eficiencia operativa.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-3">
                  <Award className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Certificación Ecolabel europea oficial</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Award className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Reducción de hasta 70% en costos de transporte</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Award className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Ideal para cadenas hoteleras y restaurantes premium</span>
                </li>
              </ul>
              
              <Button size="lg" asChild>
                <Link to="/productos?cat=productos-certificados">
                  Descubrir Línea Ecolabel
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img 
                className="rounded-2xl shadow-xl w-full h-auto" 
                alt="Productos de limpieza ecológicos certificados Ecolabel para empresas sostenibles"
               src="https://images.unsplash.com/photo-1642764732251-9dacf60eb423" />
            </motion.div>
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="py-20 text-white" style={{
          backgroundImage: "linear-gradient(rgba(27, 24, 71, 0.75), rgba(28, 37, 107, 0.75)), url('/images/products-hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Solicite Acceso Inmediato a Precios B2B
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Consulte su descuento personalizado y acceda a tarifas exclusivas para profesionales
              </p>
              <Button size="lg" asChild className="bg-white text-blue-900 hover:bg-blue-50">
                <Link to="/registro">
                  Registrarse Ahora
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      )}
    </>
  );
};

export default HomePage;
