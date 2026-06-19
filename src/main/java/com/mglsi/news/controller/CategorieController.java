package com.mglsi.news.controller;

import com.mglsi.news.entity.Categorie;
import com.mglsi.news.repository.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategorieController {

    @Autowired
    private CategorieRepository categorieRepository;

    @GetMapping
    public List<Categorie> getAll() {
        return categorieRepository.findAll();
    }

    @GetMapping("/{id}")
    public Categorie getById(@PathVariable int id) {
        return categorieRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Categorie create(@RequestBody Categorie categorie) {
        return categorieRepository.save(categorie);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        categorieRepository.deleteById(id);
    }
}