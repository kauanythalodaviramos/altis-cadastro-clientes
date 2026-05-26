package br.com.altis.cadastroclientes.controller;

import br.com.altis.cadastroclientes.dto.auth.*;
import br.com.altis.cadastroclientes.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public JwtResponseDTO register(@Valid @RequestBody RegisterRequestDTO req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public JwtResponseDTO login(@Valid @RequestBody LoginRequestDTO req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public UserResponseDTO me() {
        return authService.me();
    }

    @PutMapping("/me")
    public UserResponseDTO updateProfile(@Valid @RequestBody UpdateProfileRequestDTO req) {
        return authService.updateProfile(req);
    }

    @PutMapping("/me/senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@Valid @RequestBody ChangePasswordRequestDTO req) {
        authService.changePassword(req);
    }

    @GetMapping("/me/foto")
    public ResponseEntity<byte[]> getFoto() {
        byte[] bytes = authService.getFoto();
        String mime = authService.getFotoMime();
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(mime != null ? mime : "image/jpeg"))
            .header("Cache-Control", "no-cache, must-revalidate")
            .body(bytes);
    }

    @PutMapping(path = "/me/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadFoto(@RequestParam("file") MultipartFile file) throws IOException {
        authService.uploadFoto(file);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/me/foto")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerFoto() {
        authService.removerFoto();
    }
}
