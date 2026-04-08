package com.presidency.scheduler.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private String avatar;
    private boolean active;
}
