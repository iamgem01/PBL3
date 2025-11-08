public class DocumentRequest {
    private OperationType operationType; // CREATE, UPDATE
    private String title;
    private String content;
    private String workspaceId;      // Reference to workspace
    private String teamspaceId;      // Reference to teamspace
    private Long version;           // For UPDATE operations
    private Map<String, Object> metadata;
}