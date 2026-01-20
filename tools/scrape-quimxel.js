
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.quimxel.es';
const OUTPUT_FILE = path.join(__dirname, 'quimxel_scraped_data.json');

// Mapeo de categorías de la web a tus IDs
const CATEGORY_MAP = {
    'limpieza-general': 'limpieza-general',
    'lavanderia-profesional': 'lavanderia-profesional',
    'industria-alimentaria': 'industria-alimentaria',
    'automocion': 'automocion',
    'sanitaria': 'sanitaria',
    'industria-y-construccion': 'industria-construccion',
    'tratamiento-de-piscinas': 'piscinas',
    'sistemas-concentrados': 'sistemas-concentrados',
    'productos-certificados': 'productos-certificados'
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeProducts() {
    console.log("🕷️ Iniciando scraping de Quimxel.es...");
    const allProducts = [];

    try {
        // 1. Obtener página principal de productos
        const { data: homeHtml } = await axios.get(`${BASE_URL}/productos/`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const $ = cheerio.load(homeHtml);

        // 2. Extraer enlaces de categorías
        const categoryLinks = [];
        // Ajustar selector según estructura de la web (inspección visual simulada)
        // Buscamos enlaces que parezcan categorías dentro del menú o grid de productos
        $('a').each((_, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('/categoria-producto/')) {
                // Evitar duplicados
                if (!categoryLinks.includes(href)) categoryLinks.push(href);
            }
        });

        console.log(`📂 Categorías encontradas: ${categoryLinks.length}`);

        // 3. Recorrer categorías
        for (const catLink of categoryLinks) {
            const catSlug = catLink.split('/').filter(Boolean).pop(); // "limpieza-general"
            const mappedCategory = CATEGORY_MAP[catSlug] || 'sin-categoria';
            
            console.log(`   ➡️ Scrapeando categoría: ${catSlug} -> ${mappedCategory}`);
            
            let pageUrl = catLink.startsWith('http') ? catLink : `${BASE_URL}${catLink}`;
            
            // Paginación (simple loop)
            while (pageUrl) {
                try {
                    const { data: catHtml } = await axios.get(pageUrl, {
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });
                    const $c = cheerio.load(catHtml);

                    // Seleccionar productos en la lista
                    // WooCommerce suele usar .product, .type-product
                    const productCards = $('.product'); 

                    if (productCards.length === 0) {
                        console.log("      ⚠️ No se encontraron productos en esta página.");
                        break;
                    }

                    for (const el of productCards) {
                        const $el = $(el);
                        
                        // Datos básicos desde la grid
                        const title = $el.find('.woocommerce-loop-product__title').text().trim();
                        const link = $el.find('a.woocommerce-LoopProduct-link').attr('href');
                        const imgUrl = $el.find('img').attr('src'); // Suele ser miniatura

                        if (!title || !link) continue;

                        // Entrar al detalle para sacar descripción y formatos
                        // (Opcional: Si es muy lento, podríamos saltarlo, pero lo pediste)
                        console.log(`      🔍 Scrapeando producto: ${title}`);
                        
                        try {
                            const { data: prodHtml } = await axios.get(link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                            const $p = cheerio.load(prodHtml);

                            // Extraer descripción larga
                            const description = $p('.woocommerce-product-details__short-description').text().trim() || 
                                              $p('#tab-description').text().trim();

                            // Extraer formatos (Variaciones)
                            // A veces están en una tabla, un select, o texto plano.
                            // Quimxel suele ponerlo en texto tipo "Formatos: 5L, 10L" o en atributos
                            let formats = [];
                            
                            // Intento 1: Tabla de atributos
                            $p('.woocommerce-product-attributes-item--attribute_pa_formato .woocommerce-product-attributes-item__value p').each((_, f) => {
                                formats.push($(f).text().trim());
                            });
                            
                            // Intento 2: Select de variaciones
                            if (formats.length === 0) {
                                $p('select[id^="pa_"] option').each((_, op) => {
                                    if ($(op).val()) formats.push($(op).text().trim());
                                });
                            }

                            // Imagen Grande
                            const fullImg = $p('.woocommerce-product-gallery__image a').attr('href') || imgUrl;

                            allProducts.push({
                                name: title,
                                category: mappedCategory,
                                subcategory: catSlug, // Guardamos la slug original como subcat temporal
                                description: description,
                                image: fullImg,
                                formats: formats,
                                url: link
                            });

                            await sleep(500); // Respetar servidor

                        } catch (err) {
                            console.error(`      ❌ Error scrapeando detalle de ${title}: ${err.message}`);
                        }
                    }

                    // Buscar siguiente página
                    const nextLink = $c('.woocommerce-pagination .next').attr('href');
                    pageUrl = nextLink ? (nextLink.startsWith('http') ? nextLink : `${BASE_URL}${nextLink}`) : null;
                    if(pageUrl) console.log("      ➡️ Siguiente página...");

                } catch (error) {
                    console.error(`   ❌ Error en categoría ${catLink}: ${error.message}`);
                    break;
                }
            }
        }

        // Guardar resultados
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
        console.log(`✅ Scraping finalizado. ${allProducts.length} productos guardados en ${OUTPUT_FILE}`);

    } catch (error) {
        console.error("❌ Error general:", error);
    }
}

scrapeProducts();
