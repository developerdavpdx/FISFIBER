class ConsPlaPro {

    constructor() {

        // * Atributos para guardar los datos de la lista de las ordenes de venta agrupados por linea
        this.subtablelinedetailsbody = `<div class="card">
                                                <div class="card-body ReportHeader">
                                                    <div class="row justify-content-end align-items-center">
                                                         <div class="col-7 text-center">
                                                            <div class="text-center pt-3">
                                                                <span class="ps-2">
                                                                    PLAN DE PRODUCCIÓN LÍNEA {linea}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div class="col-3 text-center" >
                                                                <div class="alert-primary col-12 mb-1 p-1" style="height:30%;" role="alert">
                                                                   Capacidad en horas : <label class="bold" id="horasCap">{horas}</label>
                                                                </div>
                                                                 <div class="alert-success col-12 p-1" style="height:30%;" role="alert">
                                                                   Metros en proceso/terminados : <label class="bold" id="metrosCap" >{metros}</label>
                                                                </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row m-0 pb-4">
                                <div class="col-md-12 p-0 body-table table-scroll">
                                <table id="{id}" class="table table-preview table-striped m-0" style="table-layout:fixed">
                                <thead>
                                <tr>
                               <th class="d-none" width="200"></th>
                                <th width="200"></th>
                                <th class="d-none" width="240">Línea</th>
                                <th class="d-none" width="200">Folio</th>
                                <th class="d-none" width="200">Generada</th>
                                <th class="d-none" width="200">No Orden Fabricación</th>
                                <th class="d-none" width="300">Estatus</th>
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
        this.Linea = "";
        this.Revision = "";
        this.FechaRevision = "";
        this.hasfechaentrega;
        // * atributos para obtener datos de la vista previa del plan de produccion
        this.previewdataPP;
        this.grouppreviewdataPP;
        this.ExcludeColumsPP = [
            "NumCaidas", "Velocidad", "SumCap", "TP",
            "RollosSAP", "CantidadMetrosSAP", "CantidadKilosSAP", "Folio1", "OrdenFabricacion1", "EstatusProduccion",
            "Especificacion", "Linea", "FlagOrdenFabricacion",
            "Orden", "IdPPD", "Folio", "fecha", "DocEntry",
            "GenerarOF", "OrdenFabricacion", "EstatusSapOF", "Especificacion", "EsDiaAnterior", "ParoEstatus", "ParoFechaFin"
        ];
        this.ColumnsWithEdit = ["UbicacionFinal"];
        this.ColumnsWithEditNumber = ["PiezasProducidas"];
        this.ColumnsWithEditTime = ["HoraFinal"];
        this.ColumnsWithEditDate = [];
        this.ColumnsWithEditProduccion = ["EstatusProduccion", "StatusProduccion"];
        this.NombresLineas = "";

        this.CapacidadLinea = "";
        this.SumPiezasP = 0;
        this.SumCapLH = 0;
        this.showCapL = 1;
        this.IdPPDOverflow = [];
        this.planseleccionado = "";
        this.listEstatusProduccion = "";
        this.htmlListEstatusProduccion = "";
        this.defaultHtmlEstatus = `<option value="en cola">en cola</option><option value="en proceso">en proceso</option><option value="en pausa">en pausa</option><option value="terminado">terminado</option>`
        this.rowselectedparo;
        this.TiempoParoDiaActual = "";
        this.LineasParo = [];

        //tooltip alertas
        this.tooltipMolido = null;

        //Variables de deteccion para la autorizacion de los cambios de turno
        this.turnoActual = null;
        this.turnoPendiente = null;

        //Variables para el contador de la bascula
        this.pesoActual = 0;
        this.animadorPeso = new PesoAnimator("#lblPeso"); // Animacion del peso en bascula

        //Inicializacion de datatables
        this.dataTableHelper = new DataTableHelper();
    }
    //Listado de planes de produccion
    PlanesProduccion(terminados, showLoading = 1, CurrentFolio = '') {
        try {

            //PlanProduccion/GetPlanesProduccion
            let table = $("#PlanProduccion").DataTable({
                processing: false,
                serverSide: true,
                bDestroy: true,
                ajax: {
                    url: this.action,
                    type: "POST",
                    dataType: "json",
                    data: {
                        "terminados": terminados,
                        "lineas": this.NombresLineas
                    },
                    beforeSend: function () {
                        if (showLoading != 0) {
                            Loading();
                        }
                    },
                    complete: function () { StopLoading(); },
                    dataSrc: function (json) { return json.data; }
                },
                columns: [
                    { data: "Folio" },
                    { data: "Linea" },
                ],
                columnDefs: [
                    //{ visible: false, targets: [2, 3, 4, 5, 6, 7] },
                    { width: '210px', targets: '_all' }
                ],
                ordering: false,
                info: true,
                bPaginate: true,
                language: {
                    lengthMenu: "Mostrar _MENU_ registros",
                    zeroRecords: "No se encontraron resultados",
                    info: "Registros del _START_ al _END_ de un total de _TOTAL_ registros",
                    infoEmpty: "Registros del 0 al 0 de un total de 0 registros",
                    infoFiltered: "(filtrado de un total de _MAX_ registros)",
                    sSearch: "Buscar:",
                    oPaginate: {
                        sFirst: "Primero",
                        sLast: "Último",
                        sNext: "Siguiente",
                        sPrevious: "Anterior"
                    },
                    sProcessing: "Procesando...",
                    emptyTable: "No hay datos disponibles en la tabla"
                },
                createdRow: function (row, data, dataIndex) {
                    $(row).addClass('PP');
                    $(row).attr("folio", data.Folio);
                    $(row).attr("linea", data.Linea);

                    // Si el estatus no es 1 ni 2, aplicamos clase fila-en-paro
                    if ((data.ParoEstatus === 1 || data.ParoEstatus === 2)) {
                        $(row).addClass('fila-en-paro');

                        ConsultaPlanProduccionCs.LineasParo.push(data.Linea);
                    }

                    if (CurrentFolio != '' && CurrentFolio == data.Folio) {
                        // Añadir clase PPselected a las celdas de la fila seleccionada
                        $(row).find('td').addClass('PPselected position-relative');
                        // Añadir ícono de flecha derecha a la primera celda de la fila seleccionada
                        $(row).find('td:first-child').append('<i class="fas fa-arrow-right iconPPselected"></i>');

                    }
                }
            });

            if (showLoading != 0) {
                StopLoading();
            }

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

                                    columnasrestantes += `<th id="${idH}" width="200">${textoH}</th>`;
                                }
                            });
                        }


                        //Si la orden no ha sido enviada, tener la opcion de crear
                        let shouldbechecked = (item.OrdenFabricacion == '' ? "" : "checked disabled");
                        let shouldbeshowed = (item.OrdenFabricacion == '' ? "" : "checked disabled");
                        let GenerarOF = (item.OrdenFabricacion == "" ? "NO" : "SI");

                        let grayColor = "", position = "", clock = "";
                        //Se coloca el reloj para los que estan retrasados, solo al primer elemento de la celda.
                        if (item.EsDiaAnterior == 1) {
                            clock = `<span class="indicador-retrasome"><i class="bi bi-alarm fs-5 text-danger"></i></span>`;

                            grayColor = "background-color: lightgray; box-shadow: none;";
                        }
                        let ParoEstatus = item.ParoEstatus;
                        let IconParoEstatus = "";
                        let IconOpcionesPFG = "";
                        let IconOpcionesPMaq = "";
                        let HojaEspecificaciones = "";
                        //if (ParoEstatus == "Terminado" || ParoEstatus == "Sin Paro") {
                        IconParoEstatus = `<button class="btn btn-paroLinea ParoLineaPP" 
                                                   value="${item.Folio}" 
                                                   data-toggle="tooltip"
                                                   data-placement="top"
                                                   data-linea="${item.Linea}"
                                                   data-pedido="${item.Pedido}"
                                                   title="Paro de línea ${item.Linea}">
                                                <i class="bi bi-stop-circle"></i>
                                            </button>`;

                        //}
                        IconOpcionesPFG = `<button class="btn btn-opcionesPPlus" 
                                                id="btn-Mproduccion"
                                                data-bs-toggle="modal"
                                                data-bs-target="#modalOpcionesPP"
                                                data-planproduccion="${item.Folio}"
                                                data-ordenfabricacion="${item.OrdenFabricacion}"
                                                data-pedido="${item.Pedido}"
                                                data-linea="${item.Linea}"
                                                data-cantidad="${item.CantidadKilos}"
                                                data-fechaini="${item.FechaContabilizacion}"
                                                data-articulo="${item.DescripcionArticulo}"
                                                data-estatus="${item.EstatusProduccion}"
                                                data-piezasproducidas="${item.PiezasProducidas}"                                                
                                                title="Producción - Guata y Filtro">
                                            <i class="bi bi-stack"></i>
                                        </button>`;

                        IconOpcionesPMaq = `<button class="btn btn-opcionesPPlus" 
                                                data-bs-toggle="modal"
                                                data-bs-target="#modalOpcionesPMaq"
                                                title="Producción - Maquilas">
                                            <i class="bi bi-gear"></i>
                                        </button>`;

                        HojaEspecificaciones = `<button class="btn btn-opcionesPP hojaEsp" itemcode = "${item.Articulo}" linea = "${item.Linea}">
                                                    <i class="bi bi-file-earmark-text"></i>
                                                </button>`;
                        ConsultaPlanProduccionCs.anyvar = `<div class="form-check"><input value="${item.DocEntry}" data-linea="${item.Linea}" type="checkbox" ${shouldbechecked} class="form-check-input anycheck "></div>`;
                        ConsultaPlanProduccionCs.anydata += `<tr id="rowppd${item.IdPPD}" sumcap="${item.SumCap}" >`;
                        //Columnas principales
                        ConsultaPlanProduccionCs.anydata += `<td class="d-none">${ConsultaPlanProduccionCs.anyvar}</td>
                                                             <td class="position-relative" style="${grayColor}">
                                                                  <div class="d-flex align-items-center justify-content-center gap-2">
                                                                       ${clock}
                                                                       ${IconParoEstatus}                                                                       
                                                                       ${HojaEspecificaciones}
                                                                       ${IconOpcionesPFG}
                                                                       ${IconOpcionesPMaq}
                                                                  </div>
                                                             </td>
                                                             <td class="d-none" data-name="Linea">${item.Linea}</td>
                                                            <td class="d-none" data-name="Folio">${item.Folio}</td>
                                                            <td class="d-none">${GenerarOF}</td>
                                                            <td class="d-none">${item.OrdenFabricacion}</td>
                                                            <td class="d-none">${item.EstatusSapOF}</td>                                               `;

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
                                else if (ConsultaPlanProduccionCs.ColumnsWithEditNumber.includes(indexitem)) {
                                    hasedit = "editMeNumber";
                                }
                                //TimeEdit
                                else if (ConsultaPlanProduccionCs.ColumnsWithEditTime.includes(indexitem)) {
                                    hasedit = "TimeField";
                                }
                                //DateEdit
                                else if (ConsultaPlanProduccionCs.ColumnsWithEditDate.includes(indexitem)) {
                                    hasedit = "DateField";
                                }
                                //Estatus Produccion Edit
                                else if (ConsultaPlanProduccionCs.ColumnsWithEditProduccion.includes(indexitem)) {
                                    if (itemdata != "terminado" && itemdata != "cancelado")
                                        hasedit = "EstatusProduccionData";
                                }
                                else {
                                    hasedit = "";
                                }

                                let idC = indexitem;




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


                                celdasrestantes += `<td class="${idC} ${hasedit} ${position} " style="${grayColor}" data-id="${LayoutCs.SpaceByUppercase(idC)} Linea: ${linea} Pedido: ${item.Pedido}" data-name="${idC}">${itemdata}</td>`;
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
                        .replace("{horas}", ConsultaPlanProduccionCs.CapacidadLinea);

                    $("#reportbyline").append(ConsultaPlanProduccionCs.subtablelinedetails.trim());
                    ConsultaPlanProduccionCs.MakeTableEditableWithBitacora(("PPDetails" + linea));

                    //Bloqueo de tabla detalle
                    if (ConsultaPlanProduccionCs.LineasParo.includes(linea)) {
                        $(`#PPDetails${linea}`).addClass('tabla-bloqueada');
                    }
                });

                $("#folioseleccionado").text(this.FolioPP);
                $("#actualizar").removeClass("d-none");
                $("#PPHeader").removeClass("d-none");
                $("#PPHeaderTitle").addClass("d-none");

                //Detales encabezado plan produccion
                $("#fecha-liberacion,#fecha-revision,#fecha-documento").text(ConsultaPlanProduccionCs.extradata[0].fecha);
                $("#revision").text(ConsultaPlanProduccionCs.extradata[0].Revision + " ACTUALIZADA");
                $("#folio").text(ConsultaPlanProduccionCs.extradata[0].folio + "-" + ConsultaPlanProduccionCs.extradata[0].Revision);

                //console.log(this.otherdata);
                //Ocultar celdas y columnas que no son visibles de acuerdo a la configuracion
                $.each(this.otherdata, function (index, item) {
                    //OCULTAR COLUMNA Y CELDA
                    //if (item == "NO") {
                    //    let DOMelementPP = LayoutCs.limpiarTexto(index);
                    //    $(`#${DOMelementPP}`).addClass("d-none");
                    //    $(`.${DOMelementPP}`).addClass("d-none");
                    //}

                    if (item.Visible == "NO") {
                        let DOMelementPP = LayoutCs.limpiarTexto(item.ColumnName);
                        $(`#${DOMelementPP}`).addClass("d-none");
                        $(`.${DOMelementPP}`).addClass("d-none");
                    }

                });
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.anydata.Message);
                //Consultar los planes de producción(listado)
                ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("action");
                ConsultaPlanProduccionCs.table = ConsultaPlanProduccionCs.PlanesProduccion("FALSE");
                $("#PPHeaderTitle").removeClass("d-none");
                $("#PPHeader").addClass("d-none");
                $("#folioseleccionado").text("");
                $("#reportbyline").html(`<h5 class="card-title">!Ningún plan seleccionado!</h5>
                    <p class="card-text">Aquí podrás visualizar el detalle de el plan de producción seleccionado.</p>`);
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

        if (loader == 0)
            Loading();

        var devAlert = $("#horasCap").closest("div");
        var devAlertMC = $("#metrosCap").closest("div");


        if (ConsultaPlanProduccionCs.IdPPDOverflow.length > 0) {
            devAlert.removeClass("alert-primary").addClass("alert-danger");
            ConsultaPlanProduccionCs.IdPPDOverflow.forEach((c) => {
                $(`#rowppd${c} td`).addClass("bg-alert");
            });
            devAlertMC.removeClass("alert-success").addClass("alert-danger");
        }

        devAlert.show();
        devAlertMC.show();

        ConsultaPlanProduccionCs.showCapL = 1;

        if (loader == 0)
            StopLoading();
    }
    //Pintar Sobre Capacidad 
    hideCapLineaPlan() {
        //rowppd

        Loading();

        $("#reportbyline tbody tr td").removeClass("bg-alert");
        var devAlert = $("#horasCap").closest("div");
        var devAlertMC = $("#metrosCap").closest("div");
        devAlert.hide();
        devAlertMC.hide();

        ConsultaPlanProduccionCs.showCapL = 0;

        StopLoading();

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
                //this.ReiniciarPagina();
                LayoutCs.Alerta("Plan de producción", "Plan de producción actualizado correctamente.", "OK");
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
                //$.each(ConsultaPlanProduccionCs.response[0], function (index, item) {
                //    let checked = item == "SI" ? 'checked' : '';
                //    $("#configuracionPPContainer").append(`<div class="mb-1 align-self-start form-check">
                //        <input type="checkbox" id="${index}" class="form-check-input anycheck configuracionbyPP" value="${item}" ${checked}>
                //        <label class="form-check-label" for="${index}">${index}</label>
                //    </div>`);
                //});

                $.each(ConsultaPlanProduccionCs.response, function (index, item) {

                    let columnasHide = ["Folio1", "Folio", "OrdenFabricacion", "OrdenFabricacion1", "Linea"];

                    if (!columnasHide.includes(item.ColumnName)) {
                        let checked = item.Visible == "SI" ? 'checked' : '';

                        let textoS = item.ColumnName;

                        if (item.ColumnName == 'StatusProduccion') textoS = "EstatusProduccion";


                        $("#configuracionPPContainer").append(`<div class="mb-1 align-self-start form-check">
                         <input type="checkbox" id="${item.ColumnName}" class="form-check-input anycheck configuracionbyPP" value="${item.ColumnName}" ${checked}>
                         <label class="form-check-label" for="${item.ColumnName}">${LayoutCs.SpaceByUppercase(textoS)}</label>
                     </div>`);
                    }

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
                    },

                    update: function (event, ui) {
                        // Esta función se llama cada vez que se cambia el orden
                        console.log("Nuevo orden:");
                        $("#configuracionPPContainer .form-check").each(function (index) {
                            console.log(`${index + 1}: ${$(this).find('label').text()}`);
                        });
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
                    configuracion: JSON.stringify(this.configuracionPP),
                    orden: this.OrdenPP
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
        //this.urlaction = $("body").attr("estatusproduccion");
        //this.response = await LayoutCs.MakeAjaxRequest(this.urlaction, this.anydata);
        //this.anydata = JSON.parse(this.response.Data);
        //this.response = "";
        //$.each(ConsultaPlanProduccionCs.listEstatusProduccion, function (index, item) {
        //    LayoutCs.response += `<option value="${item.estatus}">${item.estatus}</option>`
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

        advancedEditor.SetEditableClass("EstatusProduccionData", {
            internals: {
                renderEditor: (elem, oldVal) => {
                    $(elem).html(`<select class="form-select mt-2" aria-label="Prioridad">
                                  ${ConsultaPlanProduccionCs.htmlListEstatusProduccion == "" ?
                            ConsultaPlanProduccionCs.defaultHtmlEstatus :
                            ConsultaPlanProduccionCs.htmlListEstatusProduccion
                        }
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
        $("#" + table).on('change', '.editMe, .editMeNumber, .TimeField, .DateField,.EstatusProduccionData', function () {
            var cell = $(this).closest('td'); // Obtener la celda más cercana
            var cellName = cell.data('id'); // Asumiendo que existe un atributo 'data-id'

            if (cellName && !ConsultaPlanProduccionCs.historymodified.includes(cellName)) {
                ConsultaPlanProduccionCs.historymodified += cellName + "\n";
            }

            let row = $(this).closest("tr");
            row.removeClass("sendOF");
            row.addClass("sendOF");
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

    //Actualizar los porcentajes de la receta
    ActualizarPorcentajeMolido(input) {

        //Obtencion de valores
        let cargadora = $(input).data('cargadora');

        let porcentajeMolido = parseFloat($(input).val()) || 0;

        let porcentajeReceta = $(
            `.porcentaje-material[data-cargadora="${cargadora}"]`
        );

        let porcentajeOriginal = parseFloat(
            porcentajeReceta.data('original')
        );

        // Validar negativos
        if (porcentajeMolido < 0) {

            $(input).val('');

            porcentajeReceta.text(porcentajeOriginal + "%");

            this.MostrarTooltipMolido(
                input,
                "El porcentaje no puede ser negativo."
            );

            return;
        }

        //Validar que no exceda la receta
        if (porcentajeMolido > porcentajeOriginal) {

            $(input).val('');

            porcentajeReceta.text(porcentajeOriginal + "%");

            this.MostrarTooltipMolido(
                input,
                "El porcentaje de molido no puede ser mayor al de la receta."
            );

            return;
        }

        //Nueva cantidad de porcentaje
        let nuevoPorcentaje = porcentajeOriginal - porcentajeMolido;

        // Evitar negativos
        if (nuevoPorcentaje < 0)
            nuevoPorcentaje = 0;

        porcentajeReceta.text(nuevoPorcentaje + "%");

    }

    //=================================================================================
    //======================= Confirmaciones de botones ===============================
    // ------- Botones de confirmacion GUATA y FILTRO --------

    //Confirmacion impresion de materiales
    ConfirmarPrintEtiqueta() {
        $.confirm({

            theme: 'modern',
            type: 'red',
            columnClass: 'confirm-ffisa',
            animation: 'scale',
            closeAnimation: 'scale',
            title: `
            <div class="text-center">
                <div class="pt-3 pb-5">
                    <i class="bi bi-tag text-primary fs-1 icon-etiqueta"></i>
                </div>                
                <div class="mt-2 fw-semibold text-dark accion-confirm-realizar">
                    Generar Etiqueta
                </div>
            </div>`,
            content: `
            <div class="text-center text-secondary accion-confirm">
                ¿Desea generar la etiqueta? Esta accion no se puede deshacer</div>`,

            buttons: {

                eliminar: {
                    text: 'Generar',
                    btnClass: 'btn-genEtiquetaProduccion',

                    action: function () {

                        // lógica

                    }
                },

                cancelar: function () { },

            },
            onOpenBefore: function () {
                this.$jconfirmBox[0].style.setProperty('border-top', '5px solid #737474', 'important');
            }
        });
    }

    //Confirmacion de eliminacion de items
    ConfirmarEliminar() {

        $.confirm({
            theme: 'modern',
            type: 'red',
            columnClass: 'confirm-ffisa',
            animation: 'scale',
            closeAnimation: 'scale',

            title: `
            <div class="text-center">
                <div class="pt-3 pb-5">
                    <i class="bi bi-trash3 text-danger fs-1 icon-tipo-trash"></i>
                </div>                
                <div class="mt-2 fw-semibold text-dark accion-confirm-realizar">
                    Eliminar Material
                </div>
            </div>`,
            content: `
            <div class="text-center text-secondary accion-confirm">
                ¿Desea eliminar este material? Esta accion no se puede deshacer</div>`,
            type: 'red',

            buttons: {

                eliminar: {
                    text: 'Eliminar',
                    btnClass: 'btn-danger',

                    action: function () {

                        // lógica

                    }
                },

                cancelar: function () { },

            },
            onOpenBefore: function () {

                this.$jconfirmBox.css({
                    'border-top': '5px solid #dc362e',
                    'border-radius': '12px'
                });

            }
        });

    }

    //Confirmacion de Guardar
    ConfirmarGuardado(planProduccion, ordenFabricacion, pedido, linea, btnIdentificado) {
        $.confirm({

            theme: 'modern',
            type: 'red',
            columnClass: 'confirm-ffisa',
            animation: 'scale',
            closeAnimation: 'scale',
            title: `
            <div class="text-center">
                <div class="pt-3 pb-5">
                    <i class="bi bi-floppy text-primary fs-1 icon-etiqueta"></i>
                </div>                
                <div class="mt-2 fw-semibold text-dark accion-confirm-realizar">                     
                    Guardar
                </div>
            </div>`,
            content: `
            <div class="text-center text-secondary accion-confirm">
                ¿Desea guardar la información? Esta accion no se puede deshacer</div>`,

            buttons: {

                guardar: {
                    text: 'Guardar',
                    btnClass: 'btn-genEtiquetaProduccion',

                    action: function () {

                        //Se obtiene de que boton viene la accion para que asi se ejecute la logica correspondiente
                        switch (btnIdentificado) {
                            case "btn-guardaInfoRP":

                                //Obtenemos el peso de la bascula 
                                let basculaPeso = ConsultaPlanProduccionCs.pesoActual;

                                //Obtenemos el empleado que esta logueado en el sistema
                                let empleado = sessionStorage.getItem("empleado");

                                let modeloRPolietileno = new ReservaPolietilenoDto(
                                    planProduccion,
                                    ordenFabricacion,
                                    pedido,
                                    linea,
                                    basculaPeso,
                                    empleado
                                );

                                //Mandamos los registros a la funcion que se encarga de procesar el guardado de la reserva de polietileno
                                ConsultaPlanProduccionCs.procesaGuardadoReservaPolietileno(modeloRPolietileno)
                                break;

                            default:
                                break;
                        }

                       

                    }
                },

                cancelar: function () { },

            },
            onOpenBefore: function () {
                this.$jconfirmBox[0].style.setProperty('border-top', '5px solid #737474', 'important');
            }
        });
    }

    //Confirmacion de Autorizacion
    ConfirmarAutorizacion() {
        $.confirm({

            theme: 'modern',
            type: 'red',
            columnClass: 'confirm-ffisa',
            animation: 'scale',
            closeAnimation: 'scale',
            title: `
            <div class="text-center">
                <div class="pt-3 pb-5">
                    <i class="bi bi-floppy text-black fs-1 icon-etiqueta-autorizacion"></i>
                </div>                
                <div class="mt-2 fw-semibold text-dark accion-confirm-realizar">
                    Solicitar Autorización
                </div>
            </div>`,
            content: `
            <div class="text-center text-secondary accion-confirm">
                Se detectó un material fuera de receta ¿Desea solicitar autorización del supervisor para continuar con el consumo de materia prima?</div>`,

            buttons: {

                eliminar: {
                    text: 'Solicitar',
                    btnClass: 'btn-warning',

                    action: function () {

                        // lógica

                    }
                },

                cancelar: function () { },

            },
            onOpenBefore: function () {
                this.$jconfirmBox[0].style.setProperty('border-top', '5px solid #737474', 'important');
            }
        });

    }

    //Confirmacion de Emisión
    ConfirmarEmision() {
        $.confirm({

            theme: 'modern',
            type: 'red',
            columnClass: 'confirm-ffisa',
            animation: 'scale',
            closeAnimation: 'scale',
            title: `
            <div class="text-center">
                <div class="pt-3 pb-5">
                    <i class="bi bi-file-earmark-check text-black fs-1 icon-etiqueta-Emision"></i>
                </div>                
                <div class="mt-2 fw-semibold text-dark accion-confirm-realizar">
                    Generar emisión
                </div>
            </div>`,
            content: `
            <div class="text-center text-secondary accion-confirm">
                Se generará la emisión correspondiente. ¿Desea continuar?</div>`,

            buttons: {

                eliminar: {
                    text: 'Generar',
                    btnClass: 'btn-genEmision',

                    action: function () {

                        // lógica

                    }
                },

                cancelar: function () { },

            },
            onOpenBefore: function () {
                this.$jconfirmBox[0].style.setProperty('border-top', '5px solid #737474', 'important');
            }
        });

    }

    //Confirmar generar devolucion
    ConfirmarDevolucion() {
        $.confirm({
            theme: 'modern',
            type: 'red',
            columnClass: 'confirm-ffisa',
            animation: 'scale',
            closeAnimation: 'scale',

            title: `
            <div class="text-center">
                <div class="pt-3 pb-5">
                    <i class="bi bi-arrow-return-left text-danger fs-1 icon-tipo-trash"></i>
                </div>                
                <div class="mt-2 fw-semibold text-dark accion-confirm-realizar">
                    Devolución
                </div>
            </div>`,
            content: `
            <div class="text-center text-secondary accion-confirm">
                ¿Desea devolver este material? Esta accion no se puede deshacer</div>`,
            type: 'red',

            buttons: {

                eliminar: {
                    text: 'Devolver',
                    btnClass: 'btn-danger',

                    action: function () {

                        // lógica

                    }
                },

                cancelar: function () { },

            },
            onOpenBefore: function () {

                this.$jconfirmBox.css({
                    'border-top': '5px solid #dc362e',
                    'border-radius': '12px'
                });

            }
        });
    }

    // ------- Botones de confirmacion MAQUILAS --------
    //Confirmacion de Emisión - Consumo de Materia - MAQUILAS
    ConfirmarEmisionCMM() {
        $.confirm({

            theme: 'modern',
            type: 'red',
            columnClass: 'confirm-ffisa',
            animation: 'scale',
            closeAnimation: 'scale',
            title: `
            <div class="text-center">
                <div class="pt-3 pb-5">
                    <i class="bi bi-file-earmark-check text-black fs-1 icon-etiqueta-Emision"></i>
                </div>                
                <div class="mt-2 fw-semibold text-dark accion-confirm-realizar">
                    Generar emisión
                </div>
            </div>`,
            content: `
                <div class="text-center text-secondary mb-2">
                    Se detectó una <b>resina</b> en la emisión.
                </div>

                <div class="border rounded p-2 bg-light">

                    <div><strong>Descripción:</strong> RESINA WT152</div>
                    <div><strong>Cantidad:</strong> 10.62 Lt</div>

                </div>

                <div class="text-center mt-3">
                   ¿Confirma que desea generar la emisión con esta cantidad?
                </div>

            `,

            buttons: {

                eliminar: {
                    text: 'Generar',
                    btnClass: 'btn-genEmision',

                    action: function () {

                        // lógica

                    }
                },

                cancelar: function () { },

            },
            onOpenBefore: function () {
                this.$jconfirmBox[0].style.setProperty('border-top', '5px solid #737474', 'important');
            }
        });

    }

    //Confirmacion de Autorizacion para escaneo de materiales en maquilas
    ConfirmarAutorizacionMatMaq() {
        $.confirm({

            theme: 'modern',
            type: 'red',
            columnClass: 'confirm-ffisa',
            animation: 'scale',
            closeAnimation: 'scale',
            title: `
            <div class="text-center">
                <div class="pt-3 pb-5">
                    <i class="bi bi-floppy text-black fs-1 icon-etiqueta-autorizacion"></i>
                </div>                
                <div class="mt-2 fw-semibold text-dark accion-confirm-realizar">
                    Solicitar Autorización
                </div>
            </div>`,
            content: `
            <div class="text-center text-secondary accion-confirm">
                La emisión permanecerá en espera hasta que el supervisor apruebe o rechace el consumo de materiales.
                ¿Desea continuar?
            </div>`,

            buttons: {

                eliminar: {
                    text: 'Solicitar',
                    btnClass: 'btn-warning',

                    action: function () {

                        // lógica

                    }
                },

                cancelar: function () { },

            },
            onOpenBefore: function () {
                this.$jconfirmBox[0].style.setProperty('border-top', '5px solid #737474', 'important');
            }
        });

    }

    //=================================================================================
    //======================= Eventos y funcionalidad ===============================

    informacionEncabezadoProd(planProduccion, ordenFabricacion, pedido, linea, cantidad, fechaIni, articulo, estatusColor, estatus, piezasproducidas) {
        let htmlEncabezado = `  <p class="fw-semibold text-dark ms-2 mb-2">Información General:</p>
                                <div class="rounded-3 p-3 mb-4 seccion-tarjet-infoGen">
                                    <div class="row g-2">
                                        <div class="col-12 col-md-4">
                                            <small class="text-secondary">Plan Producción: </small>
                                            <p class="fw-semibold mb-0">${planProduccion}</p>
                                        </div>
                                        <div class="col-12 col-md-4">
                                            <small class="infoGenTitle-OT">Orden Fabricación: </small>
                                            <p class="mb-0 infoGenCont-OT">OF-${ordenFabricacion}</p>
                                        </div>
                                        <div class="col-12 col-md-4">
                                            <small class="text-secondary">Pedido: </small>
                                            <p class="fw-semibold mb-0 d-flex align-items-center gap-2">
                                                PED-${pedido}
                                            </p>
                                        </div>
                                        <div class="col-12 col-md-4">
                                            <small class="text-secondary">Línea: </small>
                                            <p class="fw-semibold mb-0">${linea}</p>
                                        </div>
                                        <div class="col-12 col-md-4">
                                            <small class="text-secondary">Cantidad Solicitada: </small>
                                            <p class="fw-semibold mb-0">${cantidad}</p>
                                        </div>
                                        <div class="col-12 col-md-4">
                                            <small class="text-secondary">Fecha Inicio: </small>
                                            <p class="fw-semibold mb-0">${fechaIni}</p>
                                        </div>
                                        <div class="col-12 col-md-4">
                                            <small class="text-secondary">Tipo Producto: </small>
                                            <p class="fw-semibold mb-0">-</p>
                                        </div>
                                        <div class="col-12 col-md-4">
                                            <small class="text-secondary">Artículo: </small>
                                            <p class="fw-semibold mb-0">${articulo}</p>
                                        </div>
                                        <div class="col-12 col-md-4">
                                            <small class="text-secondary">Estatus: </small>
                                            <p class="fw-semibold mb-0">
                                                <span class="badge-estatus ${estatusColor}">${estatus}</span>
                                            </p>
                                        </div>
                                        <div class="col-12 col-md-4">
                                            <small class="text-secondary">Piezas producidas: </small>
                                            <p class="fw-semibold mb-0">
                                                <span class="fw-semibold mb-0">${piezasproducidas} / ${cantidad}</span>
                                            </p>
                                        </div>
                                        <div class="col-12 col-md-4 d-felx justify-content-start align-content-end">
                                            <button class="btn btn-link p-0 fw-semibold pt-2 pb-2 ps-0 pe-2 si-agregar-producto">
                                                <i class="bi bi-plus-circle me-1"></i>Agregar más pedidos
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            `;

        let htmlEspecificacionFolio = `
            <div class="d-flex justify-content-between align-items-center shadow-sm pt-2 pb-2 ps-3 pe-3 mb-2 gap-2 seccion-folioOT">
                <button class="btn btn-especificacion btn-sm fw-semibold px-4 py-2 hojaEsp" itemcode="${articulo}" linea="${linea}">
                    <i class="bi bi-file-earmark-text me-2"></i> Especificación
                </button>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="text-secondary estilo-seccionFolio">Folio: </span>
                    <p class="fw-semibold mb-0 estilo-seccionFolio"> OF-${ordenFabricacion}</p>
                </div>
            </div>
        `;

        let htmlbtnsReservaPolietileno = `
            <button class="btn btn-genEtiquetaProduccion btn-sm fw-semibold btn-generaEtiqueta px-4 py-2"
                    data-btngeneraetiqueta="btn-generaEtiqRP"
                    data-planproduccion="${planProduccion}"
                    data-ordenfabricacion="${ordenFabricacion}"
                    data-pedido="${pedido}"
                    data-linea="${linea}">
                <i class="bi bi-tag me-1"></i>Generar Etiqueta
            </button>
            <button class="btn btn-guardarProduccion btn-sm fw-semibold btn-guardarInfo px-4 py-2"
                    data-btnguardarinfo="btn-guardaInfoRP"
                    data-planproduccion="${planProduccion}"
                    data-ordenfabricacion="${ordenFabricacion}"
                    data-pedido="${pedido}"
                    data-linea="${linea}">
                <i class="bi bi-floppy me-2"></i>Guardar
            </button>
        `;


        // Implementamos el encabezado
        $('#content-encabezado-MProd').html(htmlEncabezado);

        // Implementacion de especificacion y folio
        $('#especificacion-folio').html(htmlEspecificacionFolio)

        // Implementacion de btn para la seccion de reserva de polietileno
        $('.seccion-btns-polietileno').html(htmlbtnsReservaPolietileno)
    }

    //Reserva polietileno
    indicadorBascula() {
        let htmlSeccionEncabezado = `
             <p class="fw-semibold text-dark mb-2">
                <i class="bi bi-hdd me-2"></i>
                Báscula Conectada
            </p>
            <div class="d-inline-flex flex-column align-items-center border rounded-3 text-center gap-2 mb-3 cuadro-pesaje">

                <span id="lblEstatusConexion" class="badge bg-danger mb-1 indicador-conectada">● Desconectado</span>
                <span id="lblPeso" class="fw-bold text-danger pesaje-medida">0.00 kg</span>
                <small id="lblMarca" class="text-secondary indicador-PActual">Sin conexión</small>
                <small id="lblModelo" class="text-secondary indicador-PActual">Sin conexión</small>

            </div>

            <div class="cont-numConteo ms-2 mb-3"><small class="infoGenTitle-OT">Num. Bolsas: </small><p class="mb-0 infoGenCont-OT">25</p></div>
                        
        `;

        
        //Implementamos el indicador de la bascula
        $('#basculaConexion').html(htmlSeccionEncabezado);

        // El elemento ya existe, ahora sí crea el animador
        this.animadorPeso = new PesoAnimator("#lblPeso");

        // Recupera el último peso en caso de que no se quiera regresar a cero al cambiar de seccion
        //this.animadorPeso.actualizar(this.pesoActual);

        // Se reinicia el contador de bascula a 0
        this.pesoActual = 0;
        this.animadorPeso.actualizar(this.pesoActual);

    }

    // RESERVA POLIETILENO
    mostrarRegistrosRPolietileno() {
        $.ajax({
            url: $("body").attr("obtenerLineaReservaPolietileno"),
            type: "GET",
            dataType: "json",

            success: (response) => {
                let data = [];
                if (response.Status == "OK") {

                    data = JSON.parse(response.Data);
                }
                    ConsultaPlanProduccionCs.dataTableHelper.crearDataTable("#tblRegistroProduccion", {
                        data: data,
                        columns: [
                            { data: "Id" },
                            { data: "Peso" },
                            {
                                data: "Fecha",
                                render: data => this.formatearFecha(data)
                            },
                            { data: "Etiqueta" },
                            { data: "Operador" }
                        ]
                    });
                
            },
            error: function (xhr) {
                console.log("STATUS:", xhr.status);
                console.log("RESPONSE:", xhr.responseText);
            },
            complete: function () {
                StopLoading();
            }

        });
        
    }

    //=================================================================================
    //=================================================================================

    //=================================================================================
    //======================== Eventos de botones G y F ===============================
    
    //Se procesa el guardado de la reserva de polietileno
    procesaGuardadoReservaPolietileno(modeloRPolietileno) {
        try {
            let urlInsertaLineaRPolietileno = $('body').attr("insertaLineaReservaPolietileno");
                                    
            $.ajax({
                url: urlInsertaLineaRPolietileno,
                type: 'POST',
                data: modeloRPolietileno,
                dataType: 'json',

                beforeSend: () => {
                    Loading();
                },

                success: (response) => {
                                        
                    try {

                        if (response.Status !== "OK") {
                            LayoutCs.Alerta("Reserva de Polietileno", response.Message);
                            return;
                        }

                        const data = JSON.parse(response.Data);

                        console.log(response);

                        LayoutCs.Alerta(
                            "Reserva de Polietileno",
                            response.Message,
                            "OK"
                        );

                        //Actualizamos la tabla con la nueva linea añadida
                        ConsultaPlanProduccionCs.mostrarRegistrosRPolietileno();
                       
                    } catch (ex) {
                                                
                        LayoutCs.Excepcion(
                            ex,
                            "Reserva de Polietileno"
                        ); 
                       
                    }

                },

                error: (xhr, status, error) => {

                    LayoutCs.Excepcion(
                        error,
                        "Reserva de Polietileno"
                    );
                   
                },
                complete: function () {
                    StopLoading();
                }
            });



        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();

        }
    }


    //=================================================================================
    //=================================================================================

    //Toolip Mensajes
    MostrarTooltipMolido(input, mensaje) {

        // Si ya existe uno anterior lo destruimos
        if (this.tooltipMolido) {
            this.tooltipMolido.dispose();
        }

        this.tooltipMolido = new bootstrap.Tooltip(input, {
            title: mensaje,
            placement: 'top',
            trigger: 'manual'
        });

        this.tooltipMolido.show();

        setTimeout(() => {

            this.tooltipMolido.hide();

        }, 3000);

    }


    //Trae los nombres de las lineas
    async GetNameLineas() {
        try {
            let urlnamelineas = $('body').attr("nombrelineasprod");

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
        
    //Recepcion del peso por signal R
    initHubBascula(email) {

        $.connection.hub.qs = {
            userId: email
        };

        var hubBascula = $.connection.basculaHub;

        hubBascula.client.actualizarPeso = (data) => {

            
            if (data.Estatus == "Conectada") {

                // Se remueven clases de conexión no encontrada
                $("#lblEstatusConexion").removeClass("bg-danger");
                $("#lblPeso").removeClass("text-danger");

                // Guardar el último peso recibido
                this.pesoActual = parseFloat(data.Peso);

                // Actualización de peso
                this.animadorPeso.actualizar(this.pesoActual);

                $("#lblPeso").addClass("peso-update");

                setTimeout(() => {

                    $("#lblPeso").removeClass("peso-update");

                }, 250);

                // Actualizacion de clases en bascula para deteccion de conexion
                $("#lblEstatusConexion").addClass("bg-success");
                $("#lblPeso").addClass("text-success");

                // Actualizacion de datos de la bascula
                $("#lblEstatusConexion").text("● " + data.Estatus);
                $("#lblMarca").text(data.Marca);
                $("#lblModelo").text(data.Modelo);

              
            } else {

                // Si se desconecta, también reiniciamos el peso
                this.pesoActual = 0;
                
                // Se remueven clases de conexion encontrada en caso de que se haya perdido la conexión
                $("#lblEstatusConexion").removeClass("bg-success");
                $("#lblPeso").removeClass("text-success");

                // Se añaden las clases de conexion no encontrada
                $("#lblEstatusConexion").addClass("bg-danger");
                $("#lblPeso").addClass("text-danger");

                $("#lblEstatusConexion").text("● " + data.Estatus);
                $("#lblPeso").text("0.00 kg");
                $("#lblMarca").text("Sin conexión");
                $("#lblModelo").text("Sin conexión");
            }

           

        };
    }
   
    //Calcular capacidad linea , menos paros
    async CapacidadHorasReal() {
        let CapacidadHoras = parseFloat(ConsultaPlanProduccionCs.CapacidadLinea);
        let HorasDetenida = parseFloat(ConsultaPlanProduccionCs.TiempoParoDiaActual);
        let CapacidadHorasFinal = CapacidadHoras - HorasDetenida;
        ConsultaPlanProduccionCs.CapacidadLinea = CapacidadHorasFinal;
    }

    async GetEstatusProduccion() {
        let urlactionEst = $("body").attr("estatusproduccion");
        let responseEst = await LayoutCs.MakeAjaxRequest(urlactionEst, "");
        ConsultaPlanProduccionCs.listEstatusProduccion = "";
        ConsultaPlanProduccionCs.listEstatusProduccion = JSON.parse(responseEst.Data);
        ConsultaPlanProduccionCs.htmlListEstatusProduccion = "";
        $.each(ConsultaPlanProduccionCs.listEstatusProduccion, function (index, item) {

            if (item.estatus != "cancelado") {
                ConsultaPlanProduccionCs.htmlListEstatusProduccion +=
                    `<option value="${item.estatus}">${item.estatus}</option>`
            }

        });
        //ConsultaPlanProduccionCs.htmlListEstatusProduccion = "";
        //console.log(ConsultaPlanProduccionCs.htmlListEstatusProduccion);

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

    //Inserta un nuevo registro de mantenimientos
    async InsertaParoMannto(data) {
        try {
            //Datos de PP
            Loading();
            this.anydata = await $.ajax({
                url: this.action,
                type: 'POST',
                dataType: 'JSON',
                data: data
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                $("#FormParo")[0].reset();
                $("#ParoModal").modal("hide");
                LayoutCs.Alerta("Plan de producción", this.anydata.Message, "OK");
                StopLoading();
                return true;
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.anydata.Message);
                StopLoading();
                return false;
            }
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible insertar un nuevo registro de paro de producción: " + error, "Plan de producción");
            StopLoading();
            return false;
        }
    }

    //=================================================================================
    //============================= Funciones Generales ===============================

    //Conversion de fechas
    formatearFecha(fecha) {
        return new Date(fecha).toLocaleString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });
    }


    //=================================================================================
    //=================================================================================
    
}

LayoutCs.validarUsuario("Producci\u00F3n");


//Instancia de clase
const ConsultaPlanProduccionCs = new ConsPlaPro();

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
async function ValidacionFormParos(event) {
    if (this.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
    } else {
        event.preventDefault();
        event.stopPropagation();

        ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("ParoMannto");

        let data = {
            "Linea": $("#Linea").val(),
            "FechaParo": $("#FechaParo").val(),
            "MotivoReparacion": $("#MotivoReparacion").val(),
            "Solicitante": $("#Solicitante").val(),
            "Pedido": ConsultaPlanProduccionCs.rowselectedparo.find("td.Pedido").text().trim()
        };

        

        await ConsultaPlanProduccionCs.InsertaParoMannto(data);

        // 🔥 Aplicar cambios directamente a la fila seleccionada
        if (ConsultaPlanProduccionCs.rowselectedparo) {
            ConsultaPlanProduccionCs.rowselectedparo.addClass('fila-en-paro');   // pintar fila
           // ConsultaPlanProduccionCs.rowselectedparo.find('.ParoLineaPP').remove(); // quitar ícono
        }

        //Bloquear plan 
        let filaPlan = $("#PlanProduccion").find("td.PPselected").closest("tr");

        if (filaPlan.length > 0) {
            filaPlan.addClass('fila-en-paro');
        }
        else {
            let currentPlan = ConsultaPlanProduccionCs.FolioPP;
            filaPlan = $("#PlanProduccion").find(`td.PP[folio="${currentPlan}"]`);
            filaPlan.addClass('fila-en-paro');
        }
       

        //$("#PlanProduccion").find("td.PPselected").find(".ParoLineaPP").remove();
        //$(`#PPDetails${data.Linea}`).find(".ParoLineaPP").remove();
        //Bloqueo de tabla detalle
        $(`#PPDetails${data.Linea}`).addClass('tabla-bloqueada');
        ConsultaPlanProduccionCs.LineasParo.push(data.Linea);
        // 🔧 Cerrar modal y limpiar form
        $("#ParoModal").trigger('reset');
        $("#ParoModal").removeClass('was-validated');
        $("#ParoModal").modal('hide');
    }

    $(this).addClass('was-validated');
}

function refrescarEstadoParos() {
    //RECARGA LA TABLA DE SELECCIÓN 
    ConsultaPlanProduccionCs.LineasParo = [];
    ConsultaPlanProduccionCs.table.ajax.reload(null, false); // false = mantener página actual

    //Posiblemente falta desbloquear la tabla seleccionada, si se quito el paro
    //Se me ocurre que se puede hacer con un trigger con jquery

}

function initHubParos(Email) {


    $.connection.hub.qs = {
        userId: Email
    }

    //Escuchando eventos con SinalR
    var hubParos = $.connection.parosHub;

    hubParos.client.closeParo = function (paro) {
        let dataParo = JSON.parse(paro);
        closeParo(dataParo[0]);

        console.warn("Posible cambio en planes producción....");
        //console.log(dataParo);
        ////Consultar info contra backend
        //const FolioActual = ConsultaPlanProduccionCs.FolioPP;
        //ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("action");
        //ConsultaPlanProduccionCs.table = ConsultaPlanProduccionCs.PlanesProduccion("FALSE",0,FolioActual);

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

function closeParo(paro) {
    console.log(`Paro en:`);
    console.log(paro);

    if (paro && ConsultaPlanProduccionCs.table) {
        ConsultaPlanProduccionCs.LineasParo = [];
        ConsultaPlanProduccionCs.table.ajax.reload(null, false); // false = mantener página actual
      
        LayoutCs.Alerta("Paro cerrado", `El paro en linea: ${paro.Linea}, ha sido atendido: ${paro.Observaciones}`, "OK");

        if (ConsultaPlanProduccionCs.Linea == paro.Linea) {
            $(`#PPDetails${paro.Linea}`).removeClass("tabla-bloqueada");
            $(`#PPDetails${paro.Linea} tr`).removeClass('fila-en-paro');   // pintar fila
        }

        //pendingParos = [];
        //$('#updateButton').html('<i class="fa fa-refresh"></i> Actualizar');
    }

}


//EVENTOS
$(function () {

    //Variables globales 
    let articulo = "";
    let linea = "";

    // Lectura valor inicial Turno GyF
    ConsultaPlanProduccionCs.turnoActual = $('input[name="tipoTurno"]:checked').val();

    // Lectura valor inicial Turno Maquila
    ConsultaPlanProduccionCs.turnoActual = $('input[name="tipoTurnoM"]:checked').val();


    const User = sessionStorage.getItem("email");

    //Se inicializa el evento para la actualizacion del peso de la bascula en RESERVA POLIETILENO
    ConsultaPlanProduccionCs.initHubBascula(User);

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
    $(document).on('submit', '.needs-validationcustom', ValidacionFormParos);
    // Validación de formularios
    $(document).on('submit', '.needs-validation', ValidacionFormularios);
    //Consultar los planes de producción(listado)
    ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("action");
    ConsultaPlanProduccionCs.table = ConsultaPlanProduccionCs.PlanesProduccion("FALSE");
    ConsultaPlanProduccionCs.GetNameLineas();
    ConsultaPlanProduccionCs.GetEstatusProduccion();


    //Al hacer click en cualquier fila de la tabla de PP
    $('#PlanProduccion tbody').on('click', 'tr.PP', function (e) {
        try {
            //Obtener url consulta
            // Ignorar si el click fue en un elemento interactivo dentro de la fila
            if ($(e.target).closest('i').length) {
                return;
            }
            ConsultaPlanProduccionCs.action = $("#PlanProduccion").attr("details");
            ConsultaPlanProduccionCs.rowdata = ConsultaPlanProduccionCs.table.row(this).data();
            ConsultaPlanProduccionCs.FolioPP = $(this).attr("folio"); //DOCENTRY
            ConsultaPlanProduccionCs.current_row = $(this);
            ConsultaPlanProduccionCs.row = ConsultaPlanProduccionCs.table.row(ConsultaPlanProduccionCs.current_row);

            let Linea = $(this).attr("linea");
            ConsultaPlanProduccionCs.Linea = Linea; 


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
                //ConsultaPlanProduccionCs.PlanesProduccionDetails();

           

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
            let sendUpdate = true;
            //Si algo fue modificado
            if (ConsultaPlanProduccionCs.historymodified != "Cambió: ") {
                $('.sendOF').each(function (index) {
                    // Encuentra la fila (tr) que contiene el checkbox
                    const fila = $(this);

                    // Crea un objeto vacío para almacenar los valores de la fila
                    let filaData = {};

                    // 1. Manejar el checkbox que está en la primera celda
                    const procesarOF = $(this).find("input:checkbox");

                    //Validar que tenga fecha de entrega de lo contrario no puede ser creada la OF
                    let IdLinea = procesarOF.data('linea');
                    ConsultaPlanProduccionCs.hasfechaentrega = $(`#PPDetails${IdLinea} tbody tr`).filter(function () {
                        var celda = $(this).find('td.FechaEntrega').text().trim(); // Obtener el valor de la celda con clase "linea"
                        return celda === ''; // Filtrar celdas vacías o no numéricas
                    });

                    ConsultaPlanProduccionCs.hasfechaentrega = ConsultaPlanProduccionCs.hasfechaentrega.length > 0 ? false : true;

                    //if (ConsultaPlanProduccionCs.hasfechaentrega == false) {
                    //    return false; // Esto rompe el bucle completo
                    //}
                    //else {

                    filaData["DocEntry"] = procesarOF.val(); // Obtener el valor del checkbox
                    filaData["OrdenFabricacion"] = procesarOF.is(':checked') ? "TRUE" : "FALSE"; // Si está marcado o no
                    filaData["Orden"] = index; // Obtener el valor del checkbox

                    // Recorre cada celda dentro de la fila
                    fila.find('td[data-name]').each(function () {

                        // Obtén el nombre de la propiedad desde el atributo data-name
                        const key = $(this).data('name');

                        // Obtén el valor de la celda
                        const value = $(this).text();

                        filaData[key] = value;
                        // Asigna el valor a la clave en el objeto filaData

                    });

                    if (filaData["EstatusProduccion"] == "") {
                        LayoutCs.Alerta(
                            "Plan de producción",
                            "El estatus producción de : " + filaData["Pedido"] + " esta vacio.",
                            "Warning");

                        console.log("Estatus produccion vacio en: " + filaData);
                        sendUpdate = false;
                    }


                    // Añade el objeto al array de resultados
                    ConsultaPlanProduccionCs.modifieddata.push(filaData);
                    //}
                });
                //Actualizar el plan de produccion
                if (sendUpdate)
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
            ConsultaPlanProduccionCs.OrdenPP = "";
            $('.configuracionbyPP').each(function (index) {
                // Obtén el id del checkbox y usa limpiarTexto para quitar acentos y espacios
                let id = LayoutCs.limpiarTexto(this.id);

                // Asigna el id como clave y el valor "SI" o "NO" como valor
                ConsultaPlanProduccionCs.configuracionPP[id] = this.checked ? "SI" : "NO";

                ConsultaPlanProduccionCs.OrdenPP += id + "=" + (index + 1) + ",";

            });

            if (ConsultaPlanProduccionCs.OrdenPP.endsWith(',')) {
                ConsultaPlanProduccionCs.OrdenPP = ConsultaPlanProduccionCs.OrdenPP.slice(0, -1); // Elimina el último carácter
            }

            // Convierte el string a un objeto clave-valor
            const orderMap = Object.fromEntries(
                ConsultaPlanProduccionCs.OrdenPP.split(',').map(item => {
                    const [key, value] = item.split('=');
                    return [key, value];
                })
            );

            // Combina ambos objetos para conseguir un objeto como el comentado
            const result = Object.keys(ConsultaPlanProduccionCs.configuracionPP).reduce((acc, key) => {
                acc[key] = {
                    Orden: orderMap[key],
                    Visible: ConsultaPlanProduccionCs.configuracionPP[key]
                };
                return acc;
            }, {});

            //ConsultaPlanProduccionCs.configuracionPP = {
            //    "ComentariosExtras": {
            //        "Orden": "1",
            //        "Visible": "SI"
            //    },
            //    "Prioridad": {
            //        "Orden": "2",
            //        "Visible": "SI"
            //    },
            //    "UbicacionPropuesta": {
            //        "Orden": "3",
            //        "Visible": "NO"
            //    }
            //};

            //console.log(result);
            ConsultaPlanProduccionCs.configuracionPP = result;
            ConsultaPlanProduccionCs.configuracionPP["usuario"] = sessionStorage.getItem("email");
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
        ConsultaPlanProduccionCs.table = ConsultaPlanProduccionCs.PlanesProduccion("FALSE");

    });

    //Muestra la hoja de especificaciones en nueva pestaña
    $(document).on("click", ".hojaEsp", function () {
        articulo = $(this).attr("itemcode");
        linea = $(this).attr("linea");
        if (articulo != "" && articulo != null) {
            localStorage.setItem("articulo", articulo);
            localStorage.setItem("linea", linea);
            window.open('/Produccion/HojaEspecificaciones', '_blank');
        }
    });

    $("#swichCapLinea").on("change", function () {
        if ($(this).is(":checked")) {
            ConsultaPlanProduccionCs.showCapLineaPlan()
        }
        else {
            ConsultaPlanProduccionCs.hideCapLineaPlan()
        }
    });


    $(document).on('click', '.btn-eliminarME', function () {
        $('#modalEliminarMaterialE').modal('show');
    });


    // Paro de linea
    $(document).on("click", ".ParoLineaPP", function (e) {
        e.stopPropagation();

        // Guarda la fila completa
        ConsultaPlanProduccionCs.rowselectedparo = $(this).closest('tr');

        let Linea = $(this).data('linea');
        let Fecha = ConsultaPlanProduccionCs.getFechaHoraSQL();

        $("#Linea").val(Linea);
        $("#FechaParo").val(Fecha);
        $('#modalParoTitulo').text('Registrar Nuevo Paro');
        $('#ParoModal').modal('show');
    });

    $(document).on("click", "#btnOrdenTrabajo", function (e) {    
        const $sub = $('#subOT');
        const $icon = $('#iconOT');
        const abierto = $sub.is(':visible');

        $sub.slideToggle(200);
        $icon.css('transform', abierto ? 'rotate(0deg)' : 'rotate(180deg)');
    });

    //Modales de confirmacion
    //Impresion de materiales
    $(document).on("click", ".btn-generaEtiqueta", function () {
        ConsultaPlanProduccionCs.ConfirmarPrintEtiqueta();

    });

    //Guardado de información
    $(document).on("click", ".btn-guardarInfo", function () {
        //Obtencion de datos generales
        let planProduccion = $(this).data('planproduccion');
        let ordenFabricacion = $(this).data('ordenfabricacion');
        let pedido = $(this).data('pedido');
        let linea = $(this).data('linea');
        let btnIdentificado = $(this).data('btnguardarinfo');



        ConsultaPlanProduccionCs.ConfirmarGuardado(planProduccion, ordenFabricacion, pedido, linea, btnIdentificado);

    });

    //Eliminacion de materiales
    $(document).on("click", ".btn-eliminarME", function () {
        ConsultaPlanProduccionCs.ConfirmarEliminar();       
    });

    //Solicitar autorizacion
    $(document).on("click", ".btn-solicitarAut", function () {
        ConsultaPlanProduccionCs.ConfirmarAutorizacion();
    });

    //Generar Emision
    $(document).on("click", ".btn-genEmision", function () {
        let tipoEmision = $(this).data('btnemision');
        
        switch (tipoEmision) {
            case "btn-emisionMatCMM":
                ConsultaPlanProduccionCs.ConfirmarEmisionCMM();
                break;
            default:
                ConsultaPlanProduccionCs.ConfirmarEmision();
                break;
        }

       
    });

    //Generar la devolucion
    $(document).on("click", ".btn-generaDevolucion", function () {
        ConsultaPlanProduccionCs.ConfirmarDevolucion();
    });

    //Solicitar autorizacion
    $(document).on("click", ".btn-solicitarAutMaq", function () {

        let tipoAutorizacion = $(this).data('btnsolicitaraut');

        switch (tipoAutorizacion) {
            case "btn-solicitarAutMatCMM":
                ConsultaPlanProduccionCs.ConfirmarAutorizacionMatMaq();
                break;
            default:
                ConsultaPlanProduccionCs.ConfirmarAutorizacion();
                break;
        }

       
    });

    $(document).on('input', '.input-molido', function () {

        ConsultaPlanProduccionCs.ActualizarPorcentajeMolido(this);

    });

    $(document).on('click', '#alertReserva', function (e) {

        e.preventDefault();
        $("#nav-Rfibras-tab").tab("show");

    });

    //Contracciones de Area
    $('.btnToggleSeccion').on('click', function () {

        var target = $(this).data('target');
        var icono = $(this).find('i');

        $(target).slideToggle(1000);

        icono.toggleClass('bi-chevron-up bi-chevron-down');
    });

    //Mostrar modal de autorizacion para cambios de turno
        //Guata y Filtro
    $(document).on('change', 'input[name="tipoTurno"]', function () {

        let nuevoTurno = $(this).val();

        if (nuevoTurno === ConsultaPlanProduccionCs.turnoActual)
            return;

        ConsultaPlanProduccionCs.turnoPendiente = nuevoTurno;

        // Regresar el radio al turno actual
        $('input[name="tipoTurno"][value="' + ConsultaPlanProduccionCs.turnoActual + '"]')
            .prop('checked', true);

        // Abrir modal
        $('#modalAutorizacionTurno').modal('show');

    });

        //Maquila
    $(document).on('change', 'input[name="tipoTurnoM"]', function () {

        let nuevoTurno = $(this).val();

        if (nuevoTurno === ConsultaPlanProduccionCs.turnoActual)
            return;

        ConsultaPlanProduccionCs.turnoPendiente = nuevoTurno;

        // Regresar el radio al turno actual
        $('input[name="tipoTurnoM"][value="' + ConsultaPlanProduccionCs.turnoActual + '"]')
            .prop('checked', true);

        // Abrir modal
        $('#modalAutorizacionTurno').modal('show');

    });


    //=================================================================================
    //========================= Eventos y funcionalidad ===============================
    //Botones modal produccion GyF y Maquila
    $(document).on('click', '#btn-Mproduccion', function () {
        //Se obtiene la informacion de la cabecera
        let planProduccion = $(this).data('planproduccion');
        let ordenFabricacion = $(this).data('ordenfabricacion');
        let pedido = $(this).data('pedido');
        let linea = $(this).data('linea');
        let cantidad = $(this).data('cantidad');
        let fechaIni = $(this).data('fechaini');
        let articulo = $(this).data('articulo');
        let estatus = $(this).data('estatus').charAt(0).toUpperCase() + $(this).data('estatus').slice(1) ;
        let piezasproducidas = $(this).data('piezasproducidas');

        //Limpieza de contenido modal producción
        $('#content-encabezado-MProd').html("");
        $('#especificacion-folio').html("");

        //Asignacion color de estatus en producción
        let estatusColor = "";
        switch (estatus) {
            case 'En cola':
                estatusColor = "pendiente"
                break;
            default:
                estatusColor = "terminado"
                break;
        }

        //funciones armado de modal produccion
        ConsultaPlanProduccionCs.informacionEncabezadoProd(planProduccion, ordenFabricacion, pedido, linea, cantidad, fechaIni, articulo, estatusColor, estatus, piezasproducidas);

    });

    //Seccion de Reserva de polietileno
    $(document).on('click', '#nav-RPolietileno-tab', function () {

        // Limpieza de modal produccion - seccion Reserva polietileno
        $('#basculaConexion').html("");
                   

        // Construccion de indicador bascula
        ConsultaPlanProduccionCs.indicadorBascula();


        ConsultaPlanProduccionCs.mostrarRegistrosRPolietileno();
    });
    //=================================================================================
    //=================================================================================
});


