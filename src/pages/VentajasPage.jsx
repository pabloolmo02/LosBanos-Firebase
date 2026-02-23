import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Award, Shield, TrendingUp, FileCheck, Download, CheckCircle, XCircle, Briefcase, Scale, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditableText from '@/components/editable/EditableText';
import EditableImage from '@/components/editable/EditableImage';

const VentajasPage = () => {
  const compareData = [
    {
      factor: 'Acceso a Licitaciones',
      convencional: 'Limitado o nulo',
      certificado: 'Acceso total a Compra Verde',
      convencionalIcon: false,
      certificadoIcon: true
    },
    {
      factor: 'Riesgo de Sanciones',
      convencional: 'Alto (incumplimiento normativo)',
      certificado: 'Cero (Cumplimiento AEMPS/ISO)',
      convencionalIcon: false,
      certificadoIcon: true
    },
    {
      factor: 'Imagen de Marca',
      convencional: 'Neutra',
      certificado: 'Empresa Sostenible y Responsable',
      convencionalIcon: false,
      certificadoIcon: true
    },
    {
      factor: 'Coste a largo plazo',
      convencional: 'Variable (posibles multas/bajas)',
      certificado: 'Ahorro por eficiencia y calidad ISO',
      convencionalIcon: false,
      certificadoIcon: true
    }
  ];

  return (
    <>
      <Helmet>
        <title>Ventajas Competitivas - Los Baños | Partners Estratégicos</title>
        <meta name="description" content="Descubre cómo nuestros productos certificados te dan acceso a licitaciones públicas, beneficios fiscales y cumplimiento normativo garantizado." />
      </Helmet>

      <div className="bg-slate-50">
        {/* Hero Section */}
        <div className="text-white py-20 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #1b1847 0%, #15277a 100%)',
        }}>
          <div className="absolute inset-0 z-0 opacity-20" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80')",
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
                contentKey="advantages.hero.title"
                fallback="Ventajas Competitivas para Nuestros Partners"
              />
              <EditableText
                as="p"
                className="text-xl text-blue-100 max-w-2xl leading-relaxed"
                contentKey="advantages.hero.subtitle"
                fallback="Más allá de productos de calidad, te ofrecemos herramientas estratégicas que impulsan tu negocio: acceso a licitaciones, ahorro fiscal y compliance garantizado."
              />
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          
          {/* Tres Pilares Estratégicos */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <EditableText
                as="h2"
                className="text-3xl lg:text-4xl font-bold mb-4"
                style={{ color: '#1b1847' }}
                contentKey="advantages.pillars.title"
                fallback="Tres Pilares que Transforman tu Negocio"
              />
              <EditableText
                as="p"
                className="text-lg text-slate-600 max-w-3xl mx-auto"
                contentKey="advantages.pillars.subtitle"
                fallback="Elegir productos certificados no es solo calidad, es estrategia comercial inteligente"
              />
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Pilar 1: Licitaciones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-900 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full flex-shrink-0">
                    <Scale className="h-8 w-8" style={{ color: '#15277a' }} />
                  </div>
                  <EditableText
                    as="h3"
                    className="text-2xl font-bold"
                    style={{ color: '#1b1847' }}
                    contentKey="advantages.pillars.0.title"
                    fallback="Pasaporte para Licitaciones Públicas"
                  />
                </div>
                <EditableText
                  as="p"
                  className="text-slate-700 mb-4"
                  contentKey="advantages.pillars.0.body"
                  fallback="Al usar nuestros productos con Ecolabel e ISO 14001, tu empresa cumple automáticamente con las cláusulas ambientales de los pliegos de contratación pública."
                />
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <EditableText
                    as="p"
                    className="text-sm font-semibold text-green-800"
                    contentKey="advantages.pillars.0.callout.title"
                    fallback="✓ Suma puntos clave para ganar concursos del Estado"
                  />
                  <EditableText
                    as="p"
                    className="text-sm text-green-700 mt-1"
                    contentKey="advantages.pillars.0.callout.body"
                    fallback="Cumplimiento Ley de Contratos del Sector Público"
                  />
                </div>
              </motion.div>

              {/* Pilar 2: Beneficios Fiscales */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-900 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full flex-shrink-0">
                    <DollarSign className="h-8 w-8" style={{ color: '#15277a' }} />
                  </div>
                  <EditableText
                    as="h3"
                    className="text-2xl font-bold"
                    style={{ color: '#1b1847' }}
                    contentKey="advantages.pillars.1.title"
                    fallback="Beneficios Fiscales y Deducciones"
                  />
                </div>
                <EditableText
                  as="p"
                  className="text-slate-700 mb-4"
                  contentKey="advantages.pillars.1.body"
                  fallback="La inversión en productos certificados puede vincularse a proyectos de mejora ambiental, permitiendo acceder a deducciones en el Impuesto de Sociedades y bonificaciones por gestión de residuos."
                />
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <EditableText
                    as="p"
                    className="text-sm font-semibold text-green-800"
                    contentKey="advantages.pillars.1.callout.title"
                    fallback="✓ Inversión deducible, no gasto"
                  />
                  <EditableText
                    as="p"
                    className="text-sm text-green-700 mt-1"
                    contentKey="advantages.pillars.1.callout.body"
                    fallback="Optimiza tu fiscalidad empresarial"
                  />
                </div>
              </motion.div>

              {/* Pilar 3: Cumplimiento Normativo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-900 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full flex-shrink-0">
                    <Shield className="h-8 w-8" style={{ color: '#15277a' }} />
                  </div>
                  <EditableText
                    as="h3"
                    className="text-2xl font-bold"
                    style={{ color: '#1b1847' }}
                    contentKey="advantages.pillars.2.title"
                    fallback="Cumplimiento Normativo (Compliance)"
                  />
                </div>
                <EditableText
                  as="p"
                  className="text-slate-700 mb-4"
                  contentKey="advantages.pillars.2.body"
                  fallback="Todos nuestros productos cuentan con registro sanitario y certificación AEMPS, garantizando que tu empresa cumple con las normativas de seguridad laboral y salud pública desde el primer día."
                />
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <EditableText
                    as="p"
                    className="text-sm font-semibold text-green-800"
                    contentKey="advantages.pillars.2.callout.title"
                    fallback="✓ Cero riesgos legales"
                  />
                  <EditableText
                    as="p"
                    className="text-sm text-green-700 mt-1"
                    contentKey="advantages.pillars.2.callout.body"
                    fallback="Evita sanciones y auditorías fallidas"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Tabla Comparativa */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <EditableText
                as="h2"
                className="text-3xl lg:text-4xl font-bold mb-4"
                style={{ color: '#1b1847' }}
                contentKey="advantages.compare.title"
                fallback="¿Por Qué Elegir Productos Certificados?"
              />
              <EditableText
                as="p"
                className="text-lg text-slate-600"
                contentKey="advantages.compare.subtitle"
                fallback="La diferencia entre un proveedor convencional y un socio estratégico"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-100 to-slate-50">
                      <th className="px-6 py-4 text-left font-bold" style={{ color: '#1b1847' }}>
                        <EditableText as="span" contentKey="advantages.compare.headers.factor" fallback="Factor Clave" />
                      </th>
                      <th className="px-6 py-4 text-center font-bold text-slate-600">
                        <EditableText as="span" contentKey="advantages.compare.headers.conventional" fallback="Proveedor Convencional" />
                      </th>
                      <th className="px-6 py-4 text-center font-bold" style={{ color: '#15277a' }}>
                        <EditableText as="span" contentKey="advantages.compare.headers.certified" fallback="Tu Empresa (Certificada)" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareData.map((row, index) => (
                      <tr 
                        key={index} 
                        className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50/30 transition-colors`}
                      >
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          <EditableText as="span" contentKey={`advantages.compare.rows.${index}.factor`} fallback={row.factor} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <EditableText as="span" className="text-slate-600" contentKey={`advantages.compare.rows.${index}.conventional`} fallback={row.convencional} />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <EditableText as="span" className="font-medium" style={{ color: '#15277a' }} contentKey={`advantages.compare.rows.${index}.certified`} fallback={row.certificado} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Kit del Comprador */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl shadow-xl p-8 lg:p-12 text-white mb-20"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full flex-shrink-0">
                    <Download className="h-8 w-8 text-blue-200" />
                  </div>
                  <EditableText
                    as="h2"
                    className="text-3xl font-bold"
                    contentKey="advantages.docs.title"
                    fallback="Documentación y Certificaciones"
                  />
                </div>
                <EditableText
                  as="p"
                  className="text-lg text-blue-100 mb-6"
                  contentKey="advantages.docs.description"
                  fallback="Descarga aquí los certificados para tu próxima auditoría o licitación. Con un clic, tendrás todos los documentos necesarios para demostrar tu cumplimiento normativo."
                />
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-green-400" />
                    <EditableText as="span" contentKey="advantages.docs.items.0" fallback="Certificados ISO 9001 / 14001" />
                  </li>
                  <li className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-green-400" />
                    <EditableText as="span" contentKey="advantages.docs.items.1" fallback="Fichas de registro AEMPS" />
                  </li>
                  <li className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-green-400" />
                    <EditableText as="span" contentKey="advantages.docs.items.2" fallback="Etiquetas Ecolabel oficiales" />
                  </li>
                  <li className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-green-400" />
                    <EditableText as="span" contentKey="advantages.docs.items.3" fallback="Fichas de Datos de Seguridad (FDS)" />
                  </li>
                </ul>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-900 hover:bg-blue-50 font-semibold"
                  asChild
                >
                  <a href="/documentacion">
                    <Download className="mr-2 h-5 w-5" />
                    <EditableText as="span" contentKey="advantages.docs.cta" fallback="Documentación y Certificaciones" />
                  </a>
                </Button>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
                  <div className="text-center">
                    <Briefcase className="h-20 w-20 mx-auto text-blue-200 mb-4" />
                    <EditableText
                      as="p"
                      className="text-sm text-blue-100"
                      contentKey="advantages.docs.card"
                      fallback="Ahorra horas de trabajo. Todo lo que necesitas para presentar en tu auditoría, licitación o certificación ESG, en un solo lugar."
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sostenibilidad Rentable */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="grid lg:grid-cols-2">
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center space-x-3 mb-6">
                  <TrendingUp className="h-8 w-8" style={{ color: '#059669' }} />
                  <EditableText
                    as="h2"
                    className="text-3xl font-bold"
                    style={{ color: '#1b1847' }}
                    contentKey="advantages.sustainability.title"
                    fallback="Sostenibilidad Rentable"
                  />
                </div>
                <div className="prose text-slate-700">
                  <EditableText
                    as="p"
                    className="mb-6 text-lg"
                    contentKey="advantages.sustainability.description"
                    fallback="No hablamos solo de salvar el planeta. Hablamos de eficiencia operativa que impacta directamente en tus resultados."
                  />
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      <EditableText as="h4" className="font-bold text-green-900 mb-2" contentKey="advantages.sustainability.blocks.0.title" fallback="Menos Fallos = Más Ahorro" />
                      <EditableText as="p" className="text-sm text-green-800" contentKey="advantages.sustainability.blocks.0.body" fallback="Un producto ISO 9001 garantiza menos fallos, lo que significa menos devoluciones y menos pérdida de tiempo para tu equipo." />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <EditableText as="h4" className="font-bold text-blue-900 mb-2" contentKey="advantages.sustainability.blocks.1.title" fallback="Control de Costes Exacto" />
                      <EditableText as="p" className="text-sm text-blue-800" contentKey="advantages.sustainability.blocks.1.body" fallback="Sistemas de dosificación que evitan mermas y garantizan el coste por uso, sin sorpresas en el inventario." />
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                      <EditableText as="h4" className="font-bold text-purple-900 mb-2" contentKey="advantages.sustainability.blocks.2.title" fallback="Imagen Corporativa Premium" />
                      <EditableText as="p" className="text-sm text-purple-800" contentKey="advantages.sustainability.blocks.2.body" fallback="Cumplir con estándares ESG mejora tu reputación ante inversores, clientes y empleados. La sostenibilidad vende." />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-100 relative min-h-[300px] lg:min-h-full">
                <EditableImage
                  contentKey="advantages.sustainability.image"
                  fallback="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80"
                  alt="Eficiencia y sostenibilidad"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <EditableText
                    as="p"
                    className="text-2xl font-bold"
                    contentKey="advantages.sustainability.caption"
                    fallback="Invierte en calidad, cosecha en eficiencia."
                  />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default VentajasPage;
