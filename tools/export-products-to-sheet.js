
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import local products
import { getProducts } from '../src/lib/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Credentials file
const KEY_FILENAME = 'losbanosdata-1f79f-firebase-adminsdk-fbsvc-f653f6cda0.json';
const KEY_PATH = path.join(__dirname, KEY_FILENAME);

// Carpeta donde intentaremos crear el Sheet (usamos una de las que ya compartiste con la cuenta de servicio)
const TARGET_FOLDER_ID = '1eY4JkAsbGU1Mgsn1DL2q_wl-oHMB8cxU'; // Carpeta Fichas Técnicas

async function main() {
    console.log("🚀 Starting export to Google Sheets...");

    // 1. Verify credentials
    if (!fs.existsSync(KEY_PATH)) {
        console.error(`❌ ERROR: Credentials file not found: ${KEY_FILENAME}`);
        return;
    }

    // 2. Auth
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    try {
        // 3. Create Spreadsheet File directly in Drive Folder
        console.log(`📄 Creating new Spreadsheet in folder ${TARGET_FOLDER_ID}...`);
        
        const fileMetadata = {
            name: `Catálogo Quimxel - ${new Date().toISOString().split('T')[0]}`,
            mimeType: 'application/vnd.google-apps.spreadsheet',
            parents: [TARGET_FOLDER_ID]
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            fields: 'id, webViewLink'
        });

        const spreadsheetId = file.data.id;
        const spreadsheetUrl = file.data.webViewLink;
        console.log(`✅ Sheet created with ID: ${spreadsheetId}`);

        // 4. Prepare Data
        const products = getProducts();
        
        // Headers
        const headers = [
            'ID', 'Name', 'Reference', 'Category', 'Price', 
            'Description', 'Sector', 'Usage', 
            'Technical Sheet', 'Safety Sheet', 'Image 1'
        ];

        // Rows
        const rows = products.map(p => [
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
        ]);

        const values = [headers, ...rows];

        // 5. Write Data to the new Sheet
        console.log(`📝 Writing ${rows.length} products...`);
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'RAW',
            requestBody: {
                values,
            },
        });

        // 6. Format Header
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        repeatCell: {
                            range: {
                                sheetId: 0,
                                startRowIndex: 0,
                                endRowIndex: 1
                            },
                            cell: {
                                userEnteredFormat: {
                                    textFormat: { bold: true },
                                    backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
                                }
                            },
                            fields: 'userEnteredFormat(textFormat,backgroundColor)'
                        }
                    }
                ]
            }
        });

        console.log("\n🎉 Export Complete!");
        console.log(`🔗 Link to your Sheet: ${spreadsheetUrl}`);

    } catch (error) {
        console.error("❌ Error during export:", error.message);
        if (error.errors) {
            console.error(JSON.stringify(error.errors, null, 2));
        }
    }
}

main();
