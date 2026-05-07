class ParosProduccion {
    constructor() {
        this.action = "";
        this.table = "";
        this.rowselectedparo = "";
    }
    //Listado de paros de produccion
    ParosProduccion(Inicio, Fin) {
        try {
            // '/Produccion/GetParosProduccion'
            let table = $("#Tblparosproduccion").DataTable(
                {
                    processing: false,
                    serverSide: true,
                    bDestroy: true,
                    "ajax":
                    {
                        url: this.action,

                        type: "POST",
                        dataType: "json",
                        data: {
                            "Inicio": Inicio,
                            "Fin": Fin
                        },
                        "beforeSend": function () {
                            Loading(); // Mostrar el indicador de carga
                        },
                        "complete": function () {
                            StopLoading(); // Ocultar el indicador de carga
                        },
                        // Interceptar y guardar los datos antes de pasarlos al DataTable
                        "dataSrc": function (json) {
                            return json.data; // Devolver los datos al DataTable
                        }
                    },
                    columns:
                        [
                            {
                                "data": "ID" /* Folio de PP */
                            },
                            {
                                "data": "Linea" /* Folio de PP */
                            },
                            {
                                "data": "Fecha" /* Linea */
                            },
                            {
                                "data": "MotivoReparacion" /* Cantidad Kilos */
                            },
                            {
                                "data": "Solicitante" /* Articulo */
                            },
                            {
                                "data": "Estatus" /* Descripcion Articulo*/
                            },
                            {
                                "data": null,
                                "render": function (data, type, row) {
                                    // Aquí accedes al valor de DocEntry con row.DocEntry
                                    return `<i data-toggle="tooltip" data-placement="top" title="Gestionar Paro de línea ${row.Linea}" class="fs-5 fa-solid fa-circle-play icon-updateparo"></i>`;
                                }
                            }
                        ],
                    columnDefs: [
                        { visible: false, targets: [0] },
                        { width: '100px', targets: '_all' }
                    ],

                    ordering: false,
                    info: true,
                    "bPaginate": true,
                    "language": {
                        "lengthMenu": "Mostrar _MENU_ registros",
                        "zeroRecords": "No se encontraron resultados",
                        "info": "Registros del _START_ al _END_ de un total de _TOTAL_ registros",
                        "infoEmpty": "Registros del 0 al 0 de un total de 0 registros",
                        "infoFiltered": "(filtrado de un total de _MAX_ registros)",
                        "sSearch": "Buscar:",
                        "oPaginate": {
                            "sFirst": "Primero",
                            "sLast": "Último",
                            "sNext": "Siguiente",
                            "sPrevious": "Anterior"
                        },
                        "sProcessing": "Procesando...",
                        "emptyTable": "No hay datos disponibles en la tabla"
                    }
                });

            StopLoading();


            $(".buttons-excel").addClass("exceldownload");

            return table;
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible mostrar los paros de producción: " + error, "Plan de producción");
            StopLoading();
        }
    }

    getFechaHoraSQL() {
        const ahora = new Date();

        const year = ahora.getFullYear();
        const month = String(ahora.getMonth() + 1).padStart(2, '0'); // meses inician en 0
        const day = String(ahora.getDate()).padStart(2, '0');

        const hours = String(ahora.getHours()).padStart(2, '0');
        const minutes = String(ahora.getMinutes()).padStart(2, '0');
        const seconds = String(ahora.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    async ActualizarParo() {
        // Tomamos los valores del modal
        const data = {
            ID: ParosProduccionCs.rowselectedparo ? ParosProduccionCs.table.row(ParosProduccionCs.rowselectedparo).data().ID : 0,
            FechaFin: $("#FechaParo").val(),
            Usuario: $("#UsuarioRealizo").val(),
            Tipo: $("#TipoMantenimiento").val(),
            Rubro: $("#Rubro").val(),
            Orden: $("#OrdenTrabajo").val(),
            Obs: $("#Observaciones").val()
        };

        // Validación mínima
        if (data.ID === 0) {
            alert("No se pudo identificar el registro a actualizar.");
            return;
        }

        try {
            Loading();

            // Llamada AJAX
            const response = await $.ajax({
                url: ParosProduccionCs.action, // tu atributo que tenga el action del controller
                type: "POST",
                data: data,
                dataType: "json"
            });

            StopLoading();

            if (response.Status === "OK") {
                // 🔥 Eliminar fila de DataTable después de actualizar
                if (ParosProduccionCs.rowselectedparo) {
                    const table = ParosProduccionCs.table;
                    table.row(ParosProduccionCs.rowselectedparo).remove().draw(false);
                }

                // 🔧 Cerrar modal y limpiar form
                $("#ParoModal").trigger('reset');
                $("#ParoModal").removeClass('was-validated');
                $("#ParoModal").modal('hide');
                LayoutCs.Alerta("Plan de producción", "Paro actualizado correctamente.", "OK");
            } else {
                LayoutCs.Excepcion(response.Message, "Plan de producción");
            }
        } catch (error) {
            StopLoading();
            LayoutCs.Excepcion("No es posible actualizar los datos del paro, intente de nuevo más tarde: " + error, "Plan de producción");
        }
    }

    async GetOpRubro() {
        try {
            let urlRubro = $('#Tblparosproduccion').attr("GetOpRubro");

            const response = await $.ajax({
                url: urlRubro,
                type: 'POST',
                dataType: 'JSON',
            });
            if (response.Status == "OK") {
                let opciones = JSON.parse(response.Data);
                this.poblarSelectRubro(opciones);
            }
            else {
               // LayoutCs.Alerta("Opciones de Rubro", response.Message);
                console.warn("Opciones de Rubro: "+ response.Message);
            }

        } catch (error) {
           // LayoutCs.Excepcion(error, "Opciones de Rubro");
            console.warn(error + " Opciones de Rubro");
        }
    }

    poblarSelectRubro(rubros) {
        const $Rubro = $('#Rubro');
        let opciones = `<option value="">Seleccione...</option>`;
        $Rubro.empty();

        rubros.forEach(r => {
            opciones += `<option value="${r.Opcion}">${r.Opcion}</option>`;
        });

        $Rubro.append(opciones);
    }

    async GetOpTipoM() {
        try {
            //GetOpTipoMant
            let urlMant = $('#Tblparosproduccion').attr("GetOpTipoMant");

            const response = await $.ajax({
                url: urlMant,
                type: 'POST',
                dataType: 'JSON',
            });
            if (response.Status == "OK") {
                let opciones = JSON.parse(response.Data);
                this.poblarSelectTipoM(opciones);
            }
            else {
                // LayoutCs.Alerta("Opciones de Rubro", response.Message);
                console.warn("Opciones de TipoM: " + response.Message);
            }

        } catch (error) {
            // LayoutCs.Excepcion(error, "Opciones de Rubro");
            console.warn(error + " Opciones de TipoM");
        }
    }

    poblarSelectTipoM(mantenimientos) {
        const $TipoM = $('#TipoMantenimiento');
        let opciones = `<option value="">Seleccione...</option>`;
        $TipoM.empty();

        mantenimientos.forEach(r => {
            opciones += `<option value="${r.Opcion}">${r.Opcion}</option>`;
        });

        $TipoM.append(opciones);
    }

}



LayoutCs.validarUsuario("Mantenimiento");
//Instancia de clase
const ParosProduccionCs = new ParosProduccion();
// Función para manejar el envío del formulario
async function ValidacionFormParos(event) {
    if (this.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
    } else {
        event.preventDefault();
        event.stopPropagation();

        ParosProduccionCs.action = $("#Tblparosproduccion").attr("ActualizarParo");

        await ParosProduccionCs.ActualizarParo();
    }

    $(this).addClass('was-validated');
}

function initHubParos() {
    //Escuchando eventos con SinalR
    var hubParos = $.connection.parosHub;

    hubParos.client.updateParos = function (paro) {
        let dataParo = JSON.parse(paro);
        newParo(dataParo[0]);
    };

    $.connection.hub.start().done(function () {
        console.log("Conectado a hubs ....");
    });
    //END SinalR
}

function newParo(paro) {
    console.log(`Paro en:`);
    console.log(paro);

    if (paro && ParosProduccionCs.table) {
        ParosProduccionCs.table.ajax.reload(null, false); // false = mantener página actual

        //LayoutCs.Alerta("Nuevo paro recibido", `Paro en linea: ${paro.Linea}, ${paro.MotivoReparacion}`, "Warning");

        if (paro.Estatus == 'Terminado') {
            LayoutCs.Alerta("Paro cerrado", `El paro en linea: ${paro.Linea}, ha sido atendido: ${paro.Observaciones}`, "OK");
        }
        else {
            LayoutCs.Alerta("Nuevo paro", `Paro en linea: ${paro.Linea}, ${paro.MotivoReparacion}`, "Warning");
        }


        //pendingParos = [];
        //$('#updateButton').html('<i class="fa fa-refresh"></i> Actualizar');
    }

}



//EVENTOS
$(function () {
    initHubParos();
    ParosProduccionCs.GetOpRubro();
    ParosProduccionCs.GetOpTipoM();
    // Validación de formularios
    $(document).on('submit', '.needs-validationcustom', ValidacionFormParos);
    //Consultar los planes de producción(listado)
    ParosProduccionCs.action = $("#Tblparosproduccion").attr("ParosProduccion");
    ParosProduccionCs.table = ParosProduccionCs.ParosProduccion();
    // Paro de linea
    $(document).on("click", ".icon-updateparo", function (e) {
        e.stopPropagation();

        // Guarda la fila seleccionada
        const $fila = $(this).closest('tr');
        ParosProduccionCs.rowselectedparo = $fila;

        // Obtiene los datos de la fila desde DataTable
        const table = $("#Tblparosproduccion").DataTable();
        const rowData = table.row($fila).data();

        // 🔹 Llenar campos automáticos
        $("#Linea").val(rowData.Linea || '');
        $("#FechaParo").val(ParosProduccionCs.getFechaHoraSQL());

        // 🔹 Limpiar los campos manuales del formulario
        $("#UsuarioRealizo").val('');
        $("#TipoMantenimiento").val('');
        $("#Rubro").val('');
        $("#OrdenTrabajo").val('');
        $("#MotivoReparacion").val(rowData.MotivoReparacion || '');
        $("#Solicitante").val(rowData.Solicitante || '');
        $("#Observaciones").val('');

        // 🔹 Actualizar título del modal
        $('#modalParoTitulo').text('Gestionar Paro');

        // 🔹 Mostrar modal
        $('#ParoModal').modal('show');
    });
});
