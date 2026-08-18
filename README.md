# Pengelompokan Beban Kerja Karyawan Menggunakan Metode K-Means Clustering pada PT PLN Icon Plus

Proyek ini merupakan implementasi algoritma **K-Means Clustering** yang digunakan untuk mendukung penelitian skripsi dengan judul **"Pengelompokan Beban Kerja Karyawan Menggunakan Metode K-Means Clustering pada PT PLN Icon Plus"**. Sistem ini bertujuan untuk mengelompokkan karyawan divisi DGE berdasarkan beban kerja secara objektif untuk evaluasi pemerataan tugas.

## 📌 Deskripsi Proyek

Penelitian ini menerapkan algoritma K-Means Clustering untuk mengelompokkan karyawan berdasarkan agregasi bobot kerjanya, lalu mengevaluasi distribusi beban kerja tersebut pada tiap penerima tugas secara objektif. Pengelompokan K-Means secara matematis murni menggunakan 1 dimensi, yaitu akumulasi bobot pekerjaan (total history point / story point) per karyawan, sementara atribut tipe pekerjaan (role) dipertahankan sebagai atribut kontekstual untuk analisis pasca-klastering.

## 🏗️ Arsitektur Proses

Berikut adalah alur data algoritma dari dataset mentah hingga tahap evaluasi akhir:
1. **Data Task**: Penarikan dataset penugasan yang mencakup *Assignee*, *Role*, dan *Story Point*.
2. **Aggregation**: Pengelompokan (Group By) berdasarkan *Assignee*, lalu dilakukan penjumlahan (Sum) seluruh *Story Point* menjadi variabel `total_history_point`.
3. **Standardization**: Normalisasi distribusi `total_history_point` menggunakan `StandardScaler`.
4. **K-Means Clustering**: Menjalankan algoritma K-Means dengan batas `K=3` (Rendah, Sedang, Tinggi) pada matriks fitur 1-dimensi.
5. **Centroid-based Labeling**: Melakukan pengurutan (*sorting*) nilai centroid dari yang terkecil ke terbesar untuk menetapkan pemetaan kategori beban kerja secara otomatis dan anti-bias.
6. **Evaluation**: Menghitung kualitas dan kepadatan pemisahan klaster menggunakan metrik *Davies-Bouldin Index (DBI)*.
7. **Contextual Analysis**: Menabulasikan silang hasil klastering dengan parameter *Role* untuk evaluasi sebaran beban kerja antar departemen.

## 🚀 Fitur Utama

- **Aplikasi Desktop (Executable)**: File executable yang bisa dijalankan langsung tanpa instalasi tambahan.
- **REST API (FastAPI)**: Memungkinkan integrasi dengan aplikasi lain (Web/Mobile).
- **Antarmuka Web (Next.js)**: Dashboard interaktif untuk upload, analisis, dan visualisasi.
- **Analisis K-Means**: Pengelompokan beban kerja karyawan menggunakan K=3 (Rendah, Sedang, Tinggi).
- **Validasi Cepat (Dry Run)**: Fitur untuk memvalidasi format dan kelengkapan data sebelum diproses secara penuh.
- **Ekspor Laporan Excel Premium**: Menghasilkan file Excel (.xlsx) dengan _styling_ otomatis, *UI Cards* rekomendasi delegasi per klaster, kotak metrik, dan plot grafik yang ditanamkan (*embedded*).
- **Visualisasi Premium (Seaborn)**: Grafik distribusi beban per _assignee_ dengan resolusi tinggi (ditanamkan ke dalam Excel).
- **Evaluasi Klaster**: Penghitungan kualitas klaster menggunakan **Davies-Bouldin Index (DBI)**.
- **Manajemen Template**: Endpoint untuk mengunduh template CSV standar.

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js (React), TypeScript
- **Backend**: Python 3.x, FastAPI, Uvicorn
- **Data Science & Export**: Pandas, Scikit-Learn, OpenPyXL
- **Visualisasi**: Matplotlib, Seaborn
- **Desktop**: PyWebView (jendela desktop native)
- **Build Executable**: PyInstaller

## 📋 Prasyarat

### A. Menjalankan via Executable (Tanpa Instalasi)

Tidak memerlukan instalasi apapun. Cukup jalankan file executable yang sudah disediakan:

- **macOS**: `EvaluasiDelegasi.app` atau `EvaluasiDelegasi`
- **Windows**: `EvaluasiDelegasi.exe`

### B. Menjalankan dari Source Code

Pastikan Anda sudah menginstal Python (Backend) dan Node.js (Frontend) di sistem Anda.

#### Setup Lingkungan Python (Backend)

Sangat disarankan menggunakan _virtual environment_ (`venv`) agar dependensi tidak bentrok:

```bash
cd backend
python3 -m venv venv  # Gunakan python3 untuk Mac/Linux, atau python untuk Windows

# Aktivasi venv (Mac/Linux):
source venv/bin/activate
# Aktivasi venv (Windows):
# venv\Scripts\activate

pip install -r requirements.txt
```

## 📂 Format Dataset

Dataset `.csv` harus memiliki kolom-kolom berikut agar dapat diproses oleh sistem:
- `sprint_id` (String)
- `role` (String)
- `assignee` (String)
- `story_point` (Numeric)
- `complexity_score` (Numeric)
- `risk_score` (Numeric)
- `dependency_score` (Numeric)
- `uncertainty_score` (Numeric)
- `volume_score` (Numeric)
- `task_duration_hours` (Numeric)
- `reopen_count` (Numeric)
- `role_capacity` (Numeric)

---

## 💻 Cara Penggunaan

### A. Menjalankan Executable (Sangat Disarankan)

Cara termudah untuk menggunakan aplikasi ini:

**Mode Desktop (double-click):**
```bash
# macOS — klik dua kali file EvaluasiDelegasi.app
# atau dari terminal:
./EvaluasiDelegasi
```
Aplikasi akan terbuka dalam jendela desktop native, seperti software pada umumnya.

**Mode Browser (dengan flag `--api`):**
```bash
./EvaluasiDelegasi --api
```
Menjalankan server API dan otomatis membuka browser di `http://127.0.0.1:8000`.

**Mode CLI Lokal (tanpa GUI):**
```bash
./EvaluasiDelegasi --local
```
Menjalankan analisis clustering langsung dari terminal tanpa tampilan grafis.

### B. Menjalankan dari Source Code dengan 1 Perintah

Anda bisa menyiapkan dependensi dan menjalankan **Backend** dan **Frontend** secara bersamaan hanya dengan 1 perintah melalui terminal di folder utama proyek:

```bash
./run.sh
```

**Script ini akan secara otomatis:**
- Membuat dan mengaktifkan _virtual environment_ (jika belum ada).
- Menginstal semua pustaka (_library_) yang dibutuhkan (backend & frontend).
- Membuka browser web Anda secara otomatis ke `http://localhost:3000`.

*(Server backend akan berjalan di background dan frontend di foreground. Untuk mematikan keduanya, cukup tekan `CTRL+C` di terminal tersebut.)*

### C. Menjalankan dari Source Code secara Manual

Jika Anda lebih suka menjalankan secara manual di terminal terpisah:

1. **Jalankan API Server** (Terminal 1):
   ```bash
   cd backend
   # Pastikan environment (venv) sudah aktif!
   # Jika error "command not found: python" di Mac/Linux, gunakan python3:
   python main.py --api  # atau python3 main.py --api
   ```
2. **Jalankan Frontend Server** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```
3. **Akses Aplikasi**: Buka browser dan kunjungi `http://localhost:3000`.

### D. Penggunaan API Server

1. **Jalankan Server** (via executable atau source code).
2. **Dokumentasi Interaktif**: Buka `http://127.0.0.1:8000/docs`. Anda akan diarahkan ke **Swagger UI**.
3. **Alur Kerja**:
   - `GET /api/template` untuk mendapatkan contoh file.
   - `POST /api/dry-run` untuk memvalidasi data CSV tanpa menjalankan clustering.
   - `POST /api/upload` untuk memproses data, menjalankan K-Means, dan men-generate laporan.
   - `GET /api/preview` untuk melihat visualisasi hasil terbaru di browser.
   - `GET /api/download-excel` untuk mengunduh laporan Excel terpadu yang memuat ringkasan klaster, detail karyawan, metrik, rekomendasi delegasi, dan plot grafik.

### E. Penggunaan Lokal (CLI)

1. Letakkan dataset di folder `backend/`.
2. Jalankan:
   ```bash
   cd backend
   # Pastikan environment (venv) sudah aktif!
   python main.py --local  # atau python3 main.py --local
   ```

---

## 🔨 Build Executable

Untuk membuild ulang file executable dari source code:

```bash
./build_exe.sh
```

Script ini akan secara otomatis:
1. Build frontend menjadi file statis (`npm run build`)
2. Copy hasil build ke folder backend
3. Install dependensi Python
4. Build executable menggunakan PyInstaller

Hasil executable akan berada di `backend/dist/`.

> **Catatan**: Executable hanya bisa dijalankan di OS yang sama dengan OS saat build. Build dari macOS menghasilkan executable macOS, build dari Windows menghasilkan `.exe` Windows.

---

## 📊 Penjelasan Output

### 1. Laporan Terpadu Excel (`/api/download-excel`)

Sistem akan menghasilkan file **hasil_evaluasi_delegasi.xlsx** yang terdiri dari:

- **Sheet "Ringkasan Klaster"**:
  - **Kotak Metrik (Stats Cards)**: Menampilkan Total User Teranalisis, nilai Davies-Bouldin Index (DBI), dan Jumlah Cluster.
  - **Tabel Ringkasan**: Rekapitulasi kelompok beban kerja.
  - **Visualisasi Plot K-Means**: Grafik distribusi beban kerja beresolusi tinggi yang ter-embed otomatis di dalam sheet.
  - **UI Cards Rekomendasi Pemerataan**: Kotak-kotak berwarna khusus (Merah, Kuning, Hijau) yang menyorot siapa saja karyawan di beban tinggi yang perlu pendelegasian ulang, dan siapa yang masih punya kapasitas (beban rendah).

- **Sheet "Detail Karyawan"**:
  - Daftar lengkap seluruh karyawan yang dianalisis beserta nilai *Total History Point*, ID Klaster, dan kategori bebannya (Rendah / Sedang / Tinggi).
  - Kolom secara otomatis menyesuaikan lebar (auto-fit) dan dibingkai rapi (border).

### 2. Hasil Ekspor Data (Lokal)

Saat dijalankan melalui CLI, data hasil clustering tetap disimpan di `results/hasil_evaluasi_delegasi.xlsx` dan `hasil_evaluasi_delegasi.csv`.

## 🎯 Manfaat untuk Evaluasi Delegasi

1. **Workload Balancing**: Mendeteksi ketimpangan beban kerja antar staf secara visual.
2. **Pengambilan Keputusan**: Memberikan dasar ilmiah (data-driven) bagi manajer untuk memindahkan tugas dari staf yang overload.
3. **Rekomendasi Strategis**: Membantu menentukan staf mana yang masih memiliki kapasitas untuk menerima tugas baru.

## 📂 Struktur Folder

```text
K-MEANS-CLUSTERING/
├── backend/               # API Server (Python/FastAPI)
│   ├── frontend_dist/     # Frontend hasil build (static HTML/CSS/JS)
│   ├── results/           # Export CSV, Excel (.xlsx), & Grafik (.png)
│   ├── main.py            # Logika utama (API + K-Means + Desktop)
│   ├── requirements.txt   # Dependensi Python
│   ├── build/             # File sementara PyInstaller
│   └── dist/              # ⭐ File executable hasil build
├── frontend/              # Aplikasi Web (Next.js)
│   ├── src/app/           # Source code React
│   └── out/               # Hasil static export
├── build_exe.sh           # Script build executable otomatis
├── run.sh                 # Script jalankan dari source code
└── README.md              # Dokumentasi Utama
```

## ✍️ Penulis

- **Judul Skripsi**: Pengelompokan Beban Kerja Karyawan Menggunakan Metode K-Means Clustering pada PT PLN Icon Plus
- **Instansi**: Universitas Indraprasta PGRI Jakarta

---

_Proyek ini dikembangkan untuk tujuan akademis dan penelitian._
