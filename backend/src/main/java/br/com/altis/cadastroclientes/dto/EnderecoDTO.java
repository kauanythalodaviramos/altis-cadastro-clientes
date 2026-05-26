package br.com.altis.cadastroclientes.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EnderecoDTO {

    @Size(max = 9, message = "CEP deve ter no maximo 9 caracteres")
    private String cep;

    @Size(max = 200, message = "Logradouro deve ter no maximo 200 caracteres")
    private String logradouro;

    @Size(max = 20, message = "Numero deve ter no maximo 20 caracteres")
    private String numero;

    @Size(max = 100, message = "Complemento deve ter no maximo 100 caracteres")
    private String complemento;

    @Size(max = 100, message = "Bairro deve ter no maximo 100 caracteres")
    private String bairro;

    @Size(max = 100, message = "Cidade deve ter no maximo 100 caracteres")
    private String cidade;

    @Size(max = 2, message = "UF deve ter 2 caracteres")
    private String uf;
}
