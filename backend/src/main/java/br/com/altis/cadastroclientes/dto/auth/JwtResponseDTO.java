package br.com.altis.cadastroclientes.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponseDTO {
    private String token;
    private String tokenType;       // "Bearer"
    private Long expiresInMs;
    private UserResponseDTO user;
}
