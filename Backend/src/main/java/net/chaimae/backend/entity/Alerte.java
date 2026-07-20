package net.chaimae.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import net.chaimae.backend.enums.StatutAlerte;

import java.time.LocalDateTime;

@Entity
public class Alerte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime dateHeure;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutAlerte statut = StatutAlerte.OUVERTE;
    /** Temps total constaté du parcours, en minutes */
    private Long tempsTotalMinutes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "camion_id", nullable = false)
    private Camion camion;

    @OneToOne(mappedBy = "alerte", cascade = CascadeType.ALL)
    private Justification justification;
}
