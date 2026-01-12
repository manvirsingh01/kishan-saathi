const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Google Sheets configuration
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
];

let doc = null;
let isInitialized = false;

/**
 * Initialize Google Sheets connection
 */
async function initializeSheets() {
    if (isInitialized && doc) {
        return doc;
    }

    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
        console.error('❌ Missing Google Sheets credentials. Check .env file.');
        console.log('Required: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SPREADSHEET_ID');
        return null;
    }

    try {
        // Create JWT auth
        const serviceAccountAuth = new JWT({
            email: serviceAccountEmail,
            key: privateKey,
            scopes: SCOPES,
        });

        // Initialize the spreadsheet
        doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
        await doc.loadInfo();

        console.log(`✅ Connected to Google Spreadsheet: ${doc.title}`);
        isInitialized = true;

        // Initialize required sheets
        await ensureRequiredSheets();

        return doc;
    } catch (error) {
        console.error('❌ Failed to connect to Google Sheets:', error.message);
        return null;
    }
}

/**
 * Ensure all required sheets exist with proper headers
 */
async function ensureRequiredSheets() {
    const requiredSheets = {
        'Users': ['id', 'name', 'email', 'password', 'phone', 'role', 'activeFarmId', 'createdAt', 'updatedAt'],
        'Farms': ['id', 'userId', 'name', 'pincode', 'village', 'state', 'district', 'latitude', 'longitude', 'landArea', 'landType', 'soilType', 'isActive', 'createdAt', 'updatedAt']
    };

    for (const [sheetName, headers] of Object.entries(requiredSheets)) {
        let sheet = doc.sheetsByTitle[sheetName];

        if (!sheet) {
            console.log(`📝 Creating sheet: ${sheetName}`);
            sheet = await doc.addSheet({ title: sheetName, headerValues: headers });
        } else {
            // Ensure headers exist
            await sheet.loadHeaderRow();
            if (!sheet.headerValues || sheet.headerValues.length === 0) {
                await sheet.setHeaderRow(headers);
            }
        }
    }

    console.log('✅ All required sheets initialized');
}

/**
 * Get a sheet by name
 */
async function getSheet(sheetName) {
    if (!isInitialized) {
        await initializeSheets();
    }

    if (!doc) {
        throw new Error('Google Sheets not initialized');
    }

    return doc.sheetsByTitle[sheetName];
}

/**
 * Generate a unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

module.exports = {
    initializeSheets,
    getSheet,
    generateId
};
