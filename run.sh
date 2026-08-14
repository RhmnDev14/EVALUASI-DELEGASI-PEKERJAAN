#!/bin/bash

echo "🚀 Menyiapkan dan Memulai Aplikasi K-Means Clustering..."

# Menangani CTRL+C (SIGINT) untuk mematikan semua proses (backend & frontend)
trap "echo '🛑 Mematikan server...'; kill 0; exit" SIGINT

# 1. Persiapan dan Menjalankan Backend
echo "======================================"
echo "⏳ Menyiapkan Backend API..."
echo "======================================"
cd backend || exit

# Membuat venv jika belum ada
if [ ! -d "venv" ]; then
    echo "🛠️ Membuat virtual environment baru..."
    # Mencoba python3 terlebih dahulu, jika gagal (contoh di Windows) coba python
    python3 -m venv venv || python -m venv venv
fi

echo "✅ Mengaktifkan virtual environment..."
source venv/bin/activate

echo "📦 Menginstal/memperbarui dependensi backend (pip install)..."
pip install -r requirements.txt

echo "🚀 Menjalankan Backend API..."
python main.py --api &

# Kembali ke root
cd ..

# 2. Persiapan dan Menjalankan Frontend
echo "======================================"
echo "⏳ Menyiapkan Frontend Server..."
echo "======================================"
cd frontend || exit

echo "📦 Menginstal/memperbarui dependensi frontend (npm install)..."
npm install

echo "======================================"
echo "✨ Semua layanan siap dijalankan! ✨"
echo "🌐 Akses Aplikasi Web : http://localhost:3000"
echo "📖 Dokumentasi API    : http://127.0.0.1:8000/docs"
echo "======================================"

echo "🚀 Menjalankan Frontend Server..."
# Buka browser secara otomatis setelah delay 3 detik (memberi waktu Next.js untuk menyala)
(sleep 3; open "http://localhost:3000" || xdg-open "http://localhost:3000" || start "http://localhost:3000") &

npm run dev
