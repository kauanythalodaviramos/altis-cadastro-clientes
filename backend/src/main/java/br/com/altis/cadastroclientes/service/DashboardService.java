package br.com.altis.cadastroclientes.service;

import br.com.altis.cadastroclientes.dto.album.ClienteResumoDTO;
import br.com.altis.cadastroclientes.dto.album.EmocaoDTO;
import br.com.altis.cadastroclientes.dto.album.FotoResponseDTO;
import br.com.altis.cadastroclientes.dto.album.TagDTO;
import br.com.altis.cadastroclientes.dto.dashboard.DashboardStatsDTO;
import br.com.altis.cadastroclientes.dto.dashboard.EmocaoStatDTO;
import br.com.altis.cadastroclientes.entity.Cliente;
import br.com.altis.cadastroclientes.entity.Foto;
import br.com.altis.cadastroclientes.entity.User;
import br.com.altis.cadastroclientes.repository.ClienteRepository;
import br.com.altis.cadastroclientes.repository.EmocaoRepository;
import br.com.altis.cadastroclientes.repository.FotoRepository;
import br.com.altis.cadastroclientes.repository.TagRepository;
import br.com.altis.cadastroclientes.security.CurrentUserHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClienteRepository clienteRepository;
    private final FotoRepository fotoRepository;
    private final EmocaoRepository emocaoRepository;
    private final TagRepository tagRepository;
    private final CurrentUserHelper currentUserHelper;

    @Transactional(readOnly = true)
    public DashboardStatsDTO stats() {
        User u = currentUserHelper.getCurrentUser();
        List<Cliente> clientes = clienteRepository.findByUsuarioOrderByNomeAsc(u);
        Specification<Foto> spec = (root, q, cb) -> cb.equal(root.get("usuario"), u);
        List<Foto> fotos = fotoRepository.findAll(spec);

        Map<String, Long> porUf = new LinkedHashMap<>();
        for (Cliente c : clientes) {
            String uf = c.getEndereco() != null && c.getEndereco().getUf() != null && !c.getEndereco().getUf().isBlank()
                ? c.getEndereco().getUf() : "—";
            porUf.merge(uf, 1L, Long::sum);
        }

        Map<Long, EmocaoStatDTO> emocaoStats = new HashMap<>();
        long totalLikes = 0;
        for (Foto f : fotos) {
            totalLikes += f.getLikesCount() != null ? f.getLikesCount() : 0;
            EmocaoStatDTO stat = emocaoStats.computeIfAbsent(f.getEmocao().getId(), id -> EmocaoStatDTO.builder()
                .nome(f.getEmocao().getNome())
                .cor(f.getEmocao().getCor())
                .total(0)
                .build());
            stat.setTotal(stat.getTotal() + 1);
        }

        List<EmocaoStatDTO> fotosPorEmocao = emocaoStats.values().stream()
            .sorted((a, b) -> Long.compare(b.getTotal(), a.getTotal()))
            .toList();

        List<Foto> top = fotoRepository.findAll(spec, PageRequest.of(0, 5, Sort.by("likesCount").descending())).getContent();
        List<FotoResponseDTO> topFotos = top.stream().map(this::toFotoDTO).toList();

        return DashboardStatsDTO.builder()
            .totalClientes(clientes.size())
            .totalFotos(fotos.size())
            .totalEmocoes(emocaoRepository.countByUsuario(u))
            .totalTags(tagRepository.findByUsuarioOrderByNomeAsc(u).size())
            .totalLikes(totalLikes)
            .clientesPorUf(porUf)
            .fotosPorEmocao(fotosPorEmocao)
            .topFotos(topFotos)
            .build();
    }

    private FotoResponseDTO toFotoDTO(Foto f) {
        EmocaoDTO emocao = EmocaoDTO.builder()
            .id(f.getEmocao().getId())
            .nome(f.getEmocao().getNome())
            .icone(f.getEmocao().getIcone())
            .cor(f.getEmocao().getCor())
            .build();
        ClienteResumoDTO cliente = f.getCliente() == null ? null :
            ClienteResumoDTO.builder().id(f.getCliente().getId()).nome(f.getCliente().getNome()).build();
        return FotoResponseDTO.builder()
            .id(f.getId())
            .titulo(f.getTitulo())
            .descricao(f.getDescricao())
            .mimeType(f.getMimeType())
            .likesCount(f.getLikesCount())
            .categoria(FotoService.categoriaFromLikes(f.getLikesCount()))
            .emocao(emocao)
            .cliente(cliente)
            .tags(List.of())
            .createdAt(f.getCreatedAt())
            .updatedAt(f.getUpdatedAt())
            .build();
    }
}
