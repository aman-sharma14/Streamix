package com.streamix.interaction.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Document(collection = "watch_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WatchHistory {

    @Id
    private String id; // MongoDB uses String IDs

    private Integer userId;
    private String movieId; // Reference to Movie document ID
    private Double startAt; // current timestamp in seconds
    private Double duration; // total duration in seconds
    private Boolean completed;
    private Integer season; // For TV shows
    private Integer episode; // For TV shows
    private LocalDateTime lastWatchedAt;

    // Embedded movie snapshot for denormalization
    private MovieSnapshot movieSnapshot;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovieSnapshot {
        private String title;
        private String posterUrl;
    }
}
