package com.managemyopz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * HrmsPlatformApplication — Entry point for the ManageMyOpz HR Operating System.
 *
 * This Spring Boot application assembles all platform and domain modules
 * into a single deployable unit (modular monolith). Component scanning
 * covers the com.managemyopz base package to discover all modules.
 */
@SpringBootApplication
@EnableAsync
public class HrmsPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(HrmsPlatformApplication.class, args);
    }
}
