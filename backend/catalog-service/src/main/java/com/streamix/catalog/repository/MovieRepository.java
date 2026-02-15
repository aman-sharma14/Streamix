// MongoDB repository for Movie collection
package com.streamix.catalog.repository;

import com.streamix.catalog.entity.Movie;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends MongoRepository<Movie, String> {
    // MongoRepository gives you built-in methods like save(), findAll(), and
    // delete()

    List<Movie> findByCategory(String category);
    // MongoDB query: db.movies.find({ category: "Action" })

    Optional<Movie> findByTitle(String title);

    Optional<Movie> findByTmdbId(Integer tmdbId); // Find by TMDB ID

    // Search for movies containing the query string (case-insensitive)
    List<Movie> findByTitleContainingIgnoreCase(String query);

    // Find top movies by popularity
    List<Movie> findTop20ByOrderByPopularityDesc();

    // NEW: Find movies by categories (for cache refresh)
    List<Movie> findByCategoriesContaining(String category);

    // NEW: Delete movies by categories (for cache refresh)
    void deleteByCategoriesContaining(String category);
}
