package net.chaimae.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "points_controle")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointControle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private Integer ordre;
    private Integer dureeMax;
}
