const cron = require('node-cron');
const { exec } = require('child_process');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

function jalankanRobot() {
    console.log(`\n[${new Date().toLocaleString()}] Waktunya Capture! Menjalankan robot...`);
    exec('node capture.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Gagal: ${error.message}`);
            return;
        }
        console.log(stdout);
    });
}

// Ambil jadwal dari database
db.get(`SELECT jadwal FROM pengaturan WHERE id = 1`, (err, row) => {
    if (err || !row) return console.log("Gagal load jadwal.");
    
    const jadwalDb = row.jadwal;
    console.log(`Sistem Penjadwal Aktif. Jadwal saat ini: ${jadwalDb}`);

    cron.schedule(jadwalDb, () => {
        jalankanRobot();
    });
});