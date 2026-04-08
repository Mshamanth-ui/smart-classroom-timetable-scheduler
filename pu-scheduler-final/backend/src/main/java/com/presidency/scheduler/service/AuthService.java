package com.presidency.scheduler.service;

import com.presidency.scheduler.dto.*;
import com.presidency.scheduler.model.User;
import com.presidency.scheduler.repository.UserRepository;
import com.presidency.scheduler.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authManager;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(AuthRequest req) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid username or password");
        }
        User user = userRepo.findByUsername(req.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtUtil.generate(user.getUsername(), user.getRole().name());
        return AuthResponse.builder()
            .token(token).id(user.getId()).username(user.getUsername())
            .fullName(user.getFullName()).email(user.getEmail())
            .role(user.getRole().name()).avatar(user.getAvatar())
            .build();
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.findByUsername(req.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = User.builder()
            .username(req.getUsername())
            .password(passwordEncoder.encode(req.getPassword()))
            .fullName(req.getFullName())
            .email(req.getEmail())
            .role(User.Role.VIEWER)
            .avatar("👤")
            .active(true)
            .build();
        
        userRepo.save(user);
        
        String token = jwtUtil.generate(user.getUsername(), user.getRole().name());
        return AuthResponse.builder()
            .token(token).id(user.getId()).username(user.getUsername())
            .fullName(user.getFullName()).email(user.getEmail())
            .role(user.getRole().name()).avatar(user.getAvatar())
            .build();
    }

    public AuthResponse registerAdmin(RegisterAdminRequest req) {
        if (userRepo.findByUsername(req.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        try {
            User.Role role = User.Role.valueOf(req.getRole().toUpperCase());
            
            User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .email(req.getEmail())
                .role(role)
                .avatar("👤")
                .active(true)
                .build();
            
            userRepo.save(user);
            
            String token = jwtUtil.generate(user.getUsername(), user.getRole().name());
            return AuthResponse.builder()
                .token(token).id(user.getId()).username(user.getUsername())
                .fullName(user.getFullName()).email(user.getEmail())
                .role(user.getRole().name()).avatar(user.getAvatar())
                .build();
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + req.getRole());
        }
    }
}
