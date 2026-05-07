class ConsultaPlanProduccion {
    constructor() {
        // * Atributos para guardar los datos de la lista de las ordenes de venta agrupados por linea
        this.subtablelinedetailsbody = `<div class="card">
                                                <div class="card-body ReportHeader">
                                                    <div class="row">
                                                        <div class="col-12 text-start">
                                                            <div class="text-center">
                                                                <span class="ps-2">
                                                                   PLAN DE PRODUCCIÓN LÍNEA {linea}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row m-0 pb-4">
                                <div class="col-md-12 p-0 body-table">
                                <table id="{id}" class="table table-preview table-striped table-bordered m-0" style="table-layout:fixed">
                                <thead>
                                <tr>
                                <th class="d-none" width="200"></th>
                                <th width="240">LINEA</th>
                                <th width="200">FOLIO</th>
                                <th width="200">NO ORDEN FABRICACION</th>
                                <th width="300">ESTATUS SAP</th>
                                 {restheaders}
                                </tr>
                                </thead>
                                <tbody>{rows}</tbody>
                                </table>
                                </div>
                                </div>`;
        this.subtablelinedetails = "";
        this.modifieddata = [];
        this.historymodified = "Cambió: ";
        this.configuracionPP = {};
        this.OrdenPP = "";
        // * Atributo para obtener el response de cualquier solicitud AJAX
        this.anydata = "";
        this.anyvar = "";
        this.extradata = "";
        this.otherdata = "";
        this.response = "";
        // * Atributo para urls
        this.action = "";
        // * Atributo para guardar la tabla de datos
        this.table;
        // * Atributo para guardar los datos de una fila de la tabla
        this.rowdata = "";
        // * Atributo para guardar el ID de fila de la tabla
        this.row = "";
        // * Atributo para asignaciones generales 
        this.current_row = "";
        // * Atributo para obtener el Folio del Documento
        this.FolioPP = "";
        this.Revision = "";
        this.FechaRevision = "";
        this.hasfechaentrega;
        // * atributos para obtener datos de la vista previa del plan de produccion
        this.previewdataPP;
        this.grouppreviewdataPP;
        this.ExcludeColumsPP = [
            "RollosSAP", "CantidadMetrosSAP", "CantidadKilosSAP",
            "Linea", "FlagOrdenFabricacion", "IdPPD",
            "Orden", "Folio", "fecha", "DocEntry",
            "GenerarOF", "OrdenFabricacion", "EstatusSapOF", "Especificacion",
            "Prioridad", "StatusProduccion", "OrdenFabricacion1", "Folio1"
        ];
        this.ColumnsWithEdit = ["ComentariosExtras", "CantidadMetros", "Rollos"];
        this.ColumnsWithEditTime = [];
        this.ColumnsWithEditDate = ["FechaEntrega"];
        this.ColumnsWithEditProduccion = ["EstatusProduccion"];
        this.NombresLineas = "";
        this.FI = "";
        this.FF = "";
    }
    //Listado de planes de produccion
    PlanesProduccion(terminados) {
        try {
            let table = $("#PlanProduccion").DataTable(
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
                            "terminados": terminados,
                            "lineas": this.NombresLineas,
                            "FI": this.FI,
                            "FF": this.FF,

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
                                "data": "Folio" /* Folio de PP */
                            },
                            {
                                "data": "Linea" /* Linea */
                            },
                            {
                                "data": "FechaCreacion" /* Estatus Sap OF */
                            },
                            {
                                "data": "CantidadKilos" /* Cantidad Kilos */
                            },
                            {
                                "data": "Articulo" /* Articulo */
                            },
                            {
                                "data": "DescripcionArticulo" /* Descripcion Articulo*/
                            },
                            {
                                "data": "GenerarOF" /* Indica si se genera o no la OF */
                            },
                            {
                                "data": "OrdenFabricacion" /* Num documento SAP OF */
                            },
                            {
                                "data": "EstatusSapOF" /* Estatus Sap OF */
                            },
                            
                            {
                                "data": null,
                                "render": function (data, type, row) {
                                    // Aquí accedes al valor de DocEntry con row.DocEntry
                                    return `<i value="${row.Folio}" class="fs-4 fa-solid fa-book bitacoraPP"></i>`;
                                }
                            },
                        ],
                    columnDefs: [
                        { width: '250px', targets: '_all' },
                        { targets: [3,4,5,6,7,8], visible: false }

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
                        // Agregar una clase personalizada a cada fila
                        $(row).addClass('PP');
                        // Agregar una clase personalizada a cada fila
                        $(row).attr("folio", data.Folio);
                    }
                });


            $(".buttons-excel").addClass("exceldownload");

            return table;
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible mostrar los planes de producción: " + error, "Plan de producción");
            StopLoading();

        }
    }
    //Detalles de plan de produccion
    async PlanesProduccionDetails() {
        try {
            //Datos de PP
            Loading();
            this.anydata = await $.ajax({
                url: this.action,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    folio: this.FolioPP,
                    usuario: sessionStorage.getItem("email"),
                    tabla: "PlanProduccion"
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                //Limpiar el contenedor
                $("#reportbyline").empty();
                //Obtener los datos
                this.previewdataPP = JSON.parse(this.anydata.Data);
                this.extradata = JSON.parse(this.anydata.ExtraData);
                this.otherdata = JSON.parse(this.anydata.Other);
                //Datos de OV agrupados por linea
                this.grouppreviewdataPP = LayoutCs.agruparPorLinea(this.previewdataPP);

                // Recorrer el resultado agrupado y mostrar en la consola
                $.each(this.grouppreviewdataPP, function (linea, items) {
                    ConsultaPlanProduccionCs.subtablelinedetails = "";

                    //Crear los registros en la tabla
                    ConsultaPlanProduccionCs.subtablelinedetails += ConsultaPlanProduccionCs.subtablelinedetailsbody;

                    //Recorrer la lista de ordenes agrupada por linea
                    ConsultaPlanProduccionCs.anydata = "";
                    let columnasrestantes = "";
                    let celdasrestantes = "";
                    $.each(items, function (index, item) {
                        //Generar encabezado dinamicamente para el resto de columnas
                        if (index == 0) {
                            $.each(item, function (indexitem, itemdata) {
                                if (!ConsultaPlanProduccionCs.ExcludeColumsPP.includes(indexitem)) {
                                    let textoH = LayoutCs.SpaceByUppercase(indexitem);
                                    columnasrestantes += `<th id="${indexitem}" width="200">${textoH.toUpperCase()}</th>`;
                                }
                            });
                        }


                        //Si la orden no ha sido enviada, tener la opcion de crear
                        let shouldbechecked = (item.OrdenFabricacion == '' ? "" : "checked disabled");
                        let shouldbeshowed = (item.OrdenFabricacion == '' ? "" : "checked disabled");
                        let GenerarOF = (item.OrdenFabricacion == "" ? "NO" : "SI");
                        ConsultaPlanProduccionCs.anyvar = `<div class="form-check"><input value="${item.DocEntry}" data-linea="${item.Linea}" type="checkbox" ${shouldbechecked} class="form-check-input anycheck sendOF"></div>`;
                        ConsultaPlanProduccionCs.anydata += `<tr>`;
                        //Columnas principales
                        item.OrdenFabricacion = item.OrdenFabricacion1;


                        ConsultaPlanProduccionCs.anydata += `<td class="d-none">${ConsultaPlanProduccionCs.anyvar}</td>
                                                             <td data-name="Linea">${item.Linea}</td>
                                                             <td data-name="Folio">${item.Folio}</td>
                                                             <td>${item.OrdenFabricacion}</td>
                                                             <td>${item.EstatusSapOF}</td>`;

                        //Resto de datos
                        //Saber si requiere edicion y de que tipo
                        let isfinished = "";
                        celdasrestantes = "";

                        //item.Rollos = item.RollosSAP;
                        //item.CantidadKilos = item.CantidadKilosSAP;
                        //item.CantidadMetros = item.CantidadMetrosSAP;
                        item.TiempoProduccion = LayoutCs.convertirHorasMinutos(item.TiempoProduccion);


                        $.each(item, function (indexitem, itemdata) {
                            if (!ConsultaPlanProduccionCs.ExcludeColumsPP.includes(indexitem)) {
                                if (indexitem == "EstatusProduccion") {
                                    if (itemdata == "terminado")
                                        isfinished = "OVfinisihed";
                                    else
                                        isfinished = "";
                                }
                                else {
                                    isfinished = "";
                                }

                                celdasrestantes += `<td class="${indexitem} ${isfinished}" data-id="${LayoutCs.SpaceByUppercase(indexitem)} Linea: ${linea} Pedido: ${item.Pedido}" data-name="${indexitem}">${itemdata}</td>`;
                            }
                        });
                        //Agregar celdas
                        ConsultaPlanProduccionCs.anydata += celdasrestantes;
                        //Cerrar la fila
                        ConsultaPlanProduccionCs.anydata += `</tr>`;
                    });
                    //Agregar las OV agrupadas por linea
                    ConsultaPlanProduccionCs.subtablelinedetails = ConsultaPlanProduccionCs.subtablelinedetails
                        .replace("{id}", ("PPDetails" + linea))
                        .replace("{linea}", linea)
                        .replace("{rows}", ConsultaPlanProduccionCs.anydata)
                        .replace("{restheaders}", columnasrestantes);

                    $("#reportbyline").append(ConsultaPlanProduccionCs.subtablelinedetails.trim());
                    ConsultaPlanProduccionCs.MakeTableEditableWithBitacora(("PPDetails" + linea));
                });

                $("#folioseleccionado").text(this.FolioPP);
                $("#actualizar").removeClass("d-none");
                $("#PPHeader").removeClass("d-none");
                $("#PPHeaderTitle").addClass("d-none");

                //Detales encabezado plan produccion
                $("#fecha-liberacion,#fecha-revision,#fecha-documento").text(ConsultaPlanProduccionCs.extradata[0].fecha);
                $("#revision").text(ConsultaPlanProduccionCs.extradata[0].Revision + " ACTUALIZADA");
                $("#folio").text(ConsultaPlanProduccionCs.extradata[0].folio + "-" + ConsultaPlanProduccionCs.extradata[0].Revision);

                //Ocultar celdas y columnas que no son visibles de acuerdo a la configuracion
                $.each(this.otherdata, function (index, item) {
                    //OCULTAR COLUMNA Y CELDA
                    if (item.Visible == "NO") {
                        let DOMelementML = LayoutCs.limpiarTexto(item.ColumnName);
                        $(`#${DOMelementML}`).addClass("d-none");
                        $(`.${DOMelementML}`).addClass("d-none");
                    }

                });
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.response.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible consultar el plan de produccion: " + error, "Plan de producción");
            StopLoading();

        }
    }
    //Actualizar plan de produccion
    async UpdatePlanProduction() {
        try {
            //Datos de PP
            Loading();
            this.anydata = await $.ajax({
                url: this.action,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    "PlanProduccion": JSON.stringify(this.modifieddata),
                    "folioPP": this.FolioPP,
                    "HistorialEdiciones": this.historymodified,
                    "usuario": sessionStorage.getItem("email"),
                    "Tabla": "PlanProduccion"
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                this.ReiniciarPagina();
                LayoutCs.Alerta("Plan de producción", "Plan de producción actualizado correctamente.");
                ConsultaPlanProduccionCs.historymodified = "";
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.anydata.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible actualizar el plan de produccion: " + error, "Plan de producción");
            StopLoading();
        }
    }
    //Detalles de plan de produccion
    async BitacoraPlanProduccion() {
        try {
            //Datos de PP
            Loading();
            this.anydata = await $.ajax({
                url: this.action,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    folio: this.FolioPP,
                    Tabla: "PlanProduccion"
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                this.extradata = JSON.parse(this.anydata.Data);
                var rows = "";
                $.each(ConsultaPlanProduccionCs.extradata, function (index, item) {

                    rows += `<tr data-plan="${item.folio}" data-revision="${item.revision}" data-fecha="${item.fecha}" class="BitacoraDetails">
                                                         <td>${item.folio}</td>
                                                         <td>${item.revision}</td>
                                                         <td>${item.descripcion}</td>
                                                         <td>${item.usuario}</td>
                                                         <td>${item.fecha}</td>
                                                         </tr>`;
                });
                $("#BitacoraPP tbody").empty();
                $("#BitacoraPP tbody").append(rows.trim());
                $("#folioPP").text(this.FolioPP);
                $("#Bitacora").modal("show");
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.response.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible consultar la bitácora de el plan de producción: " + error, "Plan de producción");
            StopLoading();

        }
    }
    //Detalles de bitacora de produccion
    async BitacoraPlanProduccionDetails() {
        try {
            //Datos de PP
            Loading();
            this.anydata = await $.ajax({
                url: this.action,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    folio: this.FolioPP,
                    revision: this.Revision
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                this.response = JSON.parse(this.anydata.Data);
                this.generarBITACORA(this.response, this.FolioPP, this.Revision, this.FechaRevision);
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.anydata.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible consultar el plan de producción: " + error, "Plan de producción");
            StopLoading();

        }
    }
    //Configuración del plan de produccion por usuario(columnas visibles)
    async ConfigxUsuarioPP(openmodal) {
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
                $.each(ConsultaPlanProduccionCs.response, function (index, item) {
                    let checked = item.Visible == "SI" ? 'checked' : '';

                    let textoS = item.ColumnName;
                    if (item.ColumnName == 'StatusProduccion') textoS = "EstatusProduccion";

                    $("#configuracionPPContainer").append(`<div class="mb-1 align-self-start form-check ChecksConfig">
                        <input type="checkbox" id="${item.ColumnName}" class="form-check-input anycheck configuracionbyPP" value="${item.ColumnName}" ${checked}>
                        <label class="form-check-label" for="${item.ColumnName}">${LayoutCs.SpaceByUppercase(textoS)}</label>
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
    //Inserta o actualiza la configuración del plan de produccion por usuario(columnas visibles)
    async InsertaConfigxUsuarioPP() {
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
                LayoutCs.Alerta("Plan de producción", "La configuración del plan de producción fue actualizada correctamente.", "OK");
                this.ReiniciarPagina();
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
    //Hacer tabla editable
    async MakeTableEditableWithBitacora(table) {
        //Advanced editor
        var advancedEditor = new SimpleTableCellEditor(table, { navigation: false });
        advancedEditor.SetEditableClass("editMe");
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

        //Obtener datos de estatus de produccion
        this.urlaction = $("body").attr("estatusproduccion");
        this.response = await LayoutCs.MakeAjaxRequest(this.urlaction, this.anydata);
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

        // Configuración personalizada para el campo de hora con AM/PM
        advancedEditor.SetEditableClass("TimeField", {
            internals: {
                renderEditor: (elem, oldVal) => {
                    // Convertir a formato de 24 horas para el input
                    const [timeValue, period] = oldVal.split(' ');
                    let [hours, minutes, seconds] = timeValue.split(':');
                    hours = parseInt(hours);

                    // Ajustar a formato de 24 horas si es necesario
                    if (period === 'p.m.' && hours < 12) hours += 12;
                    if (period === 'a.m.' && hours === 12) hours = 0;

                    const time24 = `${String(hours).padStart(2, '0')}:${minutes}:${seconds || '00'}`;

                    // Crear el input de tiempo en formato 24 horas
                    $(elem).html(`<input type="time" class="form-control mt-2" value="${time24}" step="1">`);
                },
                extractEditorValue: (elem) => {
                    // Obtener la hora seleccionada en formato de 24 horas
                    const timeValue = $(elem).find('input').val();

                    if (timeValue) {
                        // Convertir la hora de 24 horas a 12 horas con AM/PM
                        let [hours, minutes, seconds] = timeValue.split(':');
                        hours = parseInt(hours);
                        const period = hours >= 12 ? 'p.m.' : 'a.m.';
                        hours = hours % 12 || 12; // Convertir 0 y 12 a 12 en formato 12 horas

                        return `${hours}:${minutes}:${seconds || '00'} ${period}`;
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

        // Detectar edición de celdas y obtener el nombre de la celda
        $("#" + table).on('change', '.editMe, .TimeField, .DateField,.EstatusProduccionData', function () {
            var cell = $(this).closest('td'); // Obtener la celda más cercana
            var cellName = cell.data('id'); // Asumiendo que existe un atributo 'data-id'

            if (cellName && !ConsultaPlanProduccionCs.historymodified.includes(cellName)) {
                ConsultaPlanProduccionCs.historymodified += cellName + "\n";
            }
        });
    }
    //Generar PDF
    generarPDF(datos) {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            console.error("jsPDF no está disponible. Asegúrate de haber incluido la biblioteca.");
            return;
        }

        const doc = new window.jspdf.jsPDF("landscape");
        const logoURL = "/Images/logoFisfiber.png";
        let pageWidth = doc.internal.pageSize.getWidth();
        let inicioY = 35;
        var linea = "";

        datos.forEach((item, index) => {
            if (index > 0) {
                doc.addPage();
                inicioY = 35; // Reinicia la posición de inicio en cada nueva tarjeta
            }

            // Encabezado y logo
            doc.setFillColor(0, 0, 0);
            doc.rect(0, 0, 297, 30, "F");
            doc.addImage(logoURL, "PNG", 10, 5, 65.13, 22.29);

            let x = pageWidth - 120;
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.text(`FECHA DE LIBERACIÓN ${item.fecha}`, x, 7);
            doc.text("RC-PLANEACION-01-01", x, 13);
            doc.text(`FECHA DE REVISIÓN ${item.fecha}`, x, 19);
            doc.text(`FOLIO ${item.Folio}-${item.revision}`, x, 25);

            x = pageWidth - 50;
            doc.text(`REVISIÓN ${item.revision} ANTERIOR`, x, 7);
            doc.text("NIVEL 3", x, 13);
            doc.text(`FECHA ${item.TimeStamp}`, x, 19);

            doc.setLineWidth(0.5);
            doc.setDrawColor(255, 255, 255);
            doc.line(10, 32, 287, 32);
            //Guardar la linea
            linea = item.Linea;
            // Rectángulo con título de la tarjeta
            const titulo = `LÍNEA ${linea}`;
            const rectWidth = 285;
            const rectHeight = 10;
            const rectX = ((pageWidth - 2) - rectWidth) / 2;
            doc.setFillColor(30, 118, 189);
            doc.rect(rectX, inicioY, rectWidth, rectHeight, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            const textWidth = doc.getTextWidth(titulo);
            doc.text(titulo, rectX + (rectWidth - textWidth) / 2, inicioY + (rectHeight / 2) + 2.5);

            doc.setTextColor(0, 0, 0);
            inicioY += rectHeight + 5;

            // Filas de datos
            const rows = [
                ["COMENTARIOS EXTRAS", item.ComentariosExtras], ["FECHA", item.fecha], ["PRIORIDAD", item.Prioridad],
                ["ROLLOS", item.Rollos], ["PIEZAS PRODUCIDAS", item.PiezasProducidas || "N/A"],
                ["PEDIDO", item.Pedido || "N/A"], ["CÓDIGO CLIENTE", item.CodigoCliente || "N/A"],
                ["SOLICITADO", item.Solicitado || "N/A"], ["LÍNEA", item.Linea || "N/A"],
                ["ARTÍCULO", item.Articulo || "N/A"], ["DESCRIPCIÓN ARTÍCULO", item.DescripcionArticulo || "N/A"],
                ["ALMACÉN", item.Almacen || "N/A"], ["METROS ROLLO", item.MetrosRollo || "N/A"],
                ["ESPECIFICACIÓN", item.Especificacion || "N/A"], ["HORA INICIO", item.HoraInicio || "N/A"],
                ["HORA FINAL", item.HoraFinal || "N/A"], ["TIEMPO PRODUCCIÓN", item.TiempoProduccion || "N/A"],
                ["CANTIDAD METROS", item.CantidadMetros || "N/A"], ["COMENTARIOS", item.Comentarios || "N/A"],
                ["FECHA CONTABILIZACIÓN", item.FechaContabilizacion || "N/A"],
                ["FECHA FABRICACIÓN", item.FechaFabricacion || "N/A"],
                ["FECHA ENTREGA", item.FechaEntrega || "N/A"], ["CLIENTE", item.Cliente || "N/A"],
                ["CANTIDAD KILOS", item.CantidadKilos || "N/A"]
            ];

            let cellY = inicioY;

            for (let i = 0; i < rows.length; i += 2) {
                const cellWidth = 65;
                const rowHeight = 8;

                var fillColor1 = { r: 245, g: 245, b: 245 };
                doc.setFillColor(fillColor1.r, fillColor1.g, fillColor1.b);
                doc.setDrawColor(180, 180, 180);
                doc.rect(5.4, cellY, cellWidth, rowHeight, "FD");
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.text(rows[i][0], 7.5, cellY + 6);
                doc.setFont("helvetica", "normal");
                fillColor1 = { r: 255, g: 255, b: 255 };
                doc.setFillColor(fillColor1.r, fillColor1.g, fillColor1.b);
                doc.rect(70, cellY, 80, rowHeight, "FD");
                doc.text(String(rows[i][1]), 72, cellY + 6);

                if (i + 1 < rows.length) {
                    fillColor1 = { r: 245, g: 245, b: 245 };
                    doc.setFillColor(fillColor1.r, fillColor1.g, fillColor1.b);
                    doc.rect(155, cellY, cellWidth, rowHeight, "FD");
                    doc.setFont("helvetica", "bold");
                    doc.text(rows[i + 1][0], 157.5, cellY + 6);
                    doc.setFont("helvetica", "normal");
                    fillColor1 = { r: 255, g: 255, b: 255 };
                    doc.setFillColor(fillColor1.r, fillColor1.g, fillColor1.b);
                    doc.rect(220, cellY, 70, rowHeight, "FD");
                    doc.text(String(rows[i + 1][1]), 222, cellY + 6);
                }

                cellY += rowHeight;
                if (cellY > 150) {
                    doc.addPage();
                    cellY = 40;
                }
            }

            // Pie de página
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.text(`Página ${i} de ${totalPages}`, 148.5, 290, { align: "center" });
            }
        });

        doc.save(`Historial-linea${linea}.pdf`);
    }
    //Generar PDF
    generarBITACORA(datos, folioPP, Revision, Fecha) {
        // Recorrer el resultado agrupado y mostrar en la consola
        ConsultaPlanProduccionCs.anydata = "";
        $.each(datos, function (index, item) {
            item.TiempoProduccion = LayoutCs.convertirHorasMinutos(item.TiempoProduccion);

            ConsultaPlanProduccionCs.anydata += `<tr>
                                                         <td>${item.Linea}</td>
                                                         <td>${item.ComentariosExtras}</td>
                                                         <td>${item.Prioridad}</td>
                                                         <td>${item.UbicacionPropuesta}</td>
                                                         <td>${item.HoraPropuesta}</td>
                                                         <td>${item.UbicacionFinal}</td>
                                                         <td>${item.Rollos}</td>
                                                         <td>${item.PiezasProducidas}</td>
                                                         <td>${item.Pedido}</td>
                                                         <td>${item.CodigoCliente}</td>
                                                         <td>${item.Solicitado}</td>
                                                         <td>${item.Articulo}</td>
                                                         <td>${item.DescripcionArticulo}</td>
                                                         <td>${item.Almacen}</td>
                                                         <td>${item.MetrosRollo}</td>
                                                         <td>${item.Especificacion}</td>
                                                         <td>${item.HoraInicio}</td>
                                                         <td>${item.HoraFinal}</td>
                                                         <td>${item.TiempoProduccion}</td>
                                                         <td>${item.CantidadMetros}</td>
                                                         <td>${item.Comentarios}</td>
                                                         <td>${item.FechaContabilizacion}</td>
                                                         <td>${item.FechaFabricacion}</td>
                                                         <td>${item.FechaEntrega}</td>
                                                         <td>${item.Cliente}</td>
                                                         <td>${item.CantidadKilos}</td>
                                                         </tr>`;
        });
        $("#BitacoraDetailsList tbody").empty();
        $("#BitacoraDetailsList tbody").append(ConsultaPlanProduccionCs.anydata);
        $("#folioRevision").text(folioPP);
        $("#Revision").text(Revision);
        $("#FechaRevision").text(Fecha);
        $("#Bitacora").modal("toggle");
        $("#BitacoraDetalle").modal("show");
    }
    // Formato de fecha
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    //ReiniciarPagina
    ReiniciarPagina() {
        //Limpiar el contenedor
        $("#reportbyline").empty();
        $("#reportbyline").html(`<h5 class="card-title">!Ningun plan seleccionado!</h5>
                    <p class="card-text">Aquí podrás visualizar el detalle de el plan de producción seleccionado.</p>`)
        $("#folioseleccionado").text("");
        $("#actualizar").addClass("d-none");
        $("#PPHeader").addClass("d-none");
        // Quitar clase PPselected de todas las filas
        $('#PlanProduccion tbody tr').find('td').removeClass('PPselected');
        // Quitar el ícono de flecha derecha de todas las filas
        $('#PlanProduccion tbody tr').find('td:first-child .fa-arrow-right').remove();
    }
    //Reordenar configuracion PP
    ReordenarConfigPP() {

    }

    //Trae los nombres de las lineas
    async GetNameLineas() {
        try {
            let urlnamelineas = $('body').attr("nombrelineasT");

            const response = await $.ajax({
                url: urlnamelineas,
                type: 'POST',
                dataType: 'JSON',
            });
            if (response.Status == "OK") {
                let nombreLineas = JSON.parse(response.Data);
                console.log(nombreLineas);


                // Separar numéricos y no numéricos
                const numericos = [];
                const noNumericos = [];

                nombreLineas.forEach(item => {
                    if (/^\d+$/.test(item.Linea)) { // Si es un número puro
                        numericos.push(item);
                    } else {
                        noNumericos.push(item);
                    }
                });

                // Ordenar los numéricos por valor numérico
                numericos.sort((a, b) => Number(a.Linea) - Number(b.Linea));

                // Ordenar los no numéricos por longitud del string
                noNumericos.sort((a, b) => a.Linea.length - b.Linea.length);

                // Unir ambos arreglos
                nombreLineas = [...numericos, ...noNumericos];


                let Lineas = "";
                $("#NombreLineas").empty();
                $.each(nombreLineas, function (index, item) {

                    let sizecol = "col-3";

                    if (item.Linea.length > 11) sizecol = "col-4"


                    Lineas += `
                    <div class="form-check lineas-check ${sizecol}">
                      <input type="checkbox" class="form-check-input anycheck nombrelineas"
                      lineas="${item.Linea}">
                      <label class="form-check-label">${item.Linea}</label>
                    </div>`;

                });

                $("#NombreLineas").append(Lineas);


            }

            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();

        }
    }
}

LayoutCs.validarUsuario("Planeaci\u00F3n");

//Instancia de clase
const ConsultaPlanProduccionCs = new ConsultaPlanProduccion();
// Función para manejar el envío del formulario
//function ValidacionFormularios(event) {
//    // Validar el formulario
//    if (this.checkValidity() === false) {
//        event.preventDefault();
//        event.stopPropagation();
//    } else {
//        event.preventDefault();
//        event.stopPropagation();
//    }

//    // Añadir la clase 'was-validated' para activar los estilos de validación
//    $(this).addClass('was-validated');
//}

function ValidacionFormularios(event) {
    // Validar el formulario
    if (this.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
    } else {
        event.preventDefault();
        event.stopPropagation();
        switch ($(event.currentTarget).attr("metodo")) {
            //Cuando se carga la pagina seleccionar a traves del modal
            case "FiltroFechaIni":
                ConsultaPlanProduccionCs.FI = $("#FIINI").val();
                ConsultaPlanProduccionCs.FF = $("#FFINI").val();
                break;
            // * Filtro normal
            case "FiltroFecha":
                ConsultaPlanProduccionCs.FI = $("#FI").val();
                ConsultaPlanProduccionCs.FF = $("#FF").val();
                break;
        }


        //Ejecutar la consulta
        ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("action");
        ConsultaPlanProduccionCs.table = ConsultaPlanProduccionCs.PlanesProduccion("TRUE");

        $("#FI").val(ConsultaPlanProduccionCs.FI);
        $("#FF").val(ConsultaPlanProduccionCs.FF);
    }

    // Añadir la clase 'was-validated' para activar los estilos de validación
    $(this).addClass('was-validated');
}

//EVENTOS
$(function () {
    // Validación de formularios
    $(document).on('submit', '.needs-validation', ValidacionFormularios);
    //Consultar los planes de producción(listado)
    ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("action");
    ConsultaPlanProduccionCs.table = ConsultaPlanProduccionCs.PlanesProduccion('TRUE');

    ConsultaPlanProduccionCs.GetNameLineas();

    //Al hacer click en cualquier fila de la tabla de PP
    $('#PlanProduccion tbody').on('click', 'tr.PP', function () {
        try {
            //Obtener url consulta
            ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("details");
            ConsultaPlanProduccionCs.rowdata = ConsultaPlanProduccionCs.table.row(this).data();
            ConsultaPlanProduccionCs.FolioPP = $(this).attr("folio"); //DOCENTRY
            ConsultaPlanProduccionCs.current_row = $(this);
            ConsultaPlanProduccionCs.row = ConsultaPlanProduccionCs.table.row(ConsultaPlanProduccionCs.current_row);

            // Quitar clase PPselected de todas las filas
            $('#PlanProduccion tbody tr').find('td').removeClass('PPselected');
            // Quitar el ícono de flecha derecha de todas las filas
            $('#PlanProduccion tbody tr').find('td:first-child .fa-arrow-right').remove();
            // Añadir clase PPselected a las celdas de la fila seleccionada
            $(this).find('td').addClass('PPselected position-relative');
            // Añadir ícono de flecha derecha a la primera celda de la fila seleccionada
            $(this).find('td:first-child').append('<i class="fas fa-arrow-right iconPPselected"></i>');

            if (ConsultaPlanProduccionCs.row.child.isShown()) {
                ConsultaPlanProduccionCs.row.child.hide();
                ConsultaPlanProduccionCs.current_row.removeClass('shown');
            }
            else {
                //realizar peticion para obtener detalles del plan de produccion
                ConsultaPlanProduccionCs.PlanesProduccionDetails();
            }
        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No es posible obtener los detalles de el plan de producción, por favor contacte al administrador del sistema con el siguiente código de error: " + error);
            StopLoading();

        }
    });

    //PASO SIGUIENTE -> BOTON SIGUIENTE
    $("#actualizar").on("click", function (e) {
        try {
            //Consultar los planes de producción
            ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("update");
            //Si algo fue modificado
            if (ConsultaPlanProduccionCs.historymodified != "Cambió: ") {
                $('.sendOF').each(function () {
                    // Encuentra la fila (tr) que contiene el checkbox
                    const fila = $(this).closest('tr');

                    // Crea un objeto vacío para almacenar los valores de la fila
                    let filaData = {};

                    // 1. Manejar el checkbox que está en la primera celda
                    const procesarOF = $(this);

                    //Validar que tenga fecha de entrega de lo contrario no puede ser creada la OF
                    let IdLinea = procesarOF.data('linea');
                    ConsultaPlanProduccionCs.hasfechaentrega = $(`#PPDetails${IdLinea} tbody tr`).filter(function () {
                        var celda = $(this).find('td.FechaEntrega').text().trim(); // Obtener el valor de la celda con clase "linea"
                        return celda === ''; // Filtrar celdas vacías o no numéricas
                    });

                    ConsultaPlanProduccionCs.hasfechaentrega = ConsultaPlanProduccionCs.hasfechaentrega.length > 0 ? false : true;

                    if (ConsultaPlanProduccionCs.hasfechaentrega == false) {
                        return false; // Esto rompe el bucle completo
                    }
                    else {

                        filaData["DocEntry"] = procesarOF.val(); // Obtener el valor del checkbox
                        filaData["OrdenFabricacion"] = procesarOF.is(':checked') ? "TRUE" : "FALSE"; // Si está marcado o no

                        // Recorre cada celda dentro de la fila
                        fila.find('td[data-name]').each(function () {
                            // Obtén el nombre de la propiedad desde el atributo data-name
                            const key = $(this).data('name');

                            // Obtén el valor de la celda
                            const value = $(this).text();

                            // Asigna el valor a la clave en el objeto filaData
                            filaData[key] = value;
                        });

                        // Añade el objeto al array de resultados
                        ConsultaPlanProduccionCs.modifieddata.push(filaData);
                    }
                });
                if (ConsultaPlanProduccionCs.hasfechaentrega == false) {
                    LayoutCs.Alerta("Plan de producción", "Se debe indicar la fecha de entrega de cada orden.");
                }
                else {
                    //Actualizar el plan de produccion
                    ConsultaPlanProduccionCs.UpdatePlanProduction();
                }
            }
            else {
                LayoutCs.Alerta("Plan de producción", "Ningún dato ha cambiado, debes modificar algún dato para actualizar.");
            }
        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No fue posible actualizar el plan de producción, por favor intenta de nuevo mas tarde: " + error);
            StopLoading();

        }
    });
    //Bitacora de plan de produccion
    $('#PlanProduccion tbody').on('click', '.bitacoraPP', function (event) {
        //Detener la propagacion del evento hacia la fila
        event.stopPropagation();
        ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("bitacora");
        ConsultaPlanProduccionCs.FolioPP = $(this).attr("value");
        ConsultaPlanProduccionCs.BitacoraPlanProduccion();

    });

    //Visualizar la bitacora de produccion
    $('#BitacoraPP tbody').on('click', 'tr.BitacoraDetails', function () {
        try {
            ConsultaPlanProduccionCs.FolioPP = $(this).data("plan");
            ConsultaPlanProduccionCs.Revision = $(this).data("revision");
            ConsultaPlanProduccionCs.FechaRevision = $(this).data("fecha");
            ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("bitacoradetails");
            ConsultaPlanProduccionCs.BitacoraPlanProduccionDetails();

        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No es posible obtener los detalles de la revisión del plan de producción, por favor contacte al administrador del sistema con el siguiente código de error: " + error);
            StopLoading();

        }
    });

    $('#BitacoraDetalle').on('hide.bs.modal', function (e) {
        $("#Bitacora").modal("toggle");
    });

    $("#DescargarBitacora").on("click", function () {
        try {
            let folio = $("#folioRevision").text();
            let revision = $("#Revision").text();
            LayoutCs.ExportarExcelExcelJS("BitacoraDetailsList", folio, revision, "Revisión Bitácora Plan Producción");
        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No es posible descargar la bitácora, por favor contacte al administrador del sistema con el siguiente código de error: " + error);
            StopLoading();

        }
    });

    //Configurar el listado del plan de produccion
    $("#edicionPP").on("click", function () {
        //Configuracion del plan de produccion por usuario
        ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("configuracion");
        ConsultaPlanProduccionCs.ConfigxUsuarioPP("true");
    });
    //Guardar configuración de el plan de produccion
    $("#GuardaConfigPP").on("click", function () {
        try {
            //Limpiar variables
            ConsultaPlanProduccionCs.configuracionPP = {};

            $('.configuracionbyPP').each(function (index) {
                // Obtén el id del checkbox y usa limpiarTexto para quitar acentos y espacios
                let id = LayoutCs.limpiarTexto(this.id);

                // Asigna el id como clave y el valor "SI" o "NO" como valor
                ConsultaPlanProduccionCs.configuracionPP[id] = { "Visible": this.checked ? "SI" : "NO", "Orden": (index + 1) };

            });

            ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("updateconfiguracion");
            ConsultaPlanProduccionCs.InsertaConfigxUsuarioPP();
        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No fue posible actualizar la configuración para el plan de producción, por favor intenta de nuevo mas tarde: " + error);
            StopLoading();

        }
    });
    //Seleccionar todas las columnas para el listado del detalle del plan
    $('#selectAll').on('change', function () {
        var isChecked = $(this).is(':checked');
        $('input[type="checkbox"].configuracionbyPP').prop('checked', isChecked);
    });

    // Evita que el checkbox interrumpa el arrastre
    $("#configuracionPPContainer .form-check").on("mousedown", function (e) {
        e.stopPropagation(); // Evita conflictos con sortable
    });

    //Al seleccionar las lineas
    $(document).on("click", ".nombrelineas", function () {
        // Obtener los atributos 'series' de los checkboxes seleccionados como un array de números
        ConsultaPlanProduccionCs.NombresLineas = $('.nombrelineas:checked').map(function () {
            return $(this).attr('lineas'); // Convertir a número entero
        }).get().join(","); // Obtener el array puro

        ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("action");
        ConsultaPlanProduccionCs.table = ConsultaPlanProduccionCs.PlanesProduccion("TRUE");

    });
});
