class LoginAccess {
    // Atributos de modelo para el inicio de sesión
    constructor() {
        // +atrubuto para el correo
        this.email = "";
        // +atrubuto para la contraseña
        this.password = "";
        // + atributo que indica cual es el endpoint de consulta
        this.urlaction = "";
        // + atributo que indica cual es el endpoint de redireccionamiento
        this.urldestino = "";
        // + atributo para guardar el response
        this.dataresponse = "";
    }

    // Método para validar el usuario
    async validarUsuario() {
        try {
            Loading();
            const response = await $.ajax({
                url: this.urlaction,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    email: this.email,     // Usar el email del atributo de la clase
                    password: this.password // Usar el password del atributo de la clase
                }
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (response.Status == "OK") {
                this.dataresponse = JSON.parse(response.Data);
                this.GeneraSesionUsuario(response);
            }
            else
            {
                this.Alerta("Login", response.Message, "Warning");
                StopLoading();
            }

        } catch (error) {
            const errorMessage = error.responseJSON ? error.responseJSON.message : "Ocurrió un error al procesar la solicitud.";
            alert("Error", errorMessage, "Hace un momento", "ERROR"); // Muestra un mensaje de error al usuario
            StopLoading();
        }
    }

    //Método para generar la sesión de usuario
    GeneraSesionUsuario(response)
    {
        
        sessionStorage.setItem("existe", this.dataresponse[0].existe);
        sessionStorage.setItem("email", this.dataresponse[0].email);
        sessionStorage.setItem("empleado", this.dataresponse[0].empleado);
        sessionStorage.setItem("u_perfil", this.dataresponse[0].u_perfil);

        //Cookie de session
        setCookie("email", this.dataresponse[0].email, 1); // Cookie válida por 1 día
        setCookie("empleado", this.dataresponse[0].empleado, 1); // Cookie válida por 1 día
        setCookie("u_perfil", this.dataresponse[0].u_perfil, 1); // Cookie válida por 1 día
        setCookie("existe", this.dataresponse[0].existe, 1); // Cookie válida por 1 día

        //Redirigir al endpoint
        window.location.href = this.urldestino;
    }

    //Mostrar notificacion de alerta
    Alerta(title, message, status) {

        let clasStatus = "isError";

        let rutaImgW = `<i class="fa fa-solid fa-triangle-exclamation notification-warning-icon notification-reaction"></i>`;

        if (status == 'Error') {
            clasStatus = "isError";
        }

        if (status == 'Warning') {
            clasStatus = "isWarning";
        }

        if (status == 'OK') {
            clasStatus = "isOK";
            rutaImgW = "";
        }

        let notificationID = "not-" + this.RandomNumber(1, 1000);
        let Notificacion =
            `<div id="${notificationID}" class="notification">
                            <div class="notification-header">
                                <h3 class="notification-title">${title}</h3>
                            </div>
                            <div class="notification-container">
                                <div class="notification-media">
                                    <img src="/Images/FFISA.png" alt="" class="notification-user-avatar">
                                    ${rutaImgW}
                                </div>
                                <div class="notification-content">
                                    <div class="notification-text">${message}</div>
                                    <span class="notification-timer">Hace un momento..</span>
                                </div>
                                <span class="notification-status ${clasStatus}"></span>
                            </div>
                        </div>`;
        // this.Notificacion.replace("{title}", title)
        //.replace("{id}", notificationID)
        //.replace("{message}", message);
        $('body').find('div.notification').remove();
        $("body").append(Notificacion);
        //Remover las notificaciones
        setTimeout(function () {
            $("#" + notificationID + "").remove();
        }, 11000);
    }

    //Random Number
    RandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
}

// Instancia de clase
const loginAccessCs = new LoginAccess();

// Función para manejar el envío del formulario
function ValidacionFormularios(event) {
    // Validar el formulario
    if (this.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
    } else {
        event.preventDefault();
        event.stopPropagation();

        // Obtener valores del formulario y asignarlos a los atributos de la clase
        loginAccessCs.email = $('#email').val(); // Asignar a atributo
        loginAccessCs.password = $('#password').val(); // Asignar a atributo
        loginAccessCs.urlaction = $(event.currentTarget).attr("action"); // Asignar a atributo
        loginAccessCs.urldestino = $(event.currentTarget).attr("redirect"); // Asignar a atributo

        // Llamar al método validarUsuario
        loginAccessCs.validarUsuario();
    }

    // Añadir la clase 'was-validated' para activar los estilos de validación
    $(this).addClass('was-validated');
}


function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim();
        if (c.startsWith(name + "=")) {
            return c.substring(name.length + 1);
        }
    }
    return null;
}
// Cuando el documento se encuentra listo
$(document).ready(function () {
    // Validación de formularios
    //let email = sessionStorage.getItem("email");

    let email = getCookie("email");
    let empleado = getCookie("empleado");
    let u_perfil = getCookie("u_perfil");
    let existe = getCookie("existe");


    if ((email != null && email != "") && (empleado != null && empleado != "")
        && (u_perfil != null && u_perfil != "") && (existe != null && existe != "")) {
        let url = $("form").attr("redirect");
        console.log("Emial en session: ",email);
        window.location.href = url;

    }
   

    $(document).on('submit', '.needs-validation', ValidacionFormularios);
});
