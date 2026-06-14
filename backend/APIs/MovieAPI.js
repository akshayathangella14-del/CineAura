import exp from 'express'
import {
    getMovies,
    searchMovies,
    getSearchSuggestions,
    getTrendingMovies,
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    getMoviePreview,
    getMovieModal,
    getHeroMovie,
    getMovieDetails,
    getSearchMetadata,
    syncMovies
} from '../services/MovieService.js'
import { verifyToken } from '../middlewares/verifyToken.js'
import { verifyAdmin } from '../middlewares/verifyAdmin.js'

export const movieApp = exp.Router()

// Get Movies
movieApp.get("/movies", getMovies)

// Search Movies
movieApp.get("/movies/search", searchMovies)

// Search Suggestions
movieApp.get("/movies/search/suggestions", getSearchSuggestions)

// Search Metadata (Dynamic Genres/Languages/Years)
movieApp.get("/movies/search/metadata", getSearchMetadata)

// Trending Movies
movieApp.get("/movies/trending", getTrendingMovies)

// Popular Movies
movieApp.get("/movies/popular", getPopularMovies)

// Top Rated Movies
movieApp.get("/movies/top-rated", getTopRatedMovies)

// Upcoming Movies
movieApp.get("/movies/upcoming", getUpcomingMovies)

// Hero Movie
movieApp.get("/movies/hero", getHeroMovie)

// Movie Preview
movieApp.get("/movies/preview/:movieId", getMoviePreview)

// Movie Modal
movieApp.get("/movies/modal/:movieId", getMovieModal)

// Movie Details
movieApp.get("/movies/:movieId", getMovieDetails)

// Sync Movies
movieApp.post("/movies/sync", verifyToken, verifyAdmin, syncMovies)
