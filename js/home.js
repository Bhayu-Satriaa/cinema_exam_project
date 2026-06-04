import { auth, db } from "./firebase.js";
import { authGuard, saveUserToFirestore, logout } from "./auth.js";
import {
  fetchMoviesByMode,
  fetchGenres,
  searchMovies,
  discoverByGenre,
} from "./api.js";
import {
  createMovieCard,
  showLoading,
  showEmpty,
  showError,
  showToast,
} from "./ui.js";
import {
  doc,
  collection,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentMode = "now_playing";
let currentPage = 1;
let totalPages = 1;
let currentSearchQuery = "";
let currentGenreId = "all";
let watchlistMap = {};
let isLoading = false;
let genres = [];

const container = document.getElementById("movies-container");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");
const genreSelect = document.getElementById("genre");
const modeChips = document.querySelectorAll(".filter-row .chip");
const navItems = document.querySelectorAll(".top-nav .nav-item");
const filmSection = document.getElementById("film-section");
const loadMoreBtn = document.getElementById("load-more");
const avatarEl = document.getElementById("avatar");
const userNameEl = document.getElementById("user-name");
const logoutBtn = document.getElementById("logout-btn");

async function init() {
  const user = await authGuard();
  if (!user) return;

  await saveUserToFirestore(user);
  renderUserProfile(user);

  try {
    genres = await fetchGenres();
    populateGenreSelect();
  } catch (e) {
    console.error("Gagal memuat genre:", e);
  }

  startWatchlistListener();
  loadMovies(true);

  searchBtn.addEventListener("click", () => {
    currentSearchQuery = searchInput.value.trim();
    currentGenreId = genreSelect.value;
    navigateToFilm();
    modeChips.forEach((c) => c.classList.remove("active"));
    loadMovies(true);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchBtn.click();
  });

  genreSelect.addEventListener("change", () => searchBtn.click());

  modeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      currentSearchQuery = "";
      currentGenreId = "all";
      currentMode = chip.dataset.mode;
      searchInput.value = "";
      genreSelect.value = "all";
      navigateToFilm();
      modeChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      loadMovies(true);
    });
  });

  navItems.forEach((item) => {
    const section = item.dataset.section;
    if (section) {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        filmSection.classList.remove("hidden");
        loadMoreBtn.classList.remove("hidden");
        navItems.forEach((i) => {
          i.classList.toggle("active", i.dataset.section === section);
        });
      });
    }
  });

  loadMoreBtn.addEventListener("click", () => {
    if (isLoading) return;
    currentPage++;
    loadMovies(false);
  });

  container.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action='watchlist']");
    if (!btn) return;
    e.preventDefault();
    await toggleWatchlist(btn.dataset.id);
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

function populateGenreSelect() {
  genreSelect.innerHTML =
    '<option value="all">Semua Genre</option>' +
    genres.map((g) => `<option value="${g.id}">${g.name}</option>`).join("");
}

function navigateToFilm() {
  filmSection.classList.remove("hidden");
  loadMoreBtn.classList.remove("hidden");
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.section === "film");
  });
}

async function loadMovies(reset = true) {
  if (isLoading) return;
  isLoading = true;

  if (reset) {
    currentPage = 1;
    showLoading(container);
  }

  try {
    let data;
    if (currentSearchQuery) {
      data = await searchMovies(currentSearchQuery, currentPage);
      if (currentGenreId !== "all") {
        data.results = data.results.filter(
          (m) => m.genre_ids && m.genre_ids.includes(Number(currentGenreId)),
        );
      }
    } else if (currentGenreId !== "all") {
      data = await discoverByGenre(currentGenreId, currentPage);
    } else {
      data = await fetchMoviesByMode(currentMode, currentPage);
    }

    totalPages = data.total_pages || 1;

    if (reset) container.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      showEmpty(container, "Tidak ada film ditemukan.");
      loadMoreBtn.classList.add("hidden");
      return;
    }

    data.results.forEach((movie) => {
      const inWl = watchlistMap[movie.id] != null;
      container.appendChild(createMovieCard(movie, inWl));
    });

    loadMoreBtn.classList.toggle("hidden", currentPage >= totalPages);
  } catch (err) {
    console.error(err);
    if (reset) showError(container, err.message);
    loadMoreBtn.classList.add("hidden");
  } finally {
    isLoading = false;
  }
}

function startWatchlistListener() {
  const uid = auth.currentUser.uid;
  const q = query(
    collection(db, "users", uid, "watchlist"),
    orderBy("addedAt", "desc"),
  );

  onSnapshot(q, (snapshot) => {
    watchlistMap = {};
    snapshot.forEach((doc) => {
      watchlistMap[doc.data().movieId] = doc.data();
    });

    document
      .querySelectorAll("#movies-container .movie-card")
      .forEach((card) => {
        const id = card.dataset.id;
        const btn = card.querySelector(".bookmark");
        if (btn && id) {
          btn.classList.toggle("active", watchlistMap[id] != null);
        }
      });
  });
}

async function toggleWatchlist(movieId) {
  const uid = auth.currentUser.uid;
  const ref = doc(db, "users", uid, "watchlist", String(movieId));

  if (watchlistMap[movieId]) {
    await deleteDoc(ref);
    showToast("Dihapus dari watchlist");
    return;
  }

  const card = document.querySelector(`#movies-container [data-id="${movieId}"]`);
  const titleEl = card?.querySelector(".movie-title");
  const subEl = card?.querySelector(".movie-sub");
  const ratingEl = card?.querySelector(".movie-rating");
  const imgEl = card?.querySelector("img");

  await setDoc(ref, {
    movieId: Number(movieId),
    title: titleEl ? titleEl.textContent.trim() : "Film",
    poster_path:
      imgEl?.src?.startsWith("https://image.tmdb.org")
        ? imgEl.src.replace("https://image.tmdb.org/t/p/w500", "")
        : "",
    vote_average: ratingEl
      ? parseFloat(ratingEl.textContent.replace("★ ", ""))
      : 0,
    release_date: subEl ? subEl.textContent.trim() : "",
    addedAt: serverTimestamp(),
    watched: false,
  });
  showToast("Ditambahkan ke watchlist");
}

document.addEventListener("DOMContentLoaded", init);
