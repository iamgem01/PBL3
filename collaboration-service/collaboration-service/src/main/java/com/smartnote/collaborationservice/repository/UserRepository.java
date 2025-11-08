package com.example.collabservice.repository;

import com.example.collabservice.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByAccountStatus(String accountStatus);

    @Query("{ 'last_active': { $lt: ?0 } }")
    List<User> findInactiveUsers(LocalDateTime threshold);

    @Query("{ 'email': { $regex: ?0, $options: 'i' } }")
    List<User> findByEmailPattern(String emailPattern);

    @Query(value = "{}", fields = "{ 'email': 1, 'name': 1, 'avatar_url': 1 }")
    List<User> findBasicUserInfo();

    @Query("{ '_id': { $in': ?0 } }")
    List<User> findUsersByIds(List<String> userIds);
}