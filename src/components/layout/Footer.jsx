import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import EditableText from '@/components/editable/EditableText';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#ffffff', color: '#1b1847' }} className="border-t border-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src="/images/logo-letra.png" alt="Los Baños Comercial Logo" className="h-12 w-auto" />
            </div>
            <EditableText
              as="p"
              className="text-sm mb-4"
              style={{ color: '#1b1847' }}
              contentKey="footer.description"
              fallback="Distribución exclusiva de productos químicos profesionales certificados para HORECA, Lavandería y Limpieza Industrial."
            />
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-16 h-10 bg-white rounded flex items-center justify-center">
                <span className="text-xs font-bold" style={{ color: '#1b1847' }}>ISO 9001</span>
              </div>
              <div className="w-16 h-10 bg-white rounded flex items-center justify-center">
                <span className="text-xs font-bold" style={{ color: '#1b1847' }}>ISO 14001</span>
              </div>
              <div className="px-2 py-1 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white whitespace-nowrap">ECOLABEL</span>
              </div>
            </div>
          </div>

          <div>
            <EditableText
              as="span"
              className="font-semibold text-lg block mb-4"
              style={{ color: '#1b1847' }}
              contentKey="footer.sections.products"
              fallback="Productos"
            />
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/productos?cat=industria-alimentaria" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>
                  <EditableText as="span" contentKey="footer.products.alimentaria" fallback="Alimentaria" />
                </Link>
              </li>
              <li>
                <Link to="/productos?cat=lavanderia-profesional" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>
                  <EditableText as="span" contentKey="footer.products.lavanderia" fallback="Lavandería Profesional" />
                </Link>
              </li>
              <li>
                <Link to="/productos?cat=productos-certificados" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>
                  <EditableText as="span" contentKey="footer.products.horeca" fallback="HORECA" />
                </Link>
              </li>
              <li>
                <Link to="/productos?cat=sanitaria" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>
                  <EditableText as="span" contentKey="footer.products.sanitaria" fallback="Sanitaria" />
                </Link>
              </li>
              <li>
                <Link to="/productos?cat=productos-certificados" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>
                  <EditableText as="span" contentKey="footer.products.ecolabel" fallback="Línea Ecolabel" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <EditableText
              as="span"
              className="font-semibold text-lg block mb-4"
              style={{ color: '#1b1847' }}
              contentKey="footer.sections.company"
              fallback="Empresa"
            />
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/empresa" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>
                  <EditableText as="span" contentKey="footer.company.about" fallback="Sobre Nosotros" />
                </Link>
              </li>
              <li>
                <Link to="/documentacion" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>
                  <EditableText as="span" contentKey="footer.company.docs" fallback="Documentación Legal" />
                </Link>
              </li>
              <li>
                <Link to="/empresa#calidad" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>
                  <EditableText as="span" contentKey="footer.company.quality" fallback="Política de Calidad" />
                </Link>
              </li>
              <li>
                <Link to="/empresa#medioambiente" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>
                  <EditableText as="span" contentKey="footer.company.environment" fallback="Medio Ambiente" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <EditableText
              as="span"
              className="font-semibold text-lg block mb-4"
              style={{ color: '#1b1847' }}
              contentKey="footer.sections.contact"
              fallback="Contacto"
            />
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2" style={{ color: '#1b1847' }}>
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <EditableText as="span" contentKey="footer.contact.address" fallback="Sevilla, Córdoba y Málaga" />
              </li>
              <li className="flex items-center space-x-2" style={{ color: '#1b1847' }}>
                <Phone className="h-4 w-4 flex-shrink-0" />
                <EditableText as="span" contentKey="footer.contact.phone" fallback="+34 659 862 383" />
              </li>
              <li className="flex items-center space-x-2" style={{ color: '#1b1847' }}>
                <Mail className="h-4 w-4 flex-shrink-0" />
                <EditableText as="span" contentKey="footer.contact.email" fallback="info@folmo.es" />
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-sm text-center" style={{ borderColor: '#1b1847', color: '#1b1847' }}>
          <EditableText
            as="p"
            contentKey="footer.legal"
            fallback={`© ${new Date().getFullYear()} Comercial Los Baños - Distribución Autorizada. Todos los derechos reservados.`}
          />
          <EditableText
            as="p"
            className="mt-2"
            contentKey="footer.shipping"
            fallback="Entrega a toda España"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
