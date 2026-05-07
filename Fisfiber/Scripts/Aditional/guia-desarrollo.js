// TODO-----------------DOCUMENTACION DE AYUDA-----------------------------


// !REALIZAR PETICIONES CON PROMESAS
$.ajax({
    url: '/AdminUsers/ObtenerUsuario',
    type: 'POST',
    dataType: 'JSON',
    data: {
        email: this.email,
        password: this.password
    }
})
    .done((response) => {
        // Procesar la respuesta
    })
    .fail((error) => {
        // Manejar errores
    });


// !REALIZAR PETICIONES CON ASYNC/AWAIT:
async validarUsuario() {
    try {
        const response = await $.ajax({
            url: '/AdminUsers/ObtenerUsuario',
            type: 'POST',
            dataType: 'JSON',
            data: {
                email: this.email,
                password: this.password
            }
        });
        // Procesar la respuesta
    } catch (error) {
        // Manejar errores
    }
}

LayoutCs.EnviarNotificacion("Monitor de logística", "El monitor ha sido creado exitosamente", "https://fisfiber.com.mx/wp-content/uploads/2023/04/Logo_header-180x54-2-3.png", "https://fisfiber.com.mx/", "Acceder", sessionStorage.getItem("email"));


//async getPermisos() {
//    try {
//        if ("serviceWorker" in navigator && "PushManager" in window) {
//            const registration = await navigator.serviceWorker.register("/Scripts/Layout/service-worker.js");
//            // Cuando te solicita permisos para las notificaciones
//            const subscription = await registration.pushManager.subscribe({
//                userVisibleOnly: true,
//                applicationServerKey: LayoutCs.urlBase64ToUint8Array(LayoutCs.VAPID_PUBLIC_KEY),
//            });

//            const credenciales = JSON.parse(JSON.stringify(subscription));
//            this.urlaction = $('body').attr("notificacionespush");
//            this.Dispositivo = this.TipoDispositivo();

//            // Enviar los datos de la suscripción al servidor
//            this.anydata = await $.ajax({
//                url: this.urlaction,
//                type: 'POST',
//                dataType: 'JSON',
//                data: {
//                    usuario: sessionStorage.getItem("email"),  // Considera obtener esto dinámicamente
//                    p256dh: credenciales.keys.p256dh,
//                    auth: credenciales.keys.auth,
//                    endpoint: credenciales.endpoint,
//                    disp: this.TipoDispositivo()
//                }
//            });

//                    let resultSuscrption = JSON.parse(this.anydata.data)[0];

//                    // Manejar la respuesta del servidor
//                    if (resultSuscrption.Result > 0) {
//                        LayoutCs.Alerta("Notificaciones FFisa", "Suscripci&oacute;n exitosa.");
//                    } else if (resultSuscrption.Result == -1) {
//                        if (resultSuscrption.msj == "Registro duplicado") { }
//                        else {
//                            LayoutCs.Alerta("Notificaciones FFisa", "Ya tienes una suscripci&oacute;n activa.");
//                        }
//                    } else if (resultSuscrption.Result == -2) {
//                        LayoutCs.Excepcion("Error en la suscripci&oacute;n. Int&eacute;ntalo m&aacute;s tarde.", "FFisa");
//                    }

//        } else {
//            LayoutCs.Excepcion("Service Worker or Push Notifications not supported in this browser.", "FFisa");
//        }
//    }
//    catch (error) {
//        LayoutCs.getPermisos();
//        //LayoutCs.Excepcion("No es posible guardar la configuración de notificaciones: " + (error.message != undefined ? error.message : error.responseText), "FFisa");
//    }
//}

// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION CARD)
//if (this.anydata.Status == "OK") {
//    //Limpiar el contenedor
//    $("#reportbyline").empty();
//    //Obtener los datos
//    this.previewdataPP = JSON.parse(this.anydata.Data);
//    //Datos de OV agrupados por linea
//    this.grouppreviewdataPP = LayoutCs.agruparPorLinea(this.previewdataPP);

//    // Recorrer el resultado agrupado y mostrar en la consola
//    $.each(this.grouppreviewdataPP, function (linea, items) {
//        ConsultaPlanProduccionCs.subtablelinedetails = "";
//        //Especificar la linea en el encabezado
//        ConsultaPlanProduccionCs.subtablelinedetails += ConsultaPlanProduccionCs.cardlinedetailsbody.replace("{folio}", "Folio " + ConsultaPlanProduccionCs.FolioPP);

//        //Recorrer la lista de ordenes agrupada por linea
//        ConsultaPlanProduccionCs.anydata = "";
//        $.each(items, function (index, item) {
//            ConsultaPlanProduccionCs.anydata += `<li><i class="fas fa-circle"></i> ${item.Folio}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.GenerarOF}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.OrdenFabricacion}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.EstatusSapOF}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.ComentariosExtras}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.Prioridad}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.Rollos}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.PiezasProducidas}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.Pedido}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.CodigoCliente}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.Solicitado}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.Linea}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.Articulo}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.DescripcionArticulo}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.Almacen}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.MetrosRollo}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.Especificacion}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.HoraInicio}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.HoraFinal}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.TiempoProduccion}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.CantidadMetros}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.Comentarios}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.FechaContabilizacion}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.FechaFabricacion}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.FechaEntrega}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.Cliente}</li>
//                                                 <li><i class="fas fa-circle"></i> ${item.CantidadKilos}</li>`;
//        });
//        //Agregar las OV agrupadas por linea
//        ConsultaPlanProduccionCs.subtablelinedetails = ConsultaPlanProduccionCs.subtablelinedetails.replace("{data}", ConsultaPlanProduccionCs.anydata);
//        ConsultaPlanProduccionCs.anydata = "";
//        $("#reportbyline").append(ConsultaPlanProduccionCs.subtablelinedetails.trim());
//    });

//    $("#folioseleccionado").text(this.FolioPP);
//}