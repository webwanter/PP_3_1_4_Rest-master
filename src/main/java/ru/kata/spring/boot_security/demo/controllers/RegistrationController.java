package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.services.RoleService;
import ru.kata.spring.boot_security.demo.services.UserService;

import javax.validation.Valid;

//Контроллер создания пользователей без регистрации, для нужд тестирования приложения
@Controller
public class RegistrationController {

    @Autowired
    private UserService userService;

    @Autowired
    private RoleService roleService;

    @GetMapping("/registration")
    public String addUser(Model model) {
        model.addAttribute("userForm", new User());
        model.addAttribute("roles", roleService.getAllRoles());
        return "registration";
    }

    // Метод для добавления нового пользователя
    @PostMapping("/registration")
    public String addUser(
            @ModelAttribute("userForm") @Valid User userForm,
            BindingResult bindingResult,
            Model model
    ) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("allUsers", userService.allUsers());
            model.addAttribute("roles", roleService.getAllRoles());
            return "/registration";
        }



        if (!userService.saveUser(userForm)) {
            model.addAttribute("usernameError", "Пользователь с таким именем уже существует");
            model.addAttribute("allUsers", userService.allUsers());
            return "/registration";
        }

        userService.saveUser(userForm);

        return "redirect:/login";
    }
}