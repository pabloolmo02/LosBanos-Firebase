
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURACIÓN ---
const ORIGINAL_PRODUCTS_PATH = path.join(__dirname, '../public/products.js'); // Tu backup limpio
const CSV_PATH = path.join(__dirname, '../public/-Tarifa Quimxel 2025 ED 25-1-.xlsx - HOSTELERIA.csv');
const TARGET_PATH = path.join(__dirname, '../src/lib/products.js');

// --- HELPERS ---

// Parsea el archivo JS original (es un módulo JS, así que lo leemos como texto y extraemos el JSON)
const loadOriginalProducts = () => {
    const content = fs.readFileSync(ORIGINAL_PRODUCTS_PATH, 'utf8');
    // Buscamos el array dentro del texto
    const match = content.match(/const products = (\[[\s\S]*?\]);/);
    if (match) {
        // Evaluamos el string para obtener el objeto real (es seguro en este contexto local)
        return eval(match[1]);
    }
    throw new Error("No se pudo parsear public/products.js");
};

const normalizeName = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const getSearchTokens = (name) => {
    if (!name) return [];
    let clean = name.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    clean = clean.replace(/[^A-Z0-9]/g, ' '); 
    const noiseWords = [
        'LTS', 'LT', 'LITROS', 'LITRO', 'KGS', 'KG', 'KILOS', 'KILO', 
        'GRS', 'GR', 'GRAMOS', 'ML', 'CC', 'CL', 'UDS', 'UD', 'UNIDADES', 'UNIDAD',
        'GARRAFA', 'BOTE', 'CAJA', 'CJA', 'BIDON', 'SPRAY', 'AEROSOL', 'AMPOLLA',
        'DE', 'EN', 'CON', 'SIN', 'PARA', 'EL', 'LA', 'LAS', 'LOS'
    ];
    return clean.split(/\s+/).filter(t => t.length > 1 && !noiseWords.includes(t));
};

const extractFormatInfo = (name) => {
    const regex = /(\d+(?:[\.,]\d+)?)\s*(LTS|L|ML|KGS|KG|GR|G|UDS|UD|C\/|C\.)\.?/i;
    const match = name.match(regex);
    if (match) {
        let valueStr = match[1].replace(',', '.');
        if (valueStr.startsWith('.')) valueStr = '0' + valueStr;
        let value = parseFloat(valueStr);
        let unit = match[2].toUpperCase();
        
        let displayUnit = unit;
        if (['LTS', 'L'].includes(unit)) displayUnit = 'L';
        if (['KGS', 'KG'].includes(unit)) displayUnit = 'KG';
        if (['UDS', 'UD'].includes(unit)) displayUnit = 'UD';
        
        let calculationFactor = value;
        if (unit === 'ML') calculationFactor = value / 1000;
        if (unit === 'GR' || unit === 'G') calculationFactor = value / 1000;
        
        return { display: `${value} ${displayUnit}`, value, calculationFactor, rawUnit: unit };
    }
    return { display: "Estándar", value: 1, calculationFactor: 1, rawUnit: 'UD' };
};

const parseCSVLine = (text) => {
    const result = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { result.push(cell.trim()); cell = ''; }
        else { cell += char; }
    }
    result.push(cell.trim());
    return result;
};


// --- MAIN ---

async function restoreAndUpdate() {
    console.log("🚀 Restaurando catálogo original y buscando variantes en Excel...");

    // 1. Cargar productos originales
    const originalProducts = loadOriginalProducts();
    console.log(`📚 Productos originales cargados: ${originalProducts.length}`);

    // Preparamos los productos originales con sus tokens para buscar
    const productsMap = new Map();
    originalProducts.forEach(p => {
        // Mantenemos TODO lo original, borramos variantes viejas si las hubiera
        const { variants, ...cleanP } = p;
        
        // CORRECCIÓN SOLICITADA: Renombrar categoría visualmente
        // Aunque mantenemos el ID 'limpieza-general' para compatibilidad interna o lo cambiamos?
        // El usuario dijo "limpieza generall quiero que se llame HORECA". 
        // Cambiaremos el 'sector' (nombre visual) o la 'category' (id).
        // Para no romper rutas (?cat=limpieza-general), mantendré el ID pero cambiaré el texto visual si es necesario.
        // O mejor, dejémoslo como está en el archivo original y cambiamos el frontend.
        
        productsMap.set(p.id, {
            ...cleanP,
            variants: [], // Empezamos vacíos
            searchTokens: getSearchTokens(p.name)
        });
    });

    // 2. Leer Excel para enriquecer (NO para añadir nuevos)
    if (!fs.existsSync(CSV_PATH)) {
        console.error("❌ No encuentro el CSV.");
        return;
    }
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const rows = csvContent.split('\n');

    let matchedCount = 0;

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;
        const columns = parseCSVLine(row);
        
        // Buscar precio y nombre
        let rawPrice = 0;
        let priceUnit = 'Ud';
        let hasPrice = false;
        
        for (let j = columns.length - 1; j >= 0; j--) {
            const col = columns[j];
            if (col.includes('€')) {
                let cleanPrice = col.replace('€', '').trim().replace(/\./g, '').replace(',', '.');
                rawPrice = parseFloat(cleanPrice);
                hasPrice = true;
                if (j + 1 < columns.length) priceUnit = columns[j + 1].replace(/"/g, '').trim();
                break;
            }
        }
        
        const excelName = columns[1] ? columns[1].trim() : '';
        if (!excelName || !hasPrice || isNaN(rawPrice)) continue;

        // Calcular Precio
        const formatInfo = extractFormatInfo(excelName);
        let finalPrice = rawPrice;
        const multiplier = 2; // Margen

        if (priceUnit.toUpperCase() === 'L' || priceUnit.toUpperCase() === 'KG') {
            finalPrice = (rawPrice * formatInfo.calculationFactor) * multiplier;
        } else {
            finalPrice = rawPrice * multiplier;
        }

        // --- BUSCAR EN ORIGINALES ---
        const excelTokens = getSearchTokens(excelName);
        let bestMatchId = null;
        let maxScore = 0;

        for (const [id, product] of productsMap.entries()) {
            const webTokens = product.searchTokens;
            // Solo considerar si el producto tiene tokens (evitar vacíos)
            if (webTokens.length === 0) continue;

            const matches = webTokens.filter(wt => excelTokens.includes(wt));
            
            let score = 0;
            if (matches.length === webTokens.length) {
                // Coincidencia TOTAL de las palabras clave del producto original
                score = 100;
                // Penalizar si el Excel tiene muchas palabras extra (ej. "BRIXOL MARINO" vs "BRIXOL MARINO SUPER CONCENTRADO EXTRA")
                const diff = excelTokens.length - webTokens.length;
                if (diff > 0) score -= diff * 5;
            } else {
                 const matchPercentage = matches.length / webTokens.length;
                 if (matchPercentage >= 0.8) score = 60 + (matchPercentage * 20);
            }

            if (score > maxScore && score > 65) {
                maxScore = score;
                bestMatchId = id;
            }
        }

        if (bestMatchId) {
            const product = productsMap.get(bestMatchId);
            // Evitar duplicados exactos
            if (!product.variants.some(v => v.originalName === excelName)) {
                product.variants.push({
                    id: normalizeName(excelName) + '_' + Math.floor(Math.random()*10000),
                    format: formatInfo.display,
                    price: finalPrice,
                    originalName: excelName
                });
                matchedCount++;
            }
        }
    }

    // 3. Finalizar y Limpiar
    const finalProducts = [];
    productsMap.forEach(p => {
        delete p.searchTokens;
        
        // Si encontramos variantes en el Excel, las usamos
        if (p.variants.length > 0) {
            p.variants.sort((a, b) => a.price - b.price);
            p.price = p.variants[0].price; // Precio desde
        } else {
            // Si NO encontramos variantes, mantenemos el producto pero le ponemos una variante default con su precio original x2 (si no estaba actualizado ya)
            // Ojo: en products.js original el precio ya era numérico.
            // Asumiremos que el precio original era "base".
            p.variants = [{
                id: p.id + '_base',
                format: 'Estándar',
                price: p.price // Mantenemos el precio que tenías definido manualmente si no hay match en Excel
            }];
        }
        
        finalProducts.push(p);
    });

    // 4. Guardar
    const fileContent = `
const products = ${JSON.stringify(finalProducts, null, 2)};

export const getProducts = () => {
  return products;
};

export const getProductById = (id) => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category) => {
  if (category === 'all') return products;
  return products.filter(p => p.category === category);
};
`;

    fs.writeFileSync(TARGET_PATH, fileContent, 'utf8');
    console.log(`✅ Restaurado y actualizado: ${finalProducts.length} productos (Originales).`);
    console.log(`   Variantes encontradas en Excel: ${matchedCount}`);
}

restoreAndUpdate();
