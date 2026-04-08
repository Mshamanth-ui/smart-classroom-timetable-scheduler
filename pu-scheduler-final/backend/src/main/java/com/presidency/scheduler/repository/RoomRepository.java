package com.presidency.scheduler.repository;
import com.presidency.scheduler.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RoomRepository extends JpaRepository<Room,Long> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);
    List<Room> findByStatus(Room.RoomStatus status);
}
