package com.presidency.scheduler.controller;
import com.presidency.scheduler.dto.*;
import com.presidency.scheduler.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/teachers") @RequiredArgsConstructor
public class TeacherController {
    private final TeacherService teacherService;
    @GetMapping    public ResponseEntity<ApiResponse<List<TeacherResponse>>> getAll()  { return ResponseEntity.ok(ApiResponse.ok(teacherService.getAll())); }
    @PostMapping   @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<ApiResponse<TeacherResponse>> create(@Valid @RequestBody TeacherRequest req) {
        try { return ResponseEntity.ok(ApiResponse.ok("Teacher created", teacherService.create(req))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage())); }
    }
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<ApiResponse<TeacherResponse>> update(@PathVariable Long id, @Valid @RequestBody TeacherRequest req) {
        try { return ResponseEntity.ok(ApiResponse.ok("Teacher updated", teacherService.update(id, req))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage())); }
    }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try { teacherService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Teacher deleted", null)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage())); }
    }
}
