package br.com.altis.cadastroclientes.controller;

import br.com.altis.cadastroclientes.dto.album.EmocaoDTO;
import br.com.altis.cadastroclientes.dto.album.EmocaoRequestDTO;
import br.com.altis.cadastroclientes.service.EmocaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emocoes")
@RequiredArgsConstructor
public class EmocaoController {

    private final EmocaoService emocaoService;

    @GetMapping
    public List<EmocaoDTO> listar() {
        return emocaoService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmocaoDTO criar(@Valid @RequestBody EmocaoRequestDTO req) {
        return emocaoService.criar(req);
    }

    @PutMapping("/{id}")
    public EmocaoDTO atualizar(@PathVariable Long id, @Valid @RequestBody EmocaoRequestDTO req) {
        return emocaoService.atualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        emocaoService.excluir(id);
    }
}
