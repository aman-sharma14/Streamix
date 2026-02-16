package com.streamix.interaction.repository;

import com.streamix.interaction.entity.WatchHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchHistoryRepository extends MongoRepository<WatchHistory, String> {
    List<WatchHistory> findByUserId(Integer userId);

    List<WatchHistory> findByUserIdAndMovieId(Integer userId, String movieId);
}
