package br.com.altis.cadastroclientes.service;

import br.com.altis.cadastroclientes.dto.ClienteRequestDTO;
import br.com.altis.cadastroclientes.dto.ClienteResponseDTO;
import br.com.altis.cadastroclientes.dto.EnderecoDTO;
import br.com.altis.cadastroclientes.entity.Cliente;
import br.com.altis.cadastroclientes.entity.Endereco;
import br.com.altis.cadastroclientes.exception.DuplicateResourceException;
import br.com.altis.cadastroclientes.exception.ResourceNotFoundException;
import br.com.altis.cadastroclientes.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional
    public ClienteResponseDTO criar(ClienteRequestDTO request) {
        String cpfLimpo = limparDigitos(request.getCpf());
        String telLimpo = limparDigitos(request.getTelefone());

        if (clienteRepository.existsByCpf(cpfLimpo)) {
            throw new DuplicateResourceException("cpf", "CPF ja cadastrado");
        }
        if (clienteRepository.existsByTelefone(telLimpo)) {
            throw new DuplicateResourceException("telefone", "Telefone ja cadastrado para outro cliente");
        }

        Cliente cliente = new Cliente();
        cliente.setNome(request.getNome().trim());
        cliente.setCpf(cpfLimpo);
        cliente.setTelefone(telLimpo);
        cliente.setObservacoes(request.getObservacoes());
        cliente.setEndereco(toEndereco(request.getEndereco()));

        Cliente saved = clienteRepository.save(cliente);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> listar(String filtro) {
        List<Cliente> clientes;
        if (filtro == null || filtro.isBlank()) {
            clientes = clienteRepository.findAllByOrderByNomeAsc();
        } else {
            String filtroDigitos = limparDigitos(filtro);
            clientes = clienteRepository
                .findByNomeContainingIgnoreCaseOrCpfContainingOrderByNomeAsc(filtro.trim(), filtroDigitos);
        }
        return clientes.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponseDTO buscarPorId(Long id) {
        Cliente cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente nao encontrado: id=" + id));
        return toResponse(cliente);
    }

    @Transactional
    public ClienteResponseDTO atualizar(Long id, ClienteRequestDTO request) {
        Cliente cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente nao encontrado: id=" + id));

        String cpfLimpo = limparDigitos(request.getCpf());
        String telLimpo = limparDigitos(request.getTelefone());

        if (clienteRepository.existsByCpfAndIdNot(cpfLimpo, id)) {
            throw new DuplicateResourceException("cpf", "CPF ja cadastrado para outro cliente");
        }
        if (clienteRepository.existsByTelefoneAndIdNot(telLimpo, id)) {
            throw new DuplicateResourceException("telefone", "Telefone ja cadastrado para outro cliente");
        }

        cliente.setNome(request.getNome().trim());
        cliente.setCpf(cpfLimpo);
        cliente.setTelefone(telLimpo);
        cliente.setObservacoes(request.getObservacoes());
        cliente.setEndereco(toEndereco(request.getEndereco()));

        return toResponse(clienteRepository.save(cliente));
    }

    @Transactional
    public void excluir(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cliente nao encontrado: id=" + id);
        }
        clienteRepository.deleteById(id);
    }

    private String limparDigitos(String valor) {
        return valor == null ? null : valor.replaceAll("\\D", "");
    }

    private Endereco toEndereco(EnderecoDTO dto) {
        if (dto == null) return null;
        Endereco e = new Endereco();
        e.setCep(limparDigitos(dto.getCep()));
        e.setLogradouro(dto.getLogradouro());
        e.setNumero(dto.getNumero());
        e.setComplemento(dto.getComplemento());
        e.setBairro(dto.getBairro());
        e.setCidade(dto.getCidade());
        e.setUf(dto.getUf() != null ? dto.getUf().toUpperCase() : null);
        return e;
    }

    private EnderecoDTO toEnderecoDTO(Endereco e) {
        if (e == null) return null;
        EnderecoDTO dto = new EnderecoDTO();
        dto.setCep(e.getCep());
        dto.setLogradouro(e.getLogradouro());
        dto.setNumero(e.getNumero());
        dto.setComplemento(e.getComplemento());
        dto.setBairro(e.getBairro());
        dto.setCidade(e.getCidade());
        dto.setUf(e.getUf());
        return dto;
    }

    private ClienteResponseDTO toResponse(Cliente c) {
        return ClienteResponseDTO.builder()
            .id(c.getId())
            .nome(c.getNome())
            .cpf(c.getCpf())
            .telefone(c.getTelefone())
            .endereco(toEnderecoDTO(c.getEndereco()))
            .observacoes(c.getObservacoes())
            .dataCadastro(c.getDataCadastro())
            .build();
    }
}
