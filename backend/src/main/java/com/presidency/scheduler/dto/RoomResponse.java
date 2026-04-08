package com.presidency.scheduler.dto;
import lombok.*;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RoomResponse {
    private Long id;
    private String name;
    private Integer capacity;
    private String type;
    private String status;
    private String notes;
    private List<String> equipment;
    private Integer usedSlots;
    private Integer totalSlots;
    private Integer utilizationPct;
}
