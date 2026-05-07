class EdicionPlanProduccion {
    //IMPORTANTE CUANDO SE AVANZA EN LOS STEPS
    //ALGUNAS COLUMNAS QUEDARON OCULTAS Y CUANDO SE CLONA
    //LA TABLA DEPENDIENDO EL STEP SE MUESTRAN LAS COLUMNAS OCULTAS
    //QUE PROVIENEN DE LA TABLA INICIAL
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.go = false;
        this.ObjectCodeSeriesOV = "17";
        // + atributo que indica cual es el endpoint de redireccionamiento
        this.urldestino = "";
        // + atributo que indica cual es el endpoint de redireccionamiento para obtener detalles de OV
        this.ovdetails = "";
        this.configPPSN = [];
        this.SerieID = "";
        this.SelectedLinea = "";
        this.Familias = [];
        this.NumFamilias = "";
        this.folio = "";
        this.generateOF = "";
        // * atributo para guardar la tabla de datos
        this.table;

        // * atributo para guardar la tabla de datos
        this.tableOF;

        // * Atributo para guardar los datos de una fila de la tabla
        this.rowdata = "";
        // * Atributo para guardar el ID de fila de la tabla
        this.row = "";
        // * atributo para obtener el DocEntry del Documento
        this.DocEntry = "";
        // * atributo para asignaciones generales 
        this.current_row = "";
        // * atributo para guardar el response
        this.DetailsOV = null;
        // * articulos seleccionados por Orden De Venta
        this.ArticleSelected = [];
        // * Atributo para fecha inicio
        this.FI = "";
        // * Atributo para fecha inicio
        this.FF = "";
        // * Atributo para armar la tabla de detalles de linea
        this.subtabledetails = "";
        // * Atributo para obtener las ordenes de venta seleccionadas
        this.OVselected;
        this.FinalOVselected;
        // * Atributo para guardar los datos de la lista de las ordenes de venta
        this.OVList;
        this.FilterOVList;
        this.AnyData = "";
        this.foliogenerated = "";
        this.AnyList = "";
        this.haslinea;
        this.hascomments = true;
        this.hasprioridad = true;
        this.previewdataPP;
        this.grouppreviewdataPP;
        this.nombreLineas = [];
        this.ListSectedOV = [];
        this.LineasValidasEdi = [];
        // * Atributos para guardar los datos de la lista de las ordenes de venta agrupados por linea
        this.subtablelinedetailsheader = `<div class="card">
                                                <div class="card-body ReportHeader">
                                                    <div class="row">
                                                        <div class="col-12 text-start">
                                                            <div class="text-center">
                                                                <span class="ps-2">
                                                                    PLAN DE PRODUCCIÓN LINEA {linea}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>`;
        this.subtablelinedetailsbody = `<div class="row m-0 pb-4">
                                <div class="col-md-12 p-0 body-table">
                                <table class="table table-preview table-striped table-bordered m-0" style="table-layout:fixed">
                                <thead>
                                <th class="d-none" width="200">Generar</th>
                                <th width="240">Línea</th>
                                <th width="200">Ubicación Propuesta</th>
                                <th width="200">Ubicación Final</th>
                                <th width="200">Rollos</th>
                                <th width="200">Piezas Producidas</th>
                                <th width="200">Pedido</th>
                                <th width="200">Codigo Cliente</th>
                                <th width="200">Solicitado</th>
                                <th width="200">Núm. Artículo</th>
                                <th width="200">Metros Rollo</th>
                                <th width="200">Fecha Entrega</th>
                                <th width="200">Cantidad Metros</th>
                                <th width="200">Comentarios Extras</th>
                                <th width="200">Comentarios</th>
                                <th width="200">Hora propuesta</th>
                                <th width="250">Descripción Artículo</th>
                                <th width="200">Almacén</th>
                                <th width="200">Especificación</th>
                                <th width="200">Hora Inicio</th>
                                <th width="200">Hora Final</th>
                                <th width="200">Tiempo Producción</th>
                                <th width="200">Fecha Contabilización</th>
                                <th width="200">Fecha Fabricación</th>
                                <th width="200">Cliente</th>
                                <th width="200">Cantidad Kilos</th>
                                </thead>
                                <tbody>{rows}</tbody>
                                </table>
                                </div>
                                </div>`;
        this.subtablelinedetailsbodyOF = `<div class="row m-0 pb-4">
                                <div class="col-md-12 p-0 body-table">
                                <table class="table table-preview table-striped table-bordered m-0" style="table-layout:fixed">
                                <thead>
                                <th class="d-none" width="200">Generar</th>
                                <th width="240">Orden Fabricacion</th>
                                <th width="240">Línea</th>
                                <th width="200">Ubicación Propuesta</th>
                                <th width="200">Ubicación Final</th>
                                <th width="200">Rollos</th>
                                <th width="200">Piezas Producidas</th>
                                <th width="200">Pedido</th>
                                <th width="200">Codigo Cliente</th>
                                <th width="200">Solicitado</th>
                                <th width="200">Núm. Artículo</th>
                                <th width="200">Metros Rollo</th>
                                <th width="200">Fecha Entrega</th>
                                <th width="200">Cantidad Metros</th>
                                <th width="200">Comentarios Extras</th>
                                <th width="200">Comentarios</th>
                                <th width="200">Hora propuesta</th>
                                <th width="250">Descripción Artículo</th>
                                <th width="200">Almacén</th>
                                <th width="200">Especificación</th>
                                <th width="200">Hora Inicio</th>
                                <th width="200">Hora Final</th>
                                <th width="200">Tiempo Producción</th>
                                <th width="200">Fecha Contabilización</th>
                                <th width="200">Fecha Fabricación</th>
                                <th width="200">Cliente</th>
                                <th width="200">Cantidad Kilos</th>
                                </thead>
                                <tbody>{rows}</tbody>
                                </table>
                                </div>
                                </div>`;
        this.subtablelinedetailsbodyfinal = `<div class="row m-0 pb-4">
                                <div class="col-md-12 p-0 body-table">
                                <table class="table table-preview table-striped table-bordered m-0" style="table-layout:fixed">
                                <thead>
                                <th width="200">Folio</th>
                                <th width="200">Ubicación Propuesta</th>
                                <th width="200">Ubicación Final</th>
                                <th width="200">OrdenFabricacion</th>
                                <th width="200">Estatus Producción</th>
                                <th width="200">Estatus SAP</th>
                                <th width="200">Rollos</th>
                                <th width="200">Piezas Producidas</th>
                                <th width="200">Pedido</th>
                                <th width="200">Codigo Cliente</th>
                                <th width="200">Solicitado</th>
                                <th width="200">Núm. Artículo</th>
                                <th width="200">Metros Rollo</th>
                                <th width="200">Cantidad Metros</th>
                                <th width="200">Fecha Entrega</th>
                                <th width="200">Comentarios</th>
                                <th width="200">Comentarios Extras</th>
                                <th width="200">Generar</th>
                                <th width="200">Prioridad</th>
                                <th width="200">Hora propuesta</th>
                                <th width="240">Línea</th>
                                <th width="250">Descripción Artículo</th>
                                <th width="200">Almacén</th>
                                <th width="200">Especificación</th>
                                <th width="200">Hora Inicio</th>
                                <th width="200">Hora Final</th>
                                <th width="200">Tiempo Producción</th>
                                <th width="200">Fecha Contabilización</th>
                                <th width="200">Fecha Fabricación</th>
                                <th width="200">Cliente</th>
                                <th width="200">Cantidad Kilos</th>
                                </thead>
                                <tbody>{rows}</tbody>
                                </table>
                                </div>
                                </div>`;

        this.subtablelinedetailsbodyfinalOF = `<div class="row m-0 pb-4">
                                <div class="col-md-12 p-0 body-table">
                                <table class="table table-preview table-striped table-bordered m-0" style="table-layout:fixed">
                                <thead>
                                <th width="200">Folio</th>
                                <th width="200">Ubicación Propuesta</th>
                                <th width="200">Ubicación Final</th>
                                <th width="200">OrdenFabricacion</th>
                                <th width="200">Estatus Producción</th>
                                <th width="200">Rollos</th>
                                <th width="200">Piezas Producidas</th>
                                <th width="200">Pedido</th>
                                <th width="200">Codigo Cliente</th>
                                <th width="200">Solicitado</th>
                                <th width="200">Núm. Artículo</th>
                                <th width="200">Metros Rollo</th>
                                <th width="200">Cantidad Metros</th>
                                <th width="200">Fecha Entrega</th>
                                <th width="200">Comentarios</th>
                                <th width="200">Comentarios Extras</th>
                                <th width="200">Hora propuesta</th>
                                <th width="240">Línea</th>
                                <th width="250">Descripción Artículo</th>
                                <th width="200">Almacén</th>
                                <th width="200">Especificación</th>
                                <th width="200">Hora Inicio</th>
                                <th width="200">Hora Final</th>
                                <th width="200">Tiempo Producción</th>
                                <th width="200">Fecha Contabilización</th>
                                <th width="200">Fecha Fabricación</th>
                                <th width="200">Cliente</th>
                                <th width="200">Cantidad Kilos</th>
                                </thead>
                                <tbody>{rows}</tbody>
                                </table>
                                </div>
                                </div>`;

        this.subtablelinedetails = "";

        // * Atributo para guaradar el response de las solicitudes AJAX
        this.response = "";
        this.Linea = "";
        this.FolioPP = "";

        //Columnas Dinamicas
        this.ExcludeColumsPP = ["Prioridad", "RowNum", "Series", "NumeroLineaArticulo"];
        this.HideColumns = [
            "ComentariosExtras",
            "UbicacionPropuesta",
            "HoraPropuesta",
            "UbicacionFinal"];
        this.AlwaysHidden = ["DocEntry"];
        this.ColumnsWithEdit = [
            "ComentariosExtras",
            "UbicacionPropuesta",
            "UbicacionFinal",
            "PiezasProducidas",
            "Solicitado",
            "Especificacion",
            "TiempoProduccion",
            "CantidadMetros",
            "Comentarios"
        ];
        this.ColumnsWithEditTime = [
            "HoraPropuesta",
            "HoraInicio",
            "HoraFinal"];
        this.ColumnsWithEditDate = ["FechaEntrega"];
        this.ColumnsWithEditProduccion = ["EstatusProduccion"];

    }
    //Seleccionar el rango inicial de consulta
    RangoInicio() {
        //$('#RangoInicio').fadeIn();
        // On modal show, add animation
        //$("#FIINI").val('2024-08-02');
        //$("#FFINI").val('2024-10-02');
        $('#RangoInicio').modal("show");
    }
    //Listado de ordenes de compra
    OV() {
        // '/PlanProduccion/GetOrdenesVenta'
        let table = $("#OV").DataTable(
            {
                processing: false,
                serverSide: true,
                bDestroy: true,
                "ajax":
                {
                    url: this.urldestino,

                    type: "POST",
                    dataType: "json",
                    data: {
                        "FI": this.FI,
                        "FF": this.FF,
                        "Series": this.SerieID,
                        "email": sessionStorage.getItem("email"),
                        "Lineas": this.SelectedLinea,
                        "FolioFamilia": "",
                        "NumFamilias": this.NumFamilias
                    },
                    "beforeSend": function () {
                        Loading(); // Mostrar el indicador de carga
                    },
                    "complete": function () {
                        StopLoading(); // Ocultar el indicador de carga
                    },
                    // Interceptar y guardar los datos antes de pasarlos al DataTable
                    "dataSrc": function (json) {
                        EdicionPlanProduccionCs.OVList = null;
                        EdicionPlanProduccionCs.OVList = json.data; // Guardar los datos recibidos
                        return json.data; // Devolver los datos al DataTable
                    }
                },
                columns:
                    [{
                        "data": null,
                        //La funcion Render ayuda a realizar operaciones con la fila que se esta recorriendo
                        //Por ejemplo aqui que se esta obteniendo el DocEntry
                        "render": function (data, type, row) {

                            let check = EdicionPlanProduccionCs.ListSectedOV.includes(row.DocEntry.toString());
                            let checked = "";

                            if (check) {
                                checked = "checked";
                            }

                            // Aquí accedes al valor de DocEntry con row.DocEntry
                            return `<div class="form-check">
                    <input type="checkbox" class="form-check-input OVSelected checkov" id="${row.DocEntry}" ${checked}>
                    </div>`;
                        }
                    },

                    {
                        "data": "DocEntry" /* ID documento 1*/
                        },
                        {
                            "data": "Linea" /* Linea 10*/
                        },
                    {
                        "data": "Series" /* Series de numeración 2*/
                    },
                    {
                        "data": "Pedido" /* Num documento 3*/
                    },
                    {
                        "data": "Cliente" /* Cliente 4*/
                    },
                    {
                        "data": "CodigoCliente" /* Num cliente 5*/
                    },
                    {
                        "data": "Articulo" /* Producto 6*/
                    },
                    {
                        "data": "DescripcionArticulo" /*Descripcion Producto 7*/
                    },
                    {
                        "data": "Almacen" /*Almacen 8*/
                    },
                    {
                        "data": "Rollos" /* Rollos 9*/
                    },
                   
                    {
                        "data": "CantidadMetros" /* Cantidad Metros 11*/
                    },
                    {
                        "data": "FechaContabilizacion" /* Fecha Contabilizacion 12*/
                    },
                    {
                        "data": "FechaFabricacion" /* Fecha Fabricacion 13*/
                    },
                    {
                        "data": "FechaEntrega" /* Fecha Entrega 14*/
                    },
                    {
                        "data": "Comentarios" /* Comentarios 15*/
                    },
                    {
                        "data": null,
                        "render": function () {
                            return 'Pendiente';
                        }
                    }
                    ],
                columnDefs: [
                    { visible: true, width: '100px', targets: 0 }, //CHECK
                    { visible: false, width: '0px', targets: 1 }, //DOCENTRY
                    { visible: true, width: '180px', targets: 2 }, // SERIES
                    { visible: true, width: '180px', targets: 3 }, // NUMERO DOCUMENTO
                    { visible: true, width: '200px', targets: 4 }, //CLIENTE
                    { visible: true, width: '180px', targets: 5 }, //NUM CLIENTE
                    { visible: true, width: '180px', targets: 6 }, //PRODUCTO
                    { visible: true, width: '250px', targets: 7 }, //DESCRIPCION PRODUCTO
                    { visible: true, width: '200px', targets: 8 }, //ALMACEN
                    { visible: true, width: '150px', targets: 9 }, //NUMERO ROLLOS
                    { visible: true, width: '180px', targets: 10 }, //LINEA
                    { visible: true, width: '200px', targets: 11 }, //CANTIDAD METROS
                    { visible: true, width: '230px', targets: 12 }, //FECHA CONTABILIZACION
                    { visible: true, width: '230px', targets: 13 }, //FECHA FABRICACION
                    { visible: true, width: '230px', targets: 14 }, //FECHA ENTREGA
                    { visible: true, width: '300px', targets: 15 },// COMENTARIOS
                    { visible: true, width: '100px', targets: 16 } //ESTATUS
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
                    $(row).addClass('OV');
                    // Agregar una clase personalizada a cada fila
                    $(row).addClass(data.Series);
                    // Agregar una clase personalizada a cada fila
                    $(row).addClass(data.DocEntry);

                    // Agregar la clase 'position-relative' solo a la primera celda de cada fila
                    $('td:eq(0)', row).addClass('position-relative');
                }
            });


        $(".buttons-excel").addClass("exceldownload");

        return table;
    }

    //Listado de ordenes de fabricacion
    OF() {
        // '/PlanProduccion/GetOrdenesFabricacion'
        let table = $("#OF").DataTable(
            {
                processing: false,
                serverSide: true,
                bDestroy: true,
                "ajax":
                {
                    url: this.urldestino,

                    type: "POST",
                    dataType: "json",
                    data: {
                        "FI": this.FI,
                        "FF": this.FF,
                        "Series": this.SerieID,
                        "email": sessionStorage.getItem("email"),
                        "Lineas": this.SelectedLinea,
                        "FolioFamilia": this.FolioFamilia,
                        "NumFamilias": this.NumFamilias
                    },
                    "beforeSend": function () {
                        Loading(); // Mostrar el indicador de carga
                    },
                    "complete": function () {
                        StopLoading(); // Ocultar el indicador de carga
                    },
                    // Interceptar y guardar los datos antes de pasarlos al DataTable
                    "dataSrc": function (json) {
                        EdicionPlanProduccionCs.OVList = null;
                        EdicionPlanProduccionCs.OVList = json.data; // Guardar los datos recibidos
                        return json.data; // Devolver los datos al DataTable
                    }
                },
                columns:
                    [{
                        "data": null,
                        //La funcion Render ayuda a realizar operaciones con la fila que se esta recorriendo
                        //Por ejemplo aqui que se esta obteniendo el DocEntry
                        "render": function (data, type, row) {

                            let check = EdicionPlanProduccionCs.ListSectedOV.includes(row.DocEntry.toString());
                            let checked = "";

                            if (check) {
                                checked = "checked";
                            }

                            // Aquí accedes al valor de DocEntry con row.DocEntry
                            return `<div class="form-check">
                    <input type="checkbox" class="form-check-input OVSelected checkov" id="${row.DocEntry}" ${checked}>
                    </div>`;
                        }
                    },

                    {
                        "data": "DocEntry" /* ID documento 1*/
                    },
                    {
                        "data": "Linea" /* Linea 10*/
                    },
                    {
                        "data": "Series" /* Series de numeración 2*/
                    },
                    {
                        "data": "Pedido" /* Num documento 3*/
                    },
                    {
                        "data": "Cliente" /* Cliente 4*/
                    },
                    {
                        "data": "CodigoCliente" /* Num cliente 5*/
                    },
                    {
                        "data": "Articulo" /* Producto 6*/
                    },
                    {
                        "data": "DescripcionArticulo" /*Descripcion Producto 7*/
                    },
                    {
                        "data": "Almacen" /*Almacen 8*/
                    },
                    {
                        "data": "Rollos" /* Rollos 9*/
                    },

                    {
                        "data": "CantidadMetros" /* Cantidad Metros 11*/
                    },
                    {
                        "data": "FechaContabilizacion" /* Fecha Contabilizacion 12*/
                    },
                    {
                        "data": "FechaFabricacion" /* Fecha Fabricacion 13*/
                    },
                    {
                        "data": "FechaEntrega" /* Fecha Entrega 14*/
                    },
                    {
                        "data": "Comentarios" /* Comentarios 15*/
                    },
                    {
                        "data": null,
                        "render": function () {
                            return 'Pendiente';
                        }
                    }
                    ],
                columnDefs: [
                    { visible: true, width: '100px', targets: 0 }, //CHECK
                    { visible: false, width: '0px', targets: 1 }, //DOCENTRY
                    { visible: true, width: '180px', targets: 2 }, // SERIES
                    { visible: true, width: '180px', targets: 3 }, // NUMERO DOCUMENTO
                    { visible: true, width: '200px', targets: 4 }, //CLIENTE
                    { visible: true, width: '180px', targets: 5 }, //NUM CLIENTE
                    { visible: true, width: '180px', targets: 6 }, //PRODUCTO
                    { visible: true, width: '250px', targets: 7 }, //DESCRIPCION PRODUCTO
                    { visible: true, width: '200px', targets: 8 }, //ALMACEN
                    { visible: true, width: '150px', targets: 9 }, //NUMERO ROLLOS
                    { visible: true, width: '180px', targets: 10 }, //LINEA
                    { visible: true, width: '200px', targets: 11 }, //CANTIDAD METROS
                    { visible: true, width: '230px', targets: 12 }, //FECHA CONTABILIZACION
                    { visible: true, width: '230px', targets: 13 }, //FECHA FABRICACION
                    { visible: true, width: '230px', targets: 14 }, //FECHA ENTREGA
                    { visible: true, width: '300px', targets: 15 },// COMENTARIOS
                    { visible: true, width: '100px', targets: 16 } //ESTATUS
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
                    $(row).addClass('OV');
                    // Agregar una clase personalizada a cada fila
                    $(row).addClass(data.Series);
                    // Agregar una clase personalizada a cada fila
                    $(row).addClass(data.DocEntry);

                    // Agregar la clase 'position-relative' solo a la primera celda de cada fila
                    $('td:eq(0)', row).addClass('position-relative');
                }
            });


        $(".buttons-excel").addClass("exceldownload");

        return table;
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
                                <th width="80">
                                 </th>
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
                    //Validar si el articulo ya ha sido agregado en el array anteriormente y marcarlo como seleccionado
                    let articleselected = "";
                    if (EdicionPlanProduccionCs.ExisteArticulo(EdicionPlanProduccionCs.ArticleSelected, item.Articulo, EdicionPlanProduccionCs.DocEntry.toString(), "true")) {
                        articleselected = "checked";
                    }
                    //let NumArticulo = item.Articulo.replace(/\s+/g, ""); // Aquí se eliminan todos los espacios

                    EdicionPlanProduccionCs.subtabledetails += `<tr>
                                                         <td class="position-relative colspan-td">
                                                         <div class="form-check form-switch ItemDefaultCc">
                                                          <input class="form-check-input ItemDefault ${EdicionPlanProduccionCs.DocEntry}" type="checkbox" ${articleselected} data-orden="${EdicionPlanProduccionCs.DocEntry}" data-almacen="${item.Almacen}" data-cantidad="${item.CantidadKilos}" data-articulo="${item.Articulo}" data-descripcionarticulo="${item.DescripcionArticulo}">
                                                         </div>
                                                        </td>
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
                    EdicionPlanProduccionCs.row.child(EdicionPlanProduccionCs.subtabledetails).show();
                    EdicionPlanProduccionCs.current_row.addClass('shown');

                    $('td[colspan]').addClass('colspan-background');

                });

                this.subtabledetails += `</tbody>
                                         </table>`;

            }
            else {
                LayoutCs.Alerta("Plan de producción", this.response.Message);
            }

            StopLoading();

        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();
        }
    }
    // Método para validar el cuantos articulos tiene la orden y selecionar automaticamente 
    //el de LineNum 0
    async ItemsByOV(DocEntrys) {
        try {
            this.response = await $.ajax({
                url: this.urldestino,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    DocEntrys: DocEntrys
                }
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (this.response.Status == "OK") {
                this.AnyData = JSON.parse(this.response.Data);
                return this.AnyData;
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.response.Message);
            }

            StopLoading();

        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();
        }
    }

    async GetOVXDocEntry(tableId) {
        try {
            //Loading();

            let urlGetOVXDocEntry = $(`#${tableId}`).attr("urldestino");

            let ListDocEntrys = this.ListSectedOV.join(",");

            this.response = await $.ajax({
                url: urlGetOVXDocEntry,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    "FI": "",
                    "FF": "",
                    "Series": "",
                    "email": sessionStorage.getItem("email"),
                    "DocEntrys": ListDocEntrys,

                },
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (this.response.Status == "OK") {
                let filterOvList = this.response.Data;

                return filterOvList;
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.response.Message);
                return [];
            }

            //StopLoading();

        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();
        }
    }
    //Filtrar Ordenes de Venta por DocEntry      
    filtrarOVXDocEntry(DocEntryList) {
        return this.OVList.filter(function (item) {
            return DocEntryList.includes(item.DocEntry.toString()); // Verifica si DocEntry está en el arreglo
        });
    }
    //Eventos
    showStep(step) {
        $('.step-content').removeClass('active');
        $('#step-' + step).addClass('active');
        this.renderBody(step);

    }
    // Ir al siguiente paso
    async nextStep() {
        if (this.currentStep < this.totalSteps) {

            //Validacion de seleccion de ORDENES DE VENTA
            switch (this.currentStep) {
                case 1:
                    //Ordenes de venta seleccionadas
                    await this.Step1();
                    if (this.ListSectedOV.length > 0) {

                        $(".arrow-steps .step").removeClass("current"); // Quitar la clase 'current' de cualquier step
                        $(".arrow-steps .step:eq(0)").addClass("done"); // Agregar 'current' al cuarto step (índice 3)
                        $(".arrow-steps .step:eq(1)").addClass("done"); // Agregar 'current' al cuarto step (índice 3)
                        $(".arrow-steps .step:eq(2)").addClass("current"); // Agregar 'current' al cuarto step (índice 3)
                    }
                    break;
                case 4:
                    //Ordenes de venta seleccionadas
                    this.Step4();
                    break;
            }

            if (this.go) {
                this.currentStep += 3
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

                if (this.currentStep == 7) {
                    this.showStep(this.currentStep - 2);
                }
                else {
                    this.showStep(this.currentStep);
                }

                LayoutCs.GoTop();
            }

        }
    }
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep -= 3;
            this.showStep(this.currentStep);
        }
    }

    //Validaciones paso 1 Avanzar a asignación de linea
    async Step1() {
        //this.OVselected = $('#OV tbody .OVSelected:checked').map(function () {
        //    return this.id;
        //}).get();
        //let VerifyOvSelected = $('#OV tbody .OVSelected:checked').map(function () {
        //    return this.id;
        //}).get().join(",");
        Loading();
        let VerifyOvSelected = this.ListSectedOV.join(",");


        if (this.ListSectedOV.length == 0) {
            LayoutCs.Alerta("Plan de producción", "Debes seleccionar al menos una orden de venta para continuar.");
            this.go = false;
            StopLoading();
        }
        else {

            //VALIDAR SI DEBEN SELECCIONAR O NO EL ARTICULO POR OV DE ACUERDO
            //AL NUMERO DE ARTICULOS DE LA ORDEN
            let howmanyov = this.ListSectedOV.length;
            if (howmanyov != this.ArticleSelected.length) {
                //Ejecutar la consulta
                this.urldestino = $("#OV").attr("getitemsbyov");
                this.AnyData = "";
                this.AnyData = await this.ItemsByOV(VerifyOvSelected);

                this.grouppreviewdataPP = LayoutCs.agruparPorDocEntry(this.AnyData);
                $.each(this.grouppreviewdataPP, function (index, item) {
                    if (item.length > 1) {
                        let DocEntry = item[0].DocEntry;

                        // Selecciona las celdas (`<td>`) dentro de la fila que tenga la clase `DocEntry` y aplica la clase `RowAttend`
                        $(`#OV tr.${DocEntry}`).addClass('RowAttend');

                        const existe = item.some(item1 =>
                            EdicionPlanProduccionCs.ArticleSelected.some(item2 => item1.DocEntry === item2.DocEntry));

                        //Si no existe algun elemento entonces se agrega el primero. 
                        if (!existe) {
                            //Se agrega cuando no se ha
                            if (!EdicionPlanProduccionCs.ExisteArticulo(EdicionPlanProduccionCs.ArticleSelected, item[0].Articulo, item[0].DocEntry.toString(), "false")) {
                                let NewArticle = { "Articulo": item[0].Articulo, "DescripcionArticulo": item[0].DescripcionArticulo, "DocEntry": item[0].DocEntry.toString(), "Almacen": item[0].Almacen.toString(), "CantidadKilos": item[0].CantidadKilos.toString() }
                                EdicionPlanProduccionCs.ArticleSelected.push(NewArticle);
                            }
                        }
                    }
                    // SELECCIONAR POR DEFAULT EL ARTICULO QUE TIENE LA OV
                    else {

                        if (!EdicionPlanProduccionCs.ExisteArticulo(EdicionPlanProduccionCs.ArticleSelected, item[0].Articulo, item[0].DocEntry.toString(), "false")) {
                            let NewArticle = { "Articulo": item[0].Articulo, "DescripcionArticulo": item[0].DescripcionArticulo, "DocEntry": item[0].DocEntry.toString(), "Almacen": item[0].Almacen.toString(), "CantidadKilos": item[0].CantidadKilos.toString() }
                            EdicionPlanProduccionCs.ArticleSelected.push(NewArticle);
                        }
                    }
                });
            }

            if (howmanyov != this.ArticleSelected.length) {
                LayoutCs.Alerta("Plan de producción", "Debes seleccionar un artículo por cada orden de venta marcada en rojo para continuar.");
                this.go = false;
                StopLoading();
            }
            else {

                //Loading();
                //Lista de OV seleccionadas
                // this.FilterOVList = this.filtrarOVXDocEntry(this.OVselected);
                this.FilterOVList = await this.GetOVXDocEntry("OV");
                //Reemplazar articulos de OV seleccionadas de acuerdo a selecciones anteriores
                this.ArticleSelected.forEach(function (item) {
                    let obj = EdicionPlanProduccionCs.FilterOVList.find(obj => obj.DocEntry === item.DocEntry);
                    if (obj) {
                        obj.Articulo = item.Articulo; // Actualizamos el atributo "OrdenFabricacion"
                        obj.DescripcionArticulo = item.DescripcionArticulo;
                        obj.Almacen = item.Almacen;
                        obj.CantidadKilos = item.CantidadKilos;
                    }
                });

                EdicionPlanProduccionCs.AnyData = "";
                let columnasrestantes = "";
                let celdasrestantes = "";
                //Agregar las ordenes de venta seleccionadas
                $.each(this.FilterOVList, function (index, item) {

                    //Generar encabezado dinamicamente para el resto de columnas
                    if (index == 0) {
                        columnasrestantes = "<tr>";
                        let headershow = "";
                        $.each(item, function (indexitem, itemdata) {
                            if (!EdicionPlanProduccionCs.ExcludeColumsPP.includes(indexitem)) {

                                //Hide
                                if (EdicionPlanProduccionCs.HideColumns.includes(indexitem)) {
                                    headershow = "d-none notremove";
                                }
                                else if (EdicionPlanProduccionCs.AlwaysHidden.includes(indexitem)) {
                                    headershow += "d-none notremove alwayshidden";
                                }
                                else
                                    headershow = "";



                                columnasrestantes +=
                                    `<th id="${indexitem}" class="${headershow}" width="200">
                                                        ${LayoutCs.SpaceByUppercase(indexitem)}
                                                    </th>`;
                            }
                        });

                        columnasrestantes += "</tr>";
                    }

                    //Resto de datos
                    //Saber si requiere edicion y de que tipo
                    let hideClass = "";
                    let hasEdit = "";
                    //Abrir fila
                    celdasrestantes = "<tr>";
                    $.each(item, function (indexitem, itemdata) {
                        hasEdit = "";
                        if (!EdicionPlanProduccionCs.ExcludeColumsPP.includes(indexitem)) {

                            if (EdicionPlanProduccionCs.ColumnsWithEdit.includes(indexitem)) {
                                hasEdit = "editMe";
                            }

                            if (EdicionPlanProduccionCs.ColumnsWithEditTime.includes(indexitem)) {
                                hasEdit = "TimeField";
                            }

                            //Hide
                            if (EdicionPlanProduccionCs.HideColumns.includes(indexitem)) {
                                hideClass = "d-none notremove";
                            }
                            else if (EdicionPlanProduccionCs.AlwaysHidden.includes(indexitem)) {
                                hideClass += "d-none notremove alwayshidden";
                            }

                            else {
                                hideClass = "";
                            }

                            if (indexitem == "Linea") {
                                celdasrestantes += `<td class="position-relative linea">
                                                           <input type="checkbox" class="form-check-input editline"/>
                                                           <span class="td-value">${(itemdata == null ? '' : itemdata)}</span>
                                                        </td>`;
                            }

                            else {
                                celdasrestantes += `
                                                <td class="${indexitem.toLowerCase()} ${hideClass} ${hasEdit}" 
                                                    data-id="${indexitem}"
                                                    data-name="${LayoutCs.SpaceByUppercase(indexitem)}">
                                                    ${(itemdata == null ? '' : itemdata)}
                                               </td>`;
                            }

                            //celdasrestantes += `
                            //                    <td class="${indexitem.toLowerCase()} ${hideClass} ${hasEdit}" 
                            //                        data-id="${indexitem}"
                            //                        data-name="${LayoutCs.SpaceByUppercase(indexitem)}">
                            //                        ${(itemdata == null ? '' : itemdata)}
                            //                   </td>`;
                        }
                    });
                    //Cerrar la fila
                    celdasrestantes += "</tr>"
                    //Guardar todas las filas
                    EdicionPlanProduccionCs.AnyData += celdasrestantes;
                });
                //Llenar los encabezados
                $("#OVSelected thead").empty();
                $("#OVSelected thead").append(columnasrestantes);
                $("#OVSelected tbody").empty();
                $("#OVSelected tbody").append(EdicionPlanProduccionCs.AnyData);
                //Hacer editable la tabla
                LayoutCs.MakeTableEditable("OVSelected");
                this.Step3();
                this.go = true;
            }
        }
      //  StopLoading();
    }
    //Validaciones paso 2 Avanzar a la asignacion de comentarios y prioridad
    async Step2() {  // Agregar async aquí
        //Datos de encabezado de vista previa
        Loading();
        //Validar si asignaron la linea correctamente
        this.haslinea = $('#OVSelected tbody tr').filter(function () {
            var celda = $(this).find('td.linea').text().trim(); // Obtener el valor de la celda con clase "linea"
            return celda === ''; // Filtrar celdas vacías o no numéricas
        });

        this.haslinea = this.haslinea.length > 0 ? false : true;

        switch (this.haslinea) {
            case true:

                // Clonar la tabla
                var tabla = $('#OVSelected').clone();
                // Cambiamos el ID de la tabla clonada
                tabla.attr('id', 'OVPrioridadTable');
                // Eliminamos la clase editMe de todas las celdas
                tabla.find('td:not(.notremove), th:not(.notremove)').removeClass('editMe');
                // Quitar la clase 'd-none' de la primera celda de cada fila
                tabla.find('td:not(.alwayshidden), th:not(.alwayshidden)').removeClass('d-none');
                // Agregamos la clase ui-sortable-handle a las filas tr
                tabla.find('tr').addClass('ui-sortable-handle');
                // Eliminamos los checkbox que funcionaron para editar la linea
                tabla.find('input[type="checkbox"]').remove();
                // Seleccionar todas las celdas <td> dentro de la tabla y aplicar .trim()
                tabla.find('td').each(function () {
                    var textoLimpio = $(this).text().trim();  // Aplicar .trim() al texto de la celda
                    $(this).text(textoLimpio);  // Establecer el texto sin espacios
                });
                //Agregar position relativa a la primera celda de cada fila
                //Ademas del color que indica si ya paso mas de un dia desde que se creo la orden
                for (let index = 0; index < tabla.find('tr').length; index++) {
                    let fila = $(tabla.find('tr')[index]);
                    if (index === 0) continue; // Excluye la primera fila (encabezado)
                    fila.find('td:nth-child(2)').addClass("position-relative");

                    let DocEntry = fila.find('td.docentry').text();
                    EdicionPlanProduccionCs.urldestino = $("#OV").attr("checktimeov");
                    let TiempoTranscurrido = await EdicionPlanProduccionCs.CheckTimeOV(DocEntry); // Aquí puedes usar await
                    if (TiempoTranscurrido[0].TiempoTranscurrido > 0) {
                        // Agregar el icono en la primera celda
                        // Prepend el icono a la primera celda
                        fila.find('td:not(.d-none):not(.alwayshiden)').first().prepend('<i class="bi bi-alarm-fill icontimerow"></i>');

                        //fila.find('td:nth-child(1)').prepend('<i class="bi bi-alarm-fill icontimerow"></i> ');
                        fila.find('td').css('background-color', 'lightgray');
                    }
                }
                // Remueve el min-width
                tabla.css('min-width', '');
                //Insertar la tabla
                $('#OVPrioridad').html(tabla);



                //Hacer editables los comentarios
                LayoutCs.MakeTableEditable("OVPrioridadTable");
                //Permirir reordenar las columnas
                //LayoutCs.enablecolumnordering("OVPrioridadTable");
                //Avanzar
                this.go = true;


                //LayoutCs.enableColumnOrdering("OVPrioridadTable");
                //Configuracion de columnas ocultas
                this.GetCondigAPC();
                //Configuracion de orden de columnas
                //this.GetConfigOCAPC();
                //Permitir el ordenamiento de las filas de la tabla
                LayoutCs.enableRowSorting("OVPrioridadTable", 2);
                //Permitir el ordenamiento de las columnas de la tabla
                LayoutCs.enableColumnOrdering("OVPrioridadTable");



                break;

            case false:
                LayoutCs.Alerta("Plan de producción", "Se debe indicar a que línea de producción debe ir cada orden.");
                this.go = false;
                break;
        }


        StopLoading();
    }
    //Validaciones paso 3 Avanzar a la vista previa de el plan de producción
    async Step3() {
        try {
            //Datos de encabezado de vista previa
            switch (this.hascomments && this.hasprioridad) {
                case true:
                    $("#reportbylinepreview").empty();
                    //Datos de OV
                    //this.previewdataPP = $('#OVPrioridadTable tbody tr').map(function (index) {
                    //    return {
                    //        Folio: "",
                    //        Generada: "",
                    //        OrdenFabricacion: "",
                    //        Estatus: "",
                    //        DocEntry: $(this).find('td.docentry').text(),
                    //        ComentariosExtras: $(this).find('td.comentariosextras').text(),
                    //        UbicacionPropuesta: $(this).find('td.ubicacionpropuesta').text(),
                    //        HoraPropuesta: $(this).find('td.horapropuesta').text(),
                    //        UbicacionFinal: $(this).find('td.ubicacionfinal').text(),
                    //        Linea: $(this).find('td.linea').text().trim(),
                    //        NewRow: ($(this).find('td.linea').attr("newRow") == undefined ? 'N/A' : $(this).find('td.linea').attr("newRow")),
                    //        Rollos: $(this).find('td.rollos').text(),
                    //        PiezasProducidas: $(this).find('td.piezasproducidas').text(),
                    //        Pedido: $(this).find('td.pedido').text(),
                    //        CodigoCliente: $(this).find('td.codigocliente').text(),
                    //        Solicitado: $(this).find('td.solicitado').text(),
                    //        Articulo: $(this).find('td.articulo').text(),
                    //        DescripcionArticulo: $(this).find('td.descripcionarticulo').text(),
                    //        Almacen: $(this).find('td.almacen').text(),
                    //        MetrosRollo: $(this).find('td.metrosrollo').text(),
                    //        Especificacion: $(this).find('td.especificacion').text(),
                    //        HoraInicio: $(this).find('td.horainicio').text(),
                    //        HoraFinal: $(this).find('td.horafinal').text(),
                    //        TiempoProduccion: $(this).find('td.tiempoproduccion').text(),
                    //        CantidadMetros: $(this).find('td.cantidadmetros').text(),
                    //        Comentarios: $(this).find('td.comentarios').text(),
                    //        FechaContabilizacion: $(this).find('td.fechacontabilizacion').text(),
                    //        FechaFabricacion: $(this).find('td.fechafabricacion').text(),
                    //        FechaEntrega: $(this).find('td.fechaentrega').text(),
                    //        Cliente: $(this).find('td.cliente').text(),
                    //        CantidadKilos: $(this).find('td.cantidadkilos').text(),
                    //        Orden: index
                    //    };
                    //}).get();

                    this.previewdataPP = $('#OVSelected tbody tr').map(function (index) {
                        return {
                            Orden: index,
                            Folio: "",
                            Generada: "",
                            OrdenFabricacion: "",
                            Estatus: "",
                            DocEntry: $(this).find('td.docentry').text().trim(),
                            ComentariosExtras: $(this).find('td.comentariosextras').text().trim(),
                            Prioridad: $(this).find('td.prioridad').text().trim(),
                            UbicacionPropuesta: $(this).find('td.ubicacionpropuesta').text().trim(),
                            HoraPropuesta: $(this).find('td.horapropuesta').text().trim(),
                            UbicacionFinal: $(this).find('td.ubicacionfinal').text().trim(),
                            Linea: $(this).find('td.linea').text().trim(),
                            NewRow: ($(this).find('td.linea').attr("newRow") == undefined ? 'N/A' : $(this).find('td.linea').attr("newRow")),
                            Rollos: $(this).find('td.rollos').text().trim(),
                            PiezasProducidas: $(this).find('td.piezasproducidas').text().trim(),
                            Pedido: $(this).find('td.pedido').text().trim(),
                            CodigoCliente: $(this).find('td.codigocliente').text().trim(),
                            Solicitado: $(this).find('td.solicitado').text().trim(),
                            Articulo: $(this).find('td.articulo').text().trim(),
                            DescripcionArticulo: $(this).find('td.descripcionarticulo').text().trim(),
                            Almacen: $(this).find('td.almacen').text().trim(),
                            MetrosRollo: $(this).find('td.metrosrollo').text().trim(),
                            Especificacion: $(this).find('td.especificacion').text().trim(),
                            HoraInicio: $(this).find('td.horainicio').text().trim(),
                            HoraFinal: $(this).find('td.horafinal').text().trim(),
                            TiempoProduccion: $(this).find('td.tiempoproduccion').text().trim(),
                            CantidadMetros: $(this).find('td.cantidadmetros').text().trim(),
                            Comentarios: $(this).find('td.comentarios').text().trim(),
                            FechaContabilizacion: $(this).find('td.fechacontabilizacion').text().trim(),
                            FechaFabricacion: $(this).find('td.fechafabricacion').text().trim(),
                            FechaEntrega: $(this).find('td.fechaentrega').text().trim(),
                            Cliente: $(this).find('td.cliente').text().trim(),
                            CantidadKilos: $(this).find('td.cantidadkilos').text().trim(),
                        };
                    }).get();

                    //Datos de OV agrupados por linea
                    this.grouppreviewdataPP = LayoutCs.agruparPorLinea(this.previewdataPP);

                    // Recorrer el resultado agrupado y mostrar en la consola
                    $.each(this.grouppreviewdataPP, function (linea, items) {
                        EdicionPlanProduccionCs.subtablelinedetails = "";
                        //Especificar la linea en el encabezado
                        EdicionPlanProduccionCs.subtablelinedetails += EdicionPlanProduccionCs.subtablelinedetailsheader.replace("{linea}", linea);

                        //Crear los registros en la tabla
                        EdicionPlanProduccionCs.subtablelinedetails += EdicionPlanProduccionCs.subtablelinedetailsbody;

                        //Recorrer la lista de ordenes agrupada por linea
                        EdicionPlanProduccionCs.AnyData = "";
                        $.each(items, function (index, item) {

                            //Se dejo asi porque de aqui no se generar OF
                            let input = "N/A";


                            EdicionPlanProduccionCs.AnyData += `<tr>
                                                         <td class="d-none">
                                                            ${input}
                                                         </td>
                                                         <td>${item.Linea.trim()}</td>
                                                         <td>${item.UbicacionPropuesta}</td>
                                                         <td>${item.UbicacionFinal}</td>
                                                         <td>${item.Rollos}</td>
                                                         <td>${item.PiezasProducidas}</td>
                                                         <td>${item.Pedido}</td>
                                                         <td>${item.CodigoCliente}</td>
                                                         <td>${item.Solicitado}</td>
                                                         <td>${item.Articulo}</td>
                                                         <td>${item.MetrosRollo}</td>
                                                         <td>${item.FechaEntrega}</td>
                                                         <td>${item.CantidadMetros}</td>
                                                         <td>${item.Comentarios}</td>
                                                         <td>${item.ComentariosExtras}</td>
                                                         <td>${item.HoraPropuesta}</td>
                                                         <td>${item.DescripcionArticulo}</td>
                                                         <td>${item.Almacen}</td>
                                                         <td>${item.Especificacion}</td>
                                                         <td>${item.HoraInicio}</td>
                                                         <td>${item.HoraFinal}</td>
                                                         <td>${item.TiempoProduccion}</td>
                                                         <td>${item.FechaContabilizacion}</td>
                                                         <td>${item.FechaFabricacion}</td>
                                                         <td>${item.Cliente}</td>
                                                         <td>${item.CantidadKilos}</td>
                                                         </tr>`;
                        });
                        //Agregar las OV agrupadas por linea
                        EdicionPlanProduccionCs.subtablelinedetails = EdicionPlanProduccionCs.subtablelinedetails.replace("{rows}", EdicionPlanProduccionCs.AnyData);
                        EdicionPlanProduccionCs.AnyData = "";
                        $("#reportbylinepreview").append(EdicionPlanProduccionCs.subtablelinedetails.trim());
                    });

                    let fecha_actual = LayoutCs.FechaActual();
                    $("#fecha-liberacion").text(fecha_actual);
                    $("#fecha-revision").text(fecha_actual);
                    $("#fecha-documento").text(fecha_actual);
                    $("#folio").text("--");
                    EdicionPlanProduccionCs.go = true;

                    break;

                case false:
                    LayoutCs.Alerta("Plan de producción", "Se debe agregar prioridad y comentarios en cada una de las ordenes de venta para continuar.");
                    this.go = false;
                    break;
            }

            StopLoading();
        }
        catch (exception) {
            LayoutCs.Alerta("Plan de producción", "No fue posible crear las ordenes de fabricación: " + exception);
            StopLoading();
        }

    }
    //Validaciones paso 4 Avanzar a la creación de las ordenes de fabricación
    async Step4() {
        try {
            Loading();
            //Indicar que las lineas en blanco no deben ser generadas como OF EN SAP

            //Obtenemos el DocEntry vacio de las nuevas filas
            let EmptyRow = ""
            //Seleccionamos la OV de la lista para actualizar OrdenFabricacion
           // let OVFound = EdicionPlanProduccionCs.previewdataPP.filter(OVFound => OVFound.DocEntry === EmptyRow);

            let OVFound = EdicionPlanProduccionCs.previewdataPP.map((e) => {
                if (e.NewRow == "N/A") {
                    e.OrdenFabricacion = "TRUE";
                }

                return e;
            })
            //Datos de OV agrupados por linea
            //this.grouppreviewdataPP = LayoutCs.agruparPorLinea(EdicionPlanProduccionCs.previewdataPP);
            this.grouppreviewdataPP = LayoutCs.agruparPorLinea(OVFound);
            //Generar OF
            this.generateOF = $("#OV").attr("ModifyOF");

            this.response = await $.ajax({
                url: this.generateOF,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    PlanProduccion: JSON.stringify(this.grouppreviewdataPP),
                    LineaOriginal: EdicionPlanProduccionCs.Linea,
                    PreviewFolio: this.FolioPP,
                    Usuario: sessionStorage.getItem("email"),
                    Tabla: "PlanProduccion"
                }
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (this.response.Status == "OK") {
                this.AnyData = JSON.parse(this.response.Data);
                //Asignar los valores de resultado del plan de produccion ejecutado en SAP
                this.AnyData.forEach(function (item) {
                    let obj = EdicionPlanProduccionCs.previewdataPP.find(obj => obj.DocEntry === item.DocEntry);
                    if (obj) {
                        obj.Folio = item.Folio; // Actualizamos el atributo "Folio de la vista previa"
                        obj.Generada = item.Generada; // Actualizamos el atributo "Generada de la vista previa"
                        obj.OrdenFabricacion = item.OrdenFabricacion; // Actualizamos el atributo "OrdenFabricacion de la vista previa"
                        obj.Estatus = item.Estatus; // Actualizamos el atributo "Estatus de la vista previa"
                        obj.EstatusProduccion = item.EstatusProduccion
                    }
                });
                EdicionPlanProduccionCs.grouppreviewdataPP = LayoutCs.agruparPorLinea(EdicionPlanProduccionCs.previewdataPP);
                // Recorrer el resultado agrupado y mostrar en la consola
                $.each(EdicionPlanProduccionCs.grouppreviewdataPP, function (linea, items) {

                    EdicionPlanProduccionCs.subtablelinedetails = "";
                    //Especificar la linea en el encabezado
                    EdicionPlanProduccionCs.subtablelinedetails += EdicionPlanProduccionCs.subtablelinedetailsheader.replace("{linea}", linea);

                    //Crear los registros en la tabla
                    EdicionPlanProduccionCs.subtablelinedetails += EdicionPlanProduccionCs.subtablelinedetailsbodyfinal;

                    //Recorrer la lista de ordenes agrupada por linea
                    EdicionPlanProduccionCs.AnyData = "";
                    $.each(items, function (index, item) {
                        //Guardar el folio para mostrar el que finalmente se genero
                        EdicionPlanProduccionCs.folio = item.Folio;
                        let EstatusSap = item.Estatus;
                        //let EstatusProduccion = (item.Estatus != 'La orden de venta no cuenta con fecha de entrega' ? 'En cola' : 'Sin OF generada');
                        //Color Warning
                        let warning = ""
                        if (item.Generada == "TRUE" && EstatusSap != "en cola" && item.OrdenFabricacion == '') {
                            warning = "bg-danger text-white"
                        }

                        //si la fila es de las agregadas (no generada en SAP), asignamos los campos correspondientes como N/A
                        item.OrdenFabricacion == "N/A" ? "N/A" : item.OrdenFabricacion

                   

                        EdicionPlanProduccionCs.AnyData += `<tr>
                                                         <td>${item.Folio}</td>
                                                         <td>${item.UbicacionPropuesta}</td>
                                                         <td>${item.UbicacionFinal}</td>
                                                         <td>${item.Generada == 'N/A' ? 'N/A' : item.OrdenFabricacion}</td>
                                                         <td>${item.Generada == 'N/A' ? 'N/A' : item.EstatusProduccion}</td>
                                                         <td class="${warning}">${item.Generada == 'N/A' ? 'N/A' : EstatusSap}</td>
                                                         <td>${item.Rollos}</td>
                                                         <td>${item.PiezasProducidas}</td>
                                                         <td>${item.Pedido}</td>
                                                         <td>${item.CodigoCliente}</td>
                                                         <td>${item.Solicitado}</td>
                                                         <td>${item.Articulo}</td>
                                                         <td>${item.MetrosRollo}</td>
                                                         <td>${item.CantidadMetros}</td>
                                                         <td>${item.FechaEntrega}</td>
                                                         <td>${item.Comentarios}</td>
                                                         <td>${item.ComentariosExtras}</td>
                                                         <td>${item.Generada == 'N/A' ? 'N/A' : (item.Generada == "TRUE" ? "SI" : "NO")}</td>
                                                         <td>${item.Prioridad}</td>
                                                         <td>${item.HoraPropuesta}</td>
                                                         <td>${item.Linea}</td>
                                                         <td>${item.DescripcionArticulo}</td>
                                                         <td>${item.Almacen}</td>
                                                         <td>${item.Especificacion}</td>
                                                         <td>${item.HoraInicio}</td>
                                                         <td>${item.HoraFinal}</td>
                                                         <td>${item.TiempoProduccion}</td>
                                                         <td>${item.FechaContabilizacion}</td>
                                                         <td>${item.FechaFabricacion}</td>
                                                         <td>${item.Cliente}</td>
                                                         <td>${item.CantidadKilos}</td>
                                                         </tr>`;
                    });
                    //Agregar las OV agrupadas por linea
                    EdicionPlanProduccionCs.subtablelinedetails = EdicionPlanProduccionCs.subtablelinedetails.replace("{rows}", EdicionPlanProduccionCs.AnyData);
                    EdicionPlanProduccionCs.AnyData = "";
                    $("#reportfinal").append(EdicionPlanProduccionCs.subtablelinedetails.trim());
                    $("#foliof").text(EdicionPlanProduccionCs.folio);
                    let fecha_actual = LayoutCs.FechaActual();
                    $("#fecha-liberacionf").text(fecha_actual);
                    $("#fecha-revisionf").text(fecha_actual);
                    $("#fecha-documentof").text(fecha_actual);
                });

                //Despues de mostrar el resultado guardar cambiar el texto y funcion de los botones
                $("#regresar").addClass("d-none");
                $("#continuar").attr("restart", "true");
                $("#continuar").text("Volver al inicio");
            }
            else {
                //Despues de mostrar el resultado guardar cambiar el texto y funcion de los botones
                $("#regresar").addClass("d-none");
                $("#continuar").attr("restart", "true");
                $("#continuar").text("Volver al inicio");
                LayoutCs.Alerta("Plan de producción", this.response.Message);
            }
            StopLoading();
        }
        catch (exception) {
            LayoutCs.Alerta("Plan de producción", "No fue posible actualizar el plan de producción: " + exception);
            StopLoading();
        }
    }
    //RENDERIZA EL CONTENIDO SEGUN EL PASO
    renderBody(step) {
        switch (step) {
            case 1:
                window.location.reload();
                break;
        }
    }
    //Buscar datos en las ordenes seleccionadas
    SearchOV(datos, filtro) {
        return data.filter(function (objeto) {
            return objeto.Linea === filtro;
        });
    }
    //Validar si existe un articulo de la OV
    ExisteArticulo(array, NumArticulo, Orden, FromDB) {
        //Si ya hay un articulo por orden
        if (array.some(obj => obj.DocEntry === Orden)) {
            //Si es el listado que se carga desde DB se debe validar el articulo y la orden 
            if (FromDB == "false")
                return true;
        }

        //Si el articulo por orden existe y articulo
        if (array.some(obj => obj.Articulo === NumArticulo && obj.DocEntry === Orden))
            return true;

        else
            return false;
    }
    //Eliminar articulo seleccionado de la OV por Orden y por Articulo
    EliminarArticulo(array, NumArticulo, Orden) {
        var index = array.findIndex(obj => obj.Articulo === NumArticulo && obj.DocEntry === Orden);
        if (index !== -1) {
            array.splice(index, 1); // Elimina el objeto en la posición encontrada
            return true; // Retorna true si se eliminó el objeto
        }
        //Eliminar por Orden
        index = array.findIndex(obj => obj.DocEntry === Orden);
        if (index !== -1) {
            array.splice(index, 1); // Elimina el objeto en la posición encontrada
            return true; // Retorna true si se eliminó el objeto
        }
        return false; // Retorna false si no se encontró el objeto
    }
    //Validar tiempo transcurrido por OV
    async CheckTimeOV(DocEntry) {
        try {

            this.response = await $.ajax({
                url: this.urldestino,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    DocEntry: DocEntry
                }
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (this.response.Status == "OK") {
                this.AnyData = JSON.parse(this.response.Data);
                return this.AnyData;
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();
        }
    }

    //Trae las series de SN
    async SeriesNumeracion() {
        try {
            this.seriesnumeracion = $('body').attr("seriesnumeracion");

            const response = await $.ajax({
                url: this.seriesnumeracion,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    "ObjectCode": this.ObjectCodeSeriesOV
                }
            });
            if (response.Status == "OK") {
                this.seriesList = JSON.parse(response.Data);

                //console.log(this.configPPSN);
                //console.log(this.seriesList);
                let listaS = [];

                this.configPPSN
                    .filter((c) => c.Valor == 1)
                    .forEach((e) => {
                        let serie = this.seriesList.find((x) => x.SeriesName == e.Nombre);
                        if (serie) {
                            listaS.push(serie.Series);
                        }
                        else {
                            console.log(e);
                        }
                    });
                this.SerieID = listaS.join(",");
            }

            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
                console.error(response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();
            console.error(response.Message);
        }
    }

    //Trae la configuracion de filtros SN por usuario
    async GetCondigPPSN() {
        try {
            Loading();
            let configPPSN = $("#EdicionOrdenes").attr("configPPSN");
            this.response = await $.ajax({
                url: configPPSN,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    email: sessionStorage.getItem("email")
                }
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (this.response.Status == "OK") {
                let configSN = JSON.parse(this.response.Data);
                //console.log(configSN);
                this.configPPSN = configSN;
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.response.Message);
            }

            StopLoading();

        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();
        }
    }

    //Hace el cambio visual de los checkbox SN
    SetConfigPPSN() {
        // Recorre el array de datos
        this.configPPSN.forEach(item => {
            // Busca el checkbox cuyo label coincida con el nombre
            $("#SerNumC .form-check").each(function () {
                const label = $(this).find("label").text().trim(); // Obtiene el texto del label
                if (label === item.Nombre) {
                    // Marca o desmarca el checkbox según el valor
                    $(this).find("input[type='checkbox']").prop("checked", item.Valor === 1);

                }
            });
        });
    }

    //Hace el cambio visual de los checkbox SN
    SetConfigPPSNOF() {
        // Recorre el array de datos
        this.configPPSN.forEach(item => {
            // Busca el checkbox cuyo label coincida con el nombre
            $("#SerNumCOF .form-check").each(function () {
                const label = $(this).find("label").text().trim(); // Obtiene el texto del label
                if (label === item.Nombre) {
                    // Marca o desmarca el checkbox según el valor
                    $(this).find("input[type='checkbox']").prop("checked", item.Valor === 1);

                }
            });
        });
    }

    //Hace el cambio en BD para el cuargado de los filtros SN
    async changeConfigPPSN(listaSN) {
        try {
            let urlUpdateConfig = $('#SerNumC').attr("updateconfigPP");

            const response = await $.ajax({
                url: urlUpdateConfig,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    email: sessionStorage.getItem("email"),
                    "configSN": listaSN
                }
            });
            if (response.Status == "OK") {
                //console.log(response);
            }

            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();
        }
    }

    //Trae la configuracion de columnas ocultas en STEP 2
    async GetCondigAPC() {
        try {
            //Loading();
            let configPPSN = $("#step-3").attr("getconfigAPC");
            this.response = await $.ajax({
                url: configPPSN,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    email: sessionStorage.getItem("email")
                }
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (this.response.Status == "OK") {
                let configAPC = JSON.parse(this.response.Data);
                //console.log(configAPC);

                //Ocultar las columnas 
                configAPC
                    .filter((e) => e.Valor == 0)
                    .forEach((c) => {
                        // Encuentra el índice del encabezado con el texto especificado
                        let index = $("#OVPrioridad thead th").filter(function () {
                            return $(this).text().trim() === c.Nombre.trim();
                        }).index();

                        // Si se encuentra el índice, oculta la columna
                        if (index !== -1) {
                            // Oculta el encabezado
                            $("#OVPrioridad thead th").eq(index).hide();
                            // Oculta las celdas correspondientes en el cuerpo de la tabla
                            $("#OVPrioridad tbody tr").each(function () {
                                $(this).find("td").eq(index).hide();
                            });
                        } else {
                            console.error("Columna no encontrada: " + c.Nombre);
                        }
                    })


            }
            else {
                LayoutCs.Alerta("Plan de producción", this.response.Message);
            }

            //StopLoading();

        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();
        }
    }

    //Guarda el cambio en la configuracion de columnas visibles STEP 2
    async UpdateConfigAPC(nombre, valorC) {
        try {
            let urlUpdateConfigAPC = $('#step-3').attr("updateconfigAPC");

            const response = await $.ajax({
                url: urlUpdateConfigAPC,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    email: sessionStorage.getItem("email"),
                    nombreColumna: nombre,
                    valor: valorC
                }
            });
            if (response.Status == "OK") {
                //console.log(response);
            }
            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();
        }
    }

    async GetConfigOCAPC() {
        try {
            Loading();
            let configOCAPC = $("#step-3").attr("getconfigOCAPC");
            this.response = await $.ajax({
                url: configOCAPC,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    email: sessionStorage.getItem("email")
                }
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (this.response.Status == "OK") {
                let configOCAPC = JSON.parse(this.response.Data);
                //console.log(configOCAPC);

                this.OrdenarTabla("OVPrioridad", configOCAPC);
            }
            else {
                LayoutCs.Alerta("Plan de producción", this.response.Message);
            }

            StopLoading();

        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();
        }
    }

    OrdenarTabla(tablaId, arrayOrden) {
        // Buscar la tabla y sus filas
        const $tabla = $(`#${tablaId}`);
        const $thead = $tabla.find("thead tr");
        const $tbody = $tabla.find("tbody");

        // Crear un mapa para el orden basado en el array
        const orden = {};
        arrayOrden.forEach(item => {
            orden[item.Nombre] = item.Valor;
        });

        // Ordenar las columnas del <thead>
        const columnasOrdenadas = $thead.children("th").sort((a, b) => {
            const textoA = $(a).text().trim();
            const textoB = $(b).text().trim();
            return (orden[textoA] || 999) - (orden[textoB] || 999);
        });

        // Reemplazar las columnas en el <thead>
        $thead.empty().append(columnasOrdenadas);

        // Ordenar las columnas del <tbody>
        $tbody.children("tr").each(function () {
            const $row = $(this);
            const celdasOrdenadas = $row.children("td").sort((a, b) => {
                const indexA = $thead.children("th").index($thead.find(`th:contains("${$(a).text().trim()}")`));
                const indexB = $thead.children("th").index($thead.find(`th:contains("${$(b).text().trim()}")`));
                return indexA - indexB;
            });
            $row.empty().append(celdasOrdenadas);
        });
    }

    //Trae los nombres de las lineas
    async GetInfoFamilias() {
        try {
            let urlnamelineas = $('body').attr("infoFamilias");

            const response = await $.ajax({
                url: urlnamelineas,
                type: 'POST',
                dataType: 'JSON',
            });
            if (response.Status == "OK") {
                let nombreLineas = JSON.parse(response.Data);
                console.log(nombreLineas);

                nombreLineas.sort((a, b) => a.Familia.length - b.Familia.length);

                let Lineas = "";
                $("#FiltroFamilias").empty();
                $.each(nombreLineas, function (index, item) {

                    let sizecol = "col-4";

                   // if (item.Familia.length > 11) sizecol = "col-5"


                    Lineas += `
                    <div class="form-check familias-check ${sizecol}" 
                        style="display: flex; flex-direction: column; align-items: flex-start;">
                      <input type="checkbox" class="form-check-input anycheck nombreFamilias"
                      numFam="${item.NumFamilia}">
                      <label class="form-check-label">${item.Familia}</label>
                    </div>`;

                });

                $("#FiltroFamilias").append(Lineas);


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
    async GetInfoFamiliasOF() {
        try {
            let urlnamelineas = $('body').attr("infoFamilias");

            const response = await $.ajax({
                url: urlnamelineas,
                type: 'POST',
                dataType: 'JSON',
            });
            if (response.Status == "OK") {
                let nombreLineas = JSON.parse(response.Data);
                console.log(nombreLineas);

                nombreLineas.sort((a, b) => a.Familia.length - b.Familia.length);

                let Lineas = "";
                $("#FiltroFamiliasOF").empty();
                $.each(nombreLineas, function (index, item) {

                    let sizecol = "col-4";

                    // if (item.Familia.length > 11) sizecol = "col-5"


                    Lineas += `
                    <div class="form-check familias-check ${sizecol}" 
                        style="display: flex; flex-direction: column; align-items: flex-start;">
                      <input type="checkbox" class="form-check-input anycheck nombreFamiliasOF"
                      numFam="${item.NumFamilia}">
                      <label class="form-check-label">${item.Familia}</label>
                    </div>`;

                });

                $("#FiltroFamiliasOF").append(Lineas);


            }

            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();
        }
    }


    async SeriesNumeracionDocsOF(ObjectCode) {
        try {
            this.seriesnumeracion = $('body').attr("seriesnumeracion");

            const response = await $.ajax({
                url: this.seriesnumeracion,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    "ObjectCode": ObjectCode
                }
            });
            if (response.Status == "OK") {
                this.SeriesNumeracionData = JSON.parse(response.Data);
                $("#SerNumCOF").empty();
                $.each(this.SeriesNumeracionData, function (index, item) {
                    var Series = LayoutCs.SeriesItemOF.replace("{id}", item.Series)
                        .replace("{seriesname}", item.SeriesName)
                    $("#SerNumCOF").append(Series);
                });
            }

            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();
        }
    }


    showStepOF(step) {
        $('.step-content').removeClass('active');
        $('#stepOF-' + step).addClass('active');
        this.renderBody(step);

    }
    // Ir al siguiente paso
    async nextStepOF() {
        if (this.currentStep < this.totalSteps) {

            //Validacion de seleccion de ORDENES DE VENTA
            switch (this.currentStep) {
                case 1:
                    //Ordenes de venta seleccionadas
                    await this.Step1OF();
                    break;
                case 2:
                    //Ordenes de venta seleccionadas
                    this.Step2OF();
                    break;
                case 3:
                    //Ordenes de venta seleccionadas
                    this.Step3OF();
                    break;
                case 4:
                    //Ordenes de venta seleccionadas
                    this.Step4OF();
                    break;
            }

            if (this.go) {
                this.currentStep++;
                //Obtener el paso actual
                let steps = $(".stepOF");
                //Marcar el siguiente paso
                $.each(steps, function (i) {
                    if (!$(steps[i]).hasClass('current') && !$(steps[i]).hasClass('done')) {
                        $(steps[i]).addClass('current');
                        $(steps[i - 1]).removeClass('current').addClass('done');
                        return false;
                    }
                });
                this.showStepOF(this.currentStep);
                LayoutCs.GoTop();
            }

        }
    }

    // Ir al paso anterior
    prevStepOF() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStepOF(this.currentStep);
        }
    }
    //Validaciones paso 1 Avanzar a asignación de linea
    async Step1OF() {
        Loading();

        let VerifyOvSelected = this.ListSectedOV.join(",");


        if (this.ListSectedOV.length == 0) {
            LayoutCs.Alerta("Plan de producción", "Debes seleccionar al menos una orden de fabricación para continuar.");
            this.go = false;
            StopLoading();

        }
        else {

            //VALIDAR SI DEBEN SELECCIONAR O NO EL ARTICULO POR OV DE ACUERDO
            //AL NUMERO DE ARTICULOS DE LA ORDEN
            let howmanyov = this.ListSectedOV.length == 0;
           // if (howmanyov != this.ArticleSelected.length) {
                //Ejecutar la consulta
                this.urldestino = $("#OF").attr("getitemsbyov");
                this.AnyData = "";
                this.AnyData = await this.ItemsByOV(VerifyOvSelected);

                this.grouppreviewdataPP = LayoutCs.agruparPorDocEntry(this.AnyData);
               
                this.FilterOVList = await this.GetOVXDocEntry("OF");

                EdicionPlanProduccionCs.AnyData = "";
                let columnasrestantes = "";
                let celdasrestantes = "";
                //Agregar las ordenes de venta seleccionadas
                $.each(this.FilterOVList, function (index, item) {

                    //Generar encabezado dinamicamente para el resto de columnas
                    if (index == 0) {
                        columnasrestantes = "<tr>";
                        let headershow = "";
                        $.each(item, function (indexitem, itemdata) {
                            if (!EdicionPlanProduccionCs.ExcludeColumsPP.includes(indexitem)) {

                                //Hide
                                if (EdicionPlanProduccionCs.HideColumns.includes(indexitem)) {
                                    headershow = "d-none notremove";
                                }
                                else if (EdicionPlanProduccionCs.AlwaysHidden.includes(indexitem)) {
                                    headershow += "d-none notremove alwayshidden";
                                }
                                else
                                    headershow = "";



                                columnasrestantes +=
                                    `<th id="${indexitem}" class="${headershow}" width="200">
                                                        ${LayoutCs.SpaceByUppercase(indexitem)}
                                                    </th>`;
                            }
                        });

                        columnasrestantes += "</tr>";
                    }

                    //Resto de datos
                    //Saber si requiere edicion y de que tipo
                    let hideClass = "";
                    let hasEdit = "";
                    //Abrir fila
                    celdasrestantes = "<tr>";
                    $.each(item, function (indexitem, itemdata) {
                        hasEdit = "";
                        if (!EdicionPlanProduccionCs.ExcludeColumsPP.includes(indexitem)) {

                            if (EdicionPlanProduccionCs.ColumnsWithEdit.includes(indexitem)) {
                                hasEdit = "editMe";
                            }

                            if (EdicionPlanProduccionCs.ColumnsWithEditTime.includes(indexitem)) {
                                hasEdit = "TimeField";
                            }

                            //Hide
                            if (EdicionPlanProduccionCs.HideColumns.includes(indexitem)) {
                                hideClass = "d-none notremove";
                            }
                            else if (EdicionPlanProduccionCs.AlwaysHidden.includes(indexitem)) {
                                hideClass += "d-none notremove alwayshidden";
                            }

                            else {
                                hideClass = "";
                            }

                            if (indexitem == "Linea") {
                                celdasrestantes += `<td class="position-relative linea">
                                                           <input type="checkbox" class="form-check-input editline" style="margin-left: 1px;"/>
                                                           <span class="td-value">${(itemdata == null ? '' : itemdata)}</span>
                                                        </td>`;
                            }

                            else {
                                celdasrestantes += `
                                                <td class="${indexitem.toLowerCase()} ${hideClass} ${hasEdit}" 
                                                    data-id="${indexitem}"
                                                    data-name="${LayoutCs.SpaceByUppercase(indexitem)}">
                                                    ${(itemdata == null ? '' : itemdata)}
                                               </td>`;
                            }

                            //celdasrestantes += `
                            //                    <td class="${indexitem.toLowerCase()} ${hideClass} ${hasEdit}" 
                            //                        data-id="${indexitem}"
                            //                        data-name="${LayoutCs.SpaceByUppercase(indexitem)}">
                            //                        ${(itemdata == null ? '' : itemdata)}
                            //                   </td>`;
                        }
                    });
                    //Cerrar la fila
                    celdasrestantes += "</tr>"
                    //Guardar todas las filas
                    EdicionPlanProduccionCs.AnyData += celdasrestantes;
                });
                //Llenar los encabezados
                $("#OFSelected thead").empty();
                $("#OFSelected thead").append(columnasrestantes);
                $("#OFSelected tbody").empty();
                $("#OFSelected tbody").append(EdicionPlanProduccionCs.AnyData);
                //Hacer editable la tabla
                LayoutCs.MakeTableEditable("OFSelected");

                this.go = true;
        }
        StopLoading();
    }
    //Validaciones paso 2 Avanzar a la asignacion de comentarios y prioridad
    async Step2OF() {  // Agregar async aquí
        //Datos de encabezado de vista previa
        Loading();
        //Validar si asignaron la linea correctamente
        this.haslinea = $('#OFSelected tbody tr').filter(function () {
            var celda = $(this).find('td.linea').text().trim(); // Obtener el valor de la celda con clase "linea"
            return celda === ''; // Filtrar celdas vacías o no numéricas
        });

        this.haslinea = this.haslinea.length > 0 ? false : true;

        switch (this.haslinea) {
            case true:

                // Clonar la tabla
                var tabla = $('#OFSelected').clone();
                // Cambiamos el ID de la tabla clonada
                tabla.attr('id', 'OFPrioridadTable');
                // Eliminamos la clase editMe de todas las celdas
                tabla.find('td:not(.notremove), th:not(.notremove)').removeClass('editMe');
                // Quitar la clase 'd-none' de la primera celda de cada fila
                tabla.find('td:not(.alwayshidden), th:not(.alwayshidden)').removeClass('d-none');
                // Agregamos la clase ui-sortable-handle a las filas tr
                tabla.find('tr').addClass('ui-sortable-handle');
                // Eliminamos los checkbox que funcionaron para editar la linea
                tabla.find('input[type="checkbox"]').remove();
                // Seleccionar todas las celdas <td> dentro de la tabla y aplicar .trim()
                tabla.find('td').each(function () {
                    var textoLimpio = $(this).text().trim();  // Aplicar .trim() al texto de la celda
                    $(this).text(textoLimpio);  // Establecer el texto sin espacios
                });
                //Agregar position relativa a la primera celda de cada fila
                //Ademas del color que indica si ya paso mas de un dia desde que se creo la orden
                for (let index = 0; index < tabla.find('tr').length; index++) {
                    let fila = $(tabla.find('tr')[index]);
                    if (index === 0) continue; // Excluye la primera fila (encabezado)
                    fila.find('td:nth-child(2)').addClass("position-relative");

                    let DocEntry = fila.find('td.docentry').text();
                    EdicionPlanProduccionCs.urldestino = $("#OF").attr("checktimeov");
                    let TiempoTranscurrido = await EdicionPlanProduccionCs.CheckTimeOV(DocEntry); // Aquí puedes usar await
                    if (TiempoTranscurrido[0].TiempoTranscurrido > 0) {
                        // Agregar el icono en la primera celda
                        // Prepend el icono a la primera celda
                        fila.find('td:not(.d-none):not(.alwayshiden)').first().prepend('<i class="bi bi-alarm-fill icontimerow"></i>');

                        //fila.find('td:nth-child(1)').prepend('<i class="bi bi-alarm-fill icontimerow"></i> ');
                        fila.find('td').css('background-color', 'lightgray');
                    }
                }
                // Remueve el min-width
                tabla.css('min-width', '');
                //Insertar la tabla
                $('#OFPrioridad').html(tabla);



                //Hacer editables los comentarios
                LayoutCs.MakeTableEditable("OFPrioridadTable");
                //Permirir reordenar las columnas
                //LayoutCs.enablecolumnordering("OVPrioridadTable");
                //Avanzar
                this.go = true;


                //LayoutCs.enableColumnOrdering("OVPrioridadTable");
                //Configuracion de columnas ocultas
                this.GetCondigAPC();
                //Configuracion de orden de columnas
                //this.GetConfigOCAPC();
                //Permitir el ordenamiento de las filas de la tabla
                LayoutCs.enableRowSorting("OFPrioridadTable", 2);
                //Permitir el ordenamiento de las columnas de la tabla
                LayoutCs.enableColumnOrdering("OFPrioridadTable");



                break;

            case false:
                LayoutCs.Alerta("Plan de producción", "Se debe indicar a que línea de producción debe ir cada orden.");
                this.go = false;
                break;
        }


        StopLoading();
    }
    //Validaciones paso 3 Avanzar a la vista previa de el plan de producción
    async Step3OF() {
        try {
            //Datos de encabezado de vista previa
            Loading();
            switch (this.hascomments && this.hasprioridad) {
                case true:
                    $("#reportbylinepreviewOF").empty();
                    //Datos de OV
                    this.previewdataPP = $('#OFPrioridadTable tbody tr').map(function (index) {
                        return {
                            Folio: "",
                            Generada: "",
                            OrdenFabricacion: $(this).find('td.ordenfabricacion').text(),
                            Estatus: "",
                            DocEntry: $(this).find('td.docentry').text(),
                            ComentariosExtras: $(this).find('td.comentariosextras').text(),
                            UbicacionPropuesta: $(this).find('td.ubicacionpropuesta').text(),
                            HoraPropuesta: $(this).find('td.horapropuesta').text(),
                            UbicacionFinal: $(this).find('td.ubicacionfinal').text(),
                            Linea: $(this).find('td.linea').text().trim(),
                            NewRow: ($(this).find('td.linea').attr("newRow") == undefined ? 'N/A' : $(this).find('td.linea').attr("newRow")),
                            Rollos: $(this).find('td.rollos').text(),
                            PiezasProducidas: $(this).find('td.piezasproducidas').text(),
                            Pedido: $(this).find('td.pedido').text(),
                            CodigoCliente: $(this).find('td.codigocliente').text(),
                            Solicitado: $(this).find('td.solicitado').text(),
                            Articulo: $(this).find('td.articulo').text(),
                            DescripcionArticulo: $(this).find('td.descripcionarticulo').text(),
                            Almacen: $(this).find('td.almacen').text(),
                            MetrosRollo: $(this).find('td.metrosrollo').text(),
                            Especificacion: $(this).find('td.especificacion').text(),
                            HoraInicio: $(this).find('td.horainicio').text(),
                            HoraFinal: $(this).find('td.horafinal').text(),
                            TiempoProduccion: $(this).find('td.tiempoproduccion').text(),
                            CantidadMetros: $(this).find('td.cantidadmetros').text(),
                            Comentarios: $(this).find('td.comentarios').text(),
                            FechaContabilizacion: $(this).find('td.fechacontabilizacion').text(),
                            FechaFabricacion: $(this).find('td.fechafabricacion').text(),
                            FechaEntrega: $(this).find('td.fechaentrega').text(),
                            Cliente: $(this).find('td.cliente').text(),
                            CantidadKilos: $(this).find('td.cantidadkilos').text(),
                            Orden: index
                        };
                    }).get();
                    //Datos de OV agrupados por linea
                    this.grouppreviewdataPP = LayoutCs.agruparPorLinea(this.previewdataPP);

                    // Recorrer el resultado agrupado y mostrar en la consola
                    $.each(this.grouppreviewdataPP, function (linea, items) {
                        EdicionPlanProduccionCs.subtablelinedetails = "";
                        //Especificar la linea en el encabezado
                        EdicionPlanProduccionCs.subtablelinedetails += EdicionPlanProduccionCs.subtablelinedetailsheader.replace("{linea}", linea);

                        //Crear los registros en la tabla
                        EdicionPlanProduccionCs.subtablelinedetails += EdicionPlanProduccionCs.subtablelinedetailsbodyOF;

                        //Recorrer la lista de ordenes agrupada por linea
                        EdicionPlanProduccionCs.AnyData = "";
                        $.each(items, function (index, item) {

                            //Se dejo asi porque de aqui no se generar OF
                            let input = "N/A";


                            EdicionPlanProduccionCs.AnyData += `<tr>
                                                         <td class="d-none">
                                                            ${input}
                                                         </td>
                                                         <td>${item.OrdenFabricacion.trim()}</td>
                                                         <td>${item.Linea.trim()}</td>
                                                         <td>${item.UbicacionPropuesta}</td>
                                                         <td>${item.UbicacionFinal}</td>
                                                         <td>${item.Rollos}</td>
                                                         <td>${item.PiezasProducidas}</td>
                                                         <td>${item.Pedido}</td>
                                                         <td>${item.CodigoCliente}</td>
                                                         <td>${item.Solicitado}</td>
                                                         <td>${item.Articulo}</td>
                                                         <td>${item.MetrosRollo}</td>
                                                         <td>${item.FechaEntrega}</td>
                                                         <td>${item.CantidadMetros}</td>
                                                         <td>${item.Comentarios}</td>
                                                         <td>${item.ComentariosExtras}</td>
                                                         <td>${item.HoraPropuesta}</td>
                                                         <td>${item.DescripcionArticulo}</td>
                                                         <td>${item.Almacen}</td>
                                                         <td>${item.Especificacion}</td>
                                                         <td>${item.HoraInicio}</td>
                                                         <td>${item.HoraFinal}</td>
                                                         <td>${item.TiempoProduccion}</td>
                                                         <td>${item.FechaContabilizacion}</td>
                                                         <td>${item.FechaFabricacion}</td>
                                                         <td>${item.Cliente}</td>
                                                         <td>${item.CantidadKilos}</td>
                                                         </tr>`;
                        });
                        //Agregar las OV agrupadas por linea
                        EdicionPlanProduccionCs.subtablelinedetails = EdicionPlanProduccionCs.subtablelinedetails.replace("{rows}", EdicionPlanProduccionCs.AnyData);
                        EdicionPlanProduccionCs.AnyData = "";
                        $("#reportbylinepreviewOF").append(EdicionPlanProduccionCs.subtablelinedetails.trim());
                    });

                    let fecha_actual = LayoutCs.FechaActual();
                    $("#fecha-liberacionOF").text(fecha_actual);
                    $("#fecha-revisionOF").text(fecha_actual);
                    $("#fecha-documento0F").text(fecha_actual);
                    $("#folioOF").text("--");
                    EdicionPlanProduccionCs.go = true;

                    break;

                case false:
                    LayoutCs.Alerta("Plan de producción", "Se debe agregar prioridad y comentarios en cada una de las ordenes de venta para continuar.");
                    this.go = false;
                    break;
            }

            StopLoading();
        }
        catch (exception) {
            LayoutCs.Alerta("Plan de producción", "No fue posible crear las ordenes de fabricación: " + exception);
            StopLoading();
        }

    }
    //Validaciones paso 4 Avanzar a la creación de las ordenes de fabricación
    async Step4OF() {
        try {
            Loading();
            //Indicar que las lineas en blanco no deben ser generadas como OF EN SAP

            //Obtenemos el DocEntry vacio de las nuevas filas
            let EmptyRow = ""
            //Seleccionamos la OV de la lista para actualizar OrdenFabricacion
            // let OVFound = EdicionPlanProduccionCs.previewdataPP.filter(OVFound => OVFound.DocEntry === EmptyRow);

            let OVFound = EdicionPlanProduccionCs.previewdataPP;
            //Datos de OV agrupados por linea
            //this.grouppreviewdataPP = LayoutCs.agruparPorLinea(EdicionPlanProduccionCs.previewdataPP);
            this.grouppreviewdataPP = LayoutCs.agruparPorLinea(OVFound);
            //Generar OF
            this.generateOF = $("#OF").attr("AddOF");

            this.response = await $.ajax({
                url: this.generateOF,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    FolioOriginal: EdicionPlanProduccionCs.FolioPP,
                    LineaOriginal: EdicionPlanProduccionCs.Linea,
                    PlanProduccion: JSON.stringify(this.grouppreviewdataPP),
                    PreviewFolio: this.FolioPP,
                    Usuario: sessionStorage.getItem("email"),
                    Tabla: "PlanProduccion"
                }
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (this.response.Status == "OK") {
                this.AnyData = JSON.parse(this.response.Data);
                //Asignar los valores de resultado del plan de produccion ejecutado en SAP
                this.AnyData.forEach(function (item) {
                    let obj = EdicionPlanProduccionCs.previewdataPP.find(obj => obj.DocEntry === item.DocEntry);
                    if (obj) {
                        obj.Folio = item.Folio; // Actualizamos el atributo "Folio de la vista previa"
                        obj.Generada = item.Generada; // Actualizamos el atributo "Generada de la vista previa"
                        obj.OrdenFabricacion = item.OrdenFabricacion; // Actualizamos el atributo "OrdenFabricacion de la vista previa"
                        obj.Estatus = item.Estatus; // Actualizamos el atributo "Estatus de la vista previa"
                        obj.EstatusProduccion = item.EstatusProduccion
                    }
                });
                EdicionPlanProduccionCs.grouppreviewdataPP = LayoutCs.agruparPorLinea(EdicionPlanProduccionCs.previewdataPP);
                // Recorrer el resultado agrupado y mostrar en la consola
                $.each(EdicionPlanProduccionCs.grouppreviewdataPP, function (linea, items) {

                    EdicionPlanProduccionCs.subtablelinedetails = "";
                    //Especificar la linea en el encabezado
                    EdicionPlanProduccionCs.subtablelinedetails += EdicionPlanProduccionCs.subtablelinedetailsheader.replace("{linea}", linea);

                    //Crear los registros en la tabla
                    EdicionPlanProduccionCs.subtablelinedetails += EdicionPlanProduccionCs.subtablelinedetailsbodyfinalOF;

                    //Recorrer la lista de ordenes agrupada por linea
                    EdicionPlanProduccionCs.AnyData = "";
                    $.each(items, function (index, item) {
                        //Guardar el folio para mostrar el que finalmente se genero
                        EdicionPlanProduccionCs.folio = item.Folio;
                        let EstatusSap = item.Estatus;
                        //let EstatusProduccion = (item.Estatus != 'La orden de venta no cuenta con fecha de entrega' ? 'En cola' : 'Sin OF generada');
                        //Color Warning
                        let warning = ""
                        if (item.Generada == "TRUE" && EstatusSap != "en cola" && item.OrdenFabricacion == '') {
                            warning = "bg-danger text-white"
                        }

                        //si la fila es de las agregadas (no generada en SAP), asignamos los campos correspondientes como N/A
                        item.OrdenFabricacion == "N/A" ? "N/A" : item.OrdenFabricacion



                        EdicionPlanProduccionCs.AnyData += `<tr>
                                                         <td>${item.Folio}</td>
                                                         <td>${item.UbicacionPropuesta}</td>
                                                         <td>${item.UbicacionFinal}</td>
                                                         <td>${item.Generada == 'N/A' ? 'N/A' : item.OrdenFabricacion}</td>
                                                         <td>${item.Generada == 'N/A' ? 'N/A' : item.EstatusProduccion}</td>
                                                         <td>${item.Rollos}</td>
                                                         <td>${item.PiezasProducidas}</td>
                                                         <td>${item.Pedido}</td>
                                                         <td>${item.CodigoCliente}</td>
                                                         <td>${item.Solicitado}</td>
                                                         <td>${item.Articulo}</td>
                                                         <td>${item.MetrosRollo}</td>
                                                         <td>${item.CantidadMetros}</td>
                                                         <td>${item.FechaEntrega}</td>
                                                         <td>${item.Comentarios}</td>
                                                         <td>${item.ComentariosExtras}</td>
                                                         <td>${item.HoraPropuesta}</td>
                                                         <td>${item.Linea}</td>
                                                         <td>${item.DescripcionArticulo}</td>
                                                         <td>${item.Almacen}</td>
                                                         <td>${item.Especificacion}</td>
                                                         <td>${item.HoraInicio}</td>
                                                         <td>${item.HoraFinal}</td>
                                                         <td>${item.TiempoProduccion}</td>
                                                         <td>${item.FechaContabilizacion}</td>
                                                         <td>${item.FechaFabricacion}</td>
                                                         <td>${item.Cliente}</td>
                                                         <td>${item.CantidadKilos}</td>
                                                         </tr>`;
                    });
                    //Agregar las OV agrupadas por linea
                    EdicionPlanProduccionCs.subtablelinedetails = EdicionPlanProduccionCs.subtablelinedetails.replace("{rows}", EdicionPlanProduccionCs.AnyData);
                    EdicionPlanProduccionCs.AnyData = "";
                    $("#reportfinalOF").append(EdicionPlanProduccionCs.subtablelinedetails.trim());
                    $("#OFabricacionOF #foliof").text(EdicionPlanProduccionCs.folio);
                    let fecha_actual = LayoutCs.FechaActual();
                    $("#OFabricacionOF #fecha-liberacionf").text(fecha_actual);
                    $("#OFabricacionOF #fecha-revisionf").text(fecha_actual);
                    $("#OFabricacionOF #fecha-documentof").text(fecha_actual);
                });

                //Despues de mostrar el resultado guardar cambiar el texto y funcion de los botones
                $("#regresarOF").addClass("d-none");
                $("#continuarOF").attr("restart", "true");
                $("#continuarOF").text("Volver al inicio");
            }
            else {
                //Despues de mostrar el resultado guardar cambiar el texto y funcion de los botones
                $("#regresarOF").addClass("d-none");
                $("#continuarOF").attr("restart", "true");
                $("#continuarOF").text("Volver al inicio");
                LayoutCs.Alerta("Plan de producción", this.response.Message);
            }
            StopLoading();
        }
        catch (exception) {
            LayoutCs.Alerta("Plan de producción", "No fue posible actualizar el plan de producción: " + exception);
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

                let htmlComplete = "";

                nombreLineas.forEach((l) => {
                    htmlComplete +=
                        `
                         <option value="${l.Linea.trim()}">
                            ${l.Linea.trim()}
                         </option>
                        `
                });

                LayoutCs.LineasValidasEdi = htmlComplete.trim();
                console.log(LayoutCs.LineasValidasEdi);


            }

            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
                console.error("Plan de producción", response.Message);
            }


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            console.error(error, "Plan de producción");
            StopLoading();
        }
    }
}

//Instancia de clase
const EdicionPlanProduccionCs = new EdicionPlanProduccion();
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
                EdicionPlanProduccionCs.FI = $("#FIINI").val();
                EdicionPlanProduccionCs.FF = $("#FFINI").val();
                break;
            // * Filtro normal
            case "FiltroFecha":
                EdicionPlanProduccionCs.FI = $("#FI").val();
                EdicionPlanProduccionCs.FF = $("#FF").val();
                break;
        }

        EdicionPlanProduccionCs.SetConfigPPSN();

        //Ejecutar la consulta
        EdicionPlanProduccionCs.urldestino = $("#OV").attr("urldestino");
        EdicionPlanProduccionCs.table = EdicionPlanProduccionCs.OV();
        //Mostrar paso 1 y setear valores
        $("#step-1").addClass("active");
        $("#RangoInicio").modal("hide");
        $("#FI").val(EdicionPlanProduccionCs.FI);
        $("#FF").val(EdicionPlanProduccionCs.FF);
        $("#selectAll").prop("checked", false);
    }

    // Añadir la clase 'was-validated' para activar los estilos de validación
    $(this).addClass('was-validated');
}
//EVENTOS
$(function () {

    // Validación de formularios
    $(document).on('submit', '.needs-validation', ValidacionFormularios);

    //Trae la configuracion de filtros SN
    EdicionPlanProduccionCs.GetCondigPPSN()
        .then(() => {
            //Marcar filtros de SN
            EdicionPlanProduccionCs.SeriesNumeracion();
            //EdicionPlanProduccionCs.GetNameLineas();
        })
        .catch((error) => {
            StopLoading();
            console.error("Ocurrió un error:", error);
            // Manejo de errores.
        });

    //CUANDO SE CARGA EL DOCUMENTO (PRIMERA INSTRUCCION)
    LayoutCs.SeriesNumeracionDocs(EdicionPlanProduccionCs.ObjectCodeSeriesOV);

    EdicionPlanProduccionCs.SeriesNumeracionDocsOF(EdicionPlanProduccionCs.ObjectCodeSeriesOV);

    EdicionPlanProduccionCs.GetNameAllLineas();

    //PASO SIGUIENTE -> BOTON SIGUIENTE
    $(".next").on("click", function (e) {
        try {
            let restart = $(this).attr("restart");
            switch (restart) {
                case "true":
                    window.location.reload();
                    break;

                case "false":
                    EdicionPlanProduccionCs.nextStep();
                    break;
            }

        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No fue posible continuar, por favor intenta de nuevo mas tarde: " + error);
            StopLoading();
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
        EdicionPlanProduccionCs.prevStep();
    });


    //PASO SIGUIENTE -> BOTON SIGUIENTE OF
    $(".nextOF").on("click", function (e) {
        try {
            let restart = $(this).attr("restart");
            switch (restart) {
                case "true":
                    window.location.reload();
                    break;

                case "false":
                    EdicionPlanProduccionCs.nextStepOF();
                    break;
            }

        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No fue posible continuar, por favor intenta de nuevo mas tarde: " + error);
            StopLoading();
        }
    });

    //PASO ANTERIOR -> BOTON ANTERIOR
    $(".prevOF").on("click", function (e) {
        let steps = $(".step");
        $.each(steps, function (i) {
            if ($(steps[i]).hasClass('done') && $(steps[i + 1]).hasClass('current')) {
                $(steps[i + 1]).removeClass('current');
                $(steps[i]).removeClass('done').addClass('current');
                return false;
            }
        });
        EdicionPlanProduccionCs.prevStepOF();
    });


    //EVENTOS ORDENES DE VENTAS
    //SELECCIONAR TODAS LAS ORDENES -> Evento de cambio en el checkbox "Seleccionar Todos"
    $(document).on('change', '#selectAll', function () {
        var isChecked = $(this).is(':checked');
        $('#OV tbody tr').toggleClass('selectedrow', isChecked);
        // $('#OV tbody input[type="checkbox"].OVSelected').prop('checked', isChecked);



        let allIds = [];
        if (isChecked) {
            //Se agregan al arreglo solo los que no estan checkeados
            $('#OV tbody input[type="checkbox"].OVSelected:not(:checked)').each(function () {
                let idCheck = $(this).attr("id");
                allIds.push(idCheck);
            });
        }
        else {
            $('#OV tbody input[type="checkbox"].OVSelected').each(function () {
                let idCheck = $(this).attr("id");
                allIds.push(idCheck);
            });
        }


        $('#OV tbody input[type="checkbox"].OVSelected').prop('checked', isChecked);



        if (isChecked) {
            EdicionPlanProduccionCs.ListSectedOV.push(...allIds);
            // allIds.forEach((e) => EdicionPlanProduccionCs.AddRowTablaSelectd(e));
        }
        else {

            //Eliminacion visual
            //allIds.forEach((e) => {
            //    $(`#${e}-OVS`).remove();
            //});

            //Se eliminan los elementos del array
            let set = new Set(allIds);
            let resultado =
                EdicionPlanProduccionCs.ListSectedOV
                    .filter(item => !set.has(item));

            EdicionPlanProduccionCs.ListSectedOV = resultado;

            //if (EdicionPlanProduccionCs.ListSectedOV.length == 0) {
            //    $("#tablaOVSelected").addClass("d-none");
            //    $("#rowOVSelected").addClass("d-none");
            //    $("#sinOSelected").removeClass("d-none");
            //}

        }


    });

    $(document).on('change', '#selectAllOF', function () {
        var isChecked = $(this).is(':checked');
        $('#OF tbody tr').toggleClass('selectedrow', isChecked);
        //  $('#OF tbody input[type="checkbox"].OVSelected').prop('checked', isChecked);

        let allIds = [];
        if (isChecked) {
            //Se agregan al arreglo solo los que no estan checkeados
            $('#OF tbody input[type="checkbox"].OVSelected:not(:checked)').each(function () {
                let idCheck = $(this).attr("id");
                allIds.push(idCheck);
            });
        }
        else {
            $('#OF tbody input[type="checkbox"].OVSelected').each(function () {
                let idCheck = $(this).attr("id");
                allIds.push(idCheck);
            });
        }


        $('#OF tbody input[type="checkbox"].OVSelected').prop('checked', isChecked);



        if (isChecked) {
            EdicionPlanProduccionCs.ListSectedOV.push(...allIds);
            //       allIds.forEach((e) => EdicionPlanProduccionCs.AddRowTablaSelectd(e));
        }
        else {

            //Eliminacion visual
            //allIds.forEach((e) => {
            //    $(`#${e}-OVS`).remove();
            //});

            //Se eliminan los elementos del array
            let set = new Set(allIds);
            let resultado =
                EdicionPlanProduccionCs.ListSectedOV
                    .filter(item => !set.has(item));

            EdicionPlanProduccionCs.ListSectedOV = resultado;

            //if (EdicionPlanProduccionCs.ListSectedOV.length == 0) {
            //    $("#tablaOVSelected").addClass("d-none");
            //    $("#rowOVSelected").addClass("d-none");
            //    $("#sinOSelected").removeClass("d-none");
            //}

        }
    });

    $('#btnFechaOF').on('click', function () {

        EdicionPlanProduccionCs.FI = $("#FIOF").val();
        EdicionPlanProduccionCs.FF = $("#FFOF").val();


        EdicionPlanProduccionCs.SetConfigPPSNOF();

        //Ejecutar la consulta
        $("#selectAllOF").prop("checked", false);
        EdicionPlanProduccionCs.urldestino = $("#OF").attr("urldestino");
        EdicionPlanProduccionCs.table = EdicionPlanProduccionCs.OF();
        //Mostrar paso 1 y setear valores
        $("#stepOF-1").addClass("active");
        $("#FIOF").val(EdicionPlanProduccionCs.FI);
        $("#FFOF").val(EdicionPlanProduccionCs.FF);
    });

    //EVENTOS

    //Edicion de plan de produccion
    $('#PlanProduccion tbody').on('click', '.EditPP', function (event) {
        //Detener la propagacion del evento hacia la fila
        event.stopPropagation();
        //Ejecutar la consulta
        EdicionPlanProduccionCs.urldestino = $("#OV").attr("urldestino");
        EdicionPlanProduccionCs.table = EdicionPlanProduccionCs.OV();



        //Mostrar paso 1 y setear valores
        $("#step-1").addClass("active");
        $("#selectAll").prop("checked", false);
        EdicionPlanProduccionCs.FolioPP = $(this).attr("value");
        EdicionPlanProduccionCs.Linea = $(this).data("linea");
        $("#folioedicionPP").text(EdicionPlanProduccionCs.FolioPP);
        $("#EdicionOrdenes").modal("show");

    });

    //Edicion de plan de produccion menu contextual
    $("#addOFL").on("click", function () {

        //EdicionPlanProduccionCs.ListSectedOV = [];
        EdicionPlanProduccionCs.GetInfoFamiliasOF();
        //Se trae establece el attributo para que filtre por linea
        //EdicionPlanProduccionCs.SelectedLinea = $("#MenuContextBitacora").attr("linea");
        EdicionPlanProduccionCs.FolioFamilia = $("#MenuContextBitacora").attr("folio")


        //Ejecutar la consulta
        EdicionPlanProduccionCs.urldestino = $("#OF").attr("urldestino");
        EdicionPlanProduccionCs.tableOF = EdicionPlanProduccionCs.OF();

        EdicionPlanProduccionCs.SetConfigPPSNOF();

        //Mostrar paso 1 y setear valores
        $("#stepOF-1").addClass("active");
        $("#selectAllOF").prop("checked", false);
        EdicionPlanProduccionCs.FolioPP = $("#MenuContextBitacora").attr("folio");
        EdicionPlanProduccionCs.Linea = $("#MenuContextBitacora").attr("linea");
        $("#folioaddofPP").text(EdicionPlanProduccionCs.FolioPP);
        $("#AddOrdenesFabricacion").modal("show");

        // Ocultar el menú contextual
        $("#MenuContextBitacora").hide();

    });

    //Edicion de plan de produccion menu contextual
    $("#editPPM").on("click", function () {

       // EdicionPlanProduccionCs.ListSectedOV = [];
        EdicionPlanProduccionCs.GetInfoFamilias();
        //Se trae establece el attributo para que filtre por linea
        //EdicionPlanProduccionCs.SelectedLinea = $("#MenuContextBitacora").attr("linea");
        EdicionPlanProduccionCs.FolioFamilia = $("#MenuContextBitacora").attr("folio")


        //Ejecutar la consulta
        EdicionPlanProduccionCs.urldestino = $("#OV").attr("urldestino");
        EdicionPlanProduccionCs.table = EdicionPlanProduccionCs.OV();

        EdicionPlanProduccionCs.SetConfigPPSN();

        //Mostrar paso 1 y setear valores
        $("#step-1").addClass("active");
        $("#selectAll").prop("checked", false);
        EdicionPlanProduccionCs.FolioPP = $("#MenuContextBitacora").attr("folio");
        EdicionPlanProduccionCs.Linea = $("#MenuContextBitacora").attr("linea");
        $("#folioedicionPP").text(EdicionPlanProduccionCs.FolioPP);
        $("#EdicionOrdenes").modal("show");

        // Ocultar el menú contextual
        $("#MenuContextBitacora").hide();

    });

    //Cerrar edicion de plan de produccion 
    $("#CloseEdicionOrdenes").on("click", function () {
        $("#EdicionOrdenes").modal("hide");
    });


    $('#OF tbody').on('click', '.OVSelected', function (event) {
        //Detener la propagacion del evento hacia la fila
        event.stopPropagation();
        // Quitar la clase 'rowselected' de la fila que contiene el checkbox
        $(this).closest('tr').removeClass('selectedrow');


        let idCheck = $(this).attr("id");

        //Se agrega a ListSectedOV
        if ($(this).is(":checked")) {
            //Obtener id del checkbox
            EdicionPlanProduccionCs.ListSectedOV.push(idCheck);
            //EdicionPlanProduccionCs.AddRowTablaSelectd(idCheck);
            //console.log(PlanProduccionCs.ListSectedOV);
        }
        else {
            //Se elimina a ListSectedOV
            let index = EdicionPlanProduccionCs.ListSectedOV.indexOf(idCheck);
            if (index !== -1) {
                EdicionPlanProduccionCs.ListSectedOV.splice(index, 1);
                //console.log(PlanProduccionCs.ListSectedOV);

                //Elimina fila de forma visual
                //$(`#${idCheck}-OVS`).remove();

                //if (EdicionPlanProduccionCs.ListSectedOV.length == 0) {
                //    $("#tablaOVSelected").addClass("d-none");
                //    $("#rowOVSelected").addClass("d-none");

                //    $("#sinOSelected").removeClass("d-none");
                //}

            }
        }
    });


    //Al hacer click en los checkbox de las OV
    $('#OV tbody').on('click', '.OVSelected', function (event) {
        //Detener la propagacion del evento hacia la fila
        event.stopPropagation();
        // Quitar la clase 'rowselected' de la fila que contiene el checkbox
        $(this).closest('tr').removeClass('selectedrow');

        let idCheck = $(this).attr("id");

        //Se agrega a ListSectedOV
        if ($(this).is(":checked")) {

           let existe = EdicionPlanProduccionCs.ListSectedOV.find(ov => ov == idCheck);
            //Obtener id del checkbox
            if (!existe) {
                EdicionPlanProduccionCs.ListSectedOV.push(idCheck);
            }
            //EdicionPlanProduccionCs.AddRowTablaSelectd(idCheck);
            console.log(EdicionPlanProduccionCs.ListSectedOV);
        }
        else {
            //Se elimina a ListSectedOV
            let index = EdicionPlanProduccionCs.ListSectedOV.indexOf(idCheck);
            if (index !== -1) {
                EdicionPlanProduccionCs.ListSectedOV.splice(index, 1);
                //console.log(PlanProduccionCs.ListSectedOV);

                //Elimina fila de forma visual
                //$(`#${idCheck}-OVS`).remove();

                //if (EdicionPlanProduccionCs.ListSectedOV.length == 0) {
                //    $("#tablaOVSelected").addClass("d-none");
                //    $("#rowOVSelected").addClass("d-none");

                //    $("#sinOSelected").removeClass("d-none");
                //}

            }
        }
    });

    //Al hacer click en cualquier fila de la tabla de OV excepto en los checkbox
    $('#OV tbody').on('click', 'tr.OV', function () {
        try {

            if (!$.fn.DataTable.isDataTable('#OV')) {
                console.error("El DataTable aún no está listo.");
                LayoutCs.Alerta("El DataTable aún no está listo.");

                return;
            }

            // Verificar que el DataTable esté inicializado correctamente
            if (!EdicionPlanProduccionCs.table || typeof EdicionPlanProduccionCs.table.row !== 'function') {
                console.error("Error: EdicionPlanProduccionCs.table no es un DataTable válido.");
                LayoutCs.Alerta("Error: EdicionPlanProduccionCs.table no es un DataTable válido.");

                return;
            }

            //Obtener url consulta
            //EdicionPlanProduccionCs.DocEntry = this.childNodes[1].innerText; //DOCENTRY
            //EdicionPlanProduccionCs.DocNum = this.childNodes[2].innerText; //DOCNUM
            EdicionPlanProduccionCs.ovdetails = $("#OV").attr("ovdetails");
            EdicionPlanProduccionCs.rowdata = EdicionPlanProduccionCs.table.row(this).data();
            EdicionPlanProduccionCs.DocEntry = EdicionPlanProduccionCs.rowdata.DocEntry; //DOCENTRY
            EdicionPlanProduccionCs.DocNum = EdicionPlanProduccionCs.rowdata.Pedido; //DOCNUM
            EdicionPlanProduccionCs.current_row = $(this);
            EdicionPlanProduccionCs.row = EdicionPlanProduccionCs.table.row(EdicionPlanProduccionCs.current_row);


            if (EdicionPlanProduccionCs.row.child.isShown()) {
                EdicionPlanProduccionCs.row.child.hide();
                EdicionPlanProduccionCs.current_row.removeClass('shown');
                // Quitar clase PPselected de todas las filas
                $('#OV tbody tr').find('td').removeClass('OVselected');
                // Quitar el ícono de flecha derecha de todas las filas
                $('#OV tbody tr').find('td:first-child .fa-arrow-right').remove();
            }
            else {
                //realizar peticion para obtener detalles
                EdicionPlanProduccionCs.OVDetail();
                // Quitar clase PPselected de todas las filas
                $('#OV tbody tr').find('td').removeClass('OVselected');
                // Quitar el ícono de flecha derecha de todas las filas
                $('#OV tbody tr').find('td:first-child .fa-arrow-right').remove();
                // Añadir clase PPselected a las celdas de la fila seleccionada
                $(this).find('td').addClass('OVselected position-relative');
                // Añadir ícono de flecha derecha a la primera celda de la fila seleccionada
                $(this).find('td:first-child').append('<i class="fas fa-arrow-right iconOVselected"></i>');
            }


        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No es posible obtener los detalles de la OV, por favor contacte al administrador del sistema con el siguiente código de error: " + error);
            StopLoading();
        }
    });

    //Al hacer click en los switch de los articulos de las OV
    $(document).on('click', '.ovdetails .ItemDefault', function () {
        try {

            let Articulo = $(this).data('articulo');
            let DescripcionArticulo = $(this).data('descripcionarticulo');
            let DocEntry = $(this).data('orden');
            let Almacen = $(this).data('almacen');
            let CantidadKilos = $(this).data('cantidad');

            if ($(this).is(":checked")) {
                $("." + DocEntry + "").prop("checked", false);
                $(this).prop("checked", true);
                let NewArticle = { "Articulo": Articulo, "DescripcionArticulo": DescripcionArticulo, "DocEntry": DocEntry.toString(), "Almacen": Almacen, "CantidadKilos": CantidadKilos }
                if (!EdicionPlanProduccionCs.ExisteArticulo(EdicionPlanProduccionCs.ArticleSelected, Articulo, DocEntry.toString(), "false")) {
                    EdicionPlanProduccionCs.ArticleSelected.push(NewArticle);
                }
                else {
                    //Solo debe existir un articulo por OrdenVenta
                    EdicionPlanProduccionCs.EliminarArticulo(EdicionPlanProduccionCs.ArticleSelected, Articulo, DocEntry.toString());
                    EdicionPlanProduccionCs.ArticleSelected.push(NewArticle);
                }

                $(`#OV tr.${DocEntry}`).removeClass('RowAttend');
            }
            else {
                //Solo debe existir un articulo por OrdenVenta
                EdicionPlanProduccionCs.EliminarArticulo(EdicionPlanProduccionCs.ArticleSelected, Articulo, DocEntry.toString());
            }
        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No es posible obtener los detalles de la OV, por favor contacte al administrador del sistema con el siguiente código de error: " + error);
            StopLoading();
        }
    });

    //Al seleccionar las series
    $(document).on("click", ".seriesnumeracion", function () {
        // Obtener los atributos 'series' de los checkboxes seleccionados como un array de números
        EdicionPlanProduccionCs.SerieID = $('.seriesnumeracion:checked').map(function () {
            return parseInt($(this).attr('series')); // Convertir a número entero
        }).get().join(","); // Obtener el array puro
        EdicionPlanProduccionCs.urldestino = $("#OV").attr("urldestino");

        let checkedLabels = [];
        $("#SerNumC .seriesnumeracion:checked").each(function () {
            // Encuentra el label correspondiente al input
            let label = $(this).siblings("label").text();
            checkedLabels.push(label);
        });

        EdicionPlanProduccionCs.table = EdicionPlanProduccionCs.OV();
        EdicionPlanProduccionCs.changeConfigPPSN(checkedLabels.join(","));

        $("#selectAll").prop("checked", false);
    });

    //Al seleccionar las series
    $(document).on("click", ".seriesnumeracionOF", function () {
        // Obtener los atributos 'series' de los checkboxes seleccionados como un array de números
        EdicionPlanProduccionCs.SerieID = $('.seriesnumeracionOF:checked').map(function () {
            return parseInt($(this).attr('series')); // Convertir a número entero
        }).get().join(","); // Obtener el array puro
        EdicionPlanProduccionCs.urldestino = $("#OF").attr("urldestino");

        let checkedLabels = [];
        $("#SerNumCOF .seriesnumeracionOF:checked").each(function () {
            // Encuentra el label correspondiente al input
            let label = $(this).siblings("label").text();
            checkedLabels.push(label);
        });

        EdicionPlanProduccionCs.table = EdicionPlanProduccionCs.OF();
        EdicionPlanProduccionCs.changeConfigPPSN(checkedLabels.join(","));

        $("#selectAllOF").prop("checked", false);
    });


    // Detectar cuando se cambia el estado del checkbox
    $(document).on('change', '.editline', function () {
        var $td = $(this).closest('td'); // Obtener el <td> padre
        // Verificar si el checkbox está seleccionado
        if ($(this).is(':checked')) {
            //Borrar contenido de la celda
            $td.html("");
            // Agregar la clase 'customLine' al <td> padre
            $td.addClass('EditLinea');
            //Seleccionar la celda
            $td.trigger('click');
        } else {
            // Si se deselecciona, remover la clase 'customLine'
            $td.removeClass('EditLinea');
        }
    });

    // Mostrar menú contextual al hacer clic derecho
    $(document).on("contextmenu", "#OVPrioridadTable", function (e) {
        e.preventDefault();
        const parentOffset = $(this).offset(); // Posición del contenedor de la tabla
        const relativeY = e.pageY - parentOffset.top;
        const relativeX = e.pageX - parentOffset.left;

        console.log("top", relativeY);
        console.log("left", relativeX);

        $("#MenuPrioridadComentarios")
            .css({
                top: relativeY + 90 + "px", // Ajusta según sea necesario
                left: relativeX + "px",
            })
            .show();
    });

    // Ocultar menú contextual al hacer clic en cualquier lugar
    $(document).on("click", function () {
        $("#MenuPrioridadComentarios").hide();
    });

    // Manejar las opciones del menú contextual
    $("#MenuPrioridadComentarios li").on("click", function () {
        // Obtener el índice actual de la nueva fila (número de filas ya presentes en la tabla)
        let rowIndex = $("#OVPrioridadTable tr").length;

        // Clonar la primera fila de la tabla
        let firstRow = $("#OVPrioridadTable tr").eq(1).clone();

        //Obtener la linea anterior
        let linea = firstRow.find("td.linea").text();

        // Limpiar el contenido de las celdas
        firstRow.find("td").text("");

        // Obtener la altura de las celdas originales
        let originalHeight = $("#OVPrioridadTable tr").eq(1).find("td").eq(0).outerHeight();

        // Establecer la misma altura en las celdas de la nueva fila
        firstRow.find("td").css("height", originalHeight + "px");

        // Añadir ícono de flecha derecha con el índice como atributo
        firstRow.find('td:nth-child(1)').append('<i class="bi bi-x-circle-fill iconremoverow" data-index="' + rowIndex + '"></i>');

        // Añadir attributo newRow para identificar en siguiente paso
        firstRow.find('td.linea').attr("newRow", "TRUE");
        firstRow.find('td.linea').text(linea);

        // Agregar la clase editMe a las celdas que no tengan las clases CustomOptions o TimeField
        firstRow.find("td:not(.CustomOptions):not(.TimeField)").addClass("editMe");

        //Quitar la clase editMe, para que no se pueda editar la linea
        firstRow.find("td.linea").removeClass("editMe");

        // Agregar la fila al final de la tabla
        $("#OVPrioridadTable").append(firstRow);

        // Ocultar el menú contextual
        $("#MenuPrioridadComentarios").hide();
    });

    // Eliminar la fila agregada en la asigancion de comentarios y prioridad
    $(document).on("click", ".iconremoverow", function () {
        // Obtener el índice de la fila desde el atributo data-index
        let rowIndex = $(this).data("index");

        // Eliminar la fila basada en el índice
        $("#OVPrioridadTable tr").eq(rowIndex).remove();
    });

    //Modal Configuracion de columnas ocultas step 2

    // Manejar el cambio de visibilidad de columnas
    $(document).on("change", '#columnToggle input[type="checkbox"]', function () {
        let indexColumn = $(this).data('column'); // Índice de la columna
        let columName = $(this).data('name'); // Nombre de la columna
        let tabla = $(this).data('table'); // Nombre de la columna
        let showColumn = $(this).is(':checked'); // Estado del checkbox

        // Seleccionar todos los encabezados y celdas de la columna
        $(`#${tabla}PrioridadTable tr`).each(function () {
            let cell = $(this).find('th, td').eq(indexColumn); // Obtener celda por índice
            if (showColumn) {
                cell.show(); // Mostrar columna
            } else {
                cell.hide(); // Ocultar columna
            }
        });

        let valor = showColumn ? 1 : 0;
        EdicionPlanProduccionCs.UpdateConfigAPC(columName, valor);
    })

    // Configurar listado de columnas 
    $("#configAP").on("click", function () {
        let html = "";

        $('#OVPrioridad thead th').each(function (index) {
            let columnName = $(this).text().trim(); // Extrae el texto del encabezado
            let hasClass = $(this).hasClass('alwayshidden');
            let isHidden = $(this).css('display') === 'none'; // Verifica si tiene display: none

            if (!hasClass) {
                let checked = "checked";

                if (isHidden)
                    checked = "";

                html +=
                    `
                <div class="col-sm-4">
                  <input type="checkbox" data-table="OV" data-name="${columnName}" data-column="${index}" ${checked}> ${columnName}
                </div>
               `;
            }

        });

        $("#columnToggle").empty();
        $("#columnToggle").append(html);

        $("#ConfiguracionAP").modal("show");
    });


    // Configurar listado de columnas 
    $("#configAPOF").on("click", function () {
        let html = "";

        $('#OFPrioridad thead th').each(function (index) {
            let columnName = $(this).text().trim(); // Extrae el texto del encabezado
            let hasClass = $(this).hasClass('alwayshidden');
            let isHidden = $(this).css('display') === 'none'; // Verifica si tiene display: none

            if (!hasClass) {
                let checked = "checked";

                if (isHidden)
                    checked = "";

                html +=
                    `
                <div class="col-sm-4">
                  <input type="checkbox" data-table="OF" data-name="${columnName}" data-column="${index}" ${checked}> ${columnName}
                </div>
               `;
            }

        });

        $("#columnToggle").empty();
        $("#columnToggle").append(html);

        $("#ConfiguracionAP").modal("show");
    });


    //Cerrar configuración de columnas visibles
    $("#CerrarConfigAP").on("click", function () {
        $("#ConfiguracionAP").modal("hide");
    });

    //Al seleccionar las lineas
    $(document).on("click", ".nombreFamilias", function () {
        // Obtener los atributos 'series' de los checkboxes seleccionados como un array de números
        EdicionPlanProduccionCs.NumFamilias = $('.nombreFamilias:checked').map(function () {
            return $(this).attr('numFam'); // Convertir a número entero
        }).get().join(","); // Obtener el array puro
        EdicionPlanProduccionCs.urldestino = $("#OV").attr("urldestino");

        EdicionPlanProduccionCs.table = EdicionPlanProduccionCs.OV();
        $("#selectAll").prop("checked", false);
    });

    $(document).on("click", ".nombreFamiliasOF", function () {
        // Obtener los atributos 'series' de los checkboxes seleccionados como un array de números
        EdicionPlanProduccionCs.NumFamilias = $('.nombreFamiliasOF:checked').map(function () {
            return $(this).attr('numFam'); // Convertir a número entero
        }).get().join(","); // Obtener el array puro
        EdicionPlanProduccionCs.urldestino = $("#OF").attr("urldestino");

        EdicionPlanProduccionCs.table = EdicionPlanProduccionCs.OF();
        $("#selectAllOF").prop("checked", false);
    });

});