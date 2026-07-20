package net.chaimae.backend.service;

import lombok.RequiredArgsConstructor;
import net.chaimae.backend.dto.AlerteResponse;
import net.chaimae.backend.dto.JustificationRequest;
import net.chaimae.backend.entity.Alerte;
import net.chaimae.backend.entity.Justification;
import net.chaimae.backend.enums.StatutAlerte;
import net.chaimae.backend.exception.BusinessException;
import net.chaimae.backend.exception.ResourceNotFoundException;
import net.chaimae.backend.repository.AlerteRepository;
import net.chaimae.backend.repository.JustificationRepository;
import net.chaimae.backend.repository.ServiceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class AlerteService {

    private final AlerteRepository alerteRepository;
    private final JustificationRepository justificationRepository;
    private final ServiceRepository serviceRepository;

    public Page<AlerteResponse> lister(StatutAlerte statut, Pageable pageable) {
        Page<Alerte> page = (statut != null)
                ? alerteRepository.findByStatut(statut, pageable)
                : alerteRepository.findAll(pageable);
        return page.map(this::toResponse);
    }

    @Transactional
    public AlerteResponse justifier(JustificationRequest request) {
        Alerte alerte = alerteRepository.findById(request.alerteId())
                .orElseThrow(() -> new ResourceNotFoundException("Alerte introuvable"));

        if (alerte.getJustification() != null) {
            throw new BusinessException("Cette alerte est déjà justifiée");
        }

        net.chaimae.backend.entity.Service service = serviceRepository.findById(request.serviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service introuvable"));

        Justification justification = Justification.builder()
                .cause(request.cause())
                .commentaire(request.commentaire())
                .date(LocalDateTime.now())
                .service(service)
                .alerte(alerte)
                .build();
        justificationRepository.save(justification);

        alerte.setStatut(StatutAlerte.JUSTIFIEE);
        alerteRepository.save(alerte);

        return toResponse(alerte);
    }

    @Transactional
    public AlerteResponse modifierJustification(Long alerteId, JustificationRequest request) {
        Alerte alerte = alerteRepository.findById(alerteId)
                .orElseThrow(() -> new ResourceNotFoundException("Alerte introuvable"));
        Justification justification = alerte.getJustification();
        if (justification == null) {
            throw new BusinessException("Aucune justification existante pour cette alerte");
        }
        justification.setCause(request.cause());
        justification.setCommentaire(request.commentaire());
        justificationRepository.save(justification);
        return toResponse(alerte);
    }

    private AlerteResponse toResponse(Alerte alerte) {
        return new AlerteResponse(
                alerte.getId(),
                alerte.getCamion().getImmatriculation(),
                alerte.getDateHeure(),
                alerte.getTempsTotalMinutes(),
                alerte.getStatut(),
                alerte.getJustification() != null ? alerte.getJustification().getCause().name() : null
        );
    }
}
