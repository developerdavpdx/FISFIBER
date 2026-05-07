class ReporteOFOV {
    constructor() {

        //Instancia de DataTable
        this.table = "";

        //Variables para filtros en tabla
        this.FI = "";
        this.FF = "";
        this.numOV = "";
        this.numOF = "";
        this.estOF = "";
        this.estOV = "";

        //Lista de configuracion de columnas
        this.configColumns = [];

        //Lista de datos de tabla OV
        this.OVList = [];
    }
  
    OVD() {


        //PINTAR ORDEN DE ENCABEZADOS
        $("#headOV").empty();
        let htmlHead = "";
        this.configColumns.forEach((c) => {

            let nameCol = "";

            //if (this.swichNameColumn.hasOwnProperty(c.ColumnName)) {
            //    nameCol = this.swichNameColumn[c.ColumnName]
            //} else {
            //    nameCol = c.ColumnName;
            //}
            nameCol = LayoutCs.SpaceByUppercase(c.ColumnName);
            nameCol = nameCol.toUpperCase();
            nameCol = nameCol.replace("_", " ");

            htmlHead +=
                `<th>${nameCol}</th>`;
        });
        $("#headOV").append(htmlHead);



        let columns = this.configColumns.map(col => {
            return {
                "data": col.ColumnName,
                "visible": col.Visible === "SI" // Controla visibilidad aquí
            };
        });


        // Agregar columna de estado al final
        columns.push({
            "data": null,
            "render": function () {
                return 'Pendiente';
            },
            "visible": false
        });

        let urlAct = $("#OV").attr("urldestino");


        let table = $("#OV").DataTable({
            processing: false,
            serverSide: true,
            bDestroy: true,
            autoWidth: false,
            ajax: {
                url: urlAct,
                type: "POST",
                dataType: "json",
                data: {
                    "FI": this.FI,
                    "FF": this.FF,
                    "OV": this.numOV,
                    "OF": this.numOF,
                    "EstatusOF": this.estOF,
                    "EstatusOV": this.estOV,
                },
                beforeSend: function () {
                    Loading();
                },
                complete: function () {
                    StopLoading();
                },
                dataSrc: function (json) {
                    Reporte.OVList = json.data;
                    return json.data;
                }
            },
            columns: columns,
            ordering: false,
            info: true,
            bPaginate: true,
            language: {
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
            },
            createdRow: function (row, data, dataIndex) {
                //console.log(row);
                //console.log(data);
                //console.log(dataIndex);


                $(row).addClass('OV');
            }
        });

     //   $(".buttons-excel").addClass("exceldownload");

        return table.columns.adjust().draw();
    }

    async ConfigxUsuarioROV(openmodal) {

        let urlAction = $("#OV").attr("configROV");

        try {
            //Datos de PP
            if (openmodal == 'true') Loading();

            this.anydata = await $.ajax({
                url: urlAction,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    usuario: sessionStorage.getItem("email")
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                this.response = JSON.parse(this.anydata.Data);
                //console.log(this.response);
                $("#configuracionPPContainer").empty();

                this.configColumns = this.response;

                $.each(Reporte.response, function (index, item) {
                    let checked = item.Visible == "SI" ? 'checked' : '';
                    $("#configuracionPPContainer").append(`<div class="mb-1 align-self-start form-check ChecksConfig">
                        <input type="checkbox" id="${item.ColumnName}" class="form-check-input anycheck configuracionbyPP" value="${item.ColumnName}" ${checked}>
                        <label class="form-check-label" for="${item.ColumnName}">${LayoutCs.SpaceByUppercase(item.ColumnName).replace("_"," ")}</label>
                    </div>`);
                });

                //Permitir reordenar los checkbox de configuracion
                $("#configuracionPPContainer").sortable({
                    containment: "parent", // Limita el movimiento al contenedor padre
                    tolerance: "pointer", // Asegura el desplazamiento con base en el puntero
                    forcePlaceholderSize: true, // Mantiene el espacio visible mientras arrastras
                    helper: function (event, ui) {
                        // Clona el elemento y añade la clase personalizada
                        const $clone = ui.clone();
                        $clone.addClass("draggingCPP");
                        $clone.css({
                            width: "80%", // Asegura el mismo ancho que el original
                            height: ui.height(), // Opcional, si también hay problemas con la altura
                        });
                        return $clone;
                    }
                });

                //Solo si se requiere que se abra el modal
                if (openmodal == "true")
                    $("#ConfiguracionPP").modal("show");
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.anydata.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible actualizar la configuración del plan de producción: " + error, "Plan de producción");
            StopLoading();

        }
    }

    async InsertaConfigxUsuarioROV() {
        try {
            //Datos de PP
            Loading();

            let urlConfig = $("#OV").attr("insertConfigROV");

            this.anydata = await $.ajax({
                url: urlConfig,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    usuario: sessionStorage.getItem("email"),
                    configuracion: JSON.stringify(this.configuracionPP)
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                $("#ConfiguracionPP").modal("hide");
                Reporte.ConfigxUsuarioROV().then(() => {
                    Reporte.table = Reporte.OVD();
                })
                LayoutCs.Alerta("Plan de producción", "La configuración del plan de producción fue actualizada correctamente.","OK");
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.anydata.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible actualizar la configuración del plan de producción: " + error, "Plan de producción");
            StopLoading();

        }
    }

}

LayoutCs.validarUsuario("Planeaci\u00F3n");

const Reporte = new ReporteOFOV();


function ValidacionFormularios(event) {
    // Validar el formulario
    if (this.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
    } else {
        event.preventDefault();
        event.stopPropagation();
        Reporte.FI = $("#FI").val();
        Reporte.FF = $("#FF").val();
        Reporte.numOV = $("#numOV").val();
        Reporte.numOF = $("#numOF").val();
        Reporte.estOV = $("#estOV").val();
        Reporte.estOF = $("#estOF").val();


        //Ejecutar la consulta
        Reporte.table = Reporte.OVD();

        $("#FI").val(Reporte.FI);
        $("#FF").val(Reporte.FF);
    }

    // Añadir la clase 'was-validated' para activar los estilos de validación
    $(this).addClass('was-validated');
}



$(function () {

    Reporte.ConfigxUsuarioROV().then(() => {
        Reporte.table =  Reporte.OVD();
    })

    $(document).on('click', '#searchData', ValidacionFormularios);

    //Configurar el listado del plan de produccion
    $("#edicionPP").on("click", function () {
        //Configuracion del plan de produccion por usuario
        Reporte.ConfigxUsuarioROV("true");
    });
    //Guardar configuración de el plan de produccion
    $("#GuardaConfigPP").on("click", function () {
        try {
            //Limpiar variables
            Reporte.configuracionPP = {};
            $('.configuracionbyPP').each(function (index) {
                // Obtén el id del checkbox y usa limpiarTexto para quitar acentos y espacios
                let id = LayoutCs.limpiarTexto(this.id);

                // Asigna el id como clave y el valor "SI" o "NO" como valor
                Reporte.configuracionPP[id] = { "Visible": this.checked ? "SI" : "NO", "Orden": (index + 1) };

            });

            Reporte.table.destroy();
            Reporte.table = "";
            Reporte.InsertaConfigxUsuarioROV();
        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No fue posible actualizar la configuración para el plan de producción, por favor intenta de nuevo mas tarde: " + error);
            StopLoading();

        }
    });

    $('#selectAll').on('change', function () {
        var isChecked = $(this).is(':checked');
        $('input[type="checkbox"].configuracionbyPP').prop('checked', isChecked);
    });
})