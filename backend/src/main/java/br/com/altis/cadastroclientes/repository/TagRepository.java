package br.com.altis.cadastroclientes.repository;

import br.com.altis.cadastroclientes.entity.Tag;
import br.com.altis.cadastroclientes.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    List<Tag> findByUsuarioOrderByNomeAsc(User usuario);
    Optional<Tag> findByIdAndUsuario(Long id, User usuario);
    boolean existsByUsuarioAndNome(User usuario, String nome);
    Set<Tag> findByIdInAndUsuario(List<Long> ids, User usuario);
}
