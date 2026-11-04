const puppeteer = require('puppeteer');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

async function ambilSemuaGambar() {
    const db = new sqlite3.Database('./database.db');
    
    db.get(`SELECT * FROM pengaturan WHERE id = 1`, async (err, setting) => {
        if (!setting) return console.log("Pengaturan belum ada.");
        
        // === FITUR HAPUS OTOMATIS BERDASARKAN RETENSI ===
        const retensiHari = setting.retensi_hari || 7;
        const batasWaktu = Date.now() - (retensiHari * 24 * 60 * 60 * 1000);
        const filesInDir = fs.readdirSync(__dirname).filter(f => f.startsWith('capture_media_') && f.endsWith('.png'));
        
        filesInDir.forEach(file => {
            const filePath = path.join(__dirname, file);
            const stats = fs.statSync(filePath);
            // Jika umur file lebih tua dari batas waktu retensi, hapus.
            if (stats.mtimeMs < batasWaktu) {
                fs.unlinkSync(filePath);
                console.log(`[Bersih-bersih] Menghapus file kedaluwarsa (${retensiHari} hari): ${file}`);
            }
        });
        // =================================================

        db.all(`SELECT * FROM sumber_berita`, [], async (err, sources) => {
            if (!sources || sources.length === 0) {
                db.close();
                return console.log("Tidak ada sumber berita.");
            }

            console.log(`\nMenemukan ${sources.length} sumber. Memulai capture...`);
            const browser = await puppeteer.launch({ 
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'] 
            });

            for (let i = 0; i < sources.length; i++) {
                const site = sources[i];
                const page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

                // Tentukan ukuran layar (Viewport). Jika custom, pakai ukuran custom, jika tidak pakai default
                const lebarLayar = site.pakai_kustom === 1 ? (site.kustom_x + site.kustom_width) : setting.max_width;
                await page.setViewport({ width: lebarLayar > 0 ? lebarLayar : setting.max_width, height: 1000 });

                try {
                    console.log(`[${i+1}/${sources.length}] Membuka: ${site.nama_media}`);
                    await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 60000 });
                    await new Promise(r => setTimeout(r, 3000)); // Jeda 3 detik

                    let opsiClip = {};
                    if (site.pakai_kustom === 1) {
                        // Gunakan koordinat Top-Left (x, y) dan ukuran Width-Height
                        opsiClip = {
                            x: site.kustom_x,
                            y: site.kustom_y,
                            width: site.kustom_width,
                            height: site.kustom_height
                        };
                        console.log(`   -> Mode Kustom: Top/Left [${site.kustom_x}, ${site.kustom_y}], Lebar/Tinggi [${site.kustom_width}, ${site.kustom_height}]`);
                    } else {
                        // Gunakan default dari pusat (0,0) sampai max_width/max_height
                        opsiClip = { x: 0, y: 0, width: setting.max_width, height: setting.max_height };
                        console.log(`   -> Mode Default: ${setting.max_width}x${setting.max_height}`);
                    }

                    const namaFile = `capture_media_${site.id}.png`;
                    await page.screenshot({ path: namaFile, clip: opsiClip });
                    
                    db.run(`UPDATE sumber_berita SET status = 'sukses' WHERE id = ?`, site.id);
                    console.log(`   -> Disimpan sebagai ${namaFile}`);
                } catch (error) {
                    db.run(`UPDATE sumber_berita SET status = 'gagal' WHERE id = ?`, site.id);
                    console.log(`   -> Gagal capture: ${error.message}`);
                }
                await page.close();
            }
            await browser.close();
            console.log("Semua capture selesai!");
            db.close();
        });
    });
}

ambilSemuaGambar();