/**
 * ──────────────────────────────────────────────────────────
 * CineAura Manual Sync Script
 * ──────────────────────────────────────────────────────────
 * 
 * Run this anytime to:
 *   1. Add NEW movies from TMDB (trending, popular, upcoming, now-playing, top-rated)
 *   2. Refresh METADATA on existing movies (trailers, ratings, posters, etc.)
 *   3. Sync ACTORS linked to movies
 * 
 * Usage:
 *   node scripts/manualSync.js              → Full sync (categories + metadata + actors)
 *   node scripts/manualSync.js --categories → Only sync new movies from categories
 *   node scripts/manualSync.js --metadata   → Only refresh metadata on existing movies
 *   node scripts/manualSync.js --actors     → Only sync actors
 *   node scripts/manualSync.js --pages 5    → Fetch 5 pages per category (default: 3)
 *   node scripts/manualSync.js --batch 100  → Refresh metadata for 100 movies (default: 50)
 * 
 * ──────────────────────────────────────────────────────────
 */

import mongoose from 'mongoose'
import { config } from 'dotenv'
import { connectDB } from '../config/db.js'
import { MovieModel } from '../models/MovieModel.js'
import { ActorModel } from '../models/ActorModel.js'
import { fetchFromTMDB, createMovieObj, getTMDBImage } from '../utils/tmdbHelper.js'
import { tmdbPosterSize } from '../config/tmdb.js'

config()

// ── CLI Arguments ───────────────────────────────────────
const args = process.argv.slice(2)
const hasFlag = (flag) => args.includes(flag)
const getFlagValue = (flag, defaultVal) => {
    const idx = args.indexOf(flag)
    if (idx !== -1 && args[idx + 1]) return Number(args[idx + 1])
    return defaultVal
}

const runAll = !hasFlag('--categories') && !hasFlag('--metadata') && !hasFlag('--actors')
const runCategories = runAll || hasFlag('--categories')
const runMetadata = runAll || hasFlag('--metadata')
const runActors = runAll || hasFlag('--actors')
const PAGES_PER_CATEGORY = getFlagValue('--pages', 3)
const METADATA_BATCH_SIZE = getFlagValue('--batch', 50)
const ACTOR_BATCH_SIZE = getFlagValue('--actor-batch', 50)

// ── Category Paths ──────────────────────────────────────
const categories = [
    { label: 'Trending', path: '/trending/movie/week' },
    { label: 'Popular', path: '/movie/popular' },
    { label: 'Upcoming', path: '/movie/upcoming' },
    { label: 'Now Playing', path: '/movie/now_playing' },
    { label: 'Top Rated', path: '/movie/top_rated' }
]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ── Validation ──────────────────────────────────────────
const isValidTMDBMovie = (movie) => {
    if (!movie || typeof movie !== 'object') return false
    if (!movie.id || isNaN(movie.id)) return false
    if (!movie.title || typeof movie.title !== 'string') return false
    if (typeof movie.popularity !== 'number') return false
    if (typeof movie.vote_average !== 'number') return false
    return true
}

// ── Pretty Logging ──────────────────────────────────────
const divider = '══════════════════════════════════════════════════'
const thinDivider = '──────────────────────────────────────────────────'

const logHeader = (title) => {
    console.log(`\n${divider}`)
    console.log(`  ${title}`)
    console.log(`  Time: ${new Date().toLocaleString()}`)
    console.log(divider)
}

const logResult = (label, value) => {
    console.log(`  ${label.padEnd(14)} ${value}`)
}

// ══════════════════════════════════════════════════════════
// STEP 1: CATEGORY SYNC (Add New Movies)
// ══════════════════════════════════════════════════════════
const syncCategories = async () => {
    logHeader('STEP 1: CATEGORY SYNC — Adding New Movies')

    const totalResult = { inserted: 0, updated: 0, skipped: 0, errors: 0 }
    const startTime = Date.now()

    for (const category of categories) {
        console.log(`\n${thinDivider}`)
        console.log(`  Category: ${category.label} (${PAGES_PER_CATEGORY} pages)`)
        console.log(thinDivider)

        const catResult = { inserted: 0, updated: 0, skipped: 0, errors: 0 }

        for (let page = 1; page <= PAGES_PER_CATEGORY; page++) {
            try {
                const pathWithPage = category.path.includes('?')
                    ? `${category.path}&page=${page}`
                    : `${category.path}?page=${page}`

                const response = await fetchFromTMDB(pathWithPage)
                const movies = response.results || []

                for (const movie of movies) {
                    if (!isValidTMDBMovie(movie)) {
                        catResult.skipped++
                        continue
                    }

                    try {
                        const existingMovie = await MovieModel.findOne({ tmdbId: movie.id })

                        if (existingMovie) {
                            // Update popularity, rating, vote count for existing movies
                            await MovieModel.updateOne(
                                { tmdbId: movie.id },
                                {
                                    $set: {
                                        popularity: movie.popularity,
                                        rating: movie.vote_average,
                                        voteCount: movie.vote_count,
                                        releaseDate: movie.release_date,
                                        lastTMDBSync: new Date()
                                    }
                                }
                            )
                            catResult.updated++
                        } else {
                            // Insert new movie
                            await delay(200) // Rate limit for createMovieObj (makes 6 TMDB calls)
                            const movieObj = await createMovieObj(movie)

                            if (!movieObj || !movieObj.title || !movieObj.tmdbId) {
                                catResult.skipped++
                                continue
                            }

                            const newMovie = new MovieModel(movieObj)
                            await newMovie.save()

                            // Link actors
                            for (const castMember of newMovie.cast || []) {
                                if (castMember.actor) {
                                    await ActorModel.findByIdAndUpdate(castMember.actor, {
                                        $addToSet: { movies: newMovie._id },
                                        $inc: { movieCount: 1 }
                                    })
                                }
                            }
                            catResult.inserted++
                            console.log(`    ✓ NEW: ${movieObj.title}`)
                        }
                    } catch (err) {
                        catResult.errors++
                        console.log(`    ✗ Error: movie ${movie.id} — ${err.message}`)
                    }
                }

                console.log(`  Page ${page}/${PAGES_PER_CATEGORY}: +${catResult.inserted} new`)
            } catch (err) {
                console.log(`  Page ${page} failed: ${err.message}`)
                catResult.errors++
            }
        }

        // Accumulate
        totalResult.inserted += catResult.inserted
        totalResult.updated += catResult.updated
        totalResult.skipped += catResult.skipped
        totalResult.errors += catResult.errors

        console.log(`\n  ${category.label} Summary:`)
        logResult('Inserted:', catResult.inserted)
        logResult('Updated:', catResult.updated)
        logResult('Skipped:', catResult.skipped)
        logResult('Errors:', catResult.errors)
    }

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1)
    const totalMovies = await MovieModel.countDocuments()

    console.log(`\n${divider}`)
    console.log(`  CATEGORY SYNC COMPLETE`)
    logResult('New Movies:', totalResult.inserted)
    logResult('Updated:', totalResult.updated)
    logResult('Skipped:', totalResult.skipped)
    logResult('Errors:', totalResult.errors)
    logResult('Total in DB:', totalMovies)
    logResult('Duration:', `${durationSec}s`)
    console.log(divider)

    return totalResult
}

// ══════════════════════════════════════════════════════════
// STEP 2: METADATA REFRESH (Update Trailers, Posters, etc.)
// ══════════════════════════════════════════════════════════
const syncMetadata = async () => {
    logHeader(`STEP 2: METADATA REFRESH — Updating ${METADATA_BATCH_SIZE} Oldest Movies`)

    const startTime = Date.now()
    let refreshed = 0
    let unchanged = 0
    let errors = 0

    try {
        // Pick movies with the oldest lastMetadataRefresh (or never refreshed)
        const moviesToRefresh = await MovieModel.find()
            .sort({ lastMetadataRefresh: 1, updatedAt: 1 })
            .limit(METADATA_BATCH_SIZE)

        console.log(`  Found ${moviesToRefresh.length} movies to refresh\n`)

        for (let i = 0; i < moviesToRefresh.length; i++) {
            const movieDoc = moviesToRefresh[i]

            try {
                await delay(250) // Rate limit

                const updatedObj = await createMovieObj({ id: movieDoc.tmdbId })
                if (!updatedObj || !updatedObj.title) {
                    errors++
                    continue
                }

                const changedFields = { lastMetadataRefresh: new Date() }
                const changes = []

                // Compare key fields
                const fieldsToCheck = [
                    ['title', 'Title'],
                    ['tagline', 'Tagline'],
                    ['overview', 'Overview'],
                    ['runtime', 'Runtime'],
                    ['rating', 'Rating'],
                    ['voteCount', 'Vote Count'],
                    ['popularity', 'Popularity'],
                    ['poster', 'Poster'],
                    ['backdrop', 'Backdrop'],
                    ['trailer', 'Trailer'],
                    ['trailerKey', 'Trailer Key'],
                    ['trailerEmbedUrl', 'Trailer Embed'],
                    ['status', 'Status'],
                    ['releaseDate', 'Release Date'],
                    ['language', 'Language']
                ]

                for (const [field, label] of fieldsToCheck) {
                    if (updatedObj[field] !== undefined && updatedObj[field] !== null && updatedObj[field] !== '') {
                        if (updatedObj[field] !== movieDoc[field]) {
                            changedFields[field] = updatedObj[field]
                            // Only log interesting changes (trailers, posters)
                            if (['Trailer', 'Trailer Key', 'Trailer Embed', 'Poster', 'Backdrop', 'Rating'].includes(label)) {
                                if (label === 'Trailer' && !movieDoc[field] && updatedObj[field]) {
                                    changes.push('🎬 Trailer Added!')
                                } else if (label === 'Poster' && !movieDoc[field] && updatedObj[field]) {
                                    changes.push('🖼️ Poster Added!')
                                } else {
                                    changes.push(`${label} updated`)
                                }
                            }
                        }
                    }
                }

                // Also sync: shortDescription, posterPath, posterOriginal, backdropPath, backdropOriginal
                const extraFields = [
                    'shortDescription', 'posterPath', 'posterOriginal',
                    'backdropPath', 'backdropOriginal', 'originalTitle',
                    'releaseYear'
                ]
                for (const field of extraFields) {
                    if (updatedObj[field] !== undefined && updatedObj[field] !== null && updatedObj[field] !== '') {
                        if (updatedObj[field] !== movieDoc[field]) {
                            changedFields[field] = updatedObj[field]
                        }
                    }
                }

                // Arrays: genres, spokenLanguages, directors, writers, keywords, etc.
                const arrayFields = ['genres', 'spokenLanguages', 'subtitleLanguages', 'productionCountries', 'directors', 'writers', 'crew', 'keywords']
                for (const field of arrayFields) {
                    if (updatedObj[field] && updatedObj[field].length > 0) {
                        if (JSON.stringify(updatedObj[field]) !== JSON.stringify(movieDoc[field] || [])) {
                            changedFields[field] = updatedObj[field]
                        }
                    }
                }

                // Cast
                if (updatedObj.cast && updatedObj.cast.length > 0) {
                    const tmdbCastIds = updatedObj.cast.map(c => c.tmdbId).join(',')
                    const dbCastIds = (movieDoc.cast || []).map(c => c.tmdbId).join(',')
                    if (tmdbCastIds !== dbCastIds) {
                        changedFields['cast'] = updatedObj.cast
                        changes.push('Cast updated')
                    }
                }

                // Providers
                if (updatedObj.providers && updatedObj.providers.length > 0) {
                    const tmdbProvNames = updatedObj.providers.map(p => p.providerName).sort().join(',')
                    const dbProvNames = (movieDoc.providers || []).map(p => p.providerName).sort().join(',')
                    if (tmdbProvNames !== dbProvNames) {
                        changedFields['providers'] = updatedObj.providers
                        changes.push('Providers updated')
                    }
                }

                // Apply update
                const hasRealChanges = Object.keys(changedFields).length > 1
                await MovieModel.updateOne({ _id: movieDoc._id }, { $set: changedFields })

                if (hasRealChanges) {
                    refreshed++
                    const changeStr = changes.length > 0 ? ` — ${changes.join(', ')}` : ''
                    console.log(`  [${i + 1}/${moviesToRefresh.length}] ✓ ${movieDoc.title}${changeStr}`)
                } else {
                    unchanged++
                    // Only log every 10th unchanged to reduce noise
                    if ((i + 1) % 10 === 0) {
                        console.log(`  [${i + 1}/${moviesToRefresh.length}] ... no changes`)
                    }
                }
            } catch (err) {
                errors++
                console.log(`  [${i + 1}/${moviesToRefresh.length}] ✗ ${movieDoc.title}: ${err.message}`)
            }
        }
    } catch (err) {
        console.error(`  Fatal error: ${err.message}`)
    }

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log(`\n${divider}`)
    console.log(`  METADATA REFRESH COMPLETE`)
    logResult('Refreshed:', refreshed)
    logResult('Unchanged:', unchanged)
    logResult('Errors:', errors)
    logResult('Duration:', `${durationSec}s`)
    console.log(divider)

    return { refreshed, unchanged, errors }
}

// ══════════════════════════════════════════════════════════
// STEP 3: ACTOR SYNC
// ══════════════════════════════════════════════════════════
const syncActors = async () => {
    logHeader(`STEP 3: ACTOR SYNC — Refreshing ${ACTOR_BATCH_SIZE} Actors`)

    const startTime = Date.now()
    let updated = 0
    let errors = 0

    try {
        const actorsToRefresh = await ActorModel.find()
            .sort({ updatedAt: 1 })
            .limit(ACTOR_BATCH_SIZE)
            .select('_id tmdbId name')

        console.log(`  Found ${actorsToRefresh.length} actors to refresh\n`)

        for (let i = 0; i < actorsToRefresh.length; i++) {
            const actor = actorsToRefresh[i]

            try {
                await delay(200)

                const personData = await fetchFromTMDB(`/person/${actor.tmdbId}`)
                const creditsData = await fetchFromTMDB(`/person/${actor.tmdbId}/movie_credits`)

                const updateFields = {
                    name: personData.name || actor.name,
                    biography: personData.biography,
                    birthday: personData.birthday,
                    placeOfBirth: personData.place_of_birth,
                    popularity: personData.popularity,
                    knownForDepartment: personData.known_for_department
                }

                if (personData.profile_path) {
                    updateFields.profileImage = getTMDBImage(personData.profile_path, tmdbPosterSize)
                    updateFields.profilePath = personData.profile_path
                    updateFields.profileOriginal = getTMDBImage(personData.profile_path, 'original')
                }

                // Link movies that exist in our DB
                const tmdbMovies = (creditsData.cast || []).sort((a, b) => b.popularity - a.popularity)
                const tmdbMovieIds = tmdbMovies.map(m => m.id)
                const existingMovies = await MovieModel.find({ tmdbId: { $in: tmdbMovieIds } }).select('_id tmdbId title poster')

                const existingMovieMap = {}
                existingMovies.forEach(m => { existingMovieMap[m.tmdbId] = m })

                const linkedMoviesIds = []
                const knownForArray = []

                for (const tmdbMovie of tmdbMovies) {
                    const matched = existingMovieMap[tmdbMovie.id]
                    if (matched) {
                        linkedMoviesIds.push(matched._id)
                        if (knownForArray.length < 10) {
                            knownForArray.push({
                                tmdbId: matched.tmdbId,
                                title: matched.title,
                                poster: matched.poster
                            })
                        }
                    }
                }

                updateFields.movies = linkedMoviesIds
                updateFields.movieCount = linkedMoviesIds.length
                updateFields.knownFor = knownForArray

                await ActorModel.updateOne({ _id: actor._id }, { $set: updateFields })
                updated++

                if ((i + 1) % 10 === 0 || i === actorsToRefresh.length - 1) {
                    console.log(`  [${i + 1}/${actorsToRefresh.length}] Updated ${actor.name}`)
                }
            } catch (err) {
                errors++
                console.log(`  [${i + 1}/${actorsToRefresh.length}] ✗ ${actor.name}: ${err.message}`)
            }
        }
    } catch (err) {
        console.error(`  Fatal error: ${err.message}`)
    }

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log(`\n${divider}`)
    console.log(`  ACTOR SYNC COMPLETE`)
    logResult('Updated:', updated)
    logResult('Errors:', errors)
    logResult('Duration:', `${durationSec}s`)
    console.log(divider)

    return { updated, errors }
}

// ══════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════
const main = async () => {
    console.log(`\n${divider}`)
    console.log(`  🎬 CineAura Manual Sync`)
    console.log(`  Started: ${new Date().toLocaleString()}`)
    console.log(`  Mode: ${runAll ? 'FULL SYNC' : [runCategories && 'Categories', runMetadata && 'Metadata', runActors && 'Actors'].filter(Boolean).join(' + ')}`)
    console.log(`  Pages per category: ${PAGES_PER_CATEGORY}`)
    console.log(`  Metadata batch: ${METADATA_BATCH_SIZE}`)
    console.log(divider)

    const mainStart = Date.now()

    try {
        await connectDB()

        const moviesBefore = await MovieModel.countDocuments()
        console.log(`\n  Movies in DB before sync: ${moviesBefore}`)

        if (runCategories) await syncCategories()
        if (runMetadata) await syncMetadata()
        if (runActors) await syncActors()

        const moviesAfter = await MovieModel.countDocuments()

        console.log(`\n${divider}`)
        console.log(`  🎬 CineAura Sync Complete!`)
        console.log(`  Movies before: ${moviesBefore}`)
        console.log(`  Movies after:  ${moviesAfter}`)
        console.log(`  New movies:    ${moviesAfter - moviesBefore}`)
        console.log(`  Total time:    ${((Date.now() - mainStart) / 1000).toFixed(1)}s`)
        console.log(`  Completed:     ${new Date().toLocaleString()}`)
        console.log(divider)
    } catch (err) {
        console.error('\n  ✗ Sync failed:', err.message)
    } finally {
        await mongoose.connection.close()
        console.log('\n  Database connection closed.\n')
    }
}

main()
