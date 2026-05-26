package br.com.altis.cadastroclientes.repository;

import br.com.altis.cadastroclientes.entity.Emocao;
import br.com.altis.cadastroclientes.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmocaoRepository extends JpaRepository<Emocao, Long> {

    List<Emocao> findByUsuarioOrderByNomeAsc(User usuario);
    Optional<Emocao> findByIdAndUsuario(Long id, User usuario);
    boolean existsByUsuarioAndNome(User usuario, String nome);
    boolean existsByUsuarioAndNomeAndIdNot(User usuario, String nome, Long id);
    long countByUsuario(User usuario);
}
