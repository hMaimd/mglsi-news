package com.mglsi.news.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String titre;

    @Column(columnDefinition = "TEXT")
    private String contenu;

    @Column(name = "dateCreation")
    private LocalDateTime dateCreation;

    @Column(name = "dateModification")
    private LocalDateTime dateModification;

    @ManyToOne
    @JoinColumn(name = "categorie")
    private Categorie categorie;
}