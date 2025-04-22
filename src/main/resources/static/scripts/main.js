$(document).ready(function () {
    // Получаем CSRF токен из meta тегов
    const token = $("meta[name='_csrf']").attr("content");
    const header = $("meta[name='_csrf_header']").attr("content");

    // Настройка AJAX запросов с CSRF токеном
    $.ajaxSetup({
        beforeSend: function (xhr) {
            if (header && token) {
                xhr.setRequestHeader(header, token);
            }
        }
    });

    // Загрузка данных текущего пользователя
    loadCurrentUser();

    // Обработчики вкладок
    setupTabs();

    // Инициализация таблицы пользователей и формы
    if ($('#usersTable').length) {
        loadUsersTable();
        initNewUserForm();
    }

    // Загрузка данных пользователя для вкладки User
    if ($('#userData').length) {
        loadUserData();
    }
});

function loadCurrentUser() {
    $.get("/api", function (data) {
        const user = data.currentUser;
        $('#headerEmail').text(user.email);
        $('#headerRoles').text(Array.from(user.roles).join(', '));

        // Скрываем вкладку Admin если у пользователя нет роли ADMIN
        if (!user.roles.includes('ADMIN')) {
            $('#adminTab').parent().hide();
            $('#userTab').tab('show');
        }
    }).fail(function () {
        console.error("Ошибка загрузки данных пользователя");
    });
}

function setupTabs() {
    // Обработчик переключения основных вкладок (Admin/User)
    $('#usersTabs a').on('click', function (e) {
        e.preventDefault();
        const tabId = $(this).attr('href');
        $(this).tab('show');

        // Загружаем контент при переключении вкладок
        if (tabId === '#userSection') {
            loadUserData();
        } else if (tabId === '#adminSection') {
            loadUsersTable();
        }
    });

    // Обработчик внутренних вкладок Admin
    $('#myTab a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
}

function loadUsersTable() {
    $.get("/api/admin", function (data) {
        const users = data.allUsers;
        const roles = data.roles;

        // Заполняем таблицу пользователей
        const tbody = $('#usersTable tbody');
        tbody.empty();

        users.forEach(user => {
            const rolesText = Array.from(user.roles).join(', ');
            const row = `
                <tr data-id="${user.id}">
                    <td>${user.id}</td>
                    <td>${user.firstName}</td>
                    <td>${user.lastName}</td>
                    <td>${user.age}</td>
                    <td>${user.email}</td>
                    <td>${rolesText}</td>
                    <td>
                        <button class="btn btn-primary edit-btn" data-id="${user.id}">Edit</button>
                    </td>
                    <td>
                        <button class="btn btn-danger delete-btn" data-id="${user.id}">Delete</button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });

        // Заполняем select с ролями в форме нового пользователя
        const rolesSelect = $('#roles');
        rolesSelect.empty();
        roles.forEach(role => {
            rolesSelect.append(`<option value="${role}">${role}</option>`);
        });

        // Инициализация обработчиков кнопок
        $('.edit-btn').on('click', function () {
            const userId = $(this).data('id');
            showEditModal(userId);
        });

        $('.delete-btn').on('click', function (e) {
            e.preventDefault();
            const userId = $(this).data('id');
            showDeleteModal(userId);
        });
    }).fail(function () {
        console.error("Ошибка загрузки списка пользователей");
    });
}

function initNewUserForm() {
    // Валидация формы
    $("#newUserForm").validate({
        rules: {
            firstName: "required",
            lastName: "required",
            age: {
                required: true,
                min: 1
            },
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 3
            },
            roles: "required"
        },
        messages: {
            firstName: "Please enter first name",
            lastName: "Please enter last name",
            age: {
                required: "Please enter age",
                min: "Age must be positive"
            },
            email: {
                required: "Please enter email",
                email: "Please enter a valid email address"
            },
            password: {
                required: "Please provide a password",
                minlength: "Your password must be at least 3 characters long"
            },
            roles: "Please select at least one role"
        },
        submitHandler: function (form) {
            addNewUser();
            return false;
        }
    });
}

function addNewUser() {
    const formData = {
        firstName: $('#firstName').val(),
        lastName: $('#lastName').val(),
        age: $('#age').val(),
        email: $('#email').val(),
        password: $('#password').val(),
        roles: $('#roles').val()
    };

    $.ajax({
        url: '/api/admin/new_user',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function (response) {
            $('#newUserForm')[0].reset();
            loadUsersTable();
            $('#new-user-tab').tab('show');
            alert('User added successfully!');
        },
        error: function (xhr) {
            if (xhr.status === 409) {
                alert('Error: Email already exists');
            } else {
                alert('Error adding user');
            }
        }
    });
}

function showEditModal(userId) {
    $.get(`/api/admin/edit/${userId}`, function (user) {
        // Заполняем форму данными пользователя
        $('#editForm input[name="id"]').val(user.id);
        $('#editForm input[name="firstName"]').val(user.firstName);
        $('#editForm input[name="lastName"]').val(user.lastName);
        $('#editForm input[name="age"]').val(user.age);
        $('#editForm input[name="email"]').val(user.email);
        $('#editForm input[name="password"]').val('');

        // Заполняем роли
        const rolesSelect = $('#editForm select[name="roles"]');
        rolesSelect.empty();
        rolesSelect.append('<option value="USER">USER</option>');
        rolesSelect.append('<option value="ADMIN">ADMIN</option>');

        // Выбираем текущие роли пользователя
        if (user.roles) {
            user.roles.forEach(role => {
                rolesSelect.find(`option[value="${role}"]`).prop('selected', true);
            });
        }

        // Инициализируем валидацию
        initEditFormValidation();

        // Показываем модальное окно
        $('#editModal').modal('show');
    }).fail(function () {
        alert('Ошибка загрузки данных пользователя');
    });
}


javascript

function initEditFormValidation() {
    // Удаляем предыдущие валидаторы, если они были
    $("#editForm").validate().destroy();

    $("#editForm").validate({
        rules: {
            firstName: {
                required: true,
                minlength: 2
            },
            lastName: {
                required: true,
                minlength: 2
            },
            age: {
                required: true,
                min: 1,
                digits: true
            },
            email: {
                required: true,
                email: true
            },
            roles: {
                required: true
            }
        },
        messages: {
            firstName: {
                required: "Пожалуйста, введите имя",
                minlength: "Имя должно содержать минимум 2 символа"
            },
            lastName: {
                required: "Пожалуйста, введите фамилию",
                minlength: "Фамилия должна содержать минимум 2 символа"
            },
            age: {
                required: "Пожалуйста, введите возраст",
                min: "Возраст должен быть положительным числом",
                digits: "Возраст должен быть целым числом"
            },
            email: {
                required: "Пожалуйста, введите email",
                email: "Пожалуйста, введите корректный email"
            },
            roles: {
                required: "Пожалуйста, выберите хотя бы одну роль"
            }
        },
        errorElement: "label",
        errorClass: "error",
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        },
        highlight: function (element) {
            $(element).addClass("is-invalid");
        },
        unhighlight: function (element) {
            $(element).removeClass("is-invalid");
        },
        submitHandler: function (form) {
            updateUser();
            return false;
        }
    });
}

function updateUser() {
    // Собираем данные из формы
    const formData = {
        id: $('#editForm input[name="id"]').val(),
        firstName: $('#editForm input[name="firstName"]').val(),
        lastName: $('#editForm input[name="lastName"]').val(),
        age: $('#editForm input[name="age"]').val(),
        email: $('#editForm input[name="email"]').val(),
        password: $('#editForm input[name="password"]').val(),
        roles: $('#editForm select[name="roles"]').val()
    };

    // Отправляем данные на сервер
    $.ajax({
        url: '/api/admin/edit',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function (response) {
            $('#editModal').modal('hide');
            loadUsersTable();
            alert('Пользователь успешно обновлен!');
        },
        error: function (xhr) {
            if (xhr.status === 400) {
                // Обработка ошибок валидации с сервера
                const errors = xhr.responseJSON;
                for (const field in errors) {
                    $(`#editForm [name="${field}"]`).addClass('is-invalid');
                    $(`#${field}-error`).text(errors[field]).show();
                }
            } else {
                alert('Ошибка обновления пользователя: ' + xhr.statusText);
            }
        }
    });
}

function showDeleteModal(userId) {
    $.get(`/api/admin/edit/${userId}`, function (user) {
        $('#idDelete').val(user.id);
        $('#firstNameDelete').val(user.firstName);
        $('#lastNameDelete').val(user.lastName);
        $('#ageDelete').val(user.age);
        $('#emailDelete').val(user.email);

        // Заполняем роли
        const rolesDelete = $('#rolesDelete');
        rolesDelete.empty();
        user.roles.forEach(role => {
            rolesDelete.append(`<option selected>${role.name.substring(5)}</option>`);
        });

        // Показываем модальное окно
        $('#deleteModal').modal('show');

        // Обработчик кнопки удаления
        $('#deleteButton').off('click').on('click', function () {
            deleteUser(userId);
        });
    }).fail(function () {
        alert('Error loading user data');
    });
}

function deleteUser(userId) {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        return;
    }

    $.ajax({
        url: `/api/admin/delete/${userId}`,
        type: 'DELETE',
        success: function () {
            $('#deleteModal').modal('hide');

            // Удаляем строку из таблицы без перезагрузки страницы
            $(`#usersTable tr[data-id="${userId}"]`).remove();

            // Можно добавить уведомление об успешном удалении
            showAlert('Пользователь успешно удален', 'success');
        },
        error: function (xhr) {
            $('#deleteModal').modal('hide');
            showAlert('Ошибка при удалении пользователя: ' + xhr.statusText, 'danger');
        }
    });
}

// Вспомогательная функция для показа уведомлений
function showAlert(message, type) {
    const alert = $(`<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`);

    $('#usersTable').before(alert);

    // Автоматическое закрытие уведомления через 5 секунд
    setTimeout(() => {
        alert.alert('close');
    }, 5000);
}

function loadUserData() {
    $('#loadingIndicator').show();
    $('#errorMessage').hide();

    $.get("/api/user", function (user) {
        const userData = $('#userData');
        userData.empty();

        const rolesText = Array.from(user.roles).join(', ');
        const row = `
            <tr>
                <td>${user.id}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.age}</td>
                <td>${user.email}</td>
                <td>${rolesText}</td>
            </tr>
        `;
        userData.append(row);
        $('#loadingIndicator').hide();
    }).fail(function () {
        $('#loadingIndicator').hide();
        $('#errorMessage').show();
    });
}