package br.com.altis.cadastroclientes.repository;

import br.com.altis.cadastroclientes.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByCpf(String cpf);
    boolean existsByTelefone(String telefone);

    boolean existsByCpfAndIdNot(String cpf, Long id);
    boolean existsByTelefoneAndIdNot(String telefone, Long id);

    List<Cliente> findByNomeContainingIgnoreCaseOrderByNomeAsc(String nome);
    List<Cliente> findByCpfContainingOrderByNomeAsc(String cpf);
    List<Cliente> findAllByOrderByNomeAsc();
}
