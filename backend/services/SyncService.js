import { MovieModel } from '../models/MovieModel.js'
import { ActorModel } from '../models/ActorModel.js'
import { fetchFromTMDB, createMovieObj, getTMDBImage } from '../utils/tmdbHelper.js'
import { tmdbPosterSize } from '../config/tmdb.js'

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
        lastTMDBSync: new Date()
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
        // Find movies with oldest lastMetadataRefresh (or updatedAt as fallback)
        const moviesToRefresh = await MovieModel.find()
            .sort({ lastMetadataRefresh: 1, updatedAt: 1 })
            .limit(batchSize);

        for (const movieDoc of moviesToRefresh) {
            const startMovieTime = Date.now();
            try {
                await delay(250); // Throttle TMDB API

                const tmdbMovieBasic = await fetchFromTMDB(`/movie/${movieDoc.tmdbId}`);
                if (!isValidTMDBMovie(tmdbMovieBasic)) {
                    console.log(`[SYNC] Skipped invalid metadata payload: ${movieDoc.tmdbId}`);
                    result.errors++;
                    continue;
                }

                const updatedObj = await createMovieObj({ id: movieDoc.tmdbId });
                if (!updatedObj || !updatedObj.title) {
                    result.errors++;
                    continue;
                }

                const changedFields = { lastMetadataRefresh: new Date() };
                const logs = [];

                // Helper to safely compare and update primitive fields
                const checkField = (fieldName, tmdbValue, dbValue, logName) => {
                    // Do NOT overwrite with empty values
                    if (tmdbValue !== undefined && tmdbValue !== null && tmdbValue !== "") {
                        if (tmdbValue !== dbValue) {
                            changedFields[fieldName] = tmdbValue;
                            if (logName) {
                                if (typeof tmdbValue === 'number' && typeof dbValue === 'number') {
                                    logs.push(`${logName} Updated (${dbValue} → ${tmdbValue})`);
                                } else {
                                    logs.push(`${logName} Updated`);
                                }
                            }
                        }
                    }
                };

                // Helper for string arrays
                const checkStringArray = (fieldName, tmdbArr, dbArr, logName) => {
                    if (tmdbArr && tmdbArr.length > 0) {
                        const dbArrSafe = dbArr || [];
                        if (JSON.stringify(tmdbArr) !== JSON.stringify(dbArrSafe)) {
                            changedFields[fieldName] = tmdbArr;
                            if (logName) logs.push(`${logName} Updated`);
                        }
                    }
                };

                // Compare Fields
                checkField('title', updatedObj.title, movieDoc.title, 'Title');
                checkField('originalTitle', updatedObj.originalTitle, movieDoc.originalTitle, 'Original Title');
                checkField('tagline', updatedObj.tagline, movieDoc.tagline, 'Tagline');
                checkField('overview', updatedObj.overview, movieDoc.overview, 'Overview');
                checkField('shortDescription', updatedObj.shortDescription, movieDoc.shortDescription, null);
                checkField('status', updatedObj.status, movieDoc.status, 'Status');
                checkField('releaseDate', updatedObj.releaseDate, movieDoc.releaseDate, 'Release Date');
                checkField('releaseYear', updatedObj.releaseYear, movieDoc.releaseYear, null);
                checkField('runtime', updatedObj.runtime, movieDoc.runtime, 'Runtime');
                checkField('rating', updatedObj.rating, movieDoc.rating, 'Rating');
                checkField('voteCount', updatedObj.voteCount, movieDoc.voteCount, 'Vote Count');
                checkField('popularity', updatedObj.popularity, movieDoc.popularity, 'Popularity');
                checkField('poster', updatedObj.poster, movieDoc.poster, 'Poster');
                checkField('posterPath', updatedObj.posterPath, movieDoc.posterPath, null);
                checkField('posterOriginal', updatedObj.posterOriginal, movieDoc.posterOriginal, null);
                checkField('backdrop', updatedObj.backdrop, movieDoc.backdrop, 'Backdrop');
                checkField('backdropPath', updatedObj.backdropPath, movieDoc.backdropPath, null);
                checkField('backdropOriginal', updatedObj.backdropOriginal, movieDoc.backdropOriginal, null);
                checkField('trailer', updatedObj.trailer, movieDoc.trailer, 'Trailer');
                checkField('trailerKey', updatedObj.trailerKey, movieDoc.trailerKey, null);
                checkField('trailerEmbedUrl', updatedObj.trailerEmbedUrl, movieDoc.trailerEmbedUrl, null);
                checkField('language', updatedObj.language, movieDoc.language, 'Language');

                checkStringArray('genres', updatedObj.genres, movieDoc.genres, 'Genres');
                checkStringArray('spokenLanguages', updatedObj.spokenLanguages, movieDoc.spokenLanguages, 'Spoken Languages');
                checkStringArray('subtitleLanguages', updatedObj.subtitleLanguages, movieDoc.subtitleLanguages, 'Subtitle Languages');
                checkStringArray('productionCountries', updatedObj.productionCountries, movieDoc.productionCountries, 'Production Countries');
                checkStringArray('directors', updatedObj.directors, movieDoc.directors, 'Directors');
                checkStringArray('writers', updatedObj.writers, movieDoc.writers, 'Writers');
                checkStringArray('crew', updatedObj.crew, movieDoc.crew, 'Crew');
                checkStringArray('keywords', updatedObj.keywords, movieDoc.keywords, 'Keywords');

                // Complex Array: Cast
                if (updatedObj.cast && updatedObj.cast.length > 0) {
                    const tmdbCastIds = updatedObj.cast.map(c => c.tmdbId).join(',');
                    const dbCastIds = (movieDoc.cast || []).map(c => c.tmdbId).join(',');
                    if (tmdbCastIds !== dbCastIds) {
                        changedFields['cast'] = updatedObj.cast;
                        logs.push(`Cast Updated (${(movieDoc.cast || []).length} → ${updatedObj.cast.length})`);
                    }
                }

                // Complex Array: Providers
                if (updatedObj.providers && updatedObj.providers.length > 0) {
                    const tmdbProvNames = updatedObj.providers.map(p => p.providerName).sort().join(',');
                    const dbProvNames = (movieDoc.providers || []).map(p => p.providerName).sort().join(',');
                    if (tmdbProvNames !== dbProvNames) {
                        changedFields['providers'] = updatedObj.providers;
                        logs.push('Providers Updated');
                    }
                }

                // Execute Update
                const hasRealChanges = Object.keys(changedFields).length > 1; // more than just lastMetadataRefresh

                if (hasRealChanges) {
                    if (!dryRun) {
                        await MovieModel.updateOne(
                            { _id: movieDoc._id },
                            { $set: changedFields }
                        );
                    }
                    
                    console.log(`\n[SYNC]`);
                    console.log(`Movie: ${movieDoc.title}`);
                    logs.forEach(log => console.log(log));
                    console.log(`Completed`);
                    console.log(`Duration: ${((Date.now() - startMovieTime) / 1000).toFixed(1)} seconds`);
                    
                    result.refreshed++;
                    syncStats.totalUpdated++;
                } else {
                    // Only update the refresh timestamp
                    if (!dryRun) {
                        await MovieModel.updateOne(
                            { _id: movieDoc._id },
                            { $set: { lastMetadataRefresh: new Date() } }
                        );
                    }
                    result.unchanged++;
                }

            } catch (err) {
                console.error(`\n[SYNC] Error refreshing metadata for movie ${movieDoc.tmdbId}:`, err.message);
                result.errors++;
                syncStats.totalErrors++;
                // Crucial Rule: continue processing the remaining movies
                continue;
            }
        }
    } catch (err) {
        console.error(`[SYNC] Fatal error during metadata refresh loop:`, err.message);
        throw err;
    } finally {
        isSyncInProgress = false;
        syncStats.status = 'IDLE';
        syncStats.lastSyncComplete = new Date();
        result.durationMs = Date.now() - startTime;
        
        console.log(`\n[SYNC] ──────────────────────────────────────`);
        console.log(`[SYNC] Category: Metadata Refresh`);
        console.log(`[SYNC] Refreshed: ${result.refreshed}`);
        console.log(`[SYNC] Unchanged: ${result.unchanged}`);
        console.log(`[SYNC] Errors:    ${result.errors}`);
        console.log(`[SYNC] Duration:  ${(result.durationMs / 1000).toFixed(2)}s`);
        console.log(`[SYNC] Dry Run:   ${dryRun}`);
        console.log(`[SYNC] ──────────────────────────────────────\n`);
    }

    return result;
};

export const getSyncStatus = () => {
    return {
        ...syncStats,
        isSyncInProgress
    };
};

// ------------------------------------------------------------------
// ACTOR SYNCHRONIZATION
// ------------------------------------------------------------------

export const syncActor = async (actorId, dryRun = false) => {
    const startTime = Date.now();
    const result = { inserted: 0, updated: 0, skipped: 0, errors: 0, durationMs: 0 };

    try {
        const actor = await ActorModel.findById(actorId);
        if (!actor) {
            throw new Error(`Actor ${actorId} not found in database`);
        }

        // Fetch basic info and movie credits
        const personData = await fetchFromTMDB(`/person/${actor.tmdbId}`);
        const creditsData = await fetchFromTMDB(`/person/${actor.tmdbId}/movie_credits`);

        // Category A & B Updates (Basic Info)
        const updateFields = {
            name: personData.name || actor.name,
            biography: personData.biography || actor.biography,
            birthday: personData.birthday || actor.birthday,
            placeOfBirth: personData.place_of_birth || actor.placeOfBirth,
            popularity: personData.popularity || actor.popularity,
            knownForDepartment: personData.known_for_department || actor.knownForDepartment
        };

        if (personData.profile_path) {
            updateFields.profileImage = getTMDBImage(personData.profile_path, tmdbPosterSize);
            updateFields.profilePath = personData.profile_path;
            updateFields.profileOriginal = getTMDBImage(personData.profile_path, 'original');
        }

        // Category C Updates (Credits / Movies)
        const tmdbMovies = creditsData.cast || [];
        tmdbMovies.sort((a, b) => b.popularity - a.popularity); // Sort by popularity

        // Find which of these movies ACTUALLY exist in our database
        const tmdbMovieIds = tmdbMovies.map(m => m.id);
        const existingMovies = await MovieModel.find({ tmdbId: { $in: tmdbMovieIds } }).select('_id tmdbId title poster');

        const existingMovieMap = {};
        existingMovies.forEach(m => {
            existingMovieMap[m.tmdbId] = m;
        });

        const linkedMoviesIds = [];
        const knownForArray = [];

        // Build the updated movies array and knownFor array (top 10 popular existing movies)
        for (const tmdbMovie of tmdbMovies) {
            const matchedMovie = existingMovieMap[tmdbMovie.id];
            if (matchedMovie) {
                linkedMoviesIds.push(matchedMovie._id);
                if (knownForArray.length < 10) {
                    knownForArray.push({
                        tmdbId: matchedMovie.tmdbId,
                        title: matchedMovie.title,
                        poster: matchedMovie.poster
                    });
                }
            }
        }

        updateFields.movies = linkedMoviesIds;
        updateFields.movieCount = linkedMoviesIds.length;
        updateFields.knownFor = knownForArray;

        if (!dryRun) {
            await ActorModel.updateOne({ _id: actor._id }, { $set: updateFields });
        }

        result.updated = 1;
    } catch (err) {
        console.error(`[SYNC] Error syncing actor ${actorId}:`, err.message);
        result.errors = 1;
    }

    result.durationMs = Date.now() - startTime;
    return result;
};

export const syncActorBatch = async (batchSize = 50, dryRun = false) => {
    if (isSyncInProgress) {
        throw new Error("Synchronization already in progress");
    }

    isSyncInProgress = true;
    syncStats.status = 'SYNCING_ACTORS';
    syncStats.lastCategory = 'actors';
    syncStats.lastSyncStart = new Date();

    const result = {
        category: 'actors',
        processed: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        durationMs: 0
    };

    const startTime = Date.now();

    try {
        const actorsToRefresh = await ActorModel.find()
            .sort({ updatedAt: 1 })
            .limit(batchSize)
            .select('_id tmdbId name');

        for (const actor of actorsToRefresh) {
            try {
                await delay(200); // Throttle TMDB rate limit
                const actorResult = await syncActor(actor._id, dryRun);
                
                result.processed++;
                if (actorResult.updated > 0) result.updated++;
                if (actorResult.errors > 0) result.errors++;
            } catch (err) {
                result.errors++;
            }
        }
    } catch (err) {
        console.error(`[SYNC] Fatal error during actor batch sync:`, err.message);
        throw err;
    } finally {
        isSyncInProgress = false;
        syncStats.status = 'IDLE';
        syncStats.lastSyncComplete = new Date();
        result.durationMs = Date.now() - startTime;
        
        console.log(`[SYNC] ──────────────────────────────────────`);
        console.log(`[SYNC] Category: Actors`);
        console.log(`[SYNC] Processed: ${result.processed}`);
        console.log(`[SYNC] Updated:  ${result.updated}`);
        console.log(`[SYNC] Skipped:  ${result.skipped}`);
        console.log(`[SYNC] Errors:   ${result.errors}`);
        console.log(`[SYNC] Duration: ${(result.durationMs / 1000).toFixed(2)}s`);
        console.log(`[SYNC] Dry Run:  ${dryRun}`);
        console.log(`[SYNC] ──────────────────────────────────────`);
    }

    return result;
};
