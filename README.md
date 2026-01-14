# Quimxel B2B Platform

Plataforma B2B para venta de productos de limpieza profesional con integración Firebase.

## 🚀 Tecnologías

- **Frontend**: React 18 + Vite
- **Estilos**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **Routing**: React Router DOM
- **UI Components**: Radix UI

## 📦 Instalación

```bash
# Instalar dependencias
pnpm install
# o
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Configura tus credenciales de Firebase en .env.local

# Ejecutar en desarrollo
pnpm dev
# o
npm run dev
```

## 🔥 Firebase Setup

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilita Firestore Database
3. Habilita Authentication (Email/Password)
4. Copia las credenciales a `.env.local`
5. Despliega las reglas de Firestore:
   ```bash
   firebase deploy --only firestore:rules
   ```

## 🗄️ Estructura de Base de Datos

### Collections:
- **products**: Catálogo de productos
- **categories**: Categorías de productos
- **users**: Usuarios registrados
- **carts**: Carritos de compra
- **orders**: Pedidos realizados

## 🏗️ Build y Deploy

```bash
# Build para producción
pnpm build

# Preview del build
pnpm preview

# Deploy a Firebase Hosting
firebase deploy --only hosting
```

## 📝 Características

- ✅ Catálogo de productos con filtros
- ✅ Sistema de autenticación
- ✅ Carrito de compras
- ✅ Gestión de pedidos
- ✅ Panel de administración
- ✅ Responsive design

## 🔒 Seguridad

Las reglas de Firestore están configuradas para:
- Lectura pública de productos y categorías
- Usuarios solo pueden editar su propio perfil
- Solo admins pueden gestionar productos
- Carritos y pedidos son privados por usuario

## 📁 Estructura del Proyecto

```
LosBaños/
├── src/
│   ├── components/      # Componentes React
│   ├── pages/          # Páginas de la aplicación
│   ├── contexts/       # Contextos de React
│   └── lib/            # Utilidades y helpers
├── public/             # Assets estáticos
├── firebase.json       # Configuración de Firebase
├── firestore.rules     # Reglas de seguridad
└── firestore.indexes.json  # Índices de Firestore
```
