import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import { verifyAdmin } from '../middlewares/verifyAdmin.js'
import { syncCategory, syncMetadataBatch, getSyncStatus } from '../services/SyncService.js'

export const syncApp = exp.Router()

// Category Paths Mapping
const categoryPaths = {
    'trending': '/trending/movie/week',
    'popular': '/movie/popular',
    'upcoming': '/movie/upcoming',
    'now-playing': '/movie/now_playing',
    'top-rated': '/movie/top_rated'
}

// Sync Category Endpoint
syncApp.post("/admin/sync/category/:type", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { type } = req.params;
        const tmdbPath = categoryPaths[type];
        
        if (!tmdbPath) {
            return res.status(400).json({ message: "Invalid sync category type" });
        }

        const pages = Number(req.query.pages) || 3;
        const dryRun = req.query.dryRun === 'true';

        // We await the result to give immediate feedback to the admin
        const result = await syncCategory(tmdbPath, type, pages, dryRun);

        res.status(200).json({
            message: `Sync Complete: ${type}`,
            payload: result
        });
    } catch (err) {
        if (err.message === "Synchronization already in progress") {
            return res.status(409).json({ message: err.message });
        }
        res.status(500).json({ message: "Sync failed", error: err.message });
    }
});

// Sync Metadata Batch Endpoint
syncApp.post("/admin/sync/metadata", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const batchSize = Number(req.query.limit) || Number(req.query.batchSize) || 50;
        const dryRun = req.query.dryRun === 'true';

        const result = await syncMetadataBatch(batchSize, dryRun);

        res.status(200).json({
            message: "Metadata Refresh Complete",
            payload: result
        });
    } catch (err) {
        if (err.message === "Synchronization already in progress") {
            return res.status(409).json({ message: err.message });
        }
        res.status(500).json({ message: "Metadata refresh failed", error: err.message });
    }
});

// Get Sync Status
syncApp.get("/admin/sync/status", verifyToken, verifyAdmin, (req, res) => {
    try {
        const status = getSyncStatus();
        res.status(200).json({
            message: "Sync Status Fetched",
            payload: status
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch status", error: err.message });
    }
});
