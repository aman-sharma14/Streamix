//defines the URLs (Endpoints) that the outside world (Postman, React, or the Gateway) can hit.
package com.streamix.catalog.controller;

import com.streamix.catalog.entity.Movie;
import com.streamix.catalog.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Tells Spring this class will return JSON data.
@RequestMapping("/movie") // Every URL in this file will start with /movie
public class MovieController {

    @Autowired
    private MovieService service;

    @PostMapping("/add") // Maps to POST http://localhost:8082/movie/add
    public String addMovie(@RequestBody Movie movie) {
        service.saveMovie(movie);
        return "Movie added successfully";
    }

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
    public Movie getMovieById(@PathVariable String id) {
        return service.getMovieById(id);
    }

    @GetMapping("/top")
    public List<Movie> getTopMovies() {
        return service.getTopMovies();
    }
}
