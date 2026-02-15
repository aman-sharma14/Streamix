package com.streamix.catalog.config;

import com.streamix.catalog.service.MovieService;
import com.streamix.catalog.service.TVShowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private MovieService movieService;

    @Autowired
    private TVShowService tvShowService;

    @Override
    public void run(String... args) {
        System.out.println("\n=== CATALOG SERVICE STARTUP ===\n");

        // Load genres first (needed for categorization)
        movieService.loadGenres();

        // Load movies (500+ items)
        movieService.loadInitialMovies();

        // Load TV shows (500+ items)
        tvShowService.loadInitialTVShows();

        System.out.println("\n=== CATALOG SERVICE READY ===\n");
    }
}
