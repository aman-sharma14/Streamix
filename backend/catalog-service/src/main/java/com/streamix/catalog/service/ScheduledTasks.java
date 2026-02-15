package com.streamix.catalog.service;

import com.streamix.catalog.repository.MovieRepository;
import com.streamix.catalog.repository.TVShowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScheduledTasks {

    private final MovieService movieService;
    private final TVShowService tvShowService;
    private final MovieRepository movieRepository;
    private final TVShowRepository tvShowRepository;

    /**
     * Daily refresh at 2 AM
     * Refreshes: Popular Movies, Popular TV, Trending Movies, Trending TV
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void refreshDailyContent() {
        System.out.println("\n========================================");
        System.out.println("   DAILY CONTENT REFRESH");
        System.out.println("   Time: 2:00 AM");
        System.out.println("========================================\n");

        // Delete and refresh Popular Movies
        System.out.println("🔄 Refreshing Popular Movies...");
        movieRepository.deleteByCategoriesContaining("Popular Movies");
        movieService.refreshCategory("/movie/popular", 5, "Popular Movies", "movie");

        // Delete and refresh Popular TV
        System.out.println("\n🔄 Refreshing Popular TV Shows...");
        tvShowRepository.deleteByCategoriesContaining("Popular TV");
        tvShowService.refreshCategory("/tv/popular", 5, "Popular TV");

        // Delete and refresh Trending Movies
        System.out.println("\n🔄 Refreshing Trending Movies...");
        movieRepository.deleteByCategoriesContaining("Trending Movies");
        movieService.refreshCategory("/trending/movie/day", 3, "Trending Movies", "movie");

        // Delete and refresh Trending TV
        System.out.println("\n🔄 Refreshing Trending TV Shows...");
        tvShowRepository.deleteByCategoriesContaining("Trending TV");
        tvShowService.refreshCategory("/trending/tv/day", 3, "Trending TV");

        System.out.println("\n========================================");
        System.out.println("✅ Daily refresh completed!");
        System.out.println("========================================\n");
    }

    /**
     * Weekly refresh on Sunday at 3 AM
     * Refreshes: Top Rated Movies, Top Rated TV
     */
    @Scheduled(cron = "0 0 3 * * SUN")
    public void refreshWeeklyContent() {
        System.out.println("\n========================================");
        System.out.println("   WEEKLY CONTENT REFRESH");
        System.out.println("   Time: Sunday 3:00 AM");
        System.out.println("========================================\n");

        // Delete and refresh Top Rated Movies
        System.out.println("🔄 Refreshing Top Rated Movies...");
        movieRepository.deleteByCategoriesContaining("Top Rated Movies");
        movieService.refreshCategory("/movie/top_rated", 5, "Top Rated Movies", "movie");

        // Delete and refresh Top Rated TV
        System.out.println("\n🔄 Refreshing Top Rated TV Shows...");
        tvShowRepository.deleteByCategoriesContaining("Top Rated TV");
        tvShowService.refreshCategory("/tv/top_rated", 5, "Top Rated TV");

        System.out.println("\n========================================");
        System.out.println("✅ Weekly refresh completed!");
        System.out.println("========================================\n");
    }

    /**
     * Manual refresh trigger (for testing or admin use)
     */
    public void manualRefresh(String category, String type) {
        System.out.println("🔧 Manual refresh triggered for: " + category);

        if ("movie".equals(type)) {
            movieRepository.deleteByCategoriesContaining(category);
        } else if ("tv".equals(type)) {
            tvShowRepository.deleteByCategoriesContaining(category);
        }

        System.out.println("✅ Manual refresh completed for: " + category);
    }
}
