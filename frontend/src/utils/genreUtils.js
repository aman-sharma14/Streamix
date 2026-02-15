// Genre utility to map genre IDs to names
let genresCache = null;

export const loadGenres = async () => {
    if (genresCache) return genresCache;

    try {
        const movieService = (await import('../services/movieService')).default;
        const genres = await movieService.getGenres();

        // Create a map for quick lookup - use tmdbId for numeric lookup
        genresCache = genres.reduce((acc, genre) => {
            acc[genre.tmdbId] = genre.name;
            return acc;
        }, {});

        return genresCache;
    } catch (error) {
        console.error('Error loading genres:', error);
        return {};
    }
};

export const getGenreNames = (genreIds, genresMap) => {
    if (!genreIds || !genresMap) return '';

    return genreIds
        .map(id => genresMap[id])
        .filter(Boolean)
        .slice(0, 3) // Show max 3 genres
        .join(' • ');
};

export const getGenreNamesArray = (genreIds, genresMap) => {
    if (!genreIds || !genresMap) return [];

    return genreIds
        .map(id => genresMap[id])
        .filter(Boolean);
};
