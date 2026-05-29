class MonitorLog {
    constructor() {
        this.PlanEmb = [];
        this.PedidosInPP = [];
        this.PedidosCarga = [];
        this.CargasTerminadas = [];
        this.CargasCurso = [];
        this.Folio = "";
        this.TopScrollCargasCurso;
        //Guarda el conteo de recibos de produccion que llegan de ese pedido
        this.PedidosEnProduccion = {};

        this.bgEstatus =
        {
            "EN COLA": "status-cola",
            "EN PRODUCCIÓN": "status-proceso",
            "EN STOCK": "status-proceso",
            "PROCESO DE CARGA": "status-carga",
            "CARGADO": "status-terminado",
        }

        this.EstatusCarga = [];

        this.pollingActivo = false;
        this.pollingInterval = null;

        this.FacturasPedidos = [];
        this.RemisionadosPedidos = [];

    }

    //PASO 1-> CONSULTA DE PLANES EMBARQUES (ENCABEZADO)
    //Listado de planes de embarques
    PlanesEmb() {
        try {

            //PlanEmb/GetPlanesEmbarques
            let action = $("#PlanesEmbMasc").attr("action");

            let table = $("#PlanesEmbMasc").DataTable(
                {
                    processing: false,
                    serverSide: true,
                    bDestroy: true,
                    "ajax":
                    {
                        url: action,
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
                        $(row).addClass('PV');
                        // Agregar una clase personalizada a cada fila
                        $(row).attr("folio", data.Folio);
                    }
                });


            $(".buttons-excel").addClass("exceldownload");

            return table;
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible mostrar los planes de embarques: " + error, "Plan de embarques");
            StopLoading();

        }
    }

    //PASO 2-> CONSULTA DETALLE DE MONITOR
    async PlaneEmbDetails(showLoading = 1) {
        try {
            //Datos de PP
            // MonitorLog/GetPlanEmbDetailsByFolio
            let urlDetail = $("#mainML").attr("PlanEmb");

            if (showLoading == 1) Loading();

            let response = await $.ajax({
                url: urlDetail,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    usuario: sessionStorage.getItem("email"),
                    Folio: this.Folio
                }
            });


            //// !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA(VERSION TABLA)
            if (response.Status == "OK") {
                this.detenerPolling();

                let PlanV = JSON.parse(response.Message);
                let noAuth = JSON.parse(response.Other);
                let recibosPro = JSON.parse(response.Data2);

                //OBTENER RECIBOS DE PRODUCCION DE PEDIDOS
                this.setRecibosPro(recibosPro);

                //Obtener los datos
                this.PlanEmb = JSON.parse(response.Data);
                this.PedidosCarga = this.getPiezasByViajeUnidad(this.PlanEmb)
                console.log(this.PlanEmb);

                //Separar info en CargasCurso - CargasTerminadas
                this.dividirPedidosCargas(this.PlanEmb)

                //Pintar opciones local
                this.getOptionsLocal(this.PlanEmb);

                //Pintar opciones viaje
                this.getOptionsViaje(this.PlanEmb);

                //Llenar data en tablas
                this.renderTableCargasCurso(this.CargasCurso)
                this.renderTableCargasTerminadas(this.CargasTerminadas)



                //----- Mostrar Info de header plan
                let headerBitacora = JSON.parse(response.ExtraData);
                //$("#revisionPE").text(headerBitacora[0].Revision);
                $("#folioPE").text(headerBitacora[0].folio + '-' + headerBitacora[0].Revision);
                $("#fecha-documentoPE").text(headerBitacora[0].fecha);

                $(".detalleMonitor").removeClass("d-none");
                $(".monitorVacio").addClass("d-none");
                $("#textLocal").text('');
                $("#textViaje").text('');
            }
            else {

                if (response.Message.includes('No se encontró información')) {
                    LayoutCs.Alerta("Monitor Logística", response.Message, "Warning");
                }
                else {
                    LayoutCs.Alerta("Monitor Logística", response.Message);
                }
            }

            this.iniciarPolling();

            StopLoading();
        }
        catch (error) {
            LayoutCs.Excepcion("No es posible consultar el plan de produccion: " + error, "Plan de embarques");
            StopLoading();

        }
    }

    async OVDetail(DocEntryRow) {
        try {
            Loading();

            let ovdetails = $("#mainML").attr("OVDetails");

            let response = await $.ajax({
                url: ovdetails,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    DocEntry: DocEntryRow
                }
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (response.Status == "OK") {

                let DetailsOV = JSON.parse(response.Data);

                //Vefiricar si esta en proceso
                let faltaProducir = DetailsOV.some((e) => parseInt(e.PiezasProducidas) < parseInt(e.Rollos))
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
                let completo = DetailsOV.some((e) => parseInt(e.PiezasProducidas) >= parseInt(e.Rollos))
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
                $.each(DetailsOV, function (index, item) {

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

                    ML.subtabledetails += `<tr>
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

                $(`.rowML${DocEntryRow}`).after(
                    `
                       <tr id="rowML${DocEntryRow}child">
                       <td style="position:relative; border:none;" colspan="10">
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

    dividirPedidosCargas(data) {

        this.CargasTerminadas = [];
        this.CargasCurso = [];

        data.forEach((d) => {
            if (d.NumEstatusC == 6) {
                this.CargasTerminadas.push(d);
            }
            else {
                this.CargasCurso.push(d);
            }
        })

    }

    renderTableCargasCurso(data) {
        let tempRow = `<tr id = "{{attIdPedido}}" pedido = "{{attPedido}}" document = "{{docentry}}" class="rowML{{docentry}}">
                            <td class="{{bgcell}}">{{local}}</td>
                            <td class="{{bgcell}}">{{unidad}}</td>
                            <td class="{{bgcell}}">{{operador}}</td>
                            <td class="{{bgcell}}">{{numRollos}}</td>
                            <td class="{{bgcell}}">{{producto}}</td>
                            <td class="{{bgcell}}">{{cliente}}</td>
                            <td class="{{bgcell}} Estatus"><span class="status-badge {{bgEstatus}}">{{estatus}}</span>{{LINK}}</td>
                            <td class="AvanceCarga {{bgcell}}">
                                {{progress}}
                            </td>
                            <td class="{{bgcell}}">{{numPedido}}</td>
                            <td class="{{bgcell}} NoEntrega" >{{NoEntrega}}</td>
                            <td class="{{bgcell}}">{{stock}}</td>
                        </tr>`;
        //let bgEstatus =
        //{
        //    "EN COLA": "status-cola",
        //    "EN PRODUCCIÓN": "status-proceso",
        //    "EN STOCK": "status-proceso",
        //    "PROCESO DE CARGA": "status-carga",
        //    "CARGADO": "status-terminado",
        //}

        let filas = "";
        $("#CargasCurso tbody").empty();

        data.forEach((d) => {

            let colorC = ML.colorCita(d);

            let { LocalCarga, Unidad, Operador,
                PiezasEntrega, Articulo, Cliente,
                Estatus, Pedido, NumeroViaje, NumEstatusC, id,
                DocEntry, Stock, NoEntrega, NumRollos, PzsCargadas } = d;
            let enlace = "";
            let bgEst = ML.bgEstatus[Estatus];
            let { Existe, TotalPiezas, TotalPiezasCargadas } =
                this.findPiezasCargadas(Pedido, NumeroViaje, Unidad);

            //let barProgress = this.construirProgressBar(Pedido, TotalPiezas, TotalPiezasCargadas);
            let barProgress = this.construirProgressBar(Pedido, PiezasEntrega, PzsCargadas);

            let pedidoEncontrado = ML.PedidosInPP
                .find(p => (p.Pedido == Pedido && p.FolioPP != ""));

            if (pedidoEncontrado &&
                (NumEstatusC == 2 &&
                    Estatus != 'RECHAZADO' &&
                    Estatus != 'REPROGRAMADO' &&
                    Estatus != 'DEVOLUCIÓN' &&
                    Estatus != 'ENTREGADO' &&
                    Estatus != 'EN TRANSITO'
                )) {

                let folioPP = pedidoEncontrado.FolioPP;
                enlace = `<i 
                            pedido="${Pedido}"
                            folioPP="${folioPP}"
                            class="bi bi-arrow-up-right-square-fill ms-1 fs-5 goToPP"
                            style="color: #ef6c00; cursor: pointer;"></i>`;

                let recibosPro = getTotalRecibos(Pedido);

                let pzsE = PiezasEntrega;

                if (PiezasEntrega == 0) {
                    pzsE = parseInt(NumRollos);
                }


                barProgress = this.construirProgressBar(Pedido, pzsE, recibosPro);
            }


            filas += tempRow
                .replace("{{attIdPedido}}", "rowcc" + id) //Id de la fila
                .replace("{{local}}", cleanText(LocalCarga, "Local"))
                .replace("{{unidad}}", cleanText(Unidad, "Unidad"))
                .replace("{{operador}}", Operador)
                .replace("{{numRollos}}", PiezasEntrega)
                .replace("{{producto}}", Articulo)
                .replace("{{cliente}}", Cliente)
                .replace("{{estatus}}", Estatus)
                .replace("{{bgEstatus}}", bgEst)
                .replace("{{LINK}}", enlace)
                .replace("{{numPedido}}", Pedido)
                .replace("{{attPedido}}", Pedido)
                .replaceAll("{{docentry}}", DocEntry)
                .replace("{{progress}}", barProgress)
                .replace("{{stock}}", Stock)
                .replace("{{NoEntrega}}", NoEntrega)
                .replaceAll("{{bgcell}}", colorC)


        });

        $("#CargasCurso tbody").append(filas);
        $("#NumRegCargaCurso").text(`${data.length} registros`)

        //this.TopScrollCargasCurso
        if (this.TopScrollCargasCurso) this.TopScrollCargasCurso.destroy();

        if (data.length > 10) {
            this.TopScrollCargasCurso = new TopScrollTable(
                "CargasCurso",
                "containerCargasCurso",
                "scrollTopCargasCurso");
            this.TopScrollCargasCurso.createScroll();
            this.TopScrollCargasCurso.initScroll();
        }

    }

    addPedidoTerminado(data) {
        let tempRow = ` <tr>
                            <td class="{{bgcell}}">{{UNIDAD}}</td>
                            <td class="{{bgcell}}">{{OPERADOR}}</td>
                            <td class="{{bgcell}}">{{NPIEZAS}}</td>
                            <td class="{{bgcell}}">{{CLIENTE}}</td>
                            <td class="{{bgcell}}"><span class="status-badge status-terminado">{{ESTATUS}}</span></td>
                            <td class="{{bgcell}}">{{PEDIDO}}</td>
                            <td class="{{bgcell}}">{{HF}}</td>
                            <td class="{{bgcell}}">{{HCP}}</td>
                            <td class="{{bgcell}}">{{HCC}}</td>
                        </tr>`;


        let fila = "";

        let colorC = ML.colorCita(data);


        let { Unidad, Operador,
            PiezasEntrega, Cliente,
            Estatus, Pedido, HoraFactura,
            HoraCartaP } = data;


        let bgEst = this.bgEstatus[Estatus];

        HoraFactura = convertirAHora(HoraFactura);
        HoraCartaP = convertirAHora(HoraCartaP);


        fila = tempRow
            .replace("{{UNIDAD}}", cleanText(Unidad, "Unidad"))
            .replace("{{OPERADOR}}", Operador)
            .replace("{{NPIEZAS}}", PiezasEntrega)
            .replace("{{CLIENTE}}", Cliente)
            .replace("{{ESTATUS}}", Estatus)
            .replace("{{PEDIDO}}", Pedido)
            .replace("{{HF}}", HoraFactura)
            .replace("{{HCP}}", HoraCartaP)
            .replace("{{HCC}}", "---")
            .replaceAll("{{bgcell}}", colorC)

        this.CargasTerminadas.push(data);

        $("#CargasTerminadas tbody").append(fila);
        $("#NumRegCargaTerm").text(`${this.CargasTerminadas.length} registros`)
    }

    moverPedidoCCToCT(id, pedido, hf, remisionado) {

        let pc = this.CargasCurso.find((c) => c.id == id);
        if (pc) {

            if (remisionado) console.log(`IdPedido ${id} Pedido ${pedido} Remisionado ${remisionado}`)
            //Eliminar de vista
            $("#rowcc" + id).remove();

            //Eliminando del array
            this.CargasCurso = this.CargasCurso.filter((p) => p.id !== id);

            pc.HoraFactura = hf;
            pc.Estatus = 'FACTURADO';

            //Agregar pedido en vista
            this.addPedidoTerminado(pc);

            let EstatusC = ML.EstatusCarga.find((e) => e.Estatus == 'FACTURADO');
            let EC = EstatusC.Code.replace("A", "");

            //ACTUALIZAR ESTATUS EN BD
            this.updateEstPedido(id, EC);
        }

        console.log("Terminados");
        console.log(this.CargasTerminadas);

    }

    renderTableCargasTerminadas(data) {
        let tempRow = ` <tr>
                            <td class="{{bgcell}}">{{UNIDAD}}</td>
                            <td class="{{bgcell}}">{{OPERADOR}}</td>
                            <td class="{{bgcell}}">{{NPIEZAS}}</td>
                            <td class="{{bgcell}}">{{CLIENTE}}</td>
                            <td class="{{bgcell}}"><span class="status-badge {{bgEst}}">{{ESTATUS}}</span></td>
                            <td class="{{bgcell}}">{{PEDIDO}}</td>
                            <td class="{{bgcell}}">{{HF}}</td>
                            <td class="{{bgcell}}">{{NFR}}</td>
                            <td class="{{bgcell}}">{{HCP}}</td>
                            <td class="{{bgcell}}">{{HCC}}</td>
                        </tr>`;
        let bgEstatus =
        {
            "01": "status-cola",
            "02": "status-proceso",
            "03": "status-carga",
            "04": "status-carga",
            "05": "status-cola",
            "06": "status-cola",
            "07": "status-terminado",
            "08": "status-cola",
        }

        //REPROGRAMADO 01
        //EN TRANSITO   02
        //CON EL CLIENTE 03
        //EN DESCARGA 04
        //DEVOLUCIÓN 05
        //RECHAZADO 06
        //ENTREGADO 07
        //SIN CAPACIDAD 08

        let filas = "";
        $("#CargasTerminadas tbody").empty();

        data.forEach((d) => {

            let colorC = ML.colorCita(d);


            let {
                Unidad, Operador,
                PiezasEntrega, Cliente,
                Estatus, Pedido, HoraFactura,
                HoraCartaP, HoraCertificado,
                NumEstatusT, NumEstatusC, NumFactura,
                NoEntrega
            } = d;

            let bgEst = bgEstatus[NumEstatusT];

            if (!bgEst) bgEst = "status-carga";

            HoraFactura = convertirAHora(HoraFactura);
            HoraCartaP = convertirAHora(HoraCartaP);


            filas += tempRow
                .replace("{{UNIDAD}}", cleanText(Unidad, "Unidad"))
                .replace("{{OPERADOR}}", Operador)
                .replace("{{NPIEZAS}}", PiezasEntrega)
                .replace("{{CLIENTE}}", Cliente)
                .replace("{{ESTATUS}}", Estatus)
                .replace("{{bgEst}}", bgEst)
                .replace("{{PEDIDO}}", Pedido)
                .replace("{{HF}}", HoraFactura)
                .replace("{{NFR}}", NumFactura || NoEntrega || '')
                .replace("{{HCP}}", HoraCartaP)
                .replace("{{HCC}}", HoraCertificado)
                .replaceAll("{{bgcell}}", colorC)


        });

        $("#CargasTerminadas tbody").append(filas);
        $("#NumRegCargaTerm").text(`${data.length} registros`)
    }

    //INICIAR CONSULTA CONSTANTE PARA OBTENERS LOS FACTURADOS EN TIEMPO REAL
    iniciarPolling() {

        if (this.pollingInterval) return; // evita múltiples intervalos

        this.consultarFacturas(); // primera ejecución inmediata

        this.pollingInterval = setInterval(() => {
            this.consultarFacturas();
            //UPDATE INFO DE PEDIDOS EN PRODUCCION 
            this.getInfoPedidosInProduccion();
        }, 30000); // 30 segundos
    }

    detenerPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    async syncEstadoMonitor() {
        const LOCAL = $("#selectLocal").val();
        const VIAJE = $("#selectViaje").val();
        //0 -> No mostrar loading
        await this.PlaneEmbDetails(0);

        //FILTRAR NUEVAMENTE CON LOCAL Y VIAJE
        this.restaurarFiltros(LOCAL, VIAJE);
    }

    existeFilaFacturada(selectorTabla) {

        let existe = false;

        $(`${selectorTabla} tbody tr`).each(function () {

            let texto = $(this).find("td.Estatus").text().trim();
            let id = $(this).attr("id");

            if (texto.toUpperCase() === "FACTURADO") {
                console.warn("Fila Zombie " + id);
                existe = true;
                return false; // rompe el each
            }

        });

        return existe;
    }

    restaurarFiltros(Local, Viaje) {
        $("#selectLocal").val(Local);
        $("#selectViaje").val(Viaje);

        //LAZANDO EVENTO DE FILTROS
        $("#selectLocal").trigger("change");
        $("#selectViaje").trigger("change");
    }

    //VALIDA SÍ EXISTEN PEDIDOS CON ESTATUS FACURADO EN
    //CARGAS EN CURSO. EN CASO DE EXISTIR ALGUNO, SE SINCRONIZA NUEVAMENTE
    //TODA LA INFO, SIN QUE EL USUARIO LO DETECTE. 
    async checkZombieFactura() {
        let existeFactura = this.existeFilaFacturada("#CargasCurso");

        if (existeFactura) {
            console.warn("Factua Zombie detectada");
            console.warn("Sincronizando Plan Embarquqes");
            this.syncEstadoMonitor();
        }
    }

    //Consulta las facturas de forma constante
    //controlado por el Polling
    async consultarFacturas() {

        if (this.pollingActivo) return; // evita solapamientos
        this.pollingActivo = true;


        try {
            //MonitorLog/GetFacturasPedidosByFolio

            let UrlFacturas = $("#mainML").attr("GetFacturas");

            let response = await $.ajax({
                url: UrlFacturas,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    Folio: this.Folio
                }
            });

            if (response.Status == "OK") {
                let facturas = JSON.parse(response.Data);
                let remisiones = JSON.parse(response.ExtraData);

                //ACTUALIZA LOS PEDIDOS FACTURADOS
                updatePedidosFactura(facturas);
                //ACTUALIZA LOS PEDIDOS REMISIONADOS Y CON ENTREGA
                updatePedidosRemisionados(remisiones);
                //ACTUALIZA EL ESTATUS VISUAL DE CONEXION
                mostrarIndicadorConexion(true);

            }

            //this.pollingActivo = false; // SIEMPRE liberar

        }
        catch (error) {

            console.error("Error en polling:", error);

            if (!navigator.onLine) {
                console.warn("Sin conexión a internet");
                mostrarIndicadorConexion(false);
            }

        } finally {
            this.pollingActivo = false; // SIEMPRE se libera
        }

    }

    colorCita(d) {
        let { Cita, HoraInicio, HoraFin } = d;
        let HI = LayoutCs.parseHora(HoraInicio);
        let HF = LayoutCs.parseHora(HoraFin);
        let ahora = new Date();
        let color = "", horaCita = "";

        if (Cita == "Si") {

            if (HI != '--' && HF != '--') {
                horaCita = HF;
            }
            else if (HI != '--') {
                horaCita = HI;
            }
            else if (HF != '--') {
                horaCita = HF;
            }


            // --- Paso 1: parsear el string a horas y minutos
            let [horasStr, minutosStr] = horaCita.split(":");
            let horas = parseInt(horasStr, 10);
            let minutos = parseInt(minutosStr, 10);

            // --- Paso 2: crear un objeto Date con esa hora de hoy
            let horaObjetivo = new Date(ahora);
            horaObjetivo.setHours(horas, minutos, 0, 0);

            // --- Paso 3: calcular diferencia en milisegundos
            let diferenciaMs = horaObjetivo - ahora;

            // --- Paso 4: convertir a horas/minutos
            let diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
            let diferenciaMin = diferenciaMs / (1000 * 60);

            console.log("Diferencia en horas:", diferenciaHoras);
            //console.log("Diferencia en minutos:", diferenciaMin);

            if (diferenciaHoras <= 1) {
                color = "cell-danger"
            }
            else if (diferenciaHoras <= 3) {
                color = "cell-warning"
            }

        }

        return color;

    }

    construirProgressBar(Pedido, TotalPiezas, TotalPiezasCargadas) {

        let { low, high, optimum } = calcularAtributosMeter(parseInt(TotalPiezas));

        let label = `<label class="status-text"><strong id="PzsC${Pedido}">(${TotalPiezasCargadas} de ${TotalPiezas})</strong></label><br>`
        if (TotalPiezas == 0 || TotalPiezasCargadas == 0) label = "";

        let progressBar = `${label}
                 <meter class="progres-bar" id="Pro${Pedido}"
                        min="0" max="${TotalPiezas}" low="${low}" high="${high}"
                        optimum="${optimum}" value="${TotalPiezasCargadas}">
                 </meter>`;
        return progressBar;
    }

    getPiezasByViajeUnidad(pedidos) {
        return pedidos.reduce((acc, p) => {
            if (!acc[p.NumeroViaje]) {
                acc[p.NumeroViaje] = [
                    //{
                    //    Unidad: p.Unidad,
                    //    TotalPiezas: p.PiezasEntrega,
                    //    TotalPiezasCargadas: p.PzsCargadas,
                    //    Pedidos: [p.Pedido],
                    //},
                ];
            }

            let unidadExists = acc[p.NumeroViaje].find((u) =>
                (u.Unidad == p.Unidad) && (p.Unidad != ''));
            //console.log({unidadExists});

            if (unidadExists) {
                unidadExists.TotalPiezas += p.PiezasEntrega;
                unidadExists.TotalPiezasCargadas += p.PzsCargadas;
                unidadExists.Pedidos.push(p.Pedido);
            } else {
                acc[p.NumeroViaje].push({
                    Unidad: p.Unidad,
                    TotalPiezas: p.PiezasEntrega,
                    TotalPiezasCargadas: p.PzsCargadas,
                    Pedidos: [p.Pedido],
                });
            }

            return acc;
        }, {});
    }

    findPiezasCargadas(numPedido, numViaje, unidad) {
        let Unidad = this.PedidosCarga[numViaje].find((u) => u.Unidad == unidad);

        if (Unidad) {
            if (Unidad.Pedidos.includes(numPedido)) {
                return {
                    Existe: true,
                    TotalPiezas: Unidad.TotalPiezas,
                    TotalPiezasCargadas: Unidad.TotalPiezasCargadas,
                };
            } else {
                return { Existe: false, TotalPiezas: 0, TotalPiezasCargadas: 0 };
            }
        }

        return { Existe: false, TotalPiezas: 0, TotalPiezasCargadas: 0 };
    }

    async PlanesProduccionDetails(FolioPP, pedido) {
        //PlanProduccionDet
        try {
            //Datos de PP
            Loading();

            let UrlPP = $("#mainML").attr("PlanProduccionDet");

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
                LayoutCs.renderTableFromData({
                    data: data,
                    tableSelector: "#PlanProduccionML",
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

    async getInfoPedidosInProduccion() {

        //PlanEmb/GetPedidosInPP
        try {
            let urlPedidosInfo = $("#mainML").attr("PedidosInfo");
            //Loading();

            let response = await $.ajax({
                url: urlPedidosInfo,
                type: 'POST',
                dataType: 'JSON'
            });

            if (response.Status == "OK") {
                let data = JSON.parse(response.Data);
                ML.PedidosInPP = data;
            }
            else ML.PedidosInPP = [];

        } catch (error) {
            LayoutCs.Excepcion("No fue posible consultar los operadores: " + error, "Plan Embarques");
            ML.PedidosInPP = [];
            // StopLoading();
        }

    }

    getOptionsLocal(data) {
        let options = [];
        let tempOption = `<option value="{{VAL}}">{{TEXT}}</option>`
        let optionsHTML = `<option value="" selected>Todos...</option>`;

        data.forEach((d) => {
            let local = cleanText(d.LocalCarga, "Local");

            if (!options.includes(local) && local != "" && local) {
                options.push(local);
            }
        });

        options.sort().forEach((o) => {
            if (o) {
                optionsHTML += tempOption
                    .replace("{{VAL}}", o)
                    .replace("{{TEXT}}", o);
            }
        });

        $("#selectLocal").empty();
        $("#selectLocal").append(optionsHTML);
    }

    getOptionsViaje(data) {
        let options = [];
        let tempOption = `<option value="{{VAL}}">{{TEXT}}</option>`
        let optionsHTML = `<option value="" selected>Todos...</option>`;

        data.forEach((d) => {
            let viaje = d.NumeroViaje;

            if (!options.includes(viaje) && viaje != "") {
                options.push(viaje);
            }
        });

        options.sort().forEach((o) => {
            optionsHTML += tempOption
                .replace("{{VAL}}", o)
                .replace("{{TEXT}}", o);
        });

        $("#selectViaje").empty();
        $("#selectViaje").append(optionsHTML);
    }

    setRecibosPro(recibos) {
        this.PedidosEnProduccion = {};

        recibos.forEach(p => {
            this.PedidosEnProduccion[p.Pedido] = p.Recibos;
        });

        console.log(this.PedidosEnProduccion);
    }

    async getEstatusCarga() {

        //MonitorLog/GetEstatusCargaAut
        try {
            let urlEstatus = $("#mainML").attr("EstatusCarga");
            //Loading();

            let response = await $.ajax({
                url: urlEstatus,
                type: 'POST',
                dataType: 'JSON'
            });

            if (response.Status == "OK") {
                let data = JSON.parse(response.Data);
                this.EstatusCarga = data;
            }
            else this.EstatusCarga = [];

        } catch (error) {
            LayoutCs.Excepcion("No fue posible consultar los operadores: " + error, "Plan Embarques");
        }

    }

    async updateEstPedido(idPedido, idNewEst) {

        //MonitorLog/UpdateEstatus
        try {
            let urlUpdateEst = $("#mainML").attr("UpdateEstatusCarga");

            let response = await $.ajax({
                url: urlUpdateEst,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    id: idPedido,
                    idNuevoEst: idNewEst
                }
            });

            if (response.Status == "OK") {
                console.log("El estatus del pedido " + idPedido + " fue actualizado correctamente")
            }
            else {
                console.error("El pedido " + idPedido + " no se actualizo");
            }

        } catch (error) {
            LayoutCs.Excepcion("No fue posible actualizar el estatus del plan " + error, "Monitor Log");
            // StopLoading();
        }

    }
}

function convertirAHora(valor) {
    // Validar entrada
    if (valor === null || valor === undefined || isNaN(valor)) {
        return "---";
    }

    // Convertimos a string y rellenamos con ceros si falta
    let str = String(valor).padStart(6, "0");

    // Asegurarnos de que tenga exactamente 6 dígitos numéricos
    if (!/^\d{6}$/.test(str)) {
        return "Formato inválido";
    }

    // Extraemos partes
    let hh = parseInt(str.substring(0, 2), 10);
    let mm = parseInt(str.substring(2, 4), 10);
    let ss = parseInt(str.substring(4, 6), 10);

    // Validaciones de rango
    if (hh < 0 || hh > 23) return "Hora inválida";
    if (mm < 0 || mm > 59) return "Minuto inválido";
    if (ss < 0 || ss > 59) return "Segundo inválido";

    // Formateamos con dos dígitos
    let hora = String(hh).padStart(2, "0");
    let min = String(mm).padStart(2, "0");
    let seg = String(ss).padStart(2, "0");

    return `${hora}:${min}:${seg}`;


    // Ejemplos de uso
    //console.log(convertirAHora(92342));    // 👉 09:23:42
    //console.log(convertirAHora(190946));   // 👉 19:09:46
    //console.log(convertirAHora(null));     // 👉 "Valor inválido"
    //console.log(convertirAHora("abc123")); // 👉 "Formato inválido"
    //console.log(convertirAHora(246000));   // 👉 "Hora inválida"
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
function calcularAtributosMeter(maximo) {
    // Validaciones
    if (typeof maximo !== 'number' || !Number.isInteger(maximo) || maximo < 0) {
        throw new Error('El máximo debe ser un número entero positivo');
    }

    if (maximo == 0) {
        return {
            low: 0,
            high: 0,
            optimum: 0
        };
    }

    // Para valores muy pequeños, ajustamos a mínimos razonables
    if (maximo < 10) {
        return {
            low: Math.max(1, Math.floor(maximo * 0.3)),
            high: Math.max(3, Math.floor(maximo * 0.7)),
            optimum: Math.max(4, Math.floor(maximo * 0.8))
        };
    }

    // Cálculo normal para valores mayores
    const low = Math.floor(maximo * 0.3);
    const high = Math.floor(maximo * 0.7);
    const optimum = Math.floor(maximo * 0.8);

    // Aseguramos que low < high < optimum
    return {
        low: Math.min(low, high - 1),
        high: Math.min(high, optimum - 1),
        optimum: optimum
    };
}
function setNoEntrega(pedido, entrada) {
    let $fila = $('#CargasCurso tbody tr[pedido="' + pedido + '"]');

    if ($fila.length) {
        console.log('Fila encontrada');
        $fila.find("td.NoEntrega").text(entrada);

    } else {
        console.log('No existe ese pedido');
    }
}
function setNewRecibo(pedido) {

    if (ML.PedidosEnProduccion[pedido] === undefined) {
        ML.PedidosEnProduccion[pedido] = 1;
    } else {
        ML.PedidosEnProduccion[pedido]++;
    }

    return ML.PedidosEnProduccion[pedido];
}
function getTotalRecibos(pedido) {
    return ML.PedidosEnProduccion[pedido] ?? 0;
}
function updatePedidosRemisionados(remisiones) {

    remisiones.forEach((f) => {
        if (!ML.RemisionadosPedidos[f.IdPedido]) {
            ML.RemisionadosPedidos[f.IdPedido] = {
                Pedido: f.OV_DocNum,
                LibRem: f.LibRem
            }

            ML.moverPedidoCCToCT(
                f.IdPedido, f.OV_DocNum,
                "", f.LibRem);
        }
    })

    console.log("REMISIONADOS:");
    console.log(ML.RemisionadosPedidos);
}
function updatePedidosFactura(facturas) {

    facturas.forEach((f) => {
        if (!ML.FacturasPedidos[f.IdPedido]) {
            ML.FacturasPedidos[f.IdPedido] = {
                Pedido: f.OV_DocNum,
                Factura: f.Factura_DocNum,
                HoraFactura: f.HoraFactura
            }

            ML.moverPedidoCCToCT(f.IdPedido, f.OV_DocNum, f.HoraFactura)
        }
    });

    ML.checkZombieFactura();

    console.log("FACTURAS:");
    console.log(ML.FacturasPedidos);
}
function updateProgressoPro(articulo, sisnum, lote) {
    let dataLote = JSON.parse(lote);
    let data = dataLote[0];

    if (data) {
        let pedido = data.PedidoV;
        let OVdata = ML.CargasCurso.find((d) => d.Pedido == pedido);

        let $fila = $('#CargasCurso tbody tr[pedido="' + pedido + '"]');

        if ($fila.length && OVdata) {
            console.log('Fila encontrada');
            let $tdEstatus = $fila.find("td.AvanceCarga");

            // Obtener el elemento meter y cambiar sus atributos
            let $label = $tdEstatus.find("label");
            let $meter = $tdEstatus.find("meter");
            let recibos = setNewRecibo(pedido);

            //En caso de que no este originalmente en progreso ca
            if ($label.length == 0) {
                let barraProgreso = ML.construirProgressBar(pedido, OVdata.PiezasEntrega, recibos);
                $tdEstatus.text("");
                $tdEstatus.html(barraProgreso);
            }
            else {
                //Se actualiza los datos
                let $textPzs = $tdEstatus.find("strong");

                $textPzs.text(`(${recibos} de ${OVdata.PiezasEntrega})`);
                let { low, high, optimum } = calcularAtributosMeter(parseInt(OVdata.PiezasEntrega));

                // Cambiar múltiples atributos a la vez
                $meter.attr({
                    'value': recibos,
                    'min': 0,
                    'max': OVdata.PiezasEntrega,
                    'low': low,
                    'high': high,
                    'optimum': optimum
                });

                let numFull = OVdata.PiezasEntrega;
                //numFull = 5;
                //PRODUCCION TERMINADA
                if (recibos >= numFull) {
                    //ACTUALIZAR A STOCK
                    setTimeout(() => {
                        let bgEst = ML.bgEstatus['EN STOCK'];
                        let $tdEstatus = $fila.find("td.Estatus");

                        //CAMBIO DE TEXTO Y COLOR
                        $tdEstatus.find("span").text('EN STOCK');
                        $tdEstatus.find("span").removeClass('status-proceso');
                        $tdEstatus.find("span").addClass(bgEst);

                        //ELIMINANDO ENLACE A PLAN PRODUCCION 
                        $tdEstatus.find("i").remove();

                        let idFila = $fila.attr("id");
                        let idPedido = idFila.replace("rowcc", "");
                        let EstatusC = ML.EstatusCarga.find((e) => e.Estatus == 'EN STOCK');
                        let EC = EstatusC.Code.replace("A", "");
                        //ACTUALIZAR EN BD
                        ML.updateEstPedido(idPedido, EC);
                    }, 3000);

                }
            }

        } else {
            console.log('No existe ese pedido en cargas en curso');
        }
    }

}
function initHubProgesoCarga() {

    var hub = $.connection.progresoCargaHub;
    var hubTendPesos = $.connection.dashTendPesosHub;
    var hubEntregas = $.connection.entregasMercanciaHub;
    var hubEstPedidos = $.connection.estatusEnvioHub;

    /* ==============================
       EVENTOS DE NEGOCIO
    ============================== */

    hub.client.actualizarPlanEmb = function (Id, pedido, NumViaje, Unidad, TPzsEntrega, TPzsCargadas) {
        console.log("SignalR → actualizarPlanEmb");
        UpdateProgressPedido(Id, pedido, NumViaje, Unidad, TPzsEntrega, TPzsCargadas);
    };

    hubEntregas.client.nuevaEntrega = function (IdPedido, Pedido, Entrada) {
        console.log("SignalR → nuevaEntrega");
        setNoEntrega(Pedido, Entrada);
    };

    hubTendPesos.client.updateTendencias = function (articulo, sisnum, lote) {
        console.log("SignalR → updateTendencias");
        updateProgressoPro(articulo, sisnum, lote);
    };

    hubEstPedidos.client.changeEstatusPedido = function (Id, pedido, folio) {
        console.log(`Actualización de envio Id : ${Id} , Pedido: ${pedido}, Folio: ${folio}`);
        //Sincronizando estado desde el back
        ML.syncEstadoMonitor();
    };

    /* ==============================
       MANEJO DE CONEXIÓN
    ============================== */

    $.connection.hub.reconnecting(function () {
        console.warn("⚠ SignalR reconectando...");
        mostrarIndicadorConexion(false);
    });

    $.connection.hub.reconnected(function () {
        console.info("🟢 SignalR reconectado");
        mostrarIndicadorConexion(true);

        // 🔥 CLAVE: reconciliar estado
        ML.syncEstadoMonitor();
    });

    $.connection.hub.disconnected(function () {
        console.error("🔴 SignalR desconectado");

        mostrarIndicadorConexion(false);

        // Reintento manual
        setTimeout(function () {
            console.log("Intentando reconectar...");
            $.connection.hub.start();
        }, 5000);
    });

    /* ==============================
       INICIAR CONEXIÓN
    ============================== */

    $.connection.hub.start()
        .done(function () {
            console.log("🟢 Conectado → Monitor Progreso Carga");
            mostrarIndicadorConexion(true);
        })
        .fail(function (err) {
            console.error("Error inicial SignalR:", err);
        });
}
function mostrarIndicadorConexion(activo) {

    if (activo) {
        $("#estadoConexion")
            .removeClass("bg-danger")
            .addClass("bg-success")
            .text("Conectado");
    } else {
        $("#estadoConexion")
            .removeClass("bg-success")
            .addClass("bg-danger")
            .text("Reconectando...");
    }
}

function UpdateProgressPedido(id, pedido, NumViaje, Unidad, TPzsEntrega, TPzsCargadas) {


    let idTabla = "CargasCurso";
    //let $row = $(`#${idTabla} tr[pedido='${pedido}']`);
    let $row = $(`#rowcc${id}`);

    let $tdEstatus = $($row).find("td.AvanceCarga");
    let $tdEstatustText = $($row).find("td.Estatus");

    if (!$tdEstatustText.find("span").hasClass("status-carga") &&
        !$tdEstatustText.find("span").hasClass("status-terminado")) {
        //El estatus ya se cambio en el backend por lo tanto se actualiza en la vista
        $tdEstatustText.empty();
        $tdEstatustText.append(`<span class="status-badge status-carga">PROCESO DE CARGA</span>`);
    }

    // Obtener el elemento meter y cambiar sus atributos
    let $label = $tdEstatus.find("label");
    let $meter = $tdEstatus.find("meter");

    //En caso de que no este originalmente en progreso ca
    if ($label.length == 0) {
        let barraProgreso = ML.construirProgressBar(pedido, TPzsEntrega, TPzsCargadas);
        $tdEstatus.text("");
        $tdEstatus.html(barraProgreso);
    }
    else {
        //Se actualiza los datos
        let $textPzs = $tdEstatus.find("strong");

        $textPzs.text(`(${TPzsCargadas} de ${TPzsEntrega})`);
        let { low, high, optimum } = calcularAtributosMeter(parseInt(TPzsEntrega));

        // Cambiar múltiples atributos a la vez
        $meter.attr({
            'value': TPzsCargadas,
            'min': 0,
            'max': TPzsEntrega,
            'low': low,
            'high': high,
            'optimum': optimum
        });
    }

    let terminado = (TPzsEntrega > 0 && TPzsCargadas > 0 && TPzsEntrega == TPzsCargadas);

    //terminado = true;

    //Carga terminada
    if (terminado) {

        setTimeout(() => {
            $tdEstatustText.empty();
            $tdEstatustText.append(`<span class="status-badge status-terminado">CARGADO</span>`);

            let idFila = $row.attr("id");
            let idPedido = idFila.replace("rowcc", "");
            let EstatusC = ML.EstatusCarga.find((e) => e.Estatus == 'CARGADO');
            let EC = EstatusC.Code.replace("A", "");
            //ACTUALIZAR EN BD
            ML.updateEstPedido(idPedido, EC);
        }, 3000);


    }
}

//LayoutCs.validarUsuarios(["Log\u00EDstica", "Ventas"]);

const ML = new MonitorLog();


async function iniciar() {

    await ML.getInfoPedidosInProduccion()
    await ML.getEstatusCarga();
    //console.log(ML.PedidosInPP);
    await ML.PlanesEmb();


}


$(function () {

    initHubProgesoCarga();
    iniciar();

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

            LayoutCs.updateHeaderISO("Monitor", fl, fr, code, nivel, rev);
            //PlanEmbCs.updateHeader(fl, fr, code, nivel);
        });
    }
    else {
        //Eliminar elementos que no corresponden a usuario
        $(".EditRow").remove();
        $(".btnSave").remove();
        $(".btnEditHead").remove();
    }

    $(window).on('beforeunload', ML.detenerPolling);


    $("#selectLocal").on("change", function () {
        let local = $(this).val();
        let viaje = $("#selectViaje").val();

        let dataLocal = [];
        $("#textLocal").text(`Local ${local}`);

        if (local != "") {
            dataLocal = ML.PlanEmb.filter((p) => (cleanText(p.LocalCarga, "Local") == local));
        }
        else {
            dataLocal = ML.PlanEmb;
        }


        if (viaje != "") {
            dataLocal = dataLocal.filter((p) =>
                (p.NumeroViaje == viaje));
        }



        ML.dividirPedidosCargas(dataLocal);

        //Llenar data en tablas
        ML.renderTableCargasCurso(ML.CargasCurso)
        ML.renderTableCargasTerminadas(ML.CargasTerminadas)

    });

    $("#selectViaje").on("change", function () {
        let viaje = $(this).val();
        let local = $("#selectLocal").val();
        let dataViaje = [];
        $("#textViaje").text(`Viaje ${viaje}`);

        if (viaje != "") {
            dataViaje = ML.PlanEmb.filter((p) =>
                (p.NumeroViaje == viaje));
        }
        else {
            dataViaje = ML.PlanEmb;
        }

        if (local != "") {
            dataViaje = dataViaje.filter((p) => (cleanText(p.LocalCarga, "Local") == local));
        }


        ML.dividirPedidosCargas(dataViaje);

        //Llenar data en tablas
        ML.renderTableCargasCurso(ML.CargasCurso)
        ML.renderTableCargasTerminadas(ML.CargasTerminadas)

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

            ML.PlanesProduccionDetails(folioPP, pedido);

        } catch (Error) {
            LayoutCs.Alerta("Link plan producción", Error, "Warning");
        }
    });

    $("#closePlanPro").on("click", function () {
        $("#modalPlanPro").modal("hide");
    });

    $(document).on('click', '#CargasCurso tr', function (event) {
        try {

            let DocEntryOV = $(this).attr("document"); //DOCENTRY

            //Para pedidos de contenedores
            if (/[a-zA-Z]/.test(DocEntryOV)) {
                return;
            }

            //Obtener url consulta
            let isShow = $(this).attr("isShowChild");



            if (isShow == "1") {
                $(`#rowML${DocEntryOV}child`).remove();
                // Quitar clase PPselected de todas las filas
                $('#CargasCurso tbody tr').find('td').removeClass('OVselected');
                // Quitar el ícono de flecha derecha de todas las filas
                $('#CargasCurso tbody tr').find('td:first-child .fa-arrow-right').remove();

                $(this).attr("isShowChild", "0");
            }
            else {
                //realizar peticion para obtener detalles
                ML.OVDetail(DocEntryOV);
                // Quitar clase PPselected de todas las filas
                $('#CargasCurso tbody tr').find('td').removeClass('OVselected');
                // Quitar el ícono de flecha derecha de todas las filas
                $('#CargasCurso tbody tr').find('td:first-child .fa-arrow-right').remove();
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

    $(document).on("click", "#PlanesEmbMasc .PV", function () {
        let pvFolio = $(this).attr("folio");
        ML.Folio = pvFolio;
        ML.PlaneEmbDetails();
    });

});