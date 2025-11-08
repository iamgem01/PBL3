package com.example.collabservice.service;

import com.example.collabservice.model.WorkspaceMember;
import com.example.collabservice.model.TeamspaceMember;
import com.example.collabservice.model.Document;
import com.example.collabservice.repository.WorkspaceRepository;
import com.example.collabservice.repository.TeamspaceRepository;
import com.example.collabservice.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PermissionService {
    private final WorkspaceRepository workspaceRepository;
    private final TeamspaceRepository teamspaceRepository;
    private final DocumentRepository documentRepository;

    public boolean canReadInWorkspace(String workspaceId, String userId) {
        Optional<WorkspaceMember> member = workspaceRepository.findMemberByWorkspaceIdAndUserId(workspaceId, userId);
        return member.isPresent() && member.get().getStatus().equals("active");
    }

    public boolean canWriteInWorkspace(String workspaceId, String userId) {
        Optional<WorkspaceMember> member = workspaceRepository.findMemberByWorkspaceIdAndUserId(workspaceId, userId);
        return member.isPresent() &&
                member.get().getStatus().equals("active") &&
                (member.get().getPermissions().contains("write") ||
                        member.get().getRole().equals("owner"));
    }

    public boolean canReadDocument(String documentId, String userId) {
        Optional<Document> documentOpt = documentRepository.findById(documentId);
        if (documentOpt.isEmpty()) return false;

        Document document = documentOpt.get();

        // Kiểm tra workspace permission trước
        if (!canReadInWorkspace(document.getWorkspaceId(), userId)) {
            return false;
        }

        // Kiểm tra specific permissions nếu có
        if (!document.getPermissions().isInheritance() &&
                document.getPermissions().getSpecific() != null) {
            return document.getPermissions().getSpecific().stream()
                    .anyMatch(perm -> perm.getUserId().equals(userId) &&
                            (perm.getPermission().equals("read") ||
                                    perm.getPermission().equals("write") ||
                                    perm.getPermission().equals("comment")));
        }

        return true;
    }

    public boolean canWriteDocument(String documentId, String userId) {
        Optional<Document> documentOpt = documentRepository.findById(documentId);
        if (documentOpt.isEmpty()) return false;

        Document document = documentOpt.get();

        // Kiểm tra workspace permission trước
        if (!canWriteInWorkspace(document.getWorkspaceId(), userId)) {
            return false;
        }

        // Kiểm tra specific permissions nếu có
        if (!document.getPermissions().isInheritance() &&
                document.getPermissions().getSpecific() != null) {
            return document.getPermissions().getSpecific().stream()
                    .anyMatch(perm -> perm.getUserId().equals(userId) &&
                            perm.getPermission().equals("write"));
        }

        return true;
    }

    public boolean canDeleteDocument(String documentId, String userId) {
        Optional<Document> documentOpt = documentRepository.findById(documentId);
        if (documentOpt.isEmpty()) return false;

        Document document = documentOpt.get();

        // Chỉ owner của document hoặc owner của workspace có thể delete
        Optional<WorkspaceMember> workspaceMember = workspaceRepository
                .findMemberByWorkspaceIdAndUserId(document.getWorkspaceId(), userId);

        return workspaceMember.isPresent() &&
                (workspaceMember.get().getPermissions().contains("delete") ||
                        workspaceMember.get().getRole().equals("owner") ||
                        document.getCreatedBy().equals(userId));
    }

    public boolean canManageWorkspace(String workspaceId, String userId) {
        Optional<WorkspaceMember> member = workspaceRepository.findMemberByWorkspaceIdAndUserId(workspaceId, userId);
        return member.isPresent() &&
                member.get().getStatus().equals("active") &&
                (member.get().getPermissions().contains("manage_settings") ||
                        member.get().getRole().equals("owner"));
    }

    public List<String> getUsersWithDocumentAccess(String documentId) {
        // Placeholder implementation
        // Trong thực tế, cần lấy danh sách user có quyền truy cập document
        return new ArrayList<>();
    }
}