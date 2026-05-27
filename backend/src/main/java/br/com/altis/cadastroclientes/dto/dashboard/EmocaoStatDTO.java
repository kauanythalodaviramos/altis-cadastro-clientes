package br.com.altis.cadastroclientes.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmocaoStatDTO {
    private String nome;
    private String cor;
    private long total;
}
