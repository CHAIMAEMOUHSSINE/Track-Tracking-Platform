package net.chaimae.backend.controller;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.chaimae.backend.dto.AlerteResponse;
import net.chaimae.backend.dto.JustificationRequest;
import net.chaimae.backend.enums.StatutAlerte;
import net.chaimae.backend.service.AlerteService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alertes")
@RequiredArgsConstructor
@Tag(name = "Alertes")
public class AlerteController {

    private final AlerteService alerteService;

    @GetMapping
    public ResponseEntity<Page<AlerteResponse>> lister(
            @RequestParam(required = false) StatutAlerte statut, Pageable pageable) {
        return ResponseEntity.ok(alerteService.lister(statut, pageable));
    }

    @PostMapping("/justifier")
    public ResponseEntity<AlerteResponse> justifier(@Valid @RequestBody JustificationRequest request) {
        return ResponseEntity.ok(alerteService.justifier(request));
    }

    @PutMapping("/{alerteId}/justification")
    public ResponseEntity<AlerteResponse> modifierJustification(
            @PathVariable Long alerteId, @Valid @RequestBody JustificationRequest request) {
        return ResponseEntity.ok(alerteService.modifierJustification(alerteId, request));
    }
}
