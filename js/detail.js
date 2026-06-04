import { auth, db } from "./firebase.js";
import { authGuard, saveUserToFirestore, logout } from "./auth.js";
import { fetchMovieDetail } from "./api.js";
import { showToast } from "./ui.js";
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const posterImg = document.getElementById("detail-poster-img");
const titleEl = document.getElementById("detail-title");
const taglineEl = document.getElementById("detail-tagline");
const ratingEl = document.getElementById("detail-rating");
const yearEl = document.getElementById("detail-year");
const runtimeEl = document.getElementById("detail-runtime");
const genresEl = document.getElementById("detail-genres");
const overviewEl = document.getElementById("detail-overview");
const wlBtn = document.getElementById("wl-btn");
const wtBtn = document.getElementById("wt-btn");
const loadingEl = document.getElementById("detail-loading");
const container = document.getElementById("detail-container");
const avatarEl = document.getElementById("avatar");
const userNameEl = document.getElementById("user-name");
const logoutBtn = document.getElementById("logout-btn");

let movieId = null;
let movieData = null;
let inWatchlist = false;
let watched = false;

async function init() {
  const user = await authGuard();
  if (!user) return;

  await saveUserToFirestore(user);
  renderUserProfile(user);

  const params = new URLSearchParams(window.location.search);
  movieId = params.get("id");
  if (!movieId) {
    container.innerHTML =
      '<div class="empty-state error">ID film tidak valid.</div>';
    return;
  }

  startWatchlistListener(user.uid);
  await loadDetail();

  wlBtn.addEventListener("click", handleWatchlistToggle);
  wtBtn.addEventListener("click", handleWatchedToggle);

  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await logout();
    window.location.href = "login.html";
  });
}

function renderUserProfile(user) {
  const displayName = user.displayName || "User";
  const photoURL = user.photoURL;
  if (photoURL) {
    avatarEl.innerHTML = `<img src="${photoURL}" alt="${displayName}" />`;
    avatarEl.classList.add("has-img");
  } else {
    avatarEl.textContent = displayName.charAt(0).toUpperCase();
    avatarEl.classList.remove("has-img");
  }
  userNameEl.textContent = displayName;
}

function startWatchlistListener(uid) {
  const q = query(
    collection(db, "users", uid, "watchlist"),
    orderBy("addedAt", "desc"),
  );
  onSnapshot(q, (snapshot) => {
    inWatchlist = false;
    watched = false;
    snapshot.forEach((doc) => {
      if (String(doc.data().movieId) === String(movieId)) {
        inWatchlist = true;
        watched = doc.data().watched || false;
      }
    });
    updateButtons();
  });
}

async function loadDetail() {
  loadingEl.classList.remove("hidden");
  container.classList.add("hidden");

  try {
    movieData = await fetchMovieDetail(movieId);
    renderDetail(movieData);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="empty-state error">${err.message}</div>`;
  } finally {
    loadingEl.classList.add("hidden");
    container.classList.remove("hidden");
  }
}

function renderDetail(m) {
  const footerYear = document.getElementById("year");
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  const poster = m.poster_path
    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";
  posterImg.src = poster;
  posterImg.alt = m.title;

  titleEl.textContent = m.title;
  taglineEl.textContent = m.tagline || "";
  ratingEl.textContent = `★ ${m.vote_average.toFixed(1)}`;
  yearEl.textContent = m.release_date ? m.release_date.slice(0, 4) : "-";
  runtimeEl.textContent = m.runtime ? `${m.runtime} menit` : "-";
  genresEl.innerHTML = (m.genres || [])
    .map((g) => `<span class="genre-chip">${g.name}</span>`)
    .join("");
  overviewEl.textContent = m.overview || "Tidak ada sinopsis.";
}

function updateButtons() {
  if (inWatchlist) {
    wlBtn.textContent = "♥ Hapus dari Watchlist";
    wlBtn.classList.add("in-watchlist");
  } else {
    wlBtn.textContent = "♡ Tambah ke Watchlist";
    wlBtn.classList.remove("in-watchlist");
  }

  if (watched) {
    wtBtn.innerHTML = "&#10003; Sudah Ditonton";
    wtBtn.classList.add("watched");
  } else {
    wtBtn.innerHTML = "&#9711; Tandai Ditonton";
    wtBtn.classList.remove("watched");
  }
}

async function handleWatchlistToggle() {
  const uid = auth.currentUser.uid;
  const ref = doc(db, "users", uid, "watchlist", String(movieId));

  if (inWatchlist) {
    await deleteDoc(ref);
    showToast("Dihapus dari watchlist");
  } else {
    await setDoc(ref, {
      movieId: Number(movieId),
      title: movieData.title,
      poster_path: movieData.poster_path || "",
      vote_average: movieData.vote_average,
      release_date: movieData.release_date || "",
      addedAt: serverTimestamp(),
      watched: false,
    });
    showToast("Ditambahkan ke watchlist");
  }
}

async function handleWatchedToggle() {
  const uid = auth.currentUser.uid;
  const ref = doc(db, "users", uid, "watchlist", String(movieId));

  if (!inWatchlist) {
    await setDoc(ref, {
      movieId: Number(movieId),
      title: movieData.title,
      poster_path: movieData.poster_path || "",
      vote_average: movieData.vote_average,
      release_date: movieData.release_date || "",
      addedAt: serverTimestamp(),
      watched: true,
    });
    showToast("Ditambahkan dan ditandai sudah ditonton");
  } else {
    await setDoc(ref, { watched: !watched }, { merge: true });
  }
}

document.addEventListener("DOMContentLoaded", init);
