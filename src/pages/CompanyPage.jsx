
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Award, Shield, Leaf, Users, TrendingUp, MapPin, PackageCheck, Lightbulb } from 'lucide-react'; // Añadí nuevos iconos
import EditableText from '@/components/editable/EditableText';
import EditableImage from '@/components/editable/EditableImage';

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
              <EditableText
                as="h1"
                className="text-4xl lg:text-5xl font-bold mb-6 leading-tight"
                contentKey="company.hero.title"
                fallback="Más que Distribuidores, Consultores de Higiene."
              />
              <EditableText
                as="p"
                className="text-xl text-blue-100 max-w-2xl leading-relaxed"
                contentKey="company.hero.subtitle"
                fallback="35 años ayudando a negocios a optimizar sus procesos de limpieza. Suministramos soluciones certificadas y sistemas concentrados que transforman la higiene en rentabilidad."
              />
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
              <EditableText
                as="h2"
                className="text-3xl font-bold mb-6"
                style={{ color: '#1b1847' }}
                contentKey="company.story.title"
                fallback="Experiencia que Genera Confianza"
              />
              <div className="prose prose-lg text-slate-700">
                <EditableText
                  as="p"
                  className="mb-4"
                  contentKey="company.story.p1"
                  fallback="En Los Baños, no solo entregamos productos; entregamos tranquilidad. Como distribuidores oficiales, hemos seleccionado un catálogo de élite respaldado por fabricantes líderes como Quimxel, pero nuestro verdadero valor reside en el saber hacer."
                />
                <EditableText
                  as="p"
                  className="mb-4"
                  contentKey="company.story.p2"
                  fallback="Analizamos las necesidades específicas de tu hotel, industria o lavandería para diseñar planes de higiene a medida. No se trata de limpiar más, sino de limpiar mejor: reduciendo costes, minimizando riesgos y garantizando el cumplimiento normativo."
                />
                <EditableText
                  as="p"
                  contentKey="company.story.p3"
                  fallback="Nuestro compromiso es claro: ofrecerte la tecnología química más avanzada del mercado con el trato cercano y resolutivo que tu negocio necesita día a día."
                />
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
              <EditableImage
                className="rounded-2xl shadow-xl w-full h-auto object-cover"
                alt="Equipo de Los Baños asesorando cliente"
                contentKey="company.story.image"
                fallback="/images/formacion.png"
                style={{ maxHeight: '400px' }}
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg max-w-xs hidden md:block">
                  <div className="flex items-center gap-3">
                      <Lightbulb className="text-yellow-500 h-8 w-8" />
                      <EditableText
                        as="p"
                        className="text-sm font-semibold text-slate-800"
                        contentKey="company.story.card"
                        fallback="Auditorías técnicas y formación de personal incluidas."
                      />
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
              <EditableText
                as="h3"
                className="text-4xl font-bold mb-2"
                style={{ color: '#15277a' }}
                contentKey="company.stats.0.value"
                fallback="+35"
              />
              <EditableText
                as="p"
                className="text-slate-600 font-medium"
                contentKey="company.stats.0.label"
                fallback="Años de Trayectoria"
              />
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
              <EditableText
                as="h3"
                className="text-4xl font-bold text-green-600 mb-2"
                contentKey="company.stats.1.value"
                fallback="-80%"
              />
              <EditableText
                as="p"
                className="text-slate-600 font-medium"
                contentKey="company.stats.1.label"
                fallback="Reducción Logística (Concentrados)"
              />
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
              <EditableText
                as="h3"
                className="text-4xl font-bold text-purple-600 mb-2"
                contentKey="company.stats.2.value"
                fallback="100%"
              />
              <EditableText
                as="p"
                className="text-slate-600 font-medium"
                contentKey="company.stats.2.label"
                fallback="Satisfacción Garantizada"
              />
            </motion.div>
          </div>

          {/* Sección Certificaciones y Calidad */}
          <div id="calidad" className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16">
            <div className="grid lg:grid-cols-2">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center space-x-3 mb-6">
                        <Shield className="h-8 w-8" style={{ color: '#15277a' }} />
                        <EditableText
                          as="h2"
                          className="text-3xl font-bold"
                          style={{ color: '#1b1847' }}
                          contentKey="company.quality.title"
                          fallback="Garantía Certificada"
                        />
                    </div>
                    <div className="prose text-slate-700">
                        <EditableText
                          as="p"
                          className="mb-6"
                          contentKey="company.quality.description"
                          fallback="La seguridad no es negociable. Trabajamos exclusivamente con productos que cumplen las normativas más exigentes del sector. Ya sea para industria alimentaria, sanitaria o colectividades, nuestros productos cuentan con los avales necesarios para que operes con total tranquilidad."
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <EditableText as="p" className="font-bold text-slate-800" contentKey="company.quality.cards.0.title" fallback="ISO 9001 / 14001" />
                            <EditableText as="p" className="text-sm text-slate-500" contentKey="company.quality.cards.0.body" fallback="Estándares de calidad y gestión ambiental." />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <EditableText as="p" className="font-bold text-slate-800" contentKey="company.quality.cards.1.title" fallback="Registro HA" />
                            <EditableText as="p" className="text-sm text-slate-500" contentKey="company.quality.cards.1.body" fallback="Aptos para Industria Alimentaria (HACCP)." />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <EditableText as="p" className="font-bold text-slate-800" contentKey="company.quality.cards.2.title" fallback="Reg. AEMPS" />
                            <EditableText as="p" className="text-sm text-slate-500" contentKey="company.quality.cards.2.body" fallback="Biocidas y desinfectantes sanitarios registrados." />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <EditableText as="p" className="font-bold text-slate-800" contentKey="company.quality.cards.3.title" fallback="Ecolabel" />
                            <EditableText as="p" className="text-sm text-slate-500" contentKey="company.quality.cards.3.body" fallback="Etiqueta ecológica europea." />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-100 relative min-h-[300px] lg:min-h-full">
                      <EditableImage
                        contentKey="company.quality.image"
                        fallback="/images/CalidadFotoCompany.jpg"
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
                  <EditableText
                    as="h2"
                    className="text-3xl font-bold"
                    contentKey="company.sustainability.title"
                    fallback="Revolución Sostenible"
                  />
                </div>
                <div className="prose prose-lg text-green-50">
                  <EditableText
                    as="p"
                    className="mb-4"
                    contentKey="company.sustainability.description"
                    fallback="La sostenibilidad también es rentabilidad. Apostamos fuertemente por nuestra gama de ultraconcentrados, diseñados para minimizar el impacto ambiental y maximizar tu eficiencia operativa."
                  />
                  <ul className="space-y-3 list-none pl-0">
                    <li className="flex items-start gap-3">
                        <span className="bg-green-400/20 p-1 rounded mt-1"><PackageCheck className="h-4 w-4" /></span>
                        <EditableText
                          as="span"
                          contentKey="company.sustainability.bullets.0"
                          fallback="80% menos de logística: Transporta producto activo, no agua. Reduce costes de almacenamiento y transporte."
                        />
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="bg-green-400/20 p-1 rounded mt-1"><Leaf className="h-4 w-4" /></span>
                        <EditableText
                          as="span"
                          contentKey="company.sustainability.bullets.1"
                          fallback="100% Reciclable: Envases diseñados para entrar en la economía circular y reducir el plástico virgen."
                        />
                    </li>
                    <li className="flex items-start gap-3">
                         <span className="bg-green-400/20 p-1 rounded mt-1"><Shield className="h-4 w-4" /></span>
                        <EditableText
                          as="span"
                          contentKey="company.sustainability.bullets.2"
                          fallback="Control de costes exacto: Sistemas de dosificación que evitan mermas y garantizan el coste por uso."
                        />
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                 {/* Tarjeta flotante visual */}
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 max-w-sm">
                    <div className="text-center mb-4">
                        <Leaf className="h-16 w-16 mx-auto text-green-300 mb-2" />
                        <EditableText as="h4" className="text-xl font-bold text-white" contentKey="company.sustainability.card.title" fallback="Ecolabel UE" />
                        <EditableText as="p" className="text-sm text-green-100" contentKey="company.sustainability.card.subtitle" fallback="Excelencia ambiental certificada" />
                    </div>
                    <EditableText
                      as="p"
                      className="text-sm text-center text-green-50 italic"
                      contentKey="company.sustainability.card.quote"
                      fallback="Nuestros clientes reducen su huella de carbono mientras mejoran sus estándares de limpieza."
                    />
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