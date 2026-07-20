package net.chaimae.backend.repository;

import net.chaimae.backend.entity.Camion;
import net.chaimae.backend.entity.Passage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PassageRepository extends JpaRepository<Passage, Long> {
    List<Passage> findByCamionOrderByDateHeureAsc(Camion camion);
    Optional<Passage> findTopByCamionOrderByDateHeureDesc(Camion camion);
    List<Passage> findByDateHeureBetween(LocalDateTime start, LocalDateTime end);

    /** Camions actuellement "en cours" = dernier passage != porte de sortie, sur la journée courante. */
    @org.springframework.data.jpa.repository.Query("""
        select p from Passage p
        where p.dateHeure = (
            select max(p2.dateHeure) from Passage p2 where p2.camion = p.camion
        )
    """)
    List<Passage> findDerniersPassages();
}

