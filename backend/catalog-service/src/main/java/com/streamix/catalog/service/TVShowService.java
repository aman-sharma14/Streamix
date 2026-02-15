package com.streamix.catalog.service;

import com.streamix.catalog.dto.TmdbTVResponse;
import com.streamix.catalog.dto.TmdbVideosResponse;
import com.streamix.catalog.entity.TVShow;
import com.streamix.catalog.repository.TVShowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TVShowService {

    private final TVShowRepository repository;
    private final RestTemplate restTemplate;

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Value("${tmdb.api.base-url}")
    private String baseUrl;

    /**
     * Load initial TV shows (500+ items)
     */
    public void loadInitialTVShows() {
        long count = repository.count();
        if (count > 0) {
            System.out.println("Database already has " + count + " TV shows. Skipping initial load...");
            return;
        }

        System.out.println("\n========================================");
        System.out.println("   LARGE-SCALE TV SHOW LOADING");
        System.out.println("   Target: 500+ TV shows");
        System.out.println("========================================\n");

        int totalAdded = 0;

        // Popular TV (100 items - 5 pages)
        System.out.println("📊 Fetching Popular TV Shows...");
        totalAdded += fetchFromEndpoint("/tv/popular", 5, "Popular TV");

        // Top Rated TV (100 items - 5 pages)
        System.out.println("\n⭐ Fetching Top Rated TV Shows...");
        totalAdded += fetchFromEndpoint("/tv/top_rated", 5, "Top Rated TV");

        // Trending TV (50 items - 3 pages)
        System.out.println("\n🔥 Fetching Trending TV Shows...");
        totalAdded += fetchFromEndpoint("/trending/tv/day", 3, "Trending TV");

        // Genre-based TV Shows (50 items each)
        System.out.println("\n📺 Fetching Genre-based TV Shows...");

        // Action & Adventure (10759)
        totalAdded += fetchFromEndpoint("/discover/tv?with_genres=10759&sort_by=popularity.desc", 3, "Action TV");

        // Comedy (35)
        totalAdded += fetchFromEndpoint("/discover/tv?with_genres=35&sort_by=popularity.desc", 3, "Comedy TV");

        // Drama (18)
        totalAdded += fetchFromEndpoint("/discover/tv?with_genres=18&sort_by=popularity.desc", 3, "Drama TV");

        // Sci-Fi & Fantasy (10765)
        totalAdded += fetchFromEndpoint("/discover/tv?with_genres=10765&sort_by=popularity.desc", 3, "Sci-Fi TV");

        // Crime (80)
        totalAdded += fetchFromEndpoint("/discover/tv?with_genres=80&sort_by=popularity.desc", 3, "Crime TV");

        System.out.println("\n========================================");
        System.out.println("✅ TV show loading completed!");
        System.out.println("   Total TV shows added: " + totalAdded);
        System.out.println("========================================\n");
    }

    /**
     * Fetch TV shows from TMDB endpoint
     */
    private int fetchFromEndpoint(String endpoint, int pages, String category) {
        int added = 0;

        for (int page = 1; page <= pages; page++) {
            try {
                String url = baseUrl + endpoint +
                        (endpoint.contains("?") ? "&" : "?") +
                        "api_key=" + apiKey + "&page=" + page;

                TmdbTVResponse response = restTemplate.getForObject(url, TmdbTVResponse.class);

                if (response != null && response.getResults() != null) {
                    for (TmdbTVResponse.TmdbTVDto dto : response.getResults()) {
                        try {
                            // Check if already exists
                            if (repository.findByTmdbId(dto.getId()).isPresent()) {
                                continue;
                            }

                            TVShow tvShow = createTVShowFromDto(dto, category);
                            repository.save(tvShow);
                            added++;
                        } catch (Exception e) {
                            System.err.println("  Error processing TV show: " + e.getMessage());
                        }
                    }
                }

                System.out.println("  Page " + page + "/" + pages + " - Added: " + added);

                // Rate limiting
                Thread.sleep(500);

            } catch (Exception e) {
                System.err.println("  Error fetching page " + page + ": " + e.getMessage());
            }
        }

        System.out.println(category + " complete: " + added + " TV shows added");
        return added;
    }

    /**
     * Create TVShow entity from TMDB DTO
     */
    private TVShow createTVShowFromDto(TmdbTVResponse.TmdbTVDto dto, String category) {
        TVShow tvShow = new TVShow();
        tvShow.setTmdbId(dto.getId());
        tvShow.setTitle(dto.getName());
        tvShow.setName(dto.getName());
        tvShow.setOverview(dto.getOverview());
        tvShow.setPopularity(dto.getPopularity());
        tvShow.setVoteAverage(dto.getVoteAverage());
        tvShow.setGenreIds(dto.getGenreIds());
        tvShow.setCategory(category);
        tvShow.setCategories(Arrays.asList(category));
        tvShow.setType("tv");
        tvShow.setCachedAt(LocalDateTime.now());

        // Poster URL
        if (dto.getPosterPath() != null) {
            tvShow.setPosterUrl("https://image.tmdb.org/t/p/w500" + dto.getPosterPath());
        }

        // Backdrop URL
        if (dto.getBackdropPath() != null) {
            tvShow.setBackdropUrl("https://image.tmdb.org/t/p/original" + dto.getBackdropPath());
        }

        // Release year
        if (dto.getFirstAirDate() != null && !dto.getFirstAirDate().isEmpty()) {
            tvShow.setFirstAirDate(dto.getFirstAirDate());
            tvShow.setReleaseYear(Integer.parseInt(dto.getFirstAirDate().substring(0, 4)));
        }

        // Fetch trailer URL
        String trailerUrl = fetchTrailerUrl(dto.getId(), "tv");
        tvShow.setVideoUrl(trailerUrl != null ? trailerUrl
                : "https://www.youtube.com/results?search_query=" + dto.getName() + "+trailer");

        return tvShow;
    }

    /**
     * Fetch trailer URL from TMDB videos endpoint
     */
    private String fetchTrailerUrl(Integer tmdbId, String type) {
        try {
            String url = baseUrl + "/" + type + "/" + tmdbId + "/videos?api_key=" + apiKey;
            TmdbVideosResponse response = restTemplate.getForObject(url, TmdbVideosResponse.class);

            if (response != null && response.getResults() != null) {
                return response.getResults().stream()
                        .filter(v -> "Trailer".equals(v.getType()) && "YouTube".equals(v.getSite()))
                        .findFirst()
                        .map(v -> "https://www.youtube.com/watch?v=" + v.getKey())
                        .orElse(null);
            }
        } catch (Exception e) {
            // Silently fail, will use search URL as fallback
        }
        return null;
    }

    // Basic CRUD operations
    public List<TVShow> getAllTVShows() {
        return repository.findAll();
    }

    public List<TVShow> getPopularTVShows() {
        return repository.findByCategoriesContaining("Popular TV");
    }

    public List<TVShow> getTopRatedTVShows() {
        return repository.findByCategoriesContaining("Top Rated TV");
    }

    public List<TVShow> getTrendingTVShows() {
        return repository.findByCategoriesContaining("Trending TV");
    }

    public java.util.Optional<TVShow> getTVShowById(String id) {
        return repository.findById(id);
    }

    /**
     * Refresh a specific category (used by scheduled jobs)
     */
    public void refreshCategory(String endpoint, int pages, String category) {
        System.out.println("Refreshing category: " + category);
        fetchFromEndpoint(endpoint, pages, category);
    }

    /**
     * Fetch cast for a TV Show
     */
    public java.util.List<com.streamix.catalog.dto.TmdbCreditsResponse.CastMember> getTVShowCast(Integer tmdbId) {
        try {
            String url = baseUrl + "/tv/" + tmdbId + "/credits?api_key=" + apiKey;
            com.streamix.catalog.dto.TmdbCreditsResponse response = restTemplate.getForObject(url,
                    com.streamix.catalog.dto.TmdbCreditsResponse.class);

            if (response != null && response.getCast() != null) {
                // Return top 10 cast members
                return response.getCast().stream()
                        .limit(10)
                        .collect(java.util.stream.Collectors.toList());
            }
        } catch (Exception e) {
            System.err.println("Error fetching cast for TMDB ID " + tmdbId + ": " + e.getMessage());
        }

        return java.util.Collections.emptyList();
    }

    /**
     * Get similar TV shows based on genre matching
     */
    public List<TVShow> getSimilarTVShows(Integer tmdbId) {
        java.util.Optional<TVShow> currentShow = repository.findByTmdbId(tmdbId);

        if (currentShow.isEmpty() || currentShow.get().getGenreIds() == null) {
            // Fallback: return popular TV
            return getPopularTVShows().stream().limit(6).collect(java.util.stream.Collectors.toList());
        }

        List<Integer> genreIds = currentShow.get().getGenreIds();

        // Find shows with at least one matching genre
        List<TVShow> allShows = repository.findAll();

        return allShows.stream()
                .filter(s -> !s.getTmdbId().equals(tmdbId)) // Exclude current show
                .filter(s -> s.getGenreIds() != null &&
                        s.getGenreIds().stream().anyMatch(genreIds::contains)) // Has matching genre
                .sorted((s1, s2) -> {
                    // Sort by number of matching genres, then by popularity
                    long matches1 = s1.getGenreIds().stream().filter(genreIds::contains).count();
                    long matches2 = s2.getGenreIds().stream().filter(genreIds::contains).count();

                    if (matches1 != matches2) {
                        return Long.compare(matches2, matches1); // More matches first
                    }

                    return Double.compare(
                            s2.getPopularity() != null ? s2.getPopularity() : 0.0,
                            s1.getPopularity() != null ? s1.getPopularity() : 0.0);
                })
                .limit(6)
                .collect(java.util.stream.Collectors.toList());
    }
}
