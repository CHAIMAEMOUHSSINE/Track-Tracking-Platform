package net.chaimae.backend.dto;


import net.chaimae.backend.enums.EtatCamion;

import java.time.LocalDateTime;

public record CamionSuiviResponse(
        Long camionId,
        String immatriculation,
        String transporteur,
        EtatCamion etat,
        String pointControleActuel,
        LocalDateTime heureEntree,
        LocalDateTime dernierPassage,
        long tempsEcouleMinutes
) {}
