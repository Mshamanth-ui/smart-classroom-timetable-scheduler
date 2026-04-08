package com.presidency.scheduler.repository;
import com.presidency.scheduler.model.*;
import com.presidency.scheduler.model.TeacherAvailability.Day;
import org.springframework.data.jpa.repository.JpaRepository;
public interface BlockedSlotRepository extends JpaRepository<BlockedSlot,Long> {
    boolean existsByDayAndTimeSlot(Day day, String timeSlot);
    java.util.Optional<BlockedSlot> findByDayAndTimeSlot(Day day, String timeSlot);
}
