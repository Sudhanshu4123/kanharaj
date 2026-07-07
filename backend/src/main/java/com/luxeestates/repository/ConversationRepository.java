package com.luxeestates.repository;

import com.luxeestates.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c JOIN FETCH c.buyer JOIN FETCH c.seller LEFT JOIN FETCH c.property " +
           "WHERE c.buyer.id = :userId OR c.seller.id = :userId " +
           "ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC")
    List<Conversation> findActiveConversationsForUser(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.buyer.id = :user1Id AND c.seller.id = :user2Id) OR " +
           "(c.buyer.id = :user2Id AND c.seller.id = :user1Id)")
    Optional<Conversation> findBetweenUsers(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
}
