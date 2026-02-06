package com.streamix.catalog.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity   //Tells Spring that this class should be managed by the database.
@Data   //Automatically creates your getters, setters, and toString() methods so the file stays clean.
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "movies")
public class Movie {

    @Id   //  Marks the primary key.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;
    private String category;
    private String posterUrl;
    private String videoUrl;
}
