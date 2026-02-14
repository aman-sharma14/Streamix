package com.streamix.catalog.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String videoUrl;

    // Additional fields for optimization
    private Double popularity; // For sorting by popularity
    private Integer releaseYear; // For filtering
    private String overview; // Movie description
}
