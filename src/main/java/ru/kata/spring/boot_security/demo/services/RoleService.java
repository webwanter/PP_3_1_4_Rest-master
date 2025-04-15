package ru.kata.spring.boot_security.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.repositories.RoleRepository;

import javax.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoleService {
    private final RoleRepository roleRepository;

    @Autowired
    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
        roleRepository.save(new Role(0L, "ROLE_ADMIN"));
        roleRepository.save(new Role(1L, "ROLE_USER"));
    }

    public Role getRoleByName(String name) {
        return roleRepository.findByName(name).orElseThrow(() -> new EntityNotFoundException("Role not found"));    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
}
