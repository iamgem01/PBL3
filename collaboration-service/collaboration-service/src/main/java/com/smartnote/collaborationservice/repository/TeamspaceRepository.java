package com.example.collabservice.repository;

import com.example.collabservice.model.Teamspace;
import com.example.collabservice.model.TeamspaceMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TeamspaceRepository extends MongoRepository<Teamspace, String> {

    // Teamspace queries
    List<Teamspace> findByWorkspaceId(String workspaceId);
    List<Teamspace> findByWorkspaceIdAndOwnerId(String workspaceId, String ownerId);

    @Query("{ 'workspace_id': ?0, 'scope': ?1 }")
    List<Teamspace> findByWorkspaceIdAndScope(String workspaceId, String scope);

    // TeamspaceMember queries
    @Query("{ 'teamspace_id': ?0, 'user_id': ?1 }")
    Optional<TeamspaceMember> findMemberByTeamspaceIdAndUserId(String teamspaceId, String userId);

    @Query("{ 'teamspace_id': ?0 }")
    List<TeamspaceMember> findMembersByTeamspaceId(String teamspaceId);

    @Query("{ 'user_id': ?0 }")
    List<TeamspaceMember> findMembersByUserId(String userId);

    @Query(value = "{ 'teamspace_id': ?0, 'user_id': ?1 }", delete = true)
    void deleteMemberByTeamspaceIdAndUserId(String teamspaceId, String userId);

    // Complex joins
    @Query("""
        SELECT t FROM Teamspace t 
        JOIN TeamspaceMember tm ON t.id = tm.teamspaceId 
        WHERE tm.userId = ?1 AND t.workspaceId = ?2
    """)
    List<Teamspace> findTeamspacesByUserIdAndWorkspaceId(String userId, String workspaceId);

    // Custom update operations
    @Query("{ '_id': ?0 }")
    @Update("{ '$push': { 'members': ?1 }, '$set': { 'updated_at': ?2 } }")
    void addMemberToTeamspace(String teamspaceId, TeamspaceMember member, LocalDateTime updatedAt);

    @Query("{ '_id': ?0, 'members.user_id': ?1 }")
    @Update("{ '$pull': { 'members': { 'user_id': ?1 } }, '$set': { 'updated_at': ?2 } }")
    void removeMemberFromTeamspace(String teamspaceId, String userId, LocalDateTime updatedAt);

    @Query("{ '_id': ?0, 'members.user_id': ?1 }")
    @Update("{ '$set': { 'members.$.permission_level': ?2, 'members.$.custom_permissions': ?3, 'updated_at': ?4 } }")
    void updateMemberPermissions(String teamspaceId, String userId, String permissionLevel,
                                 TeamspaceMember.CustomPermissions customPermissions, LocalDateTime updatedAt);
}