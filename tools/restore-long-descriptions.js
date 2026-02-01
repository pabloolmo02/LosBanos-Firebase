
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_JS_PATH = path.join(__dirname, '../src/lib/products.js');
const LONG_DESC_PATH = path.join(__dirname, '../public/products_long_description.js');

console.log('🔄 Restaurando long_description, ph y formats a products.js...\n');

async function main() {
    // 1. Leer y parsear products.js
    const productsContent = fs.readFileSync(PRODUCTS_JS_PATH, 'utf8');
    const productsMatch = productsContent.match(/const products = (\[[\s\S]*?\]);/);
    if (!productsMatch) {
        console.error('❌ No se pudo extraer array de products.js');
        process.exit(1);
    }

    const products = JSON.parse(productsMatch[1]);
    console.log(`📦 Productos cargados: ${products.length}`);

    // 2. Leer y parsear products_long_description.js (tiene múltiples arrays)
    console.log('📝 Cargando descripciones largas...');
    
    const longDescContent = fs.readFileSync(LONG_DESC_PATH, 'utf8');
    
    // Dividir por comentarios que indican secciones (// Nombre de categoría)
    const sections = longDescContent.split(/\/\/[^\n]*\n/);
    
    let longDescProducts = [];
    for (const section of sections) {
        const trimmed = section.trim();
        if (!trimmed || trimmed.length < 50) continue; // Skip secciones vacías o muy pequeñas
        
        try {
            const parsed = new Function('return ' + trimmed)();
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
                longDescProducts = longDescProducts.concat(parsed);
            }
        } catch (e) {
            // Ignorar secciones que no se pueden parsear
        }
    }

console.log(`📝 Descripciones largas encontradas: ${longDescProducts.length}\n`);

// 3. Crear un mapa por ID para búsqueda rápida
const longDescMap = new Map();
longDescProducts.forEach(p => {
    longDescMap.set(p.id, p);
});

// 4. Actualizar productos con los campos adicionales
let updateCount = 0;

products.forEach(product => {
    const longDesc = longDescMap.get(product.id);
    
    if (longDesc) {
        if (longDesc.long_description) {
            product.long_description = longDesc.long_description;
        }
        if (longDesc.ph) {
            product.ph = longDesc.ph;
        }
        if (longDesc.formats) {
            product.formats = longDesc.formats;
        }
        updateCount++;
    }
});

console.log(`✅ Productos actualizados: ${updateCount}`);

// 5. Generar el nuevo archivo
const newContent = `const products = ${JSON.stringify(products, null, 2)};

export default products;

export const getProducts = () => products;

export const getProductById = (id) => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category) => {
  return products.filter(p => p.category === category);
};
`;

// 6. Escribir el archivo
fs.writeFileSync(PRODUCTS_JS_PATH, newContent, 'utf8');

console.log(`\n✨ Archivo actualizado exitosamente!`);
console.log(`📁 ${PRODUCTS_JS_PATH}`);

// 7. Mostrar ejemplos de productos actualizados
console.log(`\n📊 Ejemplo de producto actualizado:`);
const sampleProduct = products.find(p => longDescMap.has(p.id));
if (sampleProduct) {
    console.log(`   ID: ${sampleProduct.id}`);
    console.log(`   Nombre: ${sampleProduct.name}`);
    console.log(`   long_description: ${sampleProduct.long_description ? '✅' : '❌'}`);
    console.log(`   pH: ${sampleProduct.ph || 'N/A'}`);
    console.log(`   Formats: ${sampleProduct.formats || 'N/A'}`);
}
}

main();
