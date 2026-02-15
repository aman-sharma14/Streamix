package com.streamix.catalog.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "genres")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Genre {

    @Id
    private String id;

    @Indexed
    private Long tmdbId;

    private String name;
    private String type; // "movie" or "tv"
}
