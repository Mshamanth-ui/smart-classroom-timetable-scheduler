package com.presidency.scheduler.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false,unique=true,length=50)
    private String username;

    @Column(nullable=false,length=255)
    private String password;

    @Column(name="full_name",nullable=false,length=100)
    private String fullName;

    @Column(nullable=false,unique=true,length=100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false,length=10)
    private Role role;

    @Column(length=10)
    private String avatar;

    @Column(nullable=false)
    private boolean active = true;

    @Column(name="created_at",updatable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum Role { ADMIN, TEACHER, VIEWER }
}
