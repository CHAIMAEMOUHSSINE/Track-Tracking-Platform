package net.chaimae.backend.repository;

import net.chaimae.backend.entity.Camion;
import net.chaimae.backend.enums.EtatCamion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface CamionRepository extends JpaRepository<Camion, Long>, JpaSpecificationExecutor<Camion> {
    Optional<Camion> findByImmatriculation(String immatriculation);
    List<Camion> findByEtat(EtatCamion etat);
}
