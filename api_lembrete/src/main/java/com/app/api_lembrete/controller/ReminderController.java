package com.app.api_lembrete.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.api_lembrete.dto.ReminderRequest;
import com.app.api_lembrete.dto.ReminderResponse;
import com.app.api_lembrete.model.Reminder;
import com.app.api_lembrete.model.User;
import com.app.api_lembrete.service.ReminderService;
import com.app.api_lembrete.service.UserService;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderService reminderService;
    private final UserService userService;

    public ReminderController(ReminderService reminderService, UserService userService) {
        this.reminderService = reminderService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<ReminderResponse>> getAllReminders(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        List<ReminderResponse> reminders = reminderService.findAllByUser(user)
                .stream()
                .map(ReminderResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reminders);
    }

    @PostMapping
    public ResponseEntity<Reminder> createReminder(@RequestBody ReminderRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        return ResponseEntity.ok(reminderService.create(req, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reminder> updateReminder(@PathVariable Long id,
            @RequestBody ReminderRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        return ResponseEntity.ok(reminderService.update(id, req, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReminder(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        reminderService.delete(id, user);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-complete")
    public ResponseEntity<Reminder> toggleComplete(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        return ResponseEntity.ok(reminderService.toggleComplete(id, user));
    }
}
