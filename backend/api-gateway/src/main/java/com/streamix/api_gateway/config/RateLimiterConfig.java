package com.streamix.api_gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

@Configuration
public class RateLimiterConfig {

    /**
     * Define a KeyResolver to determine how to identify users for rate limiting.
     * Here we use the Host Address (IP) of the requester.
     */
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            // Bypass rate limiting entirely for CORS preflight OPTIONS requests
            if (exchange.getRequest().getMethod() != null &&
                    exchange.getRequest().getMethod().matches("OPTIONS")) {
                return Mono.empty();
            }

            return Mono.just(exchange.getRequest().getRemoteAddress().getAddress().getHostAddress());
        };
    }
}
