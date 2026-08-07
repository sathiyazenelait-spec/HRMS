package com.zenelait.hrms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.core.task.support.TaskExecutorAdapter;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.concurrent.Executors;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean
    public AsyncTaskExecutor applicationTaskExecutor() {
        // TaskExecutorAdapter wrapping Executors.newVirtualThreadPerTaskExecutor()
        // Maps every asynchronous task to an ultra-lightweight JVM virtual thread.
        // Provides zero block, high-speed, zero latency concurrency.
        return new TaskExecutorAdapter(Executors.newVirtualThreadPerTaskExecutor());
    }
}
