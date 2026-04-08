package com.presidency.scheduler.repository;
import com.presidency.scheduler.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
public interface HolidayRepository extends JpaRepository<Holiday,Long> {
    boolean existsByDate(LocalDate date);
}
