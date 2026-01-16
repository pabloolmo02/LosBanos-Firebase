
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Building, FileText, Mail, Lock, Phone, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from "@/components/ui/checkbox.jsx";
import { Label } from "@/components/ui/label.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import emailjs from '@emailjs/browser';

// TODO: REEMPLAZA ESTAS CONSTANTES CON TUS DATOS DE EMAILJS
const EMAILJS_SERVICE_ID = "service_id"; // Tu Service ID
const EMAILJS_TEMPLATE_ID = "template_id"; // Tu Template ID
const EMAILJS_PUBLIC_KEY = "public_key"; // Tu Public Key

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    cif: '',
    email: '',
    password: '',
    phone: '',
    sector: '',
    marketingConsent: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (value) => {
    setFormData({ ...formData, sector: value });
  };

  const handleCheckboxChange = (checked) => {
    setFormData({ ...formData, marketingConsent: checked });
  };

  const sendEmailNotification = (data) => {
    if (EMAILJS_SERVICE_ID === "service_id") {
        console.warn("EmailJS no configurado. No se enviará email.");
        return;
    }

    const templateParams = {
        to_email: "pabloolmolopez9@gmail.com",
        company_name: data.companyName,
        cif: data.cif,
        contact_email: data.email,
        phone: data.phone,
        sector: data.sector
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
      .then((response) => {
         console.log('SUCCESS!', response.status, response.text);
      }, (err) => {
         console.log('FAILED...', err);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        await register({
            email: formData.email,
            password: formData.password,
            company: formData.companyName,
            cif: formData.cif,
            phone: formData.phone,
            sector: formData.sector,
            marketingConsent: formData.marketingConsent
        });

        // Intentar enviar email de notificación
        sendEmailNotification(formData);

        toast({
        title: "Solicitud de registro enviada",
        description: "Su cuenta ha sido creada. Un administrador debe validarla para acceder a los precios.",
        });

        navigate('/dashboard'); 
    } catch (error) {
        console.error(error);
        let errorMsg = "Hubo un problema al crear su cuenta.";
        if (error.code === 'auth/email-already-in-use') errorMsg = "Este correo electrónico ya está registrado.";
        if (error.code === 'auth/weak-password') errorMsg = "La contraseña debe tener al menos 6 caracteres.";

        toast({
            title: "Error en el registro",
            description: errorMsg,
            variant: "destructive"
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Solicitar Acceso B2B | QUÍMICAS QUIMXEL</title>
        <meta name="description" content="Regístrese para obtener una cuenta profesional B2B. Acceda a precios exclusivos, soporte técnico y pedidos rápidos en QUÍMICAS QUIMXEL." />
      </Helmet>

      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Solicitud de Acceso B2B</h1>
              <p className="text-slate-600 mt-2">
                Únase a nuestra plataforma profesional. Validamos manualmente cada empresa para garantizar exclusividad.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="companyName">
                    Nombre de la Empresa
                    </label>
                    <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input id="companyName" type="text" required onChange={handleChange} value={formData.companyName} placeholder="Nombre Fiscal S.L." className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="cif">
                    NIF/CIF
                    </label>
                    <div className="relative mt-1">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input id="cif" type="text" required onChange={handleChange} value={formData.cif} placeholder="B12345678" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="phone">
                    Teléfono de Contacto
                    </label>
                    <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input id="phone" type="tel" required onChange={handleChange} value={formData.phone} placeholder="600 000 000" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">
                    Sector de Actividad
                    </label>
                    <div className="relative mt-1">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                        <Select onValueChange={handleSelectChange} required>
                            <SelectTrigger className="w-full pl-10 h-[50px]">
                                <SelectValue placeholder="Seleccione su sector" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="horeca">HORECA (Hostelería/Restauración)</SelectItem>
                                <SelectItem value="sanitaria">Sanitario / Residencias</SelectItem>
                                <SelectItem value="lavanderia">Lavandería Industrial</SelectItem>
                                <SelectItem value="automocion">Automoción / Talleres</SelectItem>
                                <SelectItem value="limpieza_industrial">Empresa de Limpieza</SelectItem>
                                <SelectItem value="construccion">Construcción / Industria</SelectItem>
                                <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="email">
                  Correo Electrónico Corporativo
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input id="email" type="email" required onChange={handleChange} value={formData.email} placeholder="compras@su-empresa.com" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="password">
                  Contraseña
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input id="password" type="password" required onChange={handleChange} value={formData.password} placeholder="Mínimo 8 caracteres" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox id="marketing" onCheckedChange={handleCheckboxChange} />
                <Label htmlFor="marketing" className="text-sm text-slate-600 leading-snug">
                  Deseo recibir novedades sobre productos, ofertas personalizadas para mi sector y actualizaciones regulatorias (FDS). 
                  <span className="text-xs block text-slate-400 mt-1">Puede darse de baja en cualquier momento.</span>
                </Label>
              </div>

              <Button size="lg" type="submit" className="w-full" disabled={loading}>
                {loading ? 'Procesando...' : 'Enviar Solicitud de Registro'}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-slate-600">
                ¿Ya tiene una cuenta?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:underline">
                  Inicie sesión aquí
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;
