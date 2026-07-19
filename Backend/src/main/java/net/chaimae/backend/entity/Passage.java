package net.chaimae.backend.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "passages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder

public class Passage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Camion camion;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "point_controle_id", nullable = false)
    private PointControle pointControle;
}
