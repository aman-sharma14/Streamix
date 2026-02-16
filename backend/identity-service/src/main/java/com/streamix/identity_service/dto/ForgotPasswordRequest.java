package com.streamix.identity_service.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
}
