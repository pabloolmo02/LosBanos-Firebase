
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_JS_PATH = path.join(__dirname, '../src/lib/products.js');
const DESC_JS_PATH = path.join(__dirname, '../public/products_long_description.js');

// --- HELPERS ---

function parseJsFile(content) {
    // Intenta extraer array eliminando comentarios y exportaciones
    // Asumimos que el archivo empieza con comentarios y luego tiene un array [ ... ]
    let cleanContent = content.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, ''); // Quitar comentarios
    cleanContent = cleanContent.replace(/export const.*?=/, ''); // Quitar exports
    cleanContent = cleanContent.replace(/const.*?=/, ''); // Quitar consts
    cleanContent = cleanContent.trim();
    
    // Si termina con punto y coma, quitarlo
    if (cleanContent.endsWith(';')) cleanContent = cleanContent.slice(0, -1);

    try {
        return new Function(`return ${cleanContent}`)();
    } catch (e) {
        // Fallback: Intentar encontrar el primer [ y el último ]
        const start = content.indexOf('[');
        const end = content.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
             const arrayStr = content.substring(start, end + 1);
             try {
                return new Function(`return ${arrayStr}`)();
             } catch (err) {
                 console.error("Error parsing JS array fallback:", err.message);
             }
        }
        console.error("Error parsing JS file:", e.message);
        return null;
    }
}

function cleanFormat(fmt) {
    if (!fmt) return null;
    let clean = fmt.trim();
    
    // Caso: "4x5L" -> "5L", "12x750ml" -> "750ml"
    // Regex: Numero + 'x' + (Resto del formato)
    const packRegex = /^\d+\s*x\s*(.*)$/i;
    const match = clean.match(packRegex);
    if (match) {
        clean = match[1]; // Nos quedamos con la parte derecha (5L)
    }
    
    // Normalizar mayúsculas
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

// --- MAIN ---

async function main() {
    console.log("🚀 Iniciando actualización MASIVA de información de productos...");

    const productsContent = fs.readFileSync(PRODUCTS_JS_PATH, 'utf8');
    const descContent = fs.readFileSync(DESC_JS_PATH, 'utf8');

    const allProducts = parseJsFile(productsContent);
    
    // El archivo de descripciones puede tener multiples arrays o ser uno grande.
    // Según tu estructura, parece un array gigante con comentarios intercalados.
    // Mi parser regex debería limpiarlo y dejar un solo array válido.
    const updatesList = parseJsFile(descContent);

    if (!allProducts || !updatesList) {
        console.error("❌ Error leyendo archivos. Revisa la sintaxis de products_long_description.js");
        return;
    }

    console.log(`📚 Productos en base de datos: ${allProducts.length}`);
    console.log(`📝 Actualizaciones encontradas: ${updatesList.length}`);

    const updatesMap = new Map(updatesList.map(p => [p.reference, p]));
    let updatedCount = 0;

    const finalProducts = allProducts.map(p => {
        if (updatesMap.has(p.reference)) {
            const update = updatesMap.get(p.reference);
            
            // 1. Actualizar campos directos
            p.long_description = update.long_description || p.long_description;
            p.ph = update.ph || p.ph;
            p.description = update.description || p.description; // Corta actualizada
            
            // 2. Procesar Formatos
            if (update.formats) {
                // Separar por ; y limpiar
                const rawFormats = update.formats.split(';');
                const cleanFormats = rawFormats
                    .map(f => cleanFormat(f))
                    .filter(f => f && f !== 'SISTEMA'); // Filtrar "Sistema" si no es relevante como envase
                
                // Si hay formatos válidos, actualizamos variantes
                if (cleanFormats.length > 0) {
                    // Mantenemos el precio base para todas las variantes (a falta de info más precisa)
                    // o intentamos preservar precios si ya existían variantes con ese nombre
                    
                    const newVariants = cleanFormats.map((fmt, idx) => {
                        // Buscar si ya existía una variante con este formato para mantener su precio calculado del Excel
                        const existingVariant = p.variants?.find(v => v.format === fmt);
                        
                        return {
                            id: existingVariant ? existingVariant.id : `${p.id}_v${idx}`,
                            format: fmt,
                            price: existingVariant ? existingVariant.price : p.price, // Precio base si es nuevo
                            originalName: p.name
                        };
                    });
                    
                    p.variants = newVariants;
                }
            }
            updatedCount++;
        }
        return p;
    });

    fs.writeFileSync(PRODUCTS_JS_PATH, formatProductsFile(finalProducts), 'utf8');
    console.log(`✅ Actualización finalizada. ${updatedCount} productos actualizados.`);
}

main();
