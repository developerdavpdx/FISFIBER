class EdicionPV {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
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
        // *Atributo para especificar que columnas tendran ancho de 350
        this.Column300 = ["Comentarios", "Cliente", "Direccion", "HorarioCita"];
        this.ExcludeColumns = ["id", "DocEntry", "NumRepro", "NumReproSAP","PiezasRestantes","folio"];
        this.EditColumns = ["NumeroViaje", "PiezasEntrega", "NumViaje"];
        this.EditColumnsDate = [];
        this.EditColumnsTime = ["HoraEntrega","HoraInicio","HoraFin"];
        this.action = "";
        this.OrdenColumns = [];
        //
        this.configColumns = [];
        this.ListSectedOV = [];
        this.newRowsTR = [];
        this.FolioEdit = "";


    }
    //Obtener los pedidos para entregas render tabla
    PedidosEntregas() {

        //PINTAR ORDEN DE ENCABEZADOS
        $("#headPE").empty();
        let htmlHead = "<th></th>";
        this.configColumns.forEach((c) => {

            let nameCol = "";
            nameCol = LayoutCs.SpaceByUppercase(c.ColumnName).replace("_", ". ");
            htmlHead +=
                `<th >${nameCol}</th>`;
        });
        $("#headPE").append(htmlHead);



        let columns = this.configColumns.map(col => {

            let w = "134px";

            if (this.Column300.includes(col.ColumnName)) {
                w = "300px"
            }

            return {
                "data": col.ColumnName,
                "visible": col.Visible === "SI", // Controla visibilidad aquí
                "width": w
            };
        });

        // Agregar columna con checkbox al inicio
        columns.unshift({
            "data": null,
            "render": function (data, type, row) {
                let check = "";

                row.HoraInicio = parseHora(row.HoraInicio);
                row.HoraFin = parseHora(row.HoraFin);

                return `<div class="form-check">
                        <input type="checkbox" class="form-check-input OVSelected checkov" id="${row.DocEntry}" ${check}>
                    </div>`;
            },
            "visible": true
        });

        // Agregar columna de estado al final
        columns.push({
            "data": null,
            "render": function () {
                return 'Pendiente';
            },
            "visible": false
        });

        let table = $("#PedidosEntregas").DataTable({
            processing: false,
            serverSide: true,
            bDestroy: true,
            autoWidth: false,
            ajax: {
                url: this.action,
                type: "POST",
                dataType: "json",
                data: {
                    "fecha_entrega": this.fecha_entrega,
                    "Series": this.SerieID,
                    "email": sessionStorage.getItem("email"),
                    "DocEntrys": "",
                    "Lineas": this.Lineas,
                    "NumFamilias": ""
                },
                beforeSend: function () {
                    Loading();
                },
                complete: function () {
                    //Desmarcar input de seleccionar todas
                    $("#selectAll").prop("checked", false);
                    StopLoading();
                },
                dataSrc: function (json) {
                    EdicionPVCs.OVList = json.data;
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
                $(row).addClass('OV');
                //$(row).addClass(data.Series);
                $(row).addClass(data.IdPedido);
                $('td:eq(0)', row).addClass('position-relative');

                if (data.F_OriginalEntrega != '') {
                    $('td:eq(1)', row).addClass('position-relative');
                    $('td:eq(1)', row).prepend('<i class="bi bi-alarm-fill icontimerow" style="left:10%;"></i>');
                }
            }
        });

        $(".buttons-excel").addClass("exceldownload");

        $("#step-1").addClass("active");


        return table.columns.adjust().draw();
    }
    //Seleccionar el rango inicial de consulta
    RangoInicio() {
        $('#RangoInicio').modal("show");
    }
    OnInit() {
        //Se trae establece el attributo para que filtre por linea
        EdicionPVCs.FolioFamilia = $("#MenuContextBitacora").attr("folio")

        //Ejecutar la consulta
        EdicionPVCs.urldestino = $("#OV").attr("urldestino");
        EdicionPVCs.table = EdicionPVCs.OV();

        //Mostrar paso 1 y setear valores
        $("#step-1").addClass("active");
        $("#selectAll").prop("checked", false);
        EdicionPVCs.FolioPP = $("#MenuContextBitacora").attr("folio");
        EdicionPVCs.Linea = $("#MenuContextBitacora").attr("linea");
        $("#folioedicionPP").text(EdicionPVCs.FolioPP);
        $("#EdicionOrdenes").modal("show");
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
    //Validaciones paso 1 Mostrar Vista Previa de pedidos seleccionados
    async Step1() {

        //Traer listado de pedidos seleccionados
        this.OVselected = this.ListSectedOV;

        if (this.OVselected.length == 0) {
            LayoutCs.Alerta("Plan Ventas", "Debes seleccionar al menos una Orden de Venta para continuar.", "Warning");
            this.go = false;
        }
        else {
            Loading();
            //Lista de OV seleccionadas
            //this.FilterOVList = this.filtrarOVXDocEntry(this.OVselected);
            this.FilterOVList = await this.GetOVXDocEntry(this.OVselected);

            console.log(this.FilterOVList);
            this.FilterOVList = LayoutCs.ordenarViajes(this.FilterOVList);

            EdicionPVCs.AnyData = "";
            //Agregar las ordenes de venta seleccionadas
            $.each(this.FilterOVList, function (index, item) {

                // ui-sortable-handle : permite el arrastre de la fila
                //Generar filas dinamicamente
                EdicionPVCs.AnyData +=
                    `<tr
                        class="ui-sortable-handle"
                        document="${(item.DocEntry == null ? '' : item.DocEntry)}"
                     >`;

                let firstLoop = 0;
                let position = "";
                let clock = "";


                if (item.F_OriginalEntrega != '') {
                    position = "position-relative";
                    clock = '<i class="bi bi-alarm-fill icontimerow" style="left:10%;"></i>';
                }

                $.each(item, function (indexitem, itemdata) {

                    let hasedit = "";

                    //Se excluyen las columnas dentro del arreglo ExcludeColumns
                    if (!EdicionPVCs.ExcludeColumns.includes(indexitem)) {
                        if (EdicionPVCs.EditColumns.includes(indexitem)) {
                            hasedit = "notremove editMe"
                        }

                        else if (EdicionPVCs.EditColumnsDate.includes(indexitem)) {
                            hasedit = "notremove DateField"
                        }

                        else if (EdicionPVCs.EditColumnsTime.includes(indexitem)) {
                            hasedit = "notremove TimeField"
                        }
                        else {
                            hasedit = ""
                        }

                        if (firstLoop == 0) {
                            EdicionPVCs.AnyData += `<td class="${indexitem} ${hasedit} ${position}">${(itemdata == null ? '' : itemdata)} ${clock}</td>`;
                        }
                        else {
                            EdicionPVCs.AnyData += `<td class="${indexitem} ${hasedit}">${(itemdata == null ? '' : itemdata)}</td>`;
                        }

                        firstLoop += 1;

                        //EdicionPVCs.AnyData += `<td class="${indexitem} ${hasedit}">${(itemdata == null ? '' : itemdata)}</td>`;
                    }
                });

                EdicionPVCs.AnyData += `</tr>`;
            });

            $("#estatus_carga tbody").empty();
            $("#estatus_carga tbody").append(EdicionPVCs.AnyData);
            //Hacer editable la tabla
            LayoutCs.MakeTableEditable("estatus_carga");
            //Permitir el ordenamiento de las filas de la tabla
            LayoutCs.enableRowSorting("estatus_carga", 2);
            //LayoutCs.enableColumnOrdering("estatus_carga");

            setTimeout(() => { this.validarPedidosReprogramados() }, 500);


            this.go = true;
        }
        StopLoading();
    }
    //Validaciones paso 4 Avanzar a la creación del monitor de logistica
    async Step2() {
        try {

            Loading();
            EdicionPVCs.monitordata = {};
            // Seleccionar todas las tablas con la clase 'tblmonitorlogistica'
            $('#estatus_carga').each(function (index, table) {
                // Convertir el elemento table a objeto jQuery
                var $table = $(table);

                // Recorrer las filas de cada tabla y mapear los datos
                let tempdata = $table.find('tbody tr').map(function (index) {
                    return {
                        DocEntry: $(this).attr("document") || "",
                        F_Pedido: $(this).find('td.F_Pedido').text().trim() || "",
                        F_SolicitudProduccion: $(this).find('td.F_SolicitudProduccion').text() || "",
                        F_OriginalEntrega: $(this).find('td.F_OriginalEntrega').text() || "",
                        F_Entrega: $(this).find('td.F_Entrega').text() || "",
                        Pedido: $(this).find('td.Pedido').text() || "",
                        CodigoCliente: $(this).find('td.CodigoCliente').text() || "",
                        Cliente: $(this).find('td.Cliente').text() || "",
                        ComentariosSN: $(this).find('td.HorarioCita').text().trim().replace(/\s+/g, ' ') || "",
                        HoraEntrega: $(this).find('td.HoraEntrega').text().trim().replace(/\s+/g, ' ') || "",
                        Articulo: $(this).find('td.Articulo').text() || "",
                        CantidadMetros: $(this).find('td.CantidadMetros').text() || "",
                        NumRollos: $(this).find('td.NumRollos').text() || "",
                        PiezasEntrega: $(this).find('td.PiezasEntrega').text() || "",
                        Cotejado: $(this).find('td.Cotejado').text() || "",
                        Direccion: $(this).find('td.Direccion').text().trim().replace(/\s+/g, ' ') || "",
                        Comentarios: $(this).find('td.Comentarios').text().trim().replace(/\s+/g, ' ') || "",
                        NumeroViaje: $(this).find('td.NumeroViaje').text() || "",
                        LineaProd_Real: $(this).find('td.LineaProd_Real').text() || "",
                        Cita: $(this).find('td.Cita').text() || "",
                        HoraInicio: $(this).find('td.HoraInicio').text() || "",
                        HoraFin: $(this).find('td.HoraFin').text() || "",
                        DistRecorrida: $(this).find('td.DistRecorrida').text() || "",
                        Autotransporte: $(this).find('td.Autotransporte').text() || "",
                        Orden: index
                    };
                }).get();

                EdicionPVCs.monitordata = tempdata;

            });

            //Guardar el monitor
            this.action = $("#PedidosEntregas").attr("addmonitor");

            this.response = await $.ajax({
                url: this.action,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    PlanVentas: JSON.stringify(EdicionPVCs.monitordata),
                    Folio: this.FolioEdit,
                    Usuario: sessionStorage.getItem("email"),
                    Tabla: "PlanVentas"
                }
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (this.response.Status == "OK") {
                //clonar resultado final
                var finalresult = $('#estatus_carga').clone();
                let infoRevision = this.response.Data;

                finalresult.addClass("PlanGenerado");
                //agregar contenido
                $("#vista_previa").empty();
                $("#vista_previa").append(finalresult);
                //limpiar vista previa
                $('#estatus_carga').empty();
                $("#regresar").addClass("d-none");
                $("#continuar").text("Volver al inicio");
                $("#continuar").attr("restart", "true");
                //$("#reportbyline").html(`<h5 class="card-title">!Monitor Creado!</h5><p class="card-text">*Los datos del monitor han sido guardados exitosamente, puedes consultar el detalle en la vista Consulta Monitor Entregas*</p>`);
            }
            else {
                $("#vista_previa").html(`<h5 class="card-title">!Aviso!</h5><p class="card-text">No fue posible crear el monitor de logística, por favor intenta de nuevo más tarde: ${this.response.Message}</p>`);
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
            return DocEntryList.includes(item.DocEntry); // Verifica si DocEntry está en el arreglo
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


                    EdicionPVCs.subtabledetails += `<tr>
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
                    EdicionPVCs.row.child(EdicionPVCs.subtabledetails).show();
                    EdicionPVCs.current_row.addClass('shown');

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
    async GetOVXDocEntry() {
        try {
            //Loading();

            let urlGetOVXDocEntry = $("#PedidosEntregas").attr("urldestino");

            let ListDocEntrys = this.ListSectedOV.join(",");

            this.response = await $.ajax({
                url: urlGetOVXDocEntry,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    "DocEntrys": ListDocEntrys,
                },
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (this.response.Status == "OK") {
                let filterOvList = this.response.Data;

                return filterOvList;
            }
            else {
                LayoutCs.Alerta("Plan de ventas", this.response.Message);
                return [];
            }

            //StopLoading();

        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de ventas");
            StopLoading();

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

    //Configuración del plan de produccion por usuario(columnas visibles)
    async ConfigxUsuarioPE(openmodal) {

        let urlAction = $("#edicionPP").attr("configuracion");

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

                $.each(EdicionPVCs.response, function (index, item) {
                    let checked = item.Visible == "SI" ? 'checked' : '';
                    $("#configuracionPPContainer").append(`<div class="mb-1 align-self-start form-check ChecksConfig">
                        <input type="checkbox" id="${item.ColumnName}" class="form-check-input anycheck configuracionbyPP" value="${item.ColumnName}" ${checked}>
                        <label class="form-check-label" for="${item.ColumnName}">${LayoutCs.SpaceByUppercase(item.ColumnName)}</label>
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

    //Aviso de pedidos que requieren autorizacion
    validarPedidosReprogramados() {
        let reqAuth = this.FilterOVList.filter(v => {
            return parseInt(v.NumRepro) >= 1
        });


        if (reqAuth.length > 0) {

            reqAuth = reqAuth.map(v => v.Pedido).join(",");

            this.listPedidosAuth = reqAuth;

            LayoutCs.Alerta(
                "Plan Ventas",
                "Los pedidos : " + reqAuth + " requieren autorización.",
                "Warning");
        }
    }
}

//Instancia de clase
const EdicionPVCs = new EdicionPV();
// Función para manejar el envío del formulario
function ValidacionFormularios(event) {

    EdicionPVCs.fecha_entrega = $("#fecha_entrega").val();


    if (EdicionPVCs.fecha_entrega == "") {
        event.preventDefault();
        event.stopPropagation();
        LayoutCs.Alerta("Plan Ventas", "Debes seleccionar una fecha ... ", "Warning");
        return;
    }

    // Validar el formulario
    if (this.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
    } else {
        switch ($(event.currentTarget).attr("metodo")) {
            //Cuando se carga la pagina seleccionar a traves del modal
            case "FiltroFechaIni":
                // Convertir de 'yyyy-mm-dd' a 'dd/mm/yyyy'
                EdicionPVCs.fecha_entrega = $("#fecha_entrega").val();
                if (EdicionPVCs.fecha_entrega != "") {
                    //let [year, month, day] = $("#fecha_entrega").val().split('-');
                    //let fechaFormateada = `${day}/${month}/${year}`; // Fecha en formato 'dd/mm/yyyy'
                    //EdicionPVCs.fecha_entrega = fechaFormateada;
                    EdicionPVCs.fecha_entrega = $("#fecha_entrega").val();
                }
                break;
        }
        //Ejecutar la consulta
        //LayoutCs.EnviarNotificacion("Monitor de logística", "El monitor ha sido creado exitosamente", "https://fisfiber.com.mx/wp-content/uploads/2023/04/Logo_header-180x54-2-3.png", "https://fisfiber.com.mx/", "Acceder", sessionStorage.getItem("email"));
        EdicionPVCs.action = $("#PedidosEntregas").attr("action");
        EdicionPVCs.table = EdicionPVCs.PedidosEntregas();
        //Mostrar paso 1 y setear valores
        $("#RangoInicio").modal("hide");
        $("#EdicionOrdenes").modal("show");

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

    const minutosFaltantes = diferenciaMinutos;

    return minutosFaltantes;
}


//EVENTOS
$(function () {
    EdicionPVCs.ConfigxUsuarioPE("false");
    $("#MenuNuevoRegistro").hide();

  
    // Validación de formularios
    $(document).on('submit', '.needs-validation', ValidacionFormularios);
    //Consultar los pedidos pendientes para entregas

    //Seleccion de fecha paso 1
    $("#btnFechaEntrega").on("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        EdicionPVCs.fecha_entrega = $("#fecha_entregaS").val();

        //Validar seleccion de fecha
        if (EdicionPVCs.fecha_entrega == "") {
            LayoutCs.Alerta("Plan ordenes venta", "Debes seleccionar una fecha ...", "Warning");
        }
        else {
            EdicionPVCs.action = $("#PedidosEntregas").attr("action");
            $("#PedidosEntregas").DataTable().destroy();
            EdicionPVCs.table = EdicionPVCs.PedidosEntregas();
        }

    });

   //Agregar pedidos a un plan
    $("#editPPM").on("click", function () {

        EdicionPVCs.RangoInicio();
        EdicionPVCs.FolioEdit = $("#MenuContextBitacora").attr("folio");

        // Ocultar el menú contextual
        $("#MenuContextBitacora").hide();

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
                    EdicionPVCs.nextStep();
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
        EdicionPVCs.prevStep();
    });

    //Descargar excel
    $(document).on("click", ".descargarmonitorvp", function () {
        try {
            let table = $(this).attr("destino");
            let title = table.includes("reparto") ? "(Pedidos Reparto)" : "(Pedidos Consolidados)"
            LayoutCs.ExportarExcelExcelJS(table, `EdicionPV ${title}`, "", `Vista Previa Monitor Logística ${title}`);
        }
        catch (error) {
            LayoutCs.Alerta("Monitor de logística", "No es posible descargar la bitácora, por favor contacte al administrador del sistema con el siguiente código de error: " + error);
        }
    });

    //Al hacer click en los checkbox de las OV
    $('#PedidosEntregas tbody').on('click', '.OVSelected', function (event) {
        //Detener la propagacion del evento hacia la fila
        event.stopPropagation();
        // Quitar la clase 'rowselected' de la fila que contiene el checkbox
        $(this).closest('tr').removeClass('selectedrow');
    });
    $('#PedidosEntregas tbody').on('click', 'tr.OV', function () {
        try {
            //Obtener url consulta
            //EdicionPVCs.DocEntry = this.childNodes[1].innerText; //DOCENTRY
            //EdicionPVCs.DocNum = this.childNodes[2].innerText; //DOCNUM
            EdicionPVCs.ovdetails = $("#PedidosEntregas").attr("ovdetails");
            EdicionPVCs.rowdata = EdicionPVCs.table.row(this).data();
            EdicionPVCs.DocEntry = EdicionPVCs.rowdata.DocEntry; //DOCENTRY
            EdicionPVCs.current_row = $(this);
            EdicionPVCs.row = EdicionPVCs.table.row(EdicionPVCs.current_row);


            if (EdicionPVCs.row.child.isShown()) {
                EdicionPVCs.row.child.hide();
                EdicionPVCs.current_row.removeClass('shown');
                // Quitar clase PPselected de todas las filas
                $('#PedidosEntregas tbody tr').find('td').removeClass('OVselected');
                // Quitar el ícono de flecha derecha de todas las filas
                $('#PedidosEntregas tbody tr').find('td:first-child .fa-arrow-right').remove();
            }
            else {
                //realizar peticion para obtener detalles
                EdicionPVCs.OVDetail();
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

    $('#selectAll').on('change', function () {
        var isChecked = $(this).is(':checked');
        $('#PedidosEntregas tbody tr').toggleClass('selectedrow', isChecked);

        let allIds = [];
        if (isChecked) {
            //Se agregan al arreglo solo los que no estan checkeados
            $('#PedidosEntregas tbody input[type="checkbox"].OVSelected:not(:checked)').each(function () {
                let idCheck = $(this).attr("id");
                allIds.push(idCheck);
            });
        }
        else {
            $('#PedidosEntregas tbody input[type="checkbox"].OVSelected').each(function () {
                let idCheck = $(this).attr("id");
                allIds.push(idCheck);
            });
        }


        $('#PedidosEntregas tbody input[type="checkbox"].OVSelected').prop('checked', isChecked);



        if (isChecked) {
            EdicionPVCs.ListSectedOV.push(...allIds);
            //allIds.forEach((e) => EdicionPVCs.AddRowTablaSelectd(e));
        }
        else {

            //Eliminacion visual
            allIds.forEach((e) => {
                $(`#${e}-OVS`).remove();
            });

            //Se eliminan los elementos del array
            let set = new Set(allIds);
            let resultado =
                EdicionPVCs.ListSectedOV
                    .filter(item => !set.has(item));

            EdicionPVCs.ListSectedOV = resultado;

            if (EdicionPVCs.ListSectedOV.length == 0) {
                $("#tablaOVSelected").addClass("d-none");
                $("#rowOVSelected").addClass("d-none");
                $("#sinOSelected").removeClass("d-none");
            }

        }

    });

    //EVENTOS

    //Al hacer click en los checkbox de las OV
    $('#PedidosEntregas tbody').on('click', '.OVSelected', function (event) {
        //Detener la propagacion del evento hacia la fila
        event.stopPropagation();
        // Quitar la clase 'rowselected' de la fila que contiene el checkbox
        $(this).closest('tr').removeClass('selectedrow');
        let idCheck = $(this).attr("id");

        //Se agrega a ListSectedOV
        if ($(this).is(":checked")) {
            //Obtener id del checkbox
            EdicionPVCs.ListSectedOV.push(idCheck);
            //EdicionPVCs.AddRowTablaSelectd(idCheck);
            //console.log(EdicionPVCs.ListSectedOV);
        }
        else {
            //Se elimina a ListSectedOV
            let index = EdicionPVCs.ListSectedOV.indexOf(idCheck);
            if (index !== -1) {
                EdicionPVCs.ListSectedOV.splice(index, 1);
                //console.log(EdicionPVCs.ListSectedOV);

                //Elimina fila de forma visual
                $(`#${idCheck}-OVS`).remove();

                if (EdicionPVCs.ListSectedOV.length == 0) {
                    $("#tablaOVSelected").addClass("d-none");
                    $("#rowOVSelected").addClass("d-none");

                    $("#sinOSelected").removeClass("d-none");
                }

            }
        }

    });

    // Mostrar menú contextual al hacer clic derecho
    $(document).on("contextmenu", "#estatus_carga", function (e) {
        e.preventDefault();
        $("#MenuNuevoRegistro")
            .css({
                top: e.pageY + "px",
                left: e.pageX + "px",
            })
            .show();
    });

    //Ocultar menú contextual al hacer clic en cualquier lugar
    $(document).on("click", function () {
        $("#MenuNuevoRegistro").hide();
    });

    $(document).on("click", "#addRow", function () {

        EdicionPVCs.whitelinealreadysaved = false;
        // Obtener el índice actual de la nueva fila (número de filas ya presentes en la tabla)
        let rowIndex = $("#estatus_carga tbody tr").length;

        // Clonar la primera fila de la tabla
        let firstRow = $("#estatus_carga tbody tr").eq(1).clone();

        if (firstRow.length == 0)
            firstRow = $("#estatus_carga tbody tr").eq(0).clone();

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
            $("#estatus_carga tbody tr")
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
        firstRow.find('td.CantidadMetros').removeClass("editMe").addClass("editMeNumber");
        firstRow.find('td.NumRollos').removeClass("editMe").addClass("editMeNumber");
        firstRow.find('td.PiezasEntrega').removeClass("editMe").addClass("editMeNumber");
        firstRow.find('td.PiezasRestantes').removeClass("editMe").addClass("editMeNumber");

        //Quitar la clase editMe, para que no se pueda editar la linea
        firstRow.find("td.Linea").removeClass("editLinea");

        //Eliminar id, sumcap de fila
        firstRow.attr("id", `newrow${idppd}`);
        firstRow.find("td.Comentarios").text("Esta es un pedio de contenedor.");

        EdicionPVCs.newRowsTR.push(idppd);

        firstRow.height(60);

        // Agregar la fila al final de la tabla
        $("#estatus_carga tbody").append(firstRow);

    });


    //Configurar el listado del plan de produccion
    $("#edicionPP").on("click", function () {
        //Configuracion del plan de produccion por usuario
        EdicionPVCs.action = $(this).attr("configuracion");
        EdicionPVCs.ConfigxUsuarioML("true");
    });


});
