package com.streamix.identity_service.repository;

import com.streamix.identity_service.entity.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserCredentialRepository extends JpaRepository<UserCredential, Integer> {
    // This adds a custom search feature automatically!
    Optional<UserCredential> findByEmail(String email);
}