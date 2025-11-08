package com.example.collabservice.repository;

import com.example.collabservice.model.Workspace;
import com.example.collabservice.model.WorkspaceMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WorkspaceRepository extends MongoRepository<Workspace, String> {

    // Workspace queries
    List<Workspace> findByOwnerId(String ownerId);

    @Query("{ 'members.user_id': ?0 }")
    List<Workspace> findByMemberUserId(String userId);

    @Query("{ 'members.user_id': ?0, 'members.status': ?1 }")
    List<Workspace> findByMemberUserIdAndStatus(String userId, String status);

    @Query("{ '_id': ?0, 'members.user_id': ?1 }")
    Optional<Workspace> findByIdAndMemberUserId(String workspaceId, String userId);

    List<Workspace> findBySettingsIsPublicTrue();

    // WorkspaceMember queries
    @Query("{ 'workspace_id': ?0, 'user_id': ?1 }")
    Optional<WorkspaceMember> findMemberByWorkspaceIdAndUserId(String workspaceId, String userId);

    @Query("{ 'workspace_id': ?0, 'role': ?1 }")
    List<WorkspaceMember> findMembersByWorkspaceIdAndRole(String workspaceId, String role);

    @Query("{ 'user_id': ?0 }")
    List<WorkspaceMember> findMembersByUserId(String userId);

    @Query(value = "{ 'workspace_id': ?0, 'status': ?1 }", count = true)
    long countMembersByWorkspaceIdAndStatus(String workspaceId, String status);

    @Query(value = "{ 'workspace_id': ?0, 'user_id': ?1 }", delete = true)
    void deleteMemberByWorkspaceIdAndUserId(String workspaceId, String userId);

    // Custom update operations
    @Query("{ '_id': ?0 }")
    @Update("{ '$push': { 'members': ?1 }, '$set': { 'updated_at': ?2 } }")
    void addMemberToWorkspace(String workspaceId, WorkspaceMember member, LocalDateTime updatedAt);

    @Query("{ '_id': ?0, 'members.user_id': ?1 }")
    @Update("{ '$pull': { 'members': { 'user_id': ?1 } }, '$set': { 'updated_at': ?2 } }")
    void removeMemberFromWorkspace(String workspaceId, String userId, LocalDateTime updatedAt);

    @Query("{ '_id': ?0, 'members.user_id': ?1 }")
    @Update("{ '$set': { 'members.$.permissions': ?2, 'updated_at': ?3 } }")
    void updateMemberPermissions(String workspaceId, String userId, List<String> permissions, LocalDateTime updatedAt);

    @Query("{ '_id': ?0, 'members.user_id': ?1 }")
    @Update("{ '$set': { 'members.$.status': ?2, 'updated_at': ?3 } }")
    void updateMemberStatus(String workspaceId, String userId, String status, LocalDateTime updatedAt);
}