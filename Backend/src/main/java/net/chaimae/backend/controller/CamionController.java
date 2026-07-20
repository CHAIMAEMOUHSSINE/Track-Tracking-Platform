package net.chaimae.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import net.chaimae.backend.entity.Camion;
import net.chaimae.backend.service.CamionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/camions")
@RequiredArgsConstructor
@Tag(name = "Camions")
public class CamionController {

    private final CamionService camionService;

    @GetMapping
    public ResponseEntity<Page<Camion>> lister(Pageable pageable) {
        return ResponseEntity.ok(camionService.lister(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Camion> getById(@PathVariable Long id) {
        return ResponseEntity.ok(camionService.getById(id));
    }

    @GetMapping("/recherche")
    public ResponseEntity<Camion> rechercher(@RequestParam String immatriculation) {
        return ResponseEntity.ok(camionService.rechercherParImmatriculation(immatriculation));
    }
}
