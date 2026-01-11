const { Sequelize } = require('sequelize');
const path = require('path');

// Determine storage based on environment
// Vercel serverless uses /tmp which is writable
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel
    ? '/tmp/database.sqlite'  // Vercel writable directory
    : path.join(__dirname, '../database.sqlite');

// Create SQLite database connection
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false, // Set to console.log to see SQL queries
    define: {
        timestamps: true,
        underscored: true
    }
});

// Test connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ SQLite database connected successfully');
        console.log(`📁 Database path: ${dbPath}`);
    } catch (error) {
        console.error('❌ Unable to connect to SQLite database:', error);
    }
}

testConnection();

module.exports = sequelize;
