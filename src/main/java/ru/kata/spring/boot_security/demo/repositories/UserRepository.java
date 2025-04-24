package ru.kata.spring.boot_security.demo.repositories;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.kata.spring.boot_security.demo.models.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    @EntityGraph(attributePaths = {"roles"})
    Optional<User> findById(Long id);

    @EntityGraph(attributePaths = {"roles"})
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"roles"})
    Optional<User> findByEmail(Long id);

    @EntityGraph(attributePaths = {"roles"})
    List<User> findAll();

    boolean existsByEmail(String email);
}