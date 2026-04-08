package com.presidency.scheduler.dto;
import lombok.*;
@Data @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private String avatar;
}
