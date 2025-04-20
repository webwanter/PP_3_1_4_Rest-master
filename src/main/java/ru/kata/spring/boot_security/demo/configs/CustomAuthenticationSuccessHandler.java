//package ru.kata.spring.boot_security.demo.configs;
//
//import org.springframework.security.core.Authentication;
//import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
//import org.springframework.stereotype.Component;
//
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//import java.io.IOException;
//
//@Component
//public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
//
//    @Override
//    public void onAuthenticationSuccess(HttpServletRequest request,
//                                        HttpServletResponse response,
//                                        Authentication authentication) throws IOException {
//        boolean isAdmin = authentication.getAuthorities().stream()
//                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
//        boolean isUser = authentication.getAuthorities().stream()
//                .anyMatch(a -> a.getAuthority().equals("ROLE_USER"));
//
//        if (isAdmin) {
//            response.sendRedirect("/admin");
//        } else if (isUser) {
//            response.sendRedirect("/user");
//        } else {
//            response.sendRedirect("/login?error"); // или другая страница по умолчанию
//        }
//    }
//}
