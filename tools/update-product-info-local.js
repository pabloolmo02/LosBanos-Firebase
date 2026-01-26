
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_JS_PATH = path.join(__dirname, '../src/lib/products.js');
const DESC_JS_PATH = path.join(__dirname, '../public/products_long_description.js');

function parseMainProducts(content) {
    const match = content.match(/const products = ([\s\S]*?);/);
    if (!match) return null;
    try {
        return new Function(`return ${match[1]}`)();
    } catch (e) {
        console.error("Main products parse error:", e);
        return null;
    }
}

// Nueva función para parsear múltiples arrays en el archivo
function parseAllArraysInFile(content) {
    const allItems = [];
    
    // Regex para capturar bloques de arrays [ ... ]
    // Buscamos patrones que empiecen por [ y terminen en ]
    // Dado que pueden estar anidados, es complejo, pero el formato parece simple (arrays de objetos).
    // Usaremos un enfoque iterativo buscando corchetes de nivel superior.
    
    let depth = 0;
    let start = -1;
    
    for (let i = 0; i < content.length; i++) {
        if (content[i] === '[') {
            if (depth === 0) start = i;
            depth++;
        } else if (content[i] === ']') {
            depth--;
            if (depth === 0 && start !== -1) {
                const arrayStr = content.substring(start, i + 1);
                try {
                    const parsed = new Function(`return ${arrayStr}`)();
                    if (Array.isArray(parsed)) {
                        console.log(`   - Bloque detectado con ${parsed.length} items.`);
                        allItems.push(...parsed);
                    }
                } catch (e) {
                    console.warn("   - Bloque ignorado (error de sintaxis):", e.message);
                }
                start = -1;
            }
        }
    }
    
    return allItems;
}

function cleanFormat(fmt) {
    if (!fmt) return 'Estándar';
    let clean = fmt.trim();
    // "4x5L" -> "5L"
    const boxMatch = clean.match(/^\d+\s*[xX]\s*(.+)/);
    if (boxMatch) {
        clean = boxMatch[1].trim();
    }
    // "5Lx4" -> "5L" (si está al final)
    const boxMatchSuffix = clean.match(/^(.+?)\s*[xX]\s*\d+$/);
    if (boxMatchSuffix) {
        clean = boxMatchSuffix[1].trim();
    }
    return clean.toUpperCase();
}

function formatProductsFile(products) {
    const productsString = JSON.stringify(products, null, 2);
    return `const products = ${productsString};

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
}

async function main() {
    console.log("🚀 Iniciando actualización LOCAL (v4 - Multi-bloque)...");

    if (!fs.existsSync(PRODUCTS_JS_PATH) || !fs.existsSync(DESC_JS_PATH)) {
        console.error("❌ No se encuentran los archivos necesarios.");
        return;
    }

    const currentContent = fs.readFileSync(PRODUCTS_JS_PATH, 'utf8');
    const newInfoContent = fs.readFileSync(DESC_JS_PATH, 'utf8');

    const currentProducts = parseMainProducts(currentContent);
    
    console.log("📂 Leyendo archivo de descripciones...");
    const newInfoList = parseAllArraysInFile(newInfoContent);

    if (!currentProducts || newInfoList.length === 0) {
        console.error("❌ Fallo al parsear los archivos o no se encontró información nueva.");
        return;
    }

    console.log(`📚 Productos actuales en BD: ${currentProducts.length}`);
    console.log(`📝 Info nueva consolidada: ${newInfoList.length} items`);

    const infoMap = new Map();
    newInfoList.forEach(p => {
        if (p.reference) infoMap.set(p.reference, p);
    });

    let updatedCount = 0;

    const finalProducts = currentProducts.map(prod => {
        const update = infoMap.get(prod.reference);
        
        if (update) {
            // Actualizar campos
            if (update.long_description) prod.long_description = update.long_description;
            if (update.ph) prod.ph = update.ph;
            if (update.usage) prod.usage = update.usage;
            if (update.description) prod.description = update.description;
            if (update.certifications) prod.certifications = update.certifications;
            if (update.sector) prod.sector = update.sector;

            // Actualizar Formatos
            if (update.formats) {
                // Separar formatos por ';' y limpiar espacios
                const rawFormats = update.formats.split(';').map(s => s.trim()).filter(Boolean);
                
                const newVariants = rawFormats.map((rawFmt, idx) => {
                    const cleanFmt = cleanFormat(rawFmt);
                    
                    // Preservar precio base por defecto
                    let preservedPrice = prod.price; 
                    let originalName = prod.name;

                    // Si ya había variantes, intentar preservar precio de una equivalente
                    if (prod.variants && prod.variants.length > 0) {
                        const match = prod.variants.find(v => 
                            v.format && cleanFmt && 
                            v.format.replace(/\s/g,'').toUpperCase().includes(cleanFmt.replace(/\s/g,'').toUpperCase())
                        );
                        if (match) {
                            preservedPrice = match.price;
                            originalName = match.originalName || prod.name;
                        }
                    }

                    return {
                        id: `${prod.id}_fmt_${idx}`,
                        format: cleanFmt,
                        price: preservedPrice,
                        originalName: originalName
                    };
                });
                prod.variants = newVariants;
                // Ajustar precio base al mínimo de las variantes
                if (newVariants.length > 0) {
                    const minPrice = Math.min(...newVariants.map(v => v.price));
                    prod.price = minPrice;
                }
            }
            updatedCount++;
        }
        return prod;
    });

    fs.writeFileSync(PRODUCTS_JS_PATH, formatProductsFile(finalProducts), 'utf8');
    console.log(`✅ ${updatedCount} productos actualizados correctamente.`);
}

main();
