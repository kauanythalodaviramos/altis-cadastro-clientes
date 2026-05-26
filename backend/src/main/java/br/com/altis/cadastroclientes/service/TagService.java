package br.com.altis.cadastroclientes.service;

import br.com.altis.cadastroclientes.dto.album.TagDTO;
import br.com.altis.cadastroclientes.dto.album.TagRequestDTO;
import br.com.altis.cadastroclientes.entity.Tag;
import br.com.altis.cadastroclientes.entity.User;
import br.com.altis.cadastroclientes.exception.DuplicateResourceException;
import br.com.altis.cadastroclientes.exception.ResourceNotFoundException;
import br.com.altis.cadastroclientes.repository.TagRepository;
import br.com.altis.cadastroclientes.security.CurrentUserHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final CurrentUserHelper currentUserHelper;

    @Transactional(readOnly = true)
    public List<TagDTO> listar() {
        User u = currentUserHelper.getCurrentUser();
        return tagRepository.findByUsuarioOrderByNomeAsc(u).stream()
            .map(this::toDTO)
            .toList();
    }

    @Transactional
    public TagDTO criar(TagRequestDTO req) {
        User u = currentUserHelper.getCurrentUser();
        String nome = req.getNome().trim();
        if (tagRepository.existsByUsuarioAndNome(u, nome)) {
            throw new DuplicateResourceException("nome", "Tag ja existe");
        }
        Tag t = new Tag();
        t.setUsuario(u);
        t.setNome(nome);
        return toDTO(tagRepository.save(t));
    }

    @Transactional
    public void excluir(Long id) {
        User u = currentUserHelper.getCurrentUser();
        Tag t = tagRepository.findByIdAndUsuario(id, u)
            .orElseThrow(() -> new ResourceNotFoundException("Tag nao encontrada: id=" + id));
        tagRepository.delete(t);
    }

    @Transactional(readOnly = true)
    public Set<Tag> resolverTags(List<Long> ids, User u) {
        if (ids == null || ids.isEmpty()) return Set.of();
        return tagRepository.findByIdInAndUsuario(ids, u);
    }

    private TagDTO toDTO(Tag t) {
        return TagDTO.builder().id(t.getId()).nome(t.getNome()).build();
    }
}
