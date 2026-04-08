package com.presidency.scheduler.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class RegisterAdminRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String role; // ADMIN, TEACHER, VIEWER
}
