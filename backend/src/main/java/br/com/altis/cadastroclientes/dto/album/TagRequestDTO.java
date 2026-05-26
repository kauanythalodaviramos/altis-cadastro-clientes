package br.com.altis.cadastroclientes.dto.album;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TagRequestDTO {

    @NotBlank(message = "Nome e obrigatorio")
    @Size(min = 1, max = 50, message = "Tag deve ter entre 1 e 50 caracteres")
    private String nome;
}
