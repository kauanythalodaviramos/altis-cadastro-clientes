package br.com.altis.cadastroclientes.controller;

import br.com.altis.cadastroclientes.dto.ClienteRequestDTO;
import br.com.altis.cadastroclientes.dto.ClienteResponseDTO;
import br.com.altis.cadastroclientes.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @PostMapping
    public ResponseEntity<ClienteResponseDTO> criar(@Valid @RequestBody ClienteRequestDTO request) {
        ClienteResponseDTO created = clienteService.criar(request);
        URI location = URI.create("/api/clientes/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping
    public List<ClienteResponseDTO> listar(@RequestParam(name = "filtro", required = false) String filtro) {
        return clienteService.listar(filtro);
    }

    @GetMapping("/{id}")
    public ClienteResponseDTO buscar(@PathVariable Long id) {
        return clienteService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public ClienteResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequestDTO request) {
        return clienteService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        clienteService.excluir(id);
    }
}
