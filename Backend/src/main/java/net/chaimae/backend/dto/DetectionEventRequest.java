package net.chaimae.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * Payload envoyé par le microservice Python (ANPR) vers Spring Boot
 * une fois la plaque détectée et lue par YOLOv8 + EasyOCR.
 */
public record DetectionEventRequest(
        @NotBlank String immatriculation,
        @NotBlank String pointControleNom,
        @NotNull LocalDateTime dateHeure,
        Double scoreConfiance
) {}