package br.com.altis.cadastroclientes.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Endereco {

    @Column(name = "CEP", length = 9)
    private String cep;

    @Column(name = "LOGRADOURO", length = 200)
    private String logradouro;

    @Column(name = "NUMERO", length = 20)
    private String numero;

    @Column(name = "COMPLEMENTO", length = 100)
    private String complemento;

    @Column(name = "BAIRRO", length = 100)
    private String bairro;

    @Column(name = "CIDADE", length = 100)
    private String cidade;

    @Column(name = "UF", length = 2)
    private String uf;
}
