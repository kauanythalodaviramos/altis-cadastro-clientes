package br.com.altis.cadastroclientes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.validator.constraints.br.CPF;

@Data
public class ClienteRequestDTO {

    @NotBlank(message = "Nome e obrigatorio")
    @Size(min = 10, max = 150, message = "Nome deve ter no minimo 10 e no maximo 150 caracteres")
    private String nome;

    @NotBlank(message = "CPF e obrigatorio")
    @CPF(message = "CPF invalido")
    private String cpf;

    @NotBlank(message = "Telefone e obrigatorio")
    @Pattern(
        regexp = "^\\d{10,11}$",
        message = "Telefone deve conter 10 ou 11 digitos numericos (somente numeros, sem mascara)"
    )
    private String telefone;

    @Valid
    private EnderecoDTO endereco;

    @Size(max = 100, message = "Observacoes deve ter no maximo 100 caracteres")
    private String observacoes;
}
