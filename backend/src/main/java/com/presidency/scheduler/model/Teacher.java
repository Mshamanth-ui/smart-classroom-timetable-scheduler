package com.presidency.scheduler.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name="teachers")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Teacher {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false,length=100)
    private String name;

    @Column(nullable=false,length=100)
    private String subject;

    @Column(nullable=false,unique=true,length=100)
    private String email;

    @Column(length=20)
    private String phone;

    @Column(name="max_hours",nullable=false)
    private Integer maxHours = 20;

    @OneToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="user_id")
    private User user;

    @OneToMany(mappedBy="teacher", cascade=CascadeType.ALL, orphanRemoval=true)
    @Builder.Default
    private List<TeacherAvailability> availabilities = new ArrayList<>();

    @Column(name="created_at",updatable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
