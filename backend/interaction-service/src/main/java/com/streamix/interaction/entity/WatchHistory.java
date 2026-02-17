package com.streamix.interaction.entity;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.IndexDirection;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Document(collection = "watch_history")
@CompoundIndexes({
    @CompoundIndex(name = "user_movie_idx", def = "{'userId': 1, 'movieId': 1}", unique = true)
})
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
    @Indexed(direction = IndexDirection.DESCENDING)
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
