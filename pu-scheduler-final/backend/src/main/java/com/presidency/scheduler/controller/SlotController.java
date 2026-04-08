package com.presidency.scheduler.controller;
import com.presidency.scheduler.dto.*;
import com.presidency.scheduler.service.SlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/slots") @RequiredArgsConstructor
public class SlotController {
    private final SlotService slotService;
    @GetMapping    public ResponseEntity<ApiResponse<List<SlotResponse>>> getAll()  { return ResponseEntity.ok(ApiResponse.ok(slotService.getAll())); }
    @PostMapping   @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<ApiResponse<SlotResponse>> create(@Valid @RequestBody SlotRequest req) {
        try { return ResponseEntity.ok(ApiResponse.ok("Slot created", slotService.create(req))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage())); }
    }
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<ApiResponse<SlotResponse>> update(@PathVariable Long id, @Valid @RequestBody SlotRequest req) {
        try { return ResponseEntity.ok(ApiResponse.ok("Slot updated", slotService.update(id, req))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage())); }
    }
    @PutMapping("/{id}/move") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<ApiResponse<SlotResponse>> move(@PathVariable Long id, @RequestParam String day, @RequestParam String timeSlot) {
        try { return ResponseEntity.ok(ApiResponse.ok("Slot moved", slotService.move(id, day, timeSlot))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage())); }
    }
    @PostMapping("/{id}/copy") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<ApiResponse<SlotResponse>> copy(@PathVariable Long id, @RequestParam String day, @RequestParam String timeSlot) {
        try { return ResponseEntity.ok(ApiResponse.ok("Slot copied", slotService.copy(id, day, timeSlot))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage())); }
    }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try { slotService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Slot deleted", null)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage())); }
    }
}
