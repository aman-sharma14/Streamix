package com.streamix.interaction.repository;

import com.streamix.interaction.entity.Watchlist;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends MongoRepository<Watchlist, String> {
    List<Watchlist> findByUserId(Integer userId);

    Optional<Watchlist> findByUserIdAndMovieId(Integer userId, String movieId);

    void deleteByUserIdAndMovieId(Integer userId, String movieId);
}
