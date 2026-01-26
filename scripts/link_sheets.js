
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const dataFile = path.join(projectRoot, 'src', 'lib', 'products.js');
const safetySheetsDir = path.join(publicDir, 'fichas-seguridad');
const techSheetsDir = path.join(publicDir, 'fichas-tecnicas');

// Function to normalize names for comparison
const normalizeName = (name) => {
    if (!name) return '';
    // This creates a "signature" of the name by making it uppercase and removing everything but letters and numbers.
    // e.g., "W.C. 31 S.F." becomes "WC31SF"
    return name
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, ''); 
};

// Function to find a matching sheet
const findSheet = (productName, sheetFiles, sheetDirName) => {
    const normalizedProductName = normalizeName(productName);
    if (!normalizedProductName) {
        return null;
    }
    const sheetFile = sheetFiles.find(file => {
        // Normalize the PDF filename in the same way as the product name for comparison
        const baseName = path.basename(file, '.pdf').replace(/\s(FS|FT)\sES.*$|\(1\)/ig, '');
        const normalizedSheetName = normalizeName(baseName);
        return normalizedSheetName === normalizedProductName;
    });
    
    // ** THE FIX IS HERE: use sheetFile, which is the result of the .find(), instead of a non-existent 'file' variable **
    return sheetFile ? `/${sheetDirName}/${path.basename(sheetFile)}` : null;
};


try {
    // Read all filenames from the directories
    const safetySheetFiles = fs.readdirSync(safetySheetsDir);
    const techSheetFiles = fs.readdirSync(techSheetsDir);

    // Read product data file
    const dataContent = fs.readFileSync(dataFile, 'utf8');
    
    // Use regex to find the products array and extract it as a string
    const productsRegex = /const\s+products\s*=\s*(\[[\s\S]*?\]);/;
    const match = dataContent.match(productsRegex);

    if (!match) {
        throw new Error('Could not find the products array in the data file.');
    }

    const productsArrayString = match[1];
    
    // Convert the array string into a live JavaScript object
    let products = new Function(`return ${productsArrayString}`)();

    let notFoundTechnical = [];
    let notFoundSafety = [];

    // Map over each product to add the new URLs
    const updatedProducts = products.map(product => {
        const safetySheetUrl = findSheet(product.name, safetySheetFiles, 'fichas-seguridad');
        const technicalSheetUrl = findSheet(product.name, techSheetFiles, 'fichas-tecnicas');
        
        if (product.name && !technicalSheetUrl) {
            notFoundTechnical.push(product.name);
        }
        if (product.name && !safetySheetUrl) {
            notFoundSafety.push(product.name);
        }

        return {
            ...product,
            technicalSheetUrl,
            safetySheetUrl,
        };
    });

    // Convert the updated products object back to a formatted string
    const updatedProductsString = JSON.stringify(updatedProducts, null, 2);

    // Replace the old products array in the original file content with the new one
    const updatedContent = dataContent.replace(productsRegex, `const products = ${updatedProductsString};`);

    // Write the fully updated content back to the products.js file
    fs.writeFileSync(dataFile, updatedContent, 'utf8');

    console.log('Product data updated successfully with sheet URLs.');
    
    if (notFoundTechnical.length > 0) {
        console.log(`\nNOTE: Technical sheets could not be found for ${notFoundTechnical.length} products:`);
        console.log(notFoundTechnical.join(', '));
    }
    if (notFoundSafety.length > 0) {
        console.log(`\nNOTE: Safety sheets could not be found for ${notFoundSafety.length} products:`);
        console.log(notFoundSafety.join(', '));
    }

} catch (error) {
    console.error('An error occurred during the script execution:', error);
}
