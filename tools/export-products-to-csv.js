
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getProducts } from '../src/lib/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, 'catalogo_quimxel.csv');

function escapeCsv(value) {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // Si contiene comillas, comas o saltos de línea, hay que entrecomillarlo y escapar las comillas
    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

async function main() {
    console.log("🚀 Exportando productos a CSV...");
    
    const products = getProducts();
    
    // Encabezados
    const headers = [
        'ID', 'Name', 'Reference', 'Category', 'Price', 
        'Description', 'Sector', 'Usage', 
        'Technical Sheet', 'Safety Sheet', 'Image 1'
    ];

    const rows = products.map(p => {
        return [
            p.id,
            p.name,
            p.reference,
            p.category,
            p.price,
            p.description,
            p.sector,
            p.usage,
            p.technicalSheetUrl || '',
            p.safetySheetUrl || '',
            (p.images && p.images.length > 0) ? p.images[0] : ''
        ].map(escapeCsv).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    fs.writeFileSync(OUTPUT_FILE, csvContent, 'utf8');
    console.log(`✅ Archivo creado exitosamente: ${OUTPUT_FILE}`);
}

main();
