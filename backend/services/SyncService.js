import { MovieModel } from '../models/MovieModel.js'
import { ActorModel } from '../models/ActorModel.js'
import { fetchFromTMDB, createMovieObj } from '../utils/tmdbHelper.js'

let isSyncInProgress = false;

const syncStats = {
    lastSyncStart: null,
    lastSyncComplete: null,
    lastCategory: null,
    totalInserted: 0,
    totalUpdated: 0,
    totalErrors: 0,
    status: 'IDLE'
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isValidTMDBMovie = (movie) => {
    if (!movie || typeof movie !== 'object') return false;
    if (!movie.id || isNaN(movie.id)) return false;
    if (!movie.title || typeof movie.title !== 'string') return false;
    if (typeof movie.popularity !== 'number') return false;
    if (typeof movie.vote_average !== 'number') return false;
    return true;
};

// Safe update fields for Category Sync (A & B)
const getCategoryUpdateFields = (movie) => {
    return {
        popularity: movie.popularity,
        rating: movie.vote_average,
        voteCount: movie.vote_count,
        releaseDate: movie.release_date,
        // averageRating and totalReviews are explicitly excluded
    };
};

export const syncCategory = async (tmdbPath, categoryLabel, pages = 3, dryRun = false) => {
    if (isSyncInProgress) {
        throw new Error("Synchronization already in progress");
    }

    isSyncInProgress = true;
    syncStats.status = 'SYNCING_CATEGORY';
    syncStats.lastCategory = categoryLabel;
    syncStats.lastSyncStart = new Date();

    const result = {
        category: categoryLabel,
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        durationMs: 0
    };

    const startTime = Date.now();

    try {
        for (let page = 1; page <= pages; page++) {
            const pathWithPage = tmdbPath.includes('?') ? `${tmdbPath}&page=${page}` : `${tmdbPath}?page=${page}`;
            const response = await fetchFromTMDB(pathWithPage);
            const movies = response.results || [];

            for (const movie of movies) {
                if (!isValidTMDBMovie(movie)) {
                    console.log(`[SYNC] Skipped invalid movie payload: ${movie?.id}`);
                    result.skipped++;
                    continue;
                }

                try {
                    const existingMovie = await MovieModel.findOne({ tmdbId: movie.id });

                    if (existingMovie) {
                        // Update existing movie safely
                        const updateFields = getCategoryUpdateFields(movie);
                        
                        if (!dryRun) {
                            await MovieModel.updateOne(
                                { tmdbId: movie.id },
                                { $set: updateFields }
                            );
                        }
                        result.updated++;
                        syncStats.totalUpdated++;
                    } else {
                        // Insert new movie
                        if (!dryRun) {
                            // Delay to respect TMDB rate limits (createMovieObj makes 6 calls)
                            await delay(200);
                            const movieObj = await createMovieObj(movie);
                            
                            // Double check validity after createMovieObj
                            if (!movieObj || !movieObj.title || !movieObj.tmdbId) {
                                result.skipped++;
                                continue;
                            }

                            const newMovie = new MovieModel(movieObj);
                            await newMovie.save();

                            // Actor upsert logic
                            for (const castMember of newMovie.cast || []) {
                                if (castMember.actor) {
                                    await ActorModel.findByIdAndUpdate(castMember.actor, {
                                        $addToSet: { movies: newMovie._id },
                                        $inc: { movieCount: 1 }
                                    });
                                }
                            }
                        }
                        result.inserted++;
                        syncStats.totalInserted++;
                    }
                } catch (err) {
                    console.error(`[SYNC] Error processing movie ${movie.id}:`, err.message);
                    result.errors++;
                    syncStats.totalErrors++;
                }
            }
        }
    } catch (err) {
        console.error(`[SYNC] Fatal error during category sync ${categoryLabel}:`, err.message);
        throw err;
    } finally {
        isSyncInProgress = false;
        syncStats.status = 'IDLE';
        syncStats.lastSyncComplete = new Date();
        result.durationMs = Date.now() - startTime;
        
        console.log(`[SYNC] ──────────────────────────────────────`);
        console.log(`[SYNC] Category: ${result.category}`);
        console.log(`[SYNC] Inserted: ${result.inserted}`);
        console.log(`[SYNC] Updated:  ${result.updated}`);
        console.log(`[SYNC] Skipped:  ${result.skipped}`);
        console.log(`[SYNC] Errors:   ${result.errors}`);
        console.log(`[SYNC] Duration: ${(result.durationMs / 1000).toFixed(2)}s`);
        console.log(`[SYNC] Dry Run:  ${dryRun}`);
        console.log(`[SYNC] ──────────────────────────────────────`);
    }

    return result;
};

export const syncMetadataBatch = async (batchSize = 50, dryRun = false) => {
    if (isSyncInProgress) {
        throw new Error("Synchronization already in progress");
    }

    isSyncInProgress = true;
    syncStats.status = 'SYNCING_METADATA';
    syncStats.lastCategory = 'metadata-refresh';
    syncStats.lastSyncStart = new Date();

    const result = {
        category: 'metadata-refresh',
        refreshed: 0,
        unchanged: 0,
        errors: 0,
        durationMs: 0
    };

    const startTime = Date.now();

    try {
        // Find movies with oldest updatedAt
        const moviesToRefresh = await MovieModel.find()
            .sort({ updatedAt: 1 })
            .limit(batchSize)
            .select('tmdbId title updatedAt');

        for (const movie of moviesToRefresh) {
            try {
                await delay(250); // Throttle deeply: createMovieObj makes ~6 requests
                
                // Fetch basic info from TMDB to pass into createMovieObj
                // (createMovieObj expects an object with at least .id)
                const tmdbMovieBasic = await fetchFromTMDB(`/movie/${movie.tmdbId}`);
                
                if (!isValidTMDBMovie(tmdbMovieBasic)) {
                    console.log(`[SYNC] Skipped invalid metadata payload: ${movie.tmdbId}`);
                    result.errors++;
                    continue;
                }

                const updatedObj = await createMovieObj({ id: movie.tmdbId });
                
                if (!updatedObj || !updatedObj.title) {
                    result.errors++;
                    continue;
                }

                // Explicitly define fields we want to refresh (Category C)
                // Exclude: averageRating, totalReviews
                const refreshFields = {
                    title: updatedObj.title,
                    overview: updatedObj.overview,
                    shortDescription: updatedObj.shortDescription,
                    genres: updatedObj.genres,
                    language: updatedObj.language,
                    spokenLanguages: updatedObj.spokenLanguages,
                    subtitleLanguages: updatedObj.subtitleLanguages,
                    productionCountries: updatedObj.productionCountries,
                    status: updatedObj.status,
                    releaseDate: updatedObj.releaseDate,
                    releaseYear: updatedObj.releaseYear,
                    runtime: updatedObj.runtime,
                    rating: updatedObj.rating,
                    voteCount: updatedObj.voteCount,
                    popularity: updatedObj.popularity,
                    poster: updatedObj.poster,
                    posterPath: updatedObj.posterPath,
                    posterOriginal: updatedObj.posterOriginal,
                    backdrop: updatedObj.backdrop,
                    backdropPath: updatedObj.backdropPath,
                    backdropOriginal: updatedObj.backdropOriginal,
                    trailer: updatedObj.trailer,
                    trailerKey: updatedObj.trailerKey,
                    trailerEmbedUrl: updatedObj.trailerEmbedUrl,
                    cast: updatedObj.cast,
                    directors: updatedObj.directors,
                    writers: updatedObj.writers,
                    crew: updatedObj.crew,
                    providers: updatedObj.providers,
                    keywords: updatedObj.keywords
                };

                if (!dryRun) {
                    await MovieModel.updateOne(
                        { _id: movie._id },
                        { $set: refreshFields }
                    );
                }
                
                result.refreshed++;
                syncStats.totalUpdated++;

            } catch (err) {
                console.error(`[SYNC] Error refreshing metadata for movie ${movie.tmdbId}:`, err.message);
                result.errors++;
                syncStats.totalErrors++;
            }
        }
    } catch (err) {
        console.error(`[SYNC] Fatal error during metadata refresh:`, err.message);
        throw err;
    } finally {
        isSyncInProgress = false;
        syncStats.status = 'IDLE';
        syncStats.lastSyncComplete = new Date();
        result.durationMs = Date.now() - startTime;
        
        console.log(`[SYNC] ──────────────────────────────────────`);
        console.log(`[SYNC] Category: Metadata Refresh`);
        console.log(`[SYNC] Refreshed: ${result.refreshed}`);
        console.log(`[SYNC] Errors:    ${result.errors}`);
        console.log(`[SYNC] Duration:  ${(result.durationMs / 1000).toFixed(2)}s`);
        console.log(`[SYNC] Dry Run:   ${dryRun}`);
        console.log(`[SYNC] ──────────────────────────────────────`);
    }

    return result;
};

export const getSyncStatus = () => {
    return {
        ...syncStats,
        isSyncInProgress
    };
};
