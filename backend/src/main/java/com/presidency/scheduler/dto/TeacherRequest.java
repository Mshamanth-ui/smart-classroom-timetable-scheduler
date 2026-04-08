package com.presidency.scheduler.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.*;
@Data public class TeacherRequest {
    @NotBlank private String name;
    @NotBlank private String subject;
    @Email    private String email;
    private String phone;
    private Integer maxHours = 20;
    private Map<String,Boolean> availability;
}
