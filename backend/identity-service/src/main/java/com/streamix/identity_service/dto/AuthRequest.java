//Data Transfer Object
//represents the User's Input

//You don't want a user to send their ID or RegistrationDate during login.
// The AuthRequest DTO only contains username and password. It's a "security filter" for data.

package com.streamix.identity_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
    private String email;
    private String password;
}
