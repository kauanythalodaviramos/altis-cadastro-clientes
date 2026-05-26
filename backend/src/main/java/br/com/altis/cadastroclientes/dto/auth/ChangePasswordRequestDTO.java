package br.com.altis.cadastroclientes.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequestDTO {

    @NotBlank(message = "Senha atual e obrigatoria")
    private String senhaAtual;

    @NotBlank(message = "Senha nova e obrigatoria")
    @Size(min = 8, max = 100, message = "Senha deve ter no minimo 8 caracteres")
    @Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
        message = "Senha deve conter ao menos uma letra e um numero"
    )
    private String senhaNova;
}
