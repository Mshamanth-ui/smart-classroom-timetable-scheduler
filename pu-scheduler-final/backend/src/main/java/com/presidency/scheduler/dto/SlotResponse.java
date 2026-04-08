package com.presidency.scheduler.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SlotResponse {
    private Long id;
    private String subject;
    private String cls;
    private Long teacherId;
    private String teacher;
    private Long roomId;
    private String room;
    private String day;
    private String timeSlot;
    private String color;
    private Boolean recurring;
}
