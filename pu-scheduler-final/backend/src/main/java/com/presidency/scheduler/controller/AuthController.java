package com.presidency.scheduler.controller;
import com.presidency.scheduler.dto.*;
import com.presidency.scheduler.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest req) {
        try { return ResponseEntity.ok(ApiResponse.ok(authService.login(req))); }
        catch (Exception e) { return ResponseEntity.status(401).body(ApiResponse.error(e.getMessage())); }
    }
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest req) {
        try { return ResponseEntity.ok(ApiResponse.ok(authService.register(req))); }
        catch (Exception e) { return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage())); }
    }

    @PostMapping("/register-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuthResponse>> registerAdmin(@RequestBody RegisterAdminRequest req) {
        try { return ResponseEntity.ok(ApiResponse.ok(authService.registerAdmin(req))); }
        catch (Exception e) { return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage())); }
    }
}
