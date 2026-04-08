package com.presidency.scheduler.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;
@Data public class RoomRequest {
    @NotBlank private String name;
    @NotNull  private Integer capacity;
    private String type;
    private String status;
    private String notes;
    private List<String> equipment;
}
