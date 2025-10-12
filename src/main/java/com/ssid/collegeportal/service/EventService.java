package com.ssid.collegeportal.service;

import com.ssid.collegeportal.dto.EventRequestDTO;
import com.ssid.collegeportal.model.Event;
import com.ssid.collegeportal.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventService {
    @Autowired
    private EventRepository eventRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    public Event createEvent(EventRequestDTO dto) {
        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setEventDate(dto.getEventDate());
        event.setLocation(dto.getLocation());
        event.setAttachmentPath(dto.getAttachmentPath());
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, EventRequestDTO dto) {
        Event event = eventRepository.findById(id).orElseThrow();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setEventDate(dto.getEventDate());
        event.setLocation(dto.getLocation());
        event.setAttachmentPath(dto.getAttachmentPath());
        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
}
