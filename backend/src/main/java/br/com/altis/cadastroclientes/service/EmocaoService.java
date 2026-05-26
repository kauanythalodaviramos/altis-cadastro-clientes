package br.com.altis.cadastroclientes.service;

import br.com.altis.cadastroclientes.dto.album.EmocaoDTO;
import br.com.altis.cadastroclientes.dto.album.EmocaoRequestDTO;
import br.com.altis.cadastroclientes.entity.Emocao;
import br.com.altis.cadastroclientes.entity.User;
import br.com.altis.cadastroclientes.exception.DuplicateResourceException;
import br.com.altis.cadastroclientes.exception.ResourceNotFoundException;
import br.com.altis.cadastroclientes.repository.EmocaoRepository;
import br.com.altis.cadastroclientes.repository.FotoRepository;
import br.com.altis.cadastroclientes.security.CurrentUserHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmocaoService {

    public static final List<EmocaoSeed> DEFAULTS = List.of(
        new EmocaoSeed("Feliz", "emoji-smile", "#ffc107"),
        new EmocaoSeed("Triste", "emoji-frown", "#6c757d"),
        new EmocaoSeed("Amor", "heart-fill", "#dc3545"),
        new EmocaoSeed("Calmo", "moon", "#0dcaf0"),
        new EmocaoSeed("Animado", "lightning-fill", "#fd7e14"),
        new EmocaoSeed("Nostalgico", "clock-history", "#6f42c1"),
        new EmocaoSeed("Inspirado", "stars", "#20c997"),
        new EmocaoSeed("Outro", "three-dots", "#adb5bd")
    );

    private final EmocaoRepository emocaoRepository;
    private final FotoRepository fotoRepository;
    private final CurrentUserHelper currentUserHelper;

    @Transactional
    public void bootstrapDefault(User user) {
        for (EmocaoSeed seed : DEFAULTS) {
            if (!emocaoRepository.existsByUsuarioAndNome(user, seed.nome)) {
                Emocao e = new Emocao();
                e.setUsuario(user);
                e.setNome(seed.nome);
                e.setIcone(seed.icone);
                e.setCor(seed.cor);
                emocaoRepository.save(e);
            }
        }
    }

    @Transactional
    public List<EmocaoDTO> listar() {
        User u = currentUserHelper.getCurrentUser();
        // Bootstrap idempotente: usuarios criados antes do recurso recebem as emocoes padrao na primeira listagem.
        if (emocaoRepository.countByUsuario(u) == 0) {
            bootstrapDefault(u);
        }
        return emocaoRepository.findByUsuarioOrderByNomeAsc(u).stream()
            .map(this::toDTO)
            .toList();
    }

    @Transactional
    public EmocaoDTO criar(EmocaoRequestDTO req) {
        User u = currentUserHelper.getCurrentUser();
        String nome = req.getNome().trim();
        if (emocaoRepository.existsByUsuarioAndNome(u, nome)) {
            throw new DuplicateResourceException("nome", "Emocao com esse nome ja existe");
        }
        Emocao e = new Emocao();
        e.setUsuario(u);
        e.setNome(nome);
        e.setIcone(req.getIcone());
        e.setCor(normalizarCor(req.getCor()));
        return toDTO(emocaoRepository.save(e));
    }

    @Transactional
    public EmocaoDTO atualizar(Long id, EmocaoRequestDTO req) {
        User u = currentUserHelper.getCurrentUser();
        Emocao e = emocaoRepository.findByIdAndUsuario(id, u)
            .orElseThrow(() -> new ResourceNotFoundException("Emocao nao encontrada: id=" + id));

        String nome = req.getNome().trim();
        if (emocaoRepository.existsByUsuarioAndNomeAndIdNot(u, nome, id)) {
            throw new DuplicateResourceException("nome", "Emocao com esse nome ja existe");
        }
        e.setNome(nome);
        e.setIcone(req.getIcone());
        e.setCor(normalizarCor(req.getCor()));
        return toDTO(emocaoRepository.save(e));
    }

    @Transactional
    public void excluir(Long id) {
        User u = currentUserHelper.getCurrentUser();
        Emocao e = emocaoRepository.findByIdAndUsuario(id, u)
            .orElseThrow(() -> new ResourceNotFoundException("Emocao nao encontrada: id=" + id));

        long count = fotoRepository.countByUsuarioAndEmocaoId(u, id);
        if (count > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Existem " + count + " foto(s) usando essa emocao. Reatribua antes de excluir.");
        }
        emocaoRepository.delete(e);
    }

    @Transactional(readOnly = true)
    public Emocao buscarEntidade(Long id, User u) {
        return emocaoRepository.findByIdAndUsuario(id, u)
            .orElseThrow(() -> new ResourceNotFoundException("Emocao nao encontrada: id=" + id));
    }

    private String normalizarCor(String cor) {
        if (cor == null || cor.isBlank()) return null;
        return cor.startsWith("#") ? cor : "#" + cor;
    }

    private EmocaoDTO toDTO(Emocao e) {
        return EmocaoDTO.builder()
            .id(e.getId())
            .nome(e.getNome())
            .icone(e.getIcone())
            .cor(e.getCor())
            .build();
    }

    public record EmocaoSeed(String nome, String icone, String cor) {}
}
