package net.chaimae.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import net.chaimae.backend.enums.EtatCamion;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "camions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Camion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String immatriculation;
    private String transporteur;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EtatCamion etat = EtatCamion.VERT;

    @Builder.Default
    @OneToMany(mappedBy = "camion", cascade = CascadeType.ALL)
    private List<Passage> passages = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "camion", cascade = CascadeType.ALL)
    private List<Alerte> alertes = new ArrayList<>();
}
