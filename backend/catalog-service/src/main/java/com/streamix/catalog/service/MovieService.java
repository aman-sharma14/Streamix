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

    public void syncMoviesFromTMDB(String query) {
        String url = "https://api.themoviedb.org/3/search/movie?api_key=" + apiKey + "&query=" + query;
        TmdbResponse response = restTemplate.getForObject(url, TmdbResponse.class);

        if (response != null && response.getResults() != null) {
            for (TmdbResponse.TmdbMovieDto result : response.getResults()) {
                if (repository.findByTitle(result.getTitle()).isEmpty()) {
                    Movie movie = new Movie();
                    movie.setTitle(result.getTitle());
                    movie.setCategory("Movie");
                    movie.setPosterUrl("https://image.tmdb.org/t/p/w500" + result.getPosterPath());
                    movie.setVideoUrl("https://www.youtube.com/results?search_query=" + result.getTitle() + "+trailer");
                    repository.save(movie);
                }
            }
        }
    }

    // This one is for the Controller (No args)
    public void syncMoviesFromTMDB() {
        // List of keywords to build a diverse library
        String[] categories = {
                "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
                "Drama", "Family", "Fantasy", "History", "Horror", "Music",
                "Mystery", "Romance", "Science Fiction", "Thriller", "War", "Western",
                "Netflix", "HBO", "Amazon", "Marvel", "DC Comics", "Anime"
        };

        int totalMoviesAdded = 0;
        System.out.println("Starting TMDB Sync...");

        for (String keyword : categories) {
            // Loop through the first 6 pages of results for EACH keyword (User changed to 6)
            for (int page = 1; page <= 6; page++) {
                String url = "https://api.themoviedb.org/3/search/movie?api_key=" + apiKey
                        + "&query=" + keyword + "&page=" + page;

                System.out.println("Fetching " + keyword + " (Page " + page + ")...");

                try {
                    TmdbResponse response = restTemplate.getForObject(url, TmdbResponse.class);

                    if (response != null && response.getResults() != null) {
                        for (TmdbResponse.TmdbMovieDto result : response.getResults()) {
                            // Critical: Avoid saving duplicates or movies without posters
                            if (result.getPosterPath() != null && repository.findByTitle(result.getTitle()).isEmpty()) {
                                Movie movie = new Movie();
                                movie.setTitle(result.getTitle());
                                movie.setCategory(keyword); // Set category based on search keyword
                                movie.setPosterUrl("https://image.tmdb.org/t/p/w500" + result.getPosterPath());
                                movie.setVideoUrl("https://www.youtube.com/results?search_query=" + result.getTitle() + "+trailer");
                                repository.save(movie);
                                System.out.println("   [+] Added: " + result.getTitle());
                                totalMoviesAdded++;
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("   [!] Failed to fetch " + keyword + " page " + page + ": " + e.getMessage());
                }

                // Small sleep to be nice to the TMDB API (prevent rate limiting)
                try { Thread.sleep(500); } catch (InterruptedException e) {}
            }
        }
        System.out.println("--------------------------------------------------");
        System.out.println("TMDB Sync Completed. Total new movies added: " + totalMoviesAdded);
        System.out.println("--------------------------------------------------");
    }

    public Movie saveMovie(Movie movie) { return repository.save(movie); }
    public List<Movie> getAllMovies() { return repository.findAll(); }
    public List<Movie> getMoviesByCategory(String category) { return repository.findByCategory(category); }
    public Movie getMovieById(Integer id) { return repository.findById(id).orElse(null); }
    public List<Movie> searchMovies(String query) { return repository.findByTitleContainingIgnoreCase(query); }
}