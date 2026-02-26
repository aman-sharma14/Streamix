package com.streamix.catalog_service.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class InternalApiFilter extends OncePerRequestFilter {

    @Value("${INTERNAL_API_SECRET:streamix-dev-secret}")
    private String internalApiSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String secretHeader = request.getHeader("X-Internal-Secret");

        // Validate that the request came from our API Gateway
        if (secretHeader == null || !secretHeader.equals(internalApiSecret)) {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.getWriter().write("Forbidden: Direct access to microservice is not allowed");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
