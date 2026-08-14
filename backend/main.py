import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import io
import argparse

from fastapi import FastAPI, Response, UploadFile, File, HTTPException, Request
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import silhouette_score

import uvicorn

# =========================================================
# FASTAPI
# =========================================================
app = FastAPI(
    title="API Evaluasi Efektivitas Delegasi Tugas"
)

# =========================================================
# CORS
# =========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# ROOT
# =========================================================
@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")


# =========================================================
# REQUIRED DATASET COLUMNS
# =========================================================
REQUIRED_COLUMNS = [
    'sprint_id',
    'role',
    'assignee',
    'story_point',
    'complexity_score',
    'risk_score',
    'dependency_score',
    'uncertainty_score',
    'volume_score',
    'task_duration_hours',
    'reopen_count',
    'role_capacity'
]


# =========================================================
# PREPROCESSING + KMEANS
# =========================================================
def perform_clustering(df, k=3):

    # =====================================================
    # VALIDASI DATASET
    # =====================================================
    missing_cols = [
        col for col in REQUIRED_COLUMNS
        if col not in df.columns
    ]

    if missing_cols:
        raise ValueError(
            f"Kolom tidak ditemukan: {', '.join(missing_cols)}"
        )

    if df.empty:
        raise ValueError("Dataset kosong.")

    # =====================================================
    # CLEANING
    # =====================================================
    df['sprint_id'] = df['sprint_id'].astype(str).str.strip()
    df['role'] = df['role'].astype(str).str.strip()
    df['assignee'] = df['assignee'].astype(str).str.strip()

    # =====================================================
    # VALIDASI NUMERIK
    # =====================================================
    numeric_cols = [
        'story_point',
        'complexity_score',
        'risk_score',
        'dependency_score',
        'uncertainty_score',
        'volume_score',
        'task_duration_hours',
        'reopen_count',
        'role_capacity'
    ]

    for col in numeric_cols:
        df[col] = pd.to_numeric(
            df[col],
            errors='coerce'
        )

    if df[numeric_cols].isnull().any().any():
        raise ValueError(
            "Terdapat data numerik invalid / kosong."
        )

    df = df.dropna()

    # =====================================================
    # AGREGASI PER ASSIGNEE (CLUSTERING USER)
    # =====================================================
    # Menghitung Delegation Score per Tugas dahulu
    df['delegation_score'] = (
        (df['story_point'] + df['complexity_score'] + df['risk_score']) /
        (df['role_capacity'] + 1)
    )

    # =====================================================
    # KALKULASI METRIK CANGGIH PER TUGAS
    # =====================================================
    df['workload_val'] = df['story_point'] * df['complexity_score']
    
    # =====================================================
    # AGREGASI PER ASSIGNEE (CLUSTERING USER)
    # =====================================================
    df_user = df.groupby('assignee').agg({
        'story_point': 'sum',
        'complexity_score': 'mean',
        'risk_score': 'mean',
        'task_duration_hours': 'sum',
        'reopen_count': 'sum',
        'role_capacity': 'mean',
        'workload_val': 'sum',
        'role': 'first'
    }).reset_index()

    # Tambahkan jumlah tugas
    df_user['task_count'] = df.groupby('assignee').size().values

    # 1. VELOCITY ACHIEVEMENT (Total SP / Capacity)
    df_user['velocity_achievement'] = (df_user['story_point'] / (df_user['role_capacity'] + 1)).round(4)
    
    # 2. WORKLOAD SCORE (Normalized Workload Value)
    df_user['workload_score'] = (df_user['workload_val'] / (df_user['task_count'] + 1)).round(2)
    
    # 3. CAPACITY RATIO (Duration vs Capacity)
    # Asumsi: role_capacity dalam SP, dikonversi ke estimasi jam (misal 1 SP = 8 jam)
    df_user['capacity_ratio'] = (df_user['task_duration_hours'] / ((df_user['role_capacity'] * 8) + 1)).round(4)
    
    # 4. QUALITY FACTOR (Rework Inverse)
    df_user['quality_factor'] = (1 / (df_user['reopen_count'] + 1)).round(4)
    
    # 5. DELEGATION EFFICIENCY INDEX (Combined)
    df_user['delegation_efficiency_index'] = (
        (df_user['velocity_achievement'] + df_user['quality_factor']) / 2
    ).round(4)

    # =====================================================
    # FEATURE LIST UNTUK CLUSTERING USER
    # =====================================================
    features_list = [
        'velocity_achievement',
        'workload_score',
        'capacity_ratio',
        'quality_factor',
        'delegation_efficiency_index'
    ]

    X = df_user[features_list]

    # =====================================================
    # SCALING & KMEANS
    # =====================================================
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    df_user['cluster'] = kmeans.fit_predict(X_scaled)

    silhouette = silhouette_score(X_scaled, df_user['cluster'])

    # =====================================================
    # CLUSTER SUMMARY
    # =====================================================
    cluster_summary = (
        df_user
        .groupby('cluster')[features_list]
        .mean()
        .round(4)
    )

    # =====================================================
    # INTERPRETASI CLUSTER USER (RANKING)
    # =====================================================
    ranked_clusters = cluster_summary['delegation_efficiency_index'].sort_values(ascending=False).index.tolist()
    
    def interpret_user_cluster_ranked(row):
        cluster_id = row.name
        rank = ranked_clusters.index(cluster_id)
        
        if rank == 0:
            label = "High Performance Group"
        elif rank == 1:
            label = "Standard Performance Group"
        else:
            label = "Needs Improvement Group"

        # Warnings
        if row['capacity_ratio'] > 0.9:
            return f"{label} (Overloaded Risk)"
        if row['quality_factor'] < 0.5:
            return f"{label} (Quality Issues)"
        
        return label

    cluster_summary['interpretation'] = cluster_summary.apply(interpret_user_cluster_ranked, axis=1)

    return (
        df_user,        # Sekarang mengembalikan data per USER, bukan per TASK
        cluster_summary,
        silhouette,
        X_scaled
    )


# =========================================================
# ELBOW METHOD
# =========================================================
def calculate_elbow(X_scaled):

    inertia = []

    K = range(1, 11)

    for k in K:

        model = KMeans(
            n_clusters=k,
            random_state=42,
            n_init=10
        )

        model.fit(X_scaled)

        inertia.append(model.inertia_)

    return list(K), inertia


# =========================================================
# GENERATE VISUALIZATION
# =========================================================
def generate_preview(
    df_result,
    silhouette_score_value,
    output_path='results/latest_preview.png'
):

    sns.set_theme(style="whitegrid")

    plt.figure(figsize=(16, 8))

    # =====================================================
    # SCATTERPLOT
    # =====================================================
    sns.scatterplot(
        data=df_result,
        x='assignee',
        y='story_point',
        hue='cluster',
        palette='viridis',
        s=140,
        alpha=0.85,
        edgecolor='black'
    )

    plt.title(
        'Evaluasi Efektivitas Delegasi Tugas',
        fontsize=18,
        fontweight='bold'
    )

    plt.xlabel('Assignee')
    plt.ylabel('Story Point')

    plt.xticks(rotation=45)

    # =====================================================
    # SUMMARY
    # =====================================================
    total_tasks = len(df_result)

    overload_tasks = len(
        df_result[
            (
                df_result['story_point'] >= 8
            )
            &
            (
                df_result['task_duration_hours'] >= 40
            )
        ]
    )

    high_rework = len(
        df_result[
            df_result['reopen_count'] >= 2
        ]
    )

    summary_text = (
        f"📊 Delegation Analytics\n\n"
        f"Total Task: {total_tasks}\n"
        f"Silhouette Score: {silhouette_score_value:.4f}\n"
        f"Overload Task: {overload_tasks}\n"
        f"High Rework: {high_rework}\n\n"
        f"💡 Insight:\n"
        f"Cluster digunakan untuk\n"
        f"mengevaluasi efektivitas\n"
        f"delegasi tugas berdasarkan\n"
        f"distribusi workload Scrum."
    )

    plt.text(
        1.02,
        0.25,
        summary_text,
        transform=plt.gca().transAxes,
        fontsize=11,
        bbox=dict(
            boxstyle='round',
            facecolor='white',
            edgecolor='gray'
        )
    )

    plt.tight_layout(rect=[0, 0, 0.82, 1])

    os.makedirs(
        os.path.dirname(output_path),
        exist_ok=True
    )

    plt.savefig(
        output_path,
        dpi=300
    )

    plt.close()


# =========================================================
# TEMPLATE CSV
# =========================================================
@app.get("/template")
async def get_template():

    template_data = {
        'sprint_id': ['Sprint-1', 'Sprint-1'],
        'role': ['Backend', 'Frontend'],
        'assignee': ['Rahman', 'Siti'],
        'story_point': [8, 3],
        'complexity_score': [5, 2],
        'risk_score': [4, 2],
        'dependency_score': [3, 1],
        'uncertainty_score': [4, 1],
        'volume_score': [5, 2],
        'task_duration_hours': [48, 12],
        'reopen_count': [2, 0],
        'role_capacity': [35, 30]
    }

    df_template = pd.DataFrame(
        template_data
    )

    stream = io.StringIO()

    df_template.to_csv(
        stream,
        index=False
    )

    return Response(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=template_evaluasi_delegasi.csv"
        }
    )


# =========================================================
# UPLOAD CSV
# =========================================================
@app.post("/upload")
async def upload_file(
    request: Request,
    file: UploadFile = File(...)
):

    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=400,
            detail="Hanya file CSV diperbolehkan."
        )

    try:

        contents = await file.read()

        df = pd.read_csv(
            io.BytesIO(contents)
        )

        (
            df_result,
            cluster_summary,
            silhouette,
            X_scaled
        ) = perform_clustering(df)

        # =================================================
        # GENERATE PREVIEW
        # =================================================
        preview_path = 'results/latest_preview.png'

        generate_preview(
            df_result,
            silhouette,
            preview_path
        )

        # =================================================
        # ELBOW METHOD
        # =================================================
        K, inertia = calculate_elbow(
            X_scaled
        )

        # =================================================
        # ROLE ANALYSIS
        # =================================================
        role_analysis = (
            df_result
            .groupby(['role', 'cluster'])
            .size()
            .reset_index(name='total_task')
        )

        # =================================================
        # ASSIGNEE ANALYSIS
        # =================================================
        assignee_analysis = (
            df_result
            .groupby(['assignee', 'cluster'])
            .size()
            .reset_index(name='total_task')
        )

        # =================================================
        # ROLE WORKLOAD
        # =================================================
        role_workload = (
            df_result
            .groupby('role')['story_point']
            .sum()
            .reset_index(name='total_story_point')
        )

        # =================================================
        # ASSIGNEE WORKLOAD
        # =================================================
        assignee_workload = (
            df_result
            .groupby('assignee')['story_point']
            .sum()
            .reset_index(name='total_story_point')
        )

        # =================================================
        # URL
        # =================================================
        base_url = str(request.base_url)

        preview_url = f"{base_url}preview"

        download_url = f"{base_url}download"

        return {

            "status": "success",

            "message":
                "Evaluasi efektivitas delegasi berhasil dilakukan.",

            "silhouette_score":
                round(silhouette, 4),

            "cluster_summary":
                cluster_summary
                .reset_index()
                .to_dict(orient='records'),

            "role_analysis":
                role_analysis
                .to_dict(orient='records'),

            "assignee_analysis":
                assignee_analysis
                .to_dict(orient='records'),

            "role_workload":
                role_workload
                .to_dict(orient='records'),

            "assignee_workload":
                assignee_workload
                .to_dict(orient='records'),

            "elbow_method": {
                "k_values": K,
                "inertia": inertia
            },

            "preview_url": preview_url,

            "download_url": download_url,

            "data":
                df_result.to_dict(
                    orient='records'
                )
        }

    except ValueError as ve:

        raise HTTPException(
            status_code=400,
            detail=str(ve)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Server Error: {str(e)}"
        )


# =========================================================
# PREVIEW IMAGE
# =========================================================
@app.get("/preview")
async def get_preview():

    preview_path = 'results/latest_preview.png'

    if not os.path.exists(preview_path):

        raise HTTPException(
            status_code=404,
            detail="Preview belum tersedia."
        )

    return FileResponse(preview_path)


# =========================================================
# DOWNLOAD IMAGE
# =========================================================
@app.get("/download")
async def download_preview():

    preview_path = 'results/latest_preview.png'

    if not os.path.exists(preview_path):

        raise HTTPException(
            status_code=404,
            detail="File tidak ditemukan."
        )

    return FileResponse(
        path=preview_path,
        filename="hasil_evaluasi_delegasi.png",
        media_type="image/png"
    )


# =========================================================
# RUN LOCAL
# =========================================================
def run_local():

    print("=== Evaluasi Efektivitas Delegasi ===")

    file_path = 'assets/dataset_evaluasi_delegasi_tugas.csv'

    if not os.path.exists(file_path):

        print(f"File tidak ditemukan: {file_path}")

        return

    df = pd.read_csv(file_path)

    (
        df_result,
        cluster_summary,
        silhouette,
        X_scaled
    ) = perform_clustering(df)

    # =====================================================
    # PRINT ANALYSIS
    # =====================================================
    print("\n=== SILHOUETTE SCORE ===")

    print(round(silhouette, 4))

    print("\n=== CLUSTER SUMMARY ===")

    print(cluster_summary)

    # =====================================================
    # VISUALISASI
    # =====================================================
    plt.figure(figsize=(14, 7))

    sns.scatterplot(
        data=df_result,
        x='assignee',
        y='story_point',
        hue='cluster',
        palette='viridis',
        s=120
    )

    plt.title(
        'Evaluasi Efektivitas Delegasi Tugas'
    )

    plt.xlabel('Assignee')

    plt.ylabel('Story Point')

    plt.xticks(rotation=45)

    plt.show()

    # =====================================================
    # SAVE RESULT
    # =====================================================
    os.makedirs(
        'results',
        exist_ok=True
    )

    output_path = (
        'results/hasil_evaluasi_delegasi.csv'
    )

    df_result.to_csv(
        output_path,
        index=False
    )

    print(f"\nHasil disimpan ke: {output_path}")


# =========================================================
# MAIN
# =========================================================
if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--api",
        action="store_true",
        help="Jalankan sebagai API"
    )

    args = parser.parse_args()

    if args.api:

        print("API Running...")
        print("Swagger Docs: http://127.0.0.1:8000/docs")

        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8000
        )

    else:

        run_local()