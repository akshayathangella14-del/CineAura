// Curated cinematic themes for Aura Thematic Gravity.
// Raw TMDB keywords are mapped here; junk keywords are dropped.

export const THEME_BLOCKLIST = new Set([
    "taxi",
    "hotel",
    "city",
    "street",
    "car",
    "phone",
    "new york",
    "new york city",
    "los angeles",
    "london",
    "paris",
    "based on novel or book",
    "based on true story",
    "murder",
    "death",
    "violence",
    "blood",
    "gun",
    "police",
    "detective",
    "friendship",
    "love",
    "woman",
    "man",
    "duringcreditsstinger",
    "aftercreditsstinger"
])

export const THEME_CURATED = {
    isolation: ["isolation", "loneliness", "solitude", "alone", "stranded", "survivor"],
    redemption: ["redemption", "forgiveness", "second chance", "atonement", "guilt"],
    family: ["family", "father", "mother", "parent", "sibling", "brother", "sister"],
    survival: ["survival", "apocalypse", "post-apocalyptic", "disaster", "wilderness"],
    identity: ["identity", "self-discovery", "coming of age", "coming-of-age", "transformation"],
    moralAmbiguity: ["moral ambiguity", "anti hero", "anti-hero", "corruption", "betrayal"],
    hope: ["hope", "inspiration", "uplifting", "dreams", "perseverance"],
    revenge: ["revenge", "vengeance", "rivalry"],
    obsession: ["obsession", "madness", "paranoia", "psychological"],
    sacrifice: ["sacrifice", "heroism", "duty", "honor"]
}

export const STORY_FAMILIES = {
    Emotion: ["drama", "romance", "family"],
    Tension: ["thriller", "mystery", "crime", "horror"],
    Intensity: ["action", "adventure", "war"],
    Imagination: ["science fiction", "sci-fi", "fantasy"],
    Escape: ["comedy", "animation"],
    Discovery: []
}

export const storyFamilyForGenre = (genre = "") => {
    const g = genre.toLowerCase()

    for (const [family, genres] of Object.entries(STORY_FAMILIES)) {
        if (genres.includes(g)) return family
    }

    return "Discovery"
}
