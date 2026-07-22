package net.chaimae.backend.config;

import lombok.RequiredArgsConstructor;
import net.chaimae.backend.entity.PointControle;
import net.chaimae.backend.entity.Utilisateur;
import net.chaimae.backend.enums.Role;
import net.chaimae.backend.repository.PointControleRepository;
import net.chaimae.backend.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Initialise les points de contrôle du parcours (cf. cahier des charges) et un compte admin. */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final PointControleRepository pointControleRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (pointControleRepository.count() == 0) {
            pointControleRepository.save(PointControle.builder().nom("PORTE_ENTREE").ordre(1).dureeMax(null).build());
            pointControleRepository.save(PointControle.builder().nom("PARKING").ordre(2).dureeMax(15).build());
            pointControleRepository.save(PointControle.builder().nom("AGENT_COMMERCIAL_ENTREE").ordre(3).dureeMax(5).build());
            pointControleRepository.save(PointControle.builder().nom("EXPEDITION").ordre(4).dureeMax(20).build());
            pointControleRepository.save(PointControle.builder().nom("AGENT_COMMERCIAL_SORTIE").ordre(5).dureeMax(5).build());
            pointControleRepository.save(PointControle.builder().nom("PORTE_SORTIE").ordre(6).dureeMax(null).build());
        }

        utilisateurRepository.findByEmail("chaimae@gmail.com")
                .ifPresentOrElse(admin -> {
                    admin.setNom("Agent Commercial");
                    admin.setPrenom("Holcim");
                    admin.setPassword(passwordEncoder.encode("Fati@2016"));
                    admin.setRole(Role.AGENT_COMMERCIAL);
                    admin.setActif(true);
                    utilisateurRepository.save(admin);
                }, () -> utilisateurRepository.save(Utilisateur.builder()
                        .nom("Agent Commercial").prenom("Holcim").email("chaimae@gmail.com")
                        .password(passwordEncoder.encode("Fati@2016"))
                        .role(Role.AGENT_COMMERCIAL).actif(true).build()));
        utilisateurRepository.findByEmail("Achraf@gmail.com")
                .ifPresentOrElse(admin -> {
                    admin.setNom("Service Maintenance");
                    admin.setPrenom("Holcim");
                    admin.setPassword(passwordEncoder.encode("Fati@2016"));
                    admin.setRole(Role.MAINTENANCE);
                    admin.setActif(true);
                    utilisateurRepository.save(admin);
                }, () -> utilisateurRepository.save(Utilisateur.builder()
                        .nom("Service Maintenance").prenom("Holcim").email("Achraf@gmail.com")
                        .password(passwordEncoder.encode("Fati@2016"))
                        .role(Role.MAINTENANCE).actif(true).build()));
        utilisateurRepository.findByEmail("Yahya@gmail.com")
                .ifPresentOrElse(admin -> {
                    admin.setNom("Service Expedition");
                    admin.setPrenom("Holcim");
                    admin.setPassword(passwordEncoder.encode("Fati@2016"));
                    admin.setRole(Role.EXPEDITION);
                    admin.setActif(true);
                    utilisateurRepository.save(admin);
                }, () -> utilisateurRepository.save(Utilisateur.builder()
                        .nom("Service Expedition").prenom("Holcim").email("Yahya@gmail.com")
                        .password(passwordEncoder.encode("Fati@2016"))
                        .role(Role.EXPEDITION).actif(true).build()));
    }

}

