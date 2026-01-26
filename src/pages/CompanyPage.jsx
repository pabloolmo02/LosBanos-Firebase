
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Award, Shield, Leaf, Users, TrendingUp, MapPin, PackageCheck, Lightbulb } from 'lucide-react'; // Añadí nuevos iconos

const CompanyPage = () => {
  return (
    <>
      <Helmet>
        <title>Sobre Nosotros - Los Baños | Expertos en Higiene Profesional</title>
        <meta name="description" content="Los Baños - Más de 35 años asesorando en higiene profesional. Distribuidores oficiales de productos certificados y sistemas concentrados de alta eficiencia." />
      </Helmet>

      <div className="bg-slate-50">
        {/* Hero Section */}
        <div className="text-white py-20 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #1b1847 0%, #15277a 100%)', // Gradiente corporativo limpio si no carga imagen
        }}>
           {/* Imagen de fondo opcional con overlay */}
           <div className="absolute inset-0 z-0 opacity-20" style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}></div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Más que Distribuidores,<br/>
                <span className="text-blue-300">Consultores de Higiene.</span>
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl leading-relaxed">
                35 años ayudando a negocios a optimizar sus procesos de limpieza. 
                Suministramos soluciones certificadas y sistemas concentrados que transforman la higiene en rentabilidad.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          
          {/* Sección Historia / Enfoque */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#1b1847' }}>Experiencia que Genera Confianza</h2>
              <div className="prose prose-lg text-slate-700">
                <p className="mb-4">
                  En <strong>Los Baños</strong>, no solo entregamos productos; entregamos tranquilidad. Como distribuidores oficiales, hemos seleccionado un catálogo de élite respaldado por fabricantes líderes como Quimxel, pero nuestro verdadero valor reside en el <strong>"saber hacer"</strong>.
                </p>
                <p className="mb-4">
                  Analizamos las necesidades específicas de tu hotel, industria o lavandería para diseñar planes de higiene a medida. No se trata de limpiar más, sino de limpiar mejor: reduciendo costes, minimizando riesgos y garantizando el cumplimiento normativo.
                </p>
                <p>
                  Nuestro compromiso es claro: ofrecerte la tecnología química más avanzada del mercado con el trato cercano y resolutivo que tu negocio necesita día a día.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
                {/* Imagen sugerida: Almacén moderno o reunión de equipo */}
              <img 
                className="rounded-2xl shadow-xl w-full h-auto object-cover" 
                alt="Equipo de Los Baños asesorando cliente"
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80" 
                style={{ maxHeight: '400px' }}
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg max-w-xs hidden md:block">
                  <div className="flex items-center gap-3">
                      <Lightbulb className="text-yellow-500 h-8 w-8" />
                      <p className="text-sm font-semibold text-slate-800">Auditorías técnicas y formación de personal incluidas.</p>
                  </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-8 text-center border-b-4 border-blue-900"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                <TrendingUp className="h-8 w-8" style={{ color: '#15277a' }} />
              </div>
              <h3 className="text-4xl font-bold mb-2" style={{ color: '#15277a' }}>+35</h3>
              <p className="text-slate-600 font-medium">Años de Trayectoria</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-8 text-center border-b-4 border-green-600"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
                <PackageCheck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-4xl font-bold text-green-600 mb-2">-80%</h3>
              <p className="text-slate-600 font-medium">Reducción Logística (Concentrados)</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-8 text-center border-b-4 border-purple-600"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-full mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-4xl font-bold text-purple-600 mb-2">100%</h3>
              <p className="text-slate-600 font-medium">Satisfacción Garantizada</p>
            </motion.div>
          </div>

          {/* Sección Certificaciones y Calidad */}
          <div id="calidad" className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16">
            <div className="grid lg:grid-cols-2">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center space-x-3 mb-6">
                        <Shield className="h-8 w-8" style={{ color: '#15277a' }} />
                        <h2 className="text-3xl font-bold" style={{ color: '#1b1847' }}>Garantía Certificada</h2>
                    </div>
                    <div className="prose text-slate-700">
                        <p className="mb-6">
                            La seguridad no es negociable. Trabajamos exclusivamente con productos que cumplen las normativas más exigentes del sector. Ya sea para industria alimentaria, sanitaria o colectividades, nuestros productos cuentan con los avales necesarios para que operes con total tranquilidad.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="font-bold text-slate-800">ISO 9001 / 14001</p>
                                <p className="text-sm text-slate-500">Estándares de calidad y gestión ambiental.</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="font-bold text-slate-800">Registro HA</p>
                                <p className="text-sm text-slate-500">Aptos para Industria Alimentaria (HACCP).</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="font-bold text-slate-800">Reg. AEMPS</p>
                                <p className="text-sm text-slate-500">Biocidas y desinfectantes sanitarios registrados.</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="font-bold text-slate-800">Ecolabel</p>
                                <p className="text-sm text-slate-500">Etiqueta ecológica europea.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-100 relative min-h-[300px] lg:min-h-full">
                    <img 
                        src="/images/CalidadFotoCompany.jpg" 
                        alt="Laboratorio y control de calidad"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                     <div className="absolute inset-0 bg-blue-900/10"></div>
                </div>
            </div>
          </div>

          {/* Sección Sostenibilidad y Concentrados */}
          <div id="medioambiente" className="rounded-2xl shadow-lg p-8 lg:p-12 text-white relative overflow-hidden">
             {/* Fondo gradiente verde */}
            <div className="absolute inset-0 z-0" style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
            }}></div>
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Leaf className="h-8 w-8 text-green-200" />
                  <h2 className="text-3xl font-bold">Revolución Sostenible</h2>
                </div>
                <div className="prose prose-lg text-green-50">
                  <p className="mb-4">
                    La sostenibilidad también es rentabilidad. Apostamos fuertemente por nuestra <strong>gama de ultraconcentrados</strong>, diseñados para minimizar el impacto ambiental y maximizar tu eficiencia operativa.
                  </p>
                  <ul className="space-y-3 list-none pl-0">
                    <li className="flex items-start gap-3">
                        <span className="bg-green-400/20 p-1 rounded mt-1"><PackageCheck className="h-4 w-4" /></span>
                        <span><strong>80% menos de logística:</strong> Transporta producto activo, no agua. Reduce costes de almacenamiento y transporte.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="bg-green-400/20 p-1 rounded mt-1"><Leaf className="h-4 w-4" /></span>
                        <span><strong>100% Reciclable:</strong> Envases diseñados para entrar en la economía circular y reducir el plástico virgen.</span>
                    </li>
                    <li className="flex items-start gap-3">
                         <span className="bg-green-400/20 p-1 rounded mt-1"><Shield className="h-4 w-4" /></span>
                        <span><strong>Control de costes exacto:</strong> Sistemas de dosificación que evitan mermas y garantizan el coste por uso.</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                 {/* Tarjeta flotante visual */}
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 max-w-sm">
                    <div className="text-center mb-4">
                        <Leaf className="h-16 w-16 mx-auto text-green-300 mb-2" />
                        <h4 className="text-xl font-bold text-white">Ecolabel UE</h4>
                        <p className="text-sm text-green-100">Excelencia ambiental certificada</p>
                    </div>
                    <p className="text-sm text-center text-green-50 italic">
                        "Nuestros clientes reducen su huella de carbono mientras mejoran sus estándares de limpieza."
                    </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default CompanyPage;