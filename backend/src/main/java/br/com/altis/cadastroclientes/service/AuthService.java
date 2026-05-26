package br.com.altis.cadastroclientes.service;

import br.com.altis.cadastroclientes.dto.auth.*;
import br.com.altis.cadastroclientes.entity.User;
import br.com.altis.cadastroclientes.exception.DuplicateResourceException;
import br.com.altis.cadastroclientes.exception.ResourceNotFoundException;
import br.com.altis.cadastroclientes.repository.UserRepository;
import br.com.altis.cadastroclientes.security.CurrentUserHelper;
import br.com.altis.cadastroclientes.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CurrentUserHelper currentUserHelper;
    private final EmocaoService emocaoService;

    @Transactional
    public JwtResponseDTO register(RegisterRequestDTO req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new DuplicateResourceException("email", "Email ja cadastrado");
        }
        User user = new User();
        user.setNome(req.getNome().trim());
        user.setEmail(req.getEmail().trim().toLowerCase());
        user.setSenhaHash(passwordEncoder.encode(req.getSenha()));
        user = userRepository.save(user);

        // Cria emocoes padrao para o novo usuario.
        emocaoService.bootstrapDefault(user);

        return buildJwtResponse(user);
    }

    @Transactional(readOnly = true)
    public JwtResponseDTO login(LoginRequestDTO req) {
        User user = userRepository.findByEmail(req.getEmail().trim().toLowerCase())
            .orElseThrow(() -> new BadCredentialsException("Email ou senha invalidos"));

        if (!passwordEncoder.matches(req.getSenha(), user.getSenhaHash())) {
            throw new BadCredentialsException("Email ou senha invalidos");
        }

        return buildJwtResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO me() {
        return toUserDTO(currentUserHelper.getCurrentUser());
    }

    @Transactional
    public UserResponseDTO updateProfile(UpdateProfileRequestDTO req) {
        User user = currentUserHelper.getCurrentUser();
        String emailNovo = req.getEmail().trim().toLowerCase();

        if (!emailNovo.equals(user.getEmail())) {
            // Mudanca de email exige senha atual
            if (req.getSenhaAtual() == null || req.getSenhaAtual().isBlank()) {
                throw new BadCredentialsException("Para alterar o email, informe a senha atual.");
            }
            if (!passwordEncoder.matches(req.getSenhaAtual(), user.getSenhaHash())) {
                throw new BadCredentialsException("Senha atual incorreta");
            }
            if (userRepository.existsByEmailAndIdNot(emailNovo, user.getId())) {
                throw new DuplicateResourceException("email", "Email ja cadastrado para outra conta");
            }
            user.setEmail(emailNovo);
        }

        user.setNome(req.getNome().trim());
        return toUserDTO(userRepository.save(user));
    }

    @Transactional
    public void changePassword(ChangePasswordRequestDTO req) {
        User user = currentUserHelper.getCurrentUser();
        if (!passwordEncoder.matches(req.getSenhaAtual(), user.getSenhaHash())) {
            throw new BadCredentialsException("Senha atual incorreta");
        }
        user.setSenhaHash(passwordEncoder.encode(req.getSenhaNova()));
        userRepository.save(user);
    }

    @Transactional
    public void uploadFoto(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }
        String mime = file.getContentType();
        if (mime == null || !(mime.equals("image/jpeg") || mime.equals("image/png") || mime.equals("image/webp"))) {
            throw new IllegalArgumentException("Tipo de imagem nao suportado: " + mime);
        }
        if (file.getSize() > 5L * 1024 * 1024) {
            throw new IllegalArgumentException("Arquivo maior que 5MB");
        }

        User user = currentUserHelper.getCurrentUser();
        user.setFoto(file.getBytes());
        user.setFotoMime(mime);
        userRepository.save(user);
    }

    @Transactional
    public void removerFoto() {
        User user = currentUserHelper.getCurrentUser();
        user.setFoto(null);
        user.setFotoMime(null);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User getCurrentUserEntity() {
        return currentUserHelper.getCurrentUser();
    }

    @Transactional(readOnly = true)
    public byte[] getFoto() {
        User user = currentUserHelper.getCurrentUser();
        if (user.getFoto() == null) {
            throw new ResourceNotFoundException("Usuario nao tem foto");
        }
        return user.getFoto();
    }

    @Transactional(readOnly = true)
    public String getFotoMime() {
        User user = currentUserHelper.getCurrentUser();
        return user.getFotoMime();
    }

    private JwtResponseDTO buildJwtResponse(User user) {
        String token = jwtService.generate(user.getEmail(), user.getId());
        return JwtResponseDTO.builder()
            .token(token)
            .tokenType("Bearer")
            .expiresInMs(jwtService.getExpirationMs())
            .user(toUserDTO(user))
            .build();
    }

    private UserResponseDTO toUserDTO(User user) {
        return UserResponseDTO.builder()
            .id(user.getId())
            .nome(user.getNome())
            .email(user.getEmail())
            .temFoto(user.getFoto() != null)
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}
