package com.streamix.catalog.controller;

import com.streamix.catalog.entity.Movie;
import com.streamix.catalog.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movie")
public class MovieController {

    @Autowired
    private MovieService service;

    @PostMapping("/add")
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
}
