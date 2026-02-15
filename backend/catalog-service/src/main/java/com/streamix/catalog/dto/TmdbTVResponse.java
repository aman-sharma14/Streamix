package com.streamix.catalog.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class TmdbTVResponse {
    private List<TmdbTVDto> results;

    @Data
    public static class TmdbTVDto {
        private Integer id; // TMDB ID
        private String name; // TV shows use "name" instead of "title"
        private String overview;

        @JsonProperty("poster_path")
        private String posterPath;

        @JsonProperty("backdrop_path")
        private String backdropPath;

        private Double popularity;

        @JsonProperty("vote_average")
        private Double voteAverage;

        @JsonProperty("first_air_date")
        private String firstAirDate; // TV shows use first_air_date

        @JsonProperty("genre_ids")
        private List<Integer> genreIds;

        @JsonProperty("number_of_seasons")
        private Integer numberOfSeasons;

        @JsonProperty("number_of_episodes")
        private Integer numberOfEpisodes;
    }
}
