package com.streamix.catalog.scheduler;

import com.streamix.catalog.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MovieScheduler {

    @Autowired
    private MovieService movieService;

    @Scheduled(cron = "0 0 0 * * *")
    public void dailySync() {
        System.out.println("CRON JOB: Starting daily movie sync...");
        movieService.syncMoviesFromTMDB("Marvel");
    }
}