package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;


import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.services.RoleService;
import ru.kata.spring.boot_security.demo.services.UserService;

import javax.validation.Valid;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Controller
@RequestMapping("/admin")
public class AdminController {
    private final UserService userService;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AdminController(UserService userService, RoleService roleService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
    }


    // Метод для отображения страницы с таблицей пользователей
    @GetMapping()
    public String userList(Model model) {
        model.addAttribute("userForm", new User());
        model.addAttribute("roles", roleService.getAllRoles());
        model.addAttribute("updUser", new User());

        //Получение текущего авторизованного пользователя
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        model.addAttribute("currentUser", currentUser);


        String rolesString = currentUser.getRoles().stream()
                .map(role -> role.getName().substring(5))
                .collect(Collectors.joining(" "));

        List<User> allUsers = userService.allUsers();

        // Обработка ролей для каждого пользователя
        List<User> processedUsers = allUsers.stream()
                .map(user -> {
                    User processedUser = new User();
                    processedUser.setId(user.getId());
                    processedUser.setFirstName(user.getFirstName());
                    processedUser.setLastName(user.getLastName());
                    processedUser.setAge(user.getAge());
                    processedUser.setEmail(user.getEmail());

                    // Обработка ролей
                    Set<Role> processedRoles = user.getRoles().stream()
                            .map(role -> new Role(role.getName().substring(5))) // Удаление префикса ROLE_
                            .collect(Collectors.toSet());
                    processedUser.setRoles(processedRoles);

                    return processedUser;
                })
                .collect(Collectors.toList());

        model.addAttribute("rolesString", rolesString);
        model.addAttribute("allUsers", userService.allUsers());

        return "admin";
    }





    @GetMapping("/new_user")
    public String addUser(Model model) {
        model.addAttribute("userForm", new User());
        model.addAttribute("roles", roleService.getAllRoles());
        return "admin";
    }

    // Метод для добавления нового пользователя
    @PostMapping("/new_user")
    public String addUser(
            @ModelAttribute("userForm") @Valid User userForm,
            BindingResult bindingResult,
            Model model
    ) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("allUsers", userService.allUsers());
            model.addAttribute("roles", roleService.getAllRoles());
            model.addAttribute("currentUser", (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
            model.addAttribute("activeTab", "new-user"); // остаться на вкладке создания пользователя
            return "/admin";
        }



        if (!userService.saveUser(userForm)) {
            model.addAttribute("usernameError", "Пользователь с таким именем уже существует");
            model.addAttribute("allUsers", userService.allUsers());
            model.addAttribute("activeTab", "new-user"); // остаться на вкладке создания пользователя
            return "/admin";
        }

        userService.saveUser(userForm);

        return "redirect:/admin";
    }


    @PostMapping("/edit")
    public String updateUser(
            @RequestParam("id") Long id,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("age") Integer age,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("roles") String roles,
            Model model) {
        // Обработка данных пользователя
        User updUser = userService.findUserById(id);
        if (updUser == null) {
            model.addAttribute("error", "Пользователь с ID " + id + " не найден");
            return "redirect:/admin";
        }

        updUser.setId(id);
        updUser.setFirstName(firstName);
        updUser.setLastName(lastName);
        updUser.setAge(age);
        updUser.setEmail(email);
        if (password != null && !password.isEmpty()) {
            updUser.setPassword(passwordEncoder.encode(password));
        }

        // Преобразование строк ролей в объекты Role
        Set<Role> roleSet = Arrays.stream(roles.split(","))
                .map(roleName -> roleService.getRoleByName(roleName.trim()))
                .collect(Collectors.toSet());

        updUser.setRoles(roleSet);

        userService.updateUser(updUser);
        return "redirect:/admin";
    }


}

