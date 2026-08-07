package com.zenelait.hrms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

import java.util.HashMap;
import java.util.concurrent.CompletableFuture;

@Configuration
@Profile("mock-services")
public class MockKafkaConfig {

    @Bean
    @Primary
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<String, String>(new DefaultKafkaProducerFactory<>(new HashMap<>())) {
            @Override
            public CompletableFuture<SendResult<String, String>> send(String topic, String key, String data) {
                System.out.println("[MOCK KAFKA] Message sent to topic '" + topic + "' with key '" + key + "': " + data);
                return CompletableFuture.completedFuture(null);
            }

            @Override
            public CompletableFuture<SendResult<String, String>> send(String topic, String data) {
                System.out.println("[MOCK KAFKA] Message sent to topic '" + topic + "': " + data);
                return CompletableFuture.completedFuture(null);
            }
        };
    }
}
