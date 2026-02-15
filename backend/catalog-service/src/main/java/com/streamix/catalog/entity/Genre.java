package com.streamix.catalog.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "genres")
public class Genre {
    @Id
    private String id;

    private Long tmdbId; // TMDB genre ID
    private String name; // Genre name (e.g., "Action", "Comedy")
    private String type; // "movie" or "tv"
}
