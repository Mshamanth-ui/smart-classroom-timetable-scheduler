package com.presidency.scheduler.service;

import com.presidency.scheduler.dto.*;
import com.presidency.scheduler.model.*;
import com.presidency.scheduler.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class TeacherService {
    private final TeacherRepository teacherRepo;
    private final SlotRepository slotRepo;

    public List<TeacherResponse> getAll() {
        return teacherRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public TeacherResponse create(TeacherRequest req) {
        if (teacherRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Teacher email already exists");
        Teacher teacher = Teacher.builder().name(req.getName()).subject(req.getSubject())
            .email(req.getEmail()).phone(req.getPhone()).maxHours(req.getMaxHours()).build();
        addAvailability(teacher, req.getAvailability());
        return toResponse(teacherRepo.save(teacher));
    }

    @Transactional
    public TeacherResponse update(Long id, TeacherRequest req) {
        Teacher teacher = teacherRepo.findById(id).orElseThrow(() -> new RuntimeException("Teacher not found"));
        if (teacherRepo.existsByEmailAndIdNot(req.getEmail(), id))
            throw new RuntimeException("Email already in use");
        teacher.setName(req.getName()); teacher.setSubject(req.getSubject());
        teacher.setEmail(req.getEmail()); teacher.setPhone(req.getPhone());
        teacher.setMaxHours(req.getMaxHours());
        teacher.getAvailabilities().clear();
        addAvailability(teacher, req.getAvailability());
        return toResponse(teacherRepo.save(teacher));
    }

    public void delete(Long id) {
        Teacher t = teacherRepo.findById(id).orElseThrow(() -> new RuntimeException("Teacher not found"));
        if (!slotRepo.findByTeacherId(id).isEmpty())
            throw new RuntimeException("Cannot delete: teacher has scheduled classes");
        teacherRepo.delete(t);
    }

    private void addAvailability(Teacher teacher, Map<String,Boolean> avail) {
        if (avail == null) {
            for (TeacherAvailability.Day d : TeacherAvailability.Day.values())
                teacher.getAvailabilities().add(TeacherAvailability.builder()
                    .teacher(teacher).day(d).available(d != TeacherAvailability.Day.Sat).build());
        } else {
            avail.forEach((k,v) -> teacher.getAvailabilities().add(TeacherAvailability.builder()
                .teacher(teacher).day(TeacherAvailability.Day.valueOf(k)).available(v).build()));
        }
    }

    TeacherResponse toResponse(Teacher t) {
        Map<String,Boolean> avail = new LinkedHashMap<>();
        t.getAvailabilities().forEach(a -> avail.put(a.getDay().name(), a.getAvailable()));
        int assigned = (int) slotRepo.countByTeacherId(t.getId());
        return TeacherResponse.builder().id(t.getId()).name(t.getName()).subject(t.getSubject())
            .email(t.getEmail()).phone(t.getPhone()).maxHours(t.getMaxHours())
            .assignedHours(assigned).availability(avail).build();
    }
}
