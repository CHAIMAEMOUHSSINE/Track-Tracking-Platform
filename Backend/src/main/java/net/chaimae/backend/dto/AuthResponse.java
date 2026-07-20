package net.chaimae.backend.dto;

public record AuthResponse(
        String token,
        String email,
        String nom,
        String prenom,
        String role
) {}

