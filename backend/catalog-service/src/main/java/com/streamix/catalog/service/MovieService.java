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
        for (String keyword : categories) {
            // Loop through the first 3 pages of results for EACH keyword
            // Loop through the first 10 pages of results for EACH keyword
            // 10 pages * 20 movies = 200 movies per keyword
            for (int page = 1; page <=6; page++) {
                String url = "https://api.themoviedb.org/3/search/movie?api_key=" + apiKey
                        + "&query=" + keyword + "&page=" + page;

                TmdbResponse response = restTemplate.getForObject(url, TmdbResponse.class);

                if (response != null && response.getResults() != null) {
                    System.out.println("\n --- Movies found - keyword : "+ keyword +" ---");
                    for (TmdbResponse.TmdbMovieDto result : response.getResults()) {
                        System.out.println("###");
                        // Critical: Avoid saving duplicates or movies without posters
                        if (result.getPosterPath() != null && repository.findByTitle(result.getTitle()).isEmpty()) {
                            System.out.println(" -- > Valid found : " + result.getTitle() + " --- \n");
                            Movie movie = new Movie();
                            movie.setTitle(result.getTitle());
                            movie.setCategory(keyword); // Set category based on search keyword
                            movie.setPosterUrl("https://image.tmdb.org/t/p/w500" + result.getPosterPath());
                            movie.setVideoUrl("https://www.youtube.com/results?search_query=" + result.getTitle() + "+trailer");
                            repository.save(movie);
                        }
                        else{
                            System.out.println(" -- > If condition failed, not saving \n");
                        }
                    }
                }
                // Small sleep to be nice to the TMDB API (prevent rate limiting)
                try { Thread.sleep(500); } catch (InterruptedException e) {}
            }
        }
    }

    public Movie saveMovie(Movie movie) { return repository.save(movie); }
    public List<Movie> getAllMovies() { return repository.findAll(); }
    public List<Movie> getMoviesByCategory(String category) { return repository.findByCategory(category); }
    public Movie getMovieById(Integer id) { return repository.findById(id).orElse(null); }
}