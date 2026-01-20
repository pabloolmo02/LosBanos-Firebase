
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURACIÓN ---
const CSV_PATH = path.join(__dirname, '../public/-Tarifa Quimxel 2025 ED 25-1-.xlsx - HOSTELERIA.csv');
const PRODUCTS_JS_PATH = path.join(__dirname, '../src/lib/products.js');
const NEW_PRODUCTS_LOG_PATH = path.join(__dirname, 'nuevos_productos.txt');

// --- MAPEO DE CATEGORÍAS PRINCIPALES (Detectadas en Excel -> ID Web) ---
// Si el header contiene estas palabras, cambiamos la categoría global
const CATEGORY_TRIGGERS = {
    'HORECA': 'limpieza-general',
    'LAVANDERÍA': 'lavanderia-profesional',
    'INDUSTRIA ALIMENTARIA': 'industria-alimentaria',
    'AUTOMOCIÓN': 'automocion',
    'INDUSTRIA': 'industria-construccion',
    'CONSTRUCCIÓN': 'industria-construccion',
    'PISCINAS': 'piscinas',
    'SISTEMAS CONCENTRADOS': 'sistemas-concentrados'
};

// --- HELPERS ---

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
        'DE', 'EN', 'CON', 'SIN', 'PARA', 'EL', 'LA', 'LAS', 'LOS',
        'L.', 'KG.', 'ML.', 'G.'
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
    return { display: "Unidad", value: 1, calculationFactor: 1, rawUnit: 'UD' };
};

// Limpia el nombre de la subcategoría (quita números iniciales)
const cleanSubcategoryName = (str) => {
    // Quita números al inicio (ej "1010 SUELOS") -> "SUELOS"
    let clean = str.replace(/^\d+\s*/, '').trim();
    // Capitalize primera letra de cada palabra
    return clean.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

// --- SCRIPT PRINCIPAL ---

async function processPriceList() {
    console.log("🚀 Iniciando REVISIÓN COMPLETA (v8 - Subcategorías Limpias)...");

    if (!fs.existsSync(CSV_PATH)) {
        console.error("❌ ERROR: No se encuentra el archivo CSV.");
        return;
    }
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');

    // 1. Cargar productos originales
    const { getProducts: getOriginalProducts } = await import(`../src/lib/products.js?v=${Date.now()}`);
    let originalProducts = getOriginalProducts();

    const masterCatalog = new Map();
    originalProducts.forEach(p => {
        // Ignoramos los "NUEVO" previos
        if (String(p.id).startsWith('NEW_') || p.reference === 'NUEVO' || p.category === 'sin-categoria') return;
        
        const { variants, price, ...baseData } = p;
        masterCatalog.set(p.id, {
            ...baseData,
            variants: [],
            searchTokens: getSearchTokens(p.name)
        });
    });

    console.log(`📚 Catálogo base web: ${masterCatalog.size} productos.`);

    // 2. Procesar Excel con ESTADO (Contexto)
    const rows = csvContent.split('\n');
    let matchedCount = 0;
    const unmatchedItems = [];

    // Estado del parser
    let currentCategory = 'limpieza-general'; // Default start
    let currentSubcategory = 'General';

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const columns = parseCSVLine(row);
        const nameCol = columns[1] ? columns[1].trim() : '';

        // Buscar precio
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

        // --- DETECCIÓN DE CABECERAS (Categorías/Subcategorías) ---
        // Si tiene nombre pero NO tiene precio, es un título
        if (!hasPrice && nameCol && nameCol.length > 3) {
            const headerText = nameCol.toUpperCase();
            let isCategoryTrigger = false;

            // 1. ¿Cambio de Categoría Principal?
            for (const [key, val] of Object.entries(CATEGORY_TRIGGERS)) {
                if (headerText.includes(key)) {
                    currentCategory = val;
                    // Si es un cambio mayor, reseteamos subcategoría o usamos el mismo nombre si es descriptivo
                    // Pero generalmente HORECA inicia, luego vienen subcaps
                    currentSubcategory = cleanSubcategoryName(headerText); 
                    console.log(`📂 CAMBIO CATEGORÍA: ${currentCategory} (${headerText})`);
                    isCategoryTrigger = true;
                    break;
                }
            }

            // 2. Si no es trigger principal, es una Subcategoría (Usage)
            if (!isCategoryTrigger) {
                // Limpiamos el nombre (quitamos números "1010...")
                currentSubcategory = cleanSubcategoryName(headerText);
                // console.log(`   └─ Subcategoría: ${currentSubcategory}`);
            }
            continue; // Saltamos a la siguiente fila
        }

        // --- PROCESAMIENTO DE PRODUCTO ---
        if (!nameCol || !hasPrice || isNaN(rawPrice)) continue;

        // Cálculo Precio
        const formatInfo = extractFormatInfo(nameCol);
        let finalPrice = rawPrice;
        const priceMultiplier = 2;

        if (priceUnit.toUpperCase() === 'L' || priceUnit.toUpperCase() === 'KG') {
            finalPrice = (rawPrice * formatInfo.calculationFactor) * priceMultiplier;
        } else {
            finalPrice = rawPrice * priceMultiplier;
        }

        // Emparejamiento
        const excelTokens = getSearchTokens(nameCol);
        let bestMatchId = null;
        let maxScore = 0;

        for (const [id, product] of masterCatalog.entries()) {
            const webTokens = product.searchTokens;
            const matches = webTokens.filter(wt => excelTokens.includes(wt));
            
            let score = 0;
            if (matches.length === webTokens.length && webTokens.length > 0) {
                score = 100;
                const diff = excelTokens.length - webTokens.length;
                if (diff > 0) score -= diff * 2; 
            } else if (webTokens.length > 0) {
                 const matchPercentage = matches.length / webTokens.length;
                 if (matchPercentage >= 0.8) score = 60 + (matchPercentage * 20);
            }

            if (score > maxScore && score > 70) {
                maxScore = score;
                bestMatchId = id;
            }
        }

        const variantData = {
            id: normalizeName(nameCol) + '_' + Math.floor(Math.random()*100000),
            format: formatInfo.display,
            price: finalPrice,
            originalName: nameCol,
            detectedCategory: currentCategory,
            detectedUsage: currentSubcategory
        };

        if (bestMatchId) {
            const product = masterCatalog.get(bestMatchId);
            if (!product.variants.some(v => v.originalName === nameCol)) {
                product.variants.push(variantData);
                // Opcional: Actualizar usage del producto existente si estaba vacío o genérico?
                // Mejor NO tocar descripciones existentes como pidió el usuario.
            }
            matchedCount++;
        } else {
            unmatchedItems.push(variantData);
        }
    }

    // 3. Nuevos productos
    const newProductsMap = new Map();
    unmatchedItems.forEach(item => {
        const tokens = getSearchTokens(item.originalName);
        if (tokens.length === 0) return;
        
        const groupKey = tokens.slice(0, 2).join(' '); 
        const groupId = 'NEW_' + normalizeName(groupKey);
        
        if (!newProductsMap.has(groupId)) {
            let baseNameClean = item.originalName.replace(/(\d+[\.,]?\d*\s*(LTS|L|ML|KG|GR|UD|C\/|C\.)).*$/i, '').trim();
            baseNameClean = baseNameClean.replace(/^\d+\s*,?\s*/, ''); 
            if(baseNameClean.endsWith(',')) baseNameClean = baseNameClean.slice(0,-1);

            newProductsMap.set(groupId, {
                id: groupId,
                name: baseNameClean || item.originalName,
                reference: "NUEVO",
                category: item.detectedCategory,
                price: 0,
                // Conservamos descripción genérica para nuevos
                description: `Producto de la familia ${item.detectedUsage}.`, 
                certifications: [],
                usage: item.detectedUsage, // Aquí asignamos la subcategoría limpia
                sector: item.detectedCategory === 'limpieza-general' ? 'Limpieza General' : 'Profesional',
                variants: [],
                technicalSheetUrl: null,
                safetySheetUrl: null,
                images: []
            });
        }
        newProductsMap.get(groupId).variants.push(item);
    });

    // 4. Finalizar
    const finalProductList = [];

    // Existentes
    masterCatalog.forEach(p => {
        delete p.searchTokens;
        if (p.variants.length > 0) {
            p.variants.sort((a, b) => a.price - b.price);
            p.price = p.variants[0].price;
            p.hasVariants = true;
        } else {
            p.variants = [{
                id: p.id + '_base',
                format: 'Envase', 
                price: p.price
            }];
            p.hasVariants = false;
        }
        finalProductList.push(p);
    });

    // Nuevos
    newProductsMap.forEach(p => {
        p.variants.sort((a, b) => a.price - b.price);
        p.price = p.variants[0].price;
        p.hasVariants = true;
        finalProductList.push(p);
    });

    // 5. Guardar
    const fileContent = `
const products = ${JSON.stringify(finalProductList, null, 2)};

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
    
    const logContent = `INFORME v8\nTotal: ${finalProductList.length}\nNuevos: ${newProductsMap.size}`;
    fs.writeFileSync(NEW_PRODUCTS_LOG_PATH, logContent, 'utf8');

    console.log(`✅ Catálogo regenerado correctamente (Subcategorías Limpias).`);
}

processPriceList();
