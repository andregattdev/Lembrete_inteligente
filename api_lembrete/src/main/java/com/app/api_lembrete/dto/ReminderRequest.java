package com.app.api_lembrete.dto;

import java.time.LocalDateTime;

import com.app.api_lembrete.model.Priority;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReminderRequest {

    @NotBlank
    private String title;

    private String description;

    private LocalDateTime dueDate;

    private Priority priority = Priority.MEDIA;

    private String category = "Geral";
    
    private boolean recurring = false;

}
