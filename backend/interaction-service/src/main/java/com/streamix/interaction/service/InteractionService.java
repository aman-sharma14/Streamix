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

    public Watchlist addToWatchlist(Integer userId, Integer movieId) {
        Optional<Watchlist> existing = watchlistRepository.findByUserIdAndMovieId(userId, movieId);
        if (existing.isPresent()) {
            return existing.get();
        }
        Watchlist watchlist = new Watchlist();
        watchlist.setUserId(userId);
        watchlist.setMovieId(movieId);
        watchlist.setAddedOn(LocalDateTime.now());
        return watchlistRepository.save(watchlist);
    }

    public void removeFromWatchlist(Integer userId, Integer movieId) {
        Optional<Watchlist> existing = watchlistRepository.findByUserIdAndMovieId(userId, movieId);
        existing.ifPresent(watchlistRepository::delete);
    }

    public WatchHistory updateHistory(Integer userId, Integer movieId, String timestamp) {
        Optional<WatchHistory> existing = watchHistoryRepository.findByUserIdAndMovieId(userId, movieId);
        WatchHistory history;
        if (existing.isPresent()) {
            history = existing.get();
        } else {
            history = new WatchHistory();
            history.setUserId(userId);
            history.setMovieId(movieId);
        }
        history.setTimestamp(timestamp);
        history.setWatchedOn(LocalDateTime.now());
        return watchHistoryRepository.save(history);
    }

    public List<Watchlist> getUserWatchlist(Integer userId) {
        return watchlistRepository.findByUserId(userId);
    }

    public List<WatchHistory> getUserHistory(Integer userId) {
        return watchHistoryRepository.findByUserId(userId);
    }
}
