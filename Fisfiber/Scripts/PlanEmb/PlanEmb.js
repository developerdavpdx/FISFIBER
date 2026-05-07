class PlanEmb {
    constructor() {
        //Las tablas se llenan de forma dinamica
        //Agrega aqui los campos que no quieres que se muestren
        this.ExcludeColumsPP =
            [
                "id", "DocEntry", "DistRecorrida",
                "HoraEntrega", "F_Pedido", "Orden",
                "NumEstatusC", "EstatusCarga", "Consolidado",
                "HoraFactura", "HoraCartaP", "PzsCargadas",
            "HoraInicio", "HoraFin", "Estatus", "NoEntrega", 
            "NumEstatusT","NumFactura"
            ];

        //Contiene la lista en html de estatus de carga, se llena con this.getEstatusCarga()
        this.EstatusCargaHTML = "";
        this.EstatusCarga = [];
        this.EstatusCargaAut = [];
        this.TipoUnidadHTML = "";
        this.TipoUnidad = [];
        this.OperadoresHTML = "";
        this.Operadores = [];
        this.UnidadesOperador = [];
        this.PedidosInPP = [];
        this.LocalesHTML = "";
        this.Locales = [];
        this.ColumnsWithEditAlm = ["UbicacionProducto"];
        this.TablasEditables = [];

        this.Comentarios = [];

        this.$currentTdEst;
        this.capUniByViajes = {};
        this.noConsolidar = [];
        this.listCapUnidades = [];
        this.operadorByViaje = [];

        this.capPlanEmb = [];
        this.infoCapPlanEmb = [];

        // * Atributo para guardar la tabla de datos
        this.table;
        this.TopScroll;
        this.TopScrollSugPlan;

        this.HeaderFijo;

        this.currentFolio = "";
        this.contenedores = ['CONTENEDOR', 'MOSTRADOR', 'FORANEO'];

        this.newRowsTR = [];
        this.SumaPzsByPedido = {};
    }

    //Listado de planes de embarques
    PlanesEmb() {
        try {

            //PlanEmb/GetPlanesEmbarques
            let action = $("#PlanesEmb").attr("action");

            let table = $("#PlanesEmb").DataTable(
                {
                    processing: false,
                    serverSide: true,
                    bDestroy: true,
                    "ajax":
                    {
                        url: action,

                        type: "POST",
                        dataType: "json",
                        data: {
                            "Status": 1,
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

    //Detalles de plan de embarques
    async PlaneEmbDetails() {
        try {
            //Datos de PP
            // PlanEmb/GetDetailsPlanEmb
            let urlDetail = $("#PlanEmbarques").attr("PlanEmb");

            Loading();
            this.anydata = await $.ajax({
                url: urlDetail,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    usuario: sessionStorage.getItem("email"),
                    folio: this.currentFolio
                }
            });


            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {

                let roleUser = LayoutCs.getCookie("u_perfil");

                //Limpiar el contenedor
                $("#reportbyline").empty();
                //Obtener los datos
                let noAuth = JSON.parse(this.anydata.Other);
                this.previewdataPP = JSON.parse(this.anydata.Data);
                let headerBitacora = JSON.parse(this.anydata.ExtraData);
                let PlanV = JSON.parse(this.anydata.Message);
                let columnasrestantes = "";
                let celdasrestantes = "";
                let estVentas = "Pendiente Revisión";
                let bgColor = "bg-warning";

                if (PlanV[0].RevVentas) {
                    estVentas = "Revisado";
                    bgColor = "bg-success";
                }

                $("#estVentas").text(estVentas);
                $("#estVentas").addClass(bgColor);


                //Dar oden por campo Orden
                this.previewdataPP = this.previewdataPP.sort((a, b) => a.Orden - b.Orden);
                this.noConsolidar = this.getNoConsolidar(this.previewdataPP);

                //console.log(this.noConsolidar);

                let bodyTable = "";

                $.each(this.previewdataPP, function (index, item) {
                    //Generar encabezado dinamicamente para el resto de columnas
                    if (index == 0) {

                        $.each(item, function (indexitem, itemdata) {


                            if (!PlanEmbCs.ExcludeColumsPP.includes(indexitem)) {
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
                    let auth = noAuth.some(p => p.id == item.id);
                    let red = '';

                    if (auth) //Color para no autorizados
                        red = 'background-color:#e7a1a1 !important;'

                    //if (!PlanEmbCs.capUniByViajes[item.NumeroViaje] && item.NumeroViaje != '' ) {
                    //    PlanEmbCs.capUniByViajes[item.NumeroViaje] = [];
                    //}


                    let first = 0;
                    bodyTable +=
                        `<tr 
                            id="rowppd${item.id}" idppd="${item.id}" 
                            document="${item.DocEntry}"
                            class="ui-sortable-handle pedidoEmb row${item.DocEntry}">`;

                    let CargaComleta = item.NumEstatusC > 5;
                    let NumEst = item.NumEstatusC;

                    if (!CargaComleta) {
                        item.Estatus = item.EstatusCarga;
                    }

                    $.each(item, function (indexitem, itemdata) {


                        if (!PlanEmbCs.ExcludeColumsPP.includes(indexitem)) {

                            hasedit = "";

                            if (roleUser == "Almacén" || roleUser == "Admin") {
                                if (indexitem == "UbicacionProducto") {
                                    hasedit = "editMe";
                                }
                                else if (indexitem == "LocalCarga") {
                                    hasedit = "CustomLocales";
                                }


                            }

                            let idC = indexitem;
                            let data = itemdata;
                            let iconLinkPP = "", position = "";

                            if (indexitem == "HoraInicio" || indexitem == "HoraFin")
                                data = LayoutCs.parseHora(data);

                            if (indexitem == "Pedido") {

                                //Verificar sí se encuentra en un plan de producción
                                let pedidoEncontrado = PlanEmbCs.PedidosInPP
                                    .find(p => (p.Pedido == data && p.FolioPP != ""));
                                // El pedido esta en un plan && Carna incompleta && EN PROCESO
                                if (pedidoEncontrado && !CargaComleta && NumEst < 3) {
                                    let folioPP = pedidoEncontrado.FolioPP;
                                    iconLinkPP = `<i 
                                                pedido="${data}"
                                                folioPP="${folioPP}"
                                                class="goToPP bi bi-box-arrow-up-right fs-5 fw-bold"
                                                style="position: absolute; right: 20px; cursor:pointer;"></i>`;
                                    position = "position: relative;"
                                }
                            }

                            if (indexitem == "TipoUnidad") {
                                data = LayoutCs.getTipoUnidad(data);
                            }

                            if (indexitem == "Unidad") {
                                let d = data
                                    .replace("Unidad", '')
                                    .trim();

                                let contenedor = PlanEmbCs
                                    .contenedores
                                    .includes(d.toUpperCase());

                                if (contenedor) {
                                    data = d;
                                }
                            }


                            celdasrestantes +=
                                `<td 
                                        class="${idC} ${hasedit}"  
                                        style="${red} ${position}"
                                        data-name="${idC}">
                                        ${data}
                                        ${iconLinkPP}
                                    </td>`;
                        }
                    });


                    //Agregar celdas
                    bodyTable += celdasrestantes;
                    //Cerrar la fila
                    bodyTable += `</tr>`;
                });

                if (headerBitacora.length > 0) {
                    let headerPlan = headerBitacora[0];

                    //Agregar las OV agrupadas por linea
                    let idTabla = headerPlan.folio;
                    idTabla = idTabla.replace("-", "");


                    //Datos de encabezados
                    //$("#revisionPv").text(headerPlan.Revision);

                    let RevVentas = 1;

                    if (PlanV[0].NumRevVentas) {
                        RevVentas = PlanV[0].NumRevVentas
                    }

                    $("#fecha-documentoPv").text(headerPlan.fecha);
                    $("#folioPv").text(headerPlan.folio + '-' + RevVentas);
                } else {
                    console.error(`Ajax PlanesVentasDetails. El header del plan esta vacio (Revision, Fecha, Folio): ${headerBitacora}`);
                }


                $("#PlanEmbarques tbody").empty();
                $("#PlanEmbarques tbody").append(bodyTable);
                $("#PlanEmbarques thead tr").empty();
                $("#PlanEmbarques thead tr").append(columnasrestantes);


                $("#PPHeader").removeClass("d-none");
                $(".tablePlanEmb").removeClass("d-none");
                $("#PPHeaderTitle").addClass("d-none");

                this.MakeTableEditableWithBitacora("PlanEmbarques");

                if (this.TopScroll) this.TopScroll.destroy();

                this.TopScroll = new TopScrollTable(
                    "PlanEmbarques",
                    "contentPlanEmb",
                    "scrollTopPlanEmb");

                this.TopScroll.createScroll();
                this.TopScroll.initScroll();

                //console.log("Capacidades Unidades Viajes");
                //console.log(PlanEmbCs.capUniByViajes);
                //this.printCapacidadesByUnidad(PlanEmbCs.capUniByViajes)
            }
            else {

                if (this.anydata.Message.includes('No se encontró información')) {
                    LayoutCs.Alerta("Plan de embarques", this.anydata.Message, "Warning");
                }
                else {
                    LayoutCs.Alerta("Plan de embarques", this.anydata.Message + " si agregaste líneas en blanco no olvides dar click en actualizar para que sea guardado el registro correctamente.");
                }
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible consultar el plan de produccion: " + error, "Plan de embarques");
            StopLoading();

        }
    }

    getNoConsolidar(data) {
        return data.reduce((acc, a) => {
            if (!acc.includes(a.CodigoCliente) && a.Consolidado == 'No') {
                acc.push(a.CodigoCliente);
            }

            return acc;
        }, [])
    }

    async getInfoPedidosInProduccion() {

        //GetPedidosInPP
        try {
            let urlPedidosInfo = $("#PlanEmbarques").attr("PedidosInfo");
            //Loading();

            let response = await $.ajax({
                url: urlPedidosInfo,
                type: 'POST',
                dataType: 'JSON'
            });

            if (response.Status == "OK") {
                let data = JSON.parse(response.Data);
                return data
            }
            else return [];

        } catch (error) {
            LayoutCs.Excepcion("No fue posible consultar los operadores: " + error, "Plan Embarques");
            return [];
            // StopLoading();
        }

    }

    mergeAndSortByOrden(previewdataPP, previewdataPPT) {
        const existingIds = new Set(previewdataPP.map(item => item.id));

        const nuevosRegistros = previewdataPPT.filter(item => !existingIds.has(item.id));

        // Agrega los nuevos elementos
        const merged = [...previewdataPP, ...nuevosRegistros];

        // Ordena por el campo 'Orden' (conversión por si vienen como string)
        //merged.sort((a, b) => Number(a.Orden) - Number(b.Orden));

        return merged;
    }

    async SugPlanEmb() {
        try {
            //Datos de PP
            // PlanEmb/GetSugPlanEmb

            let urlDetail = $("#SugPlanEmbarques").attr("SugPlanEmb");

            Loading();
            this.anydata = await $.ajax({
                url: urlDetail,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    usuario: sessionStorage.getItem("email"),
                    folio: this.currentFolio
                }
            });


            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (this.anydata.Status == "OK") {

                //Obtener los datos
                let dataPP = JSON.parse(this.anydata.Data);
                this.capPlanEmb = JSON.parse(this.anydata.Message);
                console.log("-------- CAPACIDADES PLAN EMBARQUE -----------")
                console.log(this.capPlanEmb);
                this.previewdataPP = dataPP;
                let headerBitacora = JSON.parse(this.anydata.ExtraData);
                let headerPlan = headerBitacora[0];
                let noAuth = JSON.parse(this.anydata.Other);

                this.noConsolidar = this.getNoConsolidar(dataPP);
                //this.previewdataPP = LayoutCs.ordenarViajes(this.previewdataPP);
                //console.log(this.previewdataPP);
                this.capUniByViajes = this.getCapByUnidad(this.previewdataPP);
                this.operadorByViaje = this.getOperadores(this.previewdataPP);

                this.renderTableFromData({
                    data: this.previewdataPP,
                    tableSelector: "#SugPlanEmbarques",
                    excludeColumns: PlanEmbCs.ExcludeColumsPP,
                    editRules: {
                        // ejemplo: "Cantidad": "editMe"
                        // Usa tu lógica si quieres pasarle `ColumnsWithEdit`, `ColumnsWithEditDate`, etc.
                        // Combínalos dinámicamente si prefieres
                        "PiezasEntrega": "editMeNum",
                        "Unidad": "CustomUnidad",
                        "Operador": "CustomOperador",
                        "NumeroViaje": "editMe",
                        "Estatus": "CustomEstatusCarga",
                        "TipoUnidad": "CustomTipoUnidad",
                        "LocalCarga": "CustomLocales",
                        "Ayudante1": "editMe",
                        "Ayudante2": "editMe",
                        "Ayudante3": "editMe",
                        "Ayudante4": "editMe"
                    },
                    customParsers: {
                        HoraInicio: LayoutCs.parseHora,
                        HoraFin: LayoutCs.parseHora,
                        TipoUnidad: LayoutCs.getTipoUnidad
                    },
                    noAuth,
                    prefId: "sugprow"
                });

                this.MakeTableEditableWithBitacora("SugPlanEmbarques");
                LayoutCs.enableRowSorting("SugPlanEmbarques", 1);
                $("#folioSug").text(`${headerPlan.folio} - Revision: ${headerPlan.Revision}`)


                //TopScrollSugPlan

                if (this.TopScrollSugPlan) this.TopScrollSugPlan.destroy();

                this.TopScrollSugPlan = new TopScrollTable(
                    "SugPlanEmbarques",
                    "containerSugPlanEmb",
                    "scrollTopSugPlanEmb");

                this.TopScrollSugPlan.createScroll();
                this.TopScrollSugPlan.initScroll();

                this.getInfoCapFromTable();

            }
            else {
                LayoutCs.Alerta("Plan de embarques", this.anydata.Message + " si agregaste líneas en blanco no olvides dar click en actualizar para que sea guardado el registro correctamente.");
            }

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible consultar el plan de produccion: " + error, "Plan de embarques");
            StopLoading();

        }
    }

    getInfoCapFromTable(NumPedido = "") {

        let infoAct = {};

        let extractData = function (row, name) {
            return $(row).find(`td.${name}`).text().trim();
        };

        let cleanUnidad = function (row) {

            let cellUniSelect = $(row).find("td.Unidad select");
            let textUni = "";

            if (cellUniSelect.length === 0) {
                textUni = $(row).find("td.Unidad").text();

            } else {
                textUni = cellUniSelect.val()
            }

            return textUni.replace('Unidad', '').trim();

        };

        $("#SugPlanEmbarques tr").each(function () {
            let numV = extractData(this, "NumeroViaje");
            let codigoC = extractData(this, "CodigoCliente");
            let unidad = cleanUnidad(this);
            let pedido = extractData(this, "Pedido");
            let pzsEntrega = extractData(this, "PiezasEntrega");

            pzsEntrega = parseInt(pzsEntrega);

            //Cuando piezas entrega esta vacio
            //tomo la cantidad total a entregar (num rollos)
            if (pzsEntrega == 0) {
                let numRollos = extractData(this, "NumRollos");
                pzsEntrega = parseInt(numRollos);
            }

            //NO GUARDAR INFORMACION VACIA
            if (numV != "" && pedido != "" && unidad != "" && pedido != NumPedido) {

                if (!infoAct[numV]) infoAct[numV] = [];

                let viaje = infoAct[numV].find((uni) => (uni.Unidad == unidad));
                let objCap = PlanEmbCs.capPlanEmb.find((c) => c.Pedido == pedido);

                if (viaje) {
                    let newporcentaje = 0;
                    let newCap = 0;

                    if (objCap) {
                        newCap = objCap[`U_${unidad}`];
                    }


                    if (!viaje.Full) {
                        //calcular porcentaje nuevo pedido

                        newporcentaje = ((pzsEntrega * 100) / newCap).toFixed(2);
                        let porTotal = (parseFloat(viaje.Porcentaje) + parseFloat(newporcentaje)).toFixed(2);

                        if (porTotal <= 100) {
                            let listP = viaje.Pedidos.map((p) => p.numPedido).join(",");
                            console.log(`La Unidad : ${unidad} puede contener Pedidos: ${pedido}, ${listP}`);
                            console.log(`Unidad: ${unidad} porcentaje -> Actual: ${viaje.Porcentaje} + Nuevo: ${newporcentaje} = ${porTotal}`)
                            viaje.Porcentaje = porTotal;
                            viaje.Pedidos.push({ numPedido: pedido, pzs: pzsEntrega });

                            if (porTotal == 100) viaje.Full = true;
                        } else {
                            console.log(`La Unidad : ${unidad} esta llena, Pedido: ${pedido} revasa la capacidad..`)
                        }

                    }
                    else {
                        console.log(`La Unidad : ${unidad} esta llena, Pedido: ${pedido} revasa la capacidad..`)
                    }


                }
                else {
                    //let objCap = PlanEmbCs.capPlanEmb.find((c) => c.Pedido == pedido);
                    let capacidad = 0;
                    let full = false;
                    let porcentaje = 0;

                    if (objCap) {
                        capacidad = objCap[`U_${unidad}`];
                    }

                    if (pzsEntrega > 0 && capacidad > 0) {

                        if (pzsEntrega === capacidad || pzsEntrega > capacidad) {
                            full = true;
                            porcentaje = 100;
                        }
                        else if (pzsEntrega < capacidad) {
                            full = false;
                            //Porcentaje con regla de  3
                            porcentaje = ((pzsEntrega * 100) / capacidad).toFixed(2)
                        }
                    }


                    let objPedido =

                    {
                        Unidad: unidad,
                        Pedidos: [{ numPedido: pedido, pzs: pzsEntrega, codigoC: codigoC }],
                        Full: full,
                        Porcentaje: porcentaje,
                        Capacidad: capacidad
                    }

                    infoAct[numV].push(objPedido);
                }
            }
        });


        console.log(infoAct);

        this.infoCapPlanEmb = infoAct;
    }

    //Lenado dinamico de tabla apartir de data
    renderTableFromData({
        data,
        tableSelector,
        excludeColumns = [],
        editRules = {},
        customParsers = {},
        noAuth = [],
        widthCol = {},
        prefId = "rowppd"
    }) {
        if (!Array.isArray(data) || data.length === 0) return;

        const $table = $(tableSelector);
        const $thead = $table.find("thead tr");
        const $tbody = $table.find("tbody");

        let headerHTML = "";
        let bodyHTML = "";

        // Crear encabezados
        const firstRow = data[0];
        for (const key in firstRow) {
            if (!excludeColumns.includes(key)) {

                let iconEdit = "";
                if (editRules[key]) {
                    iconEdit = '<i class="bi bi-pencil-square"></i>';
                }

                let width = "200";
                let existe = key in widthCol;

                if (existe) {
                    width = widthCol[key];
                }

                let headerText = LayoutCs.SpaceByUppercase(key).toUpperCase();
                //headerHTML += `<th id="${key}" width="${width}">${iconEdit} ${headerText}</th>`;

                //headerHTML += `
                //    <th id="${key}" 
                //        width="${width}" 
                //        class="sortable" 
                //        data-order="asc">
                //        ${iconEdit} ${headerText}
                //    </th>`;

                headerHTML += `
                <th id="${key}" 
                    width="${width}" 
                    class="sortable" 
                    data-order="asc">
                    ${iconEdit} ${headerText}
                    <span class="sort-icon ms-1"></span>
                </th>`;


            }
        }

        // Crear filas del cuerpo
        data.forEach((item, i) => {

            let auth = noAuth.some(p => p.id == item.id);
            let red = '';

            if (auth) //Color para no autorizados
                red = 'background-color:#e7a1a1 !important;'

            bodyHTML += `<tr 
                            id="${prefId}${item.id}" idppd="${item.id}" 
                            document="${item.DocEntry}"
                            class="ui-sortable-handle pedidoEmb row${item.DocEntry}">`;

            for (const key in item) {
                if (!excludeColumns.includes(key)) {
                    let cellData = item[key];

                    // Aplicar transformación si hay parser para esta columna
                    if (customParsers[key]) {
                        cellData = customParsers[key](cellData);
                    }

                    // Determinar clase editable
                    let editClass = "";
                    if (editRules[key]) {
                        editClass = editRules[key];
                    }

                    bodyHTML += `<td style="${red}" class="${key} ${editClass}" data-name="${key}">${cellData}</td>`;
                }
            }

            bodyHTML += `</tr>`;
        });

        // Renderizar tabla
        $thead.empty().append(headerHTML);
        $tbody.empty().append(bodyHTML);
    }

    async MakeTableEditableWithBitacora(table) {

       
        if (!this.TablasEditables.includes(table)) {
            this.TablasEditables.push(table);
        }
        else {
            return;
        }

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
                    const idPedido = $tr.attr('idppd');  // id de la fila
                    const unidad = $tr.find("td.Unidad").text().trim();

                    let cleanUnidad = false;

                    if ($(elem).hasClass("NumeroViaje")) {
                        // cleanUnidad = this.unidadOcupada(valor, unidad, idPedido);
                        //this.updateNumViajeInData(idPedido, valor, unidad);
                    }

                    if ($(elem).hasClass("UbicacionProducto")) {
                        if (valor.length > 15) {
                            valor = this.limitarTexto(valor, 15);

                            LayoutCs.Alerta(
                                "Plan Embarque",
                                "El campo Ubicacion Producto no puede contener mas de 15 caracteres.",
                                "Warning"
                            );
                        }
                    }

                    //Limpiar sí ya esta la unidad ocupada en ese viaje
                    if (cleanUnidad) {
                        $tr.find("td.Unidad").text("");
                        this.cleanUnidadInData(idPedido);
                    }


                    return valor;
                }
            }
        });

        advancedEditor.SetEditableClass("editMeNum", {
            internals: {
                renderEditor: async (elem, oldVal) => {

                    let valido = true;

                    const $td = $(elem);
                    const $tr = $td.closest('tr');
                    const Pedido = $tr.find('td.Pedido').text().trim();

                    if ($(elem).hasClass("PiezasEntrega")) {
                        valido = this.pedidoEnProcesoCarga(elem);
                    }

                    if (
                        $(elem).hasClass("PiezasEntrega") &&
                        $(elem).hasClass("needSumPzsEntrega")
                    ) {
                        //OPTENER INFO DE SUMA PZS ENTREGA
                        if (!this.SumaPzsByPedido[Pedido]) {
                            let data = await this.getSumPzsEntrega(Pedido, this.currentFolio);
                            this.SumaPzsByPedido[Pedido] = data;
                        }
                    }



                    //NO VALIDO
                    if (!valido) {
                        $(elem).text(oldVal)
                    }
                    else {
                        // Crear un input sin espacios extra
                        $(elem).html(`<input type="number" class="form-control" value="${oldVal.trim()}" min="0">`);
                    }

                },
                extractEditorValue: (elem) => {
                    let valido = true;
                    const $td = $(elem);
                    const $tr = $td.closest('tr');
                    const idPedido = $tr.attr('idppd');  // id de la fila
                    const Pedido = $tr.find('td.Pedido').text().trim();  // id de la fila
                    const numViaje = $tr.find("td.NumeroViaje").text().trim();
                    const unidad = $tr.find("td.Unidad").text().trim();

                    let cleanUnidad = false;

                    //COMPLETADO. EN PRUEBAS
                    //if (
                    //    $(elem).hasClass("PiezasEntrega") &&
                    //    $(elem).hasClass("needSumPzsEntrega")
                    //)
                    if ($(elem).hasClass("PiezasEntrega") && this.SumaPzsByPedido[Pedido]) {

                        valido = this.validarPzsEntrega(Pedido);
                    }


                    if (valido) {

                        let $input = $(elem).find('input');
                        let valor = "";

                        if ($input.length > 0) {
                            valor = $input.val().trim();
                        }
                        else {
                            valor = $(elem).text().trim();
                        }


                        //if ($(elem).hasClass("PiezasEntrega")) {
                        //    this.updatePzsEntregaInData(idPedido, valor);
                        //   // cleanUnidad = this.unidadOcupada(numViaje, unidad, idPedido);
                        //}

                        //Limpiar sí la unidad ya esta ocuapada
                        if (cleanUnidad) {
                            $tr.find("td.Unidad").text("");
                            this.cleanUnidadInData(idPedido);
                        }


                        return valor;
                    }
                    else {
                        return "0"
                    }


                }
            }
        });

        advancedEditor.SetEditableClass("CustomLocales", {
            internals: {
                renderEditor: async (elem, oldVal) => {
                    // Mostrar loading temporal (opcional)
                    $(elem).html(`<span class="text-muted">Cargando...</span>`);

                    if (this.Locales.length == 0) {
                        this.Locales = await this.getInfoLocales();
                    }

                    // Esperar los datos
                    const opciones = this.Locales;


                    // Crear select dinámico
                    let selectHTML = `<select id="Locales" class="form-select mt-2" aria-label="Locales">
                                       `;
                    opciones.forEach(opt => {
                        const selected = (opt.Valor === oldVal.trim()) ? "selected" : "";
                        let val = opt.Valor.trim();

                        selectHTML += `<option value="${val}" ${selected}>${val}</option>`;
                    });
                    selectHTML += `</select>`;

                    $(elem).html(selectHTML);
                },

                extractEditorValue: (elem) => {
                    //console.log(elem);

                    let valorSelected = $(elem).find('select').val().trim();

                    return valorSelected;
                }
            }
        });

        advancedEditor.SetEditableClass("CustomTipoUnidad", {
            internals: {
                renderEditor: (elem, oldVal) => {

                    $(elem).html(`<select class="form-select mt-2" aria-label="EstatusCarga">
                                  ${this.TipoUnidadHTML}
                                </select>`);
                    $("select option").filter(function () {
                        return $(this).val() == oldVal;
                    }).prop('selected', true);

                },
                extractEditorValue: (elem) => {
                    let valor = $(elem).find('select').val();

                    const $td = $(elem);
                    const $tr = $td.closest('tr');
                    $tr.find("td.Unidad").text("");

                    PlanEmbCs.getInfoCapFromTable();

                    return valor;
                },

            }
        });

        advancedEditor.SetEditableClass("CustomUnidad", {
            internals: {
                renderEditor: async (elem, oldVal) => {
                    // Mostrar loading temporal (opcional)
                    $(elem).html(`<span class="text-muted">Cargando...</span>`);
                    const $td = $(elem);
                    const $tr = $td.closest('tr');
                    const idFila = $tr.attr('idppd');  // id de la fila
                    const pzs = $tr.find("td.PiezasEntrega").text().trim();
                    const cliente = $tr.find("td.Cliente").text().trim();
                    const articulo = $tr.find("td.Articulo").text().trim();
                    const tipoUnidad = $tr.find("td.TipoUnidad").text().trim();
                    const numViaje = $tr.find("td.NumeroViaje").text().trim();
                    const pedido = $tr.find("td.Pedido").text().trim();
                    const codeUnidad = LayoutCs.getCodeUnidad(tipoUnidad);

                    let viaje = numViaje.toUpperCase()
                    //if (!this.contenedores.includes(viaje)) {
                    // Esperar los datos
                    //const opciones = await this.getUniById(idFila, pzs, codeUnidad, numViaje, cliente, articulo);
                    const opciones = await this.filterUniByCap(pedido, idFila, codeUnidad, pzs, numViaje, cliente, articulo);
                    // Crear select dinámico
                    let selectHTML = `<select class="form-select mt-2" aria-label="Unidad">
                                        <option value="" ></option>`;

                    if (this.contenedores.includes(viaje)) {

                        let opContenedores = ['Mostrador', 'Foraneo'];

                        opContenedores.forEach(op => {
                            const selected = (op === numViaje) ? "selected" : "";

                            selectHTML += `<option value="${op}" ${selected}>${op}</option>`;
                        });

                    }
                    else {
                        opciones.forEach(opt => {
                            const selected = (opt.Unidad === oldVal) ? "selected" : "";
                            //let val = opt.Campo.replace('U_', 'Unidad ');
                            let val = opt.Unidad;
                            let htmlP = "", css = "";

                            if (opt.Porcentaje > 0) {
                                htmlP = `<strong>(${opt.Porcentaje}%)</strong>`
                                css = "unidadP";
                            }

                            selectHTML += `<option class="${css}" capacidad="${opt.Porcentaje}" value="${val}" ${selected}>${val} ${htmlP} </option>`;
                        });
                    }
                    selectHTML += `</select>`;

                    this.olvUni = oldVal;

                    $(elem).html(selectHTML);
                    //}
                    //else {
                    //    $(elem).text(numViaje)
                    //}


                },

                extractEditorValue: (elem) => {
                    const $td = $(elem);
                    const $tr = $td.closest('tr');
                    let idPedido = $tr.attr("idppd");
                    let pzs = $tr.find('td.PiezasEntrega').text().trim();
                    let cliente = $tr.find('td.CodigoCliente').text().trim();
                    let numV = $tr.find('td.NumeroViaje').text().trim();
                    let pedido = $tr.find('td.Pedido').text().trim();
                    pzs = parseInt(pzs);

                    const $optionSeleccionada = $(elem).find(':selected');
                    let valor = $(elem).find('select').val();

                    //Optiene el operador ligado a la unidad
                    let {
                        Operador, Ayudante1, Ayudante2,
                        Ayudante3, Ayudante4 } = PlanEmbCs.getOperadorByUnidad(valor);
                    //Colocar valor en la celda
                    $tr.find('td.Operador').text(Operador);
                    $tr.find('td.Ayudante1').text(Ayudante1);
                    $tr.find('td.Ayudante2').text(Ayudante2);
                    $tr.find('td.Ayudante3').text(Ayudante3);
                    $tr.find('td.Ayudante4').text(Ayudante4);

                    let capacidad = $optionSeleccionada.attr("capacidad");

                    let viaje = numV.toUpperCase()
                    if (!this.contenedores.includes(viaje)) {
                        //Valdiar consolidado
                        //codigoCliente, numViaje, unidad
                        let completado = PlanEmbCs.permiteConsolidar(cliente, numV, valor, pedido);

                        if (!completado) return '';

                        return valor;
                    }
                    else {
                        return numV;
                    }

                }
            }
        });

        advancedEditor.SetEditableClass("CustomOperador", {
            internals: {
                renderEditor: async (elem, oldVal) => {
                    // Mostrar mensaje temporal
                    $(elem).html(`<span class="text-muted">Cargando...</span>`);
                    PlanEmbCs.updateOperadoresFromTable();
                    // Obtener datos
                    const $td = $(elem);
                    const $tr = $td.closest('tr');
                    const idFila = $tr.attr('idppd');
                    const numViaje = $tr.find("td.NumeroViaje").text().trim();

                    const opciones = await this.getInfoOperadores();
                    // IDs únicos
                    const listId = "operadoresList_" + idFila;
                    const inputId = "operadoresInput_" + idFila;

                    // Crear datalist
                    let dataListHTML = `<datalist id="${listId}">`;
                    opciones.forEach(opt => {
                        let val = opt.Nombre || opt.id;

                        if (!this.operadorOcupado(numViaje, val)) {
                            dataListHTML += `<option value="${val}">`;
                        }

                    });
                    dataListHTML += `</datalist>`;

                    // Input con valor inicial
                    let inputHTML = `
                <input type="text"
                       id="${inputId}"
                       class="form-control mt-2 inputOperador" 
                       value="${oldVal || ''}" 
                       list="${listId}">
                ${dataListHTML}
            `;

                    $(elem).html(inputHTML);


                },

                extractEditorValue: (elem) => {

                    let valido = this.validarOperador(elem);

                    const $td = $(elem);
                    const $tr = $td.closest('tr');
                    const numViaje = $tr.find("td.NumeroViaje").text().trim();

                    if (valido) {
                        return $(elem).find('input').val().trim();
                    }
                    else {
                        return "";
                    }

                }
            }
        });

        advancedEditor.SetEditableClass("CustomEstatusCarga", {
            internals: {
                renderEditor: (elem, oldVal) => {

                    $(elem).html(`<select class="form-select mt-2" aria-label="EstatusCarga">
                                  ${this.EstatusCargaHTML}
                                </select>`);
                    $("select option").filter(function () {
                        return $(this).val() == oldVal;
                    }).prop('selected', true);

                },
                extractEditorValue: (elem) => {
                    let valor = $(elem).find('select').val();
                    let reqComments = reqEstComents(valor);

                    const $td = $(elem);
                    const $tr = $td.closest('tr');
                    const idFila = $tr.attr('idppd');
                    const pedido = $tr.find("td.Pedido").text().trim();

                    if (reqComments) {

                        PlanEmbCs.$currentTdEst = $td;

                        setTimeout(() => {
                            showModalEstatus(idFila, valor, pedido)
                        }, 500);
                    }


                    return valor;
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
        $("#" + table).on(
            'change', '.editMe, .TimeField, .DateField,.CustomUnidad, .CustomTipoUnidad, .editMeNum', function () {
                var cell = $(this).closest('td'); // Obtener la celda más cercana
                var cellName = cell.data('id'); // Asumiendo que existe un atributo 'data-id'
                var cellOldValue = cell.html();

                if (cell.hasClass("PiezasEntrega") || cell.hasClass("NumeroViaje") ||
                    cell.hasClass("Unidad")) {


                    setTimeout(() => PlanEmbCs.getInfoCapFromTable(), 500);
                }
            });
    }


    pedidoEnProcesoCarga(elem) {
        const $td = $(elem);
        const $tr = $td.closest('tr');
        const idPedido = $tr.attr('idppd');  // id de la fila

        let data = this.previewdataPP.find((e) => e.id == idPedido);

        let valido = true;

        if (data) {
            if (data.NumEstatusC >= 4) valido = false;
        }

        if (!valido) {
            LayoutCs.Alerta(
                "Piezas Entrega",
                "Edición no permitida 🛑. El pedido se encuentra en " + data.EstatusCarga,
                "Warning");
        }

        return valido;
    }

    //Compara NumRollos vs Piezas Entrega
    //Recibe la celda  td.PiezasEntrega
    validarPiezas(elem) {
        let piezas = $(elem).find('input').val().trim()
        piezas = parseInt(piezas);


        let $filaData = $(elem).closest("tr");
        let numRollos = $filaData.find("td.NumRollos").text().trim();
        numRollos = parseInt(numRollos);

        if (piezas > numRollos) {
            LayoutCs.Alerta(
                "Piezas Entrega",
                "Las piezas no pueden ser mayores al numero de rollos",
                "Warning");

            $(elem).text("0");
            return false;
        }

        return true;
    }

    validarOperador(elem) {
        let valido = false;
        let valOp = $(elem).find('input').val().trim()
        let $datalist = $(elem).find(`datalist option`);

        $datalist.each(function () {
            if ($(this).val() === valOp) {
                valido = true;
                return false; // rompe el each
            }
        });

        if (!valido) {
            LayoutCs.Alerta(
                "Operador",
                "Por favor selecciona un operador válido de la lista.",
                "Warning");
            $(elem).text("0");
            $(elem).focus();
        }

        return valido;
    }

    async filterUniByCap(numPedido, idPedido, codeUnidad, pzsE, numViaje, cliente, articulo) {
        //this.capPlanEmb -> INFO DE TABLA DE CAPACIDADES POR CLIENTE - PRODUCTO
        //this.infoCapPlanEmb -> CAPACIDAD PLAN EMBARQUE
        this.getInfoCapFromTable(numPedido) //Actualizar info sin ese pedido

        //Primero seleccionar el tipo de unidad
        if (codeUnidad == '') {
            LayoutCs.Alerta(
                "Unidades Carga",
                `⚠ Selecciona un tipo de unidad...`,
                "Warning"
            );

            return [];
        }


        let opciones = [];
        let capacidad = this.capPlanEmb.find((cap) => cap.Pedido == numPedido);

        //Hacer petición para verificar nuevamente en tabla de capacidades
        if (!capacidad) {
            let cap = await this.getUniById(idPedido);
            //console.log(cap);
            if (cap.length > 0) {
                this.capPlanEmb.push(cap[0]);
                capacidad = cap[0];
            }
            else capacidad = undefined;
        }


        if (capacidad) {

            //FILTRO 1 : POR TIPO DE UNIDAD
            // ['01','05','08', .....]
            let codesTipoUni = this.TipoUnidad.filter((t) => t.TipoUnidad == codeUnidad).map((t) => t.Code);

            if (codesTipoUni.length > 0)
                codesTipoUni.forEach((numUni) => {

                    let nu = parseInt(numUni);

                    if (nu < 10) numUni = `0${numUni}`;

                    let cap = capacidad[`U_${numUni}`];
                    //Extrae la unidades ocupadas por viaje del plan
                    let unidadesViaje = this.infoCapPlanEmb[numViaje];

                    //No considerar NULL y 0
                    if (cap > 0 && unidadesViaje) {
                        let unidad = unidadesViaje.find((u) => u.Unidad == numUni);

                        //Unidad en contrada, valorando espacio
                        if (unidad) {

                            if (!unidad?.Full) {
                                let newPorcentaje = ((pzsE * 100) / cap).toFixed(2);
                                let totalP = parseFloat(newPorcentaje) + parseFloat(unidad.Porcentaje);

                                //El pedido aun cabe en la unidad, se muestra
                                if (totalP <= 100) {
                                    let op = { Unidad: `Unidad ${numUni}`, Porcentaje: unidad.Porcentaje }
                                    opciones.push(op);

                                }
                            }
                        }
                        else {
                            //No esta la unidad en ese viaje, por tanto es cadidato a elegir:

                            let op = { Unidad: `Unidad ${numUni}`, Porcentaje: 0 }
                            opciones.push(op);
                        }
                    }
                    else {
                        //No esta la unidad en ese viaje, por tanto es cadidato a elegir:

                        let op = { Unidad: `Unidad ${numUni}`, Porcentaje: 0 }
                        opciones.push(op);
                    }
                });

            return opciones;
        }
        else {

            //No se encuentra la capacidad en la tabla de capacidades por cliente - producto
            LayoutCs.Alerta(
                "Unidades Carga",
                ` ⚠ El cliente : <strong>${cliente}</strong> y producto : <strong>${articulo}</strong> no se encuentra en la tabla de capacidades`,
                "Warning"
            );


            //FILTRO 1 : POR TIPO DE UNIDAD
            // ['01','05','08', .....]
            let codesTipoUni = this.TipoUnidad
                .filter((t) => t.TipoUnidad == codeUnidad)
                .map((t) => t.Code);


            if (codesTipoUni.length > 0)
                codesTipoUni.forEach((numUni) => {

                    let nu = parseInt(numUni);

                    if (nu < 10) numUni = `0${numUni}`;

                    let unidadesViaje = this.infoCapPlanEmb[numViaje];

                    //No considerar NULL y 0
                    if (unidadesViaje) {
                        let unidad = unidadesViaje.find((u) => u.Unidad == numUni);
                        //Unidad en contrada, valorando espacio
                        if (!unidad) {
                            //No esta la unidad en ese viaje, por tanto es cadidato a elegir:
                            let op = { Unidad: `Unidad ${numUni}`, Porcentaje: 0 }
                            opciones.push(op);
                        }
                    }
                    else {
                        //No esta la unidad en ese viaje, por tanto es cadidato a elegir:

                        let op = { Unidad: `Unidad ${numUni}`, Porcentaje: 0 }
                        opciones.push(op);
                    }
                });

            return opciones;
        }

    }

    permiteConsolidar(codigoCliente, numViaje, unidad, pedido) {

        unidad = unidad.replace("Unidad", "").trim();

        let viaje = this.infoCapPlanEmb[numViaje];

        if (viaje) {

            //viaje[0].Pedidos.some((p) => p.numPedido == pedido);

            let UnidadV = viaje.find((u) => u.Unidad == unidad);

            let distintoPedido = UnidadV?.Pedidos.every((p) => p.numPedido != pedido);

            if (UnidadV && distintoPedido) {

                let newP = this.noConsolidar.includes(codigoCliente);
                let oldP = UnidadV.Pedidos.some((p) =>
                    this.noConsolidar.includes(p.codigoC) && p.numPedido != pedido);

                if (newP || oldP) {
                    LayoutCs.Alerta(
                        "Unidades Carga",
                        `El cliente : <strong>${codigoCliente}</strong> no permite consolidar...`,
                        "Warning"
                    );
                    return false;
                }
                else {
                    return true;
                }

            }
            else {
                return true;
            }
        }
        else {
            return true;
        }
    }

    async getUniById(id) {

        //GetUniByPedido
        try {
            let urlUnid = $("#PlanEmbarques").attr("UniByPedido");
            //Loading();

            let response = await $.ajax({
                url: urlUnid,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    idPedido: id,
                }
            });

            let data = JSON.parse(response.Data);

            if (!data) return [];


            return data;


        } catch (error) {
            LayoutCs.Excepcion("No fue posible consultar las unidades: " + error, "Plan Embarques");
            return [];
            // StopLoading();
        }


    }

    async getUniByIdCalculo(id, codeUnidad) {

        //GetUniByPedido
        try {
            let urlUnid = $("#PlanEmbarques").attr("UniByPedido");
            //Loading();

            let response = await $.ajax({
                url: urlUnid,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    idPedido: id,
                    codeU: codeUnidad,
                }
            });

            let data = JSON.parse(response.Data);

            if (!data) {
                LayoutCs.Alerta(
                    "Unidades Carga",
                    `El cliente : <strong>${cliente}</strong> y producto : <strong>${articulo}</strong> no se encuentra en la tabla de capacidades`,
                    "Warning"
                );

                return [];
            }

            return data;


        } catch (error) {
            LayoutCs.Excepcion("No fue posible consultar las unidades: " + error, "Plan Embarques");
            return [];
            // StopLoading();
        }


    }

    async getTipoUnidades() {

        //GetTipoUnidades
        try {
            let urlTipoUni = $("#PlanEmbarques").attr("TipoUnidadesInfo");
            //Loading();

            let response = await $.ajax({
                url: urlTipoUni,
                type: 'POST',
                dataType: 'JSON'
            });

            if (response.Status == "OK") {
                let data = JSON.parse(response.Data);
                let opciones = `<option code="" value=""></option>`;

                let codes = data.reduce((acc, item) => {
                    if (!acc.includes(item.TipoUnidad)) {
                        acc.push(item.TipoUnidad)
                    }

                    return acc;
                }, [])

                codes.forEach((d) => {
                    let tipoUnidad = LayoutCs.getTipoUnidad(d);

                    opciones += `<option code="${d}" value="${tipoUnidad}">${tipoUnidad}</option>`
                });

                this.TipoUnidad = data;
                console.log("Data Tipo Unidad: ");
                console.log(this.TipoUnidad);

                this.TipoUnidadHTML = opciones;
            }
            else {
                LayoutCs.Alerta("Tipo Unidad Carga", "Error al obtener los tipos de unidades...", "Warning");
            }


            //return data

        } catch (error) {
            LayoutCs.Excepcion("No fue posible consultar los operadores: " + error, "Plan Embarques");
            return [];
            // StopLoading();
        }


    }

    async getInfoOperadores() {

        //GetUniByPedido
        try {
            let urlOp = $("#PlanEmbarques").attr("OperadorInfo");
            //Loading();

            let response = await $.ajax({
                url: urlOp,
                type: 'POST',
                dataType: 'JSON'
            });

            let data = JSON.parse(response.Data);

            //let operadoresLibres = data.filter((d) => { !this.operadorOcupado(numViaje, d.Nombre) });

            return data;

        } catch (error) {
            LayoutCs.Excepcion("No fue posible consultar los operadores: " + error, "Plan Embarques");
            return [];
            // StopLoading();
        }


    }

    async getUnidadesOperador() {

        //PlanEmb/GetUniOp
        try {
            let urlOp = $("#PlanEmbarques").attr("UniOpInfo");
            //Loading();

            let response = await $.ajax({
                url: urlOp,
                type: 'POST',
                dataType: 'JSON'
            });

            let data = [];
            if (response.Status == 'OK') {
                data = JSON.parse(response.Data);
            }
            else {
                LayoutCs.Alerta(
                    "Plan Embarques",
                    "No fue posible consultar la lista de unidades - operadores - ayudantes",
                    "Warning");
            }

            return data;

        } catch (error) {
            LayoutCs.Excepcion("No fue posible consultar las uniadaes - operadores: " + error, "Plan Embarques");
            return [];
            // StopLoading();
        }


    }

    async getEstatusCarga() {

        //PlanEmb/GetEstatusCarga
        try {
            let urlEstatus = $("#PlanEmbarques").attr("EstatusCarga");
            //Loading();

            let response = await $.ajax({
                url: urlEstatus,
                type: 'POST',
                dataType: 'JSON'
            });

            if (response.Status == "OK") {
                let data = JSON.parse(response.Data);
                let dataAut = JSON.parse(response.ExtraData);
                let opciones = "";

                data.forEach((d) => {
                    opciones += `<option code="${d.Code}" value="${d.Estatus}">${d.Estatus}</option>`
                });

                dataAut.forEach((d) => {
                    opciones += `<option code="${d.Code}" value="${d.Estatus}">${d.Estatus}</option>`
                });

                PlanEmbCs.EstatusCargaHTML = opciones;
                PlanEmbCs.EstatusCarga = data;
                PlanEmbCs.EstatusCargaAut = dataAut;
            }
            else {
                LayoutCs.Alerta("Estatus Carga", "Error al obtener estatus de carga...", "Warning");
            }

        } catch (error) {
            LayoutCs.Excepcion("No fue posible consultar los estatus: " + error, "Plan Embarques");
            return [];
            // StopLoading();
        }


    }

    async getInfoLocales() {

        //'/PlanEmb/GetLocales'
        try {
            let urlLocales = $("#PlanEmbarques").attr("LocalesInfo");
            //Loading();

            let response = await $.ajax({
                url: urlLocales,
                type: 'POST',
                dataType: 'JSON'
            });

            let data = JSON.parse(response.Data);

            return data

        } catch (error) {
            LayoutCs.Excepcion("No fue posible consultar los operadores: " + error, "Plan Embarques");
            return [];
            // StopLoading();
        }


    }

    async getSumPzsEntrega(pedido, folio) {

        //PlanEmb/GetSumPzsEntrega
        try {
            let urlLocales = $("#PlanEmbarques").attr("SumPzsEntregaPedido");
            //Loading();

            let response = await $.ajax({
                url: urlLocales,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    Pedido: pedido,
                    Folio: folio
                }
            });

            let data = JSON.parse(response.Data);

            return data

        } catch (error) {
            LayoutCs.Excepcion("No fue posible consultar los operadores: " + error, "Plan Embarques");
            return [];
            // StopLoading();
        }


    }

    focusRows(IdsFilas, duration = 3000) {

        IdsFilas.forEach(id => {
            const $row = $(`#${id}`);

            if ($row.length) {
                $row.find("td").addClass('row-highlight');

                setTimeout(() => {
                    $row.find("td").removeClass('row-highlight');
                }, duration);
            }
        });

    }


    validarPzsEntrega(pedido) {
        let data = this.SumaPzsByPedido[pedido][0];
        let valido = true;

        if (data) {
            let ids = data.IdsInPlan.split(",");
            let pzsMaximas = parseInt(data.NumRollos);
            //SUMA PZS ENTREGA DE OTROS PLANES, SIN INCLUIR EL ACTUAL
            let sumaTotal = data.SumPzsNetas;

            let sumE = 0, sumNewRow = 0, sumPzsE = 0;
            let idsView = [];

            ////SUMA DE PIEZAS EN PLAN
            //sumE = ids.reduce((acumulador, current) => {
            //    let pzs = $("#sugprow" + current).find("td.PiezasEntrega").text().trim();
            //    idsView.push("sugprow" + current);
            //    return acumulador + parseInt(pzs)
            //}, 0);

            ////SUMA PIEZAS DE REGISTRO DUPLICADO
            //sumNewRow = ids.reduce((acumulador, current) => {
            //    let pzs = $("#newrow" + current).find("td.PiezasEntrega input").val();

            //    if (pzs) {
            //        idsView.push("newrow" + current);
            //        return acumulador + parseInt(pzs)
            //    }
            //    else return acumulador;
            //}, 0);

            ids.forEach((id) => {
                $(`#SugPlanEmbarques tr[idppd="${id}"]`).each(function () {

                    let idFila = $(this).attr("id");
                    let $input = $(this).find("td.PiezasEntrega input")

                    idsView.push(idFila)

                    if ($input.length > 0) {
                       let pzsInput = $input.val();
                        sumPzsE += parseInt(pzsInput,10) || 0;
                    }
                    else {
                        let pzsE = $(this).find("td.PiezasEntrega").text().trim();
                        sumPzsE += parseInt(pzsE, 10) || 0;
                    }

                });
            });


            //console.log("Pedido: " + pedido + " SumTotal: " + sumaTotal + " SumNewRow: " + sumNewRow + " PzsMaximas: " + pzsMaximas);
            if ((sumaTotal + sumPzsE) > pzsMaximas) {
                valido = false;
                LayoutCs.Alerta(
                    "Plan Embarques",
                    "Las suma de piezas entrega, excede la cantidad solicitada.",
                    "Warning");

                //Resaltar las filas por un momento
                this.focusRows(idsView);

            }
        }


        return valido;
    }

    async updatePlanEmb(updateList, newPedidos, com) {

        //PlanEmb/UpdatePlanEmb
        try {
            let urlUpdate = $("#SugPlanEmbarques").attr("UpdatePlanEmb");
            Loading();

            let response = await $.ajax({
                url: urlUpdate,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    PlanEmb: JSON.stringify(updateList),
                    NewPedidos: JSON.stringify(newPedidos),
                    Comentarios: JSON.stringify(com),
                    Folio: this.currentFolio
                }
            });

            if (response.Status == "OK") {
                LayoutCs.Alerta("Plan Embarques", "El plan de embarques se guardo correctamente ✔", "OK");

                setTimeout(() => {
                    window.location.reload();
                }, 2500);

            }
            else {
                LayoutCs.Alerta("Plan Embarques", "Ocurrio un error al guardar el plan " + response.Message, "ERROR");
            }

            StopLoading();



        } catch (error) {
            LayoutCs.Excepcion("No fue posible guardar el plan: " + error, "Plan Embarques");
            StopLoading();
        }


    }

    async updatePlanEmbAlm(updateList) {

        //PlanEmb/UpdatePlanEmbAlm
        try {
            let urlUpdate = $("#PlanEmbarques").attr("UpdatePlanEmbAlm");
            Loading();

            let response = await $.ajax({
                url: urlUpdate,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    PlanEmb: JSON.stringify(updateList)
                }
            });

            if (response.Status == "OK") {
                LayoutCs.Alerta("Plan Embarques", "El plan de embarques se guardo correctamente ✔", "OK");

                setTimeout(() => {
                    window.location.reload();
                }, 2500);

            }
            else {
                LayoutCs.Alerta("Plan Embarques", "Ocurrio un error al guardar el plan " + response.Message, "ERROR");
            }

            StopLoading();



        } catch (error) {
            LayoutCs.Excepcion("No fue posible guardar el plan: " + error, "Plan Embarques");
            StopLoading();
        }


    }

    async deletePedidoPlanEmb(id) {

        //DeletePedidoEmb
        try {
            let urlDelete = $("#SugPlanEmbarques").attr("DeletePedidoPlanEmb");
            Loading();

            let response = await $.ajax({
                url: urlDelete,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    Id: parseInt(id)
                }
            });

            if (response.Status == "OK") {
                $(`#sugprow${id}`).remove();
                $(`#rowppd${id}`).remove();

                setTimeout(() => {
                    LayoutCs.Alerta(
                        "Plan Embarques",
                        "El pedido fue eliminado ✔",
                        "OK");
                }, 2500);

            }
            else {
                LayoutCs.Alerta(
                    "Plan Embarques",
                    "Ocurrio un error al eliminar el pedido " + response.Message, "ERROR");
            }

            StopLoading();



        } catch (error) {
            LayoutCs.Excepcion("No fue posible eliminar el pedido: " + error, "Plan Embarques");
            StopLoading();
        }


    }

    async updateHeader(fl, fr, code, nivel) {

        // PlanEmb/UpdateHeadPlanEmb
        try {
            let urlEstatus = $("#SugPlanEmbarques").attr("UpdateHeaderISO");
            Loading();

            let response = await $.ajax({
                url: urlEstatus,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    FL: fl,
                    FR: fr,
                    Code: code,
                    Nivel: nivel
                }
            });

            if (response.Status == "OK") {
                LayoutCs.Alerta("Header Plan", "Se actualizo correctamente el encabezado", "OK");

                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
            else {
                LayoutCs.Alerta("Estatus Carga", "Error al obtener estatus de carga...", "Warning");
            }

            StopLoading();

        } catch (error) {
            LayoutCs.Excepcion("No fue posible consultar las unidades: " + error, "Plan Embarques");
            return [];
            StopLoading();
        }


    }

    async authPlanEmbVen(folioPlan) {

        //PlanEmb/AuthPlanEmbByVentas
        try {
            let urlAuth = $("#PlanEmbarques").attr("AuthPlanEmb");
            Loading();

            let response = await $.ajax({
                url: urlAuth,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    folio: folioPlan
                }
            });

            if (response.Status == "OK") {
                LayoutCs.Alerta("Plan Embarques", "El plan de embarques fue autorizado ✔", "OK");

                setTimeout(() => {
                    window.location.reload();
                }, 2500);

            }
            else {
                LayoutCs.Alerta("Plan Embarques", "Ocurrio un error al autorizar el plan " + response.Message, "ERROR");
            }

            StopLoading();



        } catch (error) {
            LayoutCs.Excepcion("No fue posible actualizar el plan: " + error, "Plan Embarques");
            StopLoading();
        }


    }

    //Calcula la capacidad actual, organizando la informacion en un objeto
    //Se usa cada vez que se hace un cambio importante que afecte a las capacidades
    getCapByUnidad(pedidos) {
        return pedidos.filter((p) => p.NumeroViaje.trim() != '').reduce((acc, pedido) => {
            if (!acc[pedido.NumeroViaje.trim()]) {
                acc[pedido.NumeroViaje.trim()] = [];
            }

            if (pedido.NumeroViaje.trim() != '') {
                let unidad = acc[pedido.NumeroViaje.trim()].find(
                    (u) => u.Unidad === pedido.Unidad
                );

                if (!unidad) {
                    unidad = {
                        Unidad: pedido.Unidad,
                        SumaPzs: pedido.PiezasEntrega,
                        IdPedidos: [
                            {
                                id: pedido.id, cliente: pedido.Cliente, codigoCliente: pedido.CodigoCliente,
                                articulo: pedido.Articulo, piezasEntrega: pedido.PiezasEntrega
                            }],
                    };

                    acc[pedido.NumeroViaje.trim()].push(unidad);
                } else {
                    unidad.SumaPzs += pedido.PiezasEntrega;
                    unidad.IdPedidos.push({
                        id: pedido.id, cliente: pedido.Cliente,
                        articulo: pedido.Articulo, piezasEntrega: pedido.PiezasEntrega
                    });
                }
            }
            else {
                console.log("Num viaje vacio: ", pedido);
            }


            return acc;
        }, {});
    }

    async updateUnidadInData(idPedido, nuevaUnidad, capacidad, codigoC, numViaje) {

        //console.log("------------Antes de actualizar *UNIADES*--------------------")
        //this.printCapacidadesByUnidad(this.capUniByViajes);

        if (nuevaUnidad == "") return true;

        const pedido = this.previewdataPP.find((p) => p.id === parseInt(idPedido));
        if (pedido) {

            //Verificar su ya existe un pedido en esa unidad
            let unidadViaje = this.capUniByViajes[numViaje];

            //Validar si en el viaje ya esta la unidad
            let existeP = unidadViaje?.find((i) => i.Unidad == nuevaUnidad);
            if (existeP) {
                //Validar sí permite consolidar pedidos
                //Pedido nuevo que se quiere agregar
                if (this.noConsolidar.includes(codigoC)) {
                    LayoutCs.Alerta(
                        `Plan Embarques`,
                        `⚠ ‼ No es posible seleccionar la <strong>${nuevaUnidad}</strong> 
                          El cliente <strong>${pedido.Cliente}</strong> no permite consolidar pedidos`,
                        "Warning")
                    return false;
                }

                let noConsolidar = false;
                //Validar sí algun pedido existente en unidad no permite consolidar
                existeP.IdPedidos.forEach((p, index) => {
                    if (this.noConsolidar.includes(p.codigoCliente)) {
                        LayoutCs.Alerta(
                            `Plan Embarques`,
                            `⚠ ‼ No es posible seleccionar la <strong> ${nuevaUnidad}</strong>
                             El cliente <strong>${p.cliente}</strong> no permite consolidar pedidos`,
                            "Warning")
                        noConsolidar = true;
                    }
                });

                if (noConsolidar) return false;


            }

            let capacidadesUnidades = await this.getUniByIdCalculo(idPedido, codigoC);
            let idUnidad = nuevaUnidad.replace('Unidad', '').trim();
            idUnidad = parseInt(idUnidad);
            let capNuevaUni = capacidadesUnidades.find(
                (cu) => parseInt(cu.Campo.replace('U_', '').trim()) == idUnidad);
            let permitir = false;
            let piezasOcupar = 0;

            if (!existeP) {
                let piezasE = pedido.PiezasEntrega;
                if (piezasE <= capNuevaUni.Valor) {
                    permitir = true;
                    piezasOcupar = piezasE;
                }
                else {
                    LayoutCs.Alerta(
                        "Capacidad Unidad",
                        `La ${nuevaUnidad} no tiene capacidad  para el pedido : ${pedido.Pedido}`,
                        "Warning");
                    return false;
                }
            }
            else {
                if (existeP.SumaPzs <= capNuevaUni.Valor) {
                    permitir = true;
                    piezasOcupar = existeP.SumaPzs;
                }
                else {
                    LayoutCs.Alerta(
                        "Capacidad Unidad",
                        `La ${nuevaUnidad} no tiene capacidad  para el pedido : ${pedido.Pedido}`,
                        "Warning");
                    return false;
                }
            }

            pedido.Unidad = nuevaUnidad;
            this.capUniByViajes = this.getCapByUnidad(this.previewdataPP);

            let indexElemen = this.listCapUnidades.findIndex((c) =>
                (c.Unidad == nuevaUnidad && c.NumViaje == numViaje));

            if (indexElemen >= 0) {
                this.listCapUnidades.splice(indice, 1);
            }


            let cap = {
                NumViaje: numViaje,
                Unidad: idUnidad,
                Capacidad: capNuevaUni.Valor,
                Ocupado: parseInt(piezasOcupar)
            }
            //Veifica si ya existe uno para eliminarlo antes de insertar
            this.listCapUnidades.push(cap);
            //console.log("-----Capacidades Unidades ----------");
            //console.table(this.listCapUnidades);

            //console.log("------------Actualizando capacidades unidad *UNIADES*--------------------")
            //this.printCapacidadesByUnidad(this.capUniByViajes);

            return true;
        } else {
            return false;
            console.error(`Pedido con id ${idPedido} no encontrado.`);
        }
    }

    updatePzsEntregaInData(idPedido, pzsEntrega) {
        const pedido = this.previewdataPP.find((p) => p.id === parseInt(idPedido));
        if (pedido) {
            pedido.PiezasEntrega = pzsEntrega;

            this.capUniByViajes = this.getCapByUnidad(this.previewdataPP);

            console.log("------------Actualizando capacidades unidad *PIEZAS ENTREGA*--------------------")
            this.printCapacidadesByUnidad(this.capUniByViajes);

        } else {
            console.error(`Pedido con id ${idPedido} no encontrado.`);
        }
    }

    updateNumViajeInData(idPedido, numeroViaje) {
        const pedido = this.previewdataPP.find((p) => p.id === parseInt(idPedido));
        if (pedido) {
            pedido.NumeroViaje = numeroViaje;

            this.capUniByViajes = this.getCapByUnidad(this.previewdataPP);
            this.operadorByViaje = this.getOperadores(this.previewdataPP);

            console.log("------------Actualizando capacidades unidad *PIEZAS ENTREGA*--------------------")
            this.printCapacidadesByUnidad(this.capUniByViajes);
        } else {
            console.error(`Pedido con id ${idPedido} no encontrado.`);
        }
    }

    updateCapacidadesByUnidad(viaje, pzs, unidad, idPedido, olvUnidad) {
        let p = this.capUniByViajes[viaje].find((u) => u.Unidad === olvUnidad);
        //console.log(p);
        //Restar cantidad de piezas de antigua unidad
        let indexP = p.IdPedidos.indexOf(idPedido);
        if (indexP !== -1) {
            p.SumaPzs -= pzs;
            p.IdPedidos.splice(indexP, 1);
        }
        else {
            console.error(`Pedido ${idPedido} no encontrado en la unidad ${olvUnidad}`);
        }

        let Pe = this.capUniByViajes[viaje].find((u) => u.Unidad === unidad);
        //console.log(Pe);
        if (Pe) {
            Pe.SumaPzs += pzs;
            Pe.IdPedidos.push(idPedido);
        }
        else {
            console.error(`Unidad ${unidad} no encontrada en el viaje ${viaje}`);
        }

    }

    printCapacidadesByUnidad(capacidadesByUnidad) {
        for (const viaje in capacidadesByUnidad) {
            console.log(`Viaje: ${viaje}`);
            capacidadesByUnidad[viaje].forEach((unidad) => {
                console.log(
                    `  Unidad: ${unidad.Unidad}, Piezas: ${unidad.SumaPzs}`
                );
                console.table(unidad.IdPedidos);
            });
        }
    }

    async PlanesProduccionDetails(FolioPP, pedido) {
        //PlanProduccionDet
        try {
            //Datos de PP
            Loading();

            let UrlPP = $("#PlanEmbarques").attr("PlanProduccionDet");

            let resp = await $.ajax({
                url: UrlPP,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    folio: FolioPP,
                    usuario: sessionStorage.getItem("email"),
                    tabla: "PlanProduccion"
                }
            });


            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (resp.Status == "OK") {

                let data = JSON.parse(resp.Data);

                data.sort((a, b) => (a.Orden - b.Orden))

                //Limpiar el contenedor
                this.renderTableFromData({
                    data: data,
                    tableSelector: "#PlanProduccion",
                    excludeColumns: [
                        "IdPPD", "Folio", "fecha", "DocEntry",
                        "RollosSAP", "CantidadMetrosSAP", "CantidadKilosSAP",
                        "NumCaidas", "Velocidad", "SumCap", "TP",
                        "Folio1", "OrdenFabricacion", "StatusProduccion", "Orden",
                        "EsDiaAnterior", "EstatusSapOF", "FlagOrdenFabricacion",
                        "GenerarOF", "UbicacionPropuesta", "UbicacionFinal",
                        "Especificacion"
                    ],
                    editRules: {
                        // ejemplo: "Cantidad": "editMe"
                        // Usa tu lógica si quieres pasarle `ColumnsWithEdit`, `ColumnsWithEditDate`, etc.
                        // Combínalos dinámicamente si prefieres
                        "PiezasEntrega": "editMeNum",
                        "Unidad": "CustomUnidad",
                        "Operador": "CustomOperador",
                        "NumeroViaje": "editMe",
                        "Estatus": "CustomEstatusCarga"
                    },
                    customParsers: {
                        HoraInicio: LayoutCs.parseHora,
                        HoraFin: LayoutCs.parseHora,
                        TiempoProduccion: LayoutCs.convertirHorasMinutos
                    },
                    //noAuth,
                    widthCol: {
                        "Linea": "120",
                        "PiezasProducidas": "150",
                        "Rollos": "150",
                        "Solicitado": "150",
                        "CodigoCliente": "150",
                        "Almacen": "120",
                        "HoraInicio": "150",
                        "HoraFinal": "150",
                        "MetrosRollo": "150",
                        "CantidadMetros": "150",
                        "HoraPropuesta": "120",
                        "Pedido": "150",
                        "CantidadKilos": "130",
                        "DescripcionArticulo": "250"
                    },
                    prefId: "sugprowPP"
                });

                resaltarFilaPorPedido(pedido);

            }


            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible consultar el plan de produccion: " + error, "Plan de producción");
            StopLoading();

        }
    }

    unidadOcupada(numViaje, unidad, idPedido) {

        let numUnidad = parseInt(unidad.replace('Unidad', '').trim());
        let viajeUnidad = this.capUniByViajes[numViaje];
        let unidades = viajeUnidad?.map((e) => (parseInt(e.Unidad.replace('Unidad', '').trim())))

        if (unidades) {

            //let mismaUnidad = viajeUnidad?.IdPedidos?.find((p) => p.id == idPedido);

            if (unidades.includes(numUnidad)) {

                LayoutCs.Alerta(
                    "Unidad ocupada",
                    `La <strong>${unidad}</strong> esta ocupada para el viaje : ${numViaje}. Selecciona otra unidad`,
                    "Warning");

                return true;
            }
            else return false;

        }
        else return false;
    }

    cleanUnidadInData(idPedido) {
        //console.log(this.previewdataPP);
        let pedido = this.previewdataPP.find((p) => p.id == parseInt(idPedido));

        if (pedido) {
            pedido.Unidad = "";
        }
        else {
            console.error(`Pedido ${idPedido} no encontrado`);
        }
    }

    limitarTexto(texto, max) {
        return texto.slice(0, max);
    }

    getOperadores(pedidos) {
        return pedidos.reduce((acc, p) => {
            if (!acc[p.NumeroViaje]) {
                acc[p.NumeroViaje] = [];
            }

            if (p.Operador != "") {
                acc[p.NumeroViaje].push(p.Operador);
            }

            return acc;
        }, {})
    }

    normalizeUnidad(value) {
        if (!value) return "";

        // Separar parte numérica y no numérica
        const match = value.match(/^0*([a-zA-Z]*)(\d+)(.*)$/);

        if (match) {
            const letrasInicio = match[1] || "";
            const numero = match[2] ? String(parseInt(match[2], 10)) : "";
            const resto = match[3] || "";

            return (letrasInicio + numero + resto).toLowerCase();
        }

        return value.toLowerCase().trim();
    }

    getOperadorByUnidad(uni) {

        const empty = {
            Operador: "",
            Ayudante1: "",
            Ayudante2: "",
            Ayudante3: "",
            Ayudante4: "",
        };

        if (!uni) return empty;

        let codeUnidad = uni.replace("Unidad", "").trim();

        const normalizedInput = this.normalizeUnidad(codeUnidad);

        let unidad = this.UnidadesOperador.find(u => {
            return this.normalizeUnidad(u.Unidad) === normalizedInput;
        });

        return unidad
            ? {
                Operador: unidad.Operador,
                Ayudante1: unidad.Ayudante1,
                Ayudante2: unidad.Ayudante2,
                Ayudante3: unidad.Ayudante3,
                Ayudante4: unidad.Ayudante4,
            }
            : empty;
    }

    //getOperadorByUnidad(uni) {

    //    if (uni) {

    //        let codeUnidad = uni.replace("Unidad", "").trim();
    //        let unidad = this.UnidadesOperador.find((u) => u.Unidad == codeUnidad);

    //        if (unidad)
    //            return {
    //                Operador: unidad.Operador,
    //                Ayudante1: unidad.Ayudante1,
    //                Ayudante2: unidad.Ayudante2,
    //                Ayudante3: unidad.Ayudante3,
    //                Ayudante4: unidad.Ayudante4,
    //            }
    //        else
    //            return {
    //                Operador: "",
    //                Ayudante1: "",
    //                Ayudante2: "",
    //                Ayudante3: "",
    //                Ayudante4: "",
    //            }
    //    }
    //    else return {
    //        Operador: "",
    //        Ayudante1: "",
    //        Ayudante2: "",
    //        Ayudante3: "",
    //        Ayudante4: "",
    //    }

    //}

    updateOperadoresFromTable() {

        PlanEmbCs.operadorByViaje = [];

        $("#SugPlanEmbarques tbody tr").each(function () {

            let numViaje = $(this).find("td.NumeroViaje").text().trim();
            let nombreOp = $(this).find("td.Operador").text().trim();



            if (!PlanEmbCs.operadorByViaje[numViaje]) PlanEmbCs.operadorByViaje[numViaje] = [];


            if (nombreOp != "") {
                PlanEmbCs.operadorByViaje[numViaje].push(nombreOp);
            }
        });

        console.log("Operadores por vijea:")
        console.log(PlanEmbCs.operadorByViaje);

    }

    operadorOcupado(numViaje, nameOp) {
        let operadoresViaje = this.operadorByViaje[numViaje];

        if (operadoresViaje) {
            let existeOp = operadoresViaje.some((nombre) => nombre.trim() === nameOp.trim());

            if (existeOp) return true
        }

        return false;
    }
}

function resaltarFilaPorPedido(numeroPedido) {
    // Limpiar highlights anteriores
    $('#PlanProduccion tr').removeClass('bg-info-subtle highlight');

    // Buscar la fila que contiene el pedido
    const $fila = $('#PlanProduccion td.Pedido').filter(function () {
        return $(this).text().trim() === numeroPedido.toString();
    }).closest('tr');

    if ($fila.length > 0) {
        $fila.find("td").each(function (index) {
            $(this).addClass("bg-info-subtle");
        });
        console.log("Fila encontrada y resaltada:", numeroPedido);
        return $fila;
    } else {
        console.log("No se encontró el pedido:", numeroPedido);
        return null;
    }
}

function reqEstComents(est) {
    let req = false;
    let Estatus = ['REPROGRAMA', 'DEVOLUCIÓN', 'RECHAZADO'];

    if (Estatus.includes(est)) req = true;

    return req;
}

function showModalEstatus(id, est, pedido) {
    $("#modalSugPlan").modal("hide");
    $("#modalMotivoEst").attr("idPedido", id);
    $("#estTitle").text(`Pedido: ${pedido} ${est}`);
    $("#motComentarios").val("");
    $("#modalMotivoEst").modal("show");
}

function saveEstComments() {

    let idPedido = $("#modalMotivoEst").attr("idPedido");

    let comentario = $("#motComentarios").val().trim();
    let com = {
        Id: idPedido,
        Com: comentario
    }

    let indice = PlanEmbCs.Comentarios.findIndex((c) => c.id == idPedido);

    if (indice >= 0) {
        PlanEmbCs.Comentarios.splice(indice, 1);
    }

    PlanEmbCs.Comentarios.push(com);

    LayoutCs.Alerta("Comentario Estatus", "El comentario agregado correctamente ✔", "OK");

    $("#modalSugPlan").modal("show");
    $("#modalMotivoEst").modal("hide");


}


LayoutCs.validarUsuarios(["Log\u00EDstica", "Ventas", "Almac\u00E9n"]);

const PlanEmbCs = new PlanEmb();

async function iniciar() {
    // Cargar primero estatus para no mostrar opciones vacías
    await PlanEmbCs.getEstatusCarga();
    await PlanEmbCs.getTipoUnidades();

    PlanEmbCs.Operadores = await PlanEmbCs.getInfoOperadores();
    PlanEmbCs.PedidosInPP = await PlanEmbCs.getInfoPedidosInProduccion();
    PlanEmbCs.UnidadesOperador = await PlanEmbCs.getUnidadesOperador()

    //console.log("Pedidos en plan de produccion: ");
    //console.table(PlanEmbCs.PedidosInPP);
    PlanEmbCs.table = PlanEmbCs.PlanesEmb();
    // PlanEmbCs.PlaneEmbDetails();

}

$(function () {

    let u_perfil = LayoutCs.getCookie("u_perfil");


    //Cargar primero estatus para no mostrar opciones vacias
    iniciar();

    if (u_perfil == "Admin") {
        $(".EditRow").hide();
        $(".btnSave").hide();

        //Eventos para edicion de encabezado
        $("#editHead").on("click", function () {
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

                LayoutCs.Alerta("Encabezado plan", "Los valores no pueden ser vacios..", "Warning");

                return;
            }

            LayoutCs.updateHeaderISO("PlanEmb", fl, fr, code, nivel, rev);
            //PlanEmbCs.updateHeader(fl, fr, code, nivel);

        });

    }
    else {
        //Eliminar elementos que no corresponden a usuario
        $(".EditRow").remove();
        $(".btnSave").remove();
        $(".btnEditHead").remove();
    }

    switch (u_perfil) {
        case "Logística":
            $(".nodoVentas").remove();
            $(".nodoAlmacen").remove();
            break;
        case "Almacén"://Almacen
            $(".nodoVentas").remove();
            $(".nodoLog").remove();
            break;
        case "Ventas":
            $(".nodoAlmacen").remove();
            $(".nodoLog").remove();
            break;
    }



    //Modal Sugerencia Plan
    $("#ShowModalSugPlan").on("click", function () {
        $("#modalSugPlan").modal("show");
        //Para traer la sugerencia de plan usa currentFolio
        //asignado cuando se da clic a una fila de la tabla #PlanesEmb
        PlanEmbCs.SugPlanEmb();
    });

    $("#closeSug").on("click", function () {
        $("#modalSugPlan").modal("hide");

    })

    //Guardar sugerencia de plan de embarques
    $("#savePE").on("click", function () {


        let listUpdate = [];
        let listPedidos = [];

        $("#SugPlanEmbarques tbody tr").each(function (index) {

            //let estPedido = $(this).find("td.Estatus").text().trim();
            let nomOperador = $(this).find("td.Operador").text().trim();
            let unidad = $(this).find("td.Unidad").text().trim();
            let localC = $(this).find("td.LocalCarga").text().trim();

            unidad = unidad.replace("Unidad", "").trim();

            let Operador = PlanEmbCs.Operadores.find((o) => o.Nombre == nomOperador);

            if (!$(this).hasClass("pedidoDuplicado")) {
                let pedido =
                {
                    Id: $(this).attr("idppd"),
                    DocEntry: $(this).attr("document"),
                    Unidad: unidad,
                    NumeroViaje: $(this).find("td.NumeroViaje").text().trim(),
                    PiezasEntrega: $(this).find("td.PiezasEntrega").text().trim(),
                    Operador: Operador?.Code == null ? '' : Operador?.Code,
                    Ayudante1: $(this).find("td.Ayudante1").text().trim(),
                    Ayudante2: $(this).find("td.Ayudante2").text().trim(),
                    Ayudante3: $(this).find("td.Ayudante3").text().trim(),
                    Ayudante4: $(this).find("td.Ayudante4").text().trim(),
                    LocalCarga: localC,
                    TipoUnidad: LayoutCs.getCodeUnidad($(this).find("td.TipoUnidad").text().trim()),
                    Orden: index
                };

                listUpdate.push(pedido);
            }
            else {
                let pedidoNuevo =
                {
                    IdOrigen: $(this).attr("idppd"),
                    Pedido: $(this).find("td.Pedido").text().trim(),
                    Unidad: unidad,
                    NumeroViaje: $(this).find("td.NumeroViaje").text().trim(),
                    PiezasEntrega: $(this).find("td.PiezasEntrega").text().trim(),
                    Operador: Operador?.Code == null ? '' : Operador?.Code,
                    Ayudante1: $(this).find("td.Ayudante1").text().trim(),
                    Ayudante2: $(this).find("td.Ayudante2").text().trim(),
                    Ayudante3: $(this).find("td.Ayudante3").text().trim(),
                    Ayudante4: $(this).find("td.Ayudante4").text().trim(),
                    LocalCarga: localC,
                    TipoUnidad: LayoutCs.getCodeUnidad($(this).find("td.TipoUnidad").text().trim()),
                    Orden: index
                };

                listPedidos.push(pedidoNuevo);
            }
        });


        PlanEmbCs.updatePlanEmb(listUpdate, listPedidos, PlanEmbCs.Comentarios);
    });

    $("#duplicarPedido").on("click", function () {

        // Obtener el índice actual de la nueva fila (número de filas ya presentes en la tabla)
        let rowIndex = $("#SugPlanEmbarques tbody tr").length;
        const index = $("#MenuContextDeleteRow").data("index");

        // Clonar la primera fila de la tabla
        let firstRow = $("#SugPlanEmbarques tbody tr").eq(index).clone();

        if (firstRow.length == 0)
            firstRow = $("#SugPlanEmbarques tbody tr").eq(0).clone();

        // Guardar valores de los atributos data-name antes de limpiar
        firstRow.find("td").each(function () {
            let dataName = $(this).attr("data-name");
            $(this).attr("data-original-name", dataName); // Guardar en un atributo temporal
        });


        // Limpiar el contenido de las celdas
        //let idppd = LayoutCs.generarCadenaAleatoria(8);
        let idppd = firstRow.attr("idppd");//ESTA LLEANGO COMO UNDEFINED
        firstRow.find("td.TipoUnidad").text("");
        firstRow.find("td.Unidad").text("");
        firstRow.find("td.NumeroViaje").text("");
        firstRow.find("td.PiezasEntrega").text("");
        firstRow.find("td.Operador").text("");
        firstRow.find("td.Ayudante1").text("");
        firstRow.find("td.Ayudante2").text("");
        firstRow.find("td.Ayudante3").text("");
        firstRow.find("td.Ayudante4").text("");


        firstRow.find("td").attr("id", "");
        firstRow.find("td").addClass("bg-info");
        firstRow.find("td").addClass("bg-gradien");
        firstRow.find("td").css('--bs-bg-opacity', '.4');


        firstRow.find("td").removeAttr("data-id");
        firstRow.attr("document", idppd);
        firstRow.addClass("pedidoDuplicado", idppd);

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
            $("#SugPlanEmbarques tbody tr")
                .eq(1).find("td").eq(0).outerHeight();

        // Establecer la misma altura en las celdas de la nueva fila
        firstRow.find("td").css("height", originalHeight + "px");

        // Añadir ícono de flecha derecha con el índice como atributo
        firstRow.find('td:nth-child(1)').prepend('<i class="bi bi-x-circle-fill iconremoverowVentas" data-index="' + rowIndex + '" ></i>');
        //firstRow.find('td:nth-child(1)').append('<i class="bi bi-x-circle-fill iconremoverowVentas" data-index="' + rowIndex + '"></i>');
        //firstRow.prepend('<i class="bi bi-x-circle-fill iconremoverow" data-index="' + rowIndex + '"></i>');


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
        // Clase para detectar validación de suma de piezas entrega
        firstRow.find('td.PiezasEntrega').addClass("needSumPzsEntrega");
        firstRow.find('td.DistRecorrida').removeClass("editMe").addClass("editMeNumber");


        //Eliminar id, sumcap de fila
        firstRow.attr("id", `newrow${idppd}`);
        firstRow.find("td.Comentarios").text("Esta es un pedio de contenedor.");

        PlanEmbCs.newRowsTR.push(idppd);

        firstRow.height(60);

        // Agregar la fila al final de la tabla
        //$("#SugPlanEmbarques tbody").append(firstRow);

        const $tbody = $("#SugPlanEmbarques tbody");
        const $filaReferencia = $tbody.find('tr').eq(index); // después de la fila índice 3

        $filaReferencia.after(firstRow);
    });


    //Descargar Plan Ventas
    $("#DescargarPlanVentas").on("click", function () {
        try {
            let folio = $("#folioPv").text().trim();
            let revision = $("#revisionPv").text().trim();

            let NombrePlan = folio + "_PlanEmbarques";
            LayoutCs.ExportarExcelExcelJS(
                "PlanEmbarques",
                NombrePlan,
                revision,
                `Plan Embarques Folio: ${folio} Revision: ${revision}`);
        }
        catch (error) {
            LayoutCs.Alerta(
                "Plan de Embarques",
                "No es posible descargar el plan de embarques: " + error);
            StopLoading();

        }
    });

    $(document).on("contextmenu", "#SugPlanEmbarques tbody tr", function (e) {
        e.preventDefault();

        // Obtener la posición de clic en relación con toda la página
        const pageX = e.pageX;
        const pageY = e.pageY;

        // Obtener la posición relativa de la tabla
        const tableOffset = $(this).closest("#SugPlanEmbarques").offset(); // Offset de la tabla

        // Calcular la posición relativa dentro de la tabla
        const relativeX = pageX - tableOffset.left;
        const relativeY = pageY - tableOffset.top + 148;

        // Extraer el idppd de la primera celda
        const idppd = $(this).attr("idppd"); // Atributo que necesitas

        const folioCell = $(this).find("td.Folio"); // Selecciona la primera celda
        const folio = folioCell.text().trim(); // Atributo que necesitas

        const ofCell = $(this).find("td.Pedido"); // Selecciona la primera celda
        const pedido = ofCell.text().trim(); // Atributo que necesitas

        const index = $(this).index(); // ← índice base 0 dentro del tbody


        // Asignar el atributo idppd al menú contextual
        $("#MenuContextDeleteRow").data("idppd", idppd);
        $("#MenuContextDeleteRow").data("folio", folio);
        $("#MenuContextDeleteRow").data("pedido", pedido);
        $("#MenuContextDeleteRow").data("index", index);

        $("#pedidoD").text(pedido);

        // Mostrar el menú contextual en la posición relativa correcta
        $("#MenuContextDeleteRow")
            .css({
                top: (pageY) + "px",
                left: (pageX) + "px",
                position: "fixed" // esto es clave para que siempre se posicione relativo a la ventana
            })
            .show();
    });

    $(document).on("click", "#deleteRow", function () {
        let idppd = $("#MenuContextDeleteRow").data("idppd");
        let folio = $("#MenuContextDeleteRow").data("folio");
        let pedido = $("#MenuContextDeleteRow").data("pedido");

        PlanEmbCs.deletePedidoPlanEmb(idppd);
    });

    $(document).on("click", function () {
        $("#MenuContextDeleteRow").hide();
    });

    $(document).on("click", ".goToPP", function () {

        try {
            let folioPP = $(this).attr("foliopp");
            let pedido = $(this).attr("pedido");

            if (folioPP == "") {
                console.error("El folioPP esta vacio");
                throw new Excepcion("El pedido no se encuentra en ningún plan de producción");
                return;
            }

            $("#modalPlanPro").modal("show");
            $("#folioPlanPro").text(folioPP);

            PlanEmbCs.PlanesProduccionDetails(folioPP, pedido);

        } catch (Error) {
            LayoutCs.Alerta("Link plan producción", Error, "Warning");
        }
    });

    $("#closePlanPro").on("click", function () {
        $("#modalPlanPro").modal("hide");
    });

    $("#SaveAlm").on("click", function () {


        let listUpdate = [];

        $("#PlanEmbarques tbody tr").each(function (index) {

            let local = $(this).find("td.LocalCarga").text().trim();
            let ubicacion = $(this).find("td.UbicacionProducto").text().trim();



            console.log(Operador);

            let pedido =
            {
                Id: $(this).attr("idppd"),
                DocEntry: $(this).attr("document"),
                LocalCarga: local,
                UbicacionProducto: ubicacion
            };

            listUpdate.push(pedido);
        });

        PlanEmbCs.updatePlanEmbAlm(listUpdate);
    });

    $("#AuthPlan").on("click", function () {
        let folioPlan = PlanEmbCs.currentFolio;

        PlanEmbCs.authPlanEmbVen(folioPlan);
    });

    $("#guardarComEst").on("click", function () {
        saveEstComments();
    });

    $(".backModalMotEst").on("click", function () {
        $("#modalMotivoEst").modal("hide");

        setTimeout(() => {
            $("#modalSugPlan").modal("show");

            setTimeout(() => {
                $(PlanEmbCs.$currentTdEst).focus();
                $(PlanEmbCs.$currentTdEst).trigger("click");
            }, 500);

        }, 500);

    });

    $(document).on("click", "#PlanesEmb .PP", function () {
        let Folio = $(this).attr("Folio");

        if (Folio && Folio != "") {
            PlanEmbCs.currentFolio = Folio;
            PlanEmbCs.PlaneEmbDetails();
        }
        else {
            console.error("Folio no recibido. PlanEmbCs.PlaneEmbDetails no se ejecutara..")
        }


    });

    //$(document).on("blur", ".inputOperador", function () {
    //    console.log("El input perdió el foco");
    //    PlanEmbCs.updateOperadoresFromTable()
    //});

    $(document).on('click', 'th.sortable', function () {

        const $th = $(this);
        const column = $th.attr('id');
        const order = $th.data('order');
        const $table = $th.closest('table');
        const $tbody = $table.find('tbody');

        // 🔄 Limpia iconos de otros headers
        $table.find('th.sortable .sort-icon').html('');

        const rows = $tbody.find('tr').get();

        rows.sort((a, b) => {

            let valA = $(a).find(`td[data-name="${column}"]`).text().trim();
            let valB = $(b).find(`td[data-name="${column}"]`).text().trim();

            if ($.isNumeric(valA) && $.isNumeric(valB)) {
                valA = parseFloat(valA);
                valB = parseFloat(valB);
            }

            return order === 'asc'
                ? (valA > valB ? 1 : valA < valB ? -1 : 0)
                : (valA < valB ? 1 : valA > valB ? -1 : 0);
        });

        // 🔁 Alternar orden
        const newOrder = order === 'asc' ? 'desc' : 'asc';
        $th.data('order', newOrder);

        // 🔼🔽 Icono visual
        $th.find('.sort-icon').html(
            newOrder === 'asc'
                ? '<i class="bi bi-arrow-bar-up fs-5 text-white"></i>'
                : '<i class="bi bi-arrow-bar-down fs-5 text-white"></i>'
        );

        // Reinsertar filas
        $.each(rows, (_, row) => $tbody.append(row));
    });

    //$(document).on('click', '.iconremoverowVentas', function (e) {
    //    $(this).closest('tr').remove();
    //});

    $(document).on('mousedown', '.iconremoverowVentas', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation(); // ⛔ más fuerte que stopPropagation

        $(this).closest('tr').remove();
    });




});
