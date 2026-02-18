package com.streamix.catalog.controller;

import com.streamix.catalog.dto.TmdbCreditsResponse;
import com.streamix.catalog.entity.Genre;
import com.streamix.catalog.entity.Movie;
import com.streamix.catalog.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movie")
public class MovieController {

    @Autowired
    private MovieService service;

    @GetMapping("/all")
    public List<Movie> getAllMovies() {
        return service.getAllMovies();
    }

    @GetMapping("/category/{category}")
    public List<Movie> getMoviesByCategory(@PathVariable String category) {
        return service.getMoviesByCategory(category);
    }

    @GetMapping("/search")
    public List<Movie> searchMovies(@RequestParam String query) {
        return service.searchMovies(query);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable String id) {
        return service.getMovieById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tmdb/{tmdbId}")
    public ResponseEntity<Movie> getMovieByTmdbId(@PathVariable Integer tmdbId) {
        return service.getMovieByTmdbId(tmdbId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{tmdbId}/cast")
    public List<TmdbCreditsResponse.CastMember> getMovieCast(@PathVariable Integer tmdbId) {
        return service.getMovieCast(tmdbId);
    }

    @GetMapping("/{tmdbId}/images")
    public java.util.Map<String, Object> getMovieImages(@PathVariable Integer tmdbId) {
        return service.getImages(tmdbId);
    }

    @GetMapping("/{tmdbId}/videos")
    public java.util.Map<String, Object> getMovieVideos(@PathVariable Integer tmdbId) {
        return service.getVideos(tmdbId);
    }

    @GetMapping("/genres")
    public List<Genre> getAllGenres() {
        return service.getAllGenres();
    }

    @GetMapping("/genres/{type}")
    public List<Genre> getGenresByType(@PathVariable String type) {
        return service.getGenresByType(type);
    }

    @GetMapping("/popular")
    public List<Movie> getPopularMovies() {
        return service.getPopularMovies();
    }

    @GetMapping("/top-rated")
    public List<Movie> getTopRatedMovies() {
        return service.getTopRatedMovies();
    }

    @GetMapping("/{tmdbId}/similar")
    public List<Movie> getSimilarMovies(@PathVariable Integer tmdbId) {
        return service.getSimilarMovies(tmdbId);
    }

    @GetMapping("/trending")
    public List<Movie> getTrendingMovies() {
        return service.getTrendingMovies();
    }
}
