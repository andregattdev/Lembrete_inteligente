package com.app.api_lembrete.dto;

import java.time.LocalDateTime;

import com.app.api_lembrete.model.Reminder;
import com.app.api_lembrete.model.Priority;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private Priority priority;   // enum direto
    private String category;
    private boolean completed;
    private boolean recurring;
    private String username;

    public ReminderResponse(Reminder reminder) {
        this.id = reminder.getId();
        this.title = reminder.getTitle();
        this.description = reminder.getDescription();
        this.dueDate = reminder.getDueDate();
        this.priority = reminder.getPriority();
        this.category = reminder.getCategory();
        this.completed = reminder.isCompleted();
        this.recurring = reminder.isRecurring();
        this.username = reminder.getUser().getUsername();
    }
}
