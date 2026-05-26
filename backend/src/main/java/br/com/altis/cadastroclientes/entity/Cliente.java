package br.com.altis.cadastroclientes.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "CLIENTES",
    uniqueConstraints = {
        @UniqueConstraint(name = "UK_CLIENTES_CPF", columnNames = "CPF"),
        @UniqueConstraint(name = "UK_CLIENTES_TELEFONE", columnNames = "TELEFONE")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "NOME", nullable = false, length = 150)
    private String nome;

    @Column(name = "CPF", nullable = false, length = 11)
    private String cpf;

    @Column(name = "TELEFONE", nullable = false, length = 11)
    private String telefone;

    @Embedded
    private Endereco endereco;

    @Column(name = "OBSERVACOES", length = 100)
    private String observacoes;

    @Column(name = "DATA_CADASTRO", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;

    @PrePersist
    void onCreate() {
        this.dataCadastro = LocalDateTime.now();
    }
}
