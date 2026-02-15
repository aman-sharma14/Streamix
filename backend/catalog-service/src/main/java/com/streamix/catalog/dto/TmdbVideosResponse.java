package com.streamix.catalog.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class TmdbVideosResponse {
    private List<VideoResult> results;

    @Data
    public static class VideoResult {
        private String key; // YouTube video ID
        private String site; // "YouTube"
        private String type; // "Trailer", "Teaser", "Clip", etc.

        @JsonProperty("official")
        private Boolean official; // true/false

        private String name; // Video title

        @JsonProperty("published_at")
        private String publishedAt; // Publication date
    }
}
