package ru.kata.spring.boot_security.demo.services;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.repositories.RoleRepository;
import ru.kata.spring.boot_security.demo.repositories.UserRepository;

import java.util.List;

@Service
@Transactional
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email) // Используем метод с @EntityGraph
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public User findUserById(Long userId) {
        return userRepository.findById(userId).orElse(new User());
    }

    @Transactional(readOnly = true)
    public List<User> allUsers() {
        return userRepository.findAll();
    }

    public boolean saveUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return true;
    }

    public boolean deleteUser(Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    userRepository.delete(user);
                    return true;
                })
                .orElse(false);
    }

    public boolean updateUser(User user) {
        return userRepository.findById(user.getId())
                .map(userToUpdate -> {
                    userToUpdate.setFirstName(user.getFirstName());
                    userToUpdate.setLastName(user.getLastName());
                    userToUpdate.setAge(user.getAge());
                    userToUpdate.setEmail(user.getEmail());

                    if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                        userToUpdate.setPassword(passwordEncoder.encode(user.getPassword()));
                    }

                    userToUpdate.setRoles(user.getRoles());
                    userRepository.save(userToUpdate);
                    return true;
                })
                .orElse(false);
    }
}