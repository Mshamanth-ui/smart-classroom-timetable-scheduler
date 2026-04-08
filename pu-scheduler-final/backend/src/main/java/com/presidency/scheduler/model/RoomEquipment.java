package com.presidency.scheduler.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="room_equipment")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomEquipment {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="room_id",nullable=false)
    private Room room;

    @Column(nullable=false,length=50)
    private String equipment;
}
