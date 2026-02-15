package com.streamix.catalog.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "tv_shows")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TVShow {

    @Id
    private String id;

    @Indexed(unique = true)
    private Integer tmdbId;

    private String title;
    private String name; // TV shows use "name" in TMDB API
    private String category;
    private String posterUrl;
    private String backdropUrl;
    private String videoUrl;

    // Additional fields
    private Double popularity;
    private Double voteAverage;
    private Integer releaseYear;
    private String firstAirDate; // TV shows use first_air_date
    private String overview;

    // TV-specific fields
    private Integer numberOfSeasons;
    private Integer numberOfEpisodes;

    // Genre support
    private List<Integer> genreIds;

    // Type
    private String type = "tv";

    // Caching metadata
    private LocalDateTime cachedAt;
    private List<String> categories;
}
