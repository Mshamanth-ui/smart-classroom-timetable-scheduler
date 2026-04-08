package com.presidency.scheduler.controller;
import com.presidency.scheduler.dto.*;
import com.presidency.scheduler.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/rooms") @RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;
    @GetMapping    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAll()  { return ResponseEntity.ok(ApiResponse.ok(roomService.getAll())); }
    @PostMapping   @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<ApiResponse<RoomResponse>> create(@Valid @RequestBody RoomRequest req) {
        try { return ResponseEntity.ok(ApiResponse.ok("Room created", roomService.create(req))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage())); }
    }
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<ApiResponse<RoomResponse>> update(@PathVariable Long id, @Valid @RequestBody RoomRequest req) {
        try { return ResponseEntity.ok(ApiResponse.ok("Room updated", roomService.update(id, req))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage())); }
    }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try { roomService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Room deleted", null)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage())); }
    }
}
