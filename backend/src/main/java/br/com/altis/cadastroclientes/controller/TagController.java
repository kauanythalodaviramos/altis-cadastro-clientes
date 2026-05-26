package br.com.altis.cadastroclientes.controller;

import br.com.altis.cadastroclientes.dto.album.TagDTO;
import br.com.altis.cadastroclientes.dto.album.TagRequestDTO;
import br.com.altis.cadastroclientes.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public List<TagDTO> listar() {
        return tagService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TagDTO criar(@Valid @RequestBody TagRequestDTO req) {
        return tagService.criar(req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        tagService.excluir(id);
    }
}
