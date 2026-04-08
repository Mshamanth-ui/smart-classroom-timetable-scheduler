package com.presidency.scheduler.controller;

import com.presidency.scheduler.dto.*;
import com.presidency.scheduler.service.ConflictService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/conflicts")
@RequiredArgsConstructor
public class ConflictController {
    private final ConflictService conflictService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConflictResponse>>> detect() {
        return ResponseEntity.ok(ApiResponse.ok(conflictService.detect()));
    }
}
