# MANUAL BOOK
# Aplikasi Evaluasi Efektivitas Delegasi Tugas
## Berbasis K-Means Clustering

---

## DAFTAR ISI

1. [Pendahuluan](#1-pendahuluan)
2. [Kebutuhan Sistem](#2-kebutuhan-sistem)
3. [Cara Instalasi & Menjalankan Aplikasi](#3-cara-instalasi--menjalankan-aplikasi)
4. [Panduan Penggunaan Aplikasi](#4-panduan-penggunaan-aplikasi)
5. [Penjelasan Hasil Analisis](#5-penjelasan-hasil-analisis)
6. [Panduan Build Executable](#6-panduan-build-executable)
7. [Troubleshooting / FAQ](#7-troubleshooting--faq)

---

## 1. Pendahuluan

Aplikasi **Evaluasi Efektivitas Delegasi Tugas** adalah sistem cerdas yang menggunakan algoritma **K-Means Clustering** untuk menganalisis dan mengelompokkan beban kerja karyawan secara objektif. Aplikasi ini dirancang untuk membantu manajer proyek dalam melakukan evaluasi pemerataan tugas berdasarkan data historis penugasan.

### Fitur Utama:
- Upload dataset CSV untuk dianalisis
- Validasi data otomatis (Dry Run)
- Pengelompokan beban kerja menjadi 3 kategori: **Rendah**, **Sedang**, **Tinggi**
- Evaluasi kualitas klaster menggunakan **Davies-Bouldin Index (DBI)**
- Ekspor laporan lengkap ke file **Excel (.xlsx)** dengan visualisasi
- Rekomendasi pemerataan beban kerja otomatis
- Tersedia sebagai **file executable** yang bisa dijalankan langsung

---

## 2. Kebutuhan Sistem

### A. Menjalankan via Executable (Tanpa Instalasi)

| Komponen | Kebutuhan |
|----------|-----------|
| Sistem Operasi | macOS 11+ / Windows 10+ |
| RAM | Minimal 4 GB |
| Penyimpanan | Minimal 200 MB ruang kosong |
| Browser | Google Chrome / Microsoft Edge (untuk mode browser) |

> **Catatan**: Tidak memerlukan instalasi Python, Node.js, atau software tambahan lainnya.

### B. Menjalankan dari Source Code

| Komponen | Kebutuhan |
|----------|-----------|
| Python | Versi 3.10 atau lebih baru |
| Node.js | Versi 18 atau lebih baru |
| npm | Versi 9 atau lebih baru |
| RAM | Minimal 4 GB |
| Browser | Google Chrome / Microsoft Edge |

---

## 3. Cara Instalasi & Menjalankan Aplikasi

### A. Menjalankan via Executable (Cara Termudah)

1. **Temukan file executable** di folder `backend/dist/`:
   - macOS: File `EvaluasiDelegasi` atau `EvaluasiDelegasi.app`
   - Windows: File `EvaluasiDelegasi.exe`

2. **Jalankan aplikasi**:
   - **Double-click** file executable tersebut
   - Aplikasi akan terbuka dalam jendela desktop native
   - Tunggu beberapa detik sampai tampilan aplikasi muncul

3. **Mode alternatif** (via terminal/command prompt):
   ```
   # Mode Desktop (jendela native):
   ./EvaluasiDelegasi

   # Mode Browser (buka di Chrome/Edge):
   ./EvaluasiDelegasi --api

   # Mode CLI (tanpa tampilan grafis):
   ./EvaluasiDelegasi --local
   ```

### B. Menjalankan dari Source Code (1 Perintah)

1. Buka **Terminal** (macOS/Linux) atau **Command Prompt** (Windows)
2. Navigasi ke folder utama proyek:
   ```
   cd K-MEANS-CLUSTERING
   ```
3. Jalankan script otomatis:
   ```
   ./run.sh
   ```
4. Script akan otomatis:
   - Menyiapkan virtual environment Python
   - Menginstal semua dependensi
   - Menjalankan backend dan frontend
   - Membuka browser di `http://localhost:3000`

### C. Menjalankan dari Source Code (Manual)

**Terminal 1 — Backend:**
```
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py --api
```

**Terminal 2 — Frontend:**
```
cd frontend
npm install
npm run dev
```

**Akses aplikasi** di browser: `http://localhost:3000`

---

## 4. Panduan Penggunaan Aplikasi

### Langkah 1: Siapkan Dataset

Dataset harus berupa file **CSV** dengan kolom-kolom berikut:

| No | Nama Kolom | Tipe Data | Keterangan |
|----|-----------|-----------|------------|
| 1 | `sprint_id` | String | ID sprint / iterasi |
| 2 | `role` | String | Tipe pekerjaan (Backend, Frontend, dll) |
| 3 | `assignee` | String | Nama karyawan yang ditugaskan |
| 4 | `story_point` | Numeric | Bobot/poin pekerjaan |
| 5 | `complexity_score` | Numeric | Skor kompleksitas tugas |
| 6 | `risk_score` | Numeric | Skor risiko tugas |
| 7 | `dependency_score` | Numeric | Skor ketergantungan tugas |
| 8 | `uncertainty_score` | Numeric | Skor ketidakpastian tugas |
| 9 | `volume_score` | Numeric | Skor volume tugas |
| 10 | `task_duration_hours` | Numeric | Durasi pengerjaan (jam) |
| 11 | `reopen_count` | Numeric | Jumlah pembukaan ulang tugas |
| 12 | `role_capacity` | Numeric | Kapasitas role/jabatan |

> **Tips**: Anda bisa mengunduh template CSV dari dalam aplikasi dengan klik tombol **"📄 Unduh Template CSV"**.

### Langkah 2: Upload Dataset

1. Buka aplikasi (executable atau via browser)
2. Di bagian **"Upload Dataset"**, klik area upload atau drag & drop file CSV Anda
3. File yang dipilih akan muncul dengan nama filenya

### Langkah 3: Validasi Data (Opsional)

1. Klik tombol **"🔍 Validasi (Dry Run)"**
2. Sistem akan memeriksa:
   - Apakah semua kolom wajib tersedia
   - Apakah format data sudah benar
   - Apakah ada data kosong/invalid
3. Jika valid, akan muncul pesan hijau: **"✅ File valid"**
4. Jika ada error, akan ditampilkan pesan error yang menjelaskan masalahnya

### Langkah 4: Jalankan Evaluasi

1. Klik tombol **"🚀 Jalankan Evaluasi Delegasi"**
2. Tunggu proses analisis selesai (biasanya beberapa detik)
3. Hasil analisis akan ditampilkan secara otomatis

### Langkah 5: Baca Hasil Analisis

Setelah proses selesai, halaman akan menampilkan:

1. **Statistik Ringkas**:
   - Jumlah user yang teranalisis
   - Nilai Davies-Bouldin Index (DBI)
   - Jumlah klaster

2. **Peta Distribusi Beban Kerja**:
   - Grafik scatter plot yang menunjukkan posisi setiap karyawan
   - Warna titik menunjukkan kategori beban kerja:
     - 🟢 **Hijau** = Beban Rendah
     - 🟡 **Kuning** = Beban Sedang
     - 🔴 **Merah** = Beban Tinggi

3. **Tabel Ringkasan Klaster**:
   - Rata-rata history point per klaster
   - Jumlah karyawan di setiap klaster
   - Kategori beban kerja

4. **Tabel Detail Karyawan**:
   - Daftar lengkap semua karyawan beserta klaster dan kategorinya

5. **Rekomendasi Pemerataan Beban Kerja**:
   - ⚠️ Peringatan untuk karyawan beban **Tinggi** (perlu delegasi ulang)
   - ⚖️ Informasi karyawan beban **Sedang** (sudah seimbang)
   - 🚀 Saran untuk karyawan beban **Rendah** (bisa menerima tugas tambahan)

### Langkah 6: Download Laporan Excel

1. Klik tombol **"📊 Download Laporan (Excel)"**
2. File `hasil_evaluasi_delegasi.xlsx` akan terunduh
3. Buka file dengan Microsoft Excel atau Google Sheets

---

## 5. Penjelasan Hasil Analisis

### Davies-Bouldin Index (DBI)

DBI adalah metrik untuk mengevaluasi kualitas hasil clustering. Semakin **kecil** nilai DBI, semakin **baik** pemisahan antar klaster.

| Rentang DBI | Interpretasi |
|-------------|-------------|
| 0.0 – 0.5 | Sangat Baik |
| 0.5 – 1.0 | Baik |
| 1.0 – 1.5 | Cukup |
| > 1.5 | Kurang Baik |

### Kategori Beban Kerja

| Kategori | Warna | Keterangan |
|----------|-------|------------|
| Rendah | 🟢 Hijau | Karyawan memiliki kapasitas untuk menerima tugas tambahan |
| Sedang | 🟡 Kuning | Beban kerja seimbang dan proporsional |
| Tinggi | 🔴 Merah | Karyawan kelebihan beban, perlu pendelegasian ulang |

### Isi Laporan Excel

**Sheet 1 — Ringkasan Klaster:**
- Kotak metrik (jumlah user, DBI, jumlah klaster)
- Tabel ringkasan per klaster
- Grafik scatter plot (embedded)
- Kotak rekomendasi berwarna per kategori

**Sheet 2 — Detail Karyawan:**
- Tabel lengkap semua karyawan yang dianalisis
- Kolom: Assignee, Role, Total History Point, Klaster, Kategori

---

## 6. Panduan Build Executable

Jika Anda perlu membuild ulang file executable (misalnya setelah modifikasi kode):

### Prasyarat Build
- Python 3.10+
- Node.js 18+
- npm 9+

### Langkah Build

1. Buka terminal di folder utama proyek
2. Jalankan script build:
   ```
   ./build_exe.sh
   ```
3. Tunggu proses build selesai (sekitar 2-5 menit)
4. File executable akan berada di `backend/dist/`

> **Penting**: Executable yang dihasilkan hanya bisa berjalan di OS yang sama. Build dari macOS menghasilkan executable macOS, build dari Windows menghasilkan `.exe` Windows.

---

## 7. Troubleshooting / FAQ

### Q: Aplikasi tidak terbuka / muncul error saat double-click
**A**: Coba jalankan dari terminal dengan `./EvaluasiDelegasi --api` untuk melihat pesan error yang lebih jelas. Pada macOS, Anda mungkin perlu mengizinkan aplikasi di **System Preferences > Security & Privacy**.

### Q: Tampilan aplikasi lama muncul (>15 detik)
**A**: Ini normal untuk peluncuran pertama. Matplotlib perlu membangun font cache. Peluncuran berikutnya akan jauh lebih cepat.

### Q: Error "Kolom tidak ditemukan" saat upload
**A**: Pastikan file CSV Anda memiliki semua 12 kolom yang dibutuhkan. Gunakan fitur **"📄 Unduh Template CSV"** sebagai referensi format yang benar.

### Q: Error "Terdapat data numerik invalid / kosong"
**A**: Periksa file CSV Anda dan pastikan kolom numerik tidak mengandung teks atau sel kosong. Semua kolom numerik harus berisi angka.

### Q: Bagaimana cara mendapatkan file .exe untuk Windows?
**A**: Build harus dilakukan di komputer Windows. Install Python dan Node.js di komputer Windows, clone repository ini, lalu jalankan script build.

### Q: Di mana hasil ekspor disimpan?
**A**: File hasil ekspor (Excel, CSV, grafik) disimpan di folder `results/` yang berada di lokasi yang sama dengan file executable.

---

*Manual Book ini adalah bagian dari skripsi "Pengelompokan Beban Kerja Karyawan Menggunakan Metode K-Means Clustering pada PT PLN Icon Plus" — Universitas Indraprasta PGRI Jakarta.*
