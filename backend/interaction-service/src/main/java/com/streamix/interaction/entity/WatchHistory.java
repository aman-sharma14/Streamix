package main.java.com.streamix.interaction.entity;

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
    private String timestamp; // e.g. "12:30"
    private LocalDateTime watchedOn;

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
