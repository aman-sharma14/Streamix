package com.streamix.catalog.service;

import com.streamix.catalog.dto.TmdbResponse;
import com.streamix.catalog.entity.Movie;
import com.streamix.catalog.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@Service
public class MovieService {

    @Autowired
    private MovieRepository repository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${tmdb.api.key}")
    private String apiKey;

    /**
     * Optimized initial data loading: Fetch top 2000 popular movies/series from
     * TMDB
     * This runs ONLY on first startup when database is empty
     */
    public void loadInitialMovies() {
        // Check if database already has movies
        long count = repository.count();
        if (count > 0) {
            System.out.println("Database already has " + count + " movies. Skipping initial load.");
            return;
        }

        System.out.println("=== INITIAL MOVIE LOADING ===");
        System.out.println("Fetching top 2000 popular movies from TMDB...");

        int totalMoviesAdded = 0;

        // Fetch from curated TMDB endpoints (500 each = 2000 total)
        totalMoviesAdded += fetchFromEndpoint("/movie/popular", 25, "Popular Movies");
        totalMoviesAdded += fetchFromEndpoint("/movie/top_rated", 25, "Top Rated Movies");
        totalMoviesAdded += fetchFromEndpoint("/tv/popular", 25, "Popular TV Shows");
        totalMoviesAdded += fetchFromEndpoint("/tv/top_rated", 25, "Top Rated TV Shows");

        System.out.println("==============================================");
        System.out.println("Initial load completed! Total movies added: " + totalMoviesAdded);
        System.out.println("==============================================");
    }

    /**
     * Helper method to fetch movies from a specific TMDB endpoint
     */
    private int fetchFromEndpoint(String endpoint, int pages, String label) {
        int added = 0;
        System.out.println("\nFetching " + label + "...");

        for (int page = 1; page <= pages; page++) {
            String url = "https://api.themoviedb.org/3" + endpoint + "?api_key=" + apiKey + "&page=" + page;

            try {
                TmdbResponse response = restTemplate.getForObject(url, TmdbResponse.class);

                if (response != null && response.getResults() != null) {
                    for (TmdbResponse.TmdbMovieDto result : response.getResults()) {
                        // Skip if no poster or already exists
                        if (result.getPosterPath() != null && repository.findByTmdbId(result.getId()).isEmpty()) {
                            Movie movie = new Movie();
                            movie.setTmdbId(result.getId());
                            movie.setTitle(result.getTitle());
                            movie.setCategory(label);
                            movie.setPosterUrl("https://image.tmdb.org/t/p/w500" + result.getPosterPath());
                            movie.setVideoUrl(
                                    "https://www.youtube.com/results?search_query=" + result.getTitle() + "+trailer");
                            movie.setPopularity(result.getPopularity());
                            movie.setOverview(result.getOverview());

                            // Extract year from release date
                            if (result.getReleaseDate() != null && result.getReleaseDate().length() >= 4) {
                                movie.setReleaseYear(Integer.parseInt(result.getReleaseDate().substring(0, 4)));
                            }

                            repository.save(movie);
                            added++;
                        }
                    }
                }
                System.out.println("  Page " + page + "/" + pages + " - Added: " + added);

                // Rate limiting
                Thread.sleep(250);
            } catch (Exception e) {
                System.err.println("  Error fetching page " + page + ": " + e.getMessage());
            }
        }

        System.out.println(label + " complete: " + added + " movies added");
        return added;
    }

    /**
     * Smart search: Check database first, then fetch from TMDB if not found
     */
    public List<Movie> searchMovies(String query) {
        // First, search in our database
        List<Movie> results = repository.findByTitleContainingIgnoreCase(query);

        // If found in DB, return immediately
        if (!results.isEmpty()) {
            System.out.println("Found " + results.size() + " movies in database for query: " + query);
            return results;
        }

        // Not found in DB - fetch from TMDB and save
        System.out.println("Movie not in database. Fetching from TMDB: " + query);
        String url = "https://api.themoviedb.org/3/search/movie?api_key=" + apiKey + "&query=" + query;

        try {
            TmdbResponse response = restTemplate.getForObject(url, TmdbResponse.class);

            if (response != null && response.getResults() != null) {
                for (TmdbResponse.TmdbMovieDto result : response.getResults()) {
                    if (result.getPosterPath() != null && repository.findByTmdbId(result.getId()).isEmpty()) {
                        Movie movie = new Movie();
                        movie.setTmdbId(result.getId());
                        movie.setTitle(result.getTitle());
                        movie.setCategory("Search Result");
                        movie.setPosterUrl("https://image.tmdb.org/t/p/w500" + result.getPosterPath());
                        movie.setVideoUrl(
                                "https://www.youtube.com/results?search_query=" + result.getTitle() + "+trailer");
                        movie.setPopularity(result.getPopularity());
                        movie.setOverview(result.getOverview());

                        if (result.getReleaseDate() != null && result.getReleaseDate().length() >= 4) {
                            movie.setReleaseYear(Integer.parseInt(result.getReleaseDate().substring(0, 4)));
                        }

                        repository.save(movie);
                        results.add(movie);
                        System.out.println("  [+] Added new movie from TMDB: " + result.getTitle());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching from TMDB: " + e.getMessage());
        }

        return results;
    }

    // Basic CRUD operations
    public Movie saveMovie(Movie movie) {
        return repository.save(movie);
    }

    public List<Movie> getAllMovies() {
        return repository.findAll();
    }

    public List<Movie> getMoviesByCategory(String category) {
        return repository.findByCategory(category);
    }

    public Movie getMovieById(String id) {
        return repository.findById(id).orElse(null);
    }

    public List<Movie> getTopMovies() {
        return repository.findTop20ByOrderByPopularityDesc();
    }
}