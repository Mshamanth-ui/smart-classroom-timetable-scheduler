package com.presidency.scheduler.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data public class SlotRequest {
    @NotBlank private String subject;
    @NotBlank private String cls;
    @NotNull  private Long teacherId;
    @NotNull  private Long roomId;
    @NotBlank private String day;
    @NotBlank private String timeSlot;
    private String color = "#3b82f6";
    private Boolean recurring = false;
}
