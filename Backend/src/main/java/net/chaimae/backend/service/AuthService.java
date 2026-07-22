package net.chaimae.backend.service;

import lombok.RequiredArgsConstructor;
import net.chaimae.backend.dto.AuthResponse;
import net.chaimae.backend.dto.LoginRequest;
import net.chaimae.backend.dto.RegisterRequest;
import net.chaimae.backend.entity.Utilisateur;
import net.chaimae.backend.exception.BusinessException;
import net.chaimae.backend.exception.ResourceNotFoundException;
import net.chaimae.backend.entity.Service;
import net.chaimae.backend.repository.ServiceRepository;
import net.chaimae.backend.repository.UtilisateurRepository;
import net.chaimae.backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final ServiceRepository serviceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (utilisateurRepository.existsByEmail(request.email())) {
            throw new BusinessException("Un utilisateur avec cet email existe déjà");
        }
        Service service = null;
        if (request.serviceId() != null) {
            service = serviceRepository.findById(request.serviceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service introuvable"));
        }
        Utilisateur utilisateur = Utilisateur.builder()
                .nom(request.nom())
                .prenom(request.prenom())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .service(service)
                .actif(true)
                .build();
        utilisateurRepository.save(utilisateur);
        String token = jwtService.generateToken(utilisateur);
        return new AuthResponse(token, utilisateur.getEmail(), utilisateur.getNom(), utilisateur.getPrenom(), utilisateur.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        String token = jwtService.generateToken(utilisateur);
        return new AuthResponse(token, utilisateur.getEmail(), utilisateur.getNom(), utilisateur.getPrenom(), utilisateur.getRole().name());
    }
}

