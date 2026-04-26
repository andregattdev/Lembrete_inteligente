package com.app.api_lembrete.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.api_lembrete.model.Reminder;
import com.app.api_lembrete.model.User;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserId(Long userId);
    List<Reminder> findByUserIdAndCompletedFalse(Long userId);

    List<Reminder> findAllByUser(User user);


}
