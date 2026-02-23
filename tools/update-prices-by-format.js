#!/usr/bin/env node

/**
 * Actualiza precios por formato desde CSV de tarifa
 * - Lee CSV con precios por unidad de medida (€/L, €/Kg, €/Ud)
 * - Calcula precio total del formato (precio × volumen)
 * - Aplica margen comercial ×2
 * - Actualiza Firestore con precio por formato
 *
 * Uso: node tools/update-prices-by-format.js --commit
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve('./tools/losbanosdata-1f79f-firebase-adminsdk-fbsvc-22c837deb3.json');
const csvPath = path.resolve('./public/-Tarifa Quimxel 2025 ED 25-1-.xlsx - HOSTELERIA.csv');
const commit = process.argv.includes('--commit');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account no encontrado: ${serviceAccountPath}`);
  process.exit(1);
}

if (!fs.existsSync(csvPath)) {
  console.error(`❌ CSV no encontrado: ${csvPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://losbanosdata-1f79f.firebaseio.com'
});

const db = admin.firestore();

// Parser CSV que respeta campos entre comillas
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Extraer nombre del producto del CSV (ej: "DECAP S 05 LTS. (PB) Decapante..." -> "DECAP S")
function extractProductName(csvDescription) {
  // Formato: "DECAP S 05 LTS. (PB) Decapante De Ceras Concentrado"
  // Queremos: "DECAP S"
  const match = csvDescription.match(/^([A-Z\s\d]+?)(?:\s+\d+|$)/);
  if (match) {
    return match[1].trim();
  }
  return csvDescription.split(' ')[0];
}

// Parsear CSV manualmente
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'latin1');
  const lines = content.split(/\r?\n/);
  const products = [];
  let skippedCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = parseCSVLine(line);
    
    if (cols.length < 6) {
      skippedCount++;
      continue;
    }

    const reference = cols[0]?.trim();
    const description = cols[1]?.trim();
    const priceRaw = cols[4]?.trim();
    const unit = cols[5]?.trim();

    // Filtrar líneas sin referencia o con encabezados
    if (!reference || reference.length < 5) {
      skippedCount++;
      continue;
    }
    if (priceRaw.includes('Precio') || !priceRaw) {
      skippedCount++;
      continue;
    }
    if (!unit || unit === 'Ud./Pale') {
      skippedCount++;
      continue;
    }

    // Parsear precio (ej: "1,240 €" -> 1.24)
    const priceMatch = priceRaw.match(/(\d+[\.,]\d+)/);
    if (!priceMatch) {
      skippedCount++;
      continue;
    }
    const pricePerUnit = parseFloat(priceMatch[1].replace(',', '.'));

    const productName = extractProductName(description);
    products.push({ reference, productName, pricePerUnit, unit });
  }

  console.log(`📋 Total líneas: ${lines.length}, Productos válidos: ${products.length}, Saltadas: ${skippedCount}\n`);
  return products;
}

// Extraer volumen del nombre de formato (5L -> 5, 1,5L -> 1.5, 750ml -> 0.75)
function extractVolume(formatName) {
  if (!formatName) return null;

  // Casos: 5L, 1,5L, 1.5L, 750ml, 500 ml
  const literMatch = formatName.match(/(\d+[\.,]?\d*)\s*L/i);
  if (literMatch) {
    return parseFloat(literMatch[1].replace(',', '.'));
  }

  const mlMatch = formatName.match(/(\d+)\s*ml/i);
  if (mlMatch) {
    return parseFloat(mlMatch[1]) / 1000;
  }

  return null;
}

// Calcular precio del formato
function calculateFormatPrice(pricePerUnit, formatName, unit) {
  const volume = extractVolume(formatName);
  if (!volume) return null;

  // Solo aplicar cálculo si la unidad es por litro
  if (unit.toLowerCase() !== 'l') return null;

  // Precio = (precio/L) × volumen × 2 (margen)
  const calculatedPrice = pricePerUnit * volume * 2;
  return Math.round(calculatedPrice * 100) / 100; // Redondear a 2 decimales
}

async function updatePrices() {
  console.log('🔄 Actualizando precios por formato desde CSV...\n');

  const csvProducts = parseCSV(csvPath);
  console.log(`📊 Leídos ${csvProducts.length} productos del CSV\n`);

  // Crear mapa de precios por NOMBRE de producto
  const priceMap = new Map();
  for (const prod of csvProducts) {
    // Normalizar nombre para matching (uppercase sin espacios extra)
    const normalizedName = prod.productName.toUpperCase().replace(/\s+/g, ' ').trim();
    priceMap.set(normalizedName, { pricePerUnit: prod.pricePerUnit, unit: prod.unit });
  }

  // Debug: mostrar primeros nombres del CSV
  console.log('🔍 Primeros 5 nombres del CSV:');
  Array.from(priceMap.keys()).slice(0, 5).forEach(name => console.log(`   ${name}`));
  console.log('');

  let updated = 0;
  let skipped = 0;
  let errors = 0;
  let matched = 0;

  try {
    const snapshot = await db.collection('products').get();
    
    // Debug: mostrar primeros nombres de Firestore
    console.log('🔍 Primeros 5 nombres de Firestore:');
    snapshot.docs.slice(0, 5).forEach(doc => {
      const prod = doc.data();
      console.log(`   ${prod.name || 'SIN NOMBRE'}`);
    });
    console.log('');

    for (const doc of snapshot.docs) {
      try {
        const product = doc.data();
        const name = product.name;

        if (!name) {
          skipped++;
          continue;
        }

        // Normalizar nombre del producto
        const normalizedName = name.toUpperCase().replace(/\s+/g, ' ').trim();
        const priceInfo = priceMap.get(normalizedName);
        
        if (!priceInfo) {
          skipped++;
          continue;
        }

        matched++;

        const formats = product.formats;
        if (!Array.isArray(formats) || formats.length === 0) {
          console.log(`⚠️  ${product.name} - Coincide en CSV pero sin formatos en Firestore`);
          skipped++;
          continue;
        }

        // Actualizar precio de cada formato
        const updatedFormats = formats.map((fmt) => {
          const calculatedPrice = calculateFormatPrice(
            priceInfo.pricePerUnit,
            fmt.name,
            priceInfo.unit
          );

          if (calculatedPrice !== null) {
            return { ...fmt, price: String(calculatedPrice) };
          }
          return fmt;
        });

        if (commit) {
          await db.collection('products').doc(doc.id).update({
            formats: updatedFormats
          });
          console.log(`✅ ${product.name} - Actualizado`);
        } else {
          console.log(`ℹ️  [SIMULACIÓN] ${product.name}`);
          updatedFormats.forEach((fmt) => {
            if (fmt.price) {
              console.log(`   ${fmt.name}: ${priceInfo.pricePerUnit}€/L × ${extractVolume(fmt.name)}L × 2 = ${fmt.price}€`);
            }
          });
        }

        updated++;
      } catch (error) {
        console.error(`❌ Error en producto ${doc.id}:`, error.message);
        errors++;
      }
    }
  } catch (error) {
    console.error('❌ Error general:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🎯 Referencias coincidentes: ${matched}`);
  console.log(`✅ Productos con formatos actualizados: ${updated}`);
  console.log(`⏭️  Saltados (sin match/formatos): ${skipped}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(commit ? '✓ CAMBIOS GUARDADOS' : '⚠️ MODO SIMULACIÓN (usa --commit para guardar)');
  console.log('='.repeat(60) + '\n');
}

updatePrices().then(() => process.exit(0));
