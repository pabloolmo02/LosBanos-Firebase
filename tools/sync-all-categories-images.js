
import { google } from 'googleapis';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURACIÓN DE CARPETAS ---
const CONFIG = [
    {
        category: 'limpieza-general',
        folderId: '1_6WkFUv26Dkq8PSixaJD3pizyrCt0pZ_', // ID ACTUALIZADO
        ids: ['101','102','103','104','105','106','107','108','109','110','111','112','113','114','115','116','117','118','119','120','121','122','123','124','125','126','127','128','129','130','131','132','133','134','135','136','137','138','139','140','141','142','143','144','145','146','147','148','149','150','151','152','153','154','155','156','157','158','159','160','161','162','163','164','165','166','167','168','169','170','171','172','173','174','175','176','177','178','179','180','181','182','183','184','185','186','187','188','189','190','191','192','193','194','195','196','197','198','199','200','201','202','203','204','205','206','207','208','209','210','211','212','213','214','215','216','217','218','219','220','221','222','223','224','225','226','227','228','229']
    },
    {
        category: 'industria-alimentaria',
        folderId: '1Kj0i06fPkccmymGAqj2kmN_EaFzAz7BH',
        ids: ['401','402','403','404','405','406','407','408','409','410','411','412','413','414','415','416','417','418','419','420','421','422','423','424','425','426','427','428','429']
    }
];

const keyPath = path.join(__dirname, 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-8208320398.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();
const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const drive = google.drive({ version: 'v3', auth });

async function syncAll() {
    console.log("🚀 Iniciando sincronización masiva de imágenes...");

    for (const item of CONFIG) {
        console.log(`\n-----------------------------------------`);
        console.log(`📂 Procesando Categoría: ${item.category.toUpperCase()}`);
        console.log(`📂 Carpeta Drive ID: ${item.folderId}`);

        try {
            // 1. Listar archivos de la carpeta
            const res = await drive.files.list({
                q: `'${item.folderId}' in parents and trashed = false`,
                fields: 'files(id, name)',
                pageSize: 1000
            });
            const files = res.data.files || [];
            console.log(`✅ Encontrados ${files.length} archivos en Drive.`);

            const batch = db.batch();
            let updateCount = 0;

            // 2. Mapear cada archivo numerado a su ID de producto
            for (let i = 0; i < item.ids.length; i++) {
                const productNumber = i + 1;
                const productId = item.ids[i];

                // Buscar archivo "1.jpg", "1.png", "01.jpg", etc.
                const fileMatch = files.find(f => {
                    const name = f.name.split('.')[0].trim();
                    return name === String(productNumber) || name === String(productNumber).padStart(2, '0') || name === String(productNumber).padStart(3, '0');
                });

                if (fileMatch) {
                    const directUrl = `https://drive.google.com/thumbnail?id=${fileMatch.id}&sz=w1000`;
                    const ref = db.collection('products').doc(productId);
                    batch.update(ref, { images: [directUrl] });
                    updateCount++;
                }
            }

            if (updateCount > 0) {
                await batch.commit();
                console.log(`✨ Éxito: ${updateCount} productos actualizados.`);
            } else {
                console.warn("⚠️ No se encontraron coincidencias numéricas.");
            }

        } catch (error) {
            console.error(`❌ Error en categoría ${item.category}:`, error.message);
        }
    }

    console.log(`\n✅ Proceso completo.`);
}

syncAll();
