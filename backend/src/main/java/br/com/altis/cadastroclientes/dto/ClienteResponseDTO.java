package br.com.altis.cadastroclientes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteResponseDTO {
    private Long id;
    private String nome;
    private String cpf;
    private String telefone;
    private EnderecoDTO endereco;
    private String observacoes;
    private LocalDateTime dataCadastro;
}
