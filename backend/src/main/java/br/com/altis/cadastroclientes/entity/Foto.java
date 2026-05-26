package br.com.altis.cadastroclientes.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
    name = "FOTOS",
    indexes = {
        @Index(name = "IDX_FOTO_USR", columnList = "USUARIO_ID"),
        @Index(name = "IDX_FOTO_EMOCAO", columnList = "EMOCAO_ID"),
        @Index(name = "IDX_FOTO_CLI", columnList = "CLIENTE_ID")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Foto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USUARIO_ID", nullable = false)
    private User usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "EMOCAO_ID", nullable = false)
    private Emocao emocao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CLIENTE_ID")
    private Cliente cliente;

    @Column(name = "TITULO", length = 150)
    private String titulo;

    @Column(name = "DESCRICAO", length = 500)
    private String descricao;

    @Lob
    @Column(name = "IMAGEM", nullable = false)
    private byte[] imagem;

    @Column(name = "MIME_TYPE", nullable = false, length = 50)
    private String mimeType;

    @Column(name = "LIKES_COUNT", nullable = false)
    private Integer likesCount = 0;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "FOTO_TAGS",
        joinColumns = @JoinColumn(name = "FOTO_ID"),
        inverseJoinColumns = @JoinColumn(name = "TAG_ID")
    )
    private Set<Tag> tags = new HashSet<>();

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.likesCount == null) this.likesCount = 0;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
