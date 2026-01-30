package com.streamix.catalog.service;

import com.streamix.catalog.entity.Movie;
import com.streamix.catalog.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieService {

    @Autowired
    private MovieRepository repository;

    public Movie saveMovie(Movie movie) {
        return repository.save(movie);
    }

    public List<Movie> getAllMovies() {
        return repository.findAll();
    }

    public List<Movie> getMoviesByCategory(String category) {
        return repository.findByCategory(category);
    }
}
