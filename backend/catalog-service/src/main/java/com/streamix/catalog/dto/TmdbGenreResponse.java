package com.streamix.catalog.dto;

import lombok.Data;

import java.util.List;

@Data
public class TmdbGenreResponse {
    private List<GenreDto> genres;

    @Data
    public static class GenreDto {
        private Long id; // TMDB genre ID
        private String name; // Genre name
    }
}
