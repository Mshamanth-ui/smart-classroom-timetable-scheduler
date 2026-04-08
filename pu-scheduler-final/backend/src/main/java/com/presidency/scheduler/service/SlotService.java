package com.presidency.scheduler.service;

import com.presidency.scheduler.dto.*;
import com.presidency.scheduler.model.*;
import com.presidency.scheduler.model.TeacherAvailability.Day;
import com.presidency.scheduler.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class SlotService {
    private final SlotRepository slotRepo;
    private final TeacherRepository teacherRepo;
    private final RoomRepository roomRepo;
    private final BlockedSlotRepository blockedRepo;

    public List<SlotResponse> getAll() {
        return slotRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public SlotResponse create(SlotRequest req) {
        Teacher teacher = teacherRepo.findById(req.getTeacherId())
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
        Room room = roomRepo.findById(req.getRoomId())
            .orElseThrow(() -> new RuntimeException("Room not found"));
        Day day = Day.valueOf(req.getDay());

        if (blockedRepo.existsByDayAndTimeSlot(day, req.getTimeSlot()))
            throw new RuntimeException("Slot is blocked: " + blockedRepo.findByDayAndTimeSlot(day, req.getTimeSlot())
                .map(BlockedSlot::getReason).orElse(""));

        validateConflicts(null, req.getRoomId(), req.getTeacherId(), req.getCls(), day, req.getTimeSlot());

        Slot slot = Slot.builder()
            .subject(req.getSubject()).cls(req.getCls())
            .teacher(teacher).room(room).day(day)
            .timeSlot(req.getTimeSlot()).color(req.getColor())
            .recurring(req.getRecurring()).build();
        return toResponse(slotRepo.save(slot));
    }

    @Transactional
    public SlotResponse update(Long id, SlotRequest req) {
        Slot slot = slotRepo.findById(id).orElseThrow(() -> new RuntimeException("Slot not found"));
        Teacher teacher = teacherRepo.findById(req.getTeacherId())
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
        Room room = roomRepo.findById(req.getRoomId())
            .orElseThrow(() -> new RuntimeException("Room not found"));
        Day day = Day.valueOf(req.getDay());
        validateConflicts(id, req.getRoomId(), req.getTeacherId(), req.getCls(), day, req.getTimeSlot());

        slot.setSubject(req.getSubject()); slot.setCls(req.getCls());
        slot.setTeacher(teacher); slot.setRoom(room); slot.setDay(day);
        slot.setTimeSlot(req.getTimeSlot()); slot.setColor(req.getColor());
        slot.setRecurring(req.getRecurring());
        return toResponse(slotRepo.save(slot));
    }

    @Transactional
    public SlotResponse move(Long id, String day, String timeSlot) {
        Slot slot = slotRepo.findById(id).orElseThrow(() -> new RuntimeException("Slot not found"));
        Day d = Day.valueOf(day);
        if (blockedRepo.existsByDayAndTimeSlot(d, timeSlot))
            throw new RuntimeException("Target slot is blocked");
        validateConflicts(id, slot.getRoom().getId(), slot.getTeacher().getId(), slot.getCls(), d, timeSlot);
        slot.setDay(d); slot.setTimeSlot(timeSlot);
        return toResponse(slotRepo.save(slot));
    }

    @Transactional
    public SlotResponse copy(Long id, String day, String timeSlot) {
        Slot src = slotRepo.findById(id).orElseThrow(() -> new RuntimeException("Slot not found"));
        Day d = Day.valueOf(day);
        if (blockedRepo.existsByDayAndTimeSlot(d, timeSlot))
            throw new RuntimeException("Target slot is blocked");
        validateConflicts(null, src.getRoom().getId(), src.getTeacher().getId(), src.getCls(), d, timeSlot);
        Slot copy = Slot.builder()
            .subject(src.getSubject()).cls(src.getCls()).teacher(src.getTeacher())
            .room(src.getRoom()).day(d).timeSlot(timeSlot)
            .color(src.getColor()).recurring(src.getRecurring()).build();
        return toResponse(slotRepo.save(copy));
    }

    public void delete(Long id) {
        if (!slotRepo.existsById(id)) throw new RuntimeException("Slot not found");
        slotRepo.deleteById(id);
    }

    private void validateConflicts(Long excludeId, Long roomId, Long teacherId, String cls, Day day, String timeSlot) {
        long exc = excludeId != null ? excludeId : -1L;
        if (slotRepo.existsByRoomIdAndDayAndTimeSlotAndIdNot(roomId, day, timeSlot, exc))
            throw new RuntimeException("Room is already booked at this time");
        if (slotRepo.existsByTeacherIdAndDayAndTimeSlotAndIdNot(teacherId, day, timeSlot, exc))
            throw new RuntimeException("Teacher already has a class at this time");
        if (slotRepo.existsByClsAndDayAndTimeSlotAndIdNot(cls, day, timeSlot, exc))
            throw new RuntimeException("Class already has a subject at this time");
    }

    public SlotResponse toResponse(Slot s) {
        return SlotResponse.builder()
            .id(s.getId()).subject(s.getSubject()).cls(s.getCls())
            .teacherId(s.getTeacher().getId()).teacher(s.getTeacher().getName())
            .roomId(s.getRoom().getId()).room(s.getRoom().getName())
            .day(s.getDay().name()).timeSlot(s.getTimeSlot())
            .color(s.getColor()).recurring(s.getRecurring()).build();
    }
}
