package com.presidency.scheduler.repository;
import com.presidency.scheduler.model.*;
import com.presidency.scheduler.model.TeacherAvailability.Day;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
public interface SlotRepository extends JpaRepository<Slot,Long> {
    List<Slot> findByTeacherId(Long teacherId);
    List<Slot> findByRoomId(Long roomId);

    @Query("SELECT s FROM Slot s WHERE s.day=?1 AND s.timeSlot=?2")
    List<Slot> findByDayAndTimeSlot(Day day, String timeSlot);

    boolean existsByRoomIdAndDayAndTimeSlotAndIdNot(Long roomId, Day day, String timeSlot, Long id);
    boolean existsByTeacherIdAndDayAndTimeSlotAndIdNot(Long teacherId, Day day, String timeSlot, Long id);
    boolean existsByClsAndDayAndTimeSlotAndIdNot(String cls, Day day, String timeSlot, Long id);

    long countByTeacherId(Long teacherId);
}
