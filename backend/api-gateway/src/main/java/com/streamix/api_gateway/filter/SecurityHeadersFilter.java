package com.streamix.api_gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class SecurityHeadersFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        HttpHeaders headers = exchange.getResponse().getHeaders();

        // 1. HTTP Strict Transport Security (HSTS) - Enforce HTTPS
        headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

        // 2. X-Content-Type-Options - Prevent MIME-sniffing
        headers.set("X-Content-Type-Options", "nosniff");

        // 3. X-Frame-Options - Prevent Clickjacking attacks
        headers.set("X-Frame-Options", "DENY");

        // 4. Content-Security-Policy (CSP) - Hardened for APIS
        // default-src 'none' strictly forbids any content types (images/scripts) from
        // loading from this API origin.
        headers.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; sandbox");

        // 5. X-XSS-Protection - Legacy anti-XSS
        headers.set("X-XSS-Protection", "1; mode=block");

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        // Ordered below Netty/WriteResponse filter so headers get attached before flush
        return -1;
    }
}
