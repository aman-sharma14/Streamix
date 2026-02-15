package com.streamix.catalog.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class TmdbCreditsResponse {
    private List<CastMember> cast;

    @Data
    public static class CastMember {
        private Long id; // Actor ID
        private String name; // Actor name
        private String character; // Character name

        @JsonProperty("profile_path")
        private String profilePath; // Profile image path

        private Integer order; // Cast order (0 = lead)
    }
}
