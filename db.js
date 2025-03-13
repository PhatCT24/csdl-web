const sql = require('mssql');

const config = {
    server: 'DESKTOP-SHKU3AT\\SQLEXPRESS',
    database: 'bt',
    user: 'node_user',
    password: 'password123',
    port: 1433,
    options: { trustServerCertificate: true, encrypt: false }
};

async function connectDB() {
    try {
        let pool = await sql.connect(config);
        console.log('✅ Kết nối SQL Server thành công!');
        return pool;
    } catch (err) {
        console.error('❌ Lỗi kết nối SQL Server:', err);
    }
}

module.exports = { connectDB, sql };
