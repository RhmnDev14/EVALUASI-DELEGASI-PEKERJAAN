# K-Means Clustering: Evaluasi Delegasi Pekerjaan

Proyek ini merupakan implementasi algoritma **K-Means Clustering** yang digunakan untuk mendukung penelitian skripsi dengan judul **"Evaluasi Delegasi Pekerjaan"**. Sistem ini bertujuan untuk mengelompokkan data delegasi pekerjaan berdasarkan parameter tertentu untuk mengevaluasi efektivitas dan distribusi beban kerja.

## 📌 Deskripsi Proyek

Delegasi pekerjaan yang efisien adalah kunci produktivitas organisasi. Dengan menggunakan metode K-Means, proyek ini mengelompokkan data (seperti durasi penyelesaian, kompleksitas tugas, dan performa staf) ke dalam beberapa klaster untuk mendapatkan wawasan tentang pola delegasi yang terjadi.

## 🚀 Fitur Utama

- **REST API (FastAPI)**: Memungkinkan integrasi dengan aplikasi lain (Web/Mobile).
- **Analisis K-Means**: Pengelompokan tugas otomatis berdasarkan bobot kerja (_history points_).
- **Visualisasi Premium (Seaborn)**: Grafik distribusi beban per _assignee_ dengan resolusi tinggi.
- **Ringkasan Analisis Otomatis**: Deteksi beban terberat dan rekomendasi delegasi langsung pada grafik.
- **Manajemen Template**: Endpoint untuk mengunduh template CSV standar.

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js (React), TypeScript, Tailwind CSS
- **Backend**: Python 3.x, FastAPI, Uvicorn
- **Data Science**: Pandas, Scikit-Learn
- **Visualisasi**: Matplotlib, Seaborn

## 📋 Prasyarat

Pastikan Anda sudah menginstal Python (Backend) dan Node.js (Frontend) di sistem Anda.

### Setup Lingkungan Python (Backend)

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

Dataset `.csv` harus memiliki kolom: `task_id`, `title`, `type`, `status`, `assignee`, `history_point`.

---

## 💻 Cara Penggunaan

### A. Cara Cepat dengan 1 Perintah (Sangat Disarankan)

Anda bisa menyiapkan dependensi dan menjalankan **Backend** dan **Frontend** secara bersamaan hanya dengan 1 perintah melalui terminal di folder utama proyek:

```bash
./run.sh
```

**Script ini akan secara otomatis:**
- Membuat dan mengaktifkan _virtual environment_ (jika belum ada).
- Menginstal semua pustaka (_library_) yang dibutuhkan (backend & frontend).
- Membuka browser web Anda secara otomatis ke `http://localhost:3000`.

*(Server backend akan berjalan di background dan frontend di foreground. Untuk mematikan keduanya, cukup tekan `CTRL+C` di terminal tersebut.)*

### B. Penggunaan Manual Web Frontend

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

### B. Penggunaan API Server

1. **Jalankan Server**:
   ```bash
   cd backend
   # Pastikan environment (venv) sudah aktif!
   # Jika error "command not found: python" di Mac/Linux, gunakan python3:
   python main.py --api  # atau python3 main.py --api
   ```
2. **Dokumentasi Interaktif**: Buka `http://127.0.0.1:8000/`. Anda akan diarahkan ke **Swagger UI**.
3. **Alur Kerja**:
   - `GET /template` untuk mendapatkan contoh file.
   - `POST /upload` untuk memproses data.
   - `GET /preview` untuk melihat visualisasi hasil terbaru.

### C. Penggunaan Lokal (CLI)

1. Letakkan dataset di folder `backend/assets/`.
2. Jalankan:
   ```bash
   cd backend
   # Pastikan environment (venv) sudah aktif!
   # Jika error "command not found: python" di Mac/Linux, gunakan python3:
   python main.py  # atau python3 main.py
   ```

---

## 📊 Penjelasan Output

### 1. Visualisasi Grafik (`/preview` atau Web)

Grafik kini menyajikan analisis yang lebih mendalam:

- **Sumbu X**: Menampilkan nama **Assignee** (Penerima Tugas).
- **Sumbu Y**: Menampilkan **History Points** (Beban Kerja).
- **Panel Ringkasan (Kanan)**: Menampilkan total tugas, siapa yang memegang beban terberat, dan rekomendasi delegasi otomatis.
- **Kategori Klaster**:
  - **Beban Rendah**: Tugas rutin/sederhana.
  - **Beban Sedang**: Tugas dengan kompleksitas menengah.
  - **Beban Tinggi**: Tugas kritis yang membutuhkan perhatian khusus.

### 2. Hasil Ekspor Data

Data hasil clustering tetap disimpan di `results/hasil_clustering_delegasi.csv` dengan kolom tambahan `cluster`.

## 🎯 Manfaat untuk Evaluasi Delegasi

1. **Workload Balancing**: Mendeteksi ketimpangan beban kerja antar staf secara visual.
2. **Pengambilan Keputusan**: Memberikan dasar ilmiah (data-driven) bagi manajer untuk memindahkan tugas dari staf yang overload.
3. **Rekomendasi Strategis**: Membantu menentukan staf mana yang masih memiliki kapasitas untuk menerima tugas baru.

## 📂 Struktur Folder

```text
K-MEANS-CLUSTERING/
├── backend/            # API Server (Python/FastAPI)
│   ├── assets/         # Dataset input
│   ├── results/        # Export CSV & Grafik (.png)
│   ├── main.py         # Logika K-Means
│   └── requirements.txt
├── frontend/           # Aplikasi Web (Next.js)
└── README.md           # Dokumentasi Utama
```

## ✍️ Penulis

- **Judul Skripsi**: Evaluasi Delegasi Pekerjaan
- **Instansi**: Universitas Indraprasta PGRI Jakarta

---

_Proyek ini dikembangkan untuk tujuan akademis dan penelitian._
