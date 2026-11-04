const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});
app.use(express.static(__dirname));

const db = new sqlite3.Database('./database.db');

// Pengaturan Global (Default)
db.run(`CREATE TABLE IF NOT EXISTS pengaturan (
    id INTEGER PRIMARY KEY,
    max_width INTEGER,
    max_height INTEGER,
    jadwal TEXT,
    retensi_hari INTEGER  -- Fitur Hapus Otomatis (dalam hari)
)`);

// Sumber Berita (Memiliki koordinat kustom)
db.run(`CREATE TABLE IF NOT EXISTS sumber_berita (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_media TEXT,
    url TEXT,
    kustom_x INTEGER,     -- Top/Left
    kustom_y INTEGER,     -- Top
    kustom_width INTEGER, -- Lebar (Right - Left)
    kustom_height INTEGER,-- Tinggi (Bottom - Top)
    pakai_kustom INTEGER DEFAULT 0, -- 0 = False, 1 = True
    status TEXT DEFAULT 'pending'
)`);

// Data awal pengaturan
db.get(`SELECT COUNT(*) AS count FROM pengaturan`, (err, row) => {
    if (row.count === 0) {
        db.run(`INSERT INTO pengaturan (id, max_width, max_height, jadwal, retensi_hari) VALUES (1, 800, 600, '*/30 * * * *', 7)`);
    }
});

// ================= API =================

// 1. Pengaturan Global
app.get('/api/pengaturan', (req, res) => {
    db.get(`SELECT * FROM pengaturan WHERE id = 1`, (err, row) => res.json(row));
});

app.post('/api/pengaturan', (req, res) => {
    const { max_width, max_height, jadwal, retensi_hari } = req.body;
    db.run(`UPDATE pengaturan SET max_width = ?, max_height = ?, jadwal = ?, retensi_hari = ? WHERE id = 1`, 
        [parseInt(max_width), parseInt(max_height), jadwal, parseInt(retensi_hari)], 
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Pengaturan disimpan!" });
        }
    );
});

// 2. Sumber Berita
app.get('/api/sumber', (req, res) => {
    db.all(`SELECT * FROM sumber_berita`, [], (err, rows) => res.json(rows));
});

app.post('/api/sumber', (req, res) => {
    const { nama_media, url, kustom_x, kustom_y, kustom_width, kustom_height, pakai_kustom } = req.body;
    db.run(`INSERT INTO sumber_berita (nama_media, url, kustom_x, kustom_y, kustom_width, kustom_height, pakai_kustom) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [nama_media, url, kustom_x || 0, kustom_y || 0, kustom_width || 0, kustom_height || 0, pakai_kustom ? 1 : 0], 
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Sumber ditambahkan!" });
        }
    );
});

// 3. Edit Sumber Berita
app.put('/api/sumber/:id', (req, res) => {
    const id = req.params.id;
    const { nama_media, url, kustom_x, kustom_y, kustom_width, kustom_height, pakai_kustom } = req.body;
    db.run(`UPDATE sumber_berita SET nama_media = ?, url = ?, kustom_x = ?, kustom_y = ?, kustom_width = ?, kustom_height = ?, pakai_kustom = ? WHERE id = ?`, 
        [nama_media, url, kustom_x || 0, kustom_y || 0, kustom_width || 0, kustom_height || 0, pakai_kustom ? 1 : 0, id], 
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Sumber diupdate!" });
        }
    );
});

// 4. Hapus Sumber Berita
app.delete('/api/sumber/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM sumber_berita WHERE id = ?`, id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Sumber berhasil dihapus!" });
    });
});

app.listen(port, () => {
    console.log(`Server API berjalan di http://localhost:${port}`);
});