
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Extracts the `const products = [...]` part from the main product file.
function extractProductsArrayString(content) {
    const match = content.match(/const products = ([\s\S]*?);/);
    return match ? match[1] : null;
}

// A safer way to parse a string that represents a JS array.
function parseJsArray(arrayString) {
    try {
        return new Function(`return ${arrayString}`)();
    } catch (e) {
        console.error("Error parsing JS array string:", e, "String was:", arrayString.substring(0, 500));
        return null;
    }
}

// Removes comments and parses the Lavanderia descriptions file.
function parseLavanderiaFile(content) {
    // Remove JS comments (// and /* */)
    const cleanedContent = content.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    // The file is just an array, so we can parse it directly after trimming.
    return parseJsArray(cleanedContent.trim());
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

async function runUpdate() {
    console.log("🚀 Iniciando actualización de detalles para Lavandería Profesional (v4)...");

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const mainProductsPath = path.join(__dirname, '../src/lib/products.js');
    const lavanderiaUpdatesPath = path.join(__dirname, '../public/products_long_description.js');

    const mainContent = fs.readFileSync(mainProductsPath, 'utf8');
    const lavanderiaContent = fs.readFileSync(lavanderiaUpdatesPath, 'utf8');

    const productsArrayString = extractProductsArrayString(mainContent);
    const allProducts = parseJsArray(productsArrayString);

    const lavanderiaUpdates = parseLavanderiaFile(lavanderiaContent);

    if (!allProducts || !lavanderiaUpdates || lavanderiaUpdates.length === 0) {
        console.error("❌ No se pudieron extraer o parsear los datos de los archivos. Abortando.");
        return;
    }

    const updatesMap = new Map(lavanderiaUpdates.map(p => [p.reference, p]));
    let updatedCount = 0;

    const updatedProducts = allProducts.map(product => {
        if (updatesMap.has(product.reference)) {
            const update = updatesMap.get(product.reference);
            console.log(`- Actualizando: ${product.name} (${product.reference})`);

            product.long_description = update.long_description || product.long_description || '';
            product.ph = update.ph || product.ph || '';
            product.usage = update.usage || product.usage || '';
            product.description = update.description || product.description;

            if (update.formats && typeof update.formats === 'string') {
                const formatStrings = update.formats.split(';').map(f => f.trim()).filter(f => f);
                product.variants = formatStrings.map((format, index) => ({
                    id: `${product.id}_v${index + 1}`,
                    format: format,
                    price: product.price,
                    originalName: product.name
                }));
            }
            updatedCount++;
        }
        return product;
    });

    const newFileContent = formatProductsFile(updatedProducts);
    fs.writeFileSync(mainProductsPath, newFileContent, 'utf8');

    console.log(`\n✨ Actualización completada. ${updatedCount} productos de Lavandería Profesional han sido actualizados.`);
}

runUpdate();
