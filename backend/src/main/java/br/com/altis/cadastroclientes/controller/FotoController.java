package br.com.altis.cadastroclientes.controller;

import br.com.altis.cadastroclientes.dto.album.FotoResponseDTO;
import br.com.altis.cadastroclientes.dto.album.FotoUpdateRequestDTO;
import br.com.altis.cadastroclientes.dto.album.LikeResponseDTO;
import br.com.altis.cadastroclientes.service.FotoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/fotos")
@RequiredArgsConstructor
public class FotoController {

    private final FotoService fotoService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FotoResponseDTO> upload(
        @RequestParam("file") MultipartFile file,
        @RequestParam("emocaoId") Long emocaoId,
        @RequestParam(value = "clienteId", required = false) Long clienteId,
        @RequestParam(value = "titulo", required = false) String titulo,
        @RequestParam(value = "descricao", required = false) String descricao,
        @RequestParam(value = "tags", required = false) String tagsCsv
    ) throws IOException {
        List<Long> tagIds = parseIds(tagsCsv);
        FotoResponseDTO created = fotoService.upload(file, emocaoId, clienteId, titulo, descricao, tagIds);
        return ResponseEntity.created(URI.create("/api/fotos/" + created.getId())).body(created);
    }

    @GetMapping
    public List<FotoResponseDTO> listar(
        @RequestParam(value = "emocoes", required = false) String emocoesCsv,
        @RequestParam(value = "tags", required = false) String tagsCsv,
        @RequestParam(value = "clienteId", required = false) Long clienteId,
        @RequestParam(value = "favoritismo", required = false) String favoritismo,
        @RequestParam(value = "order", required = false) String order
    ) {
        return fotoService.listar(parseIds(emocoesCsv), parseIds(tagsCsv), clienteId, favoritismo, order);
    }

    @GetMapping("/lootbox")
    public List<FotoResponseDTO> lootbox(
        @RequestParam(value = "emocoes", required = false) String emocoesCsv,
        @RequestParam(value = "tags", required = false) String tagsCsv,
        @RequestParam(value = "clienteId", required = false) Long clienteId,
        @RequestParam(value = "favoritismo", required = false) String favoritismo
    ) {
        return fotoService.lootbox(parseIds(emocoesCsv), parseIds(tagsCsv), clienteId, favoritismo);
    }

    @GetMapping("/{id}")
    public FotoResponseDTO buscar(@PathVariable Long id) {
        return fotoService.buscarPorId(id);
    }

    @GetMapping("/{id}/imagem")
    public ResponseEntity<byte[]> getImagem(@PathVariable Long id) {
        byte[] bytes = fotoService.getImagem(id);
        String mime = fotoService.getMimeType(id);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(mime != null ? mime : "image/jpeg"))
            .header("Cache-Control", "max-age=300")
            .body(bytes);
    }

    @PutMapping("/{id}")
    public FotoResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody FotoUpdateRequestDTO req) {
        return fotoService.atualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        fotoService.excluir(id);
    }

    @PostMapping("/{id}/like")
    public LikeResponseDTO like(@PathVariable Long id) {
        return fotoService.like(id);
    }

    @DeleteMapping("/{id}/like")
    public LikeResponseDTO unlike(@PathVariable Long id) {
        return fotoService.unlike(id);
    }

    private List<Long> parseIds(String csv) {
        if (csv == null || csv.isBlank()) return null;
        return Arrays.stream(csv.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(Long::valueOf)
            .toList();
    }
}
