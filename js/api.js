import { TMDB_API_KEY } from "./config.js";

const BASE_URL = "https://api.themoviedb.org/3";

async function safeFetchJSON(url, errorMsg) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${errorMsg}: ${res.status}`);
  const text = await res.text();
  if (!text) throw new Error(`${errorMsg}: Respon kosong`);
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`${errorMsg}: Data tidak valid`);
  }
}

export async function fetchMoviesByMode(mode, page = 1) {
  const endpoint = {
    now_playing: "/movie/now_playing",
    popular: "/movie/popular",
    top_rated: "/movie/top_rated",
  }[mode];
  return safeFetchJSON(
    `${BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=id-ID&page=${page}&region=ID`,
    "Gagal memuat film",
  );
}

export async function fetchGenres() {
  const data = await safeFetchJSON(
    `${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=id-ID`,
    "Gagal memuat genre",
  );
  return data.genres;
}

export async function searchMovies(query, page = 1) {
  return safeFetchJSON(
    `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=id-ID&query=${encodeURIComponent(query)}&page=${page}&region=ID`,
    "Gagal mencari film",
  );
}

export async function discoverByGenre(genreId, page = 1) {
  return safeFetchJSON(
    `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=id-ID&with_genres=${genreId}&page=${page}&region=ID`,
    "Gagal memuat film berdasarkan genre",
  );
}

export async function fetchMovieDetail(movieId) {
  return safeFetchJSON(
    `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=id-ID`,
    "Gagal memuat detail film",
  );
}
