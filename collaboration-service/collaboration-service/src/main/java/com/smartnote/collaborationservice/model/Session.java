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
@Document(collection = "sessions")
public class Session {
    @Id
    private String id;

    @Field("document_id")
    private String documentId;

    @Field("user_id")
    private String userId;

    @Field("client_id")
    private String clientId;

    @Field("last_activity")
    private LocalDateTime lastActivity;

    @Field("cursor_position")
    private Integer cursorPosition;

    @Field("selection_range")
    private SelectionRange selectionRange;

    private String status;

    @Field("connected_at")
    private LocalDateTime connectedAt;

    @Field("disconnected_at")
    private LocalDateTime disconnectedAt;

    @Field("user_agent")
    private String userAgent;

    @Field("ip_address")
    private String ipAddress;

    @Field("active_operations")
    private List<ActiveOperation> activeOperations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SelectionRange {
        private Integer start;
        private Integer end;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActiveOperation {
        @Field("operation_id")
        private String operationId;
        private String type;
        @Field("started_at")
        private LocalDateTime startedAt;
    }
}