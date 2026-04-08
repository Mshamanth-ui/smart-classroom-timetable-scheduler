package com.presidency.scheduler.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
}
