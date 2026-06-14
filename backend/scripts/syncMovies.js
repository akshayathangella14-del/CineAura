import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import { MONGODB_URL } from '../config/env.js'
import { MovieModel } from '../models/MovieModel.js'
import { ActorModel } from '../models/ActorModel.js'
import { fetchFromTMDB, createMovieObj } from '../utils/tmdbHelper.js'

const targetMovies = 12000
const batchSize = 5

let totalImported = 0
let totalSkipped = 0
let totalExisting = 0

const movieSources = [
    { label: "Hindi", path: "/discover/movie?with_original_language=hi&sort_by=popularity.desc&vote_count.gte=20&include_adult=false", pages: 120 },
   {
    label: "Telugu Top Rated",
    path: "/discover/movie?with_original_language=te&sort_by=vote_average.desc&vote_count.gte=10&include_adult=false",
    pages: 100
},
{
    label: "Telugu Most Voted",
    path: "/discover/movie?with_original_language=te&sort_by=vote_count.desc&include_adult=false",
    pages: 100
},
{
    label: "Telugu Recent",
    path: "/discover/movie?with_original_language=te&primary_release_date.gte=2010-01-01&sort_by=popularity.desc&include_adult=false",
    pages: 100
},
{
    label: "Telugu Thriller",
    path: "/discover/movie?with_original_language=te&with_genres=53&sort_by=popularity.desc&include_adult=false",
    pages: 50
},
{
    label: "Telugu Crime",
    path: "/discover/movie?with_original_language=te&with_genres=80&sort_by=popularity.desc&include_adult=false",
    pages: 50
},
{
    label: "Telugu Mystery",
    path: "/discover/movie?with_original_language=te&with_genres=9648&sort_by=popularity.desc&include_adult=false",
    pages: 50
},
{
    label: "Telugu Horror",
    path: "/discover/movie?with_original_language=te&with_genres=27&sort_by=popularity.desc&include_adult=false",
    pages: 50
},
{
    label: "Telugu Action",
    path: "/discover/movie?with_original_language=te&with_genres=28&sort_by=popularity.desc&include_adult=false",
    pages: 50
},
     { label: "Tamil", path: "/discover/movie?with_original_language=ta&sort_by=popularity.desc&vote_count.gte=10&include_adult=false", pages: 100 },
     { label: "Malayalam", path: "/discover/movie?with_original_language=ml&sort_by=popularity.desc&vote_count.gte=10&include_adult=false", pages: 80 },
     { label: "Kannada", path: "/discover/movie?with_original_language=kn&sort_by=popularity.desc&vote_count.gte=5&include_adult=false", pages: 60 },
     { label: "English", path: "/discover/movie?with_original_language=en&sort_by=popularity.desc&vote_count.gte=100&include_adult=false", pages: 120 },
     { label: "Animation", path: "/discover/movie?with_genres=16&sort_by=popularity.desc&vote_count.gte=50&include_adult=false", pages: 80 },
     { label: "Disney Pixar DreamWorks", path: "/discover/movie?with_genres=16&with_companies=2%7C3%7C521&sort_by=popularity.desc&include_adult=false", pages: 40 },
     { label: "Anime", path: "/discover/movie?with_original_language=ja&with_genres=16&sort_by=popularity.desc&vote_count.gte=20&include_adult=false", pages: 80 },
     { label: "Studio Ghibli", path: "/discover/movie?with_companies=10342&sort_by=popularity.desc&include_adult=false", pages: 10 },
     { label: "Popular", path: "/movie/popular", pages: 80 },
     { label: "Top Rated", path: "/movie/top_rated", pages: 80 },
     { label: "Trending", path: "/trending/movie/week", pages: 30 }
]

// Complete Movie Check
const isCompleteMovie = (movieObj) => {
    if (!movieObj.title) return false
    if (!movieObj.overview) return false
    if (!movieObj.poster) return false
    if (!movieObj.backdrop) return false
    if (!movieObj.genres || movieObj.genres.length === 0) return false
    if (!movieObj.keywords || movieObj.keywords.length === 0) return false

    return true
}

// Save Movie
const saveMovie = async (movie) => {
    try {
        const movieOfDB = await MovieModel.findOne({ tmdbId: movie.id })

        if (movieOfDB) {
            totalExisting++
            return
        }

        const movieObj = await createMovieObj(movie)

        if (!isCompleteMovie(movieObj)) {
            totalSkipped++
            return
        }

        const newMovie = new MovieModel(movieObj)
        await newMovie.save()

        for (const castMember of newMovie.cast || []) {
            if (castMember.actor) {
                await ActorModel.findByIdAndUpdate(castMember.actor, {
                    $addToSet: { movies: newMovie._id },
                    $inc: { movieCount: 1 }
                })
            }
        }

        totalImported++
    } catch (err) {
        totalSkipped++
        console.log(`Skipped movie ${movie.id}: ${err.message}`)
    }
}

// Import Page
const importPage = async (source, page) => {
    try {
        const pagePath = source.path.includes("?")
            ? `${source.path}&page=${page}`
            : `${source.path}?page=${page}`

        const data = await fetchFromTMDB(pagePath)
        const movies = data.results || []

        for (let index = 0; index < movies.length; index = index + batchSize) {
            const batch = movies.slice(index, index + batchSize)

            for (const movie of batch) {
                await saveMovie(movie)
            }
        }

        const totalMovies = await MovieModel.countDocuments()

        console.log(`${source.label} Page ${page} Imported`)
        console.log(`Current Total Movies: ${totalMovies}`)

        return totalMovies
    } catch (err) {
        totalSkipped++
        console.log(`${source.label} Page ${page} Skipped: ${err.message}`)
        return await MovieModel.countDocuments()
    }
}

// Bulk Movie Sync
const syncMovies = async () => {
    try {
        if (!MONGODB_URL) {
            console.log("MONGODB_URL not found")
            return
        }

        await connectDB()

        let totalMoviesInDB = await MovieModel.countDocuments()

        for (const source of movieSources) {
            for (let page = 1; page <= source.pages; page++) {
                if (totalMoviesInDB >= targetMovies) {
                    break
                }

                totalMoviesInDB = await importPage(source, page)
            }

            if (totalMoviesInDB >= targetMovies) {
                break
            }
        }

        totalMoviesInDB = await MovieModel.countDocuments()

        console.log("Bulk Movie Sync Completed")
        console.log(`Total Imported: ${totalImported}`)
        console.log(`Total Skipped: ${totalSkipped}`)
        console.log(`Total Existing: ${totalExisting}`)
        console.log(`Total Movies In Database: ${totalMoviesInDB}`)
    } catch (err) {
        console.log("Bulk movie sync failed", err.message)
    } finally {
        await mongoose.connection.close()
    }
}

syncMovies()
