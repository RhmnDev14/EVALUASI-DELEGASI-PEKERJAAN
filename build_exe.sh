#!/bin/bash
set -e

echo "🔨 ============================================="
echo "   BUILD EXECUTABLE"
echo "   Evaluasi Efektivitas Delegasi Tugas"
echo "============================================="

# Get project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# =========================================================
# STEP 1: Build Frontend (Static Export)
# =========================================================
echo ""
echo "📦 [1/4] Building Frontend (Static Export)..."
echo "---------------------------------------------"
cd "$PROJECT_ROOT/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
fi

# Build static export
npm run build

# Verify output
if [ ! -d "out" ]; then
    echo "❌ Frontend build failed! Folder 'out' tidak ditemukan."
    exit 1
fi

echo "✅ Frontend berhasil di-build ke folder 'out/'"

# =========================================================
# STEP 2: Copy Frontend to Backend
# =========================================================
echo ""
echo "📂 [2/4] Copying frontend to backend..."
echo "---------------------------------------------"
cd "$PROJECT_ROOT"

# Remove old frontend_dist if exists
rm -rf backend/frontend_dist

# Copy the static export
cp -r frontend/out backend/frontend_dist

echo "✅ Frontend disalin ke backend/frontend_dist/"

# =========================================================
# STEP 3: Setup Backend & Install Dependencies
# =========================================================
echo ""
echo "🐍 [3/4] Setting up Backend..."
echo "---------------------------------------------"
cd "$PROJECT_ROOT/backend"

# Create venv if not exists
if [ ! -d "venv" ]; then
    echo "🛠️ Membuat virtual environment..."
    python3 -m venv venv || python -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "📥 Installing backend dependencies..."
pip install -r requirements.txt

echo "✅ Dependencies installed"

# =========================================================
# STEP 4: Build Executable with PyInstaller
# =========================================================
echo ""
echo "🚀 [4/4] Building Executable with PyInstaller..."
echo "---------------------------------------------"

# Clean previous builds
rm -rf build dist *.spec

# Build executable
pyinstaller \
    --name "EvaluasiDelegasi" \
    --onefile \
    --windowed \
    --add-data "frontend_dist:frontend_dist" \
    --hidden-import uvicorn.logging \
    --hidden-import uvicorn.loops \
    --hidden-import uvicorn.loops.auto \
    --hidden-import uvicorn.protocols \
    --hidden-import uvicorn.protocols.http \
    --hidden-import uvicorn.protocols.http.auto \
    --hidden-import uvicorn.protocols.websockets \
    --hidden-import uvicorn.protocols.websockets.auto \
    --hidden-import uvicorn.lifespan \
    --hidden-import uvicorn.lifespan.on \
    --hidden-import uvicorn.lifespan.off \
    --hidden-import sklearn.utils._typedefs \
    --hidden-import sklearn.utils._heap \
    --hidden-import sklearn.utils._sorting \
    --hidden-import sklearn.utils._vector_sentinel \
    --hidden-import sklearn.neighbors._partition_nodes \
    --hidden-import webview \
    --collect-submodules webview \
    --collect-submodules sklearn \
    --collect-submodules uvicorn \
    main.py

# Deactivate venv
deactivate

# =========================================================
# DONE
# =========================================================
echo ""
echo "============================================="
echo "✅ BUILD SELESAI!"
echo "============================================="
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📍 File executable: $PROJECT_ROOT/backend/dist/EvaluasiDelegasi"
    echo ""
    echo "Untuk menjalankan:"
    echo "  ./backend/dist/EvaluasiDelegasi"
elif [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "win"* ]]; then
    echo "📍 File executable: $PROJECT_ROOT\\backend\\dist\\EvaluasiDelegasi.exe"
    echo ""
    echo "Untuk menjalankan:"
    echo "  Double-click file EvaluasiDelegasi.exe"
else
    echo "📍 File executable: $PROJECT_ROOT/backend/dist/EvaluasiDelegasi"
fi

echo ""
echo "💡 Tips:"
echo "  - File executable bisa dipindahkan/dicopy ke komputer lain"
echo "  - Pastikan folder 'results/' ada di samping executable untuk menyimpan output"
echo ""
