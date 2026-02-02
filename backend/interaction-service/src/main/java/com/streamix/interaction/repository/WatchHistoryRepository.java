package com.streamix.interaction.repository;

import com.streamix.interaction.entity.WatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchHistoryRepository extends JpaRepository<WatchHistory, Integer> {

    List<WatchHistory> findByUserId(Integer userId);

    Optional<WatchHistory> findByUserIdAndMovieId(Integer userId, Integer movieId);
}
