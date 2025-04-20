$(document).ready(function () {
// Функция для загрузки ролей (добавляем кэширование)
    let rolesLoaded = false;
    let csrfToken = $('meta[name="csrf-token"]').attr('content');


    function loadRoles() {
        if (rolesLoaded) return; // Не загружаем повторно

        $.ajax({
            url: '/api/admin/new_user',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                var roles = data.roles;
                var selectNew = $('#roles');
                var selectEdit = $('#rolesEdit');
                var selectDelete = $('#rolesDelete');

                // Очищаем только если есть новые роли
                if (roles && roles.length > 0) {
                    selectNew.empty();
                    selectEdit.empty();
                    selectDelete.empty();

                    $.each(roles, function (i, role) {
                        selectNew.append($('<option>', {
                            value: role,
                            text: role
                        }));
                        selectEdit.append($('<option>', {
                            value: role,
                            text: role
                        }));
                        selectDelete.append($('<option>', {
                            value: role,
                            text: role
                        }));
                    });

                    rolesLoaded = true; // Помечаем как загруженные
                }
            },
            error: function (xhr, status, error) {
                console.error('Ошибка загрузки ролей:', error);
                // Можно добавить повторную попытку через 5 секунд
                setTimeout(loadRoles, 5000);
            }
        });
    }

    loadRoles();

    // Проверяем, есть ли сохранённая вкладка (по умолчанию — "Admin")
    const activeTab = localStorage.getItem('activeTab') || '#admin';

    // Если URL содержит /admin или активна вкладка Admin — загружаем данные
    if (window.location.pathname === '/admin' || activeTab === '#admin') {
        loadTab('/admin');
        loadUsers();
    } else if (activeTab === '#user') {
        loadTab('/user');
    }

    // Обработчик кликов по вкладкам
    $('.nav-link').on('click', function (e) {
        e.preventDefault();
        const target = $(this).data('target');
        localStorage.setItem('activeTab', target); // Сохраняем активную вкладку

        if (target === '#admin-page') {
            loadTab('/admin');
            loadUsers();
        } else if (target === '#user-page') {
            loadTab('/user');
        }
    });

    function loadTab(url) {
        $('#tabContent').html('Загрузка...');
        $.ajax({
            url: url,
            method: 'GET',
            success: function (data) {
                $('#tabContent').html(data);
                if (url === '/admin') {
                    loadUsers();
                    // Убедимся, что роли загружены
                    if (!rolesLoaded) loadRoles();
                } else if (url === '/user') {
                    loadUserPage();
                }
            },
            error: function () {
                $('#tabContent').html('Ошибка загрузки содержимого');
            }
        });
    }

    loadTab('/admin');

    $('#adminTab').click(function (e) {
        e.preventDefault();
        if (!$(this).hasClass('active')) {
            $('.nav-link').removeClass('active');
            $(this).addClass('active');
            loadTab('/admin');
            loadUsers();
        }
    });

    $('#userTab').click(function (e) {
        e.preventDefault();
        if (!$(this).hasClass('active')) {
            $('.nav-link').removeClass('active');
            $(this).addClass('active');
            loadTab('/user');
        }
    });

    // Валидация формы редактирования
    $(document).on('submit', '#editForm', function (e) {
        e.preventDefault(); // Prevent the default form submission
    });

    // Обработчик переключения вкладок
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr('href'); // Получаем ID целевой вкладки
    });



    $("#editForm").validate({
        errorClass: "error",
        errorElement: "label",
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        },
        rules: {
            firstNameEdit: "required", // firstNameEdit instead of firstName
            lastNameEdit: "required", // lastNameEdit instead of lastName
            ageEdit: { // ageEdit instead of age
                required: true,
                number: true,
                min: 1
            },
            emailEdit: { // emailEdit instead of email
                required: true,
                email: true
            },
            passwordEdit: { // passwordEdit instead of password
                minlength: 3
            }
        },
        messages: {
            firstNameEdit: "Please enter the first name", // firstNameEdit instead of firstName
            lastNameEdit: "Please enter the last name", // lastNameEdit instead of lastName
            ageEdit: { // ageEdit instead of age
                required: "Please enter the age",
                number: "Age must be a number",
                min: "Age must be positive"
            },
            emailEdit: { // emailEdit instead of email
                required: "Please enter the email",
                email: "Please enter a valid email"
            },
            passwordEdit: { // passwordEdit instead of password
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
            headers: {
                'X-CSRF-TOKEN': csrfToken
            },
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
                        emailEdit: xhr.responseJSON.email // emailEdit instead of email
                    });
                } else {
                    alert("Error updating user");
                }
            }
        });
    }

// Валидация формы нового пользователя
    $(document).on('submit', '#newUserForm', function (e) {
        e.preventDefault(); // Prevent the default form submission

        $("#newUserForm").validate({
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
    });
    // Загрузка пользователей и текущего пользователя
    loadUsers();
    loadCurrentUser();

    // Обработчики событий для табов (вкладок)
    $('.nav-link').on('click', function (e) {
        e.preventDefault();
        var target = $(this).data('target');
        if (target === '#user-page-tab') {
            loadCurrentUser();
        }
        $(this).tab('show');
    });
// Обработчик события для показа модального окна редактирования
    $(document).on('show.bs.modal', '#editModal', function (event) {
        $("#editForm").validate().resetForm();
        var button = $(event.relatedTarget);
        var userId = button.data('id');
        loadUserForEdit(userId);
    });

// Обработчик события для показа модального окна удаления
    $(document).on('show.bs.modal', '#deleteModal', function (event) {
        var button = $(event.relatedTarget);
        var userId = button.data('id');
        loadUserForDelete(userId);
    });

// Обработчик события для кнопки удаления
    $(document).on('click', '#deleteButton', function () {
        deleteUser();
    });

    //Обработчик события для кнопки редактирования
    $(document).on('click', '#editButton', function () {
        saveUserChanges();
    });

// Функция для загрузки пользователей
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
                        '<td><button type="button" class="btn btn-info editBtn" data-toggle="modal" data-target="#editModal" data-id="' + user.id + '">Edit</button></td>' +
                        '<td><button type="button" class="btn btn-danger deleteBtn" data-toggle="modal" data-target="#deleteModal" data-id="' + user.id + '">Delete</button></td>' +
                        '</tr>';
                    tableBody.append(row);
                });
            },
            error: function (xhr, status, error) {
            }
        });
    }

    // Загрузка страницы пользоветеля
    function loadUserPage() {
        fetch('/api/user')
            .then(response => response.json())
            .then(data => {
                const users = Array.isArray(data) ? data : [data];
                $('#userTable').html(users.map(user => `
                  <tr>
                      <th>${user.id}</th>
                      <th>${user.firstName}</th>
                      <th>${user.lastName}</th>
                      <th>${user.age}</th>
                      <th>${user.email}</th>
                      <th>${user.roles.join(', ')}</th>
                  </tr>
              `).join(''));
            })
            .catch(console.error);
    }


// Функция для загрузки текущего пользователя
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

// Функция для создания нового пользователя
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
                let message = "Ошибка создания пользователя";
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    message = xhr.responseJSON.error;
                }
                alert(message);
            },
            complete: function() {
                $('#addUserButton').prop('disabled', false).text('Add new user');
            }
        });
    }

// Функция для загрузки данных пользователя в форму редактирования
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


// Функция для загрузки данных пользователя в форму удаления
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

// Функция для удаления пользователя
    function deleteUser(userId) {
        if (!confirm('Удалить пользователя?')) return;

        console.log('Удаление пользователя:', userId); // Логируем ID

        $.ajax({
            url: `/api/admin/delete/${userId}`,
            type: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': csrfToken // Убедитесь, что csrfToken определён
            },
            success: function() {
                console.log('Успешно удалено');
                loadUsers(); // Перезагружаем список
            },
            error: function(xhr) {
                console.error('Ошибка удаления:', xhr.responseText);
                alert('Не удалось удалить пользователя');
            }
        });
    }
});