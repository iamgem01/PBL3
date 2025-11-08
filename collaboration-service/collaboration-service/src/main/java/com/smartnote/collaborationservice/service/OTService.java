package com.example.collabservice.service;

import com.example.collabservice.model.DocumentChange;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OTService {

    public List<DocumentChange> transformChanges(
            List<DocumentChange> clientChanges,
            List<DocumentChange> serverChanges) {

        // Implement Operational Transform algorithm
        // Đây là implementation đơn giản
        List<DocumentChange> transformed = new ArrayList<>();

        for (DocumentChange clientChange : clientChanges) {
            DocumentChange transformedChange = clientChange;

            for (DocumentChange serverChange : serverChanges) {
                transformedChange = transformAgainst(transformedChange, serverChange);
            }

            transformed.add(transformedChange);
        }

        return transformed;
    }

    private DocumentChange transformAgainst(DocumentChange change1, DocumentChange change2) {
        // Logic transform phức tạp tùy thuộc vào loại operation
        // Ví dụ đơn giản: giữ nguyên nếu không conflict
        return change1;
    }
}