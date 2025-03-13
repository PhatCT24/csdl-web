const express = require('express');
const sql = require('mssql');
const path = require('path');

const app = express();
const port = 3000;

// Cấu hình SQL Server
const config = {
    server: 'DESKTOP-SHKU3AT\\SQLEXPRESS',
    database: 'bt',
    user: 'node_user',
    password: 'password123',
    port: 1433,
    options: {
        encrypt: false, // Đặt thành true nếu dùng Azure
        trustServerCertificate: true
    }
};

// Kết nối tới SQL Server
sql.connect(config).then(() => {
    console.log('✅ Kết nối SQL thành công!');
}).catch(err => console.error('❌ Lỗi kết nối SQL:', err));

// Phục vụ file tĩnh từ thư mục `public`
app.use(express.static(path.join(__dirname, 'public')));

// API trả về dữ liệu JSON
app.get('/vehicles', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Vehicles'); // Thay Vehicles bằng bảng của bạn
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('❌ Lỗi truy vấn dữ liệu');
    }
});

// Điều hướng tất cả request khác về `index.html`
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Khởi động server
app.listen(port, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});
