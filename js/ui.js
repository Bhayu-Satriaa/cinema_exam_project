const IMG_URL = "https://image.tmdb.org/t/p/w500";

export function createMovieCard(movie, inWatchlist = false) {
  const el = document.createElement("div");
  el.className = "movie-card";
  el.setAttribute("data-id", movie.id);

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "TBA";
  const poster = movie.poster_path
    ? `${IMG_URL}${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

  el.innerHTML = `
    <img src="${poster}" alt="${movie.title}" loading="lazy" />
    <button class="bookmark${inWatchlist ? " active" : ""}" data-id="${movie.id}" data-action="watchlist">&#9829;</button>
    <div class="movie-rating">★ ${movie.vote_average.toFixed(1)}</div>
    <div class="movie-meta">
      <h4 class="movie-title">${movie.title}</h4>
      <div class="movie-sub">${year}</div>
    </div>`;

  el.addEventListener("click", (e) => {
    if (e.target.closest(".bookmark")) return;
    window.location.href = `detail.html?id=${movie.id}`;
  });

  return el;
}

export function createWatchlistCard(movie) {
  const el = document.createElement("div");
  el.className = "movie-card watchlist-card";
  el.setAttribute("data-id", movie.movieId);

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "TBA";
  const poster = movie.poster_path
    ? `${IMG_URL}${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

  const titleHTML = movie.watched
    ? `<s>${movie.title}</s>`
    : movie.title;

  el.innerHTML = `
    <img src="${poster}" alt="${movie.title}" loading="lazy" />
    <button class="bookmark active" data-id="${movie.movieId}" data-action="watchlist">&#9829;</button>
    <button class="watched-badge${movie.watched ? " active" : ""}" data-id="${movie.movieId}" data-action="watched">
      ${movie.watched ? "&#10003;" : "&#9711;"}
    </button>
    <div class="movie-rating">★ ${movie.vote_average.toFixed(1)}</div>
    <div class="movie-meta">
      <h4 class="movie-title">${titleHTML}</h4>
      <div class="movie-sub">${year}</div>
    </div>`;

  el.addEventListener("click", (e) => {
    if (e.target.closest(".bookmark") || e.target.closest(".watched-badge")) return;
    window.location.href = `detail.html?id=${movie.movieId}`;
  });

  return el;
}

export function showLoading(container) {
  container.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Memuat...</p>
    </div>`;
}

export function showEmpty(container, message = "Tidak ada film ditemukan.") {
  container.innerHTML = `<div class="empty-state"><p>${message}</p></div>`;
}

export function showError(container, message = "Terjadi kesalahan.") {
  container.innerHTML = `<div class="empty-state error"><p>${message}</p></div>`;
}

export function showToast(message, type = "info") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
