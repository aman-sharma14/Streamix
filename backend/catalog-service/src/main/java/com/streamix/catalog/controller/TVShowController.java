package com.streamix.catalog.controller;

import com.streamix.catalog.entity.TVShow;
import com.streamix.catalog.service.TVShowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tv")
public class TVShowController {

    @Autowired
    private TVShowService service;

    @GetMapping("/all")
    public List<TVShow> getAllTVShows() {
        return service.getAllTVShows();
    }

    @GetMapping("/popular")
    public List<TVShow> getPopularTVShows() {
        return service.getPopularTVShows();
    }

    @GetMapping("/top-rated")
    public List<TVShow> getTopRatedTVShows() {
        return service.getTopRatedTVShows();
    }

    @GetMapping("/trending")
    public List<TVShow> getTrendingTVShows() {
        return service.getTrendingTVShows();
    }

    @GetMapping("/{id}")
    public org.springframework.http.ResponseEntity<TVShow> getTVShowById(@PathVariable String id) {
        return service.getTVShowById(id)
                .map(org.springframework.http.ResponseEntity::ok)
                .orElse(org.springframework.http.ResponseEntity.notFound().build());
    }

    @GetMapping("/tmdb/{tmdbId}/cast")
    public List<com.streamix.catalog.dto.TmdbCreditsResponse.CastMember> getTVShowCast(@PathVariable Integer tmdbId) {
        return service.getTVShowCast(tmdbId);
    }

    @GetMapping("/tmdb/{tmdbId}/similar")
    public List<TVShow> getSimilarTVShows(@PathVariable Integer tmdbId) {
        return service.getSimilarTVShows(tmdbId);
    }
}
