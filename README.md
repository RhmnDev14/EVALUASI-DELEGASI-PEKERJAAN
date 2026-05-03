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

- **Backend**: Python 3.x, FastAPI, Uvicorn
- **Data Science**: Pandas, Scikit-Learn
- **Visualisasi**: Matplotlib, Seaborn

## 📋 Prasyarat

Pastikan Anda sudah menginstal Python di sistem Anda. Instal dependensi dengan:

```bash
pip install -r requirements.txt
```

## 📂 Format Dataset

Dataset `.csv` harus memiliki kolom: `task_id`, `title`, `type`, `status`, `assignee`, `history_point`.

---

## 💻 Cara Penggunaan

### A. Penggunaan API Server (Sangat Disarankan)

1. **Jalankan Server**:
   ```bash
   python main.py --api
   ```
2. **Dokumentasi Interaktif**: Buka `http://127.0.0.1:8000/`. Anda akan diarahkan ke **Swagger UI** untuk mencoba API secara langsung.
3. **Alur Kerja**:
   - Gunakan `GET /template` untuk mendapatkan contoh file.
   - Gunakan `POST /upload` untuk memproses data Anda.
   - Gunakan `GET /preview` untuk melihat visualisasi hasil analisis terbaru.

### B. Penggunaan Lokal (CLI)

1. Letakkan dataset di folder `assets/`.
2. Jalankan: `python main.py`

---

## 📊 Penjelasan Output

### 1. Visualisasi Grafik (`/preview`)

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
├── assets/             # Dataset input
├── results/            # Export CSV & Grafik (.png)
├── main.py             # Server & Logika K-Means
├── requirements.txt    # Library Python
└── README.md           # Dokumentasi
```

## ✍️ Penulis

- **Judul Skripsi**: Evaluasi Delegasi Pekerjaan
- **Instansi**: Universitas Indraprasta PGRI Jakarta

---

_Proyek ini dikembangkan untuk tujuan akademis dan penelitian._
