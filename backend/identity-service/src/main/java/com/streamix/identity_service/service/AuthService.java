package com.streamix.identity_service.service;

import com.streamix.identity_service.entity.UserCredential;
import com.streamix.identity_service.repository.UserCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserCredentialRepository repository;

    public String saveUser(UserCredential credential) {
        // Later we will add password encryption here!
        repository.save(credential);
        return "User added to the system";
    }
}