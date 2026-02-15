package com.streamix.catalog.repository;

import com.streamix.catalog.entity.Genre;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GenreRepository extends MongoRepository<Genre, String> {
    Optional<Genre> findByTmdbId(Long tmdbId);

    List<Genre> findByType(String type);
}
