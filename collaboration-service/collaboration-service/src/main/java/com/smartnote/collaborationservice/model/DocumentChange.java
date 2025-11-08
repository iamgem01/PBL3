package com.example.collabservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "document_changes")
public class DocumentChange {
    @Id
    private String id;

    @Field("document_id")
    private String documentId;

    @Field("user_id")
    private String userId;

    private Long version;
    private List<Change> changes;
    private LocalDateTime timestamp;

    @Field("client_id")
    private String clientId;

    @Field("parent_version")
    private Long parentVersion;

    @Field("operation_id")
    private String operationId;

    @Field("sync_type")
    private String syncType;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Change {
        private String type;
        private Integer position;
        private String content;
        private Object attributes;
        private LocalDateTime timestamp;
    }
}