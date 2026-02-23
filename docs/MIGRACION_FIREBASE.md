# 🔄 Migración de Productos a Firebase

## 📋 Resumen

Este documento explica el proceso de migración de los productos desde el archivo estático `products.js` a Firebase Firestore. Esta migración es necesaria para:

- ✅ **Habilitar edición en tiempo real** de productos desde el panel de administración
- ✅ **Preservar nueva información** como pH, formatos, descripciones largas, etc.
- ✅ **Justificar el Kit Digital** con un CMS completo y funcional
- ✅ **Mantener compatibilidad** con sistema de fallback a datos locales

## 🎯 ¿Qué se ha actualizado?

### 1. `src/services/productService.js`

Completamente reescrito para:
- Leer productos desde Firebase con fallback automático a `products.js`
- CRUD completo: Create, Read, Update, Delete
- Función `seedDatabase()` para migración segura
- Preservación de IDs originales (no se pierden URLs ni referencias)
- Manejo robusto de errores

### 2. `src/pages/AdminProductsPage.jsx`

Panel de administración completo con:
- **CRUD total**: Crear, editar y eliminar productos
- **Dos modos de edición**:
  - 🖼️ Edición rápida: Solo imagen (click en icono de imagen)
  - ✏️ Edición completa: Todos los campos (click en icono de lápiz)
- **Todos los campos nuevos**: pH, formato, long_description, etc.
- **Búsqueda y filtros** por categoría
- **Botón de migración** integrado con confirmación
- **Estadísticas** en tiempo real

### 3. `tools/migrate-to-firebase.js`

Script standalone para migración desde terminal:
- Verificación de datos existentes
- Confirmación interactiva
- Reporte detallado de progreso
- Manejo de errores individual por producto

### 4. `src/components/ui/textarea.jsx`

Componente UI necesario para campos de texto largos.

## 🚀 Proceso de Migración

### Opción A: Desde el Panel de Administración (Recomendado)

1. **Asegúrate de que Firebase está configurado:**
   ```bash
   # Verifica que existe .env con tus credenciales
   cat .env
   ```

2. **Accede al panel de administración:**
   - Navega a `/admin/products` en tu aplicación
   - Inicia sesión como administrador

3. **Ejecuta la migración:**
   - Click en el botón **"Migrar a Firebase"**
   - Confirma la acción en el diálogo
   - Espera a que termine (puede tardar 1-2 minutos)

4. **Verifica:**
   - Deberías ver el mensaje "✅ Migración completada"
   - Los productos ahora se muestran desde Firebase
   - Puedes editar cualquier producto

### Opción B: Desde la Terminal

1. **Instala dependencias si es necesario:**
   ```bash
   pnpm install dotenv
   ```

2. **Ejecuta el script:**
   ```bash
   node tools/migrate-to-firebase.js
   ```

3. **Sigue las instrucciones en pantalla:**
   - El script te avisará si ya hay datos
   - Muestra progreso cada 50 productos
   - Genera reporte final con estadísticas

## 📊 Estructura de Datos

Cada producto en Firestore mantiene TODOS los campos de `products.js`:

```javascript
{
  id: "101",                    // ID original preservado
  reference: "LG-PS-001",
  name: "DECAP S",
  price: 25,
  category: "limpieza-general",
  description: "Descripción corta...",
  long_description: "Descripción completa...",  // ✨ NUEVO
  ph: "10,5 (1%)",                              // ✨ NUEVO
  formats: "10kg; 20kg",                        // ✨ NUEVO
  usage: "Preparación de Suelos",
  sector: "Limpieza General",
  images: ["https://..."],
  stock: true,
  technicalSheetUrl: "https://...",
  safetySheetUrl: "https://...",
  hasTechnicalSheet: true,
  hasSafetySheet: false,
  certifications: [],
  createdAt: "2026-01-14T21:08:09.268Z",
  updatedAt: "2026-02-17T10:30:00.000Z"
}
```

## 🔧 Uso del Panel de Administración

### Crear Nuevo Producto

1. Click en **"+ Nuevo Producto"**
2. Completa los campos obligatorios:
   - Nombre
   - Referencia
   - Precio
   - Categoría
3. Opcionalmente completa: pH, formatos, descripciones, imágenes, etc.
4. Click en **"➕ Crear Producto"**

### Editar Producto Existente

**Edición Rápida (Solo Imagen):**
- Click en el icono 🖼️ de imagen
- Pega URLs de imágenes (una por línea)
- Click en **"💾 Guardar Cambios"**

**Edición Completa:**
- Click en el icono ✏️ de lápiz
- Edita cualquier campo
- Click en **"💾 Guardar Cambios"**

### Eliminar Producto

- Click en el icono 🗑️ de papelera (rojo)
- Confirma la eliminación
- ⚠️ **Acción irreversible**

### Buscar y Filtrar

- **Barra de búsqueda**: Busca por nombre, referencia o descripción
- **Filtro de categoría**: Muestra solo productos de una categoría específica
- **Estadísticas**: Ver total de productos y resultados filtrados

## 🛡️ Seguridad y Reglas de Firestore

**IMPORTANTE:** Antes de usar en producción, actualiza tus reglas de Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Productos: lectura pública, escritura solo admins
    match /products/{productId} {
      allow read: if true;  // Cualquiera puede leer
      allow write: if request.auth != null 
                   && request.auth.token.admin == true;  // Solo admins pueden escribir
    }
  }
}
```

## ⚠️ Advertencias Importantes

1. **Ejecuta la migración solo UNA VEZ**
   - El script verifica duplicados, pero es mejor prevenir

2. **Backup antes de migrar**
   - Aunque `products.js` permanece intacto, haz backup de tu Firebase

3. **Verifica tu .env**
   - Sin configuración correcta, la app seguirá usando `products.js`

4. **Reglas de Firestore**
   - Actualiza las reglas para proteger las escrituras

5. **Costos de Firebase**
   - Plan gratuito soporta hasta 50,000 lecturas/día
   - ~400 productos = negligible

## 🔄 Rollback (Volver Atrás)

Si necesitas volver al sistema antiguo:

1. **Elimina todos los documentos de Firestore:**
   ```bash
   # Desde Firebase Console
   # O usando el script (crear uno si es necesario)
   ```

2. **La app automáticamente usará `products.js`** como fallback

3. **No se pierde información** porque `products.js` sigue intacto

## 📈 Ventajas de la Migración

| Antes (estático) | Después (Firestore) |
|-----------------|---------------------|
| ❌ Sin edición en línea | ✅ Edición instantánea |
| ❌ Requiere redeploy | ✅ Cambios en vivo |
| ❌ Solo desarrolladores | ✅ Staff no técnico |
| ❌ Sin historial | ✅ Timestamps de cambios |
| ❌ Difícil búsqueda | ✅ Queries eficientes |

## 📞 Soporte

Si encuentras problemas:

1. **Verifica logs del navegador** (F12 → Console)
2. **Verifica logs de Firebase** (Firebase Console → Firestore)
3. **Revisa el archivo de errores** del script de migración
4. **Verifica reglas de Firestore** (pueden bloquear escrituras)

## ✅ Checklist Post-Migración

- [ ] Migración completada sin errores
- [ ] Verificar que se ven productos en `/admin/products`
- [ ] Probar editar un producto
- [ ] Probar crear un producto nuevo
- [ ] Verificar que el frontend sigue funcionando
- [ ] Actualizar reglas de Firestore en producción
- [ ] Hacer backup de Firestore
- [ ] Documentar el proceso para el equipo

---

**Fecha de creación**: 17 de febrero de 2026  
**Versión**: 1.0  
**Autor**: GitHub Copilot
