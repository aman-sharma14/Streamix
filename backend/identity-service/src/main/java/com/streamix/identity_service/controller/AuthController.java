package com.streamix.identity_service.controller;

import com.streamix.identity_service.entity.UserCredential;
import com.streamix.identity_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/register")
    public String addNewUser(@RequestBody UserCredential credential) {
        return service.saveUser(credential);
    }
}