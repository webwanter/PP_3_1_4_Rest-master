package ru.kata.spring.boot_security.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;
import ru.kata.spring.boot_security.demo.models.Role;

@Component
public class StringToRoleConverter implements Converter<String, Role> {

    @Autowired
    private RoleService roleService;

    @Override
    public Role convert(String source) {
        return roleService.getRoleByName(source);
    }

}
