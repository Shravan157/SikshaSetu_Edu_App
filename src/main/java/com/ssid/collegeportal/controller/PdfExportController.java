package com.ssid.collegeportal.controller;

import com.ssid.collegeportal.model.Result;
import com.ssid.collegeportal.service.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.util.List;

@RestController
@RequestMapping("/api/export")
public class PdfExportController {
    @Autowired
    private ResultService resultService;
    @Autowired
    private com.ssid.collegeportal.service.AttendanceService attendanceService;

    @GetMapping("/results/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or (hasRole('STUDENT') and #studentId == principal.id)")
    public ResponseEntity<byte[]> exportResultsPdf(@PathVariable Long studentId) {
        List<Result> results = resultService.getResultsByStudentId(studentId);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            document.add(new Paragraph("Results Report"));
            document.add(new Paragraph("Student ID: " + studentId));
            document.add(new Paragraph(" "));
            PdfPTable table = new PdfPTable(3);
            table.addCell("Subject");
            table.addCell("Marks");
            table.addCell("Result ID");
            for (Result result : results) {
                table.addCell(result.getSubject());
                table.addCell(String.valueOf(result.getMarks()));
                table.addCell(String.valueOf(result.getId()));
            }
            document.add(table);
            document.close();
            byte[] pdfBytes = out.toByteArray();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=results_" + studentId + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/attendance/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or (hasRole('STUDENT') and #studentId == principal.id)")
    public ResponseEntity<byte[]> exportAttendancePdf(@PathVariable Long studentId) {
        java.util.List<com.ssid.collegeportal.model.Attendance> attendanceList = attendanceService.getAttendanceByStudentId(studentId);
        try (java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            com.itextpdf.text.Document document = new com.itextpdf.text.Document();
            com.itextpdf.text.pdf.PdfWriter.getInstance(document, out);
            document.open();
            document.add(new com.itextpdf.text.Paragraph("Attendance Report"));
            document.add(new com.itextpdf.text.Paragraph("Student ID: " + studentId));
            document.add(new com.itextpdf.text.Paragraph(" "));
            com.itextpdf.text.pdf.PdfPTable table = new com.itextpdf.text.pdf.PdfPTable(4);
            table.addCell("Date");
            table.addCell("Present");
            table.addCell("Faculty Name");
            table.addCell("Attendance ID");
            for (com.ssid.collegeportal.model.Attendance att : attendanceList) {
                table.addCell(att.getDate() != null ? att.getDate().toString() : "");
                table.addCell(att.getPresent() != null ? (att.getPresent() ? "Yes" : "No") : "");
                table.addCell(att.getFaculty() != null && att.getFaculty().getUser() != null ? att.getFaculty().getUser().getName() : "");
                table.addCell(String.valueOf(att.getId()));
            }
            document.add(table);
            document.close();
            byte[] pdfBytes = out.toByteArray();
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_" + studentId + ".pdf")
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
