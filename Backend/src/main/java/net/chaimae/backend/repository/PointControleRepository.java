package net.chaimae.backend.repository;

import net.chaimae.backend.entity.PointControle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PointControleRepository extends JpaRepository<PointControle, Long> {
    Optional<PointControle> findByNom(String nom);
}

