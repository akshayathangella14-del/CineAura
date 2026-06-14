import {
    tmdbApiKey,
    tmdbBaseUrl,
    tmdbImageUrl,
    tmdbPosterSize,
    tmdbBackdropSize
} from '../config/tmdb.js'
import { ActorModel } from '../models/ActorModel.js'

const tmdbOriginalSize = "original"

// TMDB Request
export const fetchFromTMDB = async (path) => {
    if (!tmdbApiKey) {
        throw new Error("TMDB_API_KEY not found")
    }

    const joinChar = path.includes("?") ? "&" : "?"
    const res = await fetch(`${tmdbBaseUrl}${path}${joinChar}api_key=${tmdbApiKey}`)

    if (!res.ok) {
        throw new Error("TMDB request failed")
    }

    return await res.json()
}

// TMDB Image
export const getTMDBImage = (path, size) => {
    if (!path) return ""

    return `${tmdbImageUrl}/${size}${path}`
}

// Short Description
const getShortDescription = (overview) => {
    if (!overview) return ""

    const cleanOverview = overview.replace(/\s+/g, " ").trim()
    const firstSentence = cleanOverview.split(".")[0]

    if (firstSentence && firstSentence.length <= 180) {
        return firstSentence.endsWith(".") ? firstSentence : `${firstSentence}.`
    }

    const slicedText = cleanOverview.slice(0, 180)
    const lastSpace = slicedText.lastIndexOf(" ")
    const shortText = lastSpace > 120 ? slicedText.slice(0, lastSpace) : slicedText

    return shortText.endsWith(".") ? shortText : `${shortText}...`
}

// Release Year
const getReleaseYear = (releaseDate) => {
    if (!releaseDate) return null

    const year = Number(releaseDate.split("-")[0])

    return year || null
}

// Provider List
const getProvidersList = (providerRegion) => {
    const providersList = []
    const providerTypes = ["flatrate", "rent", "buy", "free", "ads"]

    for (const type of providerTypes) {
        const providers = providerRegion[type] || []

        for (const provider of providers) {
            providersList.push({
                providerName: provider.provider_name,
                logoUrl: getTMDBImage(provider.logo_path, tmdbPosterSize),
                watchUrl: providerRegion.link || "",
                type
            })
        }
    }

    return providersList
}

const mapSpokenLanguages = (spokenLanguages = []) =>
    spokenLanguages
        .map((item) => item.english_name || item.name || item.iso_639_1)
        .filter(Boolean)

const mapSubtitleLanguages = (translations = []) =>
    [...new Set(
        translations
            .map((item) => item.english_name || item.name || item.iso_639_1)
            .filter(Boolean)
    )]

const mapProductionCountries = (countries = []) =>
    countries
        .map((item) => item.name || item.iso_3166_1)
        .filter(Boolean)

export const fetchMovieLanguageMetadata = async (tmdbId) => {
    const movieDetails = await fetchFromTMDB(`/movie/${tmdbId}`)
    let movieTranslations = { translations: [] }

    try {
        movieTranslations = await fetchFromTMDB(`/movie/${tmdbId}/translations`)
    } catch {
        movieTranslations = { translations: [] }
    }

    return {
        spokenLanguages: mapSpokenLanguages(movieDetails.spoken_languages),
        subtitleLanguages: mapSubtitleLanguages(movieTranslations.translations),
        productionCountries: mapProductionCountries(movieDetails.production_countries),
        status: movieDetails.status || null
    }
}

// Movie Data
export const createMovieObj = async (movie) => {
    const movieDetails = await fetchFromTMDB(`/movie/${movie.id}`)
    const movieCredits = await fetchFromTMDB(`/movie/${movie.id}/credits`)
    const movieVideos = await fetchFromTMDB(`/movie/${movie.id}/videos`)
    const movieProviders = await fetchFromTMDB(`/movie/${movie.id}/watch/providers`)
    const movieKeywords = await fetchFromTMDB(`/movie/${movie.id}/keywords`)
    let movieTranslations = { translations: [] }

    try {
        movieTranslations = await fetchFromTMDB(`/movie/${movie.id}/translations`)
    } catch {
        movieTranslations = { translations: [] }
    }

    const trailer = movieVideos.results?.find(video =>
        video.site === "YouTube" && video.type === "Trailer"
    )

    const directors = movieCredits.crew
        ?.filter(member => member.job === "Director")
        .map(member => member.name) || []

    const writers = movieCredits.crew
        ?.filter(member => member.job === "Writer" || member.job === "Screenplay" || member.job === "Story")
        .map(member => member.name) || []

    const crew = movieCredits.crew
        ?.slice(0, 20)
        .map(member => `${member.name} - ${member.job}`) || []

    const providerRegion = movieProviders.results?.IN ||
        movieProviders.results?.US ||
        {}

    const trailerKey = trailer ? trailer.key : ""
    const cast = []

    for (const member of movieCredits.cast?.slice(0, 10) || []) {
        const actor = await ActorModel.findOneAndUpdate(
            { tmdbId: member.id },
            {
                tmdbId: member.id,
                name: member.name,
                profileImage: getTMDBImage(member.profile_path, tmdbPosterSize),
                profilePath: member.profile_path,
                profileOriginal: getTMDBImage(member.profile_path, tmdbOriginalSize),
                popularity: member.popularity
            },
            { upsert: true, new: true }
        )

        cast.push({
            actor: actor._id,
            tmdbId: member.id,
            name: member.name,
            character: member.character,
            profileImageUrl: getTMDBImage(member.profile_path, tmdbPosterSize),
            profilePath: member.profile_path,
            profileOriginal: getTMDBImage(member.profile_path, tmdbOriginalSize)
        })
    }

    return {
        tmdbId: movieDetails.id,
        title: movieDetails.title,
        overview: movieDetails.overview,
        shortDescription: getShortDescription(movieDetails.overview),
        genres: movieDetails.genres?.map(genre => genre.name) || [],
        language: movieDetails.original_language,
        spokenLanguages: mapSpokenLanguages(movieDetails.spoken_languages),
        subtitleLanguages: mapSubtitleLanguages(movieTranslations.translations),
        productionCountries: mapProductionCountries(movieDetails.production_countries),
        status: movieDetails.status || null,
        releaseDate: movieDetails.release_date,
        releaseYear: getReleaseYear(movieDetails.release_date),
        runtime: movieDetails.runtime,
        rating: movieDetails.vote_average,
        voteCount: movieDetails.vote_count,
        popularity: movieDetails.popularity,
        poster: getTMDBImage(movieDetails.poster_path, tmdbPosterSize),
        posterPath: movieDetails.poster_path,
        posterOriginal: getTMDBImage(movieDetails.poster_path, tmdbOriginalSize),
        backdrop: getTMDBImage(movieDetails.backdrop_path, tmdbBackdropSize),
        backdropPath: movieDetails.backdrop_path,
        backdropOriginal: getTMDBImage(movieDetails.backdrop_path, tmdbOriginalSize),
        trailer: trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : "",
        trailerKey,
        trailerEmbedUrl: trailerKey ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1` : "",
        cast,
        directors,
        writers,
        crew,
        providers: getProvidersList(providerRegion),
        keywords: movieKeywords.keywords?.map(keyword => keyword.name) || []
    }
}
