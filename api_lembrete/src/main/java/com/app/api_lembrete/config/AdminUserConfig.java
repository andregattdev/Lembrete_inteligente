package com.app.api_lembrete.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.app.api_lembrete.model.User;
import com.app.api_lembrete.repository.UserRepository;

@Configuration
public class AdminUserConfig {

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@email.com");

                admin.setPassword("admin123");
                admin.setRole("ROLE_ADMIN");
                userRepository.save(admin);
            }
        };
    }
}


