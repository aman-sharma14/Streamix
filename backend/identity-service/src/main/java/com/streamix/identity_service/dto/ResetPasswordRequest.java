package com.streamix.identity_service.dto;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String email;
    private String code;
    private String newPassword;
}
