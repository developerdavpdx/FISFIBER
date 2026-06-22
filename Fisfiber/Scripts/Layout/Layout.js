class Layout {
    // Atributos de modelo para el inicio de sesión
    constructor() {
        // +atrubuto para obtener la feha actual
        this.ahora = "";
        // +atrubuto para el formato de la fecha
        this.opciones = "";
        // + atributo para guardar el formato final de fecha
        this.fecha = "";
        // + atributo para guardar el formato final de hora
        this.hora = "";
        // + atributo para redirecciones
        this.urlaction = "";
        this.anydata;
        this.Dispositivo = "";
        this.historymodified = "Cambió: ";

        //ATRIBUTOS DE SESION
        // + atributo para saber el si usuario si existe en sap
        this.existe = "";
        // + atributo para email
        this.email = "";
        // + atributo para nombre de empleado
        this.empleado = "";
        // + atributo para perfil de usuario
        this.u_perfil = "";
        // * Atributo para notificaciones <i class="fa fa-times notification-close"></i>
        this.Notificacion = `<div id="{id}" class="notification">
	                                        <div class="notification-header">
		                                        <h3 class="notification-title">{title}</h3>
	                                        </div>
	                                        <div class="notification-container">
		                                        <div class="notification-media">
			                                        <img src="/Images/FFISA.png" alt="" class="notification-user-avatar">
			                                        <i class="fa fa-solid fa-triangle-exclamation notification-warning-icon notification-reaction"></i>
		                                        </div>
		                                        <div class="notification-content">
			                                        <p class="notification-text">
			                                        {message}
			                                        </p>
			                                        <span class="notification-timer">Hace un momento..</span>
		                                        </div>
		                                        <span class="notification-status"></span>
	                                        </div>
                                        </div>`;
        this.SeriesItem = `<div class="form-check series-check">
                                        <input type="checkbox" class="form-check-input anycheck seriesnumeracion" series="{id}">
                                        <label class="form-check-label">{seriesname}</label>
                                    </div>`;
        this.SeriesItemOF = `<div class="form-check series-check">
                                        <input type="checkbox" class="form-check-input anycheck seriesnumeracionOF" series="{id}">
                                        <label class="form-check-label">{seriesname}</label>
                                    </div>`;
        // + atributo que indica cual es el endpoint de redireccionamiento para obtener las series de numeracion
        this.seriesnumeracion = "";
        this.SeriesNumeracionData = "";

        // + Key publica para comunicacion con WEB PUSH
        this.VAPID_PUBLIC_KEY = "BNyftv47636byp0LRWTP7c1e7GAOWUmjvYAnn1KvPArLDgQ_pKakPxgkhxztqtVKdXz8jkPd18RvqGgaVxUqgy0";
        //API PUBLICADA EN VERCEL
        this.API = "https://pushnotifications-saso.vercel.app/api"
        this.idsNotifiPend = "";
        this.response = "";
        this.LineasValidasEdi = "";
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

    async updateHeaderISO(modulo, fl, fr, code, nivel, rev) {

        if (this.u_perfil != "Admin") {
            LayoutCs.Alerta("Header ISO",
                "No tienes permisos para realizar esta acción",
                "Warning");

            return;
        }

        // Global/UpdateHeaderISO
        try {
            let urlHeaderISO = $("body").attr("updateHeaderISO");
            Loading();

            //Prefijos de secciones
            //Plan de producción -> PlanPro_
            //Hoja de especificación -> HojaE_
            //Plan de órdenes de venta -> PlanOV_
            //Reporte de crédito y cobranza -> ReporteCC_
            //Plan de embarques – mascara->PlanEmb_
            //Monitor->Monitor_
            //Dashboard->Dashboard_

            let response = await $.ajax({
                url: urlHeaderISO,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    Modulo: modulo + '_',
                    FL: fl,
                    FR: fr,
                    Code: code,
                    Nivel: nivel,
                    Revision: rev
                }
            });

            if (response.Status == "OK") {
                LayoutCs.Alerta("Header ISO",
                    "Se actualizo correctamente el encabezado", "OK");

                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
            else {
                LayoutCs.Alerta("Header ISO",
                    "Error al actualizar header ISO...", "Warning");
            }

            StopLoading();

        } catch (error) {
            LayoutCs.Excepcion("No fue posible actualizar el header ISO: " + error, "Plan Embarques");
            StopLoading();
        }


    }

    //Método para obtener los datos de la sesión
    ObtenerSesion() {
        //this.existe = sessionStorage.getItem("existe");
        //this.email = sessionStorage.getItem("email");
        //this.empleado = sessionStorage.getItem("empleado");
        //this.u_perfil = sessionStorage.getItem("u_perfil");

        this.existe = this.getCookie("existe");
        this.email = this.getCookie("email");
        this.empleado = this.getCookie("empleado");
        this.u_perfil = this.getCookie("u_perfil");

        $(".email").text(this.email);
        $(".perfil").text(this.u_perfil);

        if (this.email == null || this.email == "") {

            this.deleteCookie("existe")
            this.deleteCookie("email")
            this.deleteCookie("empleado")
            this.deleteCookie("u_perfil")

            let urlLogin = $("body").attr("login");
            window.location.href = urlLogin;
        }

        sessionStorage.setItem("existe", this.existe);
        sessionStorage.setItem("email", this.email);
        sessionStorage.setItem("empleado", this.empleado);
        sessionStorage.setItem("u_perfil", this.u_perfil);


        //Ocultamos o mostramos los accesos de acuerdo al perfil (se inicializan como ocultos en el css para fines visuales)
        //PERFIL PLANEACION
        if (this.u_perfil === "Planeaci\u00F3n") {
            $("#MenuCompras").hide();
            $("#MenuProduccion").hide();
            $("#MenuLogistica").hide();
            $("#MenuVentas").hide();
            $("#MenuPlaneacion").show();
            $("#creacionPP,#consultaPP").show();
            /*$("#reportesPP").hide();*/
            $("#MenuCyC").hide();
            $("#MenuAlmacen").hide();

            LayoutCs.CreateConfigPP();
        }
        //PERFIL PRODUCCION
        if (this.u_perfil === "Producci\u00F3n") {
            $("#MenuCompras").hide();
            $("#MenuLogistica").hide();
            $("#MenuPlaneacion").hide();
            $("#MenuVentas").hide();
            $("#MenuCyC").hide();
            $("#MenuAlmacen").hide();

            $("#MenuProduccion").show();
        }

        //PERFIL MANTENIMIENTO
        if (this.u_perfil === "Mantenimiento") {
            $("#MenuCompras").hide();
            $("#MenuLogistica").hide();
            $("#MenuPlaneacion").hide();
            $("#MenuVentas").hide();
            $("#MenuCyC").hide();
            $("#MenuAlmacen").hide();
            $("#MenuProduccion").hide();
            $("#MenuMantenimiento").show();
        }
        //PERFIL LOGISTICA
        if (this.u_perfil === "Log\u00EDstica") {
            $("#MenuCompras").hide();
            $("#MenuProduccion").hide();
            $("#MenuLogistica").show();
            $("#MenuPlaneacion").hide();
            $("#MenuVentas").hide();
            $("#MenuCyC").hide();
            $("#MenuAlmacen").hide();

        }
        //PERFIL COMPRAS
        if (this.u_perfil === "Compras") {
            $("#MenuCompras").show();
            $("#MenuProduccion").hide();
            $("#MenuLogistica").hide();
            $("#MenuPlaneacion").hide();
            $("#MenuVentas").hide();
            $("#MenuCyC").hide();
            $("#MenuAlmacen").hide();

        }

        //PERFIL Ventas
        if (this.u_perfil === "Ventas") {
            $("#MenuCompras").hide();
            $("#MenuProduccion").hide();
            $("#MenuLogistica").hide();
            $("#MenuPlaneacion").hide();
            $("#MenuCyC").hide();
            $("#MenuVentas").show();
            $("#MenuAlmacen").hide();

        }

        //PERFIL CREDITO
        if (this.u_perfil === "Cr\u00E9dito") {
            $("#MenuCompras").hide();
            $("#MenuProduccion").hide();
            $("#MenuLogistica").hide();
            $("#MenuPlaneacion").hide();
            $("#MenuVentas").hide();
            $("#MenuAlmacen").hide();
            $("#MenuCyC").show();
        }

        //PERFIL ALMACEN
        if (this.u_perfil === "Almac\u00E9n") {
            $("#MenuCompras").hide();
            $("#MenuProduccion").hide();
            $("#MenuLogistica").hide();
            $("#MenuPlaneacion").hide();
            $("#MenuVentas").hide();
            $("#MenuCyC").hide();
            $("#MenuAlmacen").show();

        }


        // PERFIL ADMIN
        if (this.u_perfil === "Admin") {
            // Mostrar todos los menús y opciones
            $("#MenuCompras").show();
            $("#MenuProduccion").show();
            $("#MenuLogistica").show();
            $("#MenuPlaneacion").show();
            $("#MenuVentas").show();
            $("#MenuCyC").show();
            $("#MenuAlmacen").show();
            $("#MenuMantenimiento").show();
            $("#MenuInspeccion").show();


            $("#creacionPP,#consultaPP").show(); // Mostrar opciones específicas si es necesario
            LayoutCs.CreateConfigPP();

        }


    }

    validarUsuario(usuario) {
        const perfil = usuario;
        const urlDash = $("body").attr("dashboard");

        if (this.u_perfil === '') {
            this.ObtenerSesion();
        }

        if (this.u_perfil != perfil && this.u_perfil != "Admin") {
            window.location.href = urlDash;
        }
    }

    validarUsuarios(usuarios) {
        const perfiles = usuarios;
        const urlDash = $("body").attr("dashboard");

        if (this.u_perfil === '') {
            this.ObtenerSesion();
        }

        if (!perfiles.includes(this.u_perfil) && this.u_perfil != "Admin") {
            window.location.href = urlDash;
        }
    }


    setCookie(name, value, days) {
        let expires = "";
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    getCookie(name) {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let c = cookies[i].trim();
            if (c.startsWith(name + "=")) {
                return c.substring(name.length + 1);
            }
        }
        return null;
    }

    deleteCookie(name) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    //Método para actualizar la fecha
    actualizarFecha() {

        // Validación de formularios
        this.ahora = new Date();
        this.opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
        //Actualizar Fecha
        this.fecha = this.ahora.toLocaleDateString('es-ES', this.opciones);
        $("#fecha").text(this.fecha);
        //Actualizar Hora
        this.opciones = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        this.hora = this.ahora.toLocaleTimeString('en-US', this.opciones);
        $("#hora").text(this.hora);
    }
    //Método para actualizar la hora
    actualizarHora() {
        this.ahora = new Date();
        this.opciones = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        this.hora = this.ahora.toLocaleTimeString('en-US', this.opciones);
        $("#hora").text(this.hora);
    }
    //Excepcion
    Excepcion(error, location) {
        const errorMessage = error.responseJSON ? error.responseJSON.message : "Ocurri&oacute; un error al procesar la solicitud: " + error;
        this.Alerta(location, errorMessage); // Muestra un mensaje de error al usuario
        StopLoading();
    }
    //Random Number
    RandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    //Fecha Actual
    FechaActual() {
        var fecha = new Date();
        // Formatear la fecha en yyyy-MM-dd
        var anio = fecha.getFullYear();
        var mes = ('0' + (fecha.getMonth() + 1)).slice(-2); // Meses de 0 a 11, por eso +1
        var dia = ('0' + fecha.getDate()).slice(-2);

        var fechaFormateada = anio + '-' + mes + '-' + dia;

        return fechaFormateada;
    }
    //Ir al inicio de pagina
    GoTop() {
        $(".main-body").animate({ scrollTop: 0 }, "slow");
    }

    //Obtener la serie de numeracion para OC,OV
    //Metodo global compartido para diferentes documentos
    async SeriesNumeracionDocs(ObjectCode) {
        try {
            this.seriesnumeracion = $('body').attr("seriesnumeracion");

            const response = await $.ajax({
                url: this.seriesnumeracion,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    "ObjectCode": ObjectCode
                }
            });
            if (response.Status == "OK") {
                this.SeriesNumeracionData = JSON.parse(response.Data);
                $("#SerNumC").empty();
                $.each(this.SeriesNumeracionData, function (index, item) {
                    var Series = LayoutCs.SeriesItem.replace("{id}", item.Series)
                        .replace("{seriesname}", item.SeriesName)
                    $("#SerNumC").append(Series);
                });
            }

            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
        }
    }

    // Función para agrupar por 'Linea'
    agruparPorLinea(data) {
        //Se orden por el campor Orden, antes de agrupar
        return data.sort((a, b) => a.Orden - b.Orden).reduce((result, item) => {
            (result[item.Linea] = result[item.Linea] || []).push(item);
            return result;
        }, {});
    }

    // Función para agrupar por 'DocEntry'
    agruparPorDocEntry(data) {
        return data.reduce((result, item) => {
            (result[item.DocEntry] = result[item.DocEntry] || []).push(item);
            return result;
        }, {});
    }

    // Función para agrupar por 'TipoReparto'
    agruparPorTipoReparto(data) {
        return data.reduce((result, item) => {
            (result[item.TipoReparto] = result[item.TipoReparto] || []).push(item);
            return result;
        }, {});
    }

    //Hacer tabla editable
    async MakeTableEditable(table, needsedit) {
        //Advanced editor
        var advancedEditor = new SimpleTableCellEditor(table, { navigation: false });
        advancedEditor.SetEditableClass("editMe");

        //advancedEditor.SetEditableClass("editMe", {
        //    internals: {
        //        renderEditor: (elem, oldVal) => {
        //            // Crear un input sin espacios extra
        //            $(elem).html(`<input type="text" class="form-control" value="${oldVal.trim()}">`);
        //        },
        //        extractEditorValue: (elem) => {
        //            return $(elem).find('input').val().trim();
        //        }
        //    }
        //});

        advancedEditor.SetEditableClass("editMeNumber", {
            internals: {
                renderEditor: (elem, oldVal) => {

                    const value = oldVal ? oldVal.trim() : '';

                    $(elem).html(`
                <input type="number"
                       class="form-control"
                       value="${value}"
                       step="1"
                       inputmode="numeric"
                       pattern="[0-9]*">
            `);

                    const $input = $(elem).find('input');

                    // Bloquea caracteres no numéricos
                    $input.on('keydown', function (e) {
                        const allowedKeys = [
                            'Backspace', 'Delete', 'Tab',
                            'ArrowLeft', 'ArrowRight',
                            'Home', 'End'
                        ];

                        if (
                            allowedKeys.includes(e.key) ||
                            (e.key >= '0' && e.key <= '9')
                        ) {
                            return;
                        }

                        e.preventDefault();
                    });
                },

                extractEditorValue: (elem) => {
                    const val = $(elem).find('input').val();
                    return val ? val.trim() : '';
                }
            }
        });


        advancedEditor.SetEditableClass("CustomOptions", {
            internals: {
                renderEditor: (elem, oldVal) => {
                    $(elem).html(`<select class="form-select mt-2" aria-label="Prioridad">
                                  <option value="Alta">Alta</option>
                                  <option value="Media">Media</option>
                                  <option value="Baja">Baja</option>
                                </select>`);
                    $("select option").filter(function () {
                        return $(this).val() == oldVal;
                    }).prop('selected', true);

                },
                extractEditorValue: (elem) => { return $(elem).find('select').val(); },

            }
        });
        //Obtener datos de estatus de carga
        this.urlaction = $("body").attr("estatuscarga");
        this.anydata = {
            "tabla": "OINV",
            "campodefinido": "EstCarga"
        }
        this.response = await this.MakeAjaxRequest(this.urlaction, this.anydata);
        this.anydata = JSON.parse(this.response.Data);
        this.response = "";
        $.each(this.anydata, function (index, item) {
            LayoutCs.response += `<option value="${item.ID}">${item.Descripcion}</option>`
        });

        advancedEditor.SetEditableClass("EstatusCargaData", {
            internals: {
                renderEditor: (elem, oldVal) => {
                    $(elem).html(`<select class="form-select mt-2" aria-label="Prioridad">
                                  ${LayoutCs.response}
                                </select>`);
                    $("select option").filter(function () {
                        return $(this).val() == oldVal;
                    }).prop('selected', true);

                },
                extractEditorValue: (elem) => {
                    return $(elem).find('select').val();
                },
            }
        });

        //Obtener datos de estatus de produccion
        this.urlaction = $("body").attr("estatusproduccion");
        this.response = await this.MakeAjaxRequest(this.urlaction, this.anydata);
        this.anydata = JSON.parse(this.response.Data);
        this.response = "";
        $.each(this.anydata, function (index, item) {
            LayoutCs.response += `<option value="${item.estatus}">${item.estatus}</option>`
        });

        advancedEditor.SetEditableClass("EstatusProduccionData", {
            internals: {
                renderEditor: (elem, oldVal) => {
                    $(elem).html(`<select class="form-select mt-2" aria-label="Prioridad">
                                  ${LayoutCs.response}
                                </select>`);
                    $("select option").filter(function () {
                        return $(this).val() == oldVal;
                    }).prop('selected', true);

                },
                extractEditorValue: (elem) => { return $(elem).find('select').val(); },
            }
        });


        advancedEditor.SetEditableClass("TipoReparto", {
            internals: {
                renderEditor: (elem, oldVal) => {
                    $(elem).html(`<select class="form-select mt-2" aria-label="Prioridad">
                                  <option value="Pedidos de reparto">Pedidos de reparto</option>
                                  <option value="Pedidos consolidados">Pedidos consolidados</option>
                                </select>`);
                    $("select option").filter(function () {
                        return $(this).val() == oldVal;
                    }).prop('selected', true);

                },
                extractEditorValue: (elem) => { return $(elem).find('select').val(); },

            }
        });
        // Configuración personalizada para el campo de hora con AM/PM
        //advancedEditor.SetEditableClass("TimeField", {
        //    internals: {
        //        renderEditor: (elem, oldVal) => {
        //            // Usamos un input de tipo "time" para permitir seleccionar la hora
        //            $(elem).html(`<input type="time" class="form-control mt-2" value="${oldVal}" step="1">`);
        //        },
        //        extractEditorValue: (elem) => {
        //            // Obtener la hora seleccionada en formato de 24 horas
        //            const timeValue = $(elem).find('input').val();

        //            if (timeValue) {
        //                // Convertir la hora de 24 horas a 12 horas con AM/PM
        //                let [hours, minutes, seconds] = timeValue.split(':');
        //                hours = parseInt(hours);
        //                const period = hours >= 12 ? 'p.m.' : 'a.m.';
        //                hours = hours % 12 || 12; // Convertir 0 y 12 a 12 en formato 12 horas

        //                return `${hours}:${minutes}`;
        //            }
        //            return '';
        //        },
        //    }
        //});

        advancedEditor.SetEditableClass("TimeField", {
            internals: {
                renderEditor: (elem, oldVal) => {
                    // Si oldVal viene en formato 12h, convertir a 24h
                    let value24h = oldVal;
                    if (oldVal && oldVal.includes('m.')) {
                        // Convertir de 12h a 24h
                        const match = oldVal.match(/(\d+):(\d+)\s*(a\.m\.|p\.m\.)/i);
                        if (match) {
                            let hours = parseInt(match[1]);
                            const minutes = match[2];
                            const period = match[3].toLowerCase();

                            if (period === 'p.m.' && hours !== 12) hours += 12;
                            if (period === 'a.m.' && hours === 12) hours = 0;

                            value24h = `${hours.toString().padStart(2, '0')}:${minutes}`;
                        }
                    }

                    $(elem).html(`<input type="time" class="form-control mt-2" value="${value24h}" step="1">`);
                },
                extractEditorValue: (elem) => {
                    // Retornar en formato 24 horas (HH:mm)
                    const timeValue = $(elem).find('input').val();
                    if (timeValue) {
                        // Remover segundos si existen
                        const [hours, minutes] = timeValue.split(':');
                        return `${hours}:${minutes}`;
                    }
                    return '';
                },
            }
        });
        // Configuración personalizada para el campo de fecha
        advancedEditor.SetEditableClass("DateField", {
            internals: {
                renderEditor: (elem, oldVal) => {
                    // Cambiamos el contenido de la celda por un input de tipo date
                    $(elem).html(`<input type="date" class="form-control mt-2" value="${oldVal || ''}">`);
                },
                extractEditorValue: (elem) => {
                    const dateValue = $(elem).find('input').val();
                    if (dateValue) {
                        // Convertir la fecha a formato dd/mm/yyyy
                        const [year, month, day] = dateValue.split('-');
                        return `${day}/${month}/${year}`;
                    }
                    return '';
                },
            }
        });


        advancedEditor.SetEditableClass("EstatusReparto", {
            internals: {
                renderEditor: (elem, oldVal) => {
                    $(elem).html(`<select class="form-select mt-2" aria-label="EstatusReparto">
                                  <option value="Reprogramado">Reprogramado</option>
                                  <option value="Proceso de carga">Proceso de carga</option>
                                  <option value="Transito">Transito</option>
                                  <option value="En sitio">En sitio</option>
                                  <option value="Proceso de descarga">Proceso de descarga</option>
                                </select>`);
                    $("select option").filter(function () {
                        return $(this).val() == oldVal.trim();
                    }).prop('selected', true);

                },
                extractEditorValue: (elem) => { return $(elem).find('select').val(); },

            }
        });


        advancedEditor.SetEditableClass("EditLinea", {
            internals: {
                renderEditor: (elem, oldVal) => {
                    $(elem).html(`

                    <select class="form-select mt-2" aria-label="EstatusReparto">
                      ${LayoutCs.LineasValidasEdi}
                    </select>
                    `);
                    $("select option").filter(function () {
                        return $(this).val() == oldVal;
                    }).prop('selected', true);

                },
                extractEditorValue: (elem) => { return $(elem).find('select').val(); },
            }
        });



        // Detectar edición de celdas y obtener el nombre de la celda
        if (needsedit) {
            $("#" + table).on('change', '.editMe, .TimeField, .DateField, .TipoReparto, .EstatusCargaData, .EstatusReparto , .EditLinea , .editMeNumber', function () {
                var cell = $(this).closest('td'); // Obtener la celda más cercana
                var cellName = cell.data('id'); // Asumiendo que existe un atributo 'data-id'

                if (cellName && !LayoutCs.historymodified.includes(cellName)) {
                    LayoutCs.historymodified += cellName + "\n";
                }
            });
        }
    }

    // Función para inicializar sortable(filas)
    enableRowSorting(table, childicon, classdragging) {
        $(`#${table} tbody`).sortable({
            cursor: 'row-resize',
            placeholder: 'ui-state-highlight',
            opacity: 1,
            items: '.ui-sortable-handle',
            start: function (event, ui) {

                // Añadir las clases correspondientes a las celdas
                Array.from(ui.item[0].cells).forEach((cell, index) => {
                    if (index === 0) {
                        // Para la primera celda, añadir tanto 'draggingv2' como 'draggingv2FC'
                        $(cell).addClass("draggingv2 draggingv2FC");
                    }
                    if (index === 10 || index === 17) {
                        // Para la primera celda, añadir tanto 'draggingv2' como 'draggingv2FC'
                        $(cell).addClass("draggingv2 draggingv2Column10");
                    }
                    else {
                        // Para el resto de las celdas, añadir solo 'draggingv2'
                        $(cell).addClass("draggingv2");
                    }
                });

                //chilicon es para indicar donde debe aparecer el icono al arrastrar
                // Añadir el ícono de flecha derecha a la primera celda de la fila seleccionada
                ui.item.find(`td:nth-child(${childicon})`).append('<i class="fas fa-arrow-right iconOVselected"></i>');
            },
            stop: function (event, ui) {
                Array.from(ui.item[0].cells).forEach(cell => {
                    $(cell).removeClass("draggingv2");
                });
                // Remover el ícono de la primera celda cuando se detenga el arrastre
                ui.item.find(`td:nth-child(${childicon}) .iconOVselected`).remove();

                //Guardar orden de filas del detalle del plan de produccion
                if (table.includes('PPDetails')) {

                    let folio = $(`#${table} tbody tr:eq(0) td.Folio`).text();
                    folio = folio.trim();

                    let orderRows = LayoutCs.getOrderRows(table);
                    var existeAlfanumerico = orderRows.some(function (item) {
                        // Validar que contenga al menos una letra
                        return /[a-zA-Z]/.test(item.idppd);
                    });
                    if (existeAlfanumerico) {
                        LayoutCs.Alerta("Plan de producci\u00F3n", "Antes de cambiar el orden, debes actualizar el plan para guardar las lineas en blanco agregadas manualmente.", "Warning");
                    }
                    else {
                        LayoutCs.UpdateOrderRows(orderRows, folio, table);
                    }
                }

                //Guardar orden de las filas del plan de ventas
                if (table.includes('PVDetails')) {

                    let folio = $(`#${table} tbody tr:eq(0)`).attr("Folio");
                    folio = folio.trim();

                    let orderRows = LayoutCs.getOrderRowsVentas(table);
                    var existeAlfanumerico = orderRows.some(function (item) {
                        // Validar que contenga al menos una letra
                        return /[a-zA-Z]/.test(item.idppd);
                    });
                    if (existeAlfanumerico) {
                        LayoutCs.Alerta("Plan de producci\u00F3n", "Antes de cambiar el orden, debes actualizar el plan para guardar las lineas en blanco agregadas manualmente.", "Warning");
                    }
                    else {
                        LayoutCs.UpdateOrderRowsVentas(orderRows, folio, table);
                    }
                }
            },
            update: function (event, ui) {
                // Aquí puedes obtener el nuevo orden de las filas
                let newOrder = $("#testtable tbody tr").map(function () {
                    return $(this).find('input.anycheck').attr('id');
                }).get();

            }
        }).disableSelection();
    }

    // Función para inicializar sortable (columnas)
    enableColumnOrdering(table) {
        //// Hacer que las cabeceras de las columnas sean arrastrables
        $(`#${table}`).find('thead tr').sortable({
            items: 'th', // Definir que los elementos a rrastrables sean las celdas 'th'
            axis: 'x',   // Limitar el arrastre al eje horizontal
            start: function (event, ui) {
                // Guardar el índice inicial de la columna arrastrada
                ui.item.data('startIndex', ui.item.index());
            },
            stop: function (event, ui) {
                var startIndex = ui.item.data('startIndex'); // Índice inicial de la columna
                var newIndex = ui.item.index(); // Nuevo índice de la columna

                // Reordenar las celdas de las filas del cuerpo
                $(`#${table}`).find('tbody tr').each(function () {
                    var row = $(this);
                    // Mover la celda de la posición inicial a la nueva posición
                    var cell = row.find('td').eq(startIndex).detach();
                    if (newIndex === 0) {
                        row.prepend(cell); // Insertar al principio
                    } else {
                        row.find('td').eq(newIndex - 1).after(cell); // Insertar después de la nueva posición
                    }
                });

                //Se consulta el orden para su guardado
                if (table == 'OVPrioridadTable') {
                    let ordenColumnas = LayoutCs.obtenerOrdenColumnas();
                    //console.log(ordenColumnas);
                    LayoutCs.UpdateConfigOCAPC(ordenColumnas);
                }

                //Se consulta el orden de filas 
                //Para el Orden en Consulta y Edicion
                //if (table.includes('PPDetails')) {
                //    let orderRows = LayoutCs.getOrderRows(table);
                //    LayoutCs.UpdateOrderRows(orderRows);

                //}
            }
        });
    }

    obtenerOrdenColumnas() {
        const columnas = [];
        let orden = 1; // El orden inicia en 1

        $('#OVPrioridadTable thead th').each(function () {
            // Verifica si la columna tiene la clase alwayshidden
            if (!$(this).hasClass('alwayshidden')) {
                const nombreColumna = $(this).text().trim(); // Obtiene el texto de la columna
                columnas.push({
                    Nombre: nombreColumna,
                    Orden: orden // Asigna el orden actual
                });
                orden++; // Incrementa el orden solo para columnas visibles
            }
        });

        return columnas;
    }

    //Funcion para obtener el orden de las filas de una tabla
    getOrderRows(table) {
        const filasConIdppd = [];

        $(`#${table} tbody tr`).each(function (index) {
            const idppd = $(this).find("td:first-child").attr("data-idppd"); // Cambia 'data-idppd' según sea necesario
            filasConIdppd.push({
                orden: index + 1, // Índice de la fila
                idppd: idppd || null, // Valor del atributo idppd (maneja si no existe)
            });
        });


        return filasConIdppd;
    }

    getOrderRowsVentas(table) {
        const filasConIdppd = [];

        $(`#${table} tbody tr`).each(function (index) {
            const idppd = $(this).attr("idppd");// Cambia 'data-idppd' según sea necesario
            filasConIdppd.push({
                orden: index + 1, // Índice de la fila
                idppd: idppd || null, // Valor del atributo idppd (maneja si no existe)
            });
        });


        return filasConIdppd;
    }

    async UpdateOrderRows(newOrderRows, folio, Tabla) {
        try {
            let urlUpdateOrderRows = $('body').attr("UpdateOrderRows");

            const response = await $.ajax({
                url: urlUpdateOrderRows,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    orderRows: JSON.stringify(newOrderRows),
                    Folio: folio
                }
            });
            if (response.Status == "OK") {
                let data = JSON.parse(response.Data);

                ConsultaPlanProduccionCs.IdPPDOverflow = [];

                data.forEach((d) => {
                    $(`#${Tabla} #rowppd${d.id}`).attr("sumcap", d.SumCap);
                    $(`#${Tabla} #rowppd${d.id} td.HoraPropuesta`).text(d.HoraPropuesta);


                    if (
                        d.SumCap >= ConsultaPlanProduccionCs.CapacidadLinea
                    ) {
                        ConsultaPlanProduccionCs.IdPPDOverflow.push(d.id);
                    }

                });

                $(`#${Tabla} tbody tr td`).removeClass("bg-alert");

                if (ConsultaPlanProduccionCs.IdPPDOverflow.length > 0 && ConsultaPlanProduccionCs.showCapL == 1) {
                    ConsultaPlanProduccionCs.IdPPDOverflow.forEach((c) => {
                        $(`#rowppd${c} td`).addClass("bg-alert");
                    });
                }



            }
            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
        }
    }

    async UpdateOrderRowsVentas(newOrderRows, folio, Tabla) {
        try {
            let urlUpdateOrderRows = $('body').attr("UpdateOrderRowsVentas");

            const response = await $.ajax({
                url: urlUpdateOrderRows,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    orderRows: JSON.stringify(newOrderRows),
                    Folio: folio
                }
            });
            if (response.Status == "OK") {

                LayoutCs.Alerta(
                    "Plan de ventas ",
                    "Se actualizo correctamente el orden del plan ",
                    "OK"
                );
            }
            else {
                LayoutCs.Alerta("Plan de ventas", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de ventas");
        }
    }


    async UpdateConfigOCAPC(configOCAPC) {
        try {
            let urlUpdateConfigOCAPC = $('body').attr("updateconfigOCAPC");

            const response = await $.ajax({
                url: urlUpdateConfigOCAPC,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    email: sessionStorage.getItem("email"),
                    configSN: JSON.stringify(configOCAPC)
                }
            });
            if (response.Status == "OK") {
                console.log(response);
            }
            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
        }
    }


    //NOTIFICACIONES WEB PUSH
    //Validar si ya tiene permisos para notificaciones

    async getPermisos() {
        try {
            // Verifica si el navegador soporta Service Workers y Push Notifications
            if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
                LayoutCs.Excepcion("Service Worker o Push Notifications no son compatibles con este navegador.", "FFisa");
                return;
            }

            // Registrar el Service Worker
            const registration = await navigator.serviceWorker.register("/Scripts/Layout/service-worker.js");
            console.log("Service Worker registrado:", registration);

            // Verificar si el usuario ya está suscrito
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                console.log("Usuario ya suscrito:", existingSubscription);
                return;
            }

            // Solicitar permisos de notificación
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                LayoutCs.Excepcion("Permiso de notificaciones denegado.", "FFisa");
                return;
            }

            // Suscribir al usuario al PushManager
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: LayoutCs.urlBase64ToUint8Array(LayoutCs.VAPID_PUBLIC_KEY),
            });

            const credenciales = JSON.parse(JSON.stringify(subscription));


            // Mostrar notificación de éxito local
            LayoutCs.Alerta("Notificaciones FFisa", "Gracias por aceptar las notificaciones.");

            this.urlaction = $("body").attr("notificacionespush");

            // Enviar los datos de la suscripción al servidor
            this.anydata = await $.ajax({
                url: this.urlaction, //Global->SuscribUser
                type: 'POST',
                dataType: 'JSON',
                data: {
                    usuario: sessionStorage.getItem("email"),  // Considera obtener esto dinámicamente
                    p256dh: credenciales.keys.p256dh,
                    auth: credenciales.keys.auth,
                    endpoint: credenciales.endpoint,
                    disp: this.TipoDispositivo()
                }
            });



            let resultSuscrption = JSON.parse(this.anydata.data)[0];

            // Manejar la respuesta del servidor
            if (resultSuscrption.Result > 0) {
                LayoutCs.Alerta("Notificaciones FFisa", "Suscripci&oacute;n exitosa.");
            } else if (resultSuscrption.Result == -1) {
                LayoutCs.Alerta("Notificaciones FFisa", "Ya tienes una suscripci&oacute;n activa.");
            } else if (resultSuscrption.Result == -2) {
                LayoutCs.Excepcion("Error en la suscripci&oacute;n. Int&eacute;ntalo m&aacute;s tarde.", "FFisa");
            }

        } catch (error) {
            // Manejo general de errores
            LayoutCs.Excepcion("Error en el proceso de notificaciones: " + (error.message || error.responseText), "FFisa");
            console.error("Error detallado:", error);
        }
    }
    //Decodificar permsiso
    urlBase64ToUint8Array(base64String) {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, "+")
            .replace(/_/g, "/");

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
    //Obtener tipo de dispositivo
    TipoDispositivo() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/mobile|android|iphone|ipad|tablet/i.test(userAgent)) {
            return 'mobile';
        } else {
            return 'desktop';
        }
    }
    //Enviar Notificacion
    async EnviarNotificacion(titulo, mensaje, urlimage, urlAction, titleAction, To) {
        try {
            this.urlaction = $('body').attr("enviarnotificacion");

            const response = await $.ajax({
                url: this.urlaction,
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    titulo: titulo,
                    mensaje: mensaje,
                    urlimage: urlimage,
                    urlAction: urlAction,
                    titleAction: titleAction,
                    para: To
                })
            }).fail(function (jqXHR, textStatus, errorThrown) {
                LayoutCs.Excepcion("No fue posible enviar el mensaje: " + textStatus + " " + errorThrown, "Notificaciones FFISA");
            });
            if (response.message == "OK") {
                LayoutCs.Alerta("Notificaciones FFISA", "El mensaje fue enviado correctamente.");
            }

            else {
                LayoutCs.Alerta("Notificaciones FFISA", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Notificaciones FFISA");
        }
    }
    //Exportar Excel
    async ExportarExcelExcelJS(
        tabla, folio, revision, Modulo,
        wImg = 167, hImg = 57,
        cImg = 0, rImg = 0,
        extraInfo = []
    ) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Hoja1");

        // Obtiene la tabla HTML
        const table = document.getElementById(tabla);

        // Determina el número total de columnas de la primera fila
        const totalColumnas = table.rows[0].cells.length;
        let maxColumns = 26;

        if (totalColumnas < maxColumns) {
            maxColumns = totalColumnas;
        }

        // Calcula el rango dinámico para fusionar celdas
        //const rangoFusion = `A1:${String.fromCharCode(64 + totalColumnas)}3`;
        const rangoFusion = `A1:${String.fromCharCode(64 + maxColumns)}3`;

        // Agregar la imagen
        const logoId = workbook.addImage({
            base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABmCAYAAABxyazLAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAE9WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4wLWMwMDEgNzkuYzAyMDRiMmRlZiwgMjAyMy8wMi8wMi0xMjoxNDoyNCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI0LjQgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTA0LTIxVDEwOjI2OjUxLTA2OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wNC0yMVQxMDoyNzozNy0wNjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wNC0yMVQxMDoyNzozNy0wNjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODIwZmQ4YWEtOTA1Yi00MDI3LTk4OTctNTEyNDJhYzdmZDEzIiB4bXBNTTpEb2N1bWVu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",
            extension: "png",
        });

        const widthImg = wImg ? wImg : 167;
        const heightImg = hImg ? hImg : 57;
        const colImg = cImg ? cImg : 0;
        const rowImg = rImg ? rImg : 0;

        // Agrega la imagen a la hoja
        worksheet.addImage(logoId, {
            tl: { col: colImg, row: rowImg }, // Posición superior izquierda (columna A, fila 1)
            ext: { width: widthImg, height: heightImg }, // Tamaño de la imagen en píxeles
        });

        // Estilo del encabezado decorativo
        worksheet.mergeCells(rangoFusion);
        const headerCell = worksheet.getCell("A1");
        headerCell.value = Modulo;
        headerCell.alignment = { vertical: "middle", horizontal: "center" };
        headerCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
        headerCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "8D8B8B" }, // Color de fondo azul (#1e76bd)
        };

        // Deja una fila vacía debajo del encabezado para espaciado
        worksheet.addRow([]);
        worksheet.addRow([]);

        let currentRow = 4;

        // Guarda las longitudes de texto máximas de cada columna
        let maxColumnLengths = [];

        // Itera sobre las filas de la tabla
        Array.from(table.rows).forEach((row, rowIndex) => {
            const rowData = Array.from(row.cells).map((cell, cellIndex) => {
                const cellText = cell.innerText;

                // Calcula la longitud máxima de texto para cada columna
                maxColumnLengths[cellIndex] = Math.max(maxColumnLengths[cellIndex] || 0, cellText.length);

                return cellText;
            });

            const excelRow = worksheet.addRow(rowData);
            currentRow += 1;

            if (rowIndex === 0) {
                // Estilos para la primera fila (títulos)
                excelRow.eachCell(cell => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFDC362E' } // Color de fondo rojo (#dc362e)
                    };
                    cell.font = {
                        color: { argb: 'FFFFFFFF' }, // Color de letra blanco
                        bold: true
                    };
                });
            } else {
                // Estilos para filas de datos (alternando entre dos colores)
                const fillColor = (rowIndex % 2 === 0) ? 'FFF2F2F2' : 'FFFFFFFF'; // Gris claro (#f2f2f2) y blanco
                excelRow.eachCell(cell => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: fillColor }
                    };
                    cell.font = {
                        color: { argb: 'FF000000' } // Color de letra negro
                    };
                });
            }
        });

        worksheet.addRow([]);
        worksheet.addRow([]);

        currentRow += 3;

        if (Array.isArray(extraInfo) && extraInfo.length > 0) {
            extraInfo.forEach(item => {
                worksheet.getCell(`A${currentRow}`).value = item.label;
                worksheet.getCell(`B${currentRow}`).value = item.value;

                worksheet.getCell(`A${currentRow}`).font = {
                    color: { argb: 'FFFFFFFF' }, // Color de letra blanco
                    bold: true
                };

                worksheet.getCell(`A${currentRow}`).alignment = {
                    vertical: 'middle',
                    horizontal: 'left'
                };


                worksheet.getCell(`A${currentRow}`).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFDC362E' } // Color de fondo rojo (#dc362e)
                }

                worksheet.getCell(`B${currentRow}`).alignment = {
                    vertical: 'middle',
                    horizontal: 'left'
                };


                currentRow++;
            });

            currentRow++; // espacio entre info y tabla
        }



        // Ajusta el ancho de cada columna automáticamente según el texto más largo
        worksheet.columns.forEach((column, index) => {
            column.width = maxColumnLengths[index] + 6; // Añade un pequeño margen adicional
        });

        // Genera y descarga el archivo Excel
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;

        if (revision && revision != "") {
            anchor.download = `${folio}_${revision}.xlsx`;
        }
        else {
            anchor.download = `${folio}.xlsx`;
        }

        anchor.click();
        window.URL.revokeObjectURL(url);
    }

    async ExportarExcelExcelJSV2(
        tablaId,
        folio,
        revision,
        modulo,
        wImg = 167,
        hImg = 57,
        cImg = 0,
        rImg = 0,
        extraInfo = [] // 👈 NUEVO (opcional)
    ) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte');

        // ==========================================
        // CONFIGURACIÓN GENERAL
        // ==========================================
        worksheet.properties.defaultRowHeight = 20;
        worksheet.views = [{ state: 'frozen', ySplit: 0 }];

        let currentRow = 1;

        // ==========================================
        // LOGO (si existe)
        // ==========================================
        if (window.base64Logo) {
            const imageId = workbook.addImage({
                base64: window.base64Logo,
                extension: 'png'
            });

            worksheet.addImage(imageId, {
                tl: { col: cImg, row: rImg },
                ext: { width: wImg, height: hImg }
            });
        }

        // Reservar espacio visual para el logo
        currentRow = 4;

        // ==========================================
        // INFORMACIÓN EXTRA (OPCIONAL)
        // ==========================================
        if (Array.isArray(extraInfo) && extraInfo.length > 0) {
            extraInfo.forEach(item => {
                worksheet.getCell(`A${currentRow}`).value = item.label;
                worksheet.getCell(`B${currentRow}`).value = item.value;

                worksheet.getCell(`A${currentRow}`).font = {
                    bold: true
                };

                worksheet.getCell(`A${currentRow}`).alignment = {
                    vertical: 'middle',
                    horizontal: 'left'
                };

                worksheet.getCell(`B${currentRow}`).alignment = {
                    vertical: 'middle',
                    horizontal: 'left'
                };

                currentRow++;
            });

            currentRow++; // espacio entre info y tabla
        }

        // ==========================================
        // OBTENER TABLA HTML
        // ==========================================
        const $table = document.getElementById(tablaId);
        if (!$table) {
            console.error('Tabla no encontrada:', tablaId);
            return;
        }

        const headers = [];
        const rows = [];

        // Encabezados
        $table.querySelectorAll('thead th').forEach(th => {
            headers.push({
                name: th.innerText.trim(),
                filterButton: true
            });
        });

        // Filas
        $table.querySelectorAll('tbody tr').forEach(tr => {
            const rowData = [];
            tr.querySelectorAll('td').forEach(td => {
                rowData.push(td.innerText.trim());
            });
            rows.push(rowData);
        });

        // ==========================================
        // INSERTAR TABLA EN EXCEL
        // ==========================================
        worksheet.addTable({
            name: 'TablaDatos',
            ref: `A${currentRow}`,
            headerRow: true,
            totalsRow: false,
            style: {
                theme: 'TableStyleMedium9',
                showRowStripes: true
            },
            columns: headers,
            rows: rows
        });

        // ==========================================
        // AJUSTE AUTOMÁTICO DE COLUMNAS
        // ==========================================
        worksheet.columns.forEach(column => {
            let maxLength = 10;
            column.eachCell({ includeEmpty: true }, cell => {
                const value = cell.value ? cell.value.toString() : '';
                maxLength = Math.max(maxLength, value.length);
            });
            column.width = maxLength + 2;
        });

        // ==========================================
        // DESCARGA
        // ==========================================
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const fileName = `${modulo}_${folio}_Rev${revision}.xlsx`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    }


    //Obtener notificaciones pendientes
    async getNotifiPend() {
        try {

            let url = $("body").attr("consultarnotificacion");

            const response = await $.ajax({
                url: url,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    usuario: sessionStorage.getItem("email")  // Considera obtener esto dinámicamente
                }
            });

            let notifi = JSON.parse(response.data);

            let notificaciones = "";
            let count = 0;
            let space = "";
            if (notifi.length > 0) {
                notifi.forEach(n => {
                    if (count != 0)
                        space = "mt-2";
                    else
                        space = "";

                    let itemNotifi =
                        `<a href="${n.UrlAction}" target="_blank"><div class="toast fade show w-100 ${space}" role="alert" aria-live="assertive" aria-atomic="true">
                          <div class="toast-header">
                            <img src="/Images/FFISA.png" alt="Avatar" style="width: 8%;">
                            <strong class="me-auto ps-2">${n.Titulo}</strong>
                            <small>${n.FechaCreacion}</small>
                          </div>
                          <div class="toast-body">
                            ${n.Mensaje}
                          </div>
                        </div>
                        </a>`;
                    if (!LayoutCs.idsNotifiPend.includes(n.NotificacionID)) {
                        LayoutCs.idsNotifiPend += `${n.NotificacionID},`
                    }

                    notificaciones += itemNotifi;
                    count++;
                })

                $('#notifi').show();

            }
            else {
                notificaciones =
                    `<li class="notification-item">
                                   <a class="dropdown-item" target="_blank">
                                       <div class="border-bottom mb-2">
                                           <div class="toast-header">
                                               <span class="d-inline-block text-truncate me-auto" style="max-width: 150px;">
                                                   <strong class="me-auto">Sin notificaciones</strong>
                                               </span>
                                           </div>
                                       </div>
                                   </a>
                               </li>`;

                $('#notifi').hide();
            }
            $("#notification-box").empty();
            $("#notification-box").append(notificaciones);

        } catch (error) {
            LayoutCs.Excepcion(error, "Notificaciones pendientes");
        }
    }
    //Marcar como leidas las notificaciones
    async readNotifi() {
        try {
            if (this.idsNotifiPend != "") {
                let url = $("body").attr("leernotificacion");

                const response = await $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: 'JSON',
                    data: {
                        ids: this.idsNotifiPend,  // Considera obtener esto dinámicamente
                    }
                });

                let r = JSON.parse(response.data);


                if (r[0].Resultado === 1) {
                    $("#notification-box").empty();
                    let notificaciones =
                        `
                     <li class="notification-item">
                                   <a class="dropdown-item" target="_blank">
                                       <div class="border-bottom mb-2">
                                           <div class="toast-header">
                                               <span class="d-inline-block text-truncate me-auto" style="max-width: 150px;">
                                                   <strong class="me-auto">Sin notificaciones</strong>
                                               </span>
                                           </div>
                                       </div>
                                   </a>
                               </li>
                    `
                    $("#notification-box").append(notificaciones);
                    $('#notifi').hide();

                    LayoutCs.idsNotifiPend = "";
                }
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Notificaciones no leidas");
        }
    }
    //Dar espacio por letra mayuscula
    SpaceByUppercase(cadena) {
        return cadena.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace("_", ". ");
    }
    //Ejecutar solicitud AJAX
    async MakeAjaxRequest(url, data) {
        this.response = await $.ajax({
            url: url,
            type: 'POST',
            dataType: 'JSON',
            data: data
        });

        console.log(this.response);

        return this.response;
    }
    // Función para quitar acentos y espacios en blanco
    limpiarTexto(texto) {
        // Eliminar acentos reemplazándolos con sus equivalentes sin acento
        texto = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Eliminar todos los espacios en blanco
        texto = texto.replace(/\s+/g, "");

        return texto;
    }
    //Generar DocEntry al azar para temas de registros manuales
    RandomDocEntry() {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Letras permitidas
        const numbers = "0123456789"; // Números permitidos

        let id = "";

        // Generar 5 números aleatorios
        for (let i = 0; i < 5; i++) {
            id += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }

        // Generar 5 letras aleatorias
        for (let i = 0; i < 5; i++) {
            id += letters.charAt(Math.floor(Math.random() * letters.length));
        }

        // Mezclar el ID para que las letras y números no estén agrupados
        id = id.split("").sort(() => Math.random() - 0.5).join("");

        return id;
    }

    //Generar Configuracion de PP para usuarios de Planeacion
    async CreateConfigPP() {
        try {
            let configPP = $('body').attr("configPP");

            const response = await $.ajax({
                url: configPP,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    "email": sessionStorage.getItem("email")

                }
            });

            if (response.Status == "OK") {
                // console.log(response);
            }

            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
        }
    }

    convertirHorasMinutos(decimal) {
        let horas = Math.floor(decimal);
        let minutos = Math.round((decimal - horas) * 60);

        let resultado = [];
        if (horas > 0) {
            resultado.push(`${horas} Hora${horas !== 1 ? 's' : ''}`);
        }
        if (minutos > 0) {
            resultado.push(`${minutos} Minuto${minutos !== 1 ? 's' : ''}`);
        }

        return resultado.length > 0 ? resultado.join(" ") : "0 Minutos";
    }

    generarCadenaAleatoria(longitud) {
        var caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var resultado = '';
        for (var i = 0; i < longitud; i++) {
            var randomIndex = Math.floor(Math.random() * caracteres.length);
            resultado += caracteres.charAt(randomIndex);
        }
        return resultado;
    }


    parseHora(hora) {
        let horaFormat = '--';
        if (hora != '0' && hora != '--') {
            // Extraer horas y minutos de la hora destino
            const horas = Math.floor(hora / 100); // Extraer las horas
            let minutos = hora % 100; // Extraer los minutos
            if (minutos == 0)
                minutos = '00'

            if (minutos == NaN || horas == NaN) {
                horaFormat = '--'
            }
            else horaFormat = `${horas}:${minutos}`;
        }

        return horaFormat;
    }

    //Convierte ints de 5 o 6 digitos a hora
    convertirAHora(valor) {
        // Validar entrada
        if (valor === null || valor === undefined || isNaN(valor)) {
            return "---";
        }

        // Convertimos a string y rellenamos con ceros si falta
        let str = String(valor).padStart(6, "0");

        // Asegurarnos de que tenga exactamente 6 dígitos numéricos
        if (!/^\d{6}$/.test(str)) {
            return "Formato inválido";
        }

        // Extraemos partes
        let hh = parseInt(str.substring(0, 2), 10);
        let mm = parseInt(str.substring(2, 4), 10);
        let ss = parseInt(str.substring(4, 6), 10);

        // Validaciones de rango
        if (hh < 0 || hh > 23) return "Hora inválida";
        if (mm < 0 || mm > 59) return "Minuto inválido";
        if (ss < 0 || ss > 59) return "Segundo inválido";

        // Formateamos con dos dígitos
        let hora = String(hh).padStart(2, "0");
        let min = String(mm).padStart(2, "0");
        let seg = String(ss).padStart(2, "0");

        return `${hora}:${min}:${seg}`;


        // Ejemplos de uso
        //console.log(convertirAHora(92342));    // 👉 09:23:42
        //console.log(convertirAHora(190946));   // 👉 19:09:46
        //console.log(convertirAHora(null));     // 👉 "Valor inválido"
        //console.log(convertirAHora("abc123")); // 👉 "Formato inválido"
        //console.log(convertirAHora(246000));   // 👉 "Hora inválida"
    }

    ordenarViajes(viajes) {
        const getTipo = (val) => {
            val = val.toString().trim().toLowerCase();

            if (/^\d+$/.test(val)) return 0; // Números
            if (val === "foraneos") return 1;
            if (val === "mostrador") return 2;
            return 3; // Otros no contemplados
        };

        const filterByTipo = (list, t) => {
            return list.filter((ov) => getTipo(ov.NumeroViaje) == t);
        };

        let listN = filterByTipo(viajes, 0).sort((a, b) => a.NumeroViaje - b.NumeroViaje);
        let listF = filterByTipo(viajes, 1);
        let listM = filterByTipo(viajes, 2);
        let listO = filterByTipo(viajes, 3);

        //   console.log("Numeros", listN);
        //   console.log("Foraneos", listF);
        //   console.log("Mostrador", listM);
        //   console.log("Otros", listO);

        return [...listN, ...listF, ...listM, ...listO];
    }


    validarDatalist(inputSelector, datalistSelector) {
        let valor = $(inputSelector).val();
        let valido = false;

        // Recorremos las opciones del datalist
        $(datalistSelector + " option").each(function () {
            if ($(this).val() === valor) {
                valido = true;
                return false; // Rompe el each
            }
        });

        // Si no es válido, limpiar y enfocar
        if (!valido) {
            $(inputSelector).val("");
            this.Alerta("Valor no valido", "Por favor selecciona un valor válido de la lista.", "Warning");
            $(inputSelector).focus();
            return false;
        }
        return true;
    }

    getTipoUnidad(codeUnidad) {

        let listUnidades =
        {
            'C1': 'Camioneta 1',
            'C2': 'Camioneta 2',
            'CAM1': 'Camion 1',
            'CAM2': 'Camion 2',
            'Q1': 'Quinta 1',
            'Q2': 'Quinta 2',
            'EXTERNO': 'Unidad externa',
            '': 'Tipo Unidad Vacía'
        };

        let tipoUnidad = listUnidades[codeUnidad];

        if (tipoUnidad) {
            return tipoUnidad;
        }
        else {
            return codeUnidad;
        }
    }

    getCodeUnidad(tipoUnidad) {

        let listUnidades =
        {
            'Camioneta 1': 'C1',
            'Camioneta 2': 'C2',
            'Camion 1': 'CAM1',
            'Camion 2': 'CAM2',
            'Quinta 1': 'Q1',
            'Quinta 2': 'Q2',
            'Unidad externa': 'EXTERNO'
        };

        let codeUnidad = listUnidades[tipoUnidad];

        if (codeUnidad) {
            return codeUnidad;
        }
        else {
            return tipoUnidad;
        }
    }

    //Lenado dinamico de tabla apartir de data
    renderTableFromData({
        data,
        tableSelector,
        excludeColumns = [],
        editRules = {},
        customParsers = {},
        noAuth = [],
        widthCol = {},
        prefId = "rowppd"
    }) {
        if (!Array.isArray(data) || data.length === 0) return;

        const $table = $(tableSelector);
        const $thead = $table.find("thead tr");
        const $tbody = $table.find("tbody");

        let headerHTML = "";
        let bodyHTML = "";

        // Crear encabezados
        const firstRow = data[0];
        for (const key in firstRow) {
            if (!excludeColumns.includes(key)) {

                let iconEdit = "";
                if (editRules[key]) {
                    iconEdit = '<i class="bi bi-pencil-square"></i>';
                }

                let width = "200";
                let existe = key in widthCol;

                if (existe) {
                    width = widthCol[key];
                }

                let headerText = LayoutCs.SpaceByUppercase(key).toUpperCase();
                headerHTML += `<th id="${key}" width="${width}">${iconEdit} ${headerText}</th>`;
            }
        }

        // Crear filas del cuerpo
        data.forEach((item, i) => {

            let auth = noAuth.some(p => p.id == item.id);
            let red = '';

            if (auth) //Color para no autorizados
                red = 'background-color:#e7a1a1 !important;'

            bodyHTML += `<tr 
                            id="${prefId}${item.id}" idppd="${item.id}" 
                            document="${item.DocEntry}"
                            class="ui-sortable-handle pedidoEmb row${item.DocEntry}">`;

            for (const key in item) {
                if (!excludeColumns.includes(key)) {
                    let cellData = item[key];

                    // Aplicar transformación si hay parser para esta columna
                    if (customParsers[key]) {
                        cellData = customParsers[key](cellData);
                    }

                    // Determinar clase editable
                    let editClass = "";
                    if (editRules[key]) {
                        editClass = editRules[key];
                    }

                    bodyHTML += `<td style="${red}" class="${key} ${editClass}" data-name="${key}">${cellData}</td>`;
                }
            }

            bodyHTML += `</tr>`;
        });

        // Renderizar tabla
        $thead.empty().append(headerHTML);
        $tbody.empty().append(bodyHTML);
    }



}

function cleanText(text, dText) {
    if (text && dText) {
        return text.replace(dText, "").trim();
    }
    else return ""
}

function porcentaje(perTotal, cantidad) {
    // Validar que ambos parámetros existan y sean números
    if (perTotal == null || cantidad == null) {
        console.warn("⚠️ Uno de los parámetros es null o undefined.");
        return 0;
    }

    // Convertir a número (por si llegan como strings)
    const total = Number(perTotal);
    const valor = Number(cantidad);

    // Validar que sean números válidos
    if (isNaN(total) || isNaN(valor)) {
        console.warn("⚠️ Los valores proporcionados no son numéricos.");
        return 0;
    }

    // Evitar división entre cero
    if (total === 0) {
        console.warn("⚠️ El total no puede ser 0.");
        return 0;
    }

    // Calcular porcentaje
    const resultado = (valor * 100) / total;

    // Validar si es un número finito
    if (!isFinite(resultado)) {
        console.warn("⚠️ El resultado no es finito (puede ser infinito o NaN).");
        return 0;
    }

    // Limitar decimales (opcional, por ejemplo 2)
    return parseFloat(resultado.toFixed(2));
}

function formatearNumero(num) {
    if (isNaN(num)) return num; // Evita errores si no es número
    return Number(num).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function divValida(num1, num2) {

    // Convertir a número por seguridad
    num1 = Number(num1);
    num2 = Number(num2);

    // Validar que sean números reales
    if (!Number.isFinite(num1) || !Number.isFinite(num2)) {
        console.warn("Valores no numéricos en división:", num1, num2);
        return 0;
    }

    // Validar divisor cercano a 0 (evita Infinity)
    if (Math.abs(num2) < 1e-10) {
        console.warn("División con divisor 0 o muy cercano a 0. Retornando 0.");
        return 0;
    }

    const resultado = num1 / num2;

    // Validar resultado inválido
    if (!Number.isFinite(resultado)) {
        console.warn("Resultado inválido en división:", resultado);
        return 0;
    }

    return resultado;
}


// Instancia de clase
const LayoutCs = new Layout();

// Cuando el documento se encuentra listo
$(function () {

    //Escuchando eventos con SinalR
    //var hub = $.connection.productionHub; // Conectar con el Hub de SignalR

    //hub.client.updateProduction = function () {
    //    console.log("Actualización recibida. Recargando datos...");
    //   // Llama a una función para recargar la tabla
    //};

    //$.connection.hub.start().done(function () {
    //    console.log("Conectado a SignalR");
    //});
    //END SinalR







    //LayoutCs.getPermisos();
    LayoutCs.actualizarFecha();
    setInterval(LayoutCs.actualizarHora, 3000);

    //Obtener datos de la sesion
    LayoutCs.ObtenerSesion();

    //EVENTOS
    //Menu Lateral
    $(".toggle-btn").on("click", function () {
        $("#sidebar").toggleClass("expand");
    });

    //CerrarSesion
    $(document).on("click", "#CerrarSesion", function () {
        LayoutCs.urlaction = $("#CerrarSesion").attr("redirect");
        // Remove all saved data from sessionStorage
        sessionStorage.clear();

        //Limpiar cookies
        LayoutCs.deleteCookie("email");
        LayoutCs.deleteCookie("empleado");
        LayoutCs.deleteCookie("u_perfil");
        LayoutCs.deleteCookie("existe");

        //Redireccionar a Login
        window.location.href = LayoutCs.urlaction;

        //Para que todas las ventanas puedan detectar el cierre de session
        localStorage.setItem("logout", Date.now()); // Guarda el cierre de sesión
    });

    //---------------------------------------------------------------------------
    //Leer notificaciones de icono de campanita
    $(document).on("hidden.bs.dropdown", "#notification-box-read", function () {
        LayoutCs.readNotifi();
    });

    //ANIMACIONES PARA MODAL


    // Antes de que el modal se muestre
    $(document).on('show.bs.modal', '.modal', function (e) {
        var modalContent = $(this).find('.modal-content');
        modalContent.css('transform', 'translateY(100%)'); // Empezar desde abajo
    });

    // Cuando el modal se ha mostrado
    $(document).on('shown.bs.modal', '.modal', function (e) {
        var modalContent = $(this).find('.modal-content');
        modalContent.css('transform', 'translateY(0)'); // Deslizar hacia arriba
    });

    // Antes de que el modal se oculte
    $(document).on('hide.bs.modal', '.modal', function (e) {
        var modalContent = $(this).find('.modal-content');
        modalContent.css('transform', 'translateY(100%)'); // Deslizar hacia abajo
    });

    // Cuando el modal se ha ocultado completamente
    $(document).on('hidden.bs.modal', '.modal', function (e) {
        var modalContent = $(this).find('.modal-content');
        modalContent.css('transform', ''); // Restablecer transformación
    });

    // Escucha cambios en el localStorage
    window.addEventListener("storage", function (event) {
        if (event.key === "logout") {
            LayoutCs.urlaction = $("#CerrarSesion").attr("redirect");
            window.location.href = LayoutCs.urlaction;
        }
    });

});

