class ConsultaMonitorLogistica {
    constructor() {
        // * Atributos para guardar los datos de la lista de las ordenes de venta agrupados por linea
        this.subtablelinedetailsbody = `<div class="card">
                                                <div class="card-body ReportHeader">
                                                    <div class="row">
                                                        <div class="col-12 text-start">
                                                            <div class="text-center">
                                                                <span class="ps-2">
                                                                    LÍNEA {linea}
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
                                <th width="200"></th>
                                <th width="240">Línea</th>
                                <th width="200">Folio</th>
                                <th width="200">Generada</th>
                                <th width="200">No Orden Fabricación</th>
                                <th width="300">Estatus</th>
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
        this.configuracionML = {};
        this.OrdenML = "";
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
        this.FolioML = "";
        this.Revision = "";
        this.FechaRevision = "";
        this.hasfechaentrega;
        // * atributos para obtener datos de la vista previa del plan de produccion
        this.previewdataML;
        this.grouppreviewdataML;
        //*Atributos para la vista previa
        this.columnasrestantes = "";
        this.celdasrestantes = "";
        this.subtablelinedetailsheader = `<div class="card">
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
                                <table id="{monitorvp}" class="table table-preview table-striped table-bordered m-0 tblmonitorlogistica" style="table-layout:fixed">
                                <thead>{headers}</thead>
                                <tbody>{rows}</tbody>
                                </table>
                                </div>
                                </div>`;
        this.subtablelinedetailsbodyPP = `<div class="row m-0 pb-4">
                                <div class="col-md-12 p-0 body-table">
                                <table id="{monitorvp}" class="table table-preview table-striped table-bordered m-0 tblmonitorlogistica" style="table-layout:fixed">
                                <thead>{headers}</thead>
                                <tbody>{rows}</tbody>
                                </table>
                                </div>
                                </div>`;
        // *Atributo para especificar que columnas tendran ancho de 350
        this.Column350 = ["Comentarios", "Cliente", "Direccion", "HorarioCita"];
        this.ExcludeColumns = ["AuthRepro","AuthFechaRepro","NumRepro","IdPedido", "DocEntry", "U_HoraEntregaI", "U_HoraEntregaF", "U_Cita","row_num"];
        this.ExcludeColumnsPP = ["AuthRepro","AuthFechaRepro","NumRepro","IdPedido", "DocEntry", "U_HoraEntregaI", "U_HoraEntregaF", "U_Cita","row_num"];
        this.ColumnsWithEdit = ["EstatusReparto","TipoReparto",
            "EstatusCarga",
            "Comentarios",
            "CantidadMetros",
            "NumRollos",
            "PiezasEntrega",
            "Cotejado"];
        this.ColumnsWithEditTime = ["HoraEntrega"];
        this.ColumnsWithEditDate = ["FechaOriginalEntrega"];
    }
    //Listado de planes de produccion
    MonitoresLogistica() {
        try {
            let table = $("#MonitorLogistica").DataTable(
                {
                    processing: false,
                    serverSide: true,
                    bDestroy: true,
                    "ajax":
                    {
                        url: this.action,

                        type: "POST",
                        dataType: "json",
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
                                "data": "EstatusCarga" /* Linea */
                            },
                            {
                                "data": "TipoReparto" /* Cantidad Kilos */
                            },
                            {
                                "data": "FechaPedido" /* Articulo */
                            },
                            {
                                "data": "FechaSolicitudProduccion" /* Descripcion Articulo*/
                            },
                            {
                                "data": "Cliente" /* Indica si se genera o no la OF */
                            },
                            {
                                "data": "Comentarios" /* Num documento SAP OF */
                            },
                            {
                                "data": null,
                                "render": function (data, type, row) {
                                    // Aquí accedes al valor de DocEntry con row.DocEntry
                                    return `<i value="${row.Folio}" class="fs-4 fa-solid fa-book bitacoraML"></i>`;
                                }
                            },
                        ],
                    columnDefs: [
                        { visible: true, width: '250px', targets: '_all' }
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
                        $(row).addClass('ML');
                        // Agregar una clase personalizada a cada fila
                        $(row).attr("folio", data.Folio);
                    }
                });


            $(".buttons-excel").addClass("exceldownload");

            return table;
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible mostrar los planes de producción: " + error, "Plan de producción");
        }
    }
    //Detalles de plan de produccion
    async MonitorLogisticaDetails() {
        try {
            //Datos de ML
            // /Logistica/GetMonitorLogisticaDetails
            Loading();
            this.anydata = await $.ajax({
                url: this.action,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    folio: this.FolioML,
                    usuario: sessionStorage.getItem("email"),
                    tabla: "MonitorLogistica"
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                //Limpiar el contenedor
                $("#reportbyline").empty();
                //Obtener los datos
                this.previewdataML = JSON.parse(this.anydata.Data);
                this.extradata = JSON.parse(this.anydata.ExtraData);
                this.otherdata = JSON.parse(this.anydata.Other);
                //Datos de OV agrupados por linea
                this.grouppreviewdataML = LayoutCs.agruparPorTipoReparto(this.previewdataML);
         
                // Recorrer el resultado agrupado
                ConsultaMonitorLogisticaCs.anydata = "";
                $.each(this.grouppreviewdataML, function (TipoReparto, items) {
                    //Reiniciar tabla dinamica
                    ConsultaMonitorLogisticaCs.subtablelinedetails = "";
                    //Especificar el tipo de reparto en el encabezado
                    ConsultaMonitorLogisticaCs.subtablelinedetails += ConsultaMonitorLogisticaCs.subtablelinedetailsheader.replace("{TipoReparto}", TipoReparto)
                        .replace("{monitorvp}", (TipoReparto.includes("reparto") ? "reparto" : "consolidado"));
                    //Obtener layout de tabla
                    ConsultaMonitorLogisticaCs.subtablelinedetails += ConsultaMonitorLogisticaCs.subtablelinedetailsbody.replace("{monitorvp}", (TipoReparto.includes("reparto") ? "reparto" : "consolidado"));

                    //Recorrer la lista de ordenes agrupada por linea
                    $.each(items, function (index, item) {
                        //Generar encabezado dinamicamente para el resto de columnas
                        if (index == 0) {
                            $.each(item, function (indexitem, itemdata) {
                                let width = ConsultaMonitorLogisticaCs.Column350.includes(indexitem) ? "350" : "250";
                                if (!ConsultaMonitorLogisticaCs.ExcludeColumns.includes(indexitem)) {
                                    ConsultaMonitorLogisticaCs.columnasrestantes += `<th id="${indexitem}" width="${width}">${LayoutCs.SpaceByUppercase(indexitem)}</th>`;
                                }
                            });
                        }

                        //Trae el color dependiendo cuanto tiempo falta para la cita
                        let bg = ConsultaMonitorLogisticaCs.colorFila(item.U_Cita,item.U_HoraEntregaI, item.U_HoraEntregaF);



                        //Generar filas dinamicamente
                        ConsultaMonitorLogisticaCs.celdasrestantes = "";
                        ConsultaMonitorLogisticaCs.anydata += `<tr class="monitor" isShowChild="0" id="row${item.DocEntry}" document="${item.DocEntry}">`;
                        let hasedit = "";

                        let NumRepro = item.NumRepro;
                        let AuthFechaRepro = item.AuthFechaRepro;
                        let AuthRepro = item.AuthRepro;

                        $.each(item, function (indexitem, itemdata) {

                            let data = "";


                            if (!ConsultaMonitorLogisticaCs.ExcludeColumns.includes(indexitem))
                            {
                                let itemDataS = itemdata.replace(/\s+/g, ""); // Elimina todos los espacios

                                //editMe
                                if (ConsultaMonitorLogisticaCs.ColumnsWithEdit.includes(indexitem)) {

                                    data = `data-valor="${itemDataS}"`;


                                    if (indexitem == "TipoReparto")
                                        hasedit = "TipoReparto";
                                    else if (indexitem == "EstatusCarga")
                                        hasedit = "EstatusCargaData";
                                    else
                                        hasedit = "editMe";


                                }
                                //TimeEdit
                                else if (ConsultaMonitorLogisticaCs.ColumnsWithEditTime.includes(indexitem)) {
                                    hasedit = "TimeField";

                                    data = `data-valor="${itemDataS}"`;


                                }
                                //DateEdit
                                else if (ConsultaMonitorLogisticaCs.ColumnsWithEditDate.includes(indexitem)) {
                                    hasedit = "DateField";
                                    data = `data-valor="${itemDataS}"`;

                                }
                                else {
                                    hasedit = "";
                                    data = "";

                                }



                                if (indexitem == 'FechaOriginalEntrega' && NumRepro>=2 && AuthRepro == 1) {
                                    ConsultaMonitorLogisticaCs.celdasrestantes +=
                                        `<td class=" ${indexitem} ${bg} bg-danger-subtle text-danger-emphasis" ${data} 
                                         data-id="${LayoutCs.SpaceByUppercase(indexitem)} ${TipoReparto}" 
                                         data-name="${indexitem}">
                                         ${itemdata} 
                                         <br>
                                         <i 
                                            class="bi bi-exclamation-circle-fill ms-2" 
                                            style="color:#dc362e;"
                                         ></i>
                                         <span class="fw-semibold" style="font-size:14px;"> Espera de autorizacion para ${AuthFechaRepro} </span>
                                     </td>`;
                                }
                                else {
                                    ConsultaMonitorLogisticaCs.celdasrestantes +=
                                        `<td class="${hasedit} ${indexitem} ${bg}" ${data} 
                                         data-id="${LayoutCs.SpaceByUppercase(indexitem)} ${TipoReparto}" 
                                         data-name="${indexitem}">
                                         ${itemdata}
                                     </td>`;
                                }

                               
                            }
                        });

                        ConsultaMonitorLogisticaCs.anydata += ConsultaMonitorLogisticaCs.celdasrestantes;
                        ConsultaMonitorLogisticaCs.anydata += `</tr>`;
                    });
                    //Reemplazar información obtenida
                    ConsultaMonitorLogisticaCs.subtablelinedetails = ConsultaMonitorLogisticaCs.subtablelinedetails.replace("{headers}", ConsultaMonitorLogisticaCs.columnasrestantes);
                    ConsultaMonitorLogisticaCs.subtablelinedetails = ConsultaMonitorLogisticaCs.subtablelinedetails.replace("{rows}", ConsultaMonitorLogisticaCs.anydata);
                    //Agregar tabla dinamica
                    $('#reportbyline').append(ConsultaMonitorLogisticaCs.subtablelinedetails);
                    LayoutCs.MakeTableEditable((TipoReparto.includes("reparto") ? "reparto" : "consolidado"),true);
                    ConsultaMonitorLogisticaCs.anydata = "";
                    ConsultaMonitorLogisticaCs.columnasrestantes = "";
                    ConsultaMonitorLogisticaCs.celdasrestantes = "";
                });

                //$("#folioseleccionado").text(this.FolioML);
                $("#actualizar").removeClass("d-none");
                $("#MLHeader").removeClass("d-none");
                $("#MLHeaderTitle").addClass("d-none");

                //Detales encabezado plan produccion
                $("#fecha-liberacion,#fecha-revision,#fecha-documento").text(ConsultaMonitorLogisticaCs.extradata[0].fecha);
                $("#revision").text(ConsultaMonitorLogisticaCs.extradata[0].Revision + " ACTUALIZADA");
                $("#folio").text(ConsultaMonitorLogisticaCs.extradata[0].folio + "-" + ConsultaMonitorLogisticaCs.extradata[0].Revision);

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
            LayoutCs.Excepcion("No es posible consultar los detalles del monitor de logística: " + error, "Plan de producción");
        }
    }
    //Configuración del plan de produccion por usuario(columnas visibles)
    async ConfigxUsuarioML(openmodal) {
        try {
            //Datos de ML
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
                $("#configuracionMLContainer").empty();
                $.each(ConsultaMonitorLogisticaCs.response, function (index, item) {
                    let checked = item.Visible == "SI" ? 'checked' : '';
                    $("#configuracionMLContainer").append(`<div class="mb-1 align-self-start form-check">
                        <input type="checkbox" id="${item.ColumnName}" class="form-check-input anycheck configuracionbyML" value="${item.ColumnName}" ${checked}>
                        <label class="form-check-label" for="${item.ColumnName}">${item.ColumnName}</label>
                    </div>`);
                });

                //Permitir reordenar los checkbox de configuracion
                $("#configuracionMLContainer").sortable({
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
                        $("#configuracionMLContainer .form-check").each(function (index) {
                            console.log(`${index + 1}: ${$(this).find('label').text()}`);
                        });
                    }
                });

                //Solo si se requiere que se abra el modal
                if (openmodal == "true")
                    $("#ConfiguracionML").modal("show");
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
    //Inserta o actualiza la configuración del plan de produccion por usuario(columnas visibles)
    async InsertaConfigxUsuarioML() {
        try {
            //Datos de ML
            Loading();
            this.anydata = await $.ajax({
                url: this.action,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    usuario: sessionStorage.getItem("email"),
                    configuracion: JSON.stringify(this.configuracionML)
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                $("#ConfiguracionML").modal("hide");
                LayoutCs.Alerta("Plan de producción", "La configuración del plan de producción fue actualizada correctamente.");
                this.ReiniciarPagina();
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
    //ReiniciarPagina
    ReiniciarPagina() {
        //Limpiar el contenedor
        $("#reportbyline").empty();
        $("#reportbyline").html(`<h5 class="card-title">!Ningun plan seleccionado!</h5>
                    <p class="card-text">Aquí podrás visualizar el detalle de el plan de producción seleccionado.</p>`)
        //$("#folioseleccionado").text("");
        $("#actualizar").addClass("d-none");
        $("#MLHeader").addClass("d-none");
        // Quitar clase PPselected de todas las filas
        $('#MonitorLogistica tbody tr').find('td').removeClass('PPselected');
        // Quitar el ícono de flecha derecha de todas las filas
        $('#MonitorLogistica tbody tr').find('td:first-child .fa-arrow-right').remove();
    }
    
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

                this.subtabledetails = `<table class="table table-preview table-striped table-bordered subtable w-75 m-2 ovdetails">
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
                            ${parseInt(item.PiezasProducidas)} / ${parseInt(item.Rollos) }
                       </td>
                       `
                    if (completo)
                        filaC =
                            `
                           <td class="colspan-td">
                                ${item.StockTotal}
                           </td>
                       `

                    ConsultaMonitorLogisticaCs.subtabledetails += `<tr>
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

                $(`#row${this.DocEntry}`).after(
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

    //Para identificar los pedidos con cita y que falta poco tiempo
    colorFila(cita, hi, hf) {

        //Si tienen Cita:
            //Rango hora inicio - hora final : En ese rango te pueden recibir
            //Solo tiene hora inicio : Apartir de esa en adelante los pueden recibir
        //Solo tiene hora fin : es la hora de la cita
        let color = ""
        let objHora = {};

        if (cita == "Si") {
            //Solo tiene hora inicio
            if ((hi != null && hi != "") && (hf == null || hf == "")) {
                color =  ""
            }


            if (hf != null && hf != "") {
                if (hi != null && hi != "") {
                    objHora = tiempoFaltante(hi);
                }
                else {
                    objHora = tiempoFaltante(hf);
                }

                //console.log(objHora);

                if (objHora.horas < 3)
                    color = "bg-warning bg-opacity-50" 

                if (objHora.horas < 1)
                    color = "bg-danger bg-opacity-50"
            }

        }

        return color;
    }

    //Actualizar Monitor Logistica
    async UpdateMonitorLog(data) {
        try {
            //Datos de PP
            Loading();
            this.anydata = await $.ajax({
                url: this.action,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    "Monitor": JSON.stringify(data),
                }
            });

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                //this.ReiniciarPagina();
                LayoutCs.Alerta("Monitor Logistica", "Monitor Logistica actualizado correctamente.");
            }
            else {
                LayoutCs.Alerta("Monitor Logistica", this.anydata.Message);
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible actualizar el Monitor Logistica: " + error, "Monitor Logistica");
            StopLoading();
        }
    }

    //Validar si se hizo un cambio
    changeData() {
        let changeData = false;

        $(".monitor .EstatusCargaData , .EstatusReparto , .TipoReparto, .DateField ").each(function () {
            let valor = $(this).data("valor");
            let texto = $(this).text();
            texto = texto.replace(/\s+/g, "");

            if (valor != texto) {
                changeData = true
                return changeData;
            }
        })

        return changeData;
    }

    extractData() {

        let dataRows = [];

        $(".monitor").each(function () {
            let m = {
                DocEntry: $(this).attr("document"),
                EstatusReparto: $(this).find("td.EstatusReparto").text().trim(),
                EstatusCarga: $(this).find("td.EstatusCarga").text().trim(),
                TipoReparto: $(this).find("td.TipoReparto").text().trim(),
                FechaOriginalEntrega: $(this).find("td.FechaOriginalEntrega").text().trim()
            };

            //No mandar el valor cuando esta en espera de autorizacion
            if (m.FechaOriginalEntrega.includes('Espera')) {
                m.FechaOriginalEntrega = "";
            }

            dataRows.push(m);
        });

        return dataRows;
    }

    async PlanesProduccionDetails(Folio, Pedido) {
        try {

            let actionUrl = $("#PPLModal").attr("details");

            //Datos de PP
            Loading();
            this.anydata = await $.ajax({
                url: actionUrl,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    folio: Folio,
                    usuario: sessionStorage.getItem("email"),
                    tabla: "PlanProduccion"
                }
            });

            ConsultaMonitorLogisticaCs.ListNoGeneradas = [];

            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {
                //Limpiar el contenedor
                $("#reportbylinePP").empty();
                //Obtener los datos
                this.previewdataPP = JSON.parse(this.anydata.Data);
                this.extradata = JSON.parse(this.anydata.ExtraData);
                this.otherdata = JSON.parse(this.anydata.Other);
                //Datos de OV agrupados por linea
                this.grouppreviewdataPP = LayoutCs.agruparPorLinea(this.previewdataPP);

                // Recorrer el resultado agrupado y mostrar en la consola
                $.each(this.grouppreviewdataPP, function (linea, items) {
                    ConsultaMonitorLogisticaCs.subtablelinedetails = "";

                    //Crear los registros en la tabla
                    ConsultaMonitorLogisticaCs.subtablelinedetails += ConsultaMonitorLogisticaCs.subtablelinedetailsbodyPP;

                    //Recorrer la lista de ordenes agrupada por linea
                    ConsultaMonitorLogisticaCs.anydata = "";
                    let columnasrestantes = "";
                    let celdasrestantes = "";
                    $.each(items, function (index, item) {
                        //Generar encabezado dinamicamente para el resto de columnas
                        if (index == 0) {
                            $.each(item, function (indexitem, itemdata) {
                                if (!ConsultaMonitorLogisticaCs.ExcludeColumnsPP.includes(indexitem)) {
                                    columnasrestantes += `<th id="${indexitem}" width="200">${LayoutCs.SpaceByUppercase(indexitem)}</th>`;
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
                            ConsultaMonitorLogisticaCs.ListNoGeneradas.push(item.DocEntry);

                        ConsultaMonitorLogisticaCs.anyvar = `
                            <div class="form-check ${paddingcontainer}"> 
                                <label class="form-label">${NA}</label>
                                <input value="${item.DocEntry}" 
                                    data-linea="${item.Linea}" 
                                    type="checkbox" ${shouldbechecked} 
                                    class="form-check-input anycheck sendOF ${showcheckbox}"></div>`;
                        ConsultaMonitorLogisticaCs.anydata += `<tr id="rowppd${item.IdPPD}" class="ui-sortable-handle">`;
                        //Columnas principales
                        ConsultaMonitorLogisticaCs.anydata += `<td style="position:relative;" class="d-none generarof" data-idppd="${item.IdPPD}">${ConsultaMonitorLogisticaCs.anyvar}</td>
                                                             <td
                                                                class="Linea editLinea"
                                                                data-name="Linea"
                                                                data-id="Linea: ${item.Linea} Pedido: ${item.Pedido}">${item.Linea}</td>
                                                             <td data-name="Folio">${item.Folio}</td>
                                                             <td>${GenerarOF == "N/A" ? "N/A" : item.OrdenFabricacion}</td>
                                                            `;


                        //Resto de datos
                        //Saber si requiere edicion y de que tipo
                        let hasedit = "";
                        celdasrestantes = "";

                        $.each(item, function (indexitem, itemdata) {
                            if (!ConsultaMonitorLogisticaCs.ExcludeColumnsPP.includes(indexitem)) {

                                //editMe
                                if (ConsultaMonitorLogisticaCs.ColumnsWithEdit.includes(indexitem)) {
                                    hasedit = "editMe";
                                }
                                //TimeEdit
                                else if (ConsultaMonitorLogisticaCs.ColumnsWithEditTime.includes(indexitem)) {
                                    hasedit = "TimeField";
                                }
                                //DateEdit
                                else if (ConsultaMonitorLogisticaCs.ColumnsWithEditDate.includes(indexitem)) {
                                    hasedit = "DateField";
                                }
                                ////Estatus Produccion Edit
                                //else if (ConsultaMonitorLogisticaCs.ColumnsWithEditProduccion.includes(indexitem)) {
                                //    hasedit = "EstatusProduccionData";
                                //}
                                else {
                                    hasedit = "";
                                }

                                celdasrestantes += `<td class="${indexitem} ${hasedit}" data-id="${LayoutCs.SpaceByUppercase(indexitem)} Linea: ${linea} Pedido: ${item.Pedido}" data-name="${indexitem}">
                                ${GenerarOF === "N/A" && indexitem === "EstatusProduccion" ? "N/A" : itemdata}
                                </td>`;
                            }
                        });


                        //Agregar celdas
                        ConsultaMonitorLogisticaCs.anydata += celdasrestantes;
                        //Cerrar la fila
                        ConsultaMonitorLogisticaCs.anydata += `</tr>`;
                    });
                    //Agregar las OV agrupadas por linea
                    ConsultaMonitorLogisticaCs.subtablelinedetails = ConsultaMonitorLogisticaCs.subtablelinedetails
                        .replace("{id}", ("PPDetails" + linea))
                        .replace("{linea}", linea)
                        .replace("{rows}", ConsultaMonitorLogisticaCs.anydata)
                        .replace("{headers}", columnasrestantes);

                    $("#reportbylinePP").append(ConsultaMonitorLogisticaCs.subtablelinedetails.trim());
                  


                });



                $("#folioseleccionado").text(this.FolioPP);
                $("#actualizar").removeClass("d-none");
                $("#PPHeader").removeClass("d-none");
                $("#PPHeaderTitle").addClass("d-none");

                if (ConsultaMonitorLogisticaCs.extradata.length > 0) {
                    //Detales encabezado plan produccion
                    $("#fecha-liberacion,#fecha-revision,#fecha-documento").text(ConsultaMonitorLogisticaCs.extradata[0].fecha);
                    $("#revision").text(ConsultaMonitorLogisticaCs.extradata[0].Revision + " ACTUALIZADA");
                    $("#folio").text(ConsultaMonitorLogisticaCs.extradata[0].folio + "-" + ConsultaMonitorLogisticaCs.extradata[0].Revision);

                }

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
            console.error("No es posible consultar el plan de produccion: " + error, "Plan de producción");
        }
    }

}

//Instancia de clase
const ConsultaMonitorLogisticaCs = new ConsultaMonitorLogistica();
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
    const horasFaltantes = Math.floor(diferenciaMinutos / 60);
    const minutosFaltantes = diferenciaMinutos % 60;

    return { horas: horasFaltantes, minutos: minutosFaltantes };
}

//EVENTOS
$(function () {
    // Validación de formularios
    $(document).on('submit', '.needs-validation', ValidacionFormularios);
    //Consultar los planes de producción(listado)
    ConsultaMonitorLogisticaCs.action = $("#MonitorLogistica").attr("action");
    ConsultaMonitorLogisticaCs.table = ConsultaMonitorLogisticaCs.MonitoresLogistica();


    //Al hacer click en cualquier fila de la tabla de ML
    $('#MonitorLogistica tbody').on('click', 'tr.ML', function () {
        try {
            //Obtener url consulta
            ConsultaMonitorLogisticaCs.action = $("#MonitorLogistica").attr("details");
            ConsultaMonitorLogisticaCs.rowdata = ConsultaMonitorLogisticaCs.table.row(this).data();
            ConsultaMonitorLogisticaCs.FolioML = $(this).attr("folio"); //DOCENTRY
            ConsultaMonitorLogisticaCs.current_row = $(this);
            ConsultaMonitorLogisticaCs.row = ConsultaMonitorLogisticaCs.table.row(ConsultaMonitorLogisticaCs.current_row);

            // Quitar clase MLselected de todas las filas
            $('#MonitorLogistica tbody tr').find('td').removeClass('PPselected');
            // Quitar el ícono de flecha derecha de todas las filas
            $('#MonitorLogistica tbody tr').find('td:first-child .fa-arrow-right').remove();
            // Añadir clase PPselected a las celdas de la fila seleccionada
            $(this).find('td').addClass('PPselected position-relative');
            // Añadir ícono de flecha derecha a la primera celda de la fila seleccionada
            $(this).find('td:first-child').append('<i class="fas fa-arrow-right iconPPselected"></i>');

            if (ConsultaMonitorLogisticaCs.row.child.isShown()) {
                ConsultaMonitorLogisticaCs.row.child.hide();
                ConsultaMonitorLogisticaCs.current_row.removeClass('shown');
            }
            else {
                //realizar peticion para obtener detalles del plan de produccion
                ConsultaMonitorLogisticaCs.MonitorLogisticaDetails();
            }
        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No es posible obtener los detalles de el plan de producción, por favor contacte al administrador del sistema con el siguiente código de error: " + error);
        }
    });

    //PASO SIGUIENTE -> BOTON SIGUIENTE
    $("#actualizar").on("click", function (e) {
        try {
            //Consultar los planes de producción
            ConsultaMonitorLogisticaCs.action = $("#MonitorLogistica").attr("update");

            //Verificar si un campo fue cambiado
            let changeAnyData = ConsultaMonitorLogisticaCs.changeData();

            //Si algo fue modificado
            if (changeAnyData) {
                let info = ConsultaMonitorLogisticaCs.extractData();
                    //Actualizar el plan de produccion
                ConsultaMonitorLogisticaCs.UpdateMonitorLog(info);
                
            }
            else {
                LayoutCs.Alerta("Plan de producción", "Ningún dato ha cambiado, debes modificar algún dato para actualizar.");
            }
        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No fue posible actualizar el plan de producción, por favor intenta de nuevo mas tarde: " + error);
        }
    });

    //Configurar el listado del plan de produccion
    $("#edicionML").on("click", function () {
        //Configuracion del plan de produccion por usuario
        ConsultaMonitorLogisticaCs.action = $("#MonitorLogistica").attr("configuracion");
        ConsultaMonitorLogisticaCs.ConfigxUsuarioML("true");
    });
    //Seleccionar todas las columnas para el listado del detalle del plan
    $('#selectAll').on('change', function () {
        var isChecked = $(this).is(':checked');
        $('input[type="checkbox"].configuracionbyML').prop('checked', isChecked);
    });
    //Guardar configuración de el plan de produccion
    $("#GuardaConfigML").on("click", function () {
        try {
            //Limpiar variables
            ConsultaMonitorLogisticaCs.configuracionML = {};
            $('.configuracionbyML').each(function (index) {
                // Obtén el id del checkbox y usa limpiarTexto para quitar acentos y espacios
                let id = LayoutCs.limpiarTexto(this.id);

                // Asigna el id como clave y el valor "SI" o "NO" como valor
                ConsultaMonitorLogisticaCs.configuracionML[id] = { "Visible": this.checked ? "SI" : "NO", "Orden": (index + 1) };

            });
            

            ConsultaMonitorLogisticaCs.configuracionML["usuario"] = sessionStorage.getItem("email");
            ConsultaMonitorLogisticaCs.action = $("#MonitorLogistica").attr("updateconfiguracion");
            ConsultaMonitorLogisticaCs.InsertaConfigxUsuarioML();
        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No fue posible actualizar la configuración para el plan de producción, por favor intenta de nuevo mas tarde: " + error);
        }
    });
    //Seleccionar todas las columnas para el listado del detalle del plan

    $(document).on('click', 'tr.monitor', function (event) {
        try {

            // Evitar evento cuando se da click a una celda que se pueda editar
            if ($(event.target).closest('td.EstatusCargaData , td.TipoReparto , td.editMe , td.inEdit').length) {
                return; // Detiene la ejecución del evento
            }

            //Obtener url consulta
       
            ConsultaMonitorLogisticaCs.ovdetails = $("#MonitorLogistica").attr("ovdetails");
            ConsultaMonitorLogisticaCs.DocEntry = $(this).attr("document"); //DOCENTRY
            let isShow = $(this).attr("isShowChild");
  


            if (isShow=="1") {
                $(`#row${ConsultaMonitorLogisticaCs.DocEntry}child`).remove();
                // Quitar clase PPselected de todas las filas
                $('#reparto tbody tr').find('td').removeClass('OVselected');
                // Quitar el ícono de flecha derecha de todas las filas
                $('#reparto tbody tr').find('td:first-child .fa-arrow-right').remove();

                $(this).attr("isShowChild", "0");
            }
            else {
                //realizar peticion para obtener detalles
                ConsultaMonitorLogisticaCs.OVDetail();
                // Quitar clase PPselected de todas las filas
                $('#reparto tbody tr').find('td').removeClass('OVselected');
                // Quitar el ícono de flecha derecha de todas las filas
                $('#reparto tbody tr').find('td:first-child .fa-arrow-right').remove();
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


    $(document).on('click', '.btnPP', function () {
        let folio = $(this).data("folio");
        let pedido = $(this).data("pedido");

        let mensaje = '';

        if (folio == '')
            mensaje = "La orden de venta no se encuentra en un plan de producción.";
        if (pedido == '')
            mensaje = "La orden de venta no tiene orden de fabricación.";

        if (mensaje != '') {
            LayoutCs.Alerta("Consulta Monitor Logística", mensaje, "Warning");
            return;
        }
        //Abrir Modal
        $("#PPLModal").modal("show");
        ConsultaMonitorLogisticaCs.PlanesProduccionDetails(folio, pedido)


    });

    $("#ClosePPLModal").on("click", function () {
        $("#PPLModal").modal("hide");
    });

});
