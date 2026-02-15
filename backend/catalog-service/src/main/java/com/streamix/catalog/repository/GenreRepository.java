package com.streamix.catalog.repository;

import com.streamix.catalog.entity.Genre;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GenreRepository extends MongoRepository<Genre, String> {
    List<Genre> findByType(String type);
}
