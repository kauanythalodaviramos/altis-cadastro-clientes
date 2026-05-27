package br.com.altis.cadastroclientes.repository;

import br.com.altis.cadastroclientes.entity.Foto;
import br.com.altis.cadastroclientes.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FotoRepository extends JpaRepository<Foto, Long>, JpaSpecificationExecutor<Foto> {

    Optional<Foto> findByIdAndUsuario(Long id, User usuario);
    long countByUsuarioAndEmocaoId(User usuario, Long emocaoId);
    long countByUsuarioAndClienteId(User usuario, Long clienteId);
    List<Foto> findByUsuarioAndClienteId(User usuario, Long clienteId);
}
