//package ru.kata.spring.boot_security.demo.controllers;
//
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.GetMapping;
//import ru.kata.spring.boot_security.demo.models.User;
//
//@Controller
//public class RedirectController {
//
////    Контроллер для проверки уровня авторизации и перенаправления
//
//    @GetMapping("/")
//    public String redirect() {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//
//        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
//            return "redirect:/login";
//        }
//
//        return "redirect:/login";
//    }
//}
