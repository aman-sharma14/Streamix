package com.streamix.interaction.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Document(collection = "watchlist")
@CompoundIndex(name = "user_movie_idx", def = "{'userId': 1, 'movieId': 1}", unique = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Watchlist {

    @Id
    private String id; // MongoDB uses String IDs

    private Integer userId;
    private String movieId; // Reference to Movie document ID
    private LocalDateTime addedOn;

    // Embedded movie snapshot for denormalization (faster queries)
    private MovieSnapshot movieSnapshot;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovieSnapshot {
        private String title;
        private String posterUrl;
    }
}
