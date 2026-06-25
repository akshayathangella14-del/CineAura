import cron from 'node-cron';
import { syncCategory, syncMetadataBatch } from '../services/SyncService.js';
import dotenv from 'dotenv';
dotenv.config();

// Category Paths Mapping (must match SyncAPI)
const categoryPaths = {
    'trending': '/trending/movie/week',
    'popular': '/movie/popular',
    'upcoming': '/movie/upcoming',
    'now-playing': '/movie/now_playing',
    'top-rated': '/movie/top_rated'
};

const initScheduler = () => {
    const isCronEnabled = process.env.ENABLE_SYNC_CRON === 'true';

    if (!isCronEnabled) {
        console.log('TMDB Synchronization: Disabled');
        return;
    }

    console.log('TMDB Synchronization: Enabled (TESTING SCHEDULE)');

    // Utility to wrap sync calls in try/catch for isolated execution
    const runCategorySync = async (type, pages = 3) => {
        try {
            console.log(`\n==========================`);
            console.log(`[CRON] ${type.toUpperCase()} Sync Started`);
            console.log(`Time: ${new Date().toLocaleString()}`);
            
            const tmdbPath = categoryPaths[type];
            const result = await syncCategory(tmdbPath, type, pages, false);
            
            if (result.inserted === 0 && result.updated === 0 && result.errors === 0) {
                console.log(`\nNo new movies found.`);
                console.log(`No updates required.`);
            } else {
                console.log(`\nInserted: ${result.inserted}`);
                console.log(`Updated:  ${result.updated}`);
                console.log(`Skipped:  ${result.skipped}`);
                console.log(`Errors:   ${result.errors}`);
            }
            
            console.log(`\nCompleted in ${(result.durationMs / 1000).toFixed(2)}s`);
            console.log(`==========================\n`);
        } catch (error) {
            console.error(`[CRON] Scheduled sync failed for ${type}:`, error.message);
        }
    };

    const runMetadataRefresh = async (batchSize = 50) => {
        try {
            console.log(`\n==========================`);
            console.log(`[CRON] METADATA REFRESH Started`);
            console.log(`Time: ${new Date().toLocaleString()}`);
            
            const result = await syncMetadataBatch(batchSize, false);
            
            if (result.refreshed === 0 && result.errors === 0) {
                console.log(`\nNo metadata updates required.`);
            } else {
                console.log(`\nRefreshed: ${result.refreshed}`);
                console.log(`Errors:    ${result.errors}`);
            }
            
            console.log(`\nCompleted in ${(result.durationMs / 1000).toFixed(2)}s`);
            console.log(`==========================\n`);
        } catch (error) {
            console.error(`[CRON] Scheduled metadata refresh failed:`, error.message);
        }
    };

    // ----------------------------------------------------
    // Schedules (TESTING ONLY)
    // ----------------------------------------------------

    // Trending: Every 1 minute
    cron.schedule('* * * * *', () => {
        runCategorySync('trending', 3);
    });

    // Popular: Every 2 minutes
    cron.schedule('*/2 * * * *', () => {
        runCategorySync('popular', 3);
    });

    // Upcoming: Every 3 minutes
    cron.schedule('*/3 * * * *', () => {
        runCategorySync('upcoming', 3);
    });

    // Now Playing: Every 4 minutes
    cron.schedule('*/4 * * * *', () => {
        runCategorySync('now-playing', 3);
    });

    // Top Rated: Every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        runCategorySync('top-rated', 3);
    });

    // Metadata Refresh: Every 10 minutes
    cron.schedule('*/10 * * * *', () => {
        runMetadataRefresh(50);
    });

    console.log('[CRON] Registered all testing synchronization jobs.');
};

export default initScheduler;
