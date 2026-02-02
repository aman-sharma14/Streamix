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
    public Watchlist addToWatchlist(@RequestBody Map<String, Integer> payload) {
        return interactionService.addToWatchlist(payload.get("userId"), payload.get("movieId"));
    }

    @PostMapping("/watchlist/remove")
    public void removeFromWatchlist(@RequestBody Map<String, Integer> payload) {
        interactionService.removeFromWatchlist(payload.get("userId"), payload.get("movieId"));
    }

    @GetMapping("/watchlist/{userId}")
    public List<Watchlist> getUserWatchlist(@PathVariable Integer userId) {
        return interactionService.getUserWatchlist(userId);
    }

    @PostMapping("/history/update")
    public WatchHistory updateHistory(@RequestBody Map<String, Object> payload) {
        Integer userId = (Integer) payload.get("userId");
        Integer movieId = (Integer) payload.get("movieId");
        String timestamp = (String) payload.get("timestamp");
        return interactionService.updateHistory(userId, movieId, timestamp);
    }

    @GetMapping("/history/{userId}")
    public List<WatchHistory> getUserHistory(@PathVariable Integer userId) {
        return interactionService.getUserHistory(userId);
    }
}
