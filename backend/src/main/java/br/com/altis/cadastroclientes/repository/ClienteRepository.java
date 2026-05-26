package br.com.altis.cadastroclientes.repository;

import br.com.altis.cadastroclientes.entity.Cliente;
import br.com.altis.cadastroclientes.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByIdAndUsuario(Long id, User usuario);

    boolean existsByUsuarioAndCpf(User usuario, String cpf);
    boolean existsByUsuarioAndTelefone(User usuario, String telefone);
    boolean existsByUsuarioAndCpfAndIdNot(User usuario, String cpf, Long id);
    boolean existsByUsuarioAndTelefoneAndIdNot(User usuario, String telefone, Long id);

    List<Cliente> findByUsuarioOrderByNomeAsc(User usuario);
    List<Cliente> findByUsuarioAndNomeContainingIgnoreCaseOrderByNomeAsc(User usuario, String nome);
    List<Cliente> findByUsuarioAndCpfContainingOrderByNomeAsc(User usuario, String cpf);
}
