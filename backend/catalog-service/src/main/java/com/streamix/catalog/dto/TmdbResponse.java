package com.streamix.catalog.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class TmdbResponse { // Must be PUBLIC
    private List<TmdbMovieDto> results;

    @Data
    public static class TmdbMovieDto {
        private Integer id; // TMDB ID
        private String title;
        private String overview;
        @JsonProperty("poster_path")
        private String posterPath;
        private Double popularity;
        @JsonProperty("release_date")
        private String releaseDate; // Format: "2010-07-16"
    }
}