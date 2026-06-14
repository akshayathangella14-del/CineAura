/**
 * Transforms structured Gemini JSON search intents into MongoDB filters.
 */

export const buildMongoQuery = (intentParams) => {
    if (!intentParams) return {};

    const conditions = [];
    const sortObj = { popularity: -1 };

    // Exact or Fuzzy Title match
    if (intentParams.movieTitle) {
        // If it's a specific search, we allow broader regex in DB, then we can fuzzy sort in memory
        // For mongo, we break into words and ensure they match somewhere
        const words = intentParams.movieTitle.split(' ').filter(w => w.trim() !== '');
        if (words.length > 0) {
            const titleConditions = words.map(w => ({
                title: { $regex: w, $options: "i" }
            }));
            // Use $and so all words must be in the title
            conditions.push({ $and: titleConditions });
        }
    }

    // Actor Match
    if (intentParams.actorName) {
    conditions.push({
        "cast.name": {
            $regex: intentParams.actorName.trim(),
            $options: "i"
        }
    });
}

    // Language Match
    if (intentParams.language) {
        conditions.push({ language: { $regex: `^${intentParams.language}$`, $options: "i" } });
    }

    // Genre Match
if (intentParams.genres && intentParams.genres.length > 0) {
    conditions.push({
        genres: {
            $all: intentParams.genres.map(
                g => new RegExp(`^${g}$`, "i")
            )
        }
    });
}

    // Keywords Match
    if (intentParams.keywords && intentParams.keywords.length > 0) {
        const keywordRegexes = intentParams.keywords.map(k => new RegExp(k, "i"));
        // Check keywords OR overview OR title for these concepts
        const keywordOr = intentParams.keywords.map(k => ({
            $or: [
                { keywords: { $regex: k, $options: "i" } },
                { overview: { $regex: k, $options: "i" } },
                { title: { $regex: k, $options: "i" } }
            ]
        }));
        conditions.push({ $or: keywordOr });
    }

    // Year Match
    if (intentParams.year) {
    conditions.push({
        releaseDate: {
            $regex: `^${intentParams.year}`
        }
    });
}

    // Sorting
    if (intentParams.sortBy) {
        if (intentParams.sortBy.includes("rating")) {
            sortObj.rating = -1;
            sortObj.voteCount = -1;
        } else if (intentParams.sortBy.includes("release") || intentParams.sortBy.includes("latest") || intentParams.sortBy.includes("new")) {
            sortObj.releaseDate = -1;
        }
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

    return { filter, sortObj };
};
