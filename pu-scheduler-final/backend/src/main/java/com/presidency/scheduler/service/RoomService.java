package com.presidency.scheduler.service;

import com.presidency.scheduler.dto.*;
import com.presidency.scheduler.model.*;
import com.presidency.scheduler.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepo;
    private final SlotRepository slotRepo;

    public List<RoomResponse> getAll() {
        return roomRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public RoomResponse create(RoomRequest req) {
        if (roomRepo.existsByName(req.getName()))
            throw new RuntimeException("Room name already exists");
        Room room = Room.builder().name(req.getName()).capacity(req.getCapacity())
            .type(Room.RoomType.valueOf(req.getType() != null ? req.getType() : "CLASSROOM"))
            .status(req.getStatus() != null ? Room.RoomStatus.valueOf(req.getStatus()) : Room.RoomStatus.ACTIVE)
            .notes(req.getNotes()).build();
        if (req.getEquipment() != null)
            req.getEquipment().forEach(e -> room.getEquipmentList().add(
                RoomEquipment.builder().room(room).equipment(e).build()));
        return toResponse(roomRepo.save(room));
    }

    @Transactional
    public RoomResponse update(Long id, RoomRequest req) {
        Room room = roomRepo.findById(id).orElseThrow(() -> new RuntimeException("Room not found"));
        if (roomRepo.existsByNameAndIdNot(req.getName(), id))
            throw new RuntimeException("Room name already exists");
        room.setName(req.getName()); room.setCapacity(req.getCapacity());
        room.setType(Room.RoomType.valueOf(req.getType()));
        room.setStatus(Room.RoomStatus.valueOf(req.getStatus()));
        room.setNotes(req.getNotes());
        room.getEquipmentList().clear();
        if (req.getEquipment() != null)
            req.getEquipment().forEach(e -> room.getEquipmentList().add(
                RoomEquipment.builder().room(room).equipment(e).build()));
        return toResponse(roomRepo.save(room));
    }

    public void delete(Long id) {
        Room room = roomRepo.findById(id).orElseThrow(() -> new RuntimeException("Room not found"));
        if (!slotRepo.findByRoomId(id).isEmpty())
            throw new RuntimeException("Cannot delete: room has scheduled classes");
        roomRepo.delete(room);
    }

    private RoomResponse toResponse(Room r) {
        List<String> eq = r.getEquipmentList().stream().map(RoomEquipment::getEquipment).collect(Collectors.toList());
        long used  = slotRepo.findByRoomId(r.getId()).size();
        int  total = 5 * 9;
        int  pct   = (int) Math.round((used * 100.0) / total);
        return RoomResponse.builder().id(r.getId()).name(r.getName()).capacity(r.getCapacity())
            .type(r.getType().name()).status(r.getStatus().name()).notes(r.getNotes())
            .equipment(eq).usedSlots((int)used).totalSlots(total).utilizationPct(pct).build();
    }
}
