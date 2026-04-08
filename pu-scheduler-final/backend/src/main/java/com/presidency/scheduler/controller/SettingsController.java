package com.presidency.scheduler.controller;
import com.presidency.scheduler.dto.ApiResponse;
import com.presidency.scheduler.model.*;
import com.presidency.scheduler.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;
@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class SettingsController {
    private final HolidayRepository holidayRepo;
    private final BlockedSlotRepository blockedRepo;
    private final AppSettingRepository settingRepo;

    // ── Holidays ──
    @GetMapping("/holidays")      public ResponseEntity<?> getHolidays()  { return ResponseEntity.ok(ApiResponse.ok(holidayRepo.findAll())); }
    @PostMapping("/holidays")     @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> addHoliday(@RequestBody Map<String,String> body) {
        try {
            LocalDate date = LocalDate.parse(body.get("date"));
            if (holidayRepo.existsByDate(date)) return ResponseEntity.badRequest().body(ApiResponse.error("Holiday already exists"));
            return ResponseEntity.ok(ApiResponse.ok(holidayRepo.save(Holiday.builder().date(date).label(body.get("label")).build())));
        } catch(Exception e) { return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage())); }
    }
    @DeleteMapping("/holidays/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> deleteHoliday(@PathVariable Long id) {
        holidayRepo.deleteById(id); return ResponseEntity.ok(ApiResponse.ok("Deleted",null));
    }

    // ── Blocked Slots ──
    @GetMapping("/blocked-slots")    public ResponseEntity<?> getBlocked()  { return ResponseEntity.ok(ApiResponse.ok(blockedRepo.findAll())); }
    @PostMapping("/blocked-slots")   @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> addBlocked(@RequestBody Map<String,String> body) {
        try {
            var day = TeacherAvailability.Day.valueOf(body.get("day"));
            if (blockedRepo.existsByDayAndTimeSlot(day, body.get("timeSlot"))) return ResponseEntity.badRequest().body(ApiResponse.error("Slot already blocked"));
            return ResponseEntity.ok(ApiResponse.ok(blockedRepo.save(BlockedSlot.builder().day(day).timeSlot(body.get("timeSlot")).reason(body.get("reason")).build())));
        } catch(Exception e) { return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage())); }
    }
    @DeleteMapping("/blocked-slots/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> deleteBlocked(@PathVariable Long id) {
        blockedRepo.deleteById(id); return ResponseEntity.ok(ApiResponse.ok("Deleted",null));
    }

    // ── App Settings ──
    @GetMapping("/settings")  public ResponseEntity<?> getSettings() {
        Map<String,String> map = new HashMap<>();
        settingRepo.findAll().forEach(s -> map.put(s.getKey(), s.getValue()));
        return ResponseEntity.ok(ApiResponse.ok(map));
    }
    @PutMapping("/settings/{key}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> updateSetting(@PathVariable String key, @RequestBody Map<String,String> body) {
        var setting = settingRepo.findByKey(key).orElse(AppSetting.builder().key(key).build());
        setting.setValue(body.get("value")); settingRepo.save(setting);
        return ResponseEntity.ok(ApiResponse.ok("Updated",null));
    }
}
