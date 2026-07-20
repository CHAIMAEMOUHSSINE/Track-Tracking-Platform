package net.chaimae.backend.dto;
import jakarta.validation.constraints.NotNull;
public record JustificationRequest(
        @NotNull Long alerteId,
        @NotNull CauseJustification cause,
        String commentaire,
        @NotNull Long serviceId

) {
}
