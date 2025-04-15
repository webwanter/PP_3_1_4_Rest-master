package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.dto.UserDTO;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.services.RoleService;
import ru.kata.spring.boot_security.demo.services.UserService;

import javax.validation.Valid;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminRestController {

    private final UserService userService;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    public AdminRestController(UserService userService, RoleService roleService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
    }

    // GET /admin — возвращаем список пользователей и текущего пользователя в JSON
    @GetMapping
    public ResponseEntity<Map<String, Object>> userList() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User currentUser = (User) authentication.getPrincipal();

        List<User> allUsers = userService.allUsers();

        List<UserDTO> usersDto = allUsers.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        UserDTO currentUserDto = convertToDto(currentUser);

        Map<String, Object> response = new HashMap<>();
        response.put("currentUser", currentUserDto);
        response.put("allUsers", usersDto);
        response.put("roles", roleService.getAllRoles().stream()
                .map(role -> role.getName().substring(5))
                .collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }

    // GET /admin/new_user — возвращаем роли и пустой UserDTO для формы создания
    @GetMapping("/new_user")
    public ResponseEntity<Map<String, Object>> addUserForm() {
        Map<String, Object> response = new HashMap<>();
        response.put("userForm", new UserDTO());
        response.put("roles", roleService.getAllRoles().stream()
                .map(role -> role.getName().substring(5))
                .collect(Collectors.toList()));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/new_user")
    public ResponseEntity<?> addUser(@RequestBody @Valid UserDTO userDTO, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            User user = convertToEntity(userDTO);
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));

            boolean saved = userService.saveUser(user);
            if (!saved) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Пользователь с таким email уже существует");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(user));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Ошибка при создании пользователя: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> updateUser(@RequestBody @Valid UserDTO userDTO) {
        System.out.println("Полученные данные: " + userDTO);

        User updUser = userService.findUserById(userDTO.getId());
        if (updUser == null) {
            System.out.println("Пользователь не найден: ID = " + userDTO.getId());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Пользователь не найден");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        System.out.println("Обновляем пользователя: " + updUser);

        try {
            updUser.setFirstName(userDTO.getFirstName());
            updUser.setLastName(userDTO.getLastName());
            updUser.setAge(userDTO.getAge());
            updUser.setEmail(userDTO.getEmail());

            if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
                updUser.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            }

            Set<Role> roles = Collections.emptySet();
            if (userDTO.getRoles() != null) {
                roles = userDTO.getRoles().stream()
                        .map(roleName -> roleService.getRoleByName("ROLE_" + roleName.trim()))
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("roles", "Роли не могут быть пустыми");
                return ResponseEntity.badRequest().body(error);
            }


            updUser.setRoles(roles);

            userService.updateUser(updUser);
            return ResponseEntity.ok(convertToDto(updUser));
        } catch (Exception e) {
            System.err.println("Ошибка при обновлении пользователя: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Ошибка при обновлении пользователя");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userService.findUserById(id);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Пользователь не найден");
        }
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }


    // Вспомогательные методы для конвертации

    private UserDTO convertToDto(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setAge(user.getAge());
        dto.setEmail(user.getEmail());
        dto.setRoles(user.getRoles().stream()
                .map(role -> role.getName().substring(5))
                .collect(Collectors.toSet()));
        return dto;
    }

    private User convertToEntity(UserDTO dto) {
        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setAge(dto.getAge());
        user.setEmail(dto.getEmail());
        Set<Role> roles = dto.getRoles().stream()
                .map(roleName -> roleService.getRoleByName("ROLE_" + roleName.trim()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        user.setRoles(roles);
        return user;
    }
}
