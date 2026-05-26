package br.com.altis.cadastroclientes.dto.album;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FotoResponseDTO {
    private Long id;
    private String titulo;
    private String descricao;
    private String mimeType;
    private Integer likesCount;
    private String categoria;   // "menos", "mediana", "amada"
    private EmocaoDTO emocao;
    private ClienteResumoDTO cliente;
    private List<TagDTO> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
