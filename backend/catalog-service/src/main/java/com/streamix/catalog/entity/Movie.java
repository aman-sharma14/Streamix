package com.streamix.catalog.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "movies") // MongoDB collection name
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Movie {

    @Id
    private String id; // MongoDB uses String IDs by default

    @Indexed(unique = true) // Index for faster searches and prevent duplicates
    private Integer tmdbId; // TMDB movie ID for reference

    private String title;
    private String category;
    private String posterUrl;
    private String backdropUrl; // NEW: Backdrop image for details page
    private String videoUrl;

    // Additional fields for optimization
    private Double popularity; // For sorting by popularity
    private Double voteAverage; // NEW: TMDB rating (e.g., 8.4)
    private Integer releaseYear; // For filtering
    private String releaseDate; // NEW: Full date (e.g., "2010-07-16")
    private String overview; // Movie description

    // NEW: Genre support
    private List<Integer> genreIds; // TMDB genre IDs (e.g., [28, 878, 53])

    // NEW: Type (movie or tv)
    private String type; // "movie" or "tv"

    // NEW: Caching metadata
    private LocalDateTime cachedAt; // When this was cached
    private List<String> categories; // Which lists it belongs to (e.g., ["Popular Movies", "Top Rated Movies"])
}
