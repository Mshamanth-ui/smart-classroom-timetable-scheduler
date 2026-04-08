package com.presidency.scheduler.dto;
import lombok.*;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ConflictResponse {
    private String type;
    private String title;
    private String description;
    private List<Long> slotIds;
}
