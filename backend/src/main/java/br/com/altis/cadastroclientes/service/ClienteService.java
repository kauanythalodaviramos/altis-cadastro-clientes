package br.com.altis.cadastroclientes.service;

import br.com.altis.cadastroclientes.dto.ClienteRequestDTO;
import br.com.altis.cadastroclientes.dto.ClienteResponseDTO;
import br.com.altis.cadastroclientes.dto.EnderecoDTO;
import br.com.altis.cadastroclientes.entity.Cliente;
import br.com.altis.cadastroclientes.entity.Endereco;
import br.com.altis.cadastroclientes.entity.User;
import br.com.altis.cadastroclientes.exception.DuplicateResourceException;
import br.com.altis.cadastroclientes.exception.ResourceNotFoundException;
import br.com.altis.cadastroclientes.repository.ClienteRepository;
import br.com.altis.cadastroclientes.repository.FotoRepository;
import br.com.altis.cadastroclientes.security.CurrentUserHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final FotoRepository fotoRepository;
    private final CurrentUserHelper currentUserHelper;

    @Transactional
    public ClienteResponseDTO criar(ClienteRequestDTO request) {
        User usuario = currentUserHelper.getCurrentUser();
        String cpfLimpo = limparDigitos(request.getCpf());
        String telLimpo = limparDigitos(request.getTelefone());

        if (clienteRepository.existsByUsuarioAndCpf(usuario, cpfLimpo)) {
            throw new DuplicateResourceException("cpf", "CPF ja cadastrado");
        }
        if (clienteRepository.existsByUsuarioAndTelefone(usuario, telLimpo)) {
            throw new DuplicateResourceException("telefone", "Telefone ja cadastrado para outro cliente");
        }

        Cliente cliente = new Cliente();
        cliente.setUsuario(usuario);
        cliente.setNome(request.getNome().trim());
        cliente.setCpf(cpfLimpo);
        cliente.setTelefone(telLimpo);
        cliente.setObservacoes(request.getObservacoes());
        cliente.setEndereco(toEndereco(request.getEndereco()));

        return toResponse(clienteRepository.save(cliente));
    }

    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> listar(String filtro) {
        User usuario = currentUserHelper.getCurrentUser();
        List<Cliente> clientes;

        if (filtro == null || filtro.isBlank()) {
            clientes = clienteRepository.findByUsuarioOrderByNomeAsc(usuario);
        } else {
            String filtroTexto = filtro.trim();
            String filtroDigitos = limparDigitos(filtroTexto);
            boolean ehBuscaPorCpf = filtroTexto.matches("[0-9.\\-\\s]+") && filtroDigitos.length() >= 3;
            if (ehBuscaPorCpf) {
                clientes = clienteRepository.findByUsuarioAndCpfContainingOrderByNomeAsc(usuario, filtroDigitos);
            } else {
                clientes = clienteRepository.findByUsuarioAndNomeContainingIgnoreCaseOrderByNomeAsc(usuario, filtroTexto);
            }
        }
        return clientes.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponseDTO buscarPorId(Long id) {
        return toResponse(buscarDoUsuario(id));
    }

    @Transactional
    public ClienteResponseDTO atualizar(Long id, ClienteRequestDTO request) {
        Cliente cliente = buscarDoUsuario(id);
        User usuario = cliente.getUsuario();

        String cpfLimpo = limparDigitos(request.getCpf());
        String telLimpo = limparDigitos(request.getTelefone());

        if (clienteRepository.existsByUsuarioAndCpfAndIdNot(usuario, cpfLimpo, id)) {
            throw new DuplicateResourceException("cpf", "CPF ja cadastrado para outro cliente");
        }
        if (clienteRepository.existsByUsuarioAndTelefoneAndIdNot(usuario, telLimpo, id)) {
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
    public void excluir(Long id, boolean cascade) {
        Cliente cliente = buscarDoUsuario(id);
        User usuario = cliente.getUsuario();

        long countFotos = fotoRepository.countByUsuarioAndClienteId(usuario, id);
        if (countFotos > 0) {
            if (!cascade) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Existem " + countFotos + " foto(s) vinculadas a este cliente. Confirme a exclusao em cascata."
                );
            }
            // Cascade: deleta todas as fotos do cliente primeiro (preserva FOTO_TAGS via JPA)
            List<br.com.altis.cadastroclientes.entity.Foto> fotos = fotoRepository.findByUsuarioAndClienteId(usuario, id);
            fotoRepository.deleteAll(fotos);
        }

        clienteRepository.delete(cliente);
    }

    @Transactional(readOnly = true)
    public long contarFotos(Long clienteId) {
        Cliente cliente = buscarDoUsuario(clienteId);
        return fotoRepository.countByUsuarioAndClienteId(cliente.getUsuario(), clienteId);
    }

    @Transactional(readOnly = true)
    public String exportarCsv(String filtro) {
        List<ClienteResponseDTO> clientes = listar(filtro);
        StringBuilder sb = new StringBuilder();
        sb.append("ID;Nome;CPF;Telefone;CEP;Logradouro;Numero;Complemento;Bairro;Cidade;UF;Observacoes;DataCadastro\n");
        for (ClienteResponseDTO c : clientes) {
            sb.append(c.getId()).append(';')
                .append(esc(c.getNome())).append(';')
                .append(esc(c.getCpf())).append(';')
                .append(esc(c.getTelefone())).append(';');
            if (c.getEndereco() != null) {
                sb.append(esc(c.getEndereco().getCep())).append(';')
                    .append(esc(c.getEndereco().getLogradouro())).append(';')
                    .append(esc(c.getEndereco().getNumero())).append(';')
                    .append(esc(c.getEndereco().getComplemento())).append(';')
                    .append(esc(c.getEndereco().getBairro())).append(';')
                    .append(esc(c.getEndereco().getCidade())).append(';')
                    .append(esc(c.getEndereco().getUf())).append(';');
            } else {
                sb.append(";;;;;;;");
            }
            sb.append(esc(c.getObservacoes())).append(';')
                .append(c.getDataCadastro() != null ? c.getDataCadastro().toString() : "")
                .append('\n');
        }
        return sb.toString();
    }

    private static String esc(String v) {
        if (v == null) return "";
        String s = v.replace("\"", "\"\"").replace("\n", " ").replace("\r", " ");
        if (s.contains(";") || s.contains("\"") || s.contains(",")) {
            return "\"" + s + "\"";
        }
        return s;
    }

    /** Garante que o cliente pertence ao usuario logado. 404 caso contrario. */
    private Cliente buscarDoUsuario(Long id) {
        User usuario = currentUserHelper.getCurrentUser();
        return clienteRepository.findByIdAndUsuario(id, usuario)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente nao encontrado: id=" + id));
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
