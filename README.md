
# CINEMATCH 🎬

> Aplikasi Web Pencari & Penjelajah Film — Movie Discovery Web App

CINEMATCH adalah aplikasi web untuk menemukan, menjelajahi, dan menyimpan film favorit. Dibangun menggunakan **Vanilla JavaScript** dengan autentikasi **Google Firebase** dan data film dari **TMDB API**.

CINEMATCH is a web application for discovering, browsing, and saving favorite movies. Built with **Vanilla JavaScript**, **Google Firebase** authentication, and movie data from **TMDB API**.

---

## Latar Belakang / Background

> **Project UAS** — Mata Kuliah Pemrograman Web  
> **Semester 2** — Politeknik Pertanian Negeri Samarinda

Project ini dibuat sebagai tugas akhir semester untuk mata kuliah Pemrograman Web. Tujuannya adalah membangun aplikasi web dinamis dengan autentikasi pihak ketiga, integrasi API eksternal, dan database real-time.

*This project was created as a final semester assignment for the Web Programming course. The goal is to build a dynamic web application with third-party authentication, external API integration, and a real-time database.*

---

## Fitur / Features

| Indonesia | English |
|-----------|---------|
| Login dengan Google (Firebase Auth) | Google Sign-In (Firebase Auth) |
| Jelajahi film: Now Playing, Popular, Top Rated | Browse movies: Now Playing, Popular, Top Rated |
| Cari film berdasarkan judul | Search movies by title |
| Filter film berdasarkan genre | Filter movies by genre |
| Lihat detail film (poster, rating, sinopsis, genre, durasi) | View movie details (poster, rating, synopsis, genres, runtime) |
| Tambah/Hapus film ke Watchlist | Add/Remove movies to Watchlist |
| Tandai film sebagai "Sudah Ditonton" | Mark movies as "Watched" |
| Filter Watchlist (Semua / Belum Ditonton / Sudah Ditonton) | Filter Watchlist (All / Unwatched / Watched) |
| Tampilan responsif ala Netflix | Netflix-style responsive UI |

---

## Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| **HTML5** | Struktur halaman |
| **CSS3** | Styling & responsive layout |
| **JavaScript (ES Modules)** | Logika aplikasi & interaktivitas |
| **Firebase Authentication** | Autentikasi Google & Email/Password |
| **Firebase Firestore** | Database real-time untuk user & watchlist |
| **TMDB API** | Data film (poster, rating, sinopsis, dll) |

---

## Struktur Project / Project Structure

```
CINEMATCH/
├── index.html              → Login page
├── home.html               → Halaman utama browse film
├── detail.html             → Halaman detail film
├── watchlist.html          → Halaman watchlist
├── css/
│   ├── login.css           → Style halaman login
│   ├── home.css            → Style utama (home, watchlist)
│   └── detail.css          → Style halaman detail
├── js/
│   ├── config.js           → 🔑 API keys & Firebase config 
│   ├── firebase.js         → Inisialisasi Firebase
│   ├── auth.js             → Fungsi autentikasi (Google, Email/Password)
│   ├── main.js             → Entry point halaman login
│   ├── api.js              → Wrapper TMDB API
│   ├── ui.js               → Komponen UI (card, toast, loading)
│   ├── home.js             → Logika halaman home
│   ├── detail.js           → Logika halaman detail
│   └── watchlist.js        → Logika halaman watchlist
├── .gitignore
└── README.md
```

---

## Prasyarat / Prerequisites

- Akun [Firebase](https://firebase.google.com/) (untuk Authentication & Firestore)
- API Key [TMDB](https://www.themoviedb.org/) (untuk data film)
- Web browser modern (Chrome, Firefox, Edge)
- (Opsional) Live Server / local HTTP server

---

## Instalasi & Konfigurasi / Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/username/cinematch.git
cd cinematch
```

### 2. Buat Project Firebase / Create Firebase Project

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru → **cinematch-project**
3. Aktifkan **Authentication** → Sign-in method → **Google**
4. Aktifkan **Cloud Firestore** → buat database (mode test)

### 3. Dapatkan API Key TMDB / Get TMDB API Key

1. Daftar/login di [TMDB](https://www.themoviedb.org/)
2. Buka Settings → API → buat API Key

### 4. Konfigurasi `js/config.js` / Configure `js/config.js`

Buka file `js/config.js` dan isi dengan kredensial Anda:

```js
export const TMDB_API_KEY = "YOUR_TMDB_API_KEY";

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

> **⚠️ Peringatan:** File `js/config.js` sudah masuk `.gitignore`. **Jangan commit API key asli** ke repository publik.
>
> **⚠️ Warning:** The file `js/config.js` is already in `.gitignore`. **Do not commit real API keys** to a public repository.

---

## Cara Menjalankan / How to Run

Karena ini aplikasi **static Vanilla JS**, cukup buka file HTML langsung di browser atau gunakan Live Server:

### Opsi 1 — Live Server (VS Code)
```bash
# Install Live Server extension, lalu klik kanan login.html → Open with Live Server
```

### Opsi 2 — Python HTTP Server
```bash
python -m http.server 8000
# Buka http://localhost:8000/login.html
```

### Opsi 3 — Node.js HTTP Server
```bash
npx serve .
# Buka http://localhost:3000/login.html
```

---

## Alur Penggunaan / Usage Flow

1. **Login** → Klik "Continue with Google" → pilih akun Google
2. **Home** → Jelajahi film (Now Playing / Popular / Top Rated)
3. **Search** → Ketik judul film, filter genre, klik Cari
4. **Detail** → Klik poster film → lihat sinopsis, rating, genre, runtime
5. **Watchlist** → Klik ♥ di card film, atau tombol "Tambah ke Watchlist" di halaman detail
6. **Watched** → Klik tombol "Tandai Ditonton" di detail atau di watchlist
7. **Filter Watchlist** → Semua / Belum Ditonton / Sudah Ditonton
8. **Logout** → Klik Logout di pojok kanan atas

---

## Firestore Schema

### Collection: `users/{uid}`

| Field | Type | Description |
|-------|------|-------------|
| `displayName` | string | Nama pengguna |
| `email` | string | Email pengguna |
| `photoURL` | string | URL foto profil |
| `createdAt` | timestamp | Waktu pendaftaran |
| `lastLogin` | timestamp | Waktu login terakhir |

### Collection: `users/{uid}/watchlist/{movieId}`

| Field | Type | Description |
|-------|------|-------------|
| `movieId` | number | ID film dari TMDB |
| `title` | string | Judul film |
| `poster_path` | string | Path poster film |
| `vote_average` | number | Rating film |
| `release_date` | string | Tanggal rilis |
| `addedAt` | timestamp | Waktu ditambahkan ke watchlist |
| `watched` | boolean | Status sudah ditonton |

---

## Lisensi / License

Project ini dibuat untuk tujuan akademis. Data film milik [TMDB](https://www.themoviedb.org/).

*This project is created for academic purposes. Movie data belongs to [TMDB](https://www.themoviedb.org/).*

---
