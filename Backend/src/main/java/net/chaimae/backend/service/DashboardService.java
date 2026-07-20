package net.chaimae.backend.service;

import lombok.RequiredArgsConstructor;
import net.chaimae.backend.dto.DashboardStatsResponse;
import net.chaimae.backend.entity.Camion;
import net.chaimae.backend.enums.EtatCamion;
import net.chaimae.backend.enums.StatutAlerte;
import net.chaimae.backend.repository.AlerteRepository;
import net.chaimae.backend.repository.CamionRepository;
import net.chaimae.backend.repository.PassageRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CamionRepository camionRepository;
    private final AlerteRepository alerteRepository;
    private final PassageRepository passageRepository;

    public DashboardStatsResponse getStats() {
        List<Camion> tousLesCamions = camionRepository.findAll();
        long total = tousLesCamions.size();

        Map<EtatCamion, Long> repartition = new EnumMap<>(EtatCamion.class);
        for (EtatCamion etat : EtatCamion.values()) repartition.put(etat, 0L);
        for (Camion c : tousLesCamions) {
            repartition.merge(c.getEtat() != null ? c.getEtat() : EtatCamion.VERT, 1L, Long::sum);
        }

        long enCours = tousLesCamions.stream()
                .filter(c -> !dernierePorteEstSortie(c)).count();
        long termines = total - enCours;

        long alertesActives = alerteRepository.countByStatut(StatutAlerte.OUVERTE);
        long retards = repartition.getOrDefault(EtatCamion.ROUGE, 0L);
        double pourcentageRetards = total == 0 ? 0 : (retards * 100.0) / total;

        double tempsMoyen = tousLesCamions.stream()
                .mapToLong(this::tempsParcoursMinutes)
                .filter(t -> t > 0)
                .average()
                .orElse(0);

        Map<String, Long> repartitionStr = repartition.entrySet().stream()
                .collect(Collectors.toMap(e -> e.getKey().name(), Map.Entry::getValue));

        return new DashboardStatsResponse(total, enCours, termines, retards, tempsMoyen, pourcentageRetards, alertesActives, repartitionStr);
    }

    private boolean dernierePorteEstSortie(Camion camion) {
        return passageRepository.findTopByCamionOrderByDateHeureDesc(camion)
                .map(p -> "PORTE_SORTIE".equals(p.getPointControle().getNom()))
                .orElse(false);
    }

    private long tempsParcoursMinutes(Camion camion) {
        var passages = passageRepository.findByCamionOrderByDateHeureAsc(camion);
        if (passages.size() < 2) return 0;
        return Duration.between(passages.get(0).getDateHeure(), passages.get(passages.size() - 1).getDateHeure()).toMinutes();
    }
}
