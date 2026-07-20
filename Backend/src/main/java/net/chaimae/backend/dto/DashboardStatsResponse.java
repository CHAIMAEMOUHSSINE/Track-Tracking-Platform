package net.chaimae.backend.dto;

import java.util.Map;

public record DashboardStatsResponse(
        long totalCamions,
        long camionsEnCours,
        long camionsTermines,
        long nombreRetards,
        double tempsMoyenParcoursMinutes,
        double pourcentageRetards,
        long alertesActives,
        Map<String, Long> repartitionParEtat // VERT / ORANGE / ROUGE
) {}
