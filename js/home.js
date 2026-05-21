import { TMDB_API_KEY } from "./config.js";
const API_KEY = TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

async function fetchMovies() {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}`,
    );
    const data = await response.json();
    displayMovies(data.results);
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}

function createMovieCard(m) {
  const el = document.createElement("div");
  el.className = "movie-card";
  const year = m.release_date ? m.release_date.slice(0, 4) : "TBA";
  const poster = m.poster_path
    ? `${IMG_URL}${m.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

  el.innerHTML = `
        <img src="${poster}" alt="${m.title}" />
        <div class="movie-rating">★ ${m.vote_average.toFixed(1)}</div>
        <div class="movie-meta">
          <h4 class="movie-title">${m.title}</h4>
          <div class="movie-sub">${year}</div>
        </div>`;
  return el;
}

function displayMovies(movies) {
  const container = document.getElementById("movies-container");
  if (!container) return;
  container.innerHTML = "";
  container.classList.add("movies-grid");
  movies.forEach((movie) => {
    container.appendChild(createMovieCard(movie));
  });
}

function initHome() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
  fetchMovies();
}

document.addEventListener("DOMContentLoaded", () => {
  initHome();
});
