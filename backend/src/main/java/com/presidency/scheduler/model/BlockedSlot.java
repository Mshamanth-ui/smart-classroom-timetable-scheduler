package com.presidency.scheduler.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "blocked_slots", uniqueConstraints = @UniqueConstraint(columnNames = { "day", "time_slot" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockedSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private TeacherAvailability.Day day;

    @Column(name = "time_slot", nullable = false, length = 20)
    private String timeSlot;

    @Column(nullable = false, length = 255)
    private String reason;
}
