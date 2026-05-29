class MascPlan {
    constructor() {
        this.TablasEditables = [];
        this.EstatusCargaHTML = "";
        this.EstatusCarga = [];
        this.ListaViajes = [];
        this.dataViajes = [];
        this.$currentTdEst;
        this.currenStatus = "";
        this.oldEst = "";
        this.pzsCargadas = {};
        this.folioAct = "";
        this.Folio = "";

        this.colorStatus = {
            'ENTREGADO': 'bg-success text-white',
            'EN TRANSITO': 'bg-warning',
        }
    }

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
            LayoutCs.Excepcion("No es posible mostrar los planes de producción: " + error, "Plan de producción");
            StopLoading();

        }
    }

    async getMascPlan() {

        //PlanEmb/GetMascPlanEmbFolio
        try {
            let urlMasc = $("#bodyMasc").attr("DetalleMasc");
            Loading();

            let response = await $.ajax({
                url: urlMasc,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    FolioPlanEmb: this.Folio
                }
            });

            if (response.Status == "OK") {

                let planAct = JSON.parse(response.ExtraData);
                let headerB = JSON.parse(response.Other);

                //Validar si se ha creado un plan de embarques
                if (!planAct[0].PlanEmbCreado) {

                    LayoutCs.Alerta(
                        "Seguimiento Plan",
                        "Aun no se ha generado un plan de embarques",
                        "Warning");

                    StopLoading();
                    return;
                }

                this.folioAct = planAct[0].folio;

                if (headerB.length > 0) {
                    //$("#revisionPE").text(headerB[0].Revision);
                    $("#folioPE").text(headerB[0].folio + '-' + headerB[0].Revision);
                    $("#fecha-documentoPE").text(headerB[0].fecha);
                }
                else {
                    console.error("Información de encabezado (Revision, Folio, Fecha) plan vacia.")
                }

                let data = JSON.parse(response.Data);
                this.dataViajes = data;
                this.ListaViajes = this.listaViajesTodos(data);
                this.pzsCargadas = this.getPiezasByViajeUnidad(data);
                //console.log(this.dataViajes);
                //console.log(this.ListaViajes);
                this.ListaViajes = ordenarPedidos(this.ListaViajes);

                this.pintarTabs(this.ListaViajes);
                this.pintarViajes(this.ListaViajes);

                $(".mascaraPlan").removeClass("d-none");
                $(".planVacio").addClass("d-none");

            } else {
                LayoutCs.Alerta("Seguimiento Plan", "Error al consultar plan embarques : " + response.Message, "Warning")
            }

            StopLoading();


        } catch (error) {
            if (this.anydata.Message.includes('No se encontró información')) {
                LayoutCs.Alerta("Plan de embarques", this.anydata.Message, "Warning");
            }
            else {
                LayoutCs.Excepcion("No fue posible consultar los operadores: " + error, "Plan Embarques");
            }
            return [];
            StopLoading();
        }


    }

    contruirTab(numViaje, active) {

        let tempTapViaje =
            `<li class="nav-item">
              <button
                class="nav-link {{Activo}}"
                id="{{IdTab}}"
                data-bs-toggle="tab"
                data-bs-target="#{{IdRef}}"
                type="button"
                role="tab"
              >
                {{NumViaje}}
              </button>
            </li>`;

        let idViaje = this.getIdViaje(numViaje);
        let numero = parseInt(numViaje);
        let textV = "VIAJE";

        if (isNaN(numero)) textV = "";


        return tempTapViaje
            .replace("{{Activo}}", active)
            .replace("{{NumViaje}}", `${idViaje.toUpperCase()} ${textV}`)
            .replace("{{IdTab}}", `${idViaje}-tab`)
            .replace("{{IdRef}}", idViaje)
    }

    contruirTablaUnidad(idViaje, numViaje, codeUnidad, data) {

        //console.log(data);

        let tempTableUnidad =
            `<div class="mx-2 mb-2">
                        <h5 class="titulo-seccion">{{TUNIDAD}}</h5>
                        <div class="table-responsive">
                            <table id="{{IDTABLA}}" codeUni = "${codeUnidad}" numViaje="${numViaje}" class="table table-sm" style="min-width: 1200px !important;">
                                <thead>
                                    <tr>
                                        <th width="134px">Unidad</th>
                                        <th width="168px">Pedido</th>
                                        <th width="340px">Nombre del Cliente</th>
                                        <th width="200px">Estatus</th>
                                        <th>Personal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {{FILAS}}
                                </tbody>
                            </table>
                        </div>
                    </div>`;

        let FILAS = "";


        //Mostrar los que tengan mas de un pedido
        let unidades = this.seccionarUnidades(data);
        let keysUnidades = Object.keys(unidades);

        keysUnidades.forEach((u) => {

            let d = unidades[u][0];
            let numUni = unidades[u].length;
            let icono = "";

            if (numUni > 1) {
                icono = `<i 
                    idUnidad="${u}" 
                    class="bi bi-list-check ms-2 showAllP fs-5"
                    style="position:absolute; left:0; bottom:0; cursor:pointer;"></i>`;
            }

            //let entregado = "";

            //if () {
            //    entregado = "bg-entregado"
            //}

            let editEst = "";
            let htmlProgressBar = "";

            if (d.NumEstatus == 4) {

                let { Existe, TotalPiezas, TotalPiezasCargadas } = this.findPiezasCargadas(d.Pedido, numViaje, u);
                htmlProgressBar = this.construirProgressBar(d.Pedido, TotalPiezas, TotalPiezasCargadas);
            }
            else {
                editEst = "CustomEstatusCarga";
            }

            let bgEstatus = this.colorStatus[d.Estatus];

            if (!bgEstatus) bgEstatus = "";

            FILAS += `<tr idppd = ${d.id}>
                         <td class="unidad-col Unidad" style="position:relative;">
                            ${icono}
                            ${u}
                         </td>
                         <td class="Pedido">${d.Pedido}</td>
                         <td>${d.Cliente}</td>
                         <td class="EstatusCarga ${editEst} ${bgEstatus}">${d.Estatus != "PROCESO DE CARGA" ? d.Estatus : htmlProgressBar}</td>
                         <td>${d.Operador}</td>
                     </tr>`
        });

        let tipoUnidad = LayoutCs.getTipoUnidad(codeUnidad);

        //IDTABLA =  `Table_${idViaje}_${tipoUnidad.replace(" ","_")}`

        return tempTableUnidad
            .replace("{{TUNIDAD}}", tipoUnidad)
            .replace("{{IDTABLA}}", `Table_${idViaje}_${tipoUnidad.replace(" ", "_")}`)
            .replace("{{FILAS}}", FILAS);

    }

    construirProgressBar(Pedido, TotalPiezas, TotalPiezasCargadas) {

        let { low, high, optimum } = calcularAtributosMeter(parseInt(TotalPiezas));


        let progressBar = `<label class="status-text">PROCESO DE CARGA <strong id="PzsC${Pedido}">(${TotalPiezasCargadas} de ${TotalPiezas})</strong></label>
                 <meter class="progres-bar" id="Pro${Pedido}"
                        min="0" max="${TotalPiezas}" low="${low}" high="${high}"
                        optimum="${optimum}" value="${TotalPiezasCargadas}">
                 </meter>`;
        return progressBar;
    }

    getIdViaje(numViaje) {

        let listIds =
        {
            '1': 'primer',
            '2': 'segundo',
            '3': 'tercer',
            '4': 'cuarto'
        };

        let idViaje = listIds[numViaje];

        if (idViaje) {
            return idViaje;
        }
        else {
            return numViaje;
        }
    }

    pintarTabs(listViajes) {
        let taps = "";
        $("#viajesTabs").empty();


        listViajes.forEach((v, index) => {

            let activo = "";

            if (index == 0) activo = "active";

            let newTap = this.contruirTab(v.NumeroViaje, activo);
            taps += newTap;
        })

        $("#viajesTabs").append(taps);
    }

    pintarViajes(listViajes) {
        let viajes = "";
        $("#viajesTabsContent").empty();

        let idsViajes = [];

        listViajes.forEach((v, index) => {

            if (v.NumeroViaje && v.NumeroViaje != "") {
                let active = "";
                let idViaje = MP.getIdViaje(v.NumeroViaje);
                idsViajes.push(idViaje);
                let numViaje = v.NumeroViaje;
                const Unidades = Object.keys(v.Unidades);

                if (index == 0) active = "show active";

                let tablasViaje = `<div class="tab-pane fade ${active}" id="${idViaje}" role="tabpanel">`;

                Unidades.forEach((U) => {
                    let data = v.Unidades[U];

                    let tabla = MP.contruirTablaUnidad(idViaje, numViaje, U, data);

                    tablasViaje += tabla;
                });

                tablasViaje += "</div >";

                viajes += tablasViaje;
            }
            else {
                console.warn("Hay elementos con el viaje vacio");
                console.table(v);
            }


        });

        $("#viajesTabsContent").append(viajes);

        //Hacer editables las tablas de viajes
        idsViajes.forEach((id) => {
            MP.MakeTableEditableWithBitacora(id);
        });

    }

    //Extrae los pedidos seccionados por viaje y tipo unidad
    listaViajes(mascaraPlan, numeroViaje) {
        return mascaraPlan.filter(item => item.NumeroViaje === numeroViaje)
            .sort((a, b) => a.Orden - b.Orden)
            .reduce((odj, p) => {
                odj[p.TipoUnidad] = odj[p.TipoUnidad] || [];
                odj[p.TipoUnidad].push({
                    id: p.id,
                    DocEntry: p.DocEntry,
                    Unidad: p.Unidad,
                    Pedido: p.Pedido,
                    Cliente: p.Cliente,
                    Operador: p.Operador,
                    NumEstatus: p.NumEstatus,
                    Estatus: p.Estatus,
                    Orden: p.Orden
                });

                return odj;
            }, {});
    }

    listaViajesTodos(mascaraPlan) {
        let listV = mascaraPlan.map(item => item.NumeroViaje.trim());
        listV = [...new Set(listV)];
        listV = listV.sort((a, b) => a - b);

        return listV.map(numeroViaje => {
            return {
                NumeroViaje: numeroViaje,
                Unidades: this.listaViajes(mascaraPlan, numeroViaje)
            };
        });

        //Retorna la siguiente estructura:
        //[
        //    { NumeroViaje: '1', Unidades: { C1: [Array], CAM1: [Array] } },
        //    { NumeroViaje: '3', Unidades: { C1: [Array] } },
        //    { NumeroViaje: '2', Unidades: { CAM1: [Array] } }
        //]
    }

    seccionarUnidades(data) {
        return data.reduce((acc, pedido) => {
            acc[pedido.Unidad] = acc[pedido.Unidad] || [];
            acc[pedido.Unidad].push({
                id: pedido.id,
                DocEntry: pedido.DocEntry,
                Pedido: pedido.Pedido,
                Cliente: pedido.Cliente,
                Operador: pedido.Operador,
                Estatus: pedido.Estatus,
                NumEstatus: pedido.NumEstatus,
                Orden: pedido.Orden
            });
            return acc;
        }, {});
    }

    getPedidosByUnidad(numViaje, codeUnidad, idUnidad) {

        let viaje = this.ListaViajes.find(item => item.NumeroViaje === numViaje);
        if (!viaje) return [];

        let unidades = viaje.Unidades[codeUnidad];
        if (!unidades) return [];

        return unidades.filter(item => item.Unidad === idUnidad);
    }

    contruirTableAllPedidos(numViaje, codeUnidad, idUnidad) {

        try {
            //TableAllPedidos
            $("#TableAllPedidos").find("tbody").empty();

            let pedidos = this.getPedidosByUnidad(numViaje, codeUnidad, idUnidad);
            let FILAS = "";

            pedidos.forEach((p) => {

                FILAS += `<tr>
                         <td>${p.Pedido}</td>
                         <td>${p.Cliente}</td>
                         <td>${p.Operador}</td>
                     </tr>`
            });

            $("#TableAllPedidos").find("tbody").append(FILAS);

            return true;
        }
        catch (E) {
            LayoutCs.Alerta("Tabla Pedidos Unidad", "Error el contruir tabla de pedidos", "Warning");
            console.error(E);

            return false;

        }





    }

    async getEstatusCarga() {

        //GetEstatusCarga

        try {
            let urlEstatus = $("#bodyMasc").attr("EstatusCarga");
            //Loading();

            let response = await $.ajax({
                url: urlEstatus,
                type: 'POST',
                dataType: 'JSON'
            });

            if (response.Status == "OK") {
                let data = JSON.parse(response.Data);
                let opciones = "";

                data.forEach((d) => {
                    opciones += `<option code="${d.Code}" value="${d.Estatus}">${d.Estatus}</option>`
                });

                MP.EstatusCargaHTML = opciones;
                MP.EstatusCarga = data;
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

    async MakeTableEditableWithBitacora(table) {

        try {
            console.log("Id Tabla Editable: " + table);


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

                        return valor;
                    }
                }
            });

            advancedEditor.SetEditableClass("editMeNum", {
                internals: {
                    renderEditor: (elem, oldVal) => {

                        // Crear un input sin espacios extra
                        $(elem).html(`<input type="number" class="form-control" value="${oldVal.trim()}" min="0">`);


                    },
                    extractEditorValue: (elem) => {

                        let valido = true;

                        //Validacion cantidad piezas
                        if ($(elem).hasClass("PiezasEntrega")) {
                            valido = this.validarPiezas(elem);
                        }


                        if (valido) {
                            return $(elem).find('input').val().trim();
                        }
                        else {
                            return "0"
                        }


                    }
                }
            });



            advancedEditor.SetEditableClass("CustomEstatusCarga", {
                internals: {
                    renderEditor: (elem, oldVal) => {

                        //$(elem).html(`<select class="form-select mt-2" aria-label="EstatusCarga">
                        //              ${this.EstatusCargaHTML}
                        //            </select>`);
                        //$("select option").filter(function () {
                        //    return $(this).val() == oldVal;
                        //}).prop('selected', true);

                        let oldOption = `<option code="" value="${oldVal}">${oldVal}</option>`;

                        const $select = $(`
                            <select class="form-select mt-2" aria-label="EstatusCarga">
                                ${this.EstatusCargaHTML.includes(oldVal) ? this.EstatusCargaHTML : oldOption + this.EstatusCargaHTML }
                            </select>
                        `);

                        MP.oldEst = oldVal;


                        // Seleccionar valor actual
                        $select.val(oldVal);

                        // EVENTO CHANGE 👇
                        $select.on('change', function () {
                            const nuevoValor = $(this).val();
                            console.log('Estatus cambiado a:', nuevoValor);

                            const $td = $(elem);
                            const $tr = $td.closest('tr');
                            const idFila = $tr.attr('idppd');
                            const pedido = $tr.find("td.Pedido").text().trim();
                            let reqComments = reqEstComents(nuevoValor);

                            if (reqComments) {

                                MP.$currentTdEst = $td;

                                setTimeout(() => {
                                    showModalEstatus(idFila, nuevoValor, pedido)
                                }, 100);
                            }
                            else {
                                MP.updateEstPedido(idFila, nuevoValor, "");
                            }

                           
                        });

                        $(elem).html($select);

                    },
                    extractEditorValue: (elem) => {
                        let valor = $(elem).find('select').val();

                        const $td = $(elem);
                        const $tr = $td.closest('tr');

                        let bg = this.colorStatus[valor];

                        $td.removeClass('bg-success');
                        $td.removeClass('bg-warning');
                        $td.removeClass('text-white');

                        if (bg) {

                            $td.addClass(bg);
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
            $("#" + table).on('change', '.editMe, .TimeField, .DateField,.EstatusProduccionData, .editLinea', function () {
                var cell = $(this).closest('td'); // Obtener la celda más cercana
                var cellName = cell.data('id'); // Asumiendo que existe un atributo 'data-id'
                var cellOldValue = cell.html();
                if (cellName && !ConsultaEdicionPVCs.historymodified.includes(cellName)) {
                    ConsultaEdicionPVCs.historymodified += cellName + "\n";
                }
                cell.addClass("sendOV")
            });

        } catch (error) {
            console.error(error);
        }


    }

    async updateEstPedido(idPedido, estatus, comentario) {
        try {

            //PlanEmb/UpdateEstPedidoPlanEmb
            let urlUpdatEst = $("#bodyMasc").attr("UpdateEstPedido");

            console.log(this.EstatusCarga)

            let codeEst = this.EstatusCarga.find((est) => est.Estatus == estatus);

            if (!codeEst) {
                LayoutCs.Alerta("Estatus carga", "El estatus no es valido", "Warning");
                return;
            }


            let res = await $.ajax({
                url: urlUpdatEst,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    Id: idPedido,
                    Est: codeEst.Code,
                    DescEst:codeEst.Estatus,
                    Comentario: comentario
                }
            });

            if (res.Status == "OK") {
                LayoutCs.Alerta("Actualzación estatus",
                    "El estatus fue actualizado correctamente ✅", "OK");
            }
            else {
                LayoutCs.Alerta("Actualzación estatus",
                    "❌ Error al actualizar el estatus del pedido: " + res.Message,
                    "Warning");
            }


        } catch (E) {

        }
    }

    getPedidoInData(pedido) {
        let elemento = this.dataViajes.find((d) => d.Pedido == pedido);
        return elemento
    }

    getIdTabla(objPedido) {
        //IDTABLA =  `Table_${idViaje}_${tipoUnidad.replace(" ","_")}`
        let numViaje = objPedido.NumeroViaje;
        let idViaje = this.getIdViaje(numViaje);
        let tipoUnidad = LayoutCs.getTipoUnidad(objPedido.TipoUnidad);

        return `Table_${idViaje}_${tipoUnidad.replace(" ", "_")}`
    }

    getPiezasByViajeUnidad(pedidos) {
        return pedidos.reduce((acc, p) => {
            if (!acc[p.NumeroViaje]) {
                acc[p.NumeroViaje] = [
                    {
                        Unidad: p.Unidad,
                        TotalPiezas: p.PiezasEntrega,
                        TotalPiezasCargadas: p.PzsCargadas,
                        Pedidos: [p.Pedido],
                    },
                ];
            }

            let unidadExists = acc[p.NumeroViaje].find((u) => u.Unidad == p.Unidad);
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
        let Unidad = this.pzsCargadas[numViaje].find((u) => u.Unidad == unidad);

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

    async finalizarPlanEmb() {
        try {

            let urlUpdatEst = $("#bodyMasc").attr("FinalizarPlanEmb");
            Loading();

            let res = await $.ajax({
                url: urlUpdatEst,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    Folio: this.folioAct,
                }
            });

            if (res.Status == "OK") {
                LayoutCs.Alerta("Cerrando Plan Embarques",
                    "El plan de embarques fue finalizado ✅",
                    "OK");
            }
            else {
                LayoutCs.Alerta("Cerrando Plan Embarques",
                    "❌ Error al finalizar plan embarque : " + res.Message,
                    "Warning");
            }
            StopLoading();

        } catch (E) {
            LayoutCs.Alerta("Cerrando Plan Embarques",
                "❌ Error al finalizar plan embarque : " + E,
                "Warning");
            StopLoading();

        }
    }

}

function reqEstComents(est) {
    let req = false;
    let Estatus = ['REPROGRAMADO', 'DEVOLUCIÓN', 'RECHAZADO'];

    if (Estatus.includes(est)) req = true;

    return req;
}

function showModalEstatus(id, est, pedido) {
    $("#modalSugPlan").modal("hide");
    $("#modalMotivoEst").attr("idPedido", id);
    $("#estTitle").text(`Pedido: ${pedido} ${est}`);
    $("#motComentarios").val("");
    $("#modalMotivoEst").modal("show");
    MP.currenStatus = est;
}

function saveEstComments(estatus) {

    let idPedido = $("#modalMotivoEst").attr("idPedido");

    let comentario = $("#motComentarios").val().trim();

    MP.updateEstPedido(idPedido, MP.currenStatus, comentario);


    $("#modalSugPlan").modal("show");
    $("#modalMotivoEst").modal("hide");


}

function initHubProgesoCarga() {
    //Escuchando eventos con SinalR
    var hub = $.connection.progresoCargaHub; // Conectar con el Hub de SignalR

    hub.client.actualizarPlanEmb = function (pedido, NumViaje, Unidad, TPzsEntrega, TPzsCargadas) {
        console.log(`Actualización recibida. Pedido: ${pedido} totalPzs ${TPzsEntrega} totalPzsCardas ${TPzsCargadas}`);
        // Llama a una función para recargar la tabla
        UpdateProgressPedido(pedido, NumViaje, Unidad, TPzsEntrega, TPzsCargadas);
    };

    $.connection.hub.start().done(function () {
        console.log("Conectado a SignalR");
    });
    //END SinalR
}

function UpdateProgressPedido(pedido, NumViaje, Unidad, TPzsEntrega, TPzsCargadas) {


    let objPedido = MP.getPedidoInData(pedido);
    let idTabla = MP.getIdTabla(objPedido);

    let $row = $(`#${idTabla} tr[idppd='${objPedido.id}']`);

    let $tdEstatus = $($row).find("td.EstatusCarga");

    // Obtener el elemento meter y cambiar sus atributos
    let $meter = $tdEstatus.find("meter");

    //En caso de que no este originalmente en progreso ca
    if ($meter.length == 0) {
        let barraProgreso = MP.construirProgressBar(pedido, TPzsEntrega, TPzsCargadas);
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

    $tdEstatus.removeClass("CustomEstatusCarga");

    if (TPzsEntrega == TPzsCargadas) {
        setTimeout(() => {
            $tdEstatus.text("CARGADO");
            LayoutCs.Alerta("Carga Completa ✔", "La unidad 🚚 se cargo por completo", "OK");
        }, 1100);
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

function ordenarPedidos(pedidosViaje) {
    pedidosViaje.sort((a, b) => {
        const numA = parseInt(a.NumeroViaje, 10);
        const numB = parseInt(b.NumeroViaje, 10);

        const isNumA = !isNaN(numA);
        const isNumB = !isNaN(numB);

        // Si ambos son números, ordenar ascendente
        if (isNumA && isNumB) {
            return numA - numB;
        }

        // Si A es número y B no, A va primero
        if (isNumA && !isNumB) {
            return -1;
        }

        // Si B es número y A no, B va primero
        if (!isNumA && isNumB) {
            return 1;
        }

        // Si ambos son texto, ordenar alfabéticamente
        return a.NumeroViaje.localeCompare(b.NumeroViaje);
    });

    return pedidosViaje;

    //console.log(pedidosViaje);

}


//LayoutCs.validarUsuario("Log\u00EDstica");
LayoutCs.validarUsuarios(["Log\u00EDstica","Ventas"]);

const MP = new MascPlan();

async function iniciar() {

    await MP.PlanesEmb();
    await MP.getEstatusCarga();
}

$(function () {


    initHubProgesoCarga();

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


    iniciar();


    $("#closeAllPedidos").on("click", function () {
        $("#modalAllPedidos").modal("hide");
    });

    $(document).on("click", ".showAllP", function () {
        let $tabla = $(this).closest("table");
        let codeUni = $tabla.attr("codeUni");
        let numViaje = $tabla.attr("numViaje");
        let idUnidad = $(this).attr("idUnidad");

        $("#unidadTitle").text(idUnidad);
        $("#viajeTitle").text(numViaje);

        let tablaCreada = MP.contruirTableAllPedidos(numViaje, codeUni, idUnidad);

        if (tablaCreada) $("#modalAllPedidos").modal("show");

    });

    $("#guardarComEst").on("click", function () {
        saveEstComments();
    });

    $(".backModalMotEst").on("click", function () {
        let idPedido = $("#modalMotivoEst").attr("idPedido");
        let $Row = $(`tr[idppd="${idPedido}"]`);

        if ($Row.length > 0) {
            $Row.find("td.EstatusCarga select").val(MP.oldEst);
            let $td = $Row.find("td.EstatusCarga")
            let $select = $td.find("select");

            if ($select.length > 0) {
                $select.val(MP.oldEst);
            }
            else {
                $Row.find("td.EstatusCarga").text(MP.oldEst);
            }

            let bg = MP.colorStatus[MP.oldEst];

            $td.removeClass('bg-success');
            $td.removeClass('bg-warning');
            $td.removeClass('text-white');

            if (bg) {
                $td.addClass(bg);
            }

        }

    });

    $("#FinPlanEmb").on("click", function () {
        MP.finalizarPlanEmb();
    });

    $(document).on("click", "#PlanesEmbMasc .PV", function () {
        let pvFolio = $(this).attr("folio");
        MP.Folio = pvFolio;

        MP.getMascPlan();
    });



})