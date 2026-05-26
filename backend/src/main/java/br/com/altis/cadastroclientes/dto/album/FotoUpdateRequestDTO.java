package br.com.altis.cadastroclientes.dto.album;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class FotoUpdateRequestDTO {

    @Size(max = 150)
    private String titulo;

    @Size(max = 500)
    private String descricao;

    @NotNull(message = "Emocao e obrigatoria")
    private Long emocaoId;

    private Long clienteId;

    private List<Long> tagIds;
}
