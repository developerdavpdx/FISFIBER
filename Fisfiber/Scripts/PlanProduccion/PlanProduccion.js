class PlanProduccion {
    //IMPORTANTE CUANDO SE AVANZA EN LOS STEPS
    //ALGUNAS COLUMNAS QUEDARON OCULTAS Y CUANDO SE CLONA
    //LA TABLA DEPENDIENDO EL STEP SE MUESTRAN LAS COLUMNAS OCULTAS
    //QUE PROVIENEN DE LA TABLA INICIAL
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.go = false;
        this.configPPSN = [];
        this.ObjectCodeSeriesOV = "17";
        // + atributo que indica cual es el endpoint de redireccionamiento
        this.urldestino = "";
        // + atributo que indica cual es el endpoint de redireccionamiento para obtener detalles de OV
        this.ovdetails = "";
        this.seriesList = [];
        this.SerieID = "";
        this.Lineas = "";
        this.folio = "";
        this.generateOF = "";
        // * atributo para guardar la tabla de datos
        this.table;
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
        this.ListSectedOV = [];
        this.configColumns = [];
        this.ExcludeCVP = ["Folio", "OrdenFabricacion", "EstatusProduccion", "EstatusSAP"];

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
                                            <table class="table table-preview table-striped m-0" style="table-layout:fixed">
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
        this.subtablelinedetailsbodyVP = `<div class="row m-0 pb-4">
                                            <div class="col-md-12 p-0 body-table">
                                            <table class="table table-preview table-striped m-0" style="table-layout:fixed">
                                            <thead>
                                            <th class="d-none" width="200">Generar</th>
                                                {header}
                                            </thead>
                                            <tbody>{rows}</tbody>
                                            </table>
                                            </div>
                                            </div>`;
        this.subtablelinedetailsbodyfinal = `<div class="row m-0 pb-4">
                                <div class="col-md-12 p-0 body-table">
                                <table class="table table-preview table-striped m-0" style="table-layout:fixed">
                                <thead>
                                    {header}
                                </thead>
                                <tbody>{rows}</tbody>
                                </table>
                                </div>
                                </div>`;
        this.subtablelinedetails = "";


        // * Atributo para guaradar el response de las solicitudes AJAX
        this.response = "";

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
        this.swichNameColumn =
        {
            "Pedido": "No. de documento",
            "Linea": "Línea",
            "Articulo": "Núm artículo",
            "DescripcionArticulo": "Descripción artículo",
            "CodigoCliente": "Núm. cliente",
            "Almacen": "Almacén",
            "Rollos": "No. rollos",
            "CantidadMetros": "Cantidad en metros",
            "FechaContabilizacion": "Fecha de contabilización",
            "FechaFabricacion": "Fecha de fabricación",
            "FechaEntrega": "Fecha de entrega"
        };

        this.swichNameColumnVistaPrev =
        {
            "Pedido": "No. de documento",
            "Linea": "Línea",
            "Articulo": "Num Artículo",
            "DescripcionArticulo": "Descripción Artículo",
            "CodigoCliente": "Num. Cliente",
            "Almacen": "Almacén",
            "Rollos": "No. Rollos",
            "CantidadMetros": "Cantidad en Metros",
            "FechaContabilizacion": "Fecha de contabilización",
            "FechaFabricacion": "Fecha de fabricación",
            "FechaEntrega": "Fecha de entrega"
        };

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

        //PINTAR ORDEN DE ENCABEZADOS
        $("#headOV").empty();
        let htmlHead = "<th></th>";
        this.configColumns.forEach((c) => {

            let nameCol = "";

            if (this.swichNameColumn.hasOwnProperty(c.ColumnName)) {
                nameCol = this.swichNameColumn[c.ColumnName]
            } else {
                nameCol = c.ColumnName;
            }

            nameCol.replace("Num", "Núm");


            htmlHead +=
                `<th>${nameCol}</th>`;
        });
        $("#headOV").append(htmlHead);



        let columns = this.configColumns.map(col => {
            return {
                "data": col.ColumnName,
                "visible": col.Visible === "SI" // Controla visibilidad aquí
            };
        });

        // Agregar columna con checkbox al inicio
        columns.unshift({
            "data": null,
            "render": function (data, type, row) {
                let check = "";

                if (PlanProduccionCs.ListSectedOV.length > 0) {
                    if (PlanProduccionCs.ListSectedOV.includes(row.DocEntry.toString())) {
                        check = "checked";
                    }
                }

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

        let table = $("#OV").DataTable({
            processing: false,
            serverSide: true,
            bDestroy: true,
            autoWidth: false,
            ajax: {
                url: this.urldestino,
                type: "POST",
                dataType: "json",
                data: {
                    "FI": this.FI,
                    "FF": this.FF,
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
                    StopLoading();
                },
                dataSrc: function (json) {
                    PlanProduccionCs.OVList = json.data;
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
                $(row).addClass(data.Series);
                $(row).addClass(data.DocEntry);
                $('td:eq(0)', row).addClass('position-relative');
            }
        });

        $(".buttons-excel").addClass("exceldownload");

        return table.columns.adjust().draw();
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

                this.subtabledetails = `<table class="subtable w-100 m-2 ovdetails">
                                <thead>
                                <th width="100">
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
                    if (PlanProduccionCs.ExisteArticulo(PlanProduccionCs.ArticleSelected, item.Articulo, PlanProduccionCs.DocEntry.toString(), "true")) {
                        articleselected = "checked";
                    }
                    //let NumArticulo = item.Articulo.replace(/\s+/g, ""); // Aquí se eliminan todos los espacios

                    PlanProduccionCs.subtabledetails += `<tr>
                                                         <td class="position-relative colspan-td">
                                                         <div class="form-check form-switch ItemDefaultCc">
                                                          <input class="form-check-input ItemDefault ${PlanProduccionCs.DocEntry}" type="checkbox" ${articleselected} data-orden="${PlanProduccionCs.DocEntry}" data-almacen="${item.Almacen}" data-cantidad="${item.CantidadKilos}" data-articulo="${item.Articulo}" data-descripcionarticulo="${item.DescripcionArticulo}">
                                                         </div>
                                                        </td>
                                                         <td class="colspan-td">${PlanProduccionCs.isNull(item.Articulo)}</td>
                                                         <td class="colspan-td">${PlanProduccionCs.isNull(item.DescripcionArticulo)}</td>
                                                         <td class="colspan-td">${PlanProduccionCs.isNull(item.CantidadSolicitada)}</td>
                                                         <td class="colspan-td">${PlanProduccionCs.isNull(item.CantidadMetros)}</td>
                                                         <td class="colspan-td">${PlanProduccionCs.isNull(item.CantidadKilos)}</td>
                                                         <td class="colspan-td">${PlanProduccionCs.isNull(item.Rollos)}</td>
                                                         <td class="colspan-td">${PlanProduccionCs.isNull(item.PrecioMetro)}</td>
                                                         <td class="colspan-td">${PlanProduccionCs.isNull(item.PorcentajeDescuento)}</td>
                                                         <td class="colspan-td">${PlanProduccionCs.isNull(item.TipoEsquema)}</td>
                                                         <td class="colspan-td">${PlanProduccionCs.isNull(item.UMSolicitada)}</td>
                                                         <td class="colspan-td">${PlanProduccionCs.isNull(item.CantidadYardas)}</td>
                                                         <td class="colspan-td">${PlanProduccionCs.isNull(item.PrecioYarda)}</td>
                                                         </tr>`;

                    // Agregamos el div como una fila hija
                    PlanProduccionCs.row.child(PlanProduccionCs.subtabledetails).show();
                    PlanProduccionCs.current_row.addClass('shown');

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

    isNull(data) {
        if (data == null || data == undefined) data = "";

        return data
    }
    // Método para validar el cuantos articulos tiene la orden y selecionar automaticamente 
    //el de LineNum 0
    async ItemsByOV(DocEntrys) {
        try {
            Loading();
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
    //Filtrar Ordenes de Venta por DocEntry    
    filtrarOVXDocEntry(DocEntryList) {
        return this.OVList.filter(function (item) {
            return DocEntryList.includes(item.DocEntry.toString()); // Verifica si DocEntry está en el arreglo
        });
    }

    //Trae las Ordenes de venta seleccionados
    async GetOVXDocEntry() {
        try {
            //Loading();

            let urlGetOVXDocEntry = $("#OV").attr("urldestino");

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
                    await this.ConfigxUsuarioPPVP("false");
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
                $("#edicionPP").attr("step", this.currentStep);
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
            $("#edicionPP").attr("step", this.currentStep);
        }
    }

    construirTablaVP() {
        $("#reportbyline").empty();
        //Datos de OV
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

        //console.log(this.previewdataPP);

        this.grouppreviewdataPP = LayoutCs.agruparPorLinea(this.previewdataPP);

        //console.log(this.grouppreviewdataPP);

        // Recorrer el resultado agrupado y mostrar en la consola
        $.each(this.grouppreviewdataPP, function (linea, items) {
            PlanProduccionCs.subtablelinedetails = "";
            //Especificar la linea en el encabezado
            PlanProduccionCs.subtablelinedetails +=
                PlanProduccionCs.subtablelinedetailsheader.replace("{linea}", linea);

            //console.log(PlanProduccionCs.subtablelinedetails);
            //console.log(PlanProduccionCs.configColumns);
            //console.log(items);

            //Header table LayoutCs.limpiarTexto()
            let headerHTML = '';
            PlanProduccionCs.configColumns.forEach((c) => {


                if (c.Visible == "SI" && !PlanProduccionCs.ExcludeCVP.includes(LayoutCs.limpiarTexto(c.ColumnName))) {

                    let textoH = LayoutCs.SpaceByUppercase(c.ColumnName);

                    headerHTML += `<th 
                                    width="200" 
                                    class="HV${LayoutCs.limpiarTexto(c.ColumnName)}"
                                    >
                                    ${textoH.toUpperCase()}</th>`;
                }


            });

            //Crear los registros en la tabla
            PlanProduccionCs.subtablelinedetails +=
                PlanProduccionCs.subtablelinedetailsbodyVP.replace("{header}", headerHTML);
            //console.log(PlanProduccionCs.subtablelinedetailsbodyVP);

            //Recorrer la lista de ordenes agrupada por linea
            PlanProduccionCs.AnyData = "";
            $.each(items, function (index, item) {

                let input = `
                                <div class="form-check">
                                 <input value="${item.DocEntry}" 
                                 type="checkbox" class="form-check-input anycheck finalorderselected">
                                </div>
                           `;
                //Aqui si se pueden generar OF
                if (item.NewRow == "TRUE")
                    input = "N/A";

                //console.log(PlanProduccionCs.configColumns);
                let tds = '';
                PlanProduccionCs.configColumns.forEach((c) => {
                    let keyItem = LayoutCs.limpiarTexto(c.ColumnName);
                    if (item[keyItem] == undefined && !PlanProduccionCs.ExcludeCVP.includes(LayoutCs.limpiarTexto(c.ColumnName))) {
                        console.error("Un elemento de item[keyItem] es undefined, keyItem: " + keyItem);
                        LayoutCs.Alerta(
                            "Plan de producción",
                            "Alerta de elemento idefinido", "Warning");

                    }
                    else {
                        if (c.Visible == "SI" && !PlanProduccionCs.ExcludeCVP.includes(LayoutCs.limpiarTexto(c.ColumnName)))
                            tds += `<td>${item[keyItem]}</td>`;
                    }

                });

                //console.log(tds);

                PlanProduccionCs.AnyData += `<tr>
                                                         <td class="d-none" >
                                                            ${input}
                                                         </td>
                                                          ${tds}
                                                         </tr>`;
            });
            //Agregar las OV agrupadas por linea
            PlanProduccionCs.subtablelinedetails =
                PlanProduccionCs.subtablelinedetails.replace("{rows}", PlanProduccionCs.AnyData);
            PlanProduccionCs.AnyData = "";
            $("#reportbyline").append(PlanProduccionCs.subtablelinedetails.trim());
        });

        let fecha_actual = LayoutCs.FechaActual();
        $("#fecha-liberacion").text(fecha_actual);
        $("#fecha-revision").text(fecha_actual);
        $("#fecha-documento").text(fecha_actual);
        $("#folio").text("--");
    }

    //Validaciones paso 1 Avanzar a asignación de linea
    async Step1() {
        //this.OVselected = $('#OV tbody .OVSelected:checked').map(function () {
        //    return this.id;
        //}).get();
        //let VerifyOvSelected = $('#OV tbody .OVSelected:checked').map(function () {
        //    return this.id;
        //}).get().join(",");

        let VerifyOvSelected = this.ListSectedOV.join(",");

        if (this.ListSectedOV.length == 0) {
            LayoutCs.Alerta("Plan de producción", "Debes seleccionar al menos una Orden de Venta para continuar.", "Warning");
            this.go = false;
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
                            PlanProduccionCs.ArticleSelected.some(item2 => item1.DocEntry === item2.DocEntry));

                        //Si no existe algun elemento entonces se agrega el primero. 
                        if (!existe) {
                            //Se agrega cuando no se ha
                            if (!PlanProduccionCs.ExisteArticulo(PlanProduccionCs.ArticleSelected, item[0].Articulo, item[0].DocEntry.toString(), "false")) {
                                let NewArticle = { "Articulo": item[0].Articulo, "DescripcionArticulo": item[0].DescripcionArticulo, "DocEntry": item[0].DocEntry.toString(), "Almacen": item[0].Almacen.toString(), "CantidadKilos": item[0].CantidadKilos.toString() }
                                PlanProduccionCs.ArticleSelected.push(NewArticle);
                            }
                        }

                    }
                    // SELECCIONAR POR DEFAULT EL ARTICULO QUE TIENE LA OV
                    else {

                        if (!PlanProduccionCs.ExisteArticulo(PlanProduccionCs.ArticleSelected, item[0].Articulo, item[0].DocEntry.toString(), "false")) {
                            let NewArticle = { "Articulo": item[0].Articulo, "DescripcionArticulo": item[0].DescripcionArticulo, "DocEntry": item[0].DocEntry.toString(), "Almacen": item[0].Almacen.toString(), "CantidadKilos": item[0].CantidadKilos.toString() }
                            PlanProduccionCs.ArticleSelected.push(NewArticle);
                        }
                    }
                });
            }

            if (howmanyov != this.ArticleSelected.length) {
                LayoutCs.Alerta("Plan de producción", "Debes seleccionar un artículo por cada orden de venta marcada en rojo para continuar.", "Warning");
                this.go = false;
            }
            else {

                //  Loading();
                //Lista de OV seleccionadas
                //Aqui hacer peticion por DocEntry
                //this.FilterOVList = this.filtrarOVXDocEntry(this.OVselected);
                this.FilterOVList = await this.GetOVXDocEntry();

                //Ordenar por linea
                this.FilterOVList.sort((a, b) => {
                    if (a.Linea > b.Linea) return -1;
                    if (a.Linea < b.Linea) return 1;
                    return 0;
                });

                //console.log(this.FilterOVList);
                //Reemplazar articulos de OV seleccionadas de acuerdo a selecciones anteriores
                this.ArticleSelected.forEach(function (item) {
                    let obj = PlanProduccionCs.FilterOVList.find(obj => obj.DocEntry === item.DocEntry);
                    if (obj) {
                        obj.Articulo = item.Articulo; // Actualizamos el atributo "OrdenFabricacion"
                        obj.DescripcionArticulo = item.DescripcionArticulo;
                        obj.Almacen = item.Almacen;
                        obj.CantidadKilos = item.CantidadKilos;
                    }
                });

                PlanProduccionCs.AnyData = "";
                let columnasrestantes = "";
                let celdasrestantes = "";
                //Agregar las ordenes de venta seleccionadas
                $.each(this.FilterOVList, function (index, item) {

                    //Generar encabezado dinamicamente para el resto de columnas
                    if (index == 0) {
                        columnasrestantes = "<tr>";
                        let headershow = "";
                        $.each(item, function (indexitem, itemdata) {
                            if (!PlanProduccionCs.ExcludeColumsPP.includes(indexitem)) {

                                //Hide
                                if (PlanProduccionCs.HideColumns.includes(indexitem)) {
                                    headershow = "d-none notremove";
                                }
                                else if (PlanProduccionCs.AlwaysHidden.includes(indexitem)) {
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
                        if (!PlanProduccionCs.ExcludeColumsPP.includes(indexitem)) {

                            if (PlanProduccionCs.ColumnsWithEdit.includes(indexitem)) {
                                hasEdit = "editMe";
                            }

                            if (PlanProduccionCs.ColumnsWithEditTime.includes(indexitem)) {
                                hasEdit = "TimeField";
                            }



                            //Hide
                            if (PlanProduccionCs.HideColumns.includes(indexitem)) {
                                hideClass = "d-none notremove";
                            }
                            else if (PlanProduccionCs.AlwaysHidden.includes(indexitem)) {
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
                        }
                    });
                    //Cerrar la fila
                    celdasrestantes += "</tr>"
                    //Guardar todas las filas
                    PlanProduccionCs.AnyData += celdasrestantes;


                });
                //Llenar los encabezados
                $("#OVSelected thead").empty();
                $("#OVSelected thead").append(columnasrestantes);
                $("#OVSelected tbody").empty();
                $("#OVSelected tbody").append(PlanProduccionCs.AnyData);
                //Hacer editable la tabla
                LayoutCs.MakeTableEditable("OVSelected");
                this.Step3();
                this.go = true;

            }
        }
        //StopLoading();
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
                    PlanProduccionCs.urldestino = $("#OV").attr("checktimeov");
                    let TiempoTranscurrido = await PlanProduccionCs.CheckTimeOV(DocEntry); // Aquí puedes usar await
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
                LayoutCs.Alerta("Plan de producción", "Se debe indicar a que línea de producción debe ir cada orden.", "Warning");
                this.go = false;
                break;
        }


        StopLoading();
    }
    //Validaciones paso 3 Avanzar a la vista previa de el plan de producción
    async Step3() {
        try {

            //Datos de encabezado de vista previa
            //Loading();

            let hasEmptyLine = false;
            //Traer configuracion de columnas para vista previa

            PlanProduccionCs.construirTablaVP();
            PlanProduccionCs.go = true;

            StopLoading();
        }
        catch (exception) {
            LayoutCs.Alerta("Plan de producción", "No fue posible crear las ordenes de fabricación: " + exception);
            StopLoading();
        }

    }
    //Validaciones paso 4 Avanzar a la creación de las ordenes de fabricación

    construirTablaG() {
        $("#reportfinalOF").empty();
        $.each(PlanProduccionCs.grouppreviewdataPP, function (linea, items) {

            PlanProduccionCs.subtablelinedetails = "";
            //Especificar la linea en el encabezado
            PlanProduccionCs.subtablelinedetails += PlanProduccionCs.subtablelinedetailsheader.replace("{linea}", linea);

            let headerHTML = '';
            PlanProduccionCs.configColumns.forEach((c) => {

                let textoH = LayoutCs.SpaceByUppercase(c.ColumnName);

                if (c.Visible == "SI") {
                    headerHTML += `<th 
                                    width="200" 
                                    class="HV${LayoutCs.limpiarTexto(c.ColumnName)}"
                                    >
                                    ${textoH.toUpperCase()}</th>`;
                }
            });


            //Crear los registros en la tabla
            PlanProduccionCs.subtablelinedetails +=
                PlanProduccionCs.subtablelinedetailsbodyfinal.replace("{header}", headerHTML);

            //Recorrer la lista de ordenes agrupada por linea
            PlanProduccionCs.AnyData = "";
            $.each(items, function (index, item) {
                //Guardar el folio para mostrar el que finalmente se genero
                PlanProduccionCs.folio = item.Folio;
                let EstatusSap = item.Estatus;
                //let EstatusProduccion = (item.Estatus != 'La orden de venta no cuenta con fecha de entrega' ? 'En cola' : 'Sin OF generada');
                //Color Warning
                let warning = ""
                if (item.Generada == "TRUE" && EstatusSap != "en cola" && item.OrdenFabricacion == '') {
                    warning = "bg-danger text-white"
                }

                //si la fila es de las agregadas (no generada en SAP), asignamos los campos correspondientes como N/A
                item.OrdenFabricacion == "N/A" ? "N/A" : item.OrdenFabricacion

                let tds = '';
                PlanProduccionCs.configColumns.forEach((c) => {
                    let keyItem = LayoutCs.limpiarTexto(c.ColumnName);
                    if (item[keyItem] == undefined) {
                        console.error("Un elemento de item[keyItem] es undefined, keyItem: " + keyItem);
                        LayoutCs.Alerta(
                            "Plan de producción",
                            "Alerta de elemento idefinido", "Warning");

                    }
                    else {
                        if (c.Visible == "SI")
                            tds += `<td>${item[keyItem]}</td>`;
                    }

                });


                PlanProduccionCs.AnyData += `<tr>
                                                         ${tds}
                                                    </tr>`;
            });
            //Agregar las OV agrupadas por linea
            PlanProduccionCs.subtablelinedetails = PlanProduccionCs.subtablelinedetails.replace("{rows}", PlanProduccionCs.AnyData);
            PlanProduccionCs.AnyData = "";
            $("#reportfinalOF").append(PlanProduccionCs.subtablelinedetails.trim());
            $("#foliof").text(PlanProduccionCs.folio);
            let fecha_actual = LayoutCs.FechaActual();
            $("#fecha-liberacionf").text(fecha_actual);
            $("#fecha-revisionf").text(fecha_actual);
            $("#fecha-documentof").text(fecha_actual);
        });

    }

    async Step4() {
        try {
            Loading();

            this.ConfigxUsuarioPPG("false");

            //Obtener las ordenes a las cuales se les creará orden de fabricación
            this.FinalOVselected = $('.finalorderselected').map(function () {
                return {
                    "DocEntry": this.value,
                    //"Selected": this.checked ? "TRUE" : "FALSE"
                    "Selected": "TRUE"
                };
            }).get();

            //Indicar cuales ordenes de fabricacion seran creadas
            this.FinalOVselected.forEach(function (item) {
                let obj = PlanProduccionCs.previewdataPP.find(obj => obj.DocEntry === item.DocEntry);
                if (obj) {
                    obj.OrdenFabricacion = item.Selected; // Actualizamos el atributo "OrdenFabricacion"
                    obj.Linea = obj.Linea.trim();
                }
            });

            //Indicar que las lineas en blanco no deben ser generadas como OF EN SAP
            //Obtenemos el DocEntry vacio de las nuevas filas
            let EmptyRow = ""
            //Seleccionamos la OV de la lista para actualizar OrdenFabricacion
            let OVFound = PlanProduccionCs.previewdataPP.filter(OVFound => OVFound.DocEntry === EmptyRow);
            OVFound.forEach(function (item) {
                // Actualizamos el atributo "OrdenFabricacion"
                item.OrdenFabricacion = (item.NewRow == "TRUE" ? "N/A" : item.OrdenFabricacion);
                item.DocEntry = LayoutCs.RandomDocEntry();
            });

            //Datos de OV agrupados por linea
            this.grouppreviewdataPP = LayoutCs.agruparPorLinea(PlanProduccionCs.previewdataPP);
            //Generar OF
            this.generateOF = $("#OV").attr("generateOF");

            this.response = await $.ajax({
                url: this.generateOF,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    PlanProduccion: JSON.stringify(this.grouppreviewdataPP),
                    PreviewFolio: this.folio,
                    Usuario: sessionStorage.getItem("email"),
                    Tabla: "PlanProduccion"
                },


            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (this.response.Status == "OK") {
                this.AnyData = JSON.parse(this.response.Data);
                //Asignar los valores de resultado del plan de produccion ejecutado en SAP
                this.AnyData.forEach(function (item) {
                    let obj = PlanProduccionCs.previewdataPP.find(obj => obj.DocEntry === item.DocEntry);
                    if (obj) {
                        obj.Folio = item.Folio; // Actualizamos el atributo "Folio de la vista previa"
                        obj.Generada = item.Generada; // Actualizamos el atributo "Generada de la vista previa"
                        obj.OrdenFabricacion = item.OrdenFabricacion; // Actualizamos el atributo "OrdenFabricacion de la vista previa"
                        obj.EstatusSAP = item.Estatus; // Actualizamos el atributo "Estatus de la vista previa"
                        obj.EstatusProduccion = item.EstatusProduccion
                    }
                });
                PlanProduccionCs.grouppreviewdataPP = LayoutCs.agruparPorLinea(PlanProduccionCs.previewdataPP);
                // Recorrer el resultado agrupado y mostrar en la consola
                $.each(PlanProduccionCs.grouppreviewdataPP, function (linea, items) {

                    PlanProduccionCs.subtablelinedetails = "";
                    //Especificar la linea en el encabezado
                    PlanProduccionCs.subtablelinedetails += PlanProduccionCs.subtablelinedetailsheader.replace("{linea}", linea);

                    let headerHTML = '';
                    PlanProduccionCs.configColumns.forEach((c) => {
                        if (c.Visible == "SI") {
                            let textoH = LayoutCs.SpaceByUppercase(c.ColumnName);
                            headerHTML += `<th 
                                    width="200" 
                                    class="HV${LayoutCs.limpiarTexto(c.ColumnName)}"
                                    >
                                    ${textoH.toUpperCase()}</th>`;
                        }
                    });


                    //Crear los registros en la tabla
                    PlanProduccionCs.subtablelinedetails +=
                        PlanProduccionCs.subtablelinedetailsbodyfinal.replace("{header}", headerHTML);

                    //Recorrer la lista de ordenes agrupada por linea
                    PlanProduccionCs.AnyData = "";
                    $.each(items, function (index, item) {
                        //Guardar el folio para mostrar el que finalmente se genero
                        PlanProduccionCs.folio = item.Folio;
                        let EstatusSap = item.EstatusSAP;
                        //let EstatusProduccion = (item.Estatus != 'La orden de venta no cuenta con fecha de entrega' ? 'En cola' : 'Sin OF generada');
                        //Color Warning
                        let warning = ""
                        if ((item.Generada == "TRUE" && EstatusSap != "en cola" && item.OrdenFabricacion == '') || !EstatusSap.includes("correctamente")) {
                            warning = "bg-danger text-white"
                        }

                        //si la fila es de las agregadas (no generada en SAP), asignamos los campos correspondientes como N/A
                        item.OrdenFabricacion == "N/A" ? "N/A" : item.OrdenFabricacion

                        let tds = '';
                        PlanProduccionCs.configColumns.forEach((c) => {
                            let keyItem = LayoutCs.limpiarTexto(c.ColumnName);
                            if (item[keyItem] == undefined) {
                                console.error("Un elemento de item[keyItem] es undefined, keyItem: " + keyItem);
                            }
                            else {
                                if (c.Visible == "SI") {
                                    if (c.ColumnName == "EstatusSAP") {
                                        tds += `<td class ="${warning}">${item[keyItem]}</td>`;
                                    }
                                    else {
                                        tds += `<td>${item[keyItem]}</td>`;
                                    }

                                }
                            }

                        });


                        PlanProduccionCs.AnyData += `<tr>
                                                         ${tds}
                                                    </tr>`;
                    });
                    //Agregar las OV agrupadas por linea
                    PlanProduccionCs.subtablelinedetails = PlanProduccionCs.subtablelinedetails.replace("{rows}", PlanProduccionCs.AnyData);
                    PlanProduccionCs.AnyData = "";
                    $("#reportfinalOF").append(PlanProduccionCs.subtablelinedetails.trim());
                    $("#foliof").text(PlanProduccionCs.folio);
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
                console.error("Plan de producción", this.response.Message);
            }

            StopLoading();

        }
        catch (exception) {
            LayoutCs.Alerta("Plan de producción", "No fue posible crear las ordenes de fabricación: " + exception);
            StopLoading();
            console.error("Plan de producción No fue posible crear las ordenes de fabricación: " + exception);
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

    //Trae los nombres de las lineas
    async GetNameLineas() {
        try {
            let urlnamelineas = $('body').attr("nombrelineas");

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

                    let sizecol = "col-4";

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
                        // listaS.push(serie.Series);

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
            let configPPSN = $("#RangoInicio").attr("configPPSN");
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
            Loading();
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

            StopLoading();

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
                this.newOrdenColumnas = configOCAPC.sort((a, b) => a.valor - b.valor);;
                this.OrdenarTabla("OVPrioridadTable", this.newOrdenColumnas);

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
        //console.log(arrayOrden);
        // Buscar la tabla y sus filas
        const $tabla = $(`#${tablaId}`);
        const $thead = $tabla.find("thead tr");
        const $tbody = $tabla.find("tbody");
        //console.log($tabla);


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

        // Reordenar las celdas en cada fila del <tbody>
        $tbody.children("tr").each(function () {
            const $fila = $(this);
            $(this).addClass('ui-sortable-handle');
            const celdasOrdenadas = $fila.children("td").sort((a, b) => {
                const indiceA = $(a).index();
                const indiceB = $(b).index();
                const textoA = $thead.children("th").eq(indiceA).text().trim();
                const textoB = $thead.children("th").eq(indiceB).text().trim();
                return (orden[textoA] || 999) - (orden[textoB] || 999);
            });
            $fila.empty().append(celdasOrdenadas);
        });

    }

    AddRowTablaSelectd(dE) {

        let OVenta = this.OVList.filter((e) => e.DocEntry == dE);
        OVenta = OVenta[0];
        //console.log(OVenta);
        let fila =
            `
             <tr id="${OVenta.DocEntry}-OVS" class="">
               <td class="dt-type-numeric position-relative">
                   <i
                      docEntry="${OVenta.DocEntry}"
                     class="bi bi-x-circle-fill iconremoverowSelected"
                    ></i>
                     ${OVenta.Pedido}
               </td>
               <td class="dt-type-numeric">
                ${OVenta.Linea}
               </td>
               <td>
                 ${OVenta.Articulo}
               </td>
               <td>
                 ${OVenta.Series}
               </td>
             </tr>
            `;

        $("#tablaOVSelected tbody").append(fila);

        if ($("#tablaOVSelected").hasClass("d-none") || $("#rowOVSelected").hasClass("d-none")) {
            $("#tablaOVSelected").removeClass("d-none");
            $("#rowOVSelected").removeClass("d-none");
            $("#sinOSelected").addClass("d-none");
        }
    }

    //Configuración del plan de produccion por usuario(columnas visibles)
    async ConfigxUsuarioPP(openmodal) {

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

                $.each(PlanProduccionCs.response, function (index, item) {
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
            let urlAction = $("#edicionPP").attr("updateconfiguracion");

            //Datos de PP
            Loading();
            this.anydata = await $.ajax({
                url: urlAction,
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
                PlanProduccionCs.ConfigxUsuarioPP('false').then(() => {
                    PlanProduccionCs.table.destroy();
                    $("#headOV").empty();
                    PlanProduccionCs.urldestino = $("#OV").attr("urldestino");
                    PlanProduccionCs.table = PlanProduccionCs.OV();
                });

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

    //Configuración del plan de produccion por usuario(columnas visibles)
    async ConfigxUsuarioPPVP(openmodal) {

        let urlAction = $("#edicionPP").attr("configuracionVP");

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

                $.each(PlanProduccionCs.response, function (index, item) {
                    if (!PlanProduccionCs.ExcludeCVP.includes(item.ColumnName)) {
                        let checked = item.Visible == "SI" ? 'checked' : '';
                        $("#configuracionPPContainer").append(`<div class="mb-1 align-self-start form-check">
                        <input type="checkbox" id="${item.ColumnName}" class="form-check-input anycheck configuracionbyPP" value="${item.ColumnName}" ${checked}>
                        <label class="form-check-label" for="${item.ColumnName}">${LayoutCs.SpaceByUppercase(item.ColumnName)}</label>
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

    async ConfigxUsuarioPPG(openmodal) {

        let urlAction = $("#edicionPP").attr("configuracionVP");

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

                $.each(PlanProduccionCs.response, function (index, item) {

                    let checked = item.Visible == "SI" ? 'checked' : '';
                    $("#configuracionPPContainer").append(`<div class="mb-1 align-self-start form-check">
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

            if (openmodal == 'true')
                StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible actualizar la configuración del plan de producción: " + error, "Plan de producción");
            StopLoading();

        }
    }


    //Inserta o actualiza la configuración del plan de produccion por usuario(columnas visibles)
    async InsertaConfigxUsuarioPPVP(tabla) {
        try {
            let urlAction = $("#edicionPP").attr("updateconfiguracionVP");

            //Datos de PP
            Loading();
            this.anydata = await $.ajax({
                url: urlAction,
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
                PlanProduccionCs.ConfigxUsuarioPPVP('false').then(() => {
                    //Renderizar nuevamente la tabla
                    if (tabla == 'generarOF') {
                        PlanProduccionCs.construirTablaG()
                    }
                    else {
                        PlanProduccionCs.construirTablaVP()
                    }
                });

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

    //Controla que configuracion de usuario mostrar
    showConfigColumns(step) {
        switch (step) {
            case '1':
                PlanProduccionCs.ConfigxUsuarioPP("true");
                break;
            case '4':
                PlanProduccionCs.ConfigxUsuarioPPVP("true");
                break;
            case '7':
                PlanProduccionCs.ConfigxUsuarioPPG("true");
                break;
            default:
                alert(`${step}, no es un step valido: funcion showConfigColumns`);
        }
    }
    //Controla que funcion usar para guardar la configuracion
    saveConfigColumns(step) {
        switch (step) {
            case '1':
                PlanProduccionCs.InsertaConfigxUsuarioPP();
                break;
            case '4':
                PlanProduccionCs.InsertaConfigxUsuarioPPVP("---");
                break;
            case '7':
                PlanProduccionCs.InsertaConfigxUsuarioPPVP('generarOF');
                break;
            default:
                alert(`${step}, no es un step valido: funcion saveConfigColumns`);
        }
    }
}

LayoutCs.validarUsuario("Planeaci\u00F3n");

//Instancia de clase
const PlanProduccionCs = new PlanProduccion();
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
                PlanProduccionCs.FI = $("#FIINI").val();
                PlanProduccionCs.FF = $("#FFINI").val();
                break;
            // * Filtro normal
            case "FiltroFecha":
                PlanProduccionCs.FI = $("#FI").val();
                PlanProduccionCs.FF = $("#FF").val();
                break;
        }

        PlanProduccionCs.SetConfigPPSN();

        //Ejecutar la consulta
        PlanProduccionCs.urldestino = $("#OV").attr("urldestino");
        PlanProduccionCs.table = PlanProduccionCs.OV();

        //Mostrar paso 1 y setear valores
        $("#step-1").addClass("active");
        $("#RangoInicio").modal("hide");
        $("#FI").val(PlanProduccionCs.FI);
        $("#FF").val(PlanProduccionCs.FF);
        $("#selectAll").prop("checked", false);
    }

    // Añadir la clase 'was-validated' para activar los estilos de validación
    $(this).addClass('was-validated');
}
//EVENTOS
$(function () {

    // Validación de formularios
    $(document).on('submit', '.needs-validation', ValidacionFormularios);

    PlanProduccionCs.ConfigxUsuarioPP("false");

    //Trae la configuracion de filtros SN
    PlanProduccionCs.GetCondigPPSN()
        .then(() => {
            //Marcar filtros de SN
            PlanProduccionCs.SeriesNumeracion();
            PlanProduccionCs.GetNameLineas();
        })
        .catch((error) => {
            StopLoading();
            console.error("Ocurrió un error:", error);
            // Manejo de errores.
        });

    LayoutCs.SeriesNumeracionDocs(PlanProduccionCs.ObjectCodeSeriesOV)

    //CUANDO SE CARGA EL DOCUMENTO (PRIMERA INSTRUCCION)
    PlanProduccionCs.RangoInicio();

    //PASO SIGUIENTE -> BOTON SIGUIENTE
    $(".next").on("click", function (e) {
        try {
            let restart = $(this).attr("restart");
            switch (restart) {
                case "true":
                    window.location.reload();
                    break;

                case "false":
                    PlanProduccionCs.nextStep();
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
        PlanProduccionCs.prevStep();
    });


    //EVENTOS ORDENES DE VENTAS
    //SELECCIONAR TODAS LAS ORDENES -> Evento de cambio en el checkbox "Seleccionar Todos"
    $('#selectAll').on('change', function () {
        var isChecked = $(this).is(':checked');
        $('#OV tbody tr').toggleClass('selectedrow', isChecked);

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
            PlanProduccionCs.ListSectedOV.push(...allIds);
            allIds.forEach((e) => PlanProduccionCs.AddRowTablaSelectd(e));
        }
        else {

            //Eliminacion visual
            allIds.forEach((e) => {
                $(`#${e}-OVS`).remove();
            });

            //Se eliminan los elementos del array
            let set = new Set(allIds);
            let resultado =
                PlanProduccionCs.ListSectedOV
                    .filter(item => !set.has(item));

            PlanProduccionCs.ListSectedOV = resultado;

            if (PlanProduccionCs.ListSectedOV.length == 0) {
                $("#tablaOVSelected").addClass("d-none");
                $("#rowOVSelected").addClass("d-none");
                $("#sinOSelected").removeClass("d-none");
            }

        }

    });

    //EVENTOS

    //Al hacer click en los checkbox de las OV
    $('#OV tbody').on('click', '.OVSelected', function (event) {
        //Detener la propagacion del evento hacia la fila
        event.stopPropagation();
        // Quitar la clase 'rowselected' de la fila que contiene el checkbox
        $(this).closest('tr').removeClass('selectedrow');
        let idCheck = $(this).attr("id");

        //Se agrega a ListSectedOV
        if ($(this).is(":checked")) {
            //Obtener id del checkbox
            PlanProduccionCs.ListSectedOV.push(idCheck);
            PlanProduccionCs.AddRowTablaSelectd(idCheck);
            //console.log(PlanProduccionCs.ListSectedOV);
        }
        else {
            //Se elimina a ListSectedOV
            let index = PlanProduccionCs.ListSectedOV.indexOf(idCheck);
            if (index !== -1) {
                PlanProduccionCs.ListSectedOV.splice(index, 1);
                //console.log(PlanProduccionCs.ListSectedOV);

                //Elimina fila de forma visual
                $(`#${idCheck}-OVS`).remove();

                if (PlanProduccionCs.ListSectedOV.length == 0) {
                    $("#tablaOVSelected").addClass("d-none");
                    $("#rowOVSelected").addClass("d-none");

                    $("#sinOSelected").removeClass("d-none");
                }

            }
        }

    });

    //Eliminar de la tabla de selected
    $(document).on('click', '.iconremoverowSelected', function () {
        let idRow = $(this).attr("docEntry");

        //Elimina fila de forma visual
        $(`#${idRow}-OVS`).remove();

        //Disparando el evento se elimina de la lista
        $(`#${idRow}`).click();

        if (PlanProduccionCs.ListSectedOV.length == 0) {
            $("#tablaOVSelected").addClass("d-none");
            $("#rowOVSelected").addClass("d-none");

            $("#sinOSelected").removeClass("d-none");
        }

        //let index = PlanProduccionCs.ListSectedOV.indexOf(idRow);
        //if (index !== -1) {
        //    PlanProduccionCs.ListSectedOV.splice(index, 1);
        //    console.log(PlanProduccionCs.ListSectedOV);
        //}

    })

    //Limpiamos la tabla de las OV seleccionadas
    $("#limpiarSelected").click(function () {
        //Limpiar de forma visual
        $("#rowOVSelected").addClass("d-none");
        $("#tablaOVSelected tbody").empty();
        $("#tablaOVSelected").addClass("d-none");
        $('#OV tbody input[type="checkbox"].OVSelected').prop("checked", false).trigger("change");
        $("#OV tbody tr").removeClass("selectedrow");

        // Desmarca el checkbox
        $("#selectAll").prop("checked", false);

        //Limpiar arreglo
        PlanProduccionCs.ListSectedOV = [];

        $("#sinOSelected").removeClass("d-none");


    });

    //Al hacer click en cualquier fila de la tabla de OV excepto en los checkbox
    $('#OV tbody').on('click', 'tr.OV', function () {
        try {
            //Obtener url consulta
            //PlanProduccionCs.DocEntry = this.childNodes[1].innerText; //DOCENTRY
            //PlanProduccionCs.DocNum = this.childNodes[2].innerText; //DOCNUM
            PlanProduccionCs.ovdetails = $("#OV").attr("ovdetails");
            PlanProduccionCs.rowdata = PlanProduccionCs.table.row(this).data();
            PlanProduccionCs.DocEntry = PlanProduccionCs.rowdata.DocEntry; //DOCENTRY
            PlanProduccionCs.DocNum = PlanProduccionCs.rowdata.Pedido; //DOCNUM
            PlanProduccionCs.current_row = $(this);
            PlanProduccionCs.row = PlanProduccionCs.table.row(PlanProduccionCs.current_row);


            if (PlanProduccionCs.row.child.isShown()) {
                PlanProduccionCs.row.child.hide();
                PlanProduccionCs.current_row.removeClass('shown');
                // Quitar clase PPselected de todas las filas
                $('#OV tbody tr').find('td').removeClass('OVselected');
                // Quitar el ícono de flecha derecha de todas las filas
                $('#OV tbody tr').find('td:first-child .fa-arrow-right').remove();
            }
            else {
                //realizar peticion para obtener detalles
                PlanProduccionCs.OVDetail();
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
                if (!PlanProduccionCs.ExisteArticulo(PlanProduccionCs.ArticleSelected, Articulo, DocEntry.toString(), "false")) {
                    PlanProduccionCs.ArticleSelected.push(NewArticle);
                }
                else {
                    //Solo debe existir un articulo por OrdenVenta
                    PlanProduccionCs.EliminarArticulo(PlanProduccionCs.ArticleSelected, Articulo, DocEntry.toString());
                    PlanProduccionCs.ArticleSelected.push(NewArticle);
                }

                $(`#OV tr.${DocEntry}`).removeClass('RowAttend');
            }
            else {
                //Solo debe existir un articulo por OrdenVenta
                PlanProduccionCs.EliminarArticulo(PlanProduccionCs.ArticleSelected, Articulo, DocEntry.toString());
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
        PlanProduccionCs.SerieID = $('.seriesnumeracion:checked').map(function () {
            return parseInt($(this).attr('series')); // Convertir a número entero
        }).get().join(","); // Obtener el array puro
        PlanProduccionCs.urldestino = $("#OV").attr("urldestino");

        let checkedLabels = [];
        $("#SerNumC .seriesnumeracion:checked").each(function () {
            // Encuentra el label correspondiente al input
            let label = $(this).siblings("label").text();
            checkedLabels.push(label);
        });
        //console.log(checkedLabels); // Nombres de los label
        PlanProduccionCs.table = PlanProduccionCs.OV();
        PlanProduccionCs.changeConfigPPSN(checkedLabels.join(","));
        $("#selectAll").prop("checked", false);
    });

    //Al seleccionar las lineas
    $(document).on("click", ".nombrelineas", function () {
        // Obtener los atributos 'series' de los checkboxes seleccionados como un array de números
        PlanProduccionCs.Lineas = $('.nombrelineas:checked').map(function () {
            return $(this).attr('lineas'); // Convertir a número entero
        }).get().join(","); // Obtener el array puro
        PlanProduccionCs.urldestino = $("#OV").attr("urldestino");

        //let checkedLabels = [];
        //$("#SerNumC .seriesnumeracion:checked").each(function () {
        //    // Encuentra el label correspondiente al input
        //    let label = $(this).siblings("label").text();
        //    checkedLabels.push(label);
        //});
        //console.log(checkedLabels); // Nombres de los label
        PlanProduccionCs.table = PlanProduccionCs.OV();
        $("#selectAll").prop("checked", false);
    });


    // Detectar cuando se cambia el estado del checkbox
    $(document).on('change', '.editline', function () {
        var $td = $(this).closest('td'); // Obtener el <td> padre
        // Verificar si el checkbox está seleccionado
        if ($(this).is(':checked')) {
            //Borrar contenido de la celda
            $td.html("");
            // Agregar la clase 'customLine' al <td> padre
            $td.addClass('editMe');
            //Seleccionar la celda
            $td.trigger('click');
        } else {
            // Si se deselecciona, remover la clase 'customLine'
            $td.removeClass('editMe');
        }
    });

    // Mostrar menú contextual al hacer clic derecho
    $(document).on("contextmenu", "#OVPrioridadTable", function (e) {
        e.preventDefault();
        $("#MenuPrioridadComentarios")
            .css({
                top: e.pageY + "px",
                left: e.pageX + "px",
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

        // Limpiar el contenido de las celdas
        firstRow.find("td").text("");

        // Eliminar el estilo de fondo de todas las celdas de la fila clonada
        firstRow.find('td').css('background', '');

        // Obtener la altura de las celdas originales
        let originalHeight = $("#OVPrioridadTable tr").eq(1).find("td").eq(0).outerHeight();

        // Si la altura es 0, usamos una altura predeterminada
        if (originalHeight === 0) {
            originalHeight = 45; // Altura predeterminada en píxeles
        }

        // Establecer la misma altura en las celdas de la nueva fila
        firstRow.find("td").css("height", originalHeight + "px");

        // Añadir ícono de flecha derecha con el índice como atributo
        //firstRow.find('td:nth-child(1)').append('<i class="bi bi-x-circle-fill iconremoverow" data-idrow="' + rowIndex + 'newRow" data-index="' + rowIndex + '"></i>');

        // Añadir ícono de borrar (borrar la fila nueva) en la celda de "Linea"
        firstRow.find('td.linea').append('<i class="bi bi-x-circle-fill iconremoverow" data-idrow="' + rowIndex + 'newRow" data-index="' + rowIndex + '"></i>');

        // Añadir id a fila
        firstRow.attr("id", rowIndex + "newRow");

        // Añadir attributo newRow para identificar en siguiente paso
        firstRow.find('td.linea').attr("newRow", "TRUE");

        // Agregar la clase editMe a las celdas que no tengan las clases CustomOptions o TimeField
        firstRow.find("td:not(.CustomOptions):not(.TimeField)").addClass("editMe");

        // Agregar la fila al final de la tabla
        $("#OVPrioridadTable").append(firstRow);

        // Ocultar el menú contextual
        $("#MenuPrioridadComentarios").hide();
    });

    //Eliminar la fila agregada en la asigancion de comentarios y prioridad
    $(document).on("click", ".iconremoverow", function () {
        // Obtener el índice de la fila desde el atributo data-index
        let rowIndex = $(this).data("index");
        let rowId = $(this).data("idrow");

        // Eliminar la fila basada en el índice
        $(`#${rowId}`).remove();
    });

    //Modal Configuracion de columnas ocultas step 2

    // Manejar el cambio de visibilidad de columnas
    $(document).on("change", '#columnToggle input[type="checkbox"]', function () {
        let indexColumn = $(this).data('column'); // Índice de la columna
        let columName = $(this).data('name'); // Nombre de la columna
        let showColumn = $(this).is(':checked'); // Estado del checkbox

        // Seleccionar todos los encabezados y celdas de la columna
        $('#OVPrioridadTable tr').each(function () {
            let cell = $(this).find('th, td').eq(indexColumn); // Obtener celda por índice
            if (showColumn) {
                cell.show(); // Mostrar columna
            } else {
                cell.hide(); // Ocultar columna
            }
        });

        let valor = showColumn ? 1 : 0;
        PlanProduccionCs.UpdateConfigAPC(columName, valor);
    });

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
                  <input type="checkbox" data-name="${columnName}" data-column="${index}" ${checked}> ${columnName}
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

    //Quitar el "Check" de "seleccionar todas", al cambiar de pagina en la tabla de OV
    $(document).on("click", ".dt-paging-button", function () {
        // Verificar si el checkbox está marcado
        if ($("#selectAll").is(":checked")) {
            // Desmarca el checkbox
            $("#selectAll").prop("checked", false);
        }
    });

    //Configurar el listado del plan de produccion
    $("#edicionPP").on("click", function () {
        //Configuracion del plan de produccion por usuario
        let step = $(this).attr("step");
        //Se muestra una configuracion diferente para el primer paso
        //y para 4, 7. showConfigColumns controla que configuracion mostrar
        PlanProduccionCs.showConfigColumns(step);
    });
    //Guardar configuración de el plan de produccion
    $("#GuardaConfigPP").on("click", function () {
        try {
            //Limpiar variables
            PlanProduccionCs.configuracionPP = {};

            $('.configuracionbyPP').each(function (index) {
                // Obtén el id del checkbox y usa limpiarTexto para quitar acentos y espacios
                let id = LayoutCs.limpiarTexto(this.id);

                // Asigna el id como clave y el valor "SI" o "NO" como valor
                PlanProduccionCs.configuracionPP[id] = { "Visible": this.checked ? "SI" : "NO", "Orden": (index + 1) };

            });

            //PlanProduccionCs.action = $("#PlanProduccion").attr("updateconfiguracion");
            //PlanProduccionCs.InsertaConfigxUsuarioPP();
            let step = $("#edicionPP").attr("step");
            PlanProduccionCs.saveConfigColumns(step);
        }
        catch (error) {
            LayoutCs.Alerta("Plan de producción", "No fue posible actualizar la configuración para el plan de producción, por favor intenta de nuevo mas tarde: " + error);
            StopLoading();

        }
    });

    $(document).on("change", "#selectAll", function () {
        var isChecked = $(this).is(':checked');
        $('input[type="checkbox"].configuracionbyPP').prop('checked', isChecked);
    });

    //$('#selectAll').on('change', function () {
    //    var isChecked = $(this).is(':checked');
    //    $('input[type="checkbox"].configuracionbyPP').prop('checked', isChecked);
    //});
});


