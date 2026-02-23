#!/usr/bin/env node

/**
 * Actualiza productos con formato "Estándar" por sus formatos reales
 * desde products.js y aplica precios del CSV
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import productsData from '../src/lib/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve('./tools/losbanosdata-1f79f-firebase-adminsdk-fbsvc-22c837deb3.json');
const csvPath = path.resolve('./public/-Tarifa Quimxel 2025 ED 25-1-.xlsx - HOSTELERIA.csv');
const commit = process.argv.includes('--commit');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account no encontrado: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://losbanosdata-1f79f.firebaseio.com'
});

const db = admin.firestore();
const products = productsData.default || productsData;

// Parser CSV
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

function extractProductName(csvDescription) {
  const match = csvDescription.match(/^([A-Z\s\d]+?)(?:\s+\d+|$)/);
  if (match) return match[1].trim();
  return csvDescription.split(' ')[0];
}

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'latin1');
  const lines = content.split(/\r?\n/);
  const products = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = parseCSVLine(line);
    
    if (cols.length < 6) continue;

    const reference = cols[0]?.trim();
    const description = cols[1]?.trim();
    const priceRaw = cols[4]?.trim();
    const unit = cols[5]?.trim();

    if (!reference || reference.length < 5) continue;
    if (priceRaw.includes('Precio') || !priceRaw) continue;
    if (!unit || unit === 'Ud./Pale') continue;

    const priceMatch = priceRaw.match(/(\d+[\.,]\d+)/);
    if (!priceMatch) continue;
    const pricePerUnit = parseFloat(priceMatch[1].replace(',', '.'));

    const productName = extractProductName(description);
    products.push({ reference, productName, pricePerUnit, unit });
  }

  return products;
}

// Extraer volumen del formato
function extractVolume(formatName) {
  if (!formatName) return null;

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

function calculateFormatPrice(pricePerUnit, formatName, unit) {
  const volume = extractVolume(formatName);
  if (!volume) return null;
  if (unit.toLowerCase() !== 'l') return null;

  const calculatedPrice = pricePerUnit * volume * 2;
  return Math.round(calculatedPrice * 100) / 100;
}

// Normalizar formato (4x5L -> 5L)
function normalizeFormatToken(token) {
  const cleaned = token.trim();
  const multiplierMatch = cleaned.match(/^\d+x(.+)$/i);
  if (multiplierMatch) {
    return multiplierMatch[1].trim();
  }
  return cleaned;
}

function parseFormats(formatsString) {
  if (!formatsString) return [];
  const separators = /[;,]/g;
  return formatsString
    .split(separators)
    .map(normalizeFormatToken)
    .filter(Boolean);
}

async function fixEstandarFormats() {
  console.log('🔄 Actualizando productos con formato "Estándar"...\n');

  const csvProducts = parseCSV(csvPath);
  const priceMap = new Map();
  for (const prod of csvProducts) {
    const normalizedName = prod.productName.toUpperCase().replace(/\s+/g, ' ').trim();
    priceMap.set(normalizedName, { pricePerUnit: prod.pricePerUnit, unit: prod.unit });
  }

  let updated = 0;
  let skipped = 0;

  try {
    const snapshot = await db.collection('products').get();

    for (const doc of snapshot.docs) {
      try {
        const product = doc.data();
        
        // Solo procesar productos con formato "Estándar"
        if (!product.formats || !Array.isArray(product.formats)) {
          skipped++;
          continue;
        }

        const hasEstandar = product.formats.some(f => f.name === 'Estándar');
        if (!hasEstandar) {
          skipped++;
          continue;
        }

        // Buscar en products.js
        const localProduct = products.find(p => p.name === product.name);
        if (!localProduct || !localProduct.formats) {
          console.log(`⚠️  ${product.name} - No encontrado en products.js`);
          skipped++;
          continue;
        }

        // Parsear formatos desde products.js
        const formatNames = parseFormats(localProduct.formats);
        if (formatNames.length === 0) {
          skipped++;
          continue;
        }

        // Obtener precio del CSV
        const normalizedName = product.name.toUpperCase().replace(/\s+/g, ' ').trim();
        const priceInfo = priceMap.get(normalizedName);

        // Crear array de formatos con precios
        const validImage = Array.isArray(localProduct.images) 
          ? localProduct.images.find(img => !img.startsWith('gs://'))
          : (!localProduct.images?.startsWith('gs://') ? localProduct.images : null);

        const newFormats = formatNames.map(formatName => {
          const format = {
            name: formatName,
            image: validImage || localProduct.images?.[0] || ''
          };

          // Calcular precio si tenemos info del CSV
          if (priceInfo) {
            const calculatedPrice = calculateFormatPrice(
              priceInfo.pricePerUnit,
              formatName,
              priceInfo.unit
            );
            if (calculatedPrice !== null) {
              format.price = String(calculatedPrice);
            }
          }

          return format;
        });

        if (commit) {
          await db.collection('products').doc(doc.id).update({
            formats: newFormats
          });
          console.log(`✅ ${product.name} - Actualizado con formatos: ${formatNames.join(', ')}`);
        } else {
          console.log(`ℹ️  [SIMULACIÓN] ${product.name} - ${formatNames.join(', ')}`);
        }

        updated++;
      } catch (error) {
        console.error(`❌ Error en producto ${doc.id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Error general:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Actualizados: ${updated}`);
  console.log(`⏭️  Saltados: ${skipped}`);
  console.log(commit ? '✓ CAMBIOS GUARDADOS' : '⚠️ MODO SIMULACIÓN (usa --commit para guardar)');
  console.log('='.repeat(60) + '\n');
}

fixEstandarFormats().then(() => process.exit(0));
