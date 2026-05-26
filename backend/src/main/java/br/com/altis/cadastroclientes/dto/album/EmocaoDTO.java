package br.com.altis.cadastroclientes.dto.album;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmocaoDTO {
    private Long id;
    private String nome;
    private String icone;
    private String cor;
}
