package com.presidency.scheduler.config;

import com.presidency.scheduler.model.User;
import com.presidency.scheduler.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if users need password reset
        userRepository.findByUsername("admin").ifPresent(admin -> {
            String encodedPassword = passwordEncoder.encode("password123");
            if (!admin.getPassword().equals(encodedPassword) && !passwordEncoder.matches("password123", admin.getPassword())) {
                log.info("Resetting admin password...");
                admin.setPassword(encodedPassword);
                userRepository.save(admin);
            }
        });

        userRepository.findByUsername("smith").ifPresent(smith -> {
            if (!passwordEncoder.matches("password123", smith.getPassword())) {
                log.info("Resetting smith password...");
                smith.setPassword(passwordEncoder.encode("password123"));
                userRepository.save(smith);
            }
        });

        userRepository.findByUsername("patel").ifPresent(patel -> {
            if (!passwordEncoder.matches("password123", patel.getPassword())) {
                log.info("Resetting patel password...");
                patel.setPassword(passwordEncoder.encode("password123"));
                userRepository.save(patel);
            }
        });

        userRepository.findByUsername("viewer").ifPresent(viewer -> {
            if (!passwordEncoder.matches("password123", viewer.getPassword())) {
                log.info("Resetting viewer password...");
                viewer.setPassword(passwordEncoder.encode("password123"));
                userRepository.save(viewer);
            }
        });
    }
}
