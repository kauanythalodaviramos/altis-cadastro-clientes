package br.com.altis.cadastroclientes.dto.album;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EmocaoRequestDTO {

    @NotBlank(message = "Nome e obrigatorio")
    @Size(min = 1, max = 50, message = "Nome deve ter entre 1 e 50 caracteres")
    private String nome;

    @Size(max = 50)
    private String icone;

    @Pattern(regexp = "^#?[0-9a-fA-F]{6}$|^$", message = "Cor deve ser hex tipo #RRGGBB")
    private String cor;
}
