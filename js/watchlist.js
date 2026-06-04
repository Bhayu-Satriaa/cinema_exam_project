import { auth, db } from "./firebase.js";
import { authGuard, saveUserToFirestore, logout } from "./auth.js";
import { createWatchlistCard, showEmpty, showToast } from "./ui.js";
import {
  doc,
  collection,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let watchlistFilter = "all";
let watchlistMovies = [];

const grid = document.getElementById("watchlist-grid");
const filterChips = document.querySelectorAll(".watchlist-filter .chip");
const avatarEl = document.getElementById("avatar");
const userNameEl = document.getElementById("user-name");
const logoutBtn = document.getElementById("logout-btn");

async function init() {
  const user = await authGuard();
  if (!user) return;

  await saveUserToFirestore(user);
  renderUserProfile(user);

  startWatchlistListener();

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filterChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      watchlistFilter = chip.dataset.filter;
      renderWatchlist();
    });
  });

  grid.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === "watchlist") {
      await removeFromWatchlist(id);
    } else if (action === "watched") {
      await toggleWatched(id);
    }
  });

  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await logout();
    window.location.href = "login.html";
  });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
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

function startWatchlistListener() {
  const uid = auth.currentUser.uid;
  const q = query(
    collection(db, "users", uid, "watchlist"),
    orderBy("addedAt", "desc"),
  );

  onSnapshot(q, (snapshot) => {
    watchlistMovies = [];
    snapshot.forEach((doc) => {
      watchlistMovies.push({ id: doc.id, ...doc.data() });
    });
    renderWatchlist();
  });
}

function renderWatchlist() {
  let movies = [...watchlistMovies];
  if (watchlistFilter === "watched") {
    movies = movies.filter((m) => m.watched);
  } else if (watchlistFilter === "unwatched") {
    movies = movies.filter((m) => !m.watched);
  }

  grid.innerHTML = "";
  if (movies.length === 0) {
    showEmpty(grid, "Watchlist kosong.");
    return;
  }
  movies.forEach((movie) => {
    grid.appendChild(createWatchlistCard(movie));
  });
}

async function removeFromWatchlist(movieId) {
  const uid = auth.currentUser.uid;
  const ref = doc(db, "users", uid, "watchlist", String(movieId));
  await deleteDoc(ref);
  showToast("Dihapus dari watchlist");
}

async function toggleWatched(movieId) {
  const uid = auth.currentUser.uid;
  const ref = doc(db, "users", uid, "watchlist", String(movieId));
  const current = watchlistMovies.find((m) => m.movieId === Number(movieId));
  if (!current) return;

  await setDoc(ref, { watched: !current.watched }, { merge: true });
}

document.addEventListener("DOMContentLoaded", init);
