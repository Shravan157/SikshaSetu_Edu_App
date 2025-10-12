package com.ssid.collegeportal.repository;

import com.ssid.collegeportal.model.Notification;
import com.ssid.collegeportal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByRecipientAndReadAndTypeContainingIgnoreCase(
        User recipient,
        boolean read,
        String type,
        Pageable pageable
    );

    Page<Notification> findByRecipient(
        User recipient,
        Pageable pageable
    );

    List<Notification> findByRecipientAndRead(
        User recipient,
        boolean read
    );
}