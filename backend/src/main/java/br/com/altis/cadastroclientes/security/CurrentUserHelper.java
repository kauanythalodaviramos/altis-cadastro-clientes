package br.com.altis.cadastroclientes.security;

import br.com.altis.cadastroclientes.entity.User;
import br.com.altis.cadastroclientes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUserHelper {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("Nenhum usuario autenticado");
        }
        Object principal = auth.getPrincipal();
        String email;
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails ud) {
            email = ud.getUsername();
        } else {
            email = principal.toString();
        }
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalStateException("Usuario autenticado nao existe mais: " + email));
    }
}
