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
}
