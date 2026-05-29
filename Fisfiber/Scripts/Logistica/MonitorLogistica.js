class MonitorLogistica {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.go = false;
        this.monitordata = {};
        this.monitordatagrouped = "";
        // * Atributo para urls
        this.action = "";
        // * Atributo para guardar la tabla de datos
        this.table;
        // * Atributo para guardar las columnas de la tabla
        this.columns = [];
        // * Atributo para fecha inicio
        this.fecha_entrega = "";
        // * Atributo para guardar los datos de la lista de las ordenes de venta
        this.OVList;
        this.FilterOVList;
        // * Atributo para obtener las ordenes de venta seleccionadas
        this.OVselected;
        this.FinalOVselected;
        // * Atributo para obtener el response de cualquier solicitud AJAX
        this.AnyData = "";
        this.hasestatus = "";
        this.hastiporeparto = "";
        // * Atributo para guardar los datos de una fila de la tabla
        this.rowdata = "";
        // * Atributo para guardar el ID de fila de la tabla
        this.row = "";
        // * atributo para obtener el DocEntry del Documento
        this.DocEntry = "";
        // * atributo para asignaciones generales 
        this.current_row = "";
        // + atributo que indica cual es el endpoint de redireccionamiento para obtener detalles de OV
        this.ovdetails = "";
        // * Atributo para armar la tabla de detalles de linea
        this.subtabledetails = "";
        this.response = "";
        this.subtablelinedetails = "";
        this.columnasrestantes = "";
        this.celdasrestantes = "";
        //*Atributos para la vista previa
        this.subtablelinedetailsheader = `<div class="row pb-2">
                                                <div class="col-md-12 d-flex justify-content-end">
                                                    <button type="button" class="btn btn-outline-secondary descargarmonitorvp" destino="{monitorvp}">Descargar Excel</button>
                                                </div>
                                                </div><div class="card">
                                                <div class="card-body ReportHeader">
                                                    <div class="row">
                                                        <div class="col-12 text-start">
                                                            <div class="text-center">
                                                                <span class="ps-2">
                                                                    {TipoReparto}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>`;
        this.subtablelinedetailsbody = `<div class="row m-0 pb-4">
                                <div class="col-md-12 p-0 body-table">
                                <table id="{monitorvp}" class="table table-preview table-striped m-0 tblmonitorlogistica" style="table-layout:fixed">
                                <thead>
                                    <th class='EstatusReparto' id='EstatusReparto'  width='250' >Estatus Reparto </th>
                                    {headers}
                                </thead>
                                <tbody>{rows}</tbody>
                                </table>
                                </div>
                                </div>`;
        // *Atributo para especificar que columnas tendran ancho de 350
        this.Column350 = ["Comentarios", "Cliente", "Direccion", "HorarioCita"];
        this.ExcludeColumns = ["IdPedido"];
        this.EditColumns = ["NumeroViaje", "Linea", "PiezasEntrega", "Cotejado","NumViaje" ];
        this.EditColumnsDate = ["FechaOriginalEntrega","FechaEntrega"];
        this.EditColumnsTime = ["HoraEntrega"];
        this.action = "";
        this.OrdenColumns = [];
    }
    //Obtener los pedidos para entregas
    PedidosEntregas() {
        try {
            // Logistica/GetPedidosParaEntregas
            let table = $("#PedidosEntregas").DataTable(
                {
                    processing: false,
                    serverSide: true,
                    bDestroy: true,
                    retrieve: true,
                    rowReorder: {
                        selector: 'tr'
                    },
                    "ajax":
                    {
                        url: this.action,

                        type: "POST",
                        dataType: "json",
                        data: {
                            "fecha_entrega": this.fecha_entrega,
                            "usuario": sessionStorage.getItem("email"),

                        },
                        "beforeSend": function () {
                            Loading(); // Mostrar el indicador de carga
                        },
                        "complete": function () {
                            StopLoading(); // Ocultar el indicador de carga
                        },
                        // Interceptar y guardar los datos antes de pasarlos al DataTable
                        "dataSrc": function (json) {

                            //MonitorLogisticaCs.OrdenColumns = JSON.parse(json.configCol);

                            MonitorLogisticaCs.OVList = null;
                            MonitorLogisticaCs.OVList = json.data; // Guardar los datos recibidos
                            return json.data; // Devolver los datos al DataTable
                        }
                    },
                    columns:
                        [{
                            "data": null,
                            //La funcion Render ayuda a realizar operaciones con la fila que se esta recorriendo
                            //Por ejemplo aqui que se esta obteniendo el DocEntry
                            "render": function (data, type, row) {

                                row.HoraInicio = parseHora(row.HoraInicio);
                                row.HoraFin = parseHora(row.HoraFin);
                                // Aquí accedes al valor de DocEntry con row.DocEntry
                                return `<div class="form-check">
                                        <input type="checkbox" class="form-check-input anycheck ovmonitor" id="${row.IdPedido}">
                                        </div>`;
                            }
                        },
                            {
                                "data": "Linea"
                            },
                            {
                                "data": "Distancia"
                            },

                            {
                                "data": "Cita"
                            },
                            {
                                "data": "HoraInicio"
                            },
                            {
                                "data": "HoraFin"
                            },
                        {
                            "data": "FechaPedido"
                        },
                        {
                            "data": "FechaSolicitudProduccion"
                        },
                        {
                            "data": "FechaOriginalEntrega"
                        },
                        {
                            "data": "FechaEntrega"
                        },
                        {
                            "data": "NumeroViaje"
                        },
                           
                        {
                            "data": "Pedido"
                        },
                        {
                            "data": "CodigoCliente"
                        },
                        {
                            "data": "Cliente"
                        },
                        {
                            "data": "Comentarios"
                        },
                        {
                            "data": "HoraEntrega"
                        },
                        {
                            "data": "Articulo"
                        },
                        {
                            "data": "CantidadMetros"
                        },
                        {
                            "data": "NumRollos"
                        },
                        {
                            "data": "PiezasEntrega"
                        },
                        {
                            "data": "Cotejado"
                        },
                        {
                            "data": "Direccion"
                        },
                        {
                            "data": "HorarioCita"
                        }
                        ],
                    columnDefs: [
                        { visible: true, width: '150px', targets: 0 }, // Primera columna
                        { visible: true, width: '250px', targets: '_all' } // Resto de columnas
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
                    },
                    "createdRow": function (row, data, dataIndex) {
                        // Agregamos la clase ui-sortable-handle a las filas tr
                        //para permitir arrastrar las filas
                        $(row).addClass('monitor');
                        // Agregar la clase position-relative a la primera celda <td>
                        $(row).find('td:first-child').addClass('position-relative');
                    },
                    //Una vez que todas las filas del datatable fueron dibujadas
                    drawCallback: function () {
                        // Reactivar el ordenamiento al redibujar
                        $("#step-1").addClass("active");
                    }
                });


            $(".buttons-excel").addClass("exceldownload");

            return table;

        } catch (error) {
            LayoutCs.Excepcion("No es posible mostrar los pedidos para entregas: " + (error.message != undefined ? error.message : error.responseText), "Pedidos para Entregas");
        }
    }
    //Seleccionar el rango inicial de consulta
    RangoInicio() {
        $('#RangoInicio').modal("show");
    }
    //Eventos
    showStep(step) {
        $('.step-content').removeClass('active');
        $('#step-' + step).addClass('active');
        this.renderBody(step);

    }
    //RENDERIZA EL CONTENIDO SEGUN EL PASO
    renderBody(step) {
        switch (step) {
            case 1:
                window.location.reload();
                break;
        }
    }
    // Ir al siguiente paso
    async nextStep() {
        if (this.currentStep < this.totalSteps) {

            //Validacion de seleccion de ORDENES DE VENTA
            switch (this.currentStep) {
                case 1:
                    //Ordenes de venta seleccionadas
                    await this.Step1();
                    break;
                case 2:
                    //Ordenes de venta seleccionadas
                    this.Step2();
                    break;
                case 3:
                    //Ordenes de venta seleccionadas
                    this.Step3();
                    break;
                //case 4:
                //    //Ordenes de venta seleccionadas
                //    this.Step4();
                //    break;
            }

            if (this.go) {
                this.currentStep++;
                //Obtener el paso actual
                let steps = $(".step");
                //Marcar el siguiente paso
                $.each(steps, function (i) {
                    if (!$(steps[i]).hasClass('current') && !$(steps[i]).hasClass('done')) {
                        $(steps[i]).addClass('current');
                        $(steps[i - 1]).removeClass('current').addClass('done');
                        return false;
                    }
                });
                this.showStep(this.currentStep);
                LayoutCs.GoTop();
            }

        }
    }
    // Ir al paso anterior
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }
    //Validaciones paso 1 Avanzar a asignación de estatus de carga
    async Step1() {
        this.OVselected = $('#PedidosEntregas tbody .ovmonitor:checked').map(function () {
            return this.id;
        }).get();

        if (this.OVselected.length == 0) {
            LayoutCs.Alerta("Monitor de logística", "Debes seleccionar al menos una Orden de Venta para continuar.");
            this.go = false;
        }
        else {
            Loading();
            //Lista de OV seleccionadas
            this.FilterOVList = this.filtrarOVXDocEntry(this.OVselected);
            //Reemplazar articulos de OV seleccionadas de acuerdo a selecciones anteriores

            console.log(this.FilterOVList);

            this.FilterOVList = this.FilterOVList.map((ov) => {
                return {
                    "Linea": ov.Linea, "Distancia": ov.Distancia, "Cita": ov.Cita,
                    "HoraInicio": ov.HoraInicio, "HoraFin": ov.HoraFin, ...ov
                }
            });

            this.FilterOVList = this.ordenarEmbarques(this.FilterOVList);

            MonitorLogisticaCs.AnyData = "";
            //Agregar las ordenes de venta seleccionadas
            $.each(this.FilterOVList, function (index, item) {

                // ui-sortable-handle : permite el arrastre de la fila
                //Generar filas dinamicamente
                MonitorLogisticaCs.AnyData +=
                    `<tr
                        class="ui-sortable-handle"
                        document="${(item.IdPedido == null ? '' : item.IdPedido)}"
                     >`;
                //Agregar estatus de carga antes del resto de filas
                MonitorLogisticaCs.AnyData += `
                    <td class="EstatusCarga EstatusCargaData"></td>
                    <td class="TipoReparto" width="200"></td>`;
                $.each(item, function (indexitem, itemdata) {

                    let hasedit = "";

                    if (!MonitorLogisticaCs.ExcludeColumns.includes(indexitem))
                    {
                        if (MonitorLogisticaCs.EditColumns.includes(indexitem)) {
                            hasedit = "notremove editMe"
                        }

                        else if (MonitorLogisticaCs.EditColumnsDate.includes(indexitem)) {
                            hasedit = "notremove DateField"
                        }

                        else if (MonitorLogisticaCs.EditColumnsTime.includes(indexitem)) {
                            hasedit = "notremove TimeField"
                        }
                        else {
                            hasedit = ""
                        }

                        MonitorLogisticaCs.AnyData += `<td class="${indexitem} ${hasedit}">${(itemdata == null ? '' : itemdata)}</td>`;
                    }
                });

                MonitorLogisticaCs.AnyData += `</tr>`;
            });

            $("#estatus_carga tbody").empty();
            $("#estatus_carga tbody").append(MonitorLogisticaCs.AnyData);
            //Hacer editable la tabla
            LayoutCs.MakeTableEditable("estatus_carga");
            //Permitir el ordenamiento de las filas de la tabla
            LayoutCs.enableRowSorting("estatus_carga", 2);
            //LayoutCs.enableColumnOrdering("estatus_carga");
            this.go = true;
        }
        StopLoading();
    }
    //Validaciones paso 2 Avanzar a la asignacion de tipo de reparto
    //Se elimino ya que se consideraba un paso de mas
    Stepx() {
        //Validar si asignaron el estatus correctamente
        this.hasestatus = $('#estatus_carga tbody tr').filter(function () {
            var celda = $(this).find('td.EstatusCarga').text().trim(); // Obtener el valor de la celda con clase "linea"
            return celda === ''; // Filtrar celdas vacías o no numéricas
        });

        this.hasestatus = this.hasestatus.length > 0 ? false : true;

        switch (this.hasestatus) {
            case true:
                Loading();
                // Clonar la tabla
                var tabla = $('#estatus_carga').clone();

                // Cambiamos el ID de la tabla clonada
                tabla.attr('id', 'tipo_reparto');

                // Eliminamos las clases innecesarias de las celdas
                tabla.find('td:not(.notremove), th:not(.notremove)').removeClass('editMe');
                tabla.find('td:not(.notremove), th:not(.notremove)').removeClass('EstatusCargaData');

                // Agregamos la clase ui-sortable-handle a las filas tr
                tabla.find('tr').addClass('ui-sortable-handle');

                // Limpiar los textos dentro de las celdas <td> eliminando espacios
                tabla.find('td').each(function () {
                    var textoLimpio = $(this).text().trim();  // Aplicar .trim() al texto de la celda
                    $(this).text(textoLimpio);  // Establecer el texto sin espacios
                });

                // Agregar nueva columna (encabezado y celdas) al PRINCIPIO
                // Paso 1: Agregar encabezado al inicio
                tabla.find('thead tr').prepend('<th width="250">Tipo Reparto</th>');

                // Paso 2: Agregar una celda al inicio de cada fila del cuerpo (tbody)
                tabla.find('tbody tr').each(function () {
                    $(this).prepend('<td class="TipoReparto" width="200"></td>'); // Agregar nueva celda con contenido predeterminado
                });

                //Agregar la clase de posicion relativa a las celdas
                tabla.find('td').addClass('position-relative');

                // Insertar la tabla en el contenedor
                $('#asignacion_tiporeparto').html(tabla);

                //Hacer editables los comentarios
                LayoutCs.MakeTableEditable("tipo_reparto");
                //Avanzar
                this.go = true;

                LayoutCs.enableRowSorting("tipo_reparto", 1);

                break;

            case false:
                LayoutCs.Alerta("Monitor de logística", "Se debe indicar el estatus de cada orden.");
                this.go = false;
                break;
        }

        StopLoading();
        // Agregar nuevo th al principio
        //let nuevoTh = $('<th width="200">Comentarios</th>');
        //tabla.find('tr').first().prepend(nuevoTh); // Insertar el nuevo th en la primera fila
        // Agregar nueva columna al resto de las filas
        //tabla.find('tbody tr').each(function () {
        //    // Crear una nueva celda vacía
        //    var nuevaCelda = $('<td class="editMe"></td>');
        //    $(this).prepend(nuevaCelda); // Insertar la nueva celda al principio de cada fila del tbody
        //});
    }
    //Validaciones paso 3 Avanzar a la vista previa de el monitor de logistica
    async Step2() {
        try {
            //Validar si asignaron el estatus correctamente
            this.hastiporeparto = $('#estatus_carga tbody tr').filter(function () {
                var celda = $(this).find('td.TipoReparto').text().trim(); // Obtener el valor de la celda con clase "TipoReparto"
                return celda === ''; // Filtrar celdas vacías o no numéricas
            });

            //Validar si asignaron el estatus correctamente
            this.hasestatus = $('#estatus_carga tbody tr').filter(function () {
                var celda = $(this).find('td.EstatusCarga').text().trim(); // Obtener el valor de la celda con clase "linea"
                return celda === ''; // Filtrar celdas vacías o no numéricas
            });


            this.hastiporeparto = this.hastiporeparto.length > 0 ? false : true;
            this.hasestatus = this.hasestatus.length > 0 ? false : true;

            switch (this.hastiporeparto && this.hasestatus) {
                case true:
                    Loading();
                    $('#vista_previa').empty();
                    // Clonar la tabla
                    //var tabla = $('#tipo_reparto').clone();
                    var tabla = $('#estatus_carga').clone();

                    // Cambiamos el ID de la tabla clonada
                    tabla.attr('id', 'vista_previa_layout');

                // Eliminamos las clases innecesarias de las celdas
                   //tabla.find('td:not(.notremove), th:not(.notremove)').removeClass('editMe');
                   //tabla.find('td:not(.notremove), th:not(.notremove)').removeClass('EstatusCargaData');
                   tabla.find('td:not(.notremove), th:not(.notremove)').removeClass('ui-sortable-handle');


                    // Datos del monitor para posteriormente ser agrupados
                    this.monitordata = tabla.find('tbody tr').map(function () {
                        return {
                            DocEntry: $(this).attr("document"),
                            TipoReparto: $(this).find('td.TipoReparto').text().trim(),
                            EstatusCarga: $(this).find('td.EstatusCarga').text().trim(),
                            Linea: $(this).find('td.Linea').text().trim(),
                            Distancia: $(this).find('td.Distancia').text().trim(),
                            Cita: $(this).find('td.Cita').text().trim(),
                            HoraInicio: $(this).find('td.HoraInicio').text().trim(),
                            HoraFin: $(this).find('td.HoraFin').text().trim(),
                            FechaPedido: $(this).find('td.FechaPedido').text().trim(),
                            FechaSolicitudProduccion: $(this).find('td.FechaSolicitudProduccion').text().trim(),
                            FechaOriginalEntrega: $(this).find('td.FechaOriginalEntrega').text().trim(),
                            FechaEntrega: $(this).find('td.FechaEntrega').text().trim(),
                            NumViaje: $(this).find('td.NumViaje').text().trim(),
                            Pedido: $(this).find('td.Pedido').text().trim(),
                            CodigoCliente: $(this).find('td.CodigoCliente').text().trim(),
                            Cliente: $(this).find('td.Cliente').text().trim(),
                            Comentarios: $(this).find('td.Comentarios').text().trim(),
                            HoraEntrega: $(this).find('td.HoraEntrega').text().trim(),
                            Articulo: $(this).find('td.Articulo').text().trim(),
                            CantidadMetros: $(this).find('td.CantidadMetros').text().trim(),
                            NumRollos: $(this).find('td.NumRollos').text().trim(),
                            PiezasEntrega: $(this).find('td.PiezasEntrega').text().trim(),
                            Cotejado: $(this).find('td.Cotejado').text().trim(),
                            Direccion: $(this).find('td.Direccion').text().trim(),
                            HorarioCita: $(this).find('td.HorarioCita').text().trim()
                        };
                    }).get();


                    //AGRUPAR POR TIPO DE REPARTO
                    this.monitordatagrouped = LayoutCs.agruparPorTipoReparto(this.monitordata);

                    // Recorrer el resultado agrupado
                    MonitorLogisticaCs.AnyData = "";
                    $.each(this.monitordatagrouped, function (TipoReparto, items) {
                        //Reiniciar tabla dinamica
                        MonitorLogisticaCs.subtablelinedetails = "";
                        //Especificar el tipo de reparto en el encabezado
                        MonitorLogisticaCs.subtablelinedetails += MonitorLogisticaCs.subtablelinedetailsheader.replace("{TipoReparto}", TipoReparto)
                            .replace("{monitorvp}", (TipoReparto.includes("reparto") ? "reparto" : "consolidado"));
                        //Obtener layout de tabla
                        MonitorLogisticaCs.subtablelinedetails += MonitorLogisticaCs.subtablelinedetailsbody.replace("{monitorvp}", (TipoReparto.includes("reparto") ? "reparto" : "consolidado"));

                        //Recorrer la lista de ordenes agrupada por linea
                        $.each(items, function (index, item) {
                            //Generar encabezado dinamicamente para el resto de columnas
                            if (index == 0) {
                                //MonitorLogisticaCs.columnasrestante = "<th class='EstatusReparto' id='EstatusReparto'  width='350' >Estatus Reparto </th>"
                                $.each(item, function (indexitem, itemdata) {
                                    let width = MonitorLogisticaCs.Column350.includes(indexitem) ? "350" : "250";

                                    let hasedit = "";

                                  

                                    if (MonitorLogisticaCs.EditColumns.includes(indexitem)) {
                                        hasedit = "notremove editMe"
                                    }

                                    else if (MonitorLogisticaCs.EditColumnsDate.includes(indexitem)) {
                                        hasedit = "notremove editMe"
                                    }

                                    else if (MonitorLogisticaCs.EditColumnsTime.includes(indexitem)) {
                                        hasedit = "notremove TimeField"
                                    }
                                    else {
                                        hasedit = ""
                                    }
                                

                                    MonitorLogisticaCs.columnasrestantes += `<th class="${hasedit}" id="${indexitem}" width="${width}">${LayoutCs.SpaceByUppercase(indexitem)}</th>`;
                                });
                            }
                            //Generar filas dinamicamente
                            MonitorLogisticaCs.celdasrestantes = "";
                            MonitorLogisticaCs.AnyData += `<tr class="ui-sortable-handle" document="${item.DocEntry}">`;

                            $.each(item, function (indexitem, itemdata) {
                                let hasedit = "";

                            


                                if (MonitorLogisticaCs.EditColumns.includes(indexitem)) {
                                    hasedit = "notremove editMe"
                                }

                                else if (MonitorLogisticaCs.EditColumnsDate.includes(indexitem)) {
                                    hasedit = "notremove editMe"
                                }

                                else if (MonitorLogisticaCs.EditColumnsTime.includes(indexitem)) {
                                    hasedit = "notremove TimeField"
                                }
                                else if (indexitem == "EstatusCarga") {
                                    hasedit = "EstatusCargaData"
                                }
                                else {
                                    hasedit = ""
                                }

                                MonitorLogisticaCs.celdasrestantes += `<td class="${indexitem} ${hasedit}">${itemdata}</td>`;
                            });

                            MonitorLogisticaCs.AnyData += `<td class="EstatusReparto"></td>` + MonitorLogisticaCs.celdasrestantes;
                            MonitorLogisticaCs.AnyData += `</tr>`; 
                        });
                        //Reemplazar información obtenida
                        MonitorLogisticaCs.subtablelinedetails = MonitorLogisticaCs.subtablelinedetails.replace("{headers}", MonitorLogisticaCs.columnasrestantes);
                        MonitorLogisticaCs.subtablelinedetails = MonitorLogisticaCs.subtablelinedetails.replace("{rows}", MonitorLogisticaCs.AnyData);
                        //Agregar tabla dinamica
                        $('#vista_previa').append(MonitorLogisticaCs.subtablelinedetails);
                        MonitorLogisticaCs.AnyData = "";
                        MonitorLogisticaCs.columnasrestantes = "";
                        MonitorLogisticaCs.celdasrestantes = "";
                    });

                    //Hacer editable la tabla
                    LayoutCs.MakeTableEditable("vista_previa");
                    LayoutCs.enableRowSorting("vista_previa", 2);
                    this.go = true;
                    break;

                case false:
                    LayoutCs.Alerta("Monitor de logística", "Se debe indicar el tipo de reparto de cada orden y estatus de carga.");
                    this.go = false;
                    break;
            }

            StopLoading();
        }
        catch (exception) {
            LayoutCs.Alerta("Monitor de logística", "No fue posible editar el monitor de logística: " + exception);
            StopLoading();
        }
    }
    //Validaciones paso 4 Avanzar a la creación del monitor de logistica
    async Step3() {
        try {

            Loading();
            MonitorLogisticaCs.monitordata = {};
            // Seleccionar todas las tablas con la clase 'tblmonitorlogistica'
            $('.tblmonitorlogistica').each(function (index, table) {
                // Convertir el elemento table a objeto jQuery
                var $table = $(table);

                // Recorrer las filas de cada tabla y mapear los datos
                let tempdata = $table.find('tbody tr').map(function (index) {
                    return {
                        DocEntry: $(this).attr("document") || "",
                        TipoReparto: $(this).find('td.TipoReparto').text() || "",
                        EstatusCarga: $(this).find('td.EstatusCarga').text() || "",
                        FechaPedido: $(this).find('td.FechaPedido').text() || "",
                        FechaSolicitudProduccion: $(this).find('td.FechaSolicitudProduccion').text() || "",
                        FechaOriginalEntrega: $(this).find('td.FechaOriginalEntrega').text() || "",
                        FechaEntrega: $(this).find('td.FechaEntrega').text() || "",
                        NumViaje: $(this).find('td.NumViaje').text() || "",
                        Pedido: $(this).find('td.Pedido').text() || "",
                        CodigoCliente: $(this).find('td.CodigoCliente').text() || "",
                        Cliente: $(this).find('td.Cliente').text() || "",
                        Comentarios: $(this).find('td.Comentarios').text() || "",
                        HoraEntrega: $(this).find('td.HoraEntrega').text() || "",
                        Articulo: $(this).find('td.Articulo').text() || "",
                        CantidadMetros: $(this).find('td.CantidadMetros').text() || "",
                        NumRollos: $(this).find('td.NumRollos').text() || "",
                        PiezasEntrega: $(this).find('td.PiezasEntrega').text() || "",
                        Cotejado: $(this).find('td.Cotejado').text() || "",
                        Direccion: $(this).find('td.Direccion').text() || "",
                        HorarioCita: $(this).find('td.HorarioCita').text() || "",
                        EstatusReparto: $(this).find('td.EstatusReparto').text() || "",
                        Orden: index
                    };
                }).get();

                // Agrupar datos por 'TipoReparto'
                tempdata.forEach(item => {
                    if (!MonitorLogisticaCs.monitordata[item.TipoReparto]) {
                        MonitorLogisticaCs.monitordata[item.TipoReparto] = []; // Crear un array para 'TipoReparto' si no existe
                    }
                    MonitorLogisticaCs.monitordata[item.TipoReparto].push(item); // Agregar el elemento al array correspondiente
                });
            });

            //Guardar el monitor
            this.action = $("#PedidosEntregas").attr("savemonitor");

            this.response = await $.ajax({
                url: this.action,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    Monitor: JSON.stringify(MonitorLogisticaCs.monitordata),
                    Usuario: sessionStorage.getItem("email"),
                    Tabla: "MonitorLogistica"
                }
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (this.response.Status == "OK") {
                //clonar resultado final
                var finalresult = $('#vista_previa').clone();
                //agregar contenido
                $("#reportbyline").empty();
                $("#reportbyline").append(finalresult);
                //limpiar vista previa
                $('#vista_previa').empty();
                $("#regresar").addClass("d-none");
                $("#continuar").text("Volver al inicio");
                $("#continuar").attr("restart", "true");
                //$("#reportbyline").html(`<h5 class="card-title">!Monitor Creado!</h5><p class="card-text">*Los datos del monitor han sido guardados exitosamente, puedes consultar el detalle en la vista Consulta Monitor Entregas*</p>`);
            }
            else {
                $("#reportbyline").html(`<h5 class="card-title">!Aviso!</h5><p class="card-text">No fue posible crear el monitor de logística, por favor intenta de nuevo más tarde: ${this.response.Message}</p>`);
            }

            StopLoading();
        }
        catch (exception) {
            LayoutCs.Alerta("Monitor de logística", "No fue posible crear las ordenes de fabricación: " + exception);
        }
    }
    //Filtrar Ordenes de Venta por DocEntry    
    filtrarOVXDocEntry(DocEntryList) {
        return this.OVList.filter(function (item) {
            return DocEntryList.includes(item.IdPedido); // Verifica si DocEntry está en el arreglo
        });
    }
    // * Obtener Estado Actual de la orden de compra
    // Método para validar el usuario
    async OVDetail() {
        try {
            Loading();
            this.response = await $.ajax({
                url: this.ovdetails,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    DocEntry: this.DocEntry
                }
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (this.response.Status == "OK") {

                this.DetailsOV = JSON.parse(this.response.Data);

                this.subtabledetails = `<table class="subtable w-75 m-2 ovdetails">
                                <thead>
                                <th>
                                 <i class="fa-solid fa-arrows-turn-right"></i>
                                  Número de artículo
                                 </th>
                                 <th>
                                 <i class="fa-solid fa-arrows-turn-right"></i>
                                  Descripción del artículo
                                 </th>
                                 <th>
                                <i class="fa-solid fa-arrows-turn-right"></i>
                                  Cantidad Solicitada
                                 </th>
                                 <th>
                                 <i class="fa-solid fa-arrows-turn-right"></i>
                                  Cantidad en Metros
                                 </th>
                                 <th>
                                 <i class="fa-solid fa-arrows-turn-right"></i>
                                  Cantidad
                                 </th>
                                 <th>
                                 <i class="fa-solid fa-arrows-turn-right"></i>
                                  No. Rollos
                                 </th>
                                 <th>
                                 <i class="fa-solid fa-arrows-turn-right"></i>
                                  Precio x Metro
                                 </th>
                                 <th>
                                 <i class="fa-solid fa-arrows-turn-right"></i>
                                  % de descuento
                                 </th>
                                 <th>
                                 <i class="fa-solid fa-arrows-turn-right"></i>
                                  Tipo esquema
                                 </th>
                                 <th>
                                 <i class="fa-solid fa-arrows-turn-right"></i>
                                  UM Solicitada
                                 </th>
                                 <th>
                                 <i class="fa-solid fa-arrows-turn-right"></i>
                                  Cantidad en Yardas
                                 </th>
                                 <th>
                                 <i class="fa-solid fa-arrows-turn-right"></i>
                                  Precio x yarda
                                 </th>
                                </thead>
                                <tbody>`;
                $.each(this.DetailsOV, function (index, item) {


                    MonitorLogisticaCs.subtabledetails += `<tr>
                                                         <td class="colspan-td">${item.Articulo}</td>
                                                         <td class="colspan-td">${item.DescripcionArticulo}</td>
                                                         <td class="colspan-td">${item.CantidadSolicitada}</td>
                                                         <td class="colspan-td">${item.CantidadMetros}</td>
                                                         <td class="colspan-td">${item.CantidadKilos}</td>
                                                         <td class="colspan-td">${item.Rollos}</td>
                                                         <td class="colspan-td">${item.PrecioMetro}</td>
                                                         <td class="colspan-td">${item.PorcentajeDescuento}</td>
                                                         <td class="colspan-td">${item.TipoEsquema}</td>
                                                         <td class="colspan-td">${item.UMSolicitada}</td>
                                                         <td class="colspan-td">${item.CantidadYardas}</td>
                                                         <td class="colspan-td">${item.PrecioYarda}</td>
                                                         </tr>`;

                    // Agregamos el div como una fila hija
                    MonitorLogisticaCs.row.child(MonitorLogisticaCs.subtabledetails).show();
                    MonitorLogisticaCs.current_row.addClass('shown');

                    $('td[colspan]').addClass('colspan-background');

                });

                this.subtabledetails += `</tbody>
                                         </table>`;

            }
            else {
                LayoutCs.Alerta("Monitor de logística", this.response.Message);
            }

            StopLoading();

        } catch (error) {
            LayoutCs.Excepcion(error, "Monitor de logística");
        }
    }

    //Configuración del plan de produccion por usuario(columnas visibles)
    async ConfigxUsuarioML(openmodal) {
        try {
            //Datos de PP
            Loading();
            this.anydata = await $.ajax({
                url: this.action,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    usuario: sessionStorage.getItem("email")
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                this.response = JSON.parse(this.anydata.Data);
                $("#configuracionPPContainer").empty();

                this.OrdenColumns = JSON.parse(this.anydata.Data)



                $.each(MonitorLogisticaCs.response, function (index, item) {
                    let checked = item.Visible == "SI" ? 'checked' : '';
                    $("#configuracionPPContainer").append(`<div class="mb-1 align-self-start form-check">
                        <input type="checkbox" id="${item.ColumnName}" class="form-check-input anycheck configuracionbyPP" value="${item.ColumnName}" ${checked}>
                        <label class="form-check-label" for="${item.ColumnName}">${item.ColumnName}</label>
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

                    //update: function (event, ui) {
                    //    // Esta función se llama cada vez que se cambia el orden
                    //    console.log("Nuevo orden:");
                    //    $("#configuracionPPContainer .form-check").each(function (index) {
                    //        console.log(`${index + 1}: ${$(this).find('label').text()}`);
                    //    });
                    //}
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
        }
    }

    async InsertaConfigxUsuarioML() {
        try {
            //Datos de PP
            Loading();
            this.anydata = await $.ajax({
                url: this.action,
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
                LayoutCs.Alerta("Plan de producción", "La configuración del plan de producción fue actualizada correctamente.");
                //this.ReiniciarPagina();
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.anydata.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible actualizar la configuración del plan de producción: " + error, "Plan de producción");
        }
    }

    //Algoritmo para ordenar los embarques
    ordenarEmbarques(embarques) {
        return embarques.sort((a, b) => {
            // 1. Priorizar los embarques con hora de cita
            if (a.Cita == 'Si' && b.Cita != 'Si') return -1;
            if (a.HoraCita != 'Si' && b.Cita == 'Si') return 1;

            // 2. Si ambos tienen cita, ordenar por la hora más próxima
            if (a.Cita == 'Si' && b.Cita == 'Si') {
                return horaCita(a.Cita, a.HoraInicio, a.HoraFin) - horaCita(b.Cita, b.HoraInicio, b.HoraFin);
            }

            // 3. Si ninguno tiene cita, ordenar por intentos fallidos (priorizar los que han fallado más veces)
            if (a.NumViajes !== b.NumViajes) {
                return b.NumViajes - a.NumViajes; // Mayor cantidad de intentos fallidos primero
            }

            // 4. En caso de empate, ordenar por distancia (de menor a mayor)
            return a.Distancia - b.Distancia;
        });
}


}

//Instancia de clase
const MonitorLogisticaCs = new MonitorLogistica();
// Función para manejar el envío del formulario
function ValidacionFormularios(event) {
    // Validar el formulario
    if (this.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
    } else {
        switch ($(event.currentTarget).attr("metodo")) {
            //Cuando se carga la pagina seleccionar a traves del modal
            case "FiltroFechaIni":
                // Convertir de 'yyyy-mm-dd' a 'dd/mm/yyyy'
                MonitorLogisticaCs.fecha_entrega = $("#fecha_entrega").val();
                if (MonitorLogisticaCs.fecha_entrega != "") {
                    //let [year, month, day] = $("#fecha_entrega").val().split('-');
                    //let fechaFormateada = `${day}/${month}/${year}`; // Fecha en formato 'dd/mm/yyyy'
                    //MonitorLogisticaCs.fecha_entrega = fechaFormateada;
                    MonitorLogisticaCs.fecha_entrega = $("#fecha_entrega").val();
                }
                break;
        }
        //Ejecutar la consulta
        //LayoutCs.EnviarNotificacion("Monitor de logística", "El monitor ha sido creado exitosamente", "https://fisfiber.com.mx/wp-content/uploads/2023/04/Logo_header-180x54-2-3.png", "https://fisfiber.com.mx/", "Acceder", sessionStorage.getItem("email"));
        MonitorLogisticaCs.action = $("#PedidosEntregas").attr("action");
        MonitorLogisticaCs.table = MonitorLogisticaCs.PedidosEntregas();
        //Mostrar paso 1 y setear valores
        $("#RangoInicio").modal("hide");
        event.preventDefault();
        event.stopPropagation();
    }

    // Añadir la clase 'was-validated' para activar los estilos de validación
    $(this).addClass('was-validated');
}

function parseHora(hora) {
    let horaFormat = '--';
    if (hora != '0' && hora != '--') {
        // Extraer horas y minutos de la hora destino
        const horas = Math.floor(hora / 100); // Extraer las horas
        let minutos = hora % 100; // Extraer los minutos
        if (minutos == 0)
            minutos = '00'
        horaFormat = `${horas}:${minutos}`;
    }

    return horaFormat;
}

function horaCita(cita, hi, hf) {

    //Si tienen Cita:
    //Rango hora inicio - hora final : En ese rango te pueden recibir
    //Solo tiene hora inicio : Apartir de esa en adelante los pueden recibir
    //Solo tiene hora fin : es la hora de la cita
    let objHora = {};

    if (cita == "Si") {
        //Solo tiene hora inicio
        if ((hi != null && hi != "") && (hf == null || hf == "")) {
            color = ""
        }


        if (hf != null && hf != "") {
            if (hi != null && hi != "") {
                objHora = tiempoFaltante(hi);
            }
            else {
                objHora = tiempoFaltante(hf);
            }

           
        }

    }

    return objHora;
}

function tiempoFaltante(horaDestino) {
    // Obtener la hora y minutos actuales
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutosActuales = ahora.getMinutes();

    // Extraer horas y minutos de la hora destino
    const horasDestino = Math.floor(horaDestino / 100); // Extraer las horas
    const minutosDestino = horaDestino % 100; // Extraer los minutos

    // Calcular la diferencia en minutos
    let diferenciaMinutos = (horasDestino * 60 + minutosDestino) - (horaActual * 60 + minutosActuales);

    // Si la hora destino ya pasó hoy, calcular para el día siguiente
    //if (diferenciaMinutos < 0) {
    //    diferenciaMinutos += 24 * 60; // Agregar 24 horas en minutos
    //}

    // Convertir a horas y minutos restantes
   
    const minutosFaltantes = diferenciaMinutos ;

    return minutosFaltantes;
}


//EVENTOS
$(function () {
    // Validación de formularios
    $(document).on('submit', '.needs-validation', ValidacionFormularios);
    //Consultar los pedidos pendientes para entregas
    MonitorLogisticaCs.RangoInicio();

    $("#btnFechaEntrega").on("click", function () {
        MonitorLogisticaCs.fecha_entrega = $("#fecha_entregaS").val();
        MonitorLogisticaCs.action = $("#PedidosEntregas").attr("action");
        $("#PedidosEntregas").DataTable().destroy();
        MonitorLogisticaCs.table = MonitorLogisticaCs.PedidosEntregas();
    });

    //PASO SIGUIENTE -> BOTON SIGUIENTE
    $(".next").on("click", function (e) {
        try {
            let restart = $(this).attr("restart");
            switch (restart) {
                case "true":
                    window.location.reload();
                    break;

                case "false":
                    MonitorLogisticaCs.nextStep();
                    break;
            }

        }
        catch (error) {
            LayoutCs.Alerta("Monitor de logística", "No fue posible continuar, por favor intenta de nuevo mas tarde: " + error);
        }
    });

    //PASO ANTERIOR -> BOTON ANTERIOR
    $(".prev").on("click", function (e) {
        let steps = $(".step");
        $.each(steps, function (i) {
            if ($(steps[i]).hasClass('done') && $(steps[i + 1]).hasClass('current')) {
                $(steps[i + 1]).removeClass('current');
                $(steps[i]).removeClass('done').addClass('current');
                return false;
            }
        });
        MonitorLogisticaCs.prevStep();
    });

    //Descargar excel
    $(document).on("click",".descargarmonitorvp", function () {
        try {
            let table = $(this).attr("destino");
            let title = table.includes("reparto") ? "(Pedidos Reparto)" : "(Pedidos Consolidados)"
            LayoutCs.ExportarExcelExcelJS(table, `MonitorLogistica ${title}`, "", `Vista Previa Monitor Logística ${title}`);
        }
        catch (error) {
            LayoutCs.Alerta("Monitor de logística", "No es posible descargar la bitácora, por favor contacte al administrador del sistema con el siguiente código de error: " + error);
        }
    });

    //Al hacer click en los checkbox de las OV
    $('#PedidosEntregas tbody').on('click', '.ovmonitor', function (event) {
        //Detener la propagacion del evento hacia la fila
        event.stopPropagation();
        // Quitar la clase 'rowselected' de la fila que contiene el checkbox
        $(this).closest('tr').removeClass('selectedrow');
    });
    $('#PedidosEntregas tbody').on('click', 'tr.monitor', function () {
        try {
            //Obtener url consulta
            //PlanProduccionCs.DocEntry = this.childNodes[1].innerText; //DOCENTRY
            //PlanProduccionCs.DocNum = this.childNodes[2].innerText; //DOCNUM
            MonitorLogisticaCs.ovdetails = $("#PedidosEntregas").attr("ovdetails");
            MonitorLogisticaCs.rowdata = MonitorLogisticaCs.table.row(this).data();
            MonitorLogisticaCs.DocEntry = MonitorLogisticaCs.rowdata.IdPedido; //DOCENTRY
            MonitorLogisticaCs.current_row = $(this);
            MonitorLogisticaCs.row = MonitorLogisticaCs.table.row(MonitorLogisticaCs.current_row);


            if (MonitorLogisticaCs.row.child.isShown()) {
                MonitorLogisticaCs.row.child.hide();
                MonitorLogisticaCs.current_row.removeClass('shown');
                // Quitar clase PPselected de todas las filas
                $('#PedidosEntregas tbody tr').find('td').removeClass('OVselected');
                // Quitar el ícono de flecha derecha de todas las filas
                $('#PedidosEntregas tbody tr').find('td:first-child .fa-arrow-right').remove();
            }
            else {
                //realizar peticion para obtener detalles
                MonitorLogisticaCs.OVDetail();
                // Quitar clase PPselected de todas las filas
                $('#PedidosEntregas tbody tr').find('td').removeClass('OVselected');
                // Quitar el ícono de flecha derecha de todas las filas
                $('#PedidosEntregas tbody tr').find('td:first-child .fa-arrow-right').remove();
                // Añadir clase PPselected a las celdas de la fila seleccionada
                $(this).find('td').addClass('OVselected position-relative');
                // Añadir ícono de flecha derecha a la primera celda de la fila seleccionada
                $(this).find('td:first-child').append('<i class="fas fa-arrow-right iconOVselected"></i>');
            }


        }
        catch (error) {
            LayoutCs.Alerta("Monitor de logística", "No es posible obtener los detalles de la OV, por favor contacte al administrador del sistema con el siguiente código de error: " + error);
        }
    });

    //EVENTOS ORDENES DE VENTAS
    //SELECCIONAR TODAS LAS ORDENES -> Evento de cambio en el checkbox "Seleccionar Todos"
    $('#selectAll').on('change', function () {
        var isChecked = $(this).is(':checked');
        $('#PedidosEntregas tbody tr').toggleClass('selectedrow', isChecked);
        $('#PedidosEntregas tbody input[type="checkbox"].ovmonitor').prop('checked', isChecked);
    });

    //Configurar el listado del plan de produccion
    $("#edicionPP").on("click", function () {
        //Configuracion del plan de produccion por usuario
        MonitorLogisticaCs.action =  $(this).attr("configuracion");
        MonitorLogisticaCs.ConfigxUsuarioML("true");
    });

    $("#GuardaConfigPP").on("click", function () {
        try {
            //Limpiar variables
            MonitorLogisticaCs.configuracionPP = {};

            $('.configuracionbyPP').each(function (index) {
                // Obtén el id del checkbox y usa limpiarTexto para quitar acentos y espacios
                let id = LayoutCs.limpiarTexto(this.id);

                // Asigna el id como clave y el valor "SI" o "NO" como valor
                MonitorLogisticaCs.configuracionPP[id] = { "Visible": this.checked ? "SI" : "NO", "Orden": (index + 1) };

            });

            MonitorLogisticaCs.action = $("#edicionPP").attr("updateconfiguracion");
            MonitorLogisticaCs.InsertaConfigxUsuarioML();
        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No fue posible actualizar la configuración para el plan de producción, por favor intenta de nuevo mas tarde: " + error);
        }
    });
    //Seleccionar todas las columnas para el listado del detalle del plan
});
