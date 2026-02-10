package com.streamix.catalog.scheduler;

import com.streamix.catalog.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MovieScheduler implements CommandLineRunner {

    @Autowired
    private MovieService movieService;

    @Scheduled(cron = "0 0 0 * * *")
    public void dailySync() {
        System.out.println("CRON JOB: Starting daily movie sync...");
        // movieService.syncMoviesFromTMDB("Marvel"); // Old single query
        movieService.syncMoviesFromTMDB(); // New multi-category sync
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("STARTUP: Triggering initial movie sync...");
        try {
            dailySync();
        } catch (Exception e) {
            System.err.println("STARTUP WARNING: Initial movie sync failed or was interrupted: " + e.getMessage());
            // Do not rethrow, allow app to start
        }
    }
}