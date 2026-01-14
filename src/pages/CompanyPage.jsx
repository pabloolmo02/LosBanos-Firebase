
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Award, Shield, Leaf, Users, TrendingUp, MapPin } from 'lucide-react';

const CompanyPage = () => {
  return (
    <>
      <Helmet>
        <title>Sobre Nosotros - QUÍMICAS QUIMXEL | 35+ Años de Experiencia</title>
        <meta name="description" content="QUÍMICAS QUIMXEL, S.L. - Más de 35 años fabricando productos químicos profesionales certificados ISO 9001/14001. Distribución exclusiva en Sevilla y Córdoba." />
      </Helmet>

      <div className="bg-slate-50">
        <div className="text-white py-20" style={{
          backgroundImage: "linear-gradient(rgba(27, 24, 71, 0.75), rgba(28, 37, 107, 0.75)), url('/images/products-hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                35+ Años de Excelencia en Productos Químicos Profesionales
              </h1>
              <p className="text-xl text-blue-100">
                QUÍMICAS QUIMXEL, S.L. - Calidad certificada y compromiso con la sostenibilidad
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#1b1847' }}>Nuestra Historia</h2>
              <div className="prose prose-lg text-slate-700">
                <p className="mb-4">
                  Con más de 35 años de trayectoria, QUÍMICAS QUIMXEL, S.L. se ha consolidado como un referente en la fabricación de productos químicos profesionales de alta calidad para los sectores de HORECA, Lavandería Industrial, Limpieza Sanitaria y Automoción.
                </p>
                <p className="mb-4">
                  Nuestra experiencia y compromiso con la innovación nos han permitido desarrollar soluciones químicas que cumplen con los más altos estándares de calidad, seguridad y sostenibilidad ambiental.
                </p>
                <p>
                  Como distribuidores exclusivos en Sevilla y Córdoba, garantizamos no solo productos de máxima calidad, sino también un servicio de proximidad, soporte técnico especializado y logística eficiente con entrega garantizada en 48 horas.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img 
                className="rounded-2xl shadow-xl w-full h-auto" 
                alt="Instalaciones de fabricación de QUÍMICAS QUIMXEL con certificaciones de calidad"
               src="https://images.unsplash.com/photo-1698580868042-8a1bfab0c4c0" />
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#e3f2fd' }}>
                <TrendingUp className="h-8 w-8" style={{ color: '#15277a' }} />
              </div>
              <h3 className="text-4xl font-bold mb-2" style={{ color: '#15277a' }}>35+</h3>
              <p className="text-slate-600">Años de Experiencia</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-4xl font-bold text-green-600 mb-2">500+</h3>
              <p className="text-slate-600">Clientes B2B Activos</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-4xl font-bold text-purple-600 mb-2">48h</h3>
              <p className="text-slate-600">Entrega Garantizada</p>
            </motion.div>
          </div>

          <div id="calidad" className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 mb-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="h-8 w-8" style={{ color: '#15277a' }} />
                  <h2 className="text-3xl font-bold" style={{ color: '#1b1847' }}>Política de Calidad</h2>
                </div>
                <div className="prose text-slate-700">
                  <p className="mb-4">
                    En QUÍMICAS QUIMXEL, la calidad no es solo un objetivo, es nuestro compromiso fundamental. Nuestra certificación ISO 9001 garantiza que todos nuestros procesos de fabricación, control y distribución cumplen con los estándares internacionales más exigentes.
                  </p>
                  <ul className="space-y-2">
                    <li>Control de calidad riguroso en cada etapa de producción</li>
                    <li>Trazabilidad completa de materias primas y productos finales</li>
                    <li>Laboratorio propio con equipamiento de última generación</li>
                    <li>Formación continua de nuestro equipo técnico</li>
                    <li>Auditorías internas y externas periódicas</li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="grid grid-cols-2 gap-6">
                  <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#e3f2fd' }}>
                    <Award className="h-12 w-12 mx-auto mb-3" style={{ color: '#15277a' }} />
                    <p className="font-bold" style={{ color: '#1b1847' }}>ISO 9001</p>
                    <p className="text-sm text-slate-600">Gestión de Calidad</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 text-center">
                    <Award className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <p className="font-bold" style={{ color: '#1b1847' }}>ISO 14001</p>
                    <p className="text-sm text-slate-600">Gestión Ambiental</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="medioambiente" className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  className="rounded-xl shadow-lg w-full h-auto" 
                  alt="Productos ecológicos certificados Ecolabel de QUÍMICAS QUIMXEL"
                 src="https://images.unsplash.com/photo-1679590988942-82d1575a83ae" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Leaf className="h-8 w-8 text-green-600" />
                  <h2 className="text-3xl font-bold" style={{ color: '#1b1847' }}>Compromiso Ambiental</h2>
                </div>
                <div className="prose text-slate-700">
                  <p className="mb-4">
                    Nuestra certificación ISO 14001 y la línea de productos Ecolabel demuestran nuestro compromiso firme con la sostenibilidad y la protección del medio ambiente.
                  </p>
                  <ul className="space-y-2">
                    <li>Desarrollo de productos biodegradables y de bajo impacto ambiental</li>
                    <li>Reducción de emisiones en procesos de fabricación</li>
                    <li>Gestión responsable de residuos y efluentes</li>
                    <li>Envases reciclables y optimización de packaging</li>
                    <li>Productos ultraconcentrados que reducen huella de carbono en transporte</li>
                    <li>Certificación Ecolabel en productos clave</li>
                  </ul>
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
