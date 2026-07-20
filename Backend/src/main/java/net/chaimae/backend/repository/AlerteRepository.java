package net.chaimae.backend.repository;

import net.chaimae.backend.entity.Alerte;
import net.chaimae.backend.enums.StatutAlerte;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.awt.print.Pageable;
import java.time.LocalDateTime;
import java.util.List;

public interface AlerteRepository extends JpaRepository<Alerte, Long> {
    Page<Alerte> findByStatut(StatutAlerte statut, Pageable pageable);
    List<Alerte> findByDateHeureBetween(LocalDateTime start, LocalDateTime end);
    long countByStatut(StatutAlerte statut);
}
