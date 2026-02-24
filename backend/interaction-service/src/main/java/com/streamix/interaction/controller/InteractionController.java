package com.streamix.interaction.controller;

import com.streamix.interaction.entity.WatchHistory;
import com.streamix.interaction.entity.Watchlist;
import com.streamix.interaction.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/interaction")
@RequiredArgsConstructor
@Slf4j
public class InteractionController {

    private final InteractionService interactionService;
    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    @PostMapping("/watchlist/add")
    public Watchlist addToWatchlist(@RequestBody Map<String, Object> payload) {
        Integer userId = parseUserId(payload.get("userId"));
        String movieId = String.valueOf(payload.get("movieId")); // Safely convert to String
        String movieTitle = (String) payload.get("movieTitle");
        String posterUrl = (String) payload.get("posterUrl");
        return interactionService.addToWatchlist(userId, movieId, movieTitle, posterUrl);
    }

    @PostMapping("/watchlist/remove")
    public void removeFromWatchlist(@RequestBody Map<String, Object> payload) {
        Integer userId = parseUserId(payload.get("userId"));
        String movieId = String.valueOf(payload.get("movieId")); // Safely convert to String
        interactionService.removeFromWatchlist(userId, movieId);
    }

    @GetMapping("/watchlist/{userId}")
    public List<Watchlist> getUserWatchlist(@PathVariable Integer userId) {
        return interactionService.getUserWatchlist(userId);
    }

    @PostMapping("/history/update")
    public ResponseEntity<?> updateHistory(@RequestBody Map<String, Object> payload) {
        log.info("Received history update request: {}", payload);
        try {
            Integer userId = parseUserId(payload.get("userId"));
            String movieId = String.valueOf(payload.get("movieId"));

            Double startAt = parseDouble(payload.get("startAt"));
            Double duration = parseDouble(payload.get("duration"));

            Boolean completed = parseBoolean(payload.get("completed"));

            Integer season = null;
            if (payload.get("season") instanceof Number) {
                season = ((Number) payload.get("season")).intValue();
            } else if (payload.get("season") instanceof String) {
                try {
                    season = Integer.parseInt((String) payload.get("season"));
                } catch (NumberFormatException e) {
                    // ignore
                }
            }

            Integer episode = null;
            if (payload.get("episode") instanceof Number) {
                episode = ((Number) payload.get("episode")).intValue();
            } else if (payload.get("episode") instanceof String) {
                try {
                    episode = Integer.parseInt((String) payload.get("episode"));
                } catch (NumberFormatException e) {
                    // ignore
                }
            }

            String movieTitle = (String) payload.get("movieTitle");
            String posterUrl = (String) payload.get("posterUrl");

            WatchHistory savedHistory = interactionService.updateHistory(userId, movieId, startAt, duration, completed,
                    season, episode,
                    movieTitle, posterUrl);

            return ResponseEntity.ok(savedHistory);
        } catch (Exception e) {
            log.error("Error updating history", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage(), "trace", e.getStackTrace()[0].toString()));
        }
    }

    
    // @GetMapping("/test-header")
    // public String testGatewayHeader(
    //         @RequestHeader(value = "X-User-Email", defaultValue = "NO_HEADER_FOUND") String userEmail) {
    //     System.out.println("The API Gateway told me the user is: " + userEmail);
    //     return "Hello, " + userEmail + "! The Gateway successfully passed your identity downstream.";
    // }

    @GetMapping("/history/{userId}")
    public List<WatchHistory> getUserHistory(@PathVariable Integer userId) {
        return interactionService.getUserHistory(userId);
    }

    private Integer parseUserId(Object userIdObj) {
        if (userIdObj == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (userIdObj instanceof String) {
            return Integer.parseInt((String) userIdObj);
        } else if (userIdObj instanceof Number) {
            return ((Number) userIdObj).intValue();
        } else {
            throw new IllegalArgumentException("Invalid userId type: " + userIdObj.getClass().getName());
        }
    }

    private Double parseDouble(Object value) {
        if (value == null)
            return 0.0;
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        } else if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
        return 0.0;
    }

    private Boolean parseBoolean(Object value) {
        if (value == null)
            return false;
        if (value instanceof Boolean) {
            return (Boolean) value;
        } else if (value instanceof String) {
            return Boolean.parseBoolean((String) value);
        }
        return false;
    }

    @GetMapping("/debug-db")
    public Map<String, Object> debugDb() {
        return Map.of(
                "database", mongoTemplate.getDb().getName(),
                "collection", "watch_history",
                "count", mongoTemplate.getCollection("watch_history").countDocuments());
    }
}
