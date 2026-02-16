package com.streamix.interaction.service;

import com.streamix.interaction.entity.WatchHistory;
import com.streamix.interaction.repository.WatchHistoryRepository;
import com.streamix.interaction.repository.WatchlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InteractionServiceTest {

    @Mock
    private WatchHistoryRepository watchHistoryRepository;

    @Mock
    private WatchlistRepository watchlistRepository;

    @InjectMocks
    private InteractionService interactionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void updateHistory_NewEntry_ShouldSave() {
        // Arrange
        Integer userId = 1;
        String movieId = "12345";
        Double startAt = 100.0;
        Double duration = 1200.0;
        Boolean completed = false;
        Integer season = 1;
        Integer episode = 1;
        String movieTitle = "Test Movie";
        String posterUrl = "http://test.com/poster.jpg";

        when(watchHistoryRepository.findByUserIdAndMovieId(userId, movieId)).thenReturn(Optional.empty());
        when(watchHistoryRepository.save(any(WatchHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        WatchHistory result = interactionService.updateHistory(userId, movieId, startAt, duration, completed, season,
                episode, movieTitle, posterUrl);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(movieId, result.getMovieId());
        assertEquals(startAt, result.getStartAt());
        assertEquals(movieTitle, result.getMovieSnapshot().getTitle());
        verify(watchHistoryRepository, times(1)).save(any(WatchHistory.class));
    }

    @Test
    void updateHistory_ExistingEntry_ShouldUpdate() {
        // Arrange
        Integer userId = 1;
        String movieId = "12345";
        Double startAt = 200.0;

        WatchHistory existingMain = new WatchHistory();
        existingMain.setUserId(userId);
        existingMain.setMovieId(movieId);
        existingMain.setStartAt(50.0);

        when(watchHistoryRepository.findByUserIdAndMovieId(userId, movieId)).thenReturn(Optional.of(existingMain));
        when(watchHistoryRepository.save(any(WatchHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        WatchHistory result = interactionService.updateHistory(userId, movieId, startAt, 1200.0, false, 1, 1, "Title",
                "Url");

        // Assert
        assertEquals(startAt, result.getStartAt()); // Should update timestamp
        verify(watchHistoryRepository, times(1)).save(any(WatchHistory.class));
    }
}
