package com.streamix.identity_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TempUserDto {
    private String name;
    private String email;
    private String password; // This will be the encoded BCrypt password
    private String otp;
}
