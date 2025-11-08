// Thêm collab-related fields
public class WorkspaceResponse {
    private String id;
    private String name;
    private List<DocumentResponse> recentDocuments;
    private List<UserInfo> onlineUsers;      // For real-time presence
    private SyncStatus syncStatus;           // Overall sync status
}
