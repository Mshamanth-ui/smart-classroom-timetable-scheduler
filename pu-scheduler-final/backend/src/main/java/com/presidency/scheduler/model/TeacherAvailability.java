package com.presidency.scheduler.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="teacher_availability",
    uniqueConstraints=@UniqueConstraint(columnNames={"teacher_id","day"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TeacherAvailability {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="teacher_id",nullable=false)
    private Teacher teacher;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false,length=5)
    private Day day;

    @Column(nullable=false)
    private Boolean available = true;

    public enum Day { Mon, Tue, Wed, Thu, Fri, Sat }
}
