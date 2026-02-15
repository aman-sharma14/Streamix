package com.streamix.catalog.repository;

import com.streamix.catalog.entity.TVShow;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TVShowRepository extends MongoRepository<TVShow, String> {
    Optional<TVShow> findByTmdbId(Integer tmdbId);

    List<TVShow> findByCategory(String category);

    List<TVShow> findByTitleContainingIgnoreCase(String query);

    List<TVShow> findByCategoriesContaining(String category);

    void deleteByCategoriesContaining(String category);
}
