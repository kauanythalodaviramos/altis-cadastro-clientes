package br.com.altis.cadastroclientes.dto.dashboard;

import br.com.altis.cadastroclientes.dto.album.FotoResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalClientes;
    private long totalFotos;
    private long totalEmocoes;
    private long totalTags;
    private long totalLikes;
    private Map<String, Long> clientesPorUf;
    private List<EmocaoStatDTO> fotosPorEmocao;
    private List<FotoResponseDTO> topFotos;
}
