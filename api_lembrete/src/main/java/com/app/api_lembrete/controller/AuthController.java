package com.app.api_lembrete.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.api_lembrete.dto.LoginRequest;
import com.app.api_lembrete.model.User;
import com.app.api_lembrete.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.findByUsername(request.getUsername());
            // Comparação de senha simples, pois o usuário pediu para remover hash/segurança por enquanto
            if (user.getPassword().equals(request.getPassword())) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(401).body("Senha inválida");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Usuário não encontrado");
        }
    }
}
