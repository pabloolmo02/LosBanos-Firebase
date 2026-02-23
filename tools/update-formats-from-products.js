#!/usr/bin/env node

/**
 * Actualiza los formatos en Firestore a partir de src/lib/products.js
 * - Normaliza formatos ("4x5l" -> "5L")
 * - Usa la imagen principal como imagen de cada formato
 * - No toca el precio por formato (se deja para más adelante)
 *
 * Uso: node tools/update-formats-from-products.js --commit
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import products from '../src/lib/products.js';

const serviceAccountPath = path.resolve('./tools/losbanosdata-1f79f-firebase-adminsdk-fbsvc-22c837deb3.json');
const commit = process.argv.includes('--commit');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account no encontrado en: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://losbanosdata-1f79f.firebaseio.com'
});

const db = admin.firestore();

const normalizeFormatToken = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw.trim();
  if (!cleaned) return null;

  // Si hay multiplicador (4x5L), nos quedamos con el volumen
  const parts = cleaned.split(/x/i).map((p) => p.trim());
  const candidate = parts.length > 1 ? parts[parts.length - 1] : cleaned;

  // Buscar volumen tipo 5L, 1,5L, 1.5 L
  const match = candidate.match(/(\d+(?:[\.,]\d+)?)\s*L/i);
  if (match?.[1]) {
    const value = match[1].replace('.', ',');
    return `${value}L`;
  }

  // Fallback: normalizar L mayúscula y espacios
  return candidate.replace(/\s+/g, '').replace(/l/gi, 'L');
};

const parseFormats = (formatsField) => {
  if (!formatsField) return [];
  const rawList = Array.isArray(formatsField)
    ? formatsField
    : String(formatsField).split(/;|,/g);

  const normalized = rawList
    .map((item) => normalizeFormatToken(item))
    .filter(Boolean);

  // Unificar duplicados
  return Array.from(new Set(normalized));
};

const getMainImage = (product) => {
  if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
  if (typeof product.images === 'string') return product.images;
  if (typeof product.image === 'string') return product.image;
  return null;
};

async function updateFormats() {
  console.log('🔄 Actualizando formatos desde src/lib/products.js...');

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    try {
      const formats = parseFormats(product.formats);
      if (formats.length === 0) {
        skipped++;
        continue;
      }

      const mainImage = getMainImage(product);
      const formatsPayload = formats.map((name) => ({
        name,
        image: mainImage || null
      }));

      if (commit) {
        await db.collection('products').doc(String(product.id)).update({
          formats: formatsPayload
        });
      }

      updated++;
    } catch (error) {
      console.error(`❌ Error en producto ${product?.id}:`, error.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Actualizados: ${updated}`);
  console.log(`⏭️  Saltados (sin formatos): ${skipped}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(commit ? '✓ CAMBIOS GUARDADOS' : '⚠️ MODO SIMULACIÓN (usa --commit para guardar)');
  console.log('='.repeat(60) + '\n');
}

updateFormats().then(() => process.exit(0));
