package com.streamix.catalog.service;

import com.streamix.catalog.dto.*;
import com.streamix.catalog.entity.Genre;
import com.streamix.catalog.entity.Movie;
import com.streamix.catalog.repository.GenreRepository;
import com.streamix.catalog.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MovieService {

    @Autowired
    private MovieRepository repository;

    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${tmdb.api.key}")
    private String apiKey;

    private static final String TMDB_BASE_URL = "https://api.themoviedb.org/3";
    private static final String IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
    private static final String BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";

    /**
     * Load genres on startup (runs once)
     */
    public void loadGenres() {
        if (genreRepository.count() > 0) {
            System.out.println("Genres already loaded. Skipping...");
            return;
        }

        System.out.println("=== LOADING GENRES ===");

        // Load movie genres
        loadGenresForType("movie", "/genre/movie/list");

        // Load TV genres
        loadGenresForType("tv", "/genre/tv/list");

        System.out.println("Genres loaded: " + genreRepository.count());
    }

    private void loadGenresForType(String type, String endpoint) {
        try {
            String url = TMDB_BASE_URL + endpoint + "?api_key=" + apiKey;
            TmdbGenreResponse response = restTemplate.getForObject(url, TmdbGenreResponse.class);

            if (response != null && response.getGenres() != null) {
                for (TmdbGenreResponse.GenreDto genreDto : response.getGenres()) {
                    Genre genre = new Genre();
                    genre.setTmdbId(genreDto.getId());
                    genre.setName(genreDto.getName());
                    genre.setType(type);
                    genreRepository.save(genre);
                }
                System.out.println("Loaded " + response.getGenres().size() + " " + type + " genres");
            }
        } catch (Exception e) {
            System.err.println("Error loading " + type + " genres: " + e.getMessage());
        }
    }

    /**
     * Initial data loading with large-scale caching
     * Fetches 500+ movies from multiple categories
     */
    public void loadInitialMovies() {
        long count = repository.count();
        if (count > 0) {
            System.out.println("Database already has " + count + " movies. Checking cache freshness...");
            checkAndRefreshCache();
            return;
        }

        System.out.println("\n========================================");
        System.out.println("   LARGE-SCALE MOVIE LOADING");
        System.out.println("   Target: 500+ movies");
        System.out.println("========================================\n");

        int totalAdded = 0;

        // Popular Movies (100 items - 5 pages)
        System.out.println("📊 Fetching Popular Movies...");
        totalAdded += fetchFromEndpoint("/movie/popular", 5, "Popular Movies", "movie");

        // Top Rated Movies (100 items - 5 pages)
        System.out.println("\n⭐ Fetching Top Rated Movies...");
        totalAdded += fetchFromEndpoint("/movie/top_rated", 5, "Top Rated Movies", "movie");

        // Trending Movies (50 items - 3 pages)
        System.out.println("\n🔥 Fetching Trending Movies...");
        totalAdded += fetchFromEndpoint("/trending/movie/day", 3, "Trending Movies", "movie");

        // Genre-based Movies (50 items each)
        System.out.println("\n🎬 Fetching Genre-based Movies...");

        // Action (28)
        totalAdded += fetchFromEndpoint("/discover/movie?with_genres=28&sort_by=popularity.desc", 3, "Action Movies",
                "movie");

        // Comedy (35)
        totalAdded += fetchFromEndpoint("/discover/movie?with_genres=35&sort_by=popularity.desc", 3, "Comedy Movies",
                "movie");

        // Drama (18)
        totalAdded += fetchFromEndpoint("/discover/movie?with_genres=18&sort_by=popularity.desc", 3, "Drama Movies",
                "movie");

        // Sci-Fi (878)
        totalAdded += fetchFromEndpoint("/discover/movie?with_genres=878&sort_by=popularity.desc", 3, "Sci-Fi Movies",
                "movie");

        // Horror (27)
        totalAdded += fetchFromEndpoint("/discover/movie?with_genres=27&sort_by=popularity.desc", 3, "Horror Movies",
                "movie");

        System.out.println("\n========================================");
        System.out.println("✅ Movie loading completed!");
        System.out.println("   Total movies added: " + totalAdded);
        System.out.println("========================================\n");
    }

    /**
     * Check cache freshness and refresh if needed
     */
    private void checkAndRefreshCache() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneDayAgo = now.minusDays(1);
        LocalDateTime oneWeekAgo = now.minusWeeks(1);

        // Check if Popular content needs refresh (daily)
        List<Movie> popularMovies = repository.findByCategoriesContaining("Popular Movies");
        if (!popularMovies.isEmpty()) {
            LocalDateTime lastCached = popularMovies.get(0).getCachedAt();
            if (lastCached != null && lastCached.isBefore(oneDayAgo)) {
                System.out.println("Popular content is stale. Refreshing...");
                refreshPopularContent();
            }
        }

        // Check if Top Rated content needs refresh (weekly)
        List<Movie> topRatedMovies = repository.findByCategoriesContaining("Top Rated Movies");
        if (!topRatedMovies.isEmpty()) {
            LocalDateTime lastCached = topRatedMovies.get(0).getCachedAt();
            if (lastCached != null && lastCached.isBefore(oneWeekAgo)) {
                System.out.println("Top Rated content is stale. Refreshing...");
                refreshTopRatedContent();
            }
        }
    }

    private void refreshPopularContent() {
        // Delete old popular movies
        repository.deleteByCategoriesContaining("Popular Movies");

        // Fetch fresh popular movies
        fetchFromEndpoint("/movie/popular", 3, "Popular Movies", "movie");
    }

    private void refreshTopRatedContent() {
        // Delete old top rated movies
        repository.deleteByCategoriesContaining("Top Rated Movies");

        // Fetch fresh top rated movies
        fetchFromEndpoint("/movie/top_rated", 3, "Top Rated Movies", "movie");
    }

    /**
     * Fetch movies from TMDB endpoint with video URLs
     */
    private int fetchFromEndpoint(String endpoint, int pages, String label, String type) {
        int added = 0;
        System.out.println("\nFetching " + label + "...");

        for (int page = 1; page <= pages; page++) {
            String url = TMDB_BASE_URL + endpoint + "?api_key=" + apiKey + "&page=" + page;

            try {
                TmdbResponse response = restTemplate.getForObject(url, TmdbResponse.class);

                if (response != null && response.getResults() != null) {
                    for (TmdbResponse.TmdbMovieDto result : response.getResults()) {
                        if (result.getPosterPath() != null && repository.findByTmdbId(result.getId()).isEmpty()) {
                            Movie movie = createMovieFromDto(result, label, type);
                            repository.save(movie);
                            added++;
                        }
                    }
                }
                System.out.println("  Page " + page + "/" + pages + " - Added: " + added);

                // Rate limiting: 500ms between requests
                Thread.sleep(500);
            } catch (Exception e) {
                System.err.println("  Error fetching page " + page + ": " + e.getMessage());
            }
        }

        System.out.println(label + " complete: " + added + " movies added");
        return added;
    }

    /**
     * Create Movie entity from TMDB DTO
     */
    private Movie createMovieFromDto(TmdbResponse.TmdbMovieDto dto, String category, String type) {
        Movie movie = new Movie();
        movie.setTmdbId(dto.getId());
        movie.setTitle(dto.getTitle());
        movie.setCategory(category);
        movie.setType(type);
        movie.setPosterUrl(IMAGE_BASE_URL + dto.getPosterPath());

        if (dto.getBackdropPath() != null) {
            movie.setBackdropUrl(BACKDROP_BASE_URL + dto.getBackdropPath());
        }

        movie.setPopularity(dto.getPopularity());
        movie.setVoteAverage(dto.getVoteAverage());
        movie.setOverview(dto.getOverview());
        movie.setReleaseDate(dto.getReleaseDate());
        movie.setGenreIds(dto.getGenreIds());
        movie.setCachedAt(LocalDateTime.now());
        movie.setCategories(Arrays.asList(category));

        // Extract year from release date
        if (dto.getReleaseDate() != null && dto.getReleaseDate().length() >= 4) {
            movie.setReleaseYear(Integer.parseInt(dto.getReleaseDate().substring(0, 4)));
        }

        // Fetch trailer URL
        String trailerUrl = fetchTrailerUrl(dto.getId(), type);
        movie.setVideoUrl(trailerUrl);

        return movie;
    }

    /**
     * Fetch trailer URL from TMDB videos endpoint
     */
    private String fetchTrailerUrl(Integer tmdbId, String type) {
        try {
            String url = TMDB_BASE_URL + "/" + type + "/" + tmdbId + "/videos?api_key=" + apiKey;
            TmdbVideosResponse response = restTemplate.getForObject(url, TmdbVideosResponse.class);

            if (response != null && response.getResults() != null) {
                // Priority 1: Official YouTube trailer
                for (TmdbVideosResponse.VideoResult video : response.getResults()) {
                    if ("YouTube".equals(video.getSite()) &&
                            "Trailer".equals(video.getType()) &&
                            Boolean.TRUE.equals(video.getOfficial())) {
                        return "https://www.youtube.com/watch?v=" + video.getKey();
                    }
                }

                // Priority 2: Any YouTube trailer
                for (TmdbVideosResponse.VideoResult video : response.getResults()) {
                    if ("YouTube".equals(video.getSite()) && "Trailer".equals(video.getType())) {
                        return "https://www.youtube.com/watch?v=" + video.getKey();
                    }
                }
            }

            // Add small delay to avoid rate limiting
            Thread.sleep(100);
        } catch (Exception e) {
            System.err.println("Error fetching trailer for TMDB ID " + tmdbId + ": " + e.getMessage());
        }

        // Fallback: return null (frontend can handle missing trailers)
        return null;
    }

    /**
     * Fetch cast for a movie
     */
    public List<TmdbCreditsResponse.CastMember> getMovieCast(Integer tmdbId) {
        try {
            // Determine type from database
            Optional<Movie> movieOpt = repository.findByTmdbId(tmdbId);
            String type = movieOpt.map(Movie::getType).orElse("movie");

            String url = TMDB_BASE_URL + "/" + type + "/" + tmdbId + "/credits?api_key=" + apiKey;
            TmdbCreditsResponse response = restTemplate.getForObject(url, TmdbCreditsResponse.class);

            if (response != null && response.getCast() != null) {
                // Return top 10 cast members
                return response.getCast().stream()
                        .limit(10)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            System.err.println("Error fetching cast for TMDB ID " + tmdbId + ": " + e.getMessage());
        }

        return Collections.emptyList();
    }

    /**
     * Smart search: DB first, TMDB fallback with caching
     */
    public List<Movie> searchMovies(String query) {
        // Search in database first
        List<Movie> results = repository.findByTitleContainingIgnoreCase(query);

        // If found enough results, return
        if (results.size() >= 5) {
            return results;
        }

        // Otherwise, search TMDB and cache results
        try {
            String url = TMDB_BASE_URL + "/search/movie?api_key=" + apiKey + "&query=" + query;
            TmdbResponse response = restTemplate.getForObject(url, TmdbResponse.class);

            if (response != null && response.getResults() != null) {
                for (TmdbResponse.TmdbMovieDto dto : response.getResults()) {
                    // Only add if not already in DB
                    if (dto.getPosterPath() != null && repository.findByTmdbId(dto.getId()).isEmpty()) {
                        Movie movie = createMovieFromDto(dto, "Search Result", "movie");
                        repository.save(movie);
                        results.add(movie);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error searching TMDB: " + e.getMessage());
        }

        return results;
    }

    // Standard CRUD operations
    public List<Movie> getAllMovies() {
        return repository.findAll();
    }

    public Optional<Movie> getMovieById(String id) {
        return repository.findById(id);
    }

    public Optional<Movie> getMovieByTmdbId(Integer tmdbId) {
        return repository.findByTmdbId(tmdbId);
    }

    public List<Movie> getMoviesByCategory(String category) {
        return repository.findByCategory(category);
    }

    public List<Genre> getAllGenres() {
        return genreRepository.findAll();
    }

    public List<Genre> getGenresByType(String type) {
        return genreRepository.findByType(type);
    }

    /**
     * Get popular movies (from categories)
     */
    public List<Movie> getPopularMovies() {
        return repository.findByCategoriesContaining("Popular Movies");
    }

    /**
     * Get top rated movies (from categories)
     */
    public List<Movie> getTopRatedMovies() {
        return repository.findByCategoriesContaining("Top Rated Movies");
    }

    /**
     * Get similar movies based on genre matching
     */
    public List<Movie> getSimilarMovies(Integer tmdbId) {
        Optional<Movie> currentMovie = repository.findByTmdbId(tmdbId);

        if (currentMovie.isEmpty() || currentMovie.get().getGenreIds() == null) {
            // Fallback: return popular movies
            return getPopularMovies().stream().limit(6).collect(Collectors.toList());
        }

        List<Integer> genreIds = currentMovie.get().getGenreIds();

        // Find movies with at least one matching genre
        List<Movie> allMovies = repository.findAll();

        return allMovies.stream()
                .filter(m -> !m.getTmdbId().equals(tmdbId)) // Exclude current movie
                .filter(m -> m.getGenreIds() != null &&
                        m.getGenreIds().stream().anyMatch(genreIds::contains)) // Has matching genre
                .sorted((m1, m2) -> {
                    // Sort by number of matching genres, then by popularity
                    long matches1 = m1.getGenreIds().stream().filter(genreIds::contains).count();
                    long matches2 = m2.getGenreIds().stream().filter(genreIds::contains).count();

                    if (matches1 != matches2) {
                        return Long.compare(matches2, matches1); // More matches first
                    }

                    return Double.compare(
                            m2.getPopularity() != null ? m2.getPopularity() : 0.0,
                            m1.getPopularity() != null ? m1.getPopularity() : 0.0);
                })
                .limit(6)
                .collect(Collectors.toList());
    }

    /**
     * Refresh a specific category (used by scheduled jobs)
     */
    public void refreshCategory(String endpoint, int pages, String category, String type) {
        System.out.println("Refreshing category: " + category);
        fetchFromEndpoint(endpoint, pages, category, type);
    }

    /**
     * Get trending movies
     */
    public List<Movie> getTrendingMovies() {
        return repository.findByCategoriesContaining("Trending Movies");
    }
}
