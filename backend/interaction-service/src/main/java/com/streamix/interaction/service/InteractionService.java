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

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class InteractionService {

    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;
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
        log.info("Upserting watchlist item for user {} and movie {}", userId, movieId);

        org.springframework.data.mongodb.core.query.Query query = new org.springframework.data.mongodb.core.query.Query(
            org.springframework.data.mongodb.core.query.Criteria.where("userId").is(userId).and("movieId").is(movieId)
        );

        org.springframework.data.mongodb.core.query.Update update = new org.springframework.data.mongodb.core.query.Update()
            .setOnInsert("userId", userId)
            .setOnInsert("movieId", movieId)
            .setOnInsert("addedOn", LocalDateTime.now())
            .setOnInsert("movieSnapshot", new Watchlist.MovieSnapshot(movieTitle, posterUrl));

        // Atomic Upsert: If it exists, return it. If not, insert it.
        org.springframework.data.mongodb.core.FindAndModifyOptions options = new org.springframework.data.mongodb.core.FindAndModifyOptions().returnNew(true).upsert(true);

        return mongoTemplate.findAndModify(query, update, options, Watchlist.class);
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
        
        log.info("Upserting watch history for user {} and movie {}. Progress: {}/{}", userId, movieId, startAt, duration);

        org.springframework.data.mongodb.core.query.Query query = new org.springframework.data.mongodb.core.query.Query(
            org.springframework.data.mongodb.core.query.Criteria.where("userId").is(userId).and("movieId").is(movieId)
        );

        org.springframework.data.mongodb.core.query.Update update = new org.springframework.data.mongodb.core.query.Update()
            .set("startAt", startAt)
            .set("duration", duration)
            .set("completed", completed)
            .set("lastWatchedAt", LocalDateTime.now())
            .setOnInsert("userId", userId)
            .setOnInsert("movieId", movieId)
            .setOnInsert("movieSnapshot", new WatchHistory.MovieSnapshot(movieTitle, posterUrl));

        if (season != null) update.set("season", season);
        if (episode != null) update.set("episode", episode);

        // Atomic Upsert
        org.springframework.data.mongodb.core.FindAndModifyOptions options = new org.springframework.data.mongodb.core.FindAndModifyOptions().returnNew(true).upsert(true);
        
        return mongoTemplate.findAndModify(query, update, options, WatchHistory.class);
    }

    public List<Watchlist> getUserWatchlist(Integer userId) {
        return watchlistRepository.findByUserId(userId);
    }

    public List<WatchHistory> getUserHistory(Integer userId) {
        return watchHistoryRepository.findByUserId(userId);
    }
}
