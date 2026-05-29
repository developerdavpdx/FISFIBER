class ConsultaEdicionPV {
    constructor() {
        // * Atributos para guardar los datos de la lista de las ordenes de venta agrupados por linea
        this.subtablelinedetailsbody = `<div class="card">
                                                <div class="card-body ReportHeader">
                                                    <div class="row justify-content-center align-items-center" >
                                                        <div class="col-7 text-center">
                                                            <div class="text-center pt-3">
                                                                <span class="ps-2">
                                                                    PLAN DE VENTAS {linea}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                <div class="col-md-12 p-0 body-table table-scroll">
                                <table id="{id}" class="table table-preview table-striped m-0 tableReport" style="table-layout:fixed">
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
        this.RevCyC = false;
        this.Revision = "";
        this.FechaRevision = "";
        this.hasfechaentrega;
        // * atributos para obtener datos de la vista previa del plan de produccion
        this.previewdataPP;
        this.grouppreviewdataPP;
        this.ExcludeColumsPP = ["NumReproSAP", "DocEntry", "id", "folio","EntregaParcial", "Autorizado", "AuthRepro","NumRepro","Orden"];
        this.ColumnsWithEdit = ["NumeroViaje","PiezasEntrega"];
        this.ColumnsWithEditTime = ["HoraEntrega"];
        this.ColumnsWithEditDate = [];
        this.ColumnsWithEditProduccion = [];

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
        
        this.columnasrestantes = "";
        this.idTablaSelected = "";

    }
    //Listado de planes de produccion
    PlanesVentas() {
        try {
            let table = $("#PlanesVentas").DataTable(
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
                        { width: '250px', targets: [0,1] }, 
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

            //PlanVentas/GetPlanesVetnasDetails
            this.anydata = await $.ajax({
                url: this.action,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    folio: this.FolioPP,
                    usuario: sessionStorage.getItem("email"),
                    tabla: "PlanesVentas"
                }
            });


            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                //Limpiar el contenedor
                $("#reportbyline").empty();
                //Obtener los datos
                let dataPP = JSON.parse(this.anydata.Data);
                let infoPV= JSON.parse(this.anydata.Other);
                //this.previewdataPPT = JSON.parse(this.anydata.Other);

                //this.previewdataPP = this.mergeAndSortByOrden(dataPP, this.previewdataPPT);
                this.previewdataPP = dataPP;

                if (infoPV) {
                    this.RevCyC = infoPV[0].RevCyC;

                    let estPVCC = "Pendiente Revisión CyC";
                    let bgColor = "bg-warning";

                    if (this.RevCyC) {
                        estPVCC = "Revisado Por CyC";
                        bgColor = "bg-success";
                        $("#estPVCC").removeClass("bg-warning");

                    }
                    else {
                        $("#estPVCC").removeClass("bg-success");
                    }

                    $("#estPVCC").text(estPVCC);
                    $("#estPVCC").addClass(bgColor);


                }

                let headerBitacora = JSON.parse(this.anydata.ExtraData);
                let columnasrestantes = "";
                let celdasrestantes = "";

                this.anydata = "";
                this.subtablelinedetails = this.subtablelinedetailsbody;

                $.each(this.previewdataPP, function (index, item) {
                        //Generar encabezado dinamicamente para el resto de columnas
                    if (index == 0) {

                        $.each(item, function (indexitem, itemdata) {
                                

                                if (!ConsultaEdicionPVCs.ExcludeColumsPP.includes(indexitem)) {
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
                    ConsultaEdicionPVCs.anydata += `<tr id="rowppd${item.id}" idppd="${item.id}" document="${item.DocEntry}" Folio="${item.folio}" class="ui-sortable-handle pedidoVenta row${item.DocEntry}">`;

                        $.each(item, function (indexitem, itemdata) {
                            if (!ConsultaEdicionPVCs.ExcludeColumsPP.includes(indexitem)) {

                                hasedit = "";

                                //editMe
                                if (ConsultaEdicionPVCs.ColumnsWithEdit.includes(indexitem)) {
                                    hasedit = "editMe";
                                }
                                //TimeEdit
                                else if (ConsultaEdicionPVCs.ColumnsWithEditTime.includes(indexitem)) {
                                    hasedit = "TimeField";
                                }
                                //DateEdit
                                else if (ConsultaEdicionPVCs.ColumnsWithEditDate.includes(indexitem)) {
                                    hasedit = "DateField";
                                }

                                let idC = indexitem;
                                let data = itemdata;

                                if (indexitem.includes("Hora"))
                                    data = LayoutCs.parseHora(data);
                                    

            
                                celdasrestantes +=
                                    `<td 
                                        class="${idC} ${hasedit}"  
                                        data-id="${LayoutCs.SpaceByUppercase(idC)} Pedido: ${item.Pedido}" 
                                        data-name="${idC}">
                                        ${data}
                                    </td>`;
                            }
                        });


                        //Agregar celdas
                        ConsultaEdicionPVCs.anydata += celdasrestantes;
                        //Cerrar la fila
                        ConsultaEdicionPVCs.anydata += `</tr>`;
                    });
                //Agregar las OV agrupadas por linea
                let idTabla = this.FolioPP.replace("-", "");

                ConsultaEdicionPVCs.subtablelinedetails = ConsultaEdicionPVCs.subtablelinedetails
                    .replace("{id}", ("PVDetails" + idTabla))
                        .replace("{linea}", this.FolioPP)
                        .replace("{rows}", ConsultaEdicionPVCs.anydata)
                        .replace("{restheaders}", columnasrestantes)
                  
                let tablaFinal = ConsultaEdicionPVCs.subtablelinedetails.trim()
                console.log(tablaFinal);

                //Datos de encabezados

                if (headerBitacora.length > 0) {
                    let headerPlan = headerBitacora[0];
                    //$("#revisionPv").text(headerPlan.Revision);
                    $("#fecha-documento").text(headerPlan.fecha);
                    $("#folioPV").text(headerPlan.folio + '-' + headerPlan.Revision);

                    //Numero de revision para excel
                    $("#DescargarPlanVentas").attr("revision", headerPlan.Revision);
                }
                else {
                    console.error(`Ajax PlanesVentasDetails. El header del plan esta vacio (Revision, Fecha, Folio): ${headerBitacora}`);
                }
               

                
                

                $("#reportbyline").append(tablaFinal);
                ConsultaEdicionPVCs.MakeTableEditableWithBitacora(("PVDetails" + idTabla));
                LayoutCs.enableRowSorting("PVDetails" + idTabla, 1);

                this.idTablaSelected = "PVDetails" + idTabla;

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

                    ConsultaEdicionPVCs.subtabledetails += `<tr>
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
                    "PlanVentas": JSON.stringify(this.modifieddata),
                    "folioPP": this.FolioPP,
                    "HistorialEdiciones": this.historymodified,
                    "usuario": sessionStorage.getItem("email"),
                    "Tabla": "PlanesVentas",
                    "FilasM": JSON.stringify(this.filasMuestra),
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                this.ReiniciarPagina();
                LayoutCs.Alerta("Plan de producción", "Plan de producción actualizado correctamente.", "OK");
                ConsultaEdicionPVCs.historymodified = "";
                ConsultaEdicionPVCs.whitelinealreadysaved = true;
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
                    Tabla: "PlanesVentas"
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                this.extradata = JSON.parse(this.anydata.Data);
                var rows = "";
                $.each(ConsultaEdicionPVCs.extradata, function (index, item) {

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



                $.each(ConsultaEdicionPVCs.response, function (index, item) {
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
                    return $(elem).find('input').val().trim();
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


        // Configuración personalizada para el campo de hora con AM/PM
        //advancedEditor.SetEditableClass("TimeField", {
        //    internals: {
        //        renderEditor: (elem, oldVal) => {
        //            // Convertir a formato de 24 horas para el input
        //            const [timeValue, period] = oldVal.split(' ');
        //            let [hours, minutes, seconds] = timeValue.split(':');
        //            hours = parseInt(hours);

        //            // Ajustar a formato de 24 horas si es necesario
        //            if (period === 'p.m.' && hours < 12) hours += 12;
        //            if (period === 'a.m.' && hours === 12) hours = 0;

        //            const time24 = `${String(hours).padStart(2, '0')}:${minutes}:${seconds || '00'}`;

        //            // Crear el input de tiempo en formato 24 horas
        //            $(elem).html(`<input type="time" class="form-control mt-2" value="${time24}" step="1">`);
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

        //                return `${hours}:${minutes}:${seconds || '00'} ${period}`;
        //            }
        //            return '';
        //        },
        //    }
        //});

        //advancedEditor.SetEditableClass("TimeField", {
        //    internals: {
        //        renderEditor: (elem, oldVal) => {
        //            // Convertir de 12h a 24h si es necesario
        //            const [timeValue, period] = oldVal.split(' ');
        //            let [hours, minutes, seconds] = timeValue.split(':');
        //            hours = parseInt(hours);

        //            if (period === 'p.m.' && hours < 12) hours += 12;
        //            if (period === 'a.m.' && hours === 12) hours = 0;

        //            const time24 = `${String(hours).padStart(2, '0')}:${minutes}:${seconds || '00'}`;
        //            $(elem).html(`<input type="time" class="form-control mt-2" value="${time24}" step="1">`);
        //        },
        //        extractEditorValue: (elem) => {
        //            // Solo devolver el valor tal como lo da el input (formato 24h)
        //            const timeValue = $(elem).find('input').val();
        //            return timeValue || '';
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

        // Detectar edición de celdas y obtener el nombre de la celda
        $("#" + table).on('change', '.editMe, .TimeField, .DateField,.EstatusProduccionData, .editLinea , .editMeNumber', function () {
            var cell = $(this).closest('td'); // Obtener la celda más cercana
            var cellName = cell.data('id'); // Asumiendo que existe un atributo 'data-id'
            var cellOldValue = cell.html();
            if (cellName && !ConsultaEdicionPVCs.historymodified.includes(cellName)) {
                ConsultaEdicionPVCs.historymodified += cellName + "\n";
            }
            cell.addClass("sendOV")
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
        ConsultaEdicionPVCs.anydata = "";
        $.each(datos, function (index, item) {
            ConsultaEdicionPVCs.anydata += `<tr>
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
        $("#BitacoraDetailsList tbody").append(ConsultaEdicionPVCs.anydata);
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
        $('#PlanesVentas tbody tr').find('td').removeClass('PPselected');
        // Quitar el ícono de flecha derecha de todas las filas
        $('#PlanesVentas tbody tr').find('td:first-child .fa-arrow-right').remove();

        location.reload();

    }
    //Reordenar configuracion PP
    ReordenarConfigPP() {

    }

    async DeleteItemPlanDetails(idPPD) {
        try {
            //Datos de PP
            Loading();

            //PlanVentas/DeleteItemPV
            let urlDelete = $("#deleteRow").attr("deleteDetails");

            this.anydata = await $.ajax({
                url: urlDelete,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    id: idPPD,
                    Usuario: sessionStorage.getItem("email")
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                $("#MenuContextDeleteRow").hide();
                $(`#rowppd` + idPPD).remove();
                LayoutCs.Alerta("Plan ventas", "El pedido se elimino correctamente", "OK");
            }
            else {
                LayoutCs.Alerta("Plan ventas", this.anydata.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("❌ No es posible eliminar el pedido: " + error, "Plan ventas");
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

    //
    async FinalizarPlan() {
        try {

            Loading();

            let urlFinPlan = $('#PlanesVentas').attr("finalizarPlan");

            const response = await $.ajax({
                url: urlFinPlan,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    "folio": ConsultaEdicionPVCs.FolioPP
                }
            });
            if (response.Status == "OK") {

                StopLoading();

                //console.log(response);
                $("#ConFinalizacion").modal("hide");
                LayoutCs.Alerta(
                    "Plan Ventas",
                    "Plan " + ConsultaEdicionPVCs.FolioPP + " finalizado",
                    "OK"
                )

                setTimeout(() => window.location.reload(), 2000);

                //setTimeout(() => window.reload(), 1000);


            }

            else {
                StopLoading();
                LayoutCs.Alerta("Plan de ventas", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de ventas");
            StopLoading();

        }
    }

    async EnviarReporteCyC() {
        try {

            Loading();

            let urlFinPlan = $('#PlanesVentas').attr("enviarReporteCyC");

            const response = await $.ajax({
                url: urlFinPlan,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    "folio": ConsultaEdicionPVCs.FolioPP
                }
            });
            if (response.Status == "OK") {

                StopLoading();

                LayoutCs.Alerta(
                    "Plan Ventas",
                    "Reporte CyC de Plan " + ConsultaEdicionPVCs.FolioPP + " ha sido enviado.",
                    "OK"
                )

                //setTimeout(() => window.location.reload(), 2000);
            }

            else {
                StopLoading();
                LayoutCs.Alerta("Plan de ventas", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de ventas");
            StopLoading();

        }
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
const ConsultaEdicionPVCs = new ConsultaEdicionPV();

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

//EVENTOS
$(function () {

    // Validación de formularios
    $(document).on('submit', '.needs-validation', ValidacionFormularios);
    //Consultar los planes de producción(listado)
    ConsultaEdicionPVCs.action = $("#PlanesVentas").attr("action");
    ConsultaEdicionPVCs.table = ConsultaEdicionPVCs.PlanesVentas();

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

            LayoutCs.updateHeaderISO("PlanOV", fl, fr, code, nivel, rev);
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
    $('#PlanesVentas tbody').on('click', 'tr.PP', function () {
        try {
            //Obtener url consulta
            ConsultaEdicionPVCs.action = $("#PlanesVentas").attr("details");
            ConsultaEdicionPVCs.rowdata = ConsultaEdicionPVCs.table.row(this).data();
            ConsultaEdicionPVCs.FolioPP = $(this).attr("folio"); //DOCENTRY
            ConsultaEdicionPVCs.current_row = $(this);
            ConsultaEdicionPVCs.row = ConsultaEdicionPVCs.table.row(ConsultaEdicionPVCs.current_row);

            // Quitar clase PPselected de todas las filas
            $('#PlanesVentas tbody tr').find('td').removeClass('PPselected');
            // Quitar el ícono de flecha derecha de todas las filas
            $('#PlanesVentas tbody tr').find('td:first-child .fa-arrow-right').remove();
            // Añadir clase PPselected a las celdas de la fila seleccionada
            $(this).find('td').addClass('PPselected position-relative');
            // Añadir ícono de flecha derecha a la primera celda de la fila seleccionada
            $(this).find('td:first-child').append('<i class="fas fa-arrow-right iconPPselected"></i>');
             //realizar peticion para obtener detalles del plan de produccion
             ConsultaEdicionPVCs.PlanesVentasDetails()
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
            ConsultaEdicionPVCs.action = $("#PlanesVentas").attr("update");

            //Verificar si un checbox fue cambiado
            let nuevasFilas = $(".tableReport tbody tr.muestraOF").length > 0;

            //Si algo fue modificado
            if (ConsultaEdicionPVCs.historymodified != "Cambió: " || nuevasFilas) {
                $('.sendOV').each(function (index) {
                    // Encuentra la fila (tr) que contiene el checkbox
                    const fila = $(this).closest('tr');
                    // Crea un objeto vacío para almacenar los valores de la fila
                    let filaData = {};
                    let idrow = fila.attr("idppd")
                    let existe = ConsultaEdicionPVCs.modifieddata.find(r => r.id == idrow)
                    if (!existe) {
                        filaData.id = idrow;
                        //Dando formato para guardado en SAP
                        filaData.HoraEntrega = fila.find('td.HoraEntrega')
                            .text().trim()
                            .replace(/:(..)$/, '')
                            .replace(/:/g, '')
                            .replace('-', ''); 
                        filaData.PiezasEntrega = fila.find('td.PiezasEntrega').text().trim();
                        filaData.NumeroViaje = fila.find('td.NumeroViaje').text().trim();

                        // Añade el objeto al array de resultados
                        ConsultaEdicionPVCs.modifieddata.push(filaData);
                    }

                });

                $('.muestraOF').each(function (index) {
                    // Encuentra la fila (tr) que contiene el checkbox
                    const fila = $(this);

                    // Crea un objeto vacío para almacenar los valores de la fila
                    let filaData = {};


                    filaData["DocEntry"] = LayoutCs.RandomDocEntry(); // Obtener el valor del checkbox

                    // Recorre cada celda dentro de la fila
                    fila.find('td[data-name]').each(function () {
                        // Obtén el nombre de la propiedad desde el atributo data-name
                        const key = $(this).data('name');

                        // Obtén el valor de la celda
                        const value = $(this).text().trim();

                        // Asigna el valor a la clave en el objeto filaData
                        filaData[key] = value;
                    });

                    filaData.Orden = "-1";

                    // Añade el objeto al array de resultados
                    ConsultaEdicionPVCs.filasMuestra.push(filaData);

                });


                //console.log(ConsultaEdicionPVCs.modifieddata)

                ConsultaEdicionPVCs.UpdatePlanProduction();

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
    $('#PlanesVentas tbody').on('click', '.bitacoraPP', function (event) {
        //Detener la propagacion del evento hacia la fila
        event.stopPropagation();
        ConsultaEdicionPVCs.action = $("#PlanesVentas").attr("bitacora");
        ConsultaEdicionPVCs.FolioPP = $(this).attr("value");
        ConsultaEdicionPVCs.BitacoraPlanProduccion();

    });

    //Descargar Plan Ventas
    $("#DescargarPlanVentas").on("click", function () {
        try {
            let folio = ConsultaEdicionPVCs.FolioPP+"_PlanVentas";
            let revision = $(this).attr("revision"); //Poner numero revision 
            LayoutCs.ExportarExcelExcelJS(
                ConsultaEdicionPVCs.idTablaSelected,
                folio,
                revision,
                "Plan Ordenes Venta Folio: " + ConsultaEdicionPVCs.FolioPP);
        }
        catch (error) {
            LayoutCs.Alerta(
                "Plan de ventas",
                "No es posible descargar el plan de ordenes de venta: " + error);
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
            ConsultaEdicionPVCs.ovdetails = $("#PlanesVentas").attr("ovdetails");

            ConsultaEdicionPVCs.DocEntry = DocEntryOV //DOCENTRY
            let isShow = $(this).attr("isShowChild");



            if (isShow == "1") {
                $(`#row${ConsultaEdicionPVCs.DocEntry}child`).remove();
                // Quitar clase PPselected de todas las filas
                $('#reportbyline tbody tr').find('td').removeClass('OVselected');
                // Quitar el ícono de flecha derecha de todas las filas
                $('#reportbyline tbody tr').find('td:first-child .fa-arrow-right').remove();

                $(this).attr("isShowChild", "0");
            }
            else {
                //realizar peticion para obtener detalles
                ConsultaEdicionPVCs.OVDetail();
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


  
    //Guardar configuración de el plan de produccion
    $("#GuardaConfigPP").on("click", function () {
        try {
            //Limpiar variables
            ConsultaEdicionPVCs.configuracionPP = {};

            $('.configuracionbyPP').each(function (index) {
                // Obtén el id del checkbox y usa limpiarTexto para quitar acentos y espacios
                let id = LayoutCs.limpiarTexto(this.id);

                // Asigna el id como clave y el valor "SI" o "NO" como valor
                ConsultaEdicionPVCs.configuracionPP[id] = { "Visible": this.checked ? "SI" : "NO", "Orden": (index + 1) };

            });

            ConsultaEdicionPVCs.action = $("#PlanesVentas").attr("updateconfiguracion");
            ConsultaEdicionPVCs.InsertaConfigxUsuarioPP();
        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No fue posible actualizar la configuración para el plan de producción, por favor intenta de nuevo mas tarde: " + error);
            StopLoading();

        }
    });
  

    // Evita que el checkbox interrumpa el arrastre
    $("#configuracionPPContainer .form-check").on("mousedown", function (e) {
        e.stopPropagation(); // Evita conflictos con sortable
    });

    //Abrir modal de finalcacion del un plan 
    $("#BtnFinalizacion").on("click", function () {

        if (ConsultaEdicionPVCs.RevCyC) {
            $("#ConFinalizacion .modal-title").text("¿Quieres continuar?");
            $("#ConFinalizacion .message").text("Una vez finalizado el plan, ya no será posible editarlo.");
            $("#CancelFinalizacion").text("Cancelar");
            $("#ConfirmFinaliacion").prop("disabled", false);
            $("#ConfirmFinaliacion").removeClass("d-none");
        }
        else {
            $("#ConFinalizacion .modal-title").text("Operación Invalida");
            $("#ConFinalizacion .message").text("🛑 El plan aun no ha sido revisado por Credito y Cobranza");
            $("#CancelFinalizacion").text("Cerrar");
            $("#ConfirmFinaliacion").prop("disabled", true);
            $("#ConfirmFinaliacion").addClass("d-none");
        }

        $("#ConFinalizacion").modal("show");
    });

    $("#ConfirmFinaliacion").on("click", function () {
        // 1. Cambiar estatus del plan a finalizado
        ConsultaEdicionPVCs.FinalizarPlan()
    });

    $("#CancelFinalizacion").on("click", function () {
        $("#ConFinalizacion").modal("hide");
    });

    $("#BtnEnviarReporte").on("click", function () {
        // 1. Enviar reporte de CyC
        ConsultaEdicionPVCs.EnviarReporteCyC()
    });
    

    // Ocultar menú contextual al hacer clic en cualquier lugar
    $(document).on("click", function () {
        $("#MenuContextDeleteRow").hide();
    });

    $(document).on("click", "#deleteRow", function () {
        let idppd = $("#MenuContextDeleteRow").data("idppd");
      
        ConsultaEdicionPVCs.DeleteItemPlanDetails(idppd);
    });

    $(document).on("click", "#addRow", function () {

        ConsultaEdicionPVCs.whitelinealreadysaved = false;
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
        let folio = firstRow.find("td.Folio").text();

        // Limpiar el contenido de las celdas
        let idppd = LayoutCs.generarCadenaAleatoria(8);
        firstRow.find("td").text("");
        firstRow.find("td").attr("id", "");
        firstRow.find("td").removeAttr("data-id");
        firstRow.attr("document", idppd);
        firstRow.addClass("muestraOF", idppd);

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
        firstRow.find('td:nth-child(1)').prepend('<i class="bi bi-x-circle-fill iconremoverowVentas" data-index="' + rowIndex + '"></i>');
        //firstRow.prepend('<i class="bi bi-x-circle-fill iconremoverow" data-index="' + rowIndex + '"></i>');

        // Añadir attributo newRow para identificar en siguiente paso
        firstRow.find('td.Linea').attr("newRow", "TRUE");
        firstRow.find('td.Folio').text(folio.trim());

        // Agregar la clase editMe a las celdas que no tengan las clases CustomOptions o TimeField
        firstRow.find("td:not(.CustomOptions):not(.TimeField)").addClass("editMe");
        firstRow.find('td.F_Pedido').removeClass("editMe").addClass("DateField");
        firstRow.find('td.F_SolicitudProduccion').removeClass("editMe").addClass("DateField");
        firstRow.find('td.F_OriginalEntrega').removeClass("editMe").addClass("DateField");
        firstRow.find('td.F_Entrega').removeClass("editMe").addClass("DateField");
        firstRow.find('td.HoraFin').removeClass("editMe").addClass("TimeField");
        firstRow.find('td.HoraInicio').removeClass("editMe").addClass("TimeField");
        firstRow.find('td.HoraEntrega').removeClass("editMe").addClass("TimeField");
        firstRow.find('td.CantidadMetros').removeClass("editMe").addClass("editMeNumber");
        firstRow.find('td.NumRollos').removeClass("editMe").addClass("editMeNumber");
        firstRow.find('td.PiezasEntrega').removeClass("editMe").addClass("editMeNumber");
        firstRow.find('td.DistRecorrida').removeClass("editMe").addClass("editMeNumber");
         
        
        //Eliminar id, sumcap de fila
        firstRow.attr("id", `newrow${idppd}`);
        firstRow.find("td.Comentarios").text("Esta es un pedio de contenedor.");

        ConsultaEdicionPVCs.newRowsTR.push(idppd);

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
    $(document).on("contextmenu", "#PlanesVentas tbody tr", function (e) {
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
        //const firstCell = $(this).find("td:first-child"); // Selecciona la primera celda
        const idppd = $(this).attr("idppd");// Atributo que necesitas
            //firstCell.attr("idppd"); 

        const folioCell = $(this).find("td.Folio"); // Selecciona la primera celda
        const folio = folioCell.text().trim(); // Atributo que necesitas


        // Asignar el atributo idppd al menú contextual
        $("#MenuContextDeleteRow").data("idppd", idppd);
        $("#MenuContextDeleteRow").data("folio", folio);

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

    

});
