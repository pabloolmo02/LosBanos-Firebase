import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#ffffff', color: '#1b1847' }} className="border-t border-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src="/images/logo-letra.png" alt="Los Baños Comercial Logo" className="h-12 w-auto" />
            </div>
            <p className="text-sm mb-4" style={{ color: '#1b1847' }}>
              Distribución exclusiva de productos químicos profesionales certificados para HORECA, Lavandería y Limpieza Industrial.
            </p>
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
            <span className="font-semibold text-lg block mb-4" style={{ color: '#1b1847' }}>Productos</span>
            <ul className="space-y-2 text-sm">
              <li><Link to="/productos?cat=industria-alimentaria" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>Alimentaria</Link></li>
              <li><Link to="/productos?cat=lavanderia-profesional" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>Lavandería Profesional</Link></li>
              <li><Link to="/productos?cat=productos-certificados" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>HORECA</Link></li>
              <li><Link to="/productos?cat=sanitaria" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>Sanitaria</Link></li>
              <li><Link to="/productos?cat=productos-certificados" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>Línea Ecolabel</Link></li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-lg block mb-4" style={{ color: '#1b1847' }}>Empresa</span>
            <ul className="space-y-2 text-sm">
              <li><Link to="/empresa" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>Sobre Nosotros</Link></li>
              <li><Link to="/documentacion" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>Documentación Legal</Link></li>
              <li><Link to="/empresa#calidad" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>Política de Calidad</Link></li>
              <li><Link to="/empresa#medioambiente" className="transition-colors" style={{ color: '#1b1847' }} onMouseEnter={(e) => e.target.style.color = '#15277a'} onMouseLeave={(e) => e.target.style.color = '#1b1847'}>Medio Ambiente</Link></li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-lg block mb-4" style={{ color: '#1b1847' }}>Contacto</span>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2" style={{ color: '#1b1847' }}>
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>Sevilla y Córdoba, Andalucía</span>
              </li>
              <li className="flex items-center space-x-2" style={{ color: '#1b1847' }}>
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+34 659 862 383</span>
              </li>
              <li className="flex items-center space-x-2" style={{ color: '#1b1847' }}>
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@folmo.es</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-sm text-center" style={{ borderColor: '#1b1847', color: '#1b1847' }}>
          <p>&copy; {new Date().getFullYear()} Comercial Los Baños - Distribución Autorizada. Todos los derechos reservados.</p>
          <p className="mt-2">Entrega a toda España</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
