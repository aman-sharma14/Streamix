package com.streamix.catalog.scheduler;

import com.streamix.catalog.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class MovieScheduler implements CommandLineRunner {

    @Autowired
    private MovieService movieService;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("STARTUP: Checking if initial movie data needs to be loaded...");
        try {
            // This will only load if database is empty
            movieService.loadInitialMovies();
        } catch (Exception e) {
            System.err.println("STARTUP WARNING: Initial movie load failed: " + e.getMessage());
            e.printStackTrace();
            // Don't rethrow - allow app to start even if initial load fails
        }
    }
}