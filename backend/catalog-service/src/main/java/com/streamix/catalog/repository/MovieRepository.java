// It handles all the SQL for you. You don't have to write SELECT * FROM movies.
package com.streamix.catalog.repository;

import com.streamix.catalog.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface MovieRepository extends JpaRepository<Movie, Integer> {
//  JpaRepository -  gives you built-in methods like save(), findAll(), and delete().

    List<Movie> findByCategory(String category);
    // Spring is smart enough to see that name and automatically generate the SQL
    // SELECT * FROM movies WHERE category = ?

    Optional<Movie> findByTitle(String title);

}
