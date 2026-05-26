package br.com.altis.cadastroclientes.service;

import br.com.altis.cadastroclientes.dto.album.*;
import br.com.altis.cadastroclientes.entity.*;
import br.com.altis.cadastroclientes.exception.ResourceNotFoundException;
import br.com.altis.cadastroclientes.repository.ClienteRepository;
import br.com.altis.cadastroclientes.repository.EmocaoRepository;
import br.com.altis.cadastroclientes.repository.FotoRepository;
import br.com.altis.cadastroclientes.security.CurrentUserHelper;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FotoService {

    private static final Set<String> MIMES_ACEITOS = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;

    private final FotoRepository fotoRepository;
    private final EmocaoRepository emocaoRepository;
    private final ClienteRepository clienteRepository;
    private final TagService tagService;
    private final CurrentUserHelper currentUserHelper;

    @Transactional
    public FotoResponseDTO upload(MultipartFile file, Long emocaoId, Long clienteId,
                                  String titulo, String descricao, List<Long> tagIds) throws IOException {
        validarArquivo(file);
        User u = currentUserHelper.getCurrentUser();

        Emocao emocao = emocaoRepository.findByIdAndUsuario(emocaoId, u)
            .orElseThrow(() -> new ResourceNotFoundException("Emocao nao encontrada: id=" + emocaoId));

        Cliente cliente = null;
        if (clienteId != null) {
            cliente = clienteRepository.findByIdAndUsuario(clienteId, u)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente nao encontrado: id=" + clienteId));
        }

        Foto foto = new Foto();
        foto.setUsuario(u);
        foto.setEmocao(emocao);
        foto.setCliente(cliente);
        foto.setTitulo(titulo);
        foto.setDescricao(descricao);
        foto.setImagem(file.getBytes());
        foto.setMimeType(file.getContentType());
        foto.setLikesCount(0);
        foto.setTags(new HashSet<>(tagService.resolverTags(tagIds, u)));

        return toDTO(fotoRepository.save(foto));
    }

    @Transactional(readOnly = true)
    public List<FotoResponseDTO> listar(List<Long> emocoes, List<Long> tags, Long clienteId,
                                        String favoritismo, String order) {
        User u = currentUserHelper.getCurrentUser();
        Specification<Foto> spec = buildSpec(u, emocoes, tags, clienteId, favoritismo);
        return fotoRepository.findAll(spec, sortFromOrder(order)).stream()
            .map(this::toDTO)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<FotoResponseDTO> lootbox(List<Long> emocoes, List<Long> tags, Long clienteId, String favoritismo) {
        User u = currentUserHelper.getCurrentUser();
        Specification<Foto> spec = buildSpec(u, emocoes, tags, clienteId, favoritismo);
        return fotoRepository.findAll(spec, PageRequest.of(0, 3, Sort.by("likesCount").descending()))
            .stream()
            .map(this::toDTO)
            .toList();
    }

    private Specification<Foto> buildSpec(User u, List<Long> emocoes, List<Long> tags,
                                          Long clienteId, String favoritismo) {
        Specification<Foto> spec = porUsuario(u);
        if (emocoes != null && !emocoes.isEmpty()) spec = spec.and(porEmocoes(emocoes));
        if (tags != null && !tags.isEmpty()) spec = spec.and(porTags(tags));
        if (clienteId != null) spec = spec.and(porCliente(clienteId));
        Specification<Foto> favSpec = porFavoritismo(favoritismo);
        if (favSpec != null) spec = spec.and(favSpec);
        return spec;
    }

    @Transactional(readOnly = true)
    public FotoResponseDTO buscarPorId(Long id) {
        return toDTO(buscarEntidade(id));
    }

    @Transactional
    public FotoResponseDTO atualizar(Long id, FotoUpdateRequestDTO req) {
        Foto foto = buscarEntidade(id);
        User u = foto.getUsuario();

        Emocao emocao = emocaoRepository.findByIdAndUsuario(req.getEmocaoId(), u)
            .orElseThrow(() -> new ResourceNotFoundException("Emocao nao encontrada: id=" + req.getEmocaoId()));

        Cliente cliente = null;
        if (req.getClienteId() != null) {
            cliente = clienteRepository.findByIdAndUsuario(req.getClienteId(), u)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente nao encontrado: id=" + req.getClienteId()));
        }

        foto.setTitulo(req.getTitulo());
        foto.setDescricao(req.getDescricao());
        foto.setEmocao(emocao);
        foto.setCliente(cliente);
        foto.setTags(new HashSet<>(tagService.resolverTags(req.getTagIds(), u)));

        return toDTO(fotoRepository.save(foto));
    }

    @Transactional
    public void excluir(Long id) {
        Foto foto = buscarEntidade(id);
        fotoRepository.delete(foto);
    }

    @Transactional
    public LikeResponseDTO like(Long id) {
        Foto foto = buscarEntidade(id);
        foto.setLikesCount(foto.getLikesCount() + 1);
        Foto saved = fotoRepository.save(foto);
        return LikeResponseDTO.builder()
            .id(saved.getId())
            .likesCount(saved.getLikesCount())
            .categoria(categoriaFromLikes(saved.getLikesCount()))
            .build();
    }

    @Transactional
    public LikeResponseDTO unlike(Long id) {
        Foto foto = buscarEntidade(id);
        int novo = Math.max(0, foto.getLikesCount() - 1);
        foto.setLikesCount(novo);
        Foto saved = fotoRepository.save(foto);
        return LikeResponseDTO.builder()
            .id(saved.getId())
            .likesCount(saved.getLikesCount())
            .categoria(categoriaFromLikes(saved.getLikesCount()))
            .build();
    }

    @Transactional(readOnly = true)
    public byte[] getImagem(Long id) {
        return buscarEntidade(id).getImagem();
    }

    @Transactional(readOnly = true)
    public String getMimeType(Long id) {
        return buscarEntidade(id).getMimeType();
    }

    private Foto buscarEntidade(Long id) {
        User u = currentUserHelper.getCurrentUser();
        return fotoRepository.findByIdAndUsuario(id, u)
            .orElseThrow(() -> new ResourceNotFoundException("Foto nao encontrada: id=" + id));
    }

    private void validarArquivo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }
        String mime = file.getContentType();
        if (mime == null || !MIMES_ACEITOS.contains(mime)) {
            throw new IllegalArgumentException("Tipo de imagem nao suportado: " + mime);
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("Arquivo maior que 5MB");
        }
    }

    // ========== Specifications ==========
    private static Specification<Foto> porUsuario(User u) {
        return (root, q, cb) -> cb.equal(root.get("usuario"), u);
    }

    private static Specification<Foto> porEmocoes(List<Long> ids) {
        return (root, q, cb) -> root.get("emocao").get("id").in(ids);
    }

    private static Specification<Foto> porTags(List<Long> ids) {
        return (root, q, cb) -> {
            if (q != null) q.distinct(true);
            return root.join("tags", JoinType.INNER).get("id").in(ids);
        };
    }

    private static Specification<Foto> porCliente(Long clienteId) {
        return (root, q, cb) -> cb.equal(root.get("cliente").get("id"), clienteId);
    }

    private static Specification<Foto> porFavoritismo(String favoritismo) {
        if (favoritismo == null || favoritismo.isBlank()) return null;
        return switch (favoritismo) {
            case "amados" -> (root, q, cb) -> cb.greaterThan(root.get("likesCount"), 10);
            case "medianos" -> (root, q, cb) -> cb.between(root.get("likesCount"), 3, 10);
            case "menos" -> (root, q, cb) -> cb.lessThan(root.get("likesCount"), 3);
            default -> null;
        };
    }

    private Sort sortFromOrder(String order) {
        if (order == null) return Sort.by("createdAt").descending();
        return switch (order) {
            case "likes_desc" -> Sort.by("likesCount").descending().and(Sort.by("createdAt").descending());
            case "likes_asc" -> Sort.by("likesCount").ascending().and(Sort.by("createdAt").descending());
            case "recent" -> Sort.by("createdAt").descending();
            default -> Sort.by("createdAt").descending();
        };
    }

    public static String categoriaFromLikes(Integer likes) {
        if (likes == null) return "menos";
        if (likes > 10) return "amada";
        if (likes >= 3) return "mediana";
        return "menos";
    }

    private FotoResponseDTO toDTO(Foto f) {
        EmocaoDTO emocaoDTO = EmocaoDTO.builder()
            .id(f.getEmocao().getId())
            .nome(f.getEmocao().getNome())
            .icone(f.getEmocao().getIcone())
            .cor(f.getEmocao().getCor())
            .build();

        ClienteResumoDTO clienteDTO = null;
        if (f.getCliente() != null) {
            clienteDTO = ClienteResumoDTO.builder()
                .id(f.getCliente().getId())
                .nome(f.getCliente().getNome())
                .build();
        }

        List<TagDTO> tagsDTO = f.getTags() == null ? List.of() :
            f.getTags().stream()
                .map(t -> TagDTO.builder().id(t.getId()).nome(t.getNome()).build())
                .sorted((a, b) -> a.getNome().compareToIgnoreCase(b.getNome()))
                .toList();

        return FotoResponseDTO.builder()
            .id(f.getId())
            .titulo(f.getTitulo())
            .descricao(f.getDescricao())
            .mimeType(f.getMimeType())
            .likesCount(f.getLikesCount())
            .categoria(categoriaFromLikes(f.getLikesCount()))
            .emocao(emocaoDTO)
            .cliente(clienteDTO)
            .tags(tagsDTO)
            .createdAt(f.getCreatedAt())
            .updatedAt(f.getUpdatedAt())
            .build();
    }
}
