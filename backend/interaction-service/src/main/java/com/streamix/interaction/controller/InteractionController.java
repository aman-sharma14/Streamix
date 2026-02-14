package com.streamix.interaction.controller;

import com.streamix.interaction.entity.WatchHistory;
import com.streamix.interaction.entity.Watchlist;
import com.streamix.interaction.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/interaction")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    @PostMapping("/watchlist/add")
    public Watchlist addToWatchlist(@RequestBody Map<String, Object> payload) {
        Integer userId = parseUserId(payload.get("userId"));
        String movieId = (String) payload.get("movieId"); // MongoDB String ID
        String movieTitle = (String) payload.get("movieTitle");
        String posterUrl = (String) payload.get("posterUrl");
        return interactionService.addToWatchlist(userId, movieId, movieTitle, posterUrl);
    }

    @PostMapping("/watchlist/remove")
    public void removeFromWatchlist(@RequestBody Map<String, Object> payload) {
        Integer userId = parseUserId(payload.get("userId"));
        String movieId = (String) payload.get("movieId"); // MongoDB String ID
        interactionService.removeFromWatchlist(userId, movieId);
    }

    @GetMapping("/watchlist/{userId}")
    public List<Watchlist> getUserWatchlist(@PathVariable Integer userId) {
        return interactionService.getUserWatchlist(userId);
    }

    @PostMapping("/history/update")
    public WatchHistory updateHistory(@RequestBody Map<String, Object> payload) {
        Integer userId = parseUserId(payload.get("userId"));
        String movieId = (String) payload.get("movieId"); // MongoDB String ID
        String timestamp = (String) payload.get("timestamp");
        String movieTitle = (String) payload.get("movieTitle");
        String posterUrl = (String) payload.get("posterUrl");
        return interactionService.updateHistory(userId, movieId, timestamp, movieTitle, posterUrl);
    }

    @GetMapping("/history/{userId}")
    public List<WatchHistory> getUserHistory(@PathVariable Integer userId) {
        return interactionService.getUserHistory(userId);
    }

    /**
     * Helper method to parse userId from either String or Number type
     * Handles both JWT tokens (which send userId as String) and direct numeric
     * values
     */
    private Integer parseUserId(Object userIdObj) {
        if (userIdObj instanceof String) {
            return Integer.parseInt((String) userIdObj);
        } else if (userIdObj instanceof Number) {
            return ((Number) userIdObj).intValue();
        } else {
            throw new IllegalArgumentException("Invalid userId type: " + userIdObj.getClass().getName());
        }
    }
}
