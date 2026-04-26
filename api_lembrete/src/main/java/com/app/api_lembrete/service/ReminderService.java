package com.app.api_lembrete.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.app.api_lembrete.dto.ReminderRequest;
import com.app.api_lembrete.model.Reminder;
import com.app.api_lembrete.model.User;
import com.app.api_lembrete.repository.ReminderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReminderService {
    
    private final ReminderRepository reminderRepository;

    public Reminder create(ReminderRequest req, User user) {
        Reminder reminder = new Reminder();
        reminder.setTitle(req.getTitle());
        reminder.setDescription(req.getDescription());
        reminder.setDueDate(req.getDueDate());
        reminder.setPriority(req.getPriority());
        reminder.setCategory(req.getCategory());
        reminder.setRecurring(req.isRecurring());
        reminder.setUser(user);
        return reminderRepository.save(reminder);
    }

    public List<Reminder> findAllByUser(User user) {
        return reminderRepository.findByUserId(user.getId());
    }

    public Reminder update(Long id, ReminderRequest req, User user) {
    Reminder reminder = reminderRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Lembrete não encontrado"));

    if (!reminder.getUser().equals(user)) {
        throw new AccessDeniedException("Você não pode alterar lembretes de outro usuário");
    }

    reminder.setTitle(req.getTitle());
    reminder.setDescription(req.getDescription());
    reminder.setDueDate(req.getDueDate());
    reminder.setPriority(req.getPriority());
    reminder.setCategory(req.getCategory());
    reminder.setRecurring(req.isRecurring());

    return reminderRepository.save(reminder);
}


    public void delete(Long id, User user) {
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lembrete não encontrado"));
        if (!reminder.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Acesso negado");
        }
        reminderRepository.delete(reminder);
    }

    public Reminder toggleComplete(Long id, User user) {
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lembrete não encontrado"));
        if (!reminder.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Acesso negado");
        }
        reminder.setCompleted(!reminder.isCompleted());
        return reminderRepository.save(reminder);
    }
}