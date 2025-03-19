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
        encrypt: false,
        trustServerCertificate: true
    }
};

sql.connect(config).then(() => {
    console.log('✅ Kết nối SQL thành công!');
}).catch(err => console.error('❌ Lỗi kết nối SQL:', err));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Lấy danh sách xe (có tìm kiếm và sắp xếp)
app.get('/vehicles', async (req, res) => {
    try {
        let { search = '', sortBy = 'Vtype', order = 'ASC' } = req.query;
        order = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        const validColumns = ['maker', 'model', 'price', 'Vtype'];
        if (!validColumns.includes(sortBy)) sortBy = 'Vtype';  // Mặc định sắp xếp theo loại xe

        let query = `
            SELECT * FROM Vehicles 
            WHERE model LIKE @search OR maker LIKE @search 
            ORDER BY ${sortBy} ${order}
        `;

        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('search', sql.NVarChar, `%${search}%`)
            .query(query);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thêm xe
app.post('/vehicles', async (req, res) => {
    try {
        const { maker, model, price, type } = req.body;
        await sql.query(`INSERT INTO Vehicles (maker, model, price, Vtype) VALUES (N'${maker}', N'${model}', ${price}, N'${type}')`);
        res.json({ message: "✅ Thêm thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cập nhật và xóa giống như cũ...
app.delete('/vehicles/:model', async (req, res) => {
    try {
        const { model } = req.params;
        
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('model', sql.NVarChar, model)
            .query(`DELETE FROM Vehicles WHERE model = @model`);
        
        if (result.rowsAffected[0] > 0) {
            res.json({ message: "✅ Xóa thành công!" });
        } else {
            res.status(404).json({ error: "❌ Không tìm thấy xe để xóa!" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/vehicles', async (req, res) => {
    try {
        const { maker, model, price, type } = req.body;
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('maker', sql.NVarChar, maker)
            .input('model', sql.NVarChar, model)
            .input('price', sql.Int, price)
            .input('type', sql.NVarChar, type)
            .query(`
                UPDATE Vehicles 
                SET maker = @maker, price = @price, Vtype = @type
                WHERE model = @model
            `);

        if (result.rowsAffected[0] > 0) {
            res.json({ message: "✅ Cập nhật thành công!" });
        } else {
            res.status(404).json({ error: "❌ Không tìm thấy xe để cập nhật!" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
    

app.listen(port, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});
