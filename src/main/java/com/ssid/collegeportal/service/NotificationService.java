package com.ssid.collegeportal.service;

import com.ssid.collegeportal.dto.NotificationRequestDTO;
import com.ssid.collegeportal.model.Notification;
import com.ssid.collegeportal.model.User;
import com.ssid.collegeportal.model.Student;
import com.ssid.collegeportal.repository.NotificationRepository;
import com.ssid.collegeportal.repository.UserRepository;
import com.ssid.collegeportal.repository.StudentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Arrays;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }

    public List<Notification> createNotification(NotificationRequestDTO dto, String type) {
        List<User> recipients = determineRecipients(dto);
        List<Notification> notifications = new ArrayList<>();

        for (User recipient : recipients) {
            Notification notification = new Notification();
            notification.setTitle(dto.getTitle());
            notification.setMessage(dto.getMessage());
            notification.setRecipient(recipient);
            notification.setType(type);
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            Notification saved = notificationRepository.save(notification);
            notifications.add(saved);

            if (recipient != null && recipient.getEmail() != null) {
                sendEmailNotification(recipient.getEmail(), dto.getTitle() + ": " + dto.getMessage());
            }
        }

        return notifications;
    }

    private List<User> determineRecipients(NotificationRequestDTO dto) {
        List<User> recipients = new ArrayList<>();

        if (dto.getAudience() != null) {
            switch (dto.getAudience().toUpperCase()) {
                case "ALL_USERS":
                    recipients = userRepository.findAll();
                    break;
                case "ALL_STUDENTS":
                    recipients = userRepository.findByRoleName("STUDENT");
                    break;
                case "ALL_FACULTY":
                    recipients = userRepository.findByRoleName("FACULTY");
                    break;
                case "SPECIFIC_BRANCH":
                    if (dto.getBranchId() != null) {
                        List<Student> students = studentRepository.findByBranchId(dto.getBranchId());
                        recipients = students.stream()
                                .map(Student::getUser)
                                .filter(user -> user != null)
                                .toList();
                    }
                    break;
                case "SPECIFIC_USER":
                    if (dto.getRecipientUserId() != null) {
                        userRepository.findById(dto.getRecipientUserId()).ifPresent(recipients::add);
                    }
                    break;
                case "MULTIPLE_USERS":
                    if (dto.getRecipientUserIds() != null && !dto.getRecipientUserIds().isEmpty()) {
                        recipients = userRepository.findAllById(dto.getRecipientUserIds());
                    }
                    break;
                default:
                    // Default to all students if audience is not specified or invalid
                    recipients = userRepository.findByRoleName("STUDENT");
                    break;
            }
        } else {
            // Backward compatibility: if no audience specified, use old logic
            if (dto.getRecipientUserId() != null) {
                userRepository.findById(dto.getRecipientUserId()).ifPresent(recipients::add);
            } else {
                // Default to all students
                recipients = userRepository.findByRoleName("STUDENT");
            }
        }

        return recipients;
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsReadForUser(User user) {
        List<Notification> unreadNotifications = notificationRepository.findByRecipientAndRead(user, false);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    public Page<Notification> getNotificationsForUser(User user, Boolean unread, String type, Pageable pageable) {
        if (unread != null && type != null && !type.isBlank()) {
            return notificationRepository.findByRecipientAndReadAndTypeContainingIgnoreCase(user, unread, type,
                    pageable);
        } else if (unread != null) {
            return notificationRepository.findByRecipientAndReadAndTypeContainingIgnoreCase(user, unread, "", pageable);
        } else if (type != null && !type.isBlank()) {
            Page<Notification> all = notificationRepository.findByRecipient(user, pageable);
            List<Notification> filtered = all.getContent().stream()
                    .filter(n -> n.getType() != null && n.getType().toLowerCase().contains(type.toLowerCase()))
                    .toList();
            return new PageImpl<>(filtered, pageable, all.getTotalElements());
        } else {
            return notificationRepository.findByRecipient(user, pageable);
        }
    }

    public void sendEmailNotification(String to, String message) {
        System.out.println("Email to " + to + ": " + message);
    }

    public Notification updateNotification(Long id, NotificationRequestDTO dto) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setTitle(dto.getTitle());
        notification.setMessage(dto.getMessage());
        return notificationRepository.save(notification);
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}
