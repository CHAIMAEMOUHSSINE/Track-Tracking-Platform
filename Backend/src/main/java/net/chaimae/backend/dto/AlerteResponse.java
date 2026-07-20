package net.chaimae.backend.dto;

import net.chaimae.backend.enums.StatutAlerte;

import java.time.LocalDateTime;

public record AlerteResponse(
        Long id,
        String immatriculation,
        LocalDateTime dateHeure,
        Long tempsTotalMinutes,
        StatutAlerte statut,
        String causeJustification
) {}

