package com.presidency.scheduler.service;

import com.presidency.scheduler.dto.ConflictResponse;
import com.presidency.scheduler.model.*;
import com.presidency.scheduler.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service @RequiredArgsConstructor
public class ConflictService {
    private final SlotRepository slotRepo;
    private final TeacherRepository teacherRepo;
    private final RoomRepository roomRepo;

    public List<ConflictResponse> detect() {
        List<ConflictResponse> conflicts = new ArrayList<>();
        List<Slot> slots = slotRepo.findAll();

        // Pairwise O(n²) — room, teacher, class clashes
        for (int i = 0; i < slots.size(); i++) {
            for (int j = i+1; j < slots.size(); j++) {
                Slot a = slots.get(i), b = slots.get(j);
                if (!a.getDay().equals(b.getDay()) || !a.getTimeSlot().equals(b.getTimeSlot())) continue;

                if (a.getRoom().getId().equals(b.getRoom().getId()))
                    conflicts.add(ConflictResponse.builder().type("room")
                        .title("Room Double-Booked: " + a.getRoom().getName())
                        .description(String.format("\"%s\" (%s) and \"%s\" (%s) — %s on %s %s",
                            a.getSubject(),a.getCls(),b.getSubject(),b.getCls(),a.getRoom().getName(),a.getDay(),a.getTimeSlot()))
                        .slotIds(List.of(a.getId(),b.getId())).build());

                if (a.getTeacher().getId().equals(b.getTeacher().getId()))
                    conflicts.add(ConflictResponse.builder().type("teacher")
                        .title("Teacher Conflict: " + a.getTeacher().getName())
                        .description(String.format("%s assigned to \"%s\" AND \"%s\" on %s %s",
                            a.getTeacher().getName(),a.getSubject(),b.getSubject(),a.getDay(),a.getTimeSlot()))
                        .slotIds(List.of(a.getId(),b.getId())).build());

                if (a.getCls().equalsIgnoreCase(b.getCls()))
                    conflicts.add(ConflictResponse.builder().type("class")
                        .title("Class Double-Scheduled: " + a.getCls())
                        .description(String.format("Class %s has 2 subjects on %s %s: \"%s\" & \"%s\"",
                            a.getCls(),a.getDay(),a.getTimeSlot(),a.getSubject(),b.getSubject()))
                        .slotIds(List.of(a.getId(),b.getId())).build());
            }
        }

        // Availability violations
        slots.forEach(s -> {
            s.getTeacher().getAvailabilities().stream()
                .filter(av -> av.getDay().equals(s.getDay()) && !av.getAvailable())
                .findFirst().ifPresent(av ->
                    conflicts.add(ConflictResponse.builder().type("availability")
                        .title("Teacher Unavailable: " + s.getTeacher().getName())
                        .description(s.getTeacher().getName()+" is unavailable on "+s.getDay()+", but \""+s.getSubject()+"\" is scheduled")
                        .slotIds(List.of(s.getId())).build()));
        });

        // Workload overload
        teacherRepo.findAll().forEach(t -> {
            long hrs = slotRepo.countByTeacherId(t.getId());
            if (hrs > t.getMaxHours())
                conflicts.add(ConflictResponse.builder().type("workload")
                    .title("Workload Exceeded: " + t.getName())
                    .description(t.getName()+" is assigned "+hrs+" classes but max is "+t.getMaxHours())
                    .slotIds(List.of()).build());
        });

        // Room maintenance
        slots.forEach(s -> {
            if (s.getRoom().getStatus() == Room.RoomStatus.MAINTENANCE)
                conflicts.add(ConflictResponse.builder().type("room")
                    .title("Room Under Maintenance: " + s.getRoom().getName())
                    .description("\""+s.getSubject()+"\" is scheduled in "+s.getRoom().getName()+" which is under maintenance")
                    .slotIds(List.of(s.getId())).build());
        });

        return conflicts;
    }
}
