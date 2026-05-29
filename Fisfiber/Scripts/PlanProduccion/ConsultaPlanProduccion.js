class ConsultaPlanProduccion {
    constructor() {
        // * Atributos para guardar los datos de la lista de las ordenes de venta agrupados por linea
        this.subtablelinedetailsbody = `<div class="card">
                                                <div class="card-body ReportHeader">
                                                    <div class="row justify-content-end align-items-center" >
                                                        <div class="col-7 text-center">
                                                            <div class="text-center pt-3">
                                                                <span class="ps-2">
                                                                    PLAN DE PRODUCCIÓN LÍNEA {linea}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div class="col-3 text-center" >
                                                                <div class="alert-primary col-12 mb-1 pt-2" style="height:30%;" role="alert">
                                                                  Capacidad en horas : <label class="bold" id="horasCap">{horas}</label>
                                                                </div>
                                                                 <div class="alert-success col-12 pt-2" style="height:30%;" role="alert">
                                                                   Metros en proceso/terminados : <label class="bold" id="metrosCap" >{metros}</label>
                                                                </div>
                                                        </div>
                                                       
                                                        
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row m-0 pb-4">
                                <div class="col-md-12 p-0 body-table table-scroll">
                                <table id="{id}" class="table table-preview table-striped m-0 tableReport" style="table-layout:fixed">
                                <thead>
                                <tr>
                                <th class="d-none" width="200">Generar</th>
                               
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
            "NumCaidas", "Velocidad", "SumCap", "TP",
            "RollosSAP", "CantidadMetrosSAP", "CantidadKilosSAP", "Folio", "OrdenFabricacion1", "EstatusProduccion",
            "Especificacion", "Orden", "IdPPD",
            "fecha", "DocEntry", "GenerarOF",
            "EstatusSapOF", "FlagOrdenFabricacion", "Especificacion", "Prioridad", "EsDiaAnterior"
        ];
        this.ColumnsWithEdit = ["Comentarios", "ComentariosExtras", "Rollos"];
        this.ColumnsWithEditTime = [];
        this.ColumnsWithEditDate = ["FechaEntrega"];
        this.ColumnsWithEditProduccion = ["EstatusProduccion", "StatusProduccion"];

        this.ListNoGeneradas = [];
        this.NombresLineas = "";
        this.LineasValidas = [];
        this.htmlLineasValidas = "";
        this.CapacidadLinea = "";
        this.SumPiezasP = 0;
        this.SumCapLH = 0;
        this.showCapL = 1;
        this.IdPPDOverflow = [];
        this.newRowsTR = [];
        this.filasMuestra = [];
        this.whitelinealreadysaved = false;
        this.TiempoParoDiaActual = "";

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
                            "lineas": this.NombresLineas
                        },
                        "beforeSend": function () {
                            //Loading(); // Mostrar el indicador de carga
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
                                    return `<i value="${row.Folio}" data-toggle="tooltip" data-placement="top" data-linea="${row.Linea}" title="Paro de línea ${row.Linea}" class="fs-4 fa-solid fa-circle-stop ParoLineaPP"></i>`;
                                }
                            }
                        ],
                    columnDefs: [
                        { visible: false, targets: [3, 4, 5, 6, 7, 8, 9] }, // Oculta la columna con índice 8 (la del render)
                        { width: '210px', targets: '_all' }

                        //{ visible: true, width: '250px', targets: '_all' }
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
                        $(row).attr("linea", data.Linea);

                        // Si el estatus no es 1 ni 2, aplicamos clase fila-en-paro
                        if ((data.ParoEstatus === 1 || data.ParoEstatus === 2)) {
                            $(row).addClass('fila-en-paro');
                        }
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

            ConsultaPlanProduccionCs.ListNoGeneradas = [];
            ConsultaPlanProduccionCs.IdPPDOverflow = [];
            ConsultaPlanProduccionCs.SumPiezasP = 0;

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
                                    let idH = indexitem;
                                    if (indexitem == "StatusProduccion") {
                                        textoH = "Estatus Produccion"
                                        idH = "EstatusProduccion"
                                    }

                                    if (indexitem == "Folio1") {
                                        textoH = "Folio"
                                        idH = "Folio"
                                    }



                                    columnasrestantes += `<th id="${idH}" width="200">${textoH.toUpperCase()}</th>`;
                                }
                            });
                        }


                        //Si la orden no ha sido enviada, tener la opcion de crear
                        let shouldbechecked = (item.OrdenFabricacion == '' ? "" : "checked disabled");
                        let shouldbeshowed = (item.OrdenFabricacion == '' ? "" : "checked disabled");
                        let NA = (item.FlagOrdenFabricacion != "N/A" ? "" : "N/A");
                        let showcheckbox = (NA == "N/A" ? "d-none" : "");
                        let paddingcontainer = (NA == "N/A" ? "p-0" : "");
                        //let GenerarOF = (item.OrdenFabricacion == "" ? "NO" : "SI");
                        let GenerarOF = (item.OrdenFabricacion == "" ? "NO" : item.GenerarOF);
                        GenerarOF = (NA == "N/A" ? "N/A" : GenerarOF);

                        //Color Warning
                        let warning = ""
                        if (item.GenerarOF == "SI" && item.EstatusSapOF != "en cola" && item.OrdenFabricacion == '') {
                            warning = "bg-danger text-white"
                        }

                        if (shouldbechecked == '')
                            ConsultaPlanProduccionCs.ListNoGeneradas.push(item.DocEntry);

                        ConsultaPlanProduccionCs.anyvar = `
                            <div class="form-check ${paddingcontainer}"> 
                                <label class="form-label">${NA}</label>
                                <input value="${item.DocEntry}" 
                                    data-linea="${item.Linea}" 
                                    type="checkbox" ${shouldbechecked} 
                                    class="form-check-input anycheck sendOF ${showcheckbox}"></div>`;
                        ConsultaPlanProduccionCs.anydata += `<tr id="rowppd${item.IdPPD}" sumcap="${item.SumCap}" class="ui-sortable-handle">`;


                        ConsultaPlanProduccionCs.anydata +=
                            `<td style="position:relative;" class="d-none generarof" data-idppd="${item.IdPPD}">${ConsultaPlanProduccionCs.anyvar}</td>`;


                        //Resto de datos
                        //Saber si requiere edicion y de que tipo
                        let hasedit = "";
                        celdasrestantes = "";


                        if (
                            item.SumCap >= ConsultaPlanProduccionCs.CapacidadLinea
                        ) {
                            ConsultaPlanProduccionCs.IdPPDOverflow.push(item.IdPPD);
                        }

                        item.TiempoProduccion = LayoutCs.convertirHorasMinutos(item.TiempoProduccion);

                        //ConsultaPlanProduccionCs.SumPiezasP +=
                        //    (item.PiezasProducidas != '') ?
                        //        parseFloat(item.PiezasProducidas) :
                        //        0;

                        if (item.EstatusProduccion == 'en proceso' || item.EstatusProduccion == 'terminado') {
                            ConsultaPlanProduccionCs.SumPiezasP += parseFloat(item.CantidadMetros.replace(',', ''));
                            ConsultaPlanProduccionCs.SumCapLH += parseFloat(item.TP);
                        }

                        // console.log(item.TiempoProduccion);

                        item.StatusProduccion = item.EstatusProduccion
                        item.OrdenFabricacion = item.OrdenFabricacion1

                        let isYesterday = item.EsDiaAnterior == 1;

                        let first = 0;

                        $.each(item, function (indexitem, itemdata) {
                            if (!ConsultaPlanProduccionCs.ExcludeColumsPP.includes(indexitem)) {

                                //editMe
                                if (ConsultaPlanProduccionCs.ColumnsWithEdit.includes(indexitem)) {
                                    hasedit = "editMe";
                                }
                                //TimeEdit
                                else if (ConsultaPlanProduccionCs.ColumnsWithEditTime.includes(indexitem)) {
                                    hasedit = "TimeField";
                                }
                                //DateEdit
                                else if (ConsultaPlanProduccionCs.ColumnsWithEditDate.includes(indexitem)) {
                                    hasedit = "DateField";
                                }
                                ////Estatus Produccion Edit
                                else if (ConsultaPlanProduccionCs.ColumnsWithEditProduccion.includes(indexitem)
                                    && itemdata != 'terminado') {
                                    hasedit = "EstatusProduccionData";
                                }
                                else if (indexitem === "Linea") {
                                    hasedit = "editLinea"
                                }
                                else {
                                    hasedit = "";
                                }


                                let idC = indexitem;

                                let grayColor = "", position = "", clock = "";

                                if (indexitem == "StatusProduccion") {
                                    idC = "EstatusProduccion"
                                }

                                if (indexitem == "Folio1") {
                                    idC = "Folio"
                                }

                                //Pinta de color gris la celda, sí es de hoy o ayer el pedido.
                                if (isYesterday) {
                                    grayColor = "background-color: lightgray; box-shadow: none;";
                                }

                                //Se coloca el reloj para los que estan retrasados, solo al primer elemento de la celda.
                                if (first == 0 && isYesterday) {
                                    position = "position-relative";
                                    clock = "<i class='bi bi-alarm-fill icontimerow' style='left:8%;'></i>";
                                    first++;
                                }

                                celdasrestantes += `<td class="${idC} ${hasedit} ${position} " style="${grayColor}"  data-id="${LayoutCs.SpaceByUppercase(idC)} ${linea} Pedido: ${item.Pedido}" data-name="${idC}">
                                ${GenerarOF === "N/A" && idC === "EstatusProduccion" ? "N/A" : itemdata}
                                ${clock} 
                                </td>`;
                            }
                        });


                        //Agregar celdas
                        ConsultaPlanProduccionCs.anydata += celdasrestantes;
                        //Cerrar la fila
                        ConsultaPlanProduccionCs.anydata += `</tr>`;
                    });

                    linea = linea.replaceAll(" ", "").trim();

                    //Agregar las OV agrupadas por linea
                    ConsultaPlanProduccionCs.subtablelinedetails = ConsultaPlanProduccionCs.subtablelinedetails
                        .replace("{id}", ("PPDetails" + linea))
                        .replace("{linea}", linea)
                        .replace("{rows}", ConsultaPlanProduccionCs.anydata)
                        .replace("{restheaders}", columnasrestantes)
                        .replace("{metros}", ConsultaPlanProduccionCs.SumPiezasP)
                        .replace("{horas}", ConsultaPlanProduccionCs.CapacidadLinea)
                    //.replace("{horas}", ConsultaPlanProduccionCs.SumCapLH.toFixed(2) )


                    $("#reportbyline").append(ConsultaPlanProduccionCs.subtablelinedetails.trim());
                    ConsultaPlanProduccionCs.MakeTableEditableWithBitacora(("PPDetails" + linea));
                    LayoutCs.enableRowSorting("PPDetails" + linea, 1);


                });



                $("#folioseleccionado").text(this.FolioPP);
                $("#actualizar").removeClass("d-none");
                $("#PPHeader").removeClass("d-none");
                $("#PPHeaderTitle").addClass("d-none");

                if (ConsultaPlanProduccionCs.extradata.length > 0) {
                    //Detales encabezado plan produccion
                    $("#fecha-liberacion,#fecha-revision,#fecha-documento").text(ConsultaPlanProduccionCs.extradata[0].fecha);
                    $("#revision").text(ConsultaPlanProduccionCs.extradata[0].Revision + " ACTUALIZADA");
                    $("#folio").text(ConsultaPlanProduccionCs.extradata[0].folio + "-" + ConsultaPlanProduccionCs.extradata[0].Revision);

                }

                //$("#capacidadL").text(ConsultaPlanProduccionCs.CapacidadLinea);

                //Ocultar celdas y columnas que no son visibles de acuerdo a la configuracion
                $.each(this.otherdata, function (index, item) {
                    //OCULTAR COLUMNA Y CELDA
                    if (item.Visible == "NO") {
                        let DOMelementML = LayoutCs.limpiarTexto(item.ColumnName);
                        $(`#${DOMelementML}`).addClass("d-none");
                        $(`.${DOMelementML}`).addClass("d-none");
                    }

                });

                if (ConsultaPlanProduccionCs.showCapL == 1) {
                    ConsultaPlanProduccionCs.showCapLineaPlan(1);
                }
                else {
                    ConsultaPlanProduccionCs.hideCapLineaPlan(1);
                }
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
    //Pintar Sobre Capacidad 
    showCapLineaPlan(loader = 0) {
        //rowppd
        //let devAlert = $("#horasCap").closest("div");
        //let devAlertMC = $("#metrosCap").closest("div");

        if (loader == 0)
            Loading();

        //console.log(ConsultaPlanProduccionCs.IdPPDOverflow);

        if (ConsultaPlanProduccionCs.IdPPDOverflow.length > 0) {
            $("#horasCap").closest("div").removeClass("alert-primary").addClass("alert-danger");
            ConsultaPlanProduccionCs.IdPPDOverflow.forEach((c) => {
                $(`#rowppd${c} td`).addClass("bg-alert");
            });
            $("#metrosCap").closest("div").removeClass("alert-success").addClass("alert-danger");
        }


        //devAlert.show();
        //devAlertMC.show();

        $("#horasCap").closest("div").show();
        $("#metrosCap").closest("div").show();

        ConsultaPlanProduccionCs.showCapL = 1;

        if (loader == 0)
            StopLoading();
    }

    //Pintar Sobre Capacidad 
    hideCapLineaPlan(loader = 0) {
        //rowppd
        //console.log(ConsultaPlanProduccionCs.IdPPDOverflow);

        if (loader == 0)
            Loading();
        //let devAlert = $("#horasCap").closest("div");
        //let devAlertMC = $("#metrosCap").closest("div");
        $(".tableReport tbody tr td").removeClass("bg-alert");

        //devAlert.hide();
        //devAlertMC.hide();
        $("#horasCap").closest("div").hide();
        $("#metrosCap").closest("div").hide();
        ConsultaPlanProduccionCs.showCapL = 0;

        StopLoading();

    }

    getSumCapLineas() {
        $(".tableReport tbody tr").each(function () {
            let capl = $(this).attr("sumcap");
            capl = parseFloat(capl);

            let idppd = $(this).attr("id");
            idppd = idppd.replace("rowppd", "");
            idppd = parseInt(idppd);

            if (capl >= ConsultaPlanProduccionCs.CapacidadLinea) {
                ConsultaPlanProduccionCs.IdPPDOverflow.push(idppd);
            }
        });

        // console.log(ConsultaPlanProduccionCs.IdPPDOverflow);
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
                    "Tabla": "PlanProduccion",
                    "FilasM": JSON.stringify(this.filasMuestra)
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                this.ReiniciarPagina();
                LayoutCs.Alerta("Plan de producción", "Plan de producción actualizado correctamente.", "OK");
                ConsultaPlanProduccionCs.historymodified = "";
                ConsultaPlanProduccionCs.whitelinealreadysaved = true;
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


                    $("#configuracionPPContainer").append(`<div class="mb-1 align-self-start form-check">
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

        try {
       
        //Advanced editor
        var advancedEditor = new SimpleTableCellEditor(table, { navigation: false });
        //advancedEditor.SetEditableClass("editMe");
        advancedEditor.SetEditableClass("editMe", {
            internals: {
                renderEditor: (elem, oldVal) => {
                    // Crear un input sin espacios extra
                    $(elem).html(`<input type="text" class="form-control" value="${oldVal.trim()}">`);
                },
                extractEditorValue: (elem) => {

                    let valor = $(elem).find('input').val().trim();
                    const $td = $(elem);
                    const $tr = $td.closest('tr');


                    if ($(elem).hasClass("Rollos")) {
                        //console.log("Se edito rollos:");

                        let rollos = parseNumero(valor);

                        let mRollos = $tr.find("td.MetrosRollo").text();
                        mRollos = parseNumero(mRollos);

                        let cRollos = rollos * mRollos;

                        $tr.find("td.CantidadMetros").text(cRollos);

                        //console.log(cRollos);
                    }


                    return valor;
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

        //Obtener datos de estatus de produccion
        //this.urlaction = $("body").attr("estatusproduccion");
        //this.response = await LayoutCs.MakeAjaxRequest(this.urlaction, this.anydata);
        //this.anydata = JSON.parse(this.response.Data);
            //this.response = "";
        //this.anydata = [];
        let status = await this.GetStatusPro();
        //console.log("Respuesta AJAX:", status);
        this.anydata = status;

        LayoutCs.response = "";
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
                        return $(this).val().trim() == oldVal.trim();
                    }).prop('selected', true);



                },
                extractEditorValue: (elem) => { return $(elem).find('select').val(); },
            }
        });

        this.htmlLineasValidas = ""
        this.LineasValidas.forEach((e) => {
            this.htmlLineasValidas += `<option value="${e.Linea}">${e.Linea}</option>`
        })


        //Linea
        advancedEditor.SetEditableClass("editLinea", {
            internals: {
                renderEditor: (elem, oldVal) => {
                    $(elem).html(`<select class="form-select mt-2" aria-label="Prioridad">
                                 ${this.htmlLineasValidas}
                                </select>`);
                    $("select option").filter(function () {
                        return $(this).val().trim() == oldVal.trim();
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
        $("#" + table).on('change', '.editMe, .TimeField, .DateField,.EstatusProduccionData, .editLinea', function () {
            var cell = $(this).closest('td'); // Obtener la celda más cercana
            var cellName = cell.data('id'); // Asumiendo que existe un atributo 'data-id'
            var cellOldValue = cell.html();
            if (cellName && !ConsultaPlanProduccionCs.historymodified.includes(cellName)) {
                ConsultaPlanProduccionCs.historymodified += cellName + "\n";
            }

            //if (cell.hasClass("Rollos")) {
            //    //console.log("Se edito rollos:");
            //    let row = $(this).closest("tr");

            //    let rollos = row.find(".Rollos input").val();
            //    rollos = parseFloat(rollos.trim());

            //    let mRollos = row.find(".MetrosRollo").text();
            //    mRollos = parseFloat(mRollos);

            //    let cRollos = rollos * mRollos;

            //    row.find(".CantidadMetros").text(cRollos);

            //    //console.log(cRollos);
            //}
        });

        } catch (error) {
            console.error("Error en MakeTableEditableWithBitacora:", error);

            if (error?.responseText) {
                try {
                    console.error("Detalles del error:", JSON.parse(error.responseText));
                } catch {
                    console.error("Error responseText no es JSON:", error.responseText);
                }
            } else {
                console.error("Error genérico:", error);
            }
        }
    }

    async GetStatusPro() {
        try {
            let urlStatusPro = $("body").attr("estatusproduccion");

            //let urlnamelineas = $('body').attr("nombrelineasall");

            const response = await $.ajax({
                url: urlStatusPro,
                type: 'POST',
                dataType: 'JSON',
            });
            if (response.Status == "OK") {
                //console.log(response);
                let status = JSON.parse(response.Data);

                return status;
            }
            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
        }
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

        location.reload();

    }
    //Reordenar configuracion PP
    ReordenarConfigPP() {

    }

    async DeleteItemPlanDetails(idPPD, folio, orden) {
        try {
            //Datos de PP
            Loading();

            let urlDelete = $("#deleteRow").attr("deleteDetails");

            this.anydata = await $.ajax({
                url: urlDelete,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    idppd: idPPD,
                    Usuario: sessionStorage.getItem("email"),
                    Folio: folio,
                    Tabla: "PlanProduccion",
                    OF: orden

                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                $("#MenuContextDeleteRow").hide();
                $(`#rowppd` + idPPD).remove();
                LayoutCs.Alerta("Plan de producción", "La orden se elimino correctamente", "OK");
            }
            else if (this.anydata.Status == "N/A") {
                $("#MenuContextDeleteRow").hide();
                $(`#newrow` + idPPD).remove();
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.anydata.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible eliminar la orden de fabricación: " + error, "Plan de producción");
            StopLoading();

        }
    }

    //Validar si un checbox cambio
    changeGenerarOF() {
        const valoresMarcados = $(".anycheck.sendOF:checked").map(function () {
            return this.value;
        }).get();

        // console.log(valoresMarcados);
        //console.log(this.ListNoGeneradas);

        let existe = false;

        valoresMarcados.forEach((v) => {
            if (this.ListNoGeneradas.includes(v)) {
                existe = true;
                return;
            }
        });

        return existe;

    }

    //Trae los nombres de las lineas
    async GetNameLineas() {
        try {
            let urlnamelineas = $('body').attr("nombrelineasprod");
            //let urlnamelineas = $('body').attr("nombrelineasall");

            const response = await $.ajax({
                url: urlnamelineas,
                type: 'POST',
                dataType: 'JSON',
            });
            if (response.Status == "OK") {
                let nombreLineas = JSON.parse(response.Data);
                // console.log(nombreLineas);


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

                //this.LineasValidas = nombreLineas;
                this.htmlLineasValidas = "";
                //console.log(this.LineasValidas);

                let Lineas = "";
                $("#NombreLineas").empty();
                $.each(nombreLineas, function (index, item) {

                    let sizecol = "col-3";

                    //if (item.Linea.length > 3) sizecol = "col-4"


                    if (item.Linea.length > 11) sizecol = "col-6"


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

    

    //Trae los nombres de las lineas
    async GetNameAllLineas() {
        try {
            let urlnamelineas = $('body').attr("nombrelineasall");

            const response = await $.ajax({
                url: urlnamelineas,
                type: 'POST',
                dataType: 'JSON',
            });
            if (response.Status == "OK") {
                let nombreLineas = JSON.parse(response.Data);
                // console.log(nombreLineas);


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

                this.LineasValidas = nombreLineas;


            }

            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();

        }
    }

    //
    async GetCapLinea(linea) {
        try {
            let urlCapL = $('body').attr("capacidadlinea");

            const response = await $.ajax({
                url: urlCapL,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    "Linea": linea
                }
            });
            if (response.Status == "OK") {
                let nombreLineas = JSON.parse(response.Data);
                //console.log(nombreLineas[0].CapacidadLinea);
                ConsultaPlanProduccionCs.CapacidadLinea = nombreLineas[0].CapacidadLinea;
            }

            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();

        }
    }


    async GetTiempoParoProduccion(linea) {
        try {
            let urlCapL = $('body').attr("tiempoParoProduccion");

            const response = await $.ajax({
                url: urlCapL,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    "Linea": linea
                }
            });
            if (response.Status == "OK") {
                let TiempoParoxLinea = JSON.parse(response.Data);
                ConsultaPlanProduccionCs.TiempoParoDiaActual = TiempoParoxLinea[0].HorasDetenida;
            }

            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();

        }
    }

    //Calcular capacidad linea , menos paros
    async CapacidadHorasReal() {
        let CapacidadHoras = parseFloat(ConsultaPlanProduccionCs.CapacidadLinea);
        let HorasDetenida = parseFloat(ConsultaPlanProduccionCs.TiempoParoDiaActual);
        let CapacidadHorasFinal = CapacidadHoras - HorasDetenida;
        ConsultaPlanProduccionCs.CapacidadLinea = CapacidadHorasFinal;
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
}


LayoutCs.validarUsuario("Planeaci\u00F3n");


//Instancia de clase
const ConsultaPlanProduccionCs = new ConsultaPlanProduccion();

// Función para manejar el envío del formulario
function ValidacionFormularios(event) {
    // Validar el formulario
    if (this.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
    } else {
        event.preventDefault();
        event.stopPropagation();
    }

    // Añadir la clase 'was-validated' para activar los estilos de validación
    $(this).addClass('was-validated');
}

function parseNumero(valor) {
    if (!valor) return 0;

    // Quita comas de miles
    valor = valor.replace(/,/g, '');

    // Convierte a número flotante
    return parseFloat(valor);
}


function initHubParos(Email) {


    $.connection.hub.qs = {
        userId: Email
    }

    //Escuchando eventos con SinalR
    var hubParos = $.connection.parosHub;

    hubParos.client.updateParos = function (paro) {
        let dataParo = JSON.parse(paro);
        updateParos(dataParo[0]);
    };

    $.connection.hub.start().done(function () {
        console.log("SignalR conectado como:", Email);
    });

    $.connection.hub.reconnecting(function () {
        console.warn("SignalR reconectando... 🔄");
    });

    $.connection.hub.reconnected(function () {
        console.info("SignalR reconectado ✔");
        refrescarEstadoParos(); // 🔥 importante
    });

    $.connection.hub.disconnected(function () {
        console.error("SignalR desconectado ❌");

        // Reintento manual
        setTimeout(function () {
            $.connection.hub.start();
        }, 5000);
    });


    //END SinalR
}


function updateParos(paro) {
    console.log(`Paro en:`);
    console.log(paro);

    if (paro && ConsultaPlanProduccionCs.table) {
        ConsultaPlanProduccionCs.table.ajax.reload(null, false); // false = mantener página actual

        if (paro.Estatus == 'Terminado') {
            LayoutCs.Alerta("Paro cerrado", `El paro en linea: ${paro.Linea}, ha sido atendido: ${paro.Observaciones}`, "OK");
        }
        else {
            LayoutCs.Alerta("Nuevo paro", `Paro en linea: ${paro.Linea}, ${paro.MotivoReparacion}`, "Warning");
        }
        
    }

}

function refrescarEstadoParos () {
    ConsultaPlanProduccionCs.table.ajax.reload(null, false); // false = mantener página actual
}

//EVENTOS
$(function () {

    const User = sessionStorage.getItem("email");

    initHubParos(User);

    window.addEventListener("offline", function () {
        console.warn("Sin conexión a internet");
    });

    window.addEventListener("online", function () {
        console.log("Conexión restaurada");
        refrescarEstadoParos(); // 🔥 importante
        console.log("Reconciliando informacion")
    });


    // Validación de formularios
    $(document).on('submit', '.needs-validation', ValidacionFormularios);
    //Consultar los planes de producción(listado)

    ConsultaPlanProduccionCs.GetNameLineas();
    ConsultaPlanProduccionCs.GetNameAllLineas()
        .then(() => {
            ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("action");
            ConsultaPlanProduccionCs.table = ConsultaPlanProduccionCs.PlanesProduccion("FALSE");
        })
        .catch((error) => {
            StopLoading();
            console.error("Ocurrió un error:", error);
        });

    $(".EditRow").hide();
    $(".btnSave").hide();
    $(".btnEditHead").hide();

    if (LayoutCs.u_perfil == "Admin") {

        $(".btnEditHead").show();
        //Eventos para edicion de encabezado
        $(".editHead").on("click", function () {
            $(".EditRow").fadeIn().show();
            $(".headRow").fadeOut().hide();

            setTimeout(() => {
                $(".btnSave").fadeIn().show();
                $(this).fadeOut().hide();
            }, 500);
        });

        $(".btnSave").on("click", function () {
            //updateHeader

            let fl = $("#FL").val();
            let fr = $("#FR").val();
            let code = $("#Code").val();
            let nivel = $("#Nivel").val();
            let rev = $("#Revision").val();

            if (fl == "" || fr == "" || code == "") {
                LayoutCs.Alerta(
                    "Encabezado plan",
                    "Los valores no pueden ser vacios..",
                    "Warning"
                );

                return;
            }

            LayoutCs.updateHeaderISO("PlanPro", fl, fr, code, nivel, rev);
            //PlanEmbCs.updateHeader(fl, fr, code, nivel);
        });
    }
    else {
        //Eliminar elementos que no corresponden a usuario
        $(".EditRow").remove();
        $(".btnSave").remove();
        $(".btnEditHead").remove();
    }

    //Al hacer click en cualquier fila de la tabla de PP
    $('#PlanProduccion tbody').on('click', 'tr.PP', function (e) {
        try {
            //Obtener url consulta
            ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("details");
            ConsultaPlanProduccionCs.rowdata = ConsultaPlanProduccionCs.table.row(this).data();
            ConsultaPlanProduccionCs.FolioPP = $(this).attr("folio"); //DOCENTRY
            ConsultaPlanProduccionCs.current_row = $(this);
            ConsultaPlanProduccionCs.row = ConsultaPlanProduccionCs.table.row(ConsultaPlanProduccionCs.current_row);

            let Linea = $(this).attr("linea");
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
                //ConsultaPlanProduccionCs.GetCapLinea(Linea).then(
                //    () => ConsultaPlanProduccionCs.PlanesProduccionDetails()
                //        .then(() => {
                //            if (ConsultaPlanProduccionCs.showCapL == 1)
                //                ConsultaPlanProduccionCs.showCapLineaPlan(Linea)
                //        })
                //)

                ConsultaPlanProduccionCs.GetCapLinea(Linea).then(
                    () => ConsultaPlanProduccionCs.GetTiempoParoProduccion(Linea).then(() =>
                        ConsultaPlanProduccionCs.CapacidadHorasReal().then(() =>
                            ConsultaPlanProduccionCs.PlanesProduccionDetails()
                                .then(() => {
                                    if (ConsultaPlanProduccionCs.showCapL == 1)
                                        ConsultaPlanProduccionCs.showCapLineaPlan(Linea)
                                })
                        )
                    )
                );

                //console.log("Lista de docentrys que no tienen el check:")
                //console.log(ConsultaPlanProduccionCs.ListNoGeneradas);
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

            //Verificar si un checbox fue cambiado
            let nuevasFilas = $(".tableReport tbody tr.muestraOF").length > 0;

            //Si algo fue modificado
            if (ConsultaPlanProduccionCs.historymodified != "Cambió: " || nuevasFilas) {
                $('.sendOF').each(function (index) {
                    // Encuentra la fila (tr) que contiene el checkbox
                    const fila = $(this).closest('tr');


                    // Crea un objeto vacío para almacenar los valores de la fila
                    let filaData = {};

                    // 1. Manejar el checkbox que está en la primera celda
                    const procesarOF = $(this);

                    //Validar que tenga fecha de entrega de lo contrario no puede ser creada la OF
                    let IdLinea = procesarOF.data('linea');
                    ConsultaPlanProduccionCs.hasfechaentrega =
                        $(`#PPDetails${IdLinea} tbody tr`).filter(function () {
                            var excludecell = $(this).find('td.generarof').text().trim();
                            if (excludecell != "N/A") {
                                var celda = $(this).find('td.FechaEntrega').text().trim(); // Obtener el valor de la celda con clase "linea"
                                return celda === ''; // Filtrar celdas vacías
                            }
                        });

                    ConsultaPlanProduccionCs.hasfechaentrega = ConsultaPlanProduccionCs.hasfechaentrega.length > 0 ? false : true;

                    //if (ConsultaPlanProduccionCs.hasfechaentrega == false) {
                    //   // return false; // Esto rompe el bucle completo
                    //}
                    //else {

                    filaData["DocEntry"] = procesarOF.val(); // Obtener el valor del checkbox
                    filaData["OrdenFabricacion"] =
                        procesarOF.is(':checked') ? "TRUE" : (!procesarOF.hasClass("d-none") ? "FALSE" : "N/A"); // Si está marcado o no

                    // Recorre cada celda dentro de la fila
                    fila.find('td[data-name]').each(function () {
                        // Obtén el nombre de la propiedad desde el atributo data-name
                        const key = $(this).data('name');

                        // Obtén el valor de la celda
                        const value = $(this).text().trim();

                        // Asigna el valor a la clave en el objeto filaData
                        filaData[key] = value;
                    });

                    filaData.Orden = index;

                    // Añade el objeto al array de resultados
                    ConsultaPlanProduccionCs.modifieddata.push(filaData);


                    // }
                });

                $('.muestraOF').each(function (index) {
                    // Encuentra la fila (tr) que contiene el checkbox
                    const fila = $(this).closest('tr');


                    // Crea un objeto vacío para almacenar los valores de la fila
                    let filaData = {};

                    // 1. Manejar el checkbox que está en la primera celda
                    const procesarOF = $(this);

                    //Validar que tenga fecha de entrega de lo contrario no puede ser creada la OF
                    let IdLinea = procesarOF.data('linea');


                    filaData["DocEntry"] = LayoutCs.RandomDocEntry(); // Obtener el valor del checkbox
                    filaData["OrdenFabricacion"] = "N/A"; // Si está marcado o no

                    // Recorre cada celda dentro de la fila
                    fila.find('td[data-name]').each(function () {
                        // Obtén el nombre de la propiedad desde el atributo data-name
                        const key = $(this).data('name');

                        // Obtén el valor de la celda
                        const value = $(this).text().trim();

                        // Asigna el valor a la clave en el objeto filaData
                        filaData[key] = value;
                    });

                    filaData.Orden = index;

                    // Añade el objeto al array de resultados
                    ConsultaPlanProduccionCs.filasMuestra.push(filaData);

                });

                ConsultaPlanProduccionCs.UpdatePlanProduction();

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

    // Ocultar menú contextual al hacer clic en cualquier lugar
    $(document).on("click", function () {
        $("#MenuContextDeleteRow").hide();
    });

    $(document).on("click", "#deleteRow", function () {
        let idppd = $("#MenuContextDeleteRow").data("idppd");
        let folio = $("#MenuContextDeleteRow").data("folio");
        let ordenf = $("#MenuContextDeleteRow").data("of");
        ConsultaPlanProduccionCs.DeleteItemPlanDetails(idppd, folio, ordenf);
    });

    $(document).on("click", "#addRow", function () {

        ConsultaPlanProduccionCs.whitelinealreadysaved = false;
        // Obtener el índice actual de la nueva fila (número de filas ya presentes en la tabla)
        let rowIndex = $(".tableReport tbody tr").length;

        // Clonar la primera fila de la tabla
        let firstRow = $(".tableReport tbody tr").eq(1).clone();

        if (firstRow.length == 0)
            firstRow = $(".tableReport tbody tr").eq(0).clone();

        // Guardar valores de los atributos data-name antes de limpiar
        firstRow.find("td").each(function () {
            let dataName = $(this).attr("data-name");
            $(this).attr("data-original-name", dataName); // Guardar en un atributo temporal
        });

        //Obtener la linea anterior
        let linea = firstRow.find("td.Linea").text();
        let folio = firstRow.find("td.Folio").text();

        // Limpiar el contenido de las celdas
        let idppd = ConsultaPlanProduccionCs.generarCadenaAleatoria(5);
        firstRow.find("td").text("");
        firstRow.find("td").attr("id", "");
        firstRow.find("td").removeAttr("data-id");
        firstRow.find("td").attr("data-idppd", idppd);

        // Restaurar los valores de data-name desde el atributo temporal
        firstRow.find("td").each(function () {
            let originalName = $(this).attr("data-original-name");
            if (originalName) {
                $(this).attr("data-name", originalName);
                $(this).removeAttr("data-original-name"); // Eliminar el atributo temporal
            }
        });


        // Obtener la altura de las celdas originales
        let originalHeight =
            $(".tableReport tbody tr")
                .eq(1).find("td").eq(0).outerHeight();

        // Establecer la misma altura en las celdas de la nueva fila
        firstRow.find("td").css("height", originalHeight + "px");

        firstRow.find('td:nth-child(1) form-check input').removeClass("sendOF");

        // Añadir ícono de flecha derecha con el índice como atributo
        firstRow.find('td:nth-child(2)').prepend('<i class="bi bi-x-circle-fill iconremoverow" data-index="' + rowIndex + '"></i>');
        //firstRow.prepend('<i class="bi bi-x-circle-fill iconremoverow" data-index="' + rowIndex + '"></i>');

        // Añadir attributo newRow para identificar en siguiente paso
        firstRow.find('td.Linea').attr("newRow", "TRUE");
        firstRow.find('td.Linea').text(linea.trim());
        firstRow.find('td.Folio').text(folio.trim());

        // Agregar la clase editMe a las celdas que no tengan las clases CustomOptions o TimeField
        firstRow.find("td:not(.CustomOptions):not(.TimeField)").addClass("editMe");

        //Quitar la clase editMe, para que no se pueda editar la linea
        firstRow.find("td.Linea").removeClass("editLinea");

        //Eliminar id, sumcap de fila
        firstRow.attr("id", `newrow${idppd}`);
        firstRow.attr("idppd", "");
        firstRow.attr("sumcap", "");
        firstRow.find("td.EstatusProduccion").removeClass("EstatusProduccionData");
        firstRow.find("td.Linea").removeClass("editMe");
        firstRow.find("td.OrdenFabricacion").removeClass("editMe");
        firstRow.find("td.EstatusProduccion ").removeClass("editMe");
        firstRow.find("td.EstatusProduccion ").text("en cola");
        firstRow.find("td.Comentarios").text("Esta es una of de muestra.");


        ConsultaPlanProduccionCs.newRowsTR.push(idppd);

        //Clase para no considerarlo en capacidad de linea
        firstRow.addClass("muestraOF");

        firstRow.height(60);

        // Agregar la fila al final de la tabla
        $(".tableReport tbody").append(firstRow);

    });

    // Eliminar la fila agregada en la asigancion de comentarios y prioridad
    $(document).on("click", ".iconremoverow", function () {
        // Obtener el índice de la fila desde el atributo data-index
        let rowIndex = $(this).data("index");

        // Eliminar la fila basada en el índice
        $(".tableReport tbody tr").eq(rowIndex).remove();
    });
    // Mostrar menú contextual al hacer clic derecho
    $(document).on("contextmenu", "#PlanProduccion tbody tr", function (e) {
        e.preventDefault();

        let linea = $(this).attr("linea");
        let folio = $(this).attr("folio");

        $("#MenuContextBitacora").attr("linea", linea);
        $("#MenuContextBitacora").attr("folio", folio);
        $("#MenuContextBitacora")
            .css({
                top: (e.pageY) + "px",
                left: e.pageX + "px",
            })
            .show();
    });

    //Menu contextual para eliminar una linea
    $(document).on("contextmenu", ".tableReport tbody tr", function (e) {
        e.preventDefault();

        // Obtener la posición de clic en relación con toda la página
        const pageX = e.pageX;
        const pageY = e.pageY;

        // Obtener la posición relativa de la tabla
        const tableOffset = $(this).closest(".tableReport").offset(); // Offset de la tabla

        // Calcular la posición relativa dentro de la tabla
        const relativeX = pageX - tableOffset.left;
        const relativeY = pageY - tableOffset.top + 150;

        // Extraer el idppd de la primera celda
        const firstCell = $(this).find("td:first-child"); // Selecciona la primera celda
        const idppd = firstCell.attr("data-idppd"); // Atributo que necesitas

        const folioCell = $(this).find("td.Folio"); // Selecciona la primera celda
        const folio = folioCell.text().trim(); // Atributo que necesitas

        const ofCell = $(this).find("td.OrdenFabricacion"); // Selecciona la primera celda
        const ordenf = ofCell.text().trim(); // Atributo que necesitas



        // Asignar el atributo idppd al menú contextual
        $("#MenuContextDeleteRow").data("idppd", idppd);
        $("#MenuContextDeleteRow").data("folio", folio);
        $("#MenuContextDeleteRow").data("of", ordenf);

        // Mostrar el menú contextual en la posición relativa correcta
        $("#MenuContextDeleteRow")
            .css({
                top: (e.clientY + 5) + "px",
                left: (e.clientX + 5) + "px",
                position: "fixed" // esto es clave para que siempre se posicione relativo a la ventana
            })
            .show();
    });

    // Ocultar menú contextual al hacer clic en cualquier lugar
    $(document).on("click", function () {
        $("#MenuContextBitacora").hide();
    });

    // Manejar las opciones del menú contextual
    $("#openBitM").on("click", function () {

        ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("bitacora");
        ConsultaPlanProduccionCs.FolioPP = $("#MenuContextBitacora").attr("folio");
        ConsultaPlanProduccionCs.BitacoraPlanProduccion();

        // Ocultar el menú contextual
        $("#MenuContextBitacora").hide();
    });

    $("#CloseBitacora").on("click", function () {
        $("#Bitacora").modal("hide");
    });

    $("#CloseBitacoraDetalle").on("click", function () {
        $("#BitacoraDetalle").modal("hide");
        $("#CloseBitacora").click();
    });
    //Al seleccionar las lineas
    $(document).on("click", ".nombrelineas", function () {
        // Obtener los atributos 'series' de los checkboxes seleccionados como un array de números
        ConsultaPlanProduccionCs.NombresLineas = $('.nombrelineas:checked').map(function () {
            return $(this).attr('lineas'); // Convertir a número entero
        }).get().join(","); // Obtener el array puro

        ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("action");
        ConsultaPlanProduccionCs.table = ConsultaPlanProduccionCs.PlanesProduccion("FALSE");

    });

    $("#swichCapLinea").on("change", function () {
        if ($(this).is(":checked")) {
            ConsultaPlanProduccionCs.showCapLineaPlan()
        }
        else {
            ConsultaPlanProduccionCs.hideCapLineaPlan()
        }
    });
});
