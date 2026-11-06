import { useState, useEffect } from 'react';
import './App.css';

export default function Admin() {
  // State Pengaturan Global dengan nilai default yang aman
  const [pengaturan, setPengaturan] = useState({ max_width: 800, max_height: 600, jadwal: '', retensi_hari: 7 });
  
  // State Form Sumber Berita dengan nilai default yang aman (angka 0)
  const [sumberBaru, setSumberBaru] = useState({ 
    id: null, nama_media: '', url: '', 
    kustom_x: 0, kustom_y: 0, kustom_width: 0, kustom_height: 0, pakai_kustom: false 
  });
  
  const [daftarSumber, setDaftarSumber] = useState([]);
  const [modeEdit, setModeEdit] = useState(false);

  useEffect(() => {
    fetch('https://kernel-events-verified-happiness.trycloudflare.com/api/pengaturan')
      .then(res => res.json())
      .then(data => setPengaturan(data))
      .catch(err => console.error(err));
    ambilSumber();
  }, []);

  const ambilSumber = () => {
    fetch('https://kernel-events-verified-happiness.trycloudflare.com/api/sumber')
      .then(res => res.json())
      .then(data => setDaftarSumber(data))
      .catch(err => console.error(err));
  };

  const simpanPengaturan = (e) => {
    e.preventDefault();
    fetch('https://kernel-events-verified-happiness.trycloudflare.com/api/pengaturan', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pengaturan)
    }).then(() => alert('Pengaturan Global Disimpan!'));
  };

  const simpanSumber = (e) => {
    e.preventDefault();
    
    // Memastikan semua angka adalah angka yang valid, bukan NaN atau undefined
    const dataSumber = {
      ...sumberBaru,
      kustom_x: parseInt(sumberBaru.kustom_x) || 0,
      kustom_y: parseInt(sumberBaru.kustom_y) || 0,
      kustom_width: parseInt(sumberBaru.kustom_width) || 0,
      kustom_height: parseInt(sumberBaru.kustom_height) || 0,
    };

    const method = modeEdit ? 'PUT' : 'POST';
    const urlAPI = modeEdit ? `https://kernel-events-verified-happiness.trycloudflare.com/api/sumber/${dataSumber.id}` : 'https://kernel-events-verified-happiness.trycloudflare.com/api/sumber';

    fetch(urlAPI, {
      method: method, 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(dataSumber)
    })
    .then(res => res.json())
    .then(() => {
      alert(modeEdit ? 'Sumber Berhasil Diupdate!' : 'Sumber Berhasil Ditambahkan!');
      resetForm();
      ambilSumber();
    })
    .catch(err => alert("Gagal menyimpan: " + err.message));
  };

  const hapusSumber = (id) => {
    if (window.confirm("Yakin ingin menghapus sumber berita ini?")) {
      fetch(`https://kernel-events-verified-happiness.trycloudflare.com/api/sumber/${id}`, { method: 'DELETE' })
        .then(() => ambilSumber());
    }
  };

  const klikEdit = (sumber) => {
    // Memastikan jika data dari database kosong (null), kita ubah jadi 0 agar React tidak error
    setSumberBaru({
      id: sumber.id,
      nama_media: sumber.nama_media || '',
      url: sumber.url || '',
      kustom_x: sumber.kustom_x || 0,
      kustom_y: sumber.kustom_y || 0,
      kustom_width: sumber.kustom_width || 0,
      kustom_height: sumber.kustom_height || 0,
      pakai_kustom: sumber.pakai_kustom === 1
    });
    setModeEdit(true);
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setSumberBaru({ id: null, nama_media: '', url: '', kustom_x: 0, kustom_y: 0, kustom_width: 0, kustom_height: 0, pakai_kustom: false });
    setModeEdit(false);
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '20px' }}>
        <div>
          <h1>⚙️ Panel Admin</h1>
          <a href="/" style={{ fontSize: '14px', color: '#2563eb', textDecoration: 'none' }}>← Kembali ke Halaman Berita</a>
        </div>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        
        {/* FORM PENGATURAN GLOBAL */}
        <form onSubmit={simpanPengaturan}>
          <h3>1. Pengaturan Default & Sistem</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Lebar Default (px):</label>
              <input type="number" value={pengaturan.max_width || 800} onChange={e => setPengaturan({...pengaturan, max_width: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Tinggi Default (px):</label>
              <input type="number" value={pengaturan.max_height || 600} onChange={e => setPengaturan({...pengaturan, max_height: parseInt(e.target.value) || 0})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Jadwal Cron:</label>
              <input type="text" value={pengaturan.jadwal || ''} onChange={e => setPengaturan({...pengaturan, jadwal: e.target.value})} />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Hapus Otomatis (Hari):</label>
              <input type="number" value={pengaturan.retensi_hari || 7} onChange={e => setPengaturan({...pengaturan, retensi_hari: parseInt(e.target.value) || 0})} />
            </div>
          </div>
          
          <button type="submit" style={{ background: '#2563eb' }}>Simpan Pengaturan</button>
        </form>

        {/* FORM TAMBAH / EDIT SUMBER */}
        <form onSubmit={simpanSumber} style={{ border: modeEdit ? '2px solid #f59e0b' : 'none' }}>
          <h3>{modeEdit ? '✏️ Edit Sumber Berita' : '2. Tambah Sumber Berita'}</h3>
          
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Nama Media:</label>
          <input type="text" value={sumberBaru.nama_media || ''} onChange={e => setSumberBaru({...sumberBaru, nama_media: e.target.value})} placeholder="Contoh: Detikcom" required />
          
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>URL Berita Spesifik:</label>
          <input type="text" value={sumberBaru.url || ''} onChange={e => setSumberBaru({...sumberBaru, url: e.target.value})} placeholder="https://..." required />
          
          <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              <input type="checkbox" checked={sumberBaru.pakai_kustom || false} onChange={e => setSumberBaru({...sumberBaru, pakai_kustom: e.target.checked})} style={{ width: '20px', height: '20px' }} />
              Gunakan Koordinat Kustom (Top/Left/Width/Height)
            </label>

            {sumberBaru.pakai_kustom && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px' }}>Top (Y):</label>
                  <input type="number" value={sumberBaru.kustom_y || 0} onChange={e => setSumberBaru({...sumberBaru, kustom_y: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label style={{ fontSize: '12px' }}>Left (X):</label>
                  <input type="number" value={sumberBaru.kustom_x || 0} onChange={e => setSumberBaru({...sumberBaru, kustom_x: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label style={{ fontSize: '12px' }}>Width (Lebar):</label>
                  <input type="number" value={sumberBaru.kustom_width || 0} onChange={e => setSumberBaru({...sumberBaru, kustom_width: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label style={{ fontSize: '12px' }}>Height (Tinggi):</label>
                  <input type="number" value={sumberBaru.kustom_height || 0} onChange={e => setSumberBaru({...sumberBaru, kustom_height: parseInt(e.target.value) || 0})} />
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ background: modeEdit ? '#f59e0b' : '#10b981', flex: 1 }}>
              {modeEdit ? 'Update Sumber' : 'Tambah Sumber'}
            </button>
            {modeEdit && (
              <button type="button" onClick={resetForm} style={{ background: '#6b7280', flex: 1, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '12px', fontWeight: 'bold' }}>
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST SUMBER */}
      <div style={{ marginTop: '20px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h3>Daftar Sumber Aktif ({daftarSumber.length})</h3>
        <ul style={{ listStyleType: 'none', padding: 0, marginTop: '15px' }}>
          {daftarSumber.map(s => (
            <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ flex: 1 }}>
                <b style={{ color: '#1f2937' }}>{s.nama_media}</b> {s.status === 'gagal' && <span style={{ color: 'red', fontSize: '12px' }}>(Gagal)</span>}<br/>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{s.url}</span><br/>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                  Mode: {s.pakai_kustom === 1 ? `Kustom (T:${s.kustom_y}, L:${s.kustom_x}, W:${s.kustom_width}, H:${s.kustom_height})` : 'Default'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => alert('Untuk capture manual, jalankan: node capture.js')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }} title="Capture Sekarang">📸</button>
                <button onClick={() => klikEdit(s)} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => hapusSumber(s.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>Hapus</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}