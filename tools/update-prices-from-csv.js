/**
 * Script para actualizar precios de formatos desde CSV de tarifas
 * 
 * Lee el CSV de tarifas y actualiza cada producto en Firebase
 * con variants que incluyen formato y precio específico
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar credenciales
const serviceAccountPath = join(__dirname, 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-22c837deb3.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Función para normalizar formato
function normalizeFormat(formatStr) {
  if (!formatStr) return null;
  
  // Limpiar y normalizar
  let normalized = formatStr.trim();
  
  // Casos especiales: "4x5L" → "5L", "12 uds." → eliminar
  normalized = normalized
    .replace(/^\d+x/, '')  // Eliminar "4x" del inicio
    .replace(/\d+\s*uds?\.?\s*/gi, '')  // Eliminar "12 uds."
    .replace(/\s+/g, ' ')  // Normalizar espacios
    .trim();
  
  // Normalizar unidades
  normalized = normalized
    .replace(/\s*lts?\.?\s*/gi, 'L')  // "05 LTS." → "5L"
    .replace(/\s*kgs?\.?\s*/gi, 'kg')  // "10 KGS" → "10kg"
    .replace(/\s*grs?\.?\s*/gi, 'g')   // "500 GR" → "500g"
    .replace(/\s*mls?\.?\s*/gi, 'ml')  // "750 ML" → "750ml"
    .replace(/^0+/, '');  // Eliminar ceros iniciales "05" → "5"
  
  return normalized;
}

// Función para extraer precio del formato "1,240 €"
function parsePrice(priceStr) {
  if (!priceStr) return null;
  
  // Eliminar espacios, €, y convertir coma a punto
  const cleaned = priceStr
    .replace(/\s/g, '')
    .replace(/€/g, '')
    .replace(',', '.');
  
  const price = parseFloat(cleaned);
  return isNaN(price) ? null : price;
}

// Función para calcular precio unitario basado en el tipo de unidad
function calculateUnitPrice(price, format, unitType) {
  if (!price || !format) return price;
  
  // Si es por unidad, el precio es el precio final
  if (unitType === 'Ud') {
    return price;
  }
  
  // Si es por litro o kilo, extraer la cantidad del formato
  const match = format.match(/(\d+[\.,]?\d*)/);
  if (match) {
    const quantity = parseFloat(match[1].replace(',', '.'));
    
    if (unitType === 'L') {
      return price * quantity; // Precio por litro * litros
    } else if (unitType === 'kg') {
      return price * quantity; // Precio por kg * kg
    } else if (unitType === 'g') {
      return price * (quantity / 1000); // Precio por kg * gramos/1000
    } else if (unitType === 'ml') {
      return price * (quantity / 1000); // Precio por litro * ml/1000
    }
  }
  
  return price;
}

async function updatePricesFromCSV() {
  console.log('\n🚀 Actualizando precios desde CSV...\n');
  
  // Leer CSV
  const csvPath = join(__dirname, '..', 'public', '-Tarifa Quimxel 2025 ED 25-1-.xlsx - HOSTELERIA.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  
  // Map para agrupar formatos por referencia
  const productVariants = {};
  
  // Procesar cada línea
  for (const line of lines) {
    const columns = line.split(',');
    
    // Verificar que tenga datos válidos
    if (columns.length < 6) continue;
    
    const reference = columns[0]?.trim();
    const description = columns[1]?.trim();
    const priceStr = columns[4]?.trim().replace(/"/g, '');
    const unitType = columns[5]?.trim();
    
    if (!reference || !description || !priceStr || reference.length < 5) continue;
    
    // Extraer formato de la descripción
    // Ejemplo: "DECAP S 05 LTS. (PB) Decapante..." → "5L"
    const formatMatch = description.match(/(\d+[\.,]?\d*\s*(?:LTS?|KGS?|GRS?|ML|L|kg|g|ml)\.?)/i);
    if (!formatMatch) continue;
    
    const rawFormat = formatMatch[1];
    const normalizedFormat = normalizeFormat(rawFormat);
    const price = parsePrice(priceStr);
    
    if (!normalizedFormat || !price) continue;
    
    // Calcular precio unitario
    const unitPrice = calculateUnitPrice(price, normalizedFormat, unitType);
    
    if (!unitPrice) continue;
    
    // Agrupar por referencia (sin los últimos dígitos que pueden variar)
    // Ejemplo: "0030102" → "003010" (base reference)
    const baseRef = reference.substring(0, 6);
    
    if (!productVariants[baseRef]) {
      productVariants[baseRef] = {
        reference: reference,
        variants: []
      };
    }
    
    productVariants[baseRef].variants.push({
      format: normalizedFormat,
      price: Math.round(unitPrice * 100) / 100, // Redondear a 2 decimales
      rawDescription: description
    });
  }
  
  console.log(`📊 Referencias encontradas: ${Object.keys(productVariants).length}\n`);
  
  // Ahora actualizar Firebase
  let updatedCount = 0;
  let notFoundCount = 0;
  
  for (const [baseRef, data] of Object.entries(productVariants)) {
    try {
      // Buscar producto por referencia en Firebase
      const querySnapshot = await db.collection('products')
        .where('reference', '>=', baseRef)
        .where('reference', '<', baseRef + '\uf8ff')
        .limit(1)
        .get();
      
      if (querySnapshot.empty) {
        notFoundCount++;
        console.log(`⚠️  No encontrado en Firebase: ${baseRef}`);
        continue;
      }
      
      const doc = querySnapshot.docs[0];
      const productId = doc.id;
      const productData = doc.data();
      
      // Crear variants con IDs únicos
      const variants = data.variants.map((v, index) => ({
        id: `${productId}_variant_${index}`,
        format: v.format,
        price: v.price
      }));
      
      // Calcular precio base (el más bajo)
      const basePrice = Math.min(...variants.map(v => v.price));
      
      // Actualizar documento
      await db.collection('products').doc(productId).update({
        variants: variants,
        price: basePrice, // Precio base para compatibilidad
        formats: variants.map(v => v.format).join('; '), // String de formatos
        updatedAt: new Date().toISOString()
      });
      
      updatedCount++;
      console.log(`✅ ${productData.name} - ${variants.length} formatos actualizados`);
      
    } catch (error) {
      console.error(`❌ Error procesando ${baseRef}:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Productos actualizados: ${updatedCount}`);
  console.log(`⚠️  Referencias no encontradas: ${notFoundCount}`);
  console.log('='.repeat(60) + '\n');
}

updatePricesFromCSV()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ ERROR:', error);
    process.exit(1);
  });
