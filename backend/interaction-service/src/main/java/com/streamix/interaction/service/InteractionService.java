package com.streamix.interaction.service;

import com.streamix.interaction.entity.WatchHistory;
import com.streamix.interaction.entity.Watchlist;
import com.streamix.interaction.repository.WatchHistoryRepository;
import com.streamix.interaction.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InteractionService {

    private final WatchlistRepository watchlistRepository;
    private final WatchHistoryRepository watchHistoryRepository;

    /**
     * Add movie to user's watchlist
     * 
     * @param userId     User ID
     * @param movieId    Movie document ID (MongoDB String ID)
     * @param movieTitle Movie title for snapshot
     * @param posterUrl  Poster URL for snapshot
     */
    public Watchlist addToWatchlist(Integer userId, String movieId, String movieTitle, String posterUrl) {
        Optional<Watchlist> existing = watchlistRepository.findByUserIdAndMovieId(userId, movieId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Watchlist watchlist = new Watchlist();
        watchlist.setUserId(userId);
        watchlist.setMovieId(movieId);
        watchlist.setAddedOn(LocalDateTime.now());

        // Set movie snapshot for denormalization
        Watchlist.MovieSnapshot snapshot = new Watchlist.MovieSnapshot(movieTitle, posterUrl);
        watchlist.setMovieSnapshot(snapshot);

        return watchlistRepository.save(watchlist);
    }

    public void removeFromWatchlist(Integer userId, String movieId) {
        watchlistRepository.deleteByUserIdAndMovieId(userId, movieId);
    }

    /**
     * Update watch history for a user
     * 
     * @param userId     User ID
     * @param movieId    Movie document ID (MongoDB String ID)
     * @param startAt    Watch progress timestamp (seconds)
     * @param duration   Total duration (seconds)
     * @param completed  Whether finished
     * @param season     Season number (for TV)
     * @param episode    Episode number (for TV)
     * @param movieTitle Movie title for snapshot
     * @param posterUrl  Poster URL for snapshot
     */
    public WatchHistory updateHistory(Integer userId, String movieId, Double startAt, Double duration,
            Boolean completed, Integer season, Integer episode, String movieTitle, String posterUrl) {
        Optional<WatchHistory> existing = watchHistoryRepository.findByUserIdAndMovieId(userId, movieId);
        WatchHistory history;

        if (existing.isPresent()) {
            history = existing.get();
        } else {
            history = new WatchHistory();
            history.setUserId(userId);
            history.setMovieId(movieId);

            // Set movie snapshot for new history entry
            WatchHistory.MovieSnapshot snapshot = new WatchHistory.MovieSnapshot(movieTitle, posterUrl);
            history.setMovieSnapshot(snapshot);
        }

        history.setStartAt(startAt);
        history.setDuration(duration);
        history.setCompleted(completed);
        history.setSeason(season);
        history.setEpisode(episode);
        history.setLastWatchedAt(LocalDateTime.now());
        return watchHistoryRepository.save(history);
    }

    public List<Watchlist> getUserWatchlist(Integer userId) {
        return watchlistRepository.findByUserId(userId);
    }

    public List<WatchHistory> getUserHistory(Integer userId) {
        return watchHistoryRepository.findByUserId(userId);
    }
}
