package com.presidency.scheduler.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="slots")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Slot {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false,length=100)
    private String subject;

    @Column(nullable=false,length=50)
    private String cls;

    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="teacher_id",nullable=false)
    private Teacher teacher;

    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="room_id",nullable=false)
    private Room room;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false,length=5)
    private TeacherAvailability.Day day;

    @Column(name="time_slot",nullable=false,length=20)
    private String timeSlot;

    @Column(nullable=false,length=10)
    private String color = "#3b82f6";

    @Column(nullable=false)
    private Boolean recurring = false;

    @Column(name="created_at",updatable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
