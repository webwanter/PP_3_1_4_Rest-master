package ru.kata.spring.boot_security.demo.dto;

import javax.validation.constraints.*;
import java.util.Set;

public class UserDTO {

    @NotNull(message = "ID обязателен")
    private Long id;

    @NotBlank(message = "Имя обязательно")
    private String firstName;

    @NotBlank(message = "Фамилия обязательна")
    private String lastName;

    @Min(value = 1, message = "Возраст должен быть положительным")
    private int age;

    @Email(message = "Некорректный email")
    private String email;

    private String password; // Может быть null

    @NotEmpty(message = "Роли обязательны")
    private Set<String> roles;

    public UserDTO() {
    }

    public UserDTO(Long id, String firstName, String lastName, int age, String email, String password, Set<String> roles) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.email = email;
        this.password = password;
        this.roles = roles;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
