package net.chaimae.backend.service;

import lombok.RequiredArgsConstructor;
import net.chaimae.backend.dto.CamionSuiviResponse;
import net.chaimae.backend.dto.DetectionEventRequest;
import net.chaimae.backend.entity.Alerte;
import net.chaimae.backend.entity.Camion;
import net.chaimae.backend.entity.Passage;
import net.chaimae.backend.entity.PointControle;
import net.chaimae.backend.enums.EtatCamion;
import net.chaimae.backend.enums.StatutAlerte;
import net.chaimae.backend.exception.ResourceNotFoundException;
import net.chaimae.backend.repository.AlerteRepository;
import net.chaimae.backend.repository.CamionRepository;
import net.chaimae.backend.repository.PassageRepository;
import net.chaimae.backend.repository.PointControleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Cœur métier de la plateforme :
 * - reçoit les événements de détection ANPR (venant du microservice Python via /api/anpr/webhook)
 * - crée le Camion s'il n'existe pas encore
 * - enregistre un Passage au point de contrôle concerné
 * - calcule le temps écoulé à chaque étape et le temps total du parcours
 * - déclenche automatiquement une Alerte en cas de dépassement de seuil (45 min au total,
 *   ou dépassement d'une étape individuelle)
 */
@Service
@RequiredArgsConstructor
public class SuiviCamionService {

    private final CamionRepository camionRepository;
    private final PointControleRepository pointControleRepository;
    private final PassageRepository passageRepository;
    private final AlerteRepository alerteRepository;

    @Value("${app.seuils.total-minutes}")
    private long seuilTotalMinutes;

    private static final String PORTE_SORTIE = "PORTE_SORTIE";
    private static final String PORTE_ENTREE = "PORTE_ENTREE";

    @Transactional
    public CamionSuiviResponse enregistrerPassage(DetectionEventRequest event) {
        Camion camion = camionRepository.findByImmatriculation(event.immatriculation())
                .orElseGet(() -> camionRepository.save(
                        Camion.builder()
                                .immatriculation(event.immatriculation())
                                .transporteur("Inconnu")
                                .etat(EtatCamion.VERT)
                                .build()));

        PointControle pointControle = pointControleRepository.findByNom(event.pointControleNom())
                .orElseThrow(() -> new ResourceNotFoundException("Point de contrôle inconnu: " + event.pointControleNom()));

        Passage passage = Passage.builder()
                .camion(camion)
                .pointControle(pointControle)
                .dateHeure(event.dateHeure() != null ? event.dateHeure() : LocalDateTime.now())
                .build();
        passageRepository.save(passage);

        // Vérifie le dépassement de durée sur l'étape qui vient de se terminer
        verifierDureeEtape(camion, pointControle, passage);

        // Si le camion vient de franchir la porte de sortie -> calcul du temps total du parcours
        if (PORTE_SORTIE.equals(pointControle.getNom())) {
            calculerTempsTotalEtGenererAlerte(camion);
        } else {
            mettreAJourEtatCamion(camion);
        }

        return toSuiviResponse(camion);
    }

    /** Compare la durée passée à l'étape précédente avec le seuil dureeMax défini sur le PointControle. */
    private void verifierDureeEtape(Camion camion, PointControle pointControleActuel, Passage passageActuel) {
        List<Passage> historique = passageRepository.findByCamionOrderByDateHeureAsc(camion);
        if (historique.size() < 2) return;

        Passage precedent = historique.get(historique.size() - 2);
        PointControle etapePrecedente = precedent.getPointControle();

        if (etapePrecedente.getDureeMax() != null) {
            long minutes = Duration.between(precedent.getDateHeure(), passageActuel.getDateHeure()).toMinutes();
            if (minutes > etapePrecedente.getDureeMax()) {
                camion.setEtat(EtatCamion.ORANGE);
                camionRepository.save(camion);
            }
        }
    }

    private void calculerTempsTotalEtGenererAlerte(Camion camion) {
        List<Passage> historique = passageRepository.findByCamionOrderByDateHeureAsc(camion);
        Optional<Passage> entree = historique.stream()
                .filter(p -> PORTE_ENTREE.equals(p.getPointControle().getNom())).findFirst();
        Optional<Passage> sortie = historique.stream()
                .filter(p -> PORTE_SORTIE.equals(p.getPointControle().getNom())).reduce((a, b) -> b);

        if (entree.isEmpty() || sortie.isEmpty()) return;

        long tempsTotalMinutes = Duration.between(entree.get().getDateHeure(), sortie.get().getDateHeure()).toMinutes();

        if (tempsTotalMinutes > seuilTotalMinutes) {
            camion.setEtat(EtatCamion.ROUGE);
            Alerte alerte = Alerte.builder()
                    .camion(camion)
                    .dateHeure(LocalDateTime.now())
                    .statut(StatutAlerte.OUVERTE)
                    .tempsTotalMinutes(tempsTotalMinutes)
                    .build();
            alerteRepository.save(alerte);
        } else {
            camion.setEtat(EtatCamion.VERT);
        }
        camionRepository.save(camion);
    }

    private void mettreAJourEtatCamion(Camion camion) {
        if (camion.getEtat() == null) {
            camion.setEtat(EtatCamion.VERT);
            camionRepository.save(camion);
        }
    }

    private CamionSuiviResponse toSuiviResponse(Camion camion) {
        List<Passage> historique = passageRepository.findByCamionOrderByDateHeureAsc(camion);
        Passage premier = historique.isEmpty() ? null : historique.get(0);
        Passage dernier = historique.isEmpty() ? null : historique.get(historique.size() - 1);
        long tempsEcoule = (premier != null && dernier != null)
                ? Duration.between(premier.getDateHeure(), dernier.getDateHeure()).toMinutes() : 0;

        return new CamionSuiviResponse(
                camion.getId(),
                camion.getImmatriculation(),
                camion.getTransporteur(),
                camion.getEtat(),
                dernier != null ? dernier.getPointControle().getNom() : null,
                premier != null ? premier.getDateHeure() : null,
                dernier != null ? dernier.getDateHeure() : null,
                tempsEcoule
        );
    }
}
