
$(document).ready(function () {
    $("#editForm").validate({
        errorClass: "error",
        errorElement: "label",
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        },
        rules: {
            firstName: "required",
            lastName: "required",
            age: {
                required: true,
                number: true,
                min: 1
            },
            email: {
                required: true,
                email: true
            },
            password: {
                minlength: 3
            }
        },
        messages: {
            firstName: "Please enter the first name",
            lastName: "Please enter the last name",
            age: {
                required: "Please enter the age",
                number: "Age must be a number",
                min: "Age must be positive"
            },
            email: {
                required: "Please enter the email",
                email: "Please enter a valid email"
            },
            password: {
                minlength: "Password must be at least 3 characters long"
            }
        },
        submitHandler: function (form) {
            var updatedUser = {
                id: $('#idEdit').val(),
                firstName: $('#firstNameEdit').val(),
                lastName: $('#lastNameEdit').val(),
                age: $('#ageEdit').val(),
                email: $('#emailEdit').val(),
                password: $('#passwordEdit').val(),
                roles: $('#rolesEdit').val() || []  // если null, то пустой массив
            };
            saveUserChanges(updatedUser);
        }
    });

    function saveUserChanges(updatedUser) {
        $.ajax({
            url: '/api/admin/edit',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(updatedUser),
            success: function (data) {
                alert("User updated successfully");
                $('#editModal').modal('hide');
                loadUsers();
            },
            error: function (xhr) {
                var validator = $("#editForm").validate();
                if (xhr.status === 409 && xhr.responseJSON) {
                    // Show server-side validation error
                    validator.showErrors({
                        email: xhr.responseJSON.email
                    });
                } else {
                    alert("Error updating user");
                }
            }
        });
    }

    $("#newUserForm").validate({
        errorClass: "error", errorElement: "label", errorPlacement: function (error, element) {
            error.insertAfter(element);
        },
        rules: {
            firstName: "required",
            lastName: "required",
            age: {
                required: true,
                number: true,
                min: 1
            },
            email: {
                required: true,
                email: true
            },
            password: {
                minlength: 3
            },
            roles: "required"
        },
        messages: {
            firstName: "Пожалуйста, введите имя",
            lastName: "Пожалуйста, введите фамилию",
            age: {
                required: "Пожалуйста, введите возраст",
                number: "Возраст должен быть числом",
                min: "Возраст должен быть положительным"
            },
            email: {
                required: "Пожалуйста, введите email",
                email: "Введите корректный email"
            },
            password: {
                minlength: "Пароль должен быть не менее 3 символов"
            },
            roles: "Пожалуйста, выберите хотя бы одну роль"
        },
        submitHandler: function (form) {
            var newUser = {
                firstName: $('#firstName').val(),
                lastName: $('#lastName').val(),
                age: $('#age').val(),
                email: $('#email').val(),
                password: $('#password').val(),
                roles: $('#roles').val()
            };
            createUser(newUser);
        }
    });

    loadUsers();
    loadRoles();
    loadCurrentUser();

    $('.nav-link').on('click', function (e) {
        e.preventDefault();
        var target = $(this).data('target');
        if (target === '#user-page-tab') {
            loadCurrentUser();
        }
        $(this).tab('show');
    });

    $('#editModal').on('show.bs.modal', function (event) {
        $("#editForm").validate().resetForm();
        var button = $(event.relatedTarget);
        var userId = button.data('id');
        loadUserForEdit(userId);
    });

    $('#deleteModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var userId = button.data('id');
        loadUserForDelete(userId);
    });

    $('#deleteButton').click(function () {
        deleteUser();
    });


    function loadUsers() {
        $.ajax({
            url: '/api/admin',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                var users = data.allUsers;
                var tableBody = $('#usersTable tbody');
                tableBody.empty();

                $.each(users, function (i, user) {
                    var roles = user.roles ? user.roles.join(', ') : '';
                    var row = '<tr>' +
                        '<td>' + user.id + '</td>' +
                        '<td>' + user.firstName + '</td>' +
                        '<td>' + user.lastName + '</td>' +
                        '<td>' + user.age + '</td>' +
                        '<td>' + user.email + '</td>' +
                        '<td>' + roles + '</td>' +
                        '<td><button type="button" class="btn btn-info" data-toggle="modal" data-target="#editModal" data-id="' + user.id + '">Edit</button></td>' +
                        '<td><button type="button" class="btn btn-danger" data-toggle="modal" data-target="#deleteModal" data-id="' + user.id + '">Delete</button></td>' +
                        '</tr>';
                    tableBody.append(row);
                });
            },
            error: function (xhr, status, error) {
            }
        });
    }

    function loadRoles() {
        $.ajax({
            url: '/api/admin/new_user',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                var roles = data.roles;
                var selectNew = $('#roles');
                var selectEdit = $('#rolesEdit');
                var selectDelete = $('#rolesDelete');

                selectNew.empty();
                selectEdit.empty();
                selectDelete.empty();

                $.each(roles, function (i, role) {
                    selectNew.append('<option value="' + role + '">' + role + '</option>');
                    selectEdit.append('<option value="' + role + '">' + role + '</option>');
                    selectDelete.append('<option value="' + role + '">' + role + '</option>');
                });
            },
            error: function (xhr, status, error) {
            }
        });
    }

    function loadCurrentUser() {
        $.ajax({
            url: '/api/admin',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                var currentUser = data.currentUser;
                $('#headerEmail').text(currentUser.email);
                $('#headerRoles').text('Roles: ' + currentUser.roles.join(', '));

                $('#userId').text(currentUser.id);
                $('#userFirstName').text(currentUser.firstName);
                $('#userLastName').text(currentUser.lastName);
                $('#userAge').text(currentUser.age);
                $('#userEmail').text(currentUser.email);
                $('#userRoles').text(currentUser.roles.join(', '));
            },
            error: function (xhr, status, error) {
            }
        });
    }

    function createUser(newUser) {
        $.ajax({
            url: '/api/admin/new_user',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newUser),
            success: function (data) {
                alert("Пользователь создан: " + data.firstName);
                $('#newUserForm')[0].reset();
                loadUsers();
                $('#user-table-tab').tab('show');
            },
            error: function (xhr) {
                if (xhr.responseJSON) {
                    let message = "";
                    for (let key in xhr.responseJSON) {
                        message += xhr.responseJSON[key] + "\n";
                    }
                } else {
                }
            }
        });
    }

    function loadUserForEdit(userId) {
        $.ajax({
            url: '/api/admin',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                var users = data.allUsers;
                var user = users.find(u => u.id == userId);
                if (user) {
                    $('#idEdit').val(user.id);
                    $('#firstNameEdit').val(user.firstName);
                    $('#lastNameEdit').val(user.lastName);
                    $('#ageEdit').val(user.age);
                    $('#emailEdit').val(user.email);

                    var rolesSelect = $('#rolesEdit');
                    rolesSelect.val(user.roles);
                }
            },
            error: function (xhr, status, error) {
            }
        });
    }



    function loadUserForDelete(userId) {
        $.ajax({
            url: '/api/admin',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                var users = data.allUsers;
                var user = users.find(u => u.id === userId);
                if (user) {
                    $('#idDelete').val(user.id);
                    $('#firstNameDelete').val(user.firstName);
                    $('#lastNameDelete').val(user.lastName);
                    $('#ageDelete').val(user.age);
                    $('#emailDelete').val(user.email);
                    $('#rolesDelete').val(user.roles);
                }
            },
            error: function (xhr, status, error) {
            }
        });
    }

    function deleteUser() {
        var userId = $('#idDelete').val();
        $.ajax({
            url: '/api/admin/delete/' + userId,
            type: 'DELETE',
            success: function () {
                alert("Пользователь удалён");
                $('#deleteModal').modal('hide');
                loadUsers();
            },
            error: function (xhr, status, error) {
            }
        });
    }

});
