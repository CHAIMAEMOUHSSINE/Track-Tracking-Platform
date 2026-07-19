package net.chaimae.backend.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "justifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Justification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String commentaire;
    private LocalDateTime date;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alerte_id", nullable = false, unique = true)
    private Alerte alerte;
}
