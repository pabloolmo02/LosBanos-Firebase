
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getProducts } from '../src/lib/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_JS_PATH = path.join(__dirname, '../src/lib/products.js');

const UPDATES = {
    // Gama ED (2 Litros) - Formato fijo 2 L
    'SC-ED-009': { price: 5.752 * 2, format: '2 L' }, // AMPHOS
    'SC-ED-012': { price: 25.433 * 2, format: '2 L' }, // CT AMBIENT
    'SC-ED-010': { price: 5.130 * 2, format: '2 L' }, // DENGRAS FOOD
    'SC-ED-011': { price: 4.789 * 2, format: '2 L' }, // FRESC

    // Gama Capxel (Cápsulas) - Formato 50ml (o mantener el que tenga si es correcto)
    'SC-CX-004': { price: 0.74 * 2, format: '50 ML' }, // CT DENG C
    'SC-CX-008': { price: 0.646 * 2, format: '50 ML' }, // AMPHOS (Capxel)
    'SC-CX-009': { price: 0.606 * 2, format: '50 ML' }, // FRESC (Capxel)
    'SC-CX-010': { price: 0.619 * 2, format: '50 ML' }, // DENGRAS FOOD (Capxel)
    'SC-CX-011': { price: 1.214 * 2, format: '50 ML' }, // CT AMBIENT (Capxel)
};

async function updateConcentrados() {
    console.log("🚀 Actualizando precios específicos de Concentrados...");

    const products = getProducts();
    let updatedCount = 0;

    const newProducts = products.map(p => {
        if (UPDATES[p.reference]) {
            const updateData = UPDATES[p.reference];
            
            // Actualizar precio base
            p.price = updateData.price;

            // Actualizar o crear variante única
            p.variants = [{
                id: p.id + '_v1',
                format: updateData.format,
                price: updateData.price,
                originalName: p.name
            }];
            
            console.log(`✅ ${p.name} (${p.reference}) -> ${p.price.toFixed(2)}€ / ${updateData.format}`);
            updatedCount++;
        }
        return p;
    });

    const fileContent = `
const products = ${JSON.stringify(newProducts, null, 2)};

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

    fs.writeFileSync(PRODUCTS_JS_PATH, fileContent, 'utf8');
    console.log(`\n✨ Proceso completado. ${updatedCount} productos actualizados.`);
}

updateConcentrados();
