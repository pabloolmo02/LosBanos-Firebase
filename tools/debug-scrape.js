
import axios from 'axios';

async function debug() {
    try {
        const { data } = await axios.get('https://www.quimxel.es/productos/', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        // Buscar enlaces que contengan "producto" o similar
        const productLinks = data.match(/href="([^"]*\/producto\/[^"]*)"/g);
        const categoryLinks = data.match(/href="([^"]*\/categoria[^"]*)"/g);

        console.log(`Enlaces de producto encontrados: ${productLinks ? productLinks.length : 0}`);
        if (productLinks) console.log(productLinks.slice(0, 5));

        console.log(`Enlaces de categoría encontrados: ${categoryLinks ? categoryLinks.length : 0}`);
        if (categoryLinks) console.log(categoryLinks.slice(0, 5));
        
        // Ver si hay clases de Elementor
        if (data.includes('elementor')) console.log("Elementor detectado.");
        if (data.includes('woocommerce')) console.log("WooCommerce detectado.");

    } catch (e) {
        console.error(e);
    }
}

debug();
