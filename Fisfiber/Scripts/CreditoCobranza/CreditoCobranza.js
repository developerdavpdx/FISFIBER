class PlanVentasCC {
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
                                <div class="col-md-12 p-0 body-table">
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
        this.Revision = "";
        this.FechaRevision = "";
        this.hasfechaentrega;
        // * atributos para obtener datos de la vista previa del plan de produccion
        this.previewdataPP;
        this.grouppreviewdataPP;
        this.ExcludeColumsPP = [
            "DocEntry", "id","folio", "PiezasEntrega","Autorizado","Orden"
        ];

        this.widthColumn =
        {
            'Linea': 100,
            'Articulo': 150,
            'MetrosRollo': 150,
            'CodigoCliente': 150,
            'Pedido': 130,
            'CantidadMetros': 150,
            'NumRollos': 120,
            'F_Entrega': 120,
            'Comentarios': 200,
            'Cliente': 200,
            
        }

        this.ColumnsWithEdit = ["NumeroViaje", "PiezasEntrega"];
        this.ColumnsWithEditTime = ["HoraEntrega"];
        this.ColumnsWithEditDate = [];

        this.IdPPDOverflow = [];
        this.DataUpdate = [];
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
            LayoutCs.Excepcion("No es posible mostrar los planes de producción: " + error, "Plan de ventas");
            StopLoading();

        }
    }
    //Detalles de plan de produccion
    async PlanesVentasDetails() {
        try {
            //Datos de PP
            // PlanVentas/GetPlanesVentasDetailsCyC
            Loading();
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
                let infoPVD = JSON.parse(this.anydata.Other);
                //this.previewdataPPT = JSON.parse(this.anydata.Other);

                // this.previewdataPP = this.mergeAndSortByOrden(dataPP, this.previewdataPPT);
                //dataPP = dataPP.filter((d)=> d.Autorizado)
                this.previewdataPP = dataPP;

                let estPVCC = "Pendiente Revisión CyC";
                let bgColor = "bg-warning";

                if (infoPVD[0].RevCyC) {
                    estPVCC = "Revisado Por CyC";
                    bgColor = "bg-success";
                    $("#CheckRevCyC").addClass("d-none");
                    $("#estPVCC").removeClass("bg-warning");

                }
                else {
                    $("#CheckRevCyC").removeClass("d-none");
                    $("#estPVCC").removeClass("bg-success");
                }

                $("#estPVCC").text(estPVCC);
                $("#estPVCC").addClass(bgColor);

                let headerBitacora = JSON.parse(this.anydata.ExtraData);
                let columnasrestantes = "";
                let celdasrestantes = "";

                this.anydata = "";
                this.subtablelinedetails = this.subtablelinedetailsbody;

                $.each(this.previewdataPP, function (index, item) {
                    //Generar encabezado dinamicamente para el resto de columnas
                    if (index == 0) {
                        columnasrestantes +=
                            `<th id="Autorizado" width="150">Autorizado</th>`;
                        $.each(item, function (indexitem, itemdata) {

                            let width = 200;
                            let widthObj = PlanVentasCs.widthColumn[indexitem];

                            if (!PlanVentasCs.ExcludeColumsPP.includes(indexitem)) {
                                let textoH = LayoutCs.SpaceByUppercase(indexitem);
                                let idH = indexitem;

                                if (widthObj) {
                                    width = widthObj;
                                }

                                columnasrestantes +=
                                    `<th id="${idH}" width="${width}">${textoH.toUpperCase()}</th>`;
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
                    PlanVentasCs.anydata +=
                        `<tr 
                            id="rowppd${item.id}" 
                            idppd="${item.id}" 
                            document="${item.DocEntry}" 
                            Folio="${item.folio}" 
                            class="ui-sortable-handle pedidoVenta row${item.DocEntry}">
                                <td
                                  class="CustomStatus"  
                                  idppd="${item.id}" 
                                  data-id="Autorizado Pedido: ${item.Pedido}" 
                                  data-name="Autorizado">
                                  ${item.Autorizado ? "Autorizado": "No Autorizado"}
                                </td>
                          `;

                    $.each(item, function (indexitem, itemdata) {
                        if (!PlanVentasCs.ExcludeColumsPP.includes(indexitem)) {

                            hasedit = "";


                            let idC = indexitem;
                            let data = itemdata;


                            if (indexitem == "HoraEntrega")
                                data = LayoutCs.parseHora(data);

                            if (indexitem == "CantidadMetros" || indexitem == "MetrosRollo")
                                data = parseFloat(data).toFixed(2);

                            if (data == null) data = "";

                            celdasrestantes +=
                                `<td 
                                        class="${idC}"  
                                        data-id="${LayoutCs.SpaceByUppercase(idC)} Pedido: ${item.Pedido}" 
                                        data-name="${idC}">
                                        ${data}
                                    </td>`;
                        }
                    });


                    //Agregar celdas
                    PlanVentasCs.anydata += celdasrestantes;
                    //Cerrar la fila
                    PlanVentasCs.anydata += `</tr>`;
                });
                //Agregar las OV agrupadas por linea
                let idTabla = this.FolioPP.replace("-", "");

                PlanVentasCs.subtablelinedetails = PlanVentasCs.subtablelinedetails
                    .replace("{id}", ("PVCCDetails" + idTabla))
                    .replace("{linea}", this.FolioPP)
                    .replace("{rows}", PlanVentasCs.anydata)
                    .replace("{restheaders}", columnasrestantes)

                let tablaFinal = PlanVentasCs.subtablelinedetails.trim()
                //console.log(tablaFinal);

                if (headerBitacora.length > 0) {
                    //Datos de encabezados
                    let headerPlan = headerBitacora[0];
                    //$("#revisionPV").text(headerPlan.Revision);
                    $("#fecha-documento").text(headerPlan.fecha);
                    $("#folioPV").text(headerPlan.folio + '-' + headerPlan.Revision);

                    //Numero de revision para excel
                    $("#DescargarPlanVentas").attr("revision", headerPlan.Revision);
                }
                else {
                    console.error("EL header del plan esta vacio. No esta historial en bitacora")
                }
                


                $("#reportbyline").append(tablaFinal);
                PlanVentasCs.MakeTableEditableWithBitacora(("PVCCDetails" + idTabla));


                this.idTablaSelected = "PVCCDetails" + idTabla;

                $("#folioseleccionado").text(this.FolioPP);
                $("#actualizar").removeClass("d-none");
                $("#PPHeader").removeClass("d-none");
                $("#PPHeaderTitle").addClass("d-none");
                $("#ContenedorBtnExcel").removeClass("d-none");


            }
            else {
                LayoutCs.Alerta("Plan de ventas", this.anydata.Message + " si agregaste líneas en blanco no olvides dar click en actualizar para que sea guardado el registro correctamente.");
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible consultar el plan de produccion: " + error, "Plan de ventas");
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

                    PlanVentasCs.subtabledetails += `<tr>
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
            //CreditoCobranza/UpdateEstatusOV
            Loading();
            this.anydata = await $.ajax({
                url: this.action,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    "PlanVentas": JSON.stringify(this.modifieddata),
                    "folioPP": this.FolioPP,
                    "usuario": sessionStorage.getItem("email"),
                    "Tabla": "PlanesVentas",
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {

                LayoutCs.Alerta(
                    "Plan de ventas",
                    "Plan de producción actualizado correctamente.",
                    "OK");

                PlanVentasCs.historymodified = "";
                PlanVentasCs.whitelinealreadysaved = true;
                setTimeout(() => {
                    window.location.reload();
                }, 1000)
            }
            else {
                LayoutCs.Alerta("Plan de ventas", this.anydata.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible actualizar el plan de produccion: " + error, "Plan de ventas");
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
                $.each(PlanVentasCs.extradata, function (index, item) {

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
                LayoutCs.Alerta("Plan de ventas", this.response.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible consultar la bitácora de el plan de producción: " + error, "Plan de ventas");
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
                LayoutCs.Alerta("Plan de ventas", this.anydata.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible consultar el plan de producción: " + error, "Plan de ventas");
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



                $.each(PlanVentasCs.response, function (index, item) {
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
                LayoutCs.Alerta("Plan de ventas", this.anydata.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible actualizar la configuración del plan de producción: " + error, "Plan de ventas");
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
                LayoutCs.Alerta("Plan de ventas", "La configuración del plan de producción fue actualizada correctamente.", "OK");
                this.ReiniciarPagina();
            }
            else {
                LayoutCs.Alerta("Plan de ventas", this.anydata.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible actualizar la configuración del plan de producción: " + error, "Plan de ventas");
            StopLoading();

        }
    }
    //Hacer tabla editable
    async MakeTableEditableWithBitacora(table) {
        //Advanced editor
        var advancedEditor = new SimpleTableCellEditor(table, { navigation: false });
   
        advancedEditor.SetEditableClass("CustomStatus", {
            internals: {
                renderEditor: (elem, oldVal) => {
                    $(elem).html(`<select class="form-select mt-2 estatusAuth">
                                    <option value="Autorizado" >Autorizado</option>
                                    <option value="No Autorizado" >No Autorizado</option>
                                </select>`);

                    $("select option").filter(function () {
                        return $(this).val() == oldVal.trim();
                    }).prop('selected', true);

                },
                extractEditorValue: (elem) => { return $(elem).find('select').val(); },

            }
        });


        // Detectar edición de celdas y obtener el nombre de la celda
        $("#" + table).on('change', '.CustomStatus', function () {
            var cell = $(this).closest('td'); // Obtener la celda más cercana
            var cellName = cell.data('id'); // Asumiendo que existe un atributo 'data-id'
            var cellOldValue = cell.html();
            if (cellName && !PlanVentasCs.historymodified.includes(cellName)) {
                PlanVentasCs.historymodified += cellName + "\n";
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

    async UpdateEstatusOV() {
        try {

            Loading();

            let urlUpdatePlan = $('#PlanesVentas').attr("finalizarPlan");

            const response = await $.ajax({
                url: urlUpdatePlan,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    "folio": PlanVentasCs.FolioPP
                }
            });

            if (response.Status == "OK") {

                StopLoading();

                //console.log(response);
                $("#ConFinalizacion").modal("hide");
                LayoutCs.Alerta(
                    "Plan Ventas",
                    "Plan " + PlanVentasCs.FolioPP + " finalizado, el reporte CyC ha sido enviado.",
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

    mergeAndSortByOrden(previewdataPP, previewdataPPT) {
        const existingIds = new Set(previewdataPP.map(item => item.id));

        const nuevosRegistros = previewdataPPT.filter(item => !existingIds.has(item.id));

        // Agrega los nuevos elementos
        const merged = [...previewdataPP, ...nuevosRegistros];

        // Ordena por el campo 'Orden' (conversión por si vienen como string)
        merged.sort((a, b) => Number(a.Orden) - Number(b.Orden));

        return merged;
    }

    async UpdateEstatusPlanCC() {
        try {

            Loading();

            //CreditoCobranza/UpdateEstatusPlanCC
            let urlUpdatePlan = $('#PlanesVentas').attr("updateEstatus");

            const response = await $.ajax({
                url: urlUpdatePlan,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    folio: PlanVentasCs.FolioPP,
                    usuario: sessionStorage.getItem("email"),
                }
            });

            if (response.Status == "OK") {

                StopLoading();

                $("#estPVCC").text("Revisado Por CyC");
                $("#estPVCC").removeClass("bg-warning");
                $("#estPVCC").addClass("bg-success");
                $("#CheckRevCyC").addClass("d-none");

                LayoutCs.Alerta(
                    "Plan VentasCyC",
                    "Plan " + PlanVentasCs.FolioPP + " actualizado",
                    "OK"
                )

            }

            else {
                StopLoading();
                LayoutCs.Alerta("Plan VentasCyC", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan VentasCyC");
            StopLoading();

        }
    }

}

LayoutCs.validarUsuario("Cr\u00E9dito");

//Instancia de clase
const PlanVentasCs = new PlanVentasCC();

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

            LayoutCs.updateHeaderISO("ReporteCC", fl, fr, code, nivel, rev);
            //PlanEmbCs.updateHeader(fl, fr, code, nivel);
        });
    }
    else {
        //Eliminar elementos que no corresponden a usuario
        $(".EditRow").remove();
        $(".btnSave").remove();
        $(".btnEditHead").remove();
    }



    // Validación de formularios
    $(document).on('submit', '.needs-validation', ValidacionFormularios);
    //Consultar los planes de producción(listado)
    PlanVentasCs.action = $("#PlanesVentas").attr("action");
    PlanVentasCs.table = PlanVentasCs.PlanesVentas();


    //Al hacer click en cualquier fila de la tabla de PP
    $('#PlanesVentas tbody').on('click', 'tr.PP', function () {
        try {
            //Obtener url consulta
            PlanVentasCs.action = $("#PlanesVentas").attr("details");
            PlanVentasCs.rowdata = PlanVentasCs.table.row(this).data();
            PlanVentasCs.FolioPP = $(this).attr("folio"); //DOCENTRY
            PlanVentasCs.current_row = $(this);
            PlanVentasCs.row = PlanVentasCs.table.row(PlanVentasCs.current_row);

            // Quitar clase PPselected de todas las filas
            $('#PlanesVentas tbody tr').find('td').removeClass('PPselected');
            // Quitar el ícono de flecha derecha de todas las filas
            $('#PlanesVentas tbody tr').find('td:first-child .fa-arrow-right').remove();
            // Añadir clase PPselected a las celdas de la fila seleccionada
            $(this).find('td').addClass('PPselected position-relative');
            // Añadir ícono de flecha derecha a la primera celda de la fila seleccionada
            $(this).find('td:first-child').append('<i class="fas fa-arrow-right iconPPselected"></i>');
            //realizar peticion para obtener detalles del plan de produccion
            PlanVentasCs.PlanesVentasDetails()
        }
        catch (error) {
            LayoutCs.Alerta("Plan de ventas", "No es posible obtener los detalles de el plan de producción, por favor contacte al administrador del sistema con el siguiente código de error: " + error);
            StopLoading();

        }
    });

    //PASO SIGUIENTE -> BOTON SIGUIENTE
    $("#actualizar").on("click", function (e) {
        try {
            //Consultar los planes de producción
            PlanVentasCs.action = $("#PlanesVentas").attr("update");

            //Verificar si un checbox fue cambiado
            let nuevasFilas = $(".tableReport tbody tr.muestraOF").length > 0;

            //Si algo fue modificado
            if (PlanVentasCs.historymodified != "Cambió: " || nuevasFilas) {
                $('.sendOV').each(function (index) {
                    // Encuentra la fila (tr) que contiene el checkbox
                    const fila = $(this).closest('tr');
                    // Crea un objeto vacío para almacenar los valores de la fila
                    let filaData = {};
                    let idrow = fila.attr("idppd")
                    let existe = PlanVentasCs.modifieddata.find(r => r.id == idrow)
                    if (!existe) {
                        filaData.id = idrow;
                        //Dando formato para guardado en SAP
                        let estatus = fila.find('td.CustomStatus')
                            .text().trim();

                        filaData.Estatus = estatus == 'Autorizado' ? 1 : 0;
                        // Añade el objeto al array de resultados
                        PlanVentasCs.modifieddata.push(filaData);
                    }

                });

                PlanVentasCs.UpdatePlanProduction();

            }
            else {
                LayoutCs.Alerta("Plan de ventas", "Ningún dato ha cambiado, debes modificar algún dato para actualizar.");
            }
        }
        catch (error) {
            LayoutCs.Alerta("Plan de ventas", "No fue posible actualizar el plan de producción, por favor intenta de nuevo mas tarde: " + error);
            StopLoading();

        }
    });
 

    //Descargar Plan Ventas
    $("#DescargarPlanVentas").on("click", function () {
        try {
            let folio = PlanVentasCs.FolioPP + "_PlanVentas";
            let revision = $(this).attr("revision"); //Poner numero revision 
            LayoutCs.ExportarExcelExcelJS(
                PlanVentasCs.idTablaSelected,
                folio,
                revision,
                "Plan Ordenes Venta Folio: " + PlanVentasCs.FolioPP);
        }
        catch (error) {
            LayoutCs.Alerta(
                "Plan de ventas",
                "No es posible descargar el plan de ordenes de venta: " + error);
            StopLoading();

        }
    });

    $("#BtnSaveRev").on("click", function () {

        PlanVentasCs.DataUpdate = [];


        $(".newValEstatus").each(function () {

            let dataUp = {
                idppd: $(this).attr("idppd"),
                Estatus: $(this).text()
            }

            PlanVentasCs.DataUpdate.push(dataUp);
        });
    });

    $("#CheckRevCyC").on("click", function () {
        PlanVentasCs.UpdateEstatusPlanCC();
    });

    //Abrir modal de finalcacion del un plan 
    $("#BtnFinalizacion").on("click", function () {
        $("#ConFinalizacion").modal("show");
    });

    $("#ConfirmFinaliacion").on("click", function () {
        // 1. Cambiar estatus del plan a finalizado
        // 2. Enviar reporte de CyC
        PlanVentasCs.FinalizarPlan()
    });

    $("#CancelFinalizacion").on("click", function () {
        $("#ConFinalizacion").modal("hide");
    });


    $(document).on("click", ".estatusAuth", function () {
        try {
            let celda = $(this).closest("td");
            celda.addClass("newValEstatus");
        }
        catch (error) {
            LayoutCs.Alerta("Plan de ventas", "No fue posible actualizar la configuración para el plan de producción, por favor intenta de nuevo mas tarde: " + error);
            StopLoading();

        }
    })

    //Descargar Plan Ventas CyC
    $("#DescargarCreditoCobranza").on("click", function () {
        try {
            let folio = $("#folioPV").text().trim();
            let revision = $("#revisionPV").text().trim();
            let NombrePlan = `PlanVentasCyC_${folio}`;

           LayoutCs.ExportarExcelExcelJS(
               PlanVentasCs.idTablaSelected,
                NombrePlan,
                revision,
                `Plan Ventas CyC Folio: ${folio} Revision: ${revision}`);
        }
        catch (error) {
            LayoutCs.Alerta(
                "Plan de Ventas CyC",
                "No es posible descargar el plan ventas CyC: " + error);
            StopLoading();

        }
    });
   




});
