class ConsultaPlanesFinales {
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
                                <table id="{id}" class="table table-preview table-striped m-0" style="table-layout:fixed">
                                <thead>
                                <tr>
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
        this.ExcludeColumsPP = ["DocEntry", "id", "folio", "Autorizado", "AuthRepro", "NumRepro", "Orden"];
        this.ColumnsWithEdit = ["ComentariosExtras", "CantidadMetros", "Rollos"];
        this.ColumnsWithEditTime = [];
        this.ColumnsWithEditDate = ["FechaEntrega"];
        this.ColumnsWithEditProduccion = ["EstatusProduccion"];
        this.NombresLineas = "";
        this.FI = "";
        this.FF = "";
    }
    //Listado de planes de produccion
    PlanesVentasFinales() {
        try {
            let table = $("#PlanesFinales").DataTable(
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
                            "Status": 0,
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
                                "data": "FechaCreacion" /* Linea */
                            },
                            {
                                "data": "TotalPedidos" /* Estatus Sap OF */
                            },
                            {
                                "data": "TotalAutorizados" /* Cantidad Kilos */
                            },
                            {
                                "data": "TotalNoAutorizados" /* Articulo */
                            },
                            {
                                "data": "TotalClientes" /* Descripcion Articulo*/
                            },
                            {
                                "data": "TotalArticulos" /* Indica si se genera o no la OF */
                            },
                            {
                                "data": "TotalConCita" /* Num documento SAP OF */
                            },
                            {
                                "data": "TotalEntregaParcial" /* Estatus Sap OF */
                            },
                            {
                                "data": "TotalPiezasEntrega"
                            },
                        ],
                    columnDefs: [
                        { width: '150px', targets: '_all' },
                        { width: '250px', targets: [0, 1] },
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
    async PlanesVentasDetails() {
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
                    tabla: "PlanVentas"
                }
            });


            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                //Limpiar el contenedor
                $("#reportbyline").empty();
                //Obtener los datos
                let dataPP = JSON.parse(this.anydata.Data);
                let headerBitacora = JSON.parse(this.anydata.ExtraData);

                //this.previewdataPPT = JSON.parse(this.anydata.Other);
                //this.previewdataPP = this.mergeAndSortByOrden(dataPP, this.previewdataPPT);
                this.previewdataPP = dataPP;


                let columnasrestantes = "";
                let celdasrestantes = "";

                this.anydata = "";
                this.subtablelinedetails = this.subtablelinedetailsbody;

                $.each(this.previewdataPP, function (index, item) {
                    //Generar encabezado dinamicamente para el resto de columnas
                    if (index == 0) {

                        $.each(item, function (indexitem, itemdata) {


                            if (!ConsultaPFCs.ExcludeColumsPP.includes(indexitem)) {
                                let textoH = LayoutCs.SpaceByUppercase(indexitem);
                                let idH = indexitem;
                                columnasrestantes +=
                                    `<th id="${idH}" width="200">${textoH.toUpperCase()}</th>`;
                            }
                        });
                    }

                    //Resto de datos
                    //Saber si requiere edicion y de que tipo
                    let hasedit = "";
                    celdasrestantes = "";

                    //item.TiempoProduccion = LayoutCs.convertirHorasMinutos(item.TiempoProduccion);
                    // console.log(item.TiempoProduccion);

                    let first = 0;
                    ConsultaPFCs.anydata += `<tr id="rowppd${item.id}" idppd="${item.id}" document="${item.DocEntry}" Folio="${item.folio}" class="ui-sortable-handle pedidoVenta row${item.DocEntry}">`;

                    $.each(item, function (indexitem, itemdata) {
                        if (!ConsultaPFCs.ExcludeColumsPP.includes(indexitem)) {

                           

                            let idC = indexitem;
                            let data = itemdata;

                            if (indexitem == "HoraEntrega")
                                data = LayoutCs.parseHora(data);



                            celdasrestantes +=
                                `<td 
                                        class="${idC} "  
                                        data-id="${LayoutCs.SpaceByUppercase(idC)} Pedido: ${item.Pedido}" 
                                        data-name="${idC}">
                                        ${data}
                                    </td>`;
                        }
                    });


                    //Agregar celdas
                    ConsultaPFCs.anydata += celdasrestantes;
                    //Cerrar la fila
                    ConsultaPFCs.anydata += `</tr>`;
                });
                //Agregar las OV agrupadas por linea
                let idTabla = this.FolioPP.replace("-", "");

                ConsultaPFCs.subtablelinedetails = ConsultaPFCs.subtablelinedetails
                    .replace("{id}", ("PVFDetails" + idTabla))
                    .replace("{linea}", this.FolioPP)
                    .replace("{rows}", ConsultaPFCs.anydata)
                    .replace("{restheaders}", columnasrestantes)

                let tablaFinal = ConsultaPFCs.subtablelinedetails.trim()
               //console.log(tablaFinal);

                //Datos de encabezados

                //let headerPlan = headerBitacora[0];
                //$("#revisionPv").text(headerPlan.Revision);
                //$("#fecha-documentoPv").text(headerPlan.fecha);
                //$("#folioPv").text(headerPlan.folio);

                ////Numero de revision para excel
                //$("#DescargarPlanVentas").attr("revision", headerPlan.Revision);

                let headerPlan = headerBitacora[0] || {}; // Asegura que al menos sea un objeto vacío

                $("#revisionPv").text(headerPlan.Revision ?? "");
                $("#fecha-documentoPv").text(headerPlan.fecha ?? "");
                $("#folioPv").text(headerPlan.folio ?? "");

                // Número de revisión para excel
                $("#DescargarPlanVentas").attr("revision", headerPlan.Revision ?? "1"); // o el valor default que necesites


                $("#reportbyline").append(tablaFinal);
                //ConsultaPFCs.MakeTableEditableWithBitacora(("PVFDetails" + idTabla));
                //LayoutCs.enableRowSorting("PVFDetails" + idTabla, 1);

                this.idTablaSelected = "PVFDetails" + idTabla;

                $("#folioseleccionado").text(this.FolioPP);
                $("#actualizar").removeClass("d-none");
                $("#PPHeader").removeClass("d-none");
                $("#PPHeaderTitle").addClass("d-none");
                $("#ContenedorBtnExcel").removeClass("d-none");


            }
            else {
                LayoutCs.Alerta("Plan de producción", this.anydata.Message + " si agregaste líneas en blanco no olvides dar click en actualizar para que sea guardado el registro correctamente.");
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible consultar el plan de produccion: " + error, "Plan de producción");
            StopLoading();

        }
    }
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

                //Vefiricar si esta en proceso
                let faltaProducir = this.DetailsOV.some((e) => parseInt(e.PiezasProducidas) < parseInt(e.Rollos))
                let headPP = "";

                if (faltaProducir)
                    headPP =
                        `
                        <th> 
                            <i class="fa-solid fa-arrows-turn-right"></i>
                            Piezas Producidas
                        </th>
                    `
                //Verificar si ya esta completo "en Stock"
                let completo = this.DetailsOV.some((e) => parseInt(e.PiezasProducidas) >= parseInt(e.Rollos))
                let headStock = "";

                if (completo)
                    headStock =
                        `
                        <th>
                          <i class="fa-solid fa-arrows-turn-right"></i>
                            Stock Actual
                        </th>
                    `

                this.subtabledetails = `<table class="table table-preview table-striped subtable w-75 m-2 ovdetails">
                                <thead>
                                ${headPP}
                                <th>
                                 <i class="fa-solid fa-arrows-turn-right"></i>
                                  Número de artículo
                                 </th>
                                 <th>
                                 <i class="fa-solid fa-arrows-turn-right"></i>
                                  Descripción del artículo
                                 </th>
                                 ${headStock}
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

                    let filaPP = "";
                    let filaC = "";

                    if (faltaProducir)
                        filaPP =
                            `
                       <td class="colspan-td">
                            <i
                            data-pedido="${item.Pedido}"
                            data-folio="${item.folio}"
                           class="bi bi-arrow-up-right-square-fill btnPP" style="color: #FFFFF;"></i>
                            ${parseInt(item.PiezasProducidas)} / ${parseInt(item.Rollos)}
                       </td>
                       `
                    if (completo)
                        filaC =
                            `
                           <td class="colspan-td">
                                ${item.StockTotal}
                           </td>
                       `

                    ConsultaPFCs.subtabledetails += `<tr>
                                                            ${filaPP}
                                                         <td class="colspan-td">${item.Articulo}</td>
                                                         <td class="colspan-td">${item.DescripcionArticulo}</td>
                                                         ${filaC}
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


                    $('td[colspan]').addClass('colspan-background');

                });

                this.subtabledetails += `</tbody>
                                         </table>`;

                $(`.row${this.DocEntry}`).after(
                    `
                       <tr id="row${this.DocEntry}child">
                       <td style="position:relative; border:none;">
                        ${this.subtabledetails}
                       </td>
                       </tr>
                    `)

            }
            else {
                LayoutCs.Alerta("Monitor de logística", this.response.Message);
            }

            StopLoading();

        } catch (error) {
            LayoutCs.Excepcion(error, "Monitor de logística");
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
                ConsultaPFCs.historymodified = "";
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
                $.each(ConsultaPFCs.extradata, function (index, item) {

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
                $.each(ConsultaPFCs.response, function (index, item) {
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

            if (cellName && !ConsultaPFCs.historymodified.includes(cellName)) {
                ConsultaPFCs.historymodified += cellName + "\n";
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
        ConsultaPFCs.anydata = "";
        $.each(datos, function (index, item) {
            ConsultaPFCs.anydata += `<tr>
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
        $("#BitacoraDetailsList tbody").append(ConsultaPFCs.anydata);
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
        $('#PlanesFinales tbody tr').find('td').removeClass('PPselected');
        // Quitar el ícono de flecha derecha de todas las filas
        $('#PlanesFinales tbody tr').find('td:first-child .fa-arrow-right').remove();
    }
    //Reordenar configuracion PP
    ReordenarConfigPP() {

    }

    mergeAndSortByOrden(previewdataPP, previewdataPPT) {
        const existingIds = new Set(previewdataPP.map(item => item.id));

        const nuevosRegistros = previewdataPPT.filter(item => !existingIds.has(item.id));

        // Agrega los nuevos elementos
        const merged = [...previewdataPP, ...nuevosRegistros];

        // Ordena por el campo 'Orden' (conversión por si vienen como string)
        merged.sort((a, b) => Number(a.Orden) - Number(b.Orden));

        return merged;
    }

}

LayoutCs.validarUsuario("Ventas");

//Instancia de clase
const ConsultaPFCs = new ConsultaPlanesFinales();
// Función para manejar el envío del formulario

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
                ConsultaPFCs.FI = $("#FIINI").val();
                ConsultaPFCs.FF = $("#FFINI").val();
                break;
            // * Filtro normal
            case "FiltroFecha":
                ConsultaPFCs.FI = $("#FI").val();
                ConsultaPFCs.FF = $("#FF").val();
                break;
        }


        //Ejecutar la consulta
        ConsultaPFCs.action = $("#PlanesFinales").attr("action");
        ConsultaPFCs.table = ConsultaPFCs.PlanesVentasFinales("TRUE");

        $("#FI").val(ConsultaPFCs.FI);
        $("#FF").val(ConsultaPFCs.FF);
    }

    // Añadir la clase 'was-validated' para activar los estilos de validación
    $(this).addClass('was-validated');
}

//EVENTOS
$(function () {
    // Validación de formularios
    $(document).on('submit', '.needs-validation', ValidacionFormularios);
    //Consultar los planes de producción(listado)
    ConsultaPFCs.action = $("#PlanesFinales").attr("action");
    ConsultaPFCs.table = ConsultaPFCs.PlanesVentasFinales('TRUE');


    //Al hacer click en cualquier fila de la tabla de PP
    $('#PlanesFinales tbody').on('click', 'tr.PP', function () {
        try {
            //Obtener url consulta
            ConsultaPFCs.action = $("#PlanesFinales").attr("details");
            ConsultaPFCs.rowdata = ConsultaPFCs.table.row(this).data();
            ConsultaPFCs.FolioPP = $(this).attr("folio"); //DOCENTRY
            ConsultaPFCs.current_row = $(this);
            ConsultaPFCs.row = ConsultaPFCs.table.row(ConsultaPFCs.current_row);

            // Quitar clase PPselected de todas las filas
            $('#PlanesFinales tbody tr').find('td').removeClass('PPselected');
            // Quitar el ícono de flecha derecha de todas las filas
            $('#PlanesFinales tbody tr').find('td:first-child .fa-arrow-right').remove();
            // Añadir clase PPselected a las celdas de la fila seleccionada
            $(this).find('td').addClass('PPselected position-relative');
            // Añadir ícono de flecha derecha a la primera celda de la fila seleccionada
            $(this).find('td:first-child').append('<i class="fas fa-arrow-right iconPPselected"></i>');

            if (ConsultaPFCs.row.child.isShown()) {
                ConsultaPFCs.row.child.hide();
                ConsultaPFCs.current_row.removeClass('shown');
            }
            else {
                //realizar peticion para obtener detalles del plan de produccion
                ConsultaPFCs.PlanesVentasDetails();
            }
        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No es posible obtener los detalles de el plan de producción, por favor contacte al administrador del sistema con el siguiente código de error: " + error);
            StopLoading();

        }
    });


    $(document).on('click', 'tr.pedidoVenta', function (event) {
        try {

            let DocEntryOV = $(this).attr("document"); //DOCENTRY

            //Para pedidos de contenedores
            if (/[a-zA-Z]/.test(DocEntryOV)) {
                return;
            }

            // Evitar evento cuando se da click a una celda que se pueda editar
            if ($(event.target).closest('td.editMe, td.TimeField, td.inEdit').length) {
                return; // Detiene la ejecución del evento
            }

            //Obtener url consulta
            ConsultaPFCs.ovdetails = $("#PlanesFinales").attr("ovdetails");

            ConsultaPFCs.DocEntry = DocEntryOV //DOCENTRY
            let isShow = $(this).attr("isShowChild");



            if (isShow == "1") {
                $(`#row${ConsultaPFCs.DocEntry}child`).remove();
                // Quitar clase PPselected de todas las filas
                $('#reportbyline tbody tr').find('td').removeClass('OVselected');
                // Quitar el ícono de flecha derecha de todas las filas
                $('#reportbyline tbody tr').find('td:first-child .fa-arrow-right').remove();

                $(this).attr("isShowChild", "0");
            }
            else {
                //realizar peticion para obtener detalles
                ConsultaPFCs.OVDetail();
                // Quitar clase PPselected de todas las filas
                $('#reportbyline tbody tr').find('td').removeClass('OVselected');
                // Quitar el ícono de flecha derecha de todas las filas
                $('#reportbyline tbody tr').find('td:first-child .fa-arrow-right').remove();
                // Añadir clase PPselected a las celdas de la fila seleccionada
                $(this).find('td').addClass('OVselected position-relative');
                // Añadir ícono de flecha derecha a la primera celda de la fila seleccionada
                $(this).find('td:first-child').append('<i class="fas fa-arrow-right iconOVselected"></i>');
                $(this).attr("isShowChild", "1");

            }


        }
        catch (error) {
            LayoutCs.Alerta("Monitor de logística", "No es posible obtener los detalles de la OV, por favor contacte al administrador del sistema con el siguiente código de error: " + error);
        }
    })


    //Bitacora de plan de produccion
    $('#PlanesFinales tbody').on('click', '.bitacoraPP', function (event) {
        //Detener la propagacion del evento hacia la fila
        event.stopPropagation();
        ConsultaPFCs.action = $("#PlanesFinales").attr("bitacora");
        ConsultaPFCs.FolioPP = $(this).attr("value");
        ConsultaPFCs.BitacoraPlanProduccion();

    });

    //Visualizar la bitacora de produccion
    $('#BitacoraPP tbody').on('click', 'tr.BitacoraDetails', function () {
        try {
            ConsultaPFCs.FolioPP = $(this).data("plan");
            ConsultaPFCs.Revision = $(this).data("revision");
            ConsultaPFCs.FechaRevision = $(this).data("fecha");
            ConsultaPFCs.action = $("#PlanesFinales").attr("bitacoradetails");
            ConsultaPFCs.BitacoraPlanProduccionDetails();

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

   
    //Guardar configuración de el plan de produccion
    $("#GuardaConfigPP").on("click", function () {
        try {
            //Limpiar variables
            ConsultaPFCs.configuracionPP = {};

            $('.configuracionbyPP').each(function (index) {
                // Obtén el id del checkbox y usa limpiarTexto para quitar acentos y espacios
                let id = LayoutCs.limpiarTexto(this.id);

                // Asigna el id como clave y el valor "SI" o "NO" como valor
                ConsultaPFCs.configuracionPP[id] = { "Visible": this.checked ? "SI" : "NO", "Orden": (index + 1) };

            });

            ConsultaPFCs.action = $("#PlanesFinales").attr("updateconfiguracion");
            ConsultaPFCs.InsertaConfigxUsuarioPP();
        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No fue posible actualizar la configuración para el plan de producción, por favor intenta de nuevo mas tarde: " + error);
            StopLoading();

        }
    });
  

    

});
