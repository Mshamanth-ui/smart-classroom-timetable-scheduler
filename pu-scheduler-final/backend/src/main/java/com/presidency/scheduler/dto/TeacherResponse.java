package com.presidency.scheduler.dto;
import lombok.*;
import java.util.Map;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TeacherResponse {
    private Long id;
    private String name;
    private String subject;
    private String email;
    private String phone;
    private Integer maxHours;
    private Integer assignedHours;
    private Map<String,Boolean> availability;
}
