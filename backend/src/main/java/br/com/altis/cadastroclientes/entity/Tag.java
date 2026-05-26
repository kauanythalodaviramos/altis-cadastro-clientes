package br.com.altis.cadastroclientes.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "TAGS",
    uniqueConstraints = {
        @UniqueConstraint(name = "UK_TAG_USR_NOME", columnNames = {"USUARIO_ID", "NOME"})
    },
    indexes = {
        @Index(name = "IDX_TAG_USR", columnList = "USUARIO_ID")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USUARIO_ID", nullable = false)
    private User usuario;

    @Column(name = "NOME", nullable = false, length = 50)
    private String nome;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
