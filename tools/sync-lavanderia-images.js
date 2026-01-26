
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to extract and parse the main products array
function getProducts(content) {
    const match = content.match(/const products = ([\s\S]*?);/);
    if (!match) return null;
    try {
        return new Function(`return ${match[1]}`)();
    } catch (e) {
        console.error("Error parsing products array:", e);
        return null;
    }
}

// Helper to format the products array back into a file content string
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

async function runImageSync() {
    console.log("🚀 Sincronizando imágenes para Lavandería Profesional...");

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const productsPath = path.join(__dirname, '../src/lib/products.js');
    const imagesDir = path.join(__dirname, '../public/images/lavanderia-profesional');
    const relativeImagePath = '/images/lavanderia-profesional';

    const productsFileContent = fs.readFileSync(productsPath, 'utf8');
    const allProducts = getProducts(productsFileContent);

    if (!allProducts) {
        console.error("❌ No se pudo cargar o parsear el archivo de productos. Abortando.");
        return;
    }

    // 1. Get the list of product IDs for the category in their current order
    const lavanderiaProductIds = allProducts
        .filter(p => p.category === 'lavanderia-profesional')
        .map(p => p.id);

    if (lavanderiaProductIds.length === 0) {
        console.error("❌ No se encontraron productos en la categoría 'lavanderia-profesional'.");
        return;
    }

    // 2. List image files in the directory
    let imageFiles = [];
    try {
        imageFiles = fs.readdirSync(imagesDir);
    } catch (error) {
        console.error(`❌ Error al leer el directorio de imágenes: ${imagesDir}. ¿Estás seguro de que existe?`);
        return;
    }

    console.log(`- Encontrados ${lavanderiaProductIds.length} productos de Lavandería.`);
    console.log(`- Encontradas ${imageFiles.length} imágenes en el directorio.`);

    let updatedCount = 0;
    
    // 3. Create a map of product ID to product object for efficient updates
    const productsMap = new Map(allProducts.map(p => [p.id, p]));

    // 4. Iterate through the ordered product IDs and assign images
    lavanderiaProductIds.forEach((productId, index) => {
        const productNumber = index + 1; // The user enumerated them starting from 1
        
        // Find the image file that starts with the corresponding number (e.g., '1.jpg', '01.png')
        const imageFile = imageFiles.find(file => {
            const fileNameWithoutExt = path.parse(file).name;
            return parseInt(fileNameWithoutExt, 10) === productNumber;
        });

        if (imageFile) {
            const product = productsMap.get(productId);
            if (product) {
                const newImagePath = `${relativeImagePath}/${imageFile}`;
                if (product.image !== newImagePath) {
                    product.image = newImagePath;
                    console.log(`  - Asignando '${imageFile}' al producto: ${product.name}`);
                    updatedCount++;
                }
            }
        } else {
            console.warn(`  - ⚠️ No se encontró imagen para el producto número ${productNumber} (${productsMap.get(productId)?.name}).`);
        }
    });

    // 5. Reconstruct the full product list and write back to the file
    const updatedProducts = Array.from(productsMap.values());
    const newFileContent = formatProductsFile(updatedProducts);
    fs.writeFileSync(productsPath, newFileContent, 'utf8');

    console.log(`\n✨ Sincronización completada. ${updatedCount} productos han sido actualizados con una nueva imagen.`);
}

runImageSync();
