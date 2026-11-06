import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [daftarBerita, setDaftarBerita] = useState([]);
  const [loading, setLoading] = useState(true); // State untuk loading

  const ambilData = () => {
    setLoading(true);
    fetch("http://localhost:3000/api/sumber")
      .then((res) => res.json())
      .then((data) => {
        setDaftarBerita(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    ambilData();
  }, []);

  return (
    <div className="container">
      <header>
        <div>
          <h1>📰 Berita Pintar</h1>
          <a
            href="/admin"
            style={{
              fontSize: "14px",
              color: "#2563eb",
              textDecoration: "none",
            }}
          >
            ⚙️ Ke Panel Admin
          </a>
        </div>
        <button className="btn-refresh" onClick={ambilData}>
          🔄 Refresh
        </button>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: "50px", color: "#666" }}>
          <h3>Memuat berita terbaru...</h3>
        </div>
      ) : (
        <main className="berita-grid">
          {daftarBerita.length > 0 ? (
            daftarBerita.map((berita) => (
              <div key={berita.id} className="kartu-berita">
                <span className="badge">{berita.nama_media}</span>

                {berita.status === "gagal" ? (
                  <div
                    className="thumbnail"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f3f4f6",
                      color: "#ef4444",
                      fontWeight: "bold",
                    }}
                  >
                    ❌ Web ini tidak mengizinkan capture otomatis
                  </div>
                ) : (
                  <img
                    src={`https://kernel-events-verified-happiness.trycloudflare.com/capture_media_${berita.id}.png?t=${new Date().getTime()}`}
                    alt={berita.nama_media}
                    className="thumbnail"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/800x600?text=Gambar+Belum+Di-capture";
                    }}
                  />
                )}

                <div className="konten">
                  <a
                    href={berita.url}
                    target="_blank"
                    rel="noreferrer"
                    className="tombol"
                  >
                    Baca di {berita.nama_media} →
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>
              Belum ada sumber berita. Silakan tambah di Panel Admin.
            </p>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
