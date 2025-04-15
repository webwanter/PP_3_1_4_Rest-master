package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.repositories.UserRepository;
import ru.kata.spring.boot_security.demo.services.RoleService;
import ru.kata.spring.boot_security.demo.services.UserService;

import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/user")
public class UserController {
    private final RoleService roleService;


    @Autowired
    public UserController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping()
    public String userInfo(Model model) {
        model.addAttribute("roles", roleService.getAllRoles());

        //Получение текущего авторизованного пользователя
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        model.addAttribute("currentUser", currentUser);


        String rolesString = currentUser.getRoles().stream()
                .map(role -> role.getName().substring(5))
                .collect(Collectors.joining(" "));


        model.addAttribute("rolesString", rolesString);

        return "user";
    }
}
