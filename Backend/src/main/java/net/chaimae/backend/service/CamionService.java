package net.chaimae.backend.service;

import lombok.RequiredArgsConstructor;
import net.chaimae.backend.entity.Camion;
import net.chaimae.backend.exception.ResourceNotFoundException;
import net.chaimae.backend.repository.CamionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CamionService {

    private final CamionRepository camionRepository;

    public Page<Camion> lister(Pageable pageable) {
        return camionRepository.findAll(pageable);
    }

    public Camion rechercherParImmatriculation(String immatriculation) {
        return camionRepository.findByImmatriculation(immatriculation)
                .orElseThrow(() -> new ResourceNotFoundException("Camion introuvable: " + immatriculation));
    }

    public Camion getById(Long id) {
        return camionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Camion introuvable: id=" + id));
    }
}
