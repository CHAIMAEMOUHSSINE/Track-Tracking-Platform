package net.chaimae.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import net.chaimae.backend.enums.StatutCamera;

@Entity
@Table(name = "cameras_anpr")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CameraANPR {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String emplacement;

    @Builder.Default
    private StatutCamera statut = StatutCamera.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "point_controle_id", nullable = false)
    private PointControle pointControle;
}
