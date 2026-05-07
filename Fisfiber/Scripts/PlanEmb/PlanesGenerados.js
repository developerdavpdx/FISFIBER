class PlanEmbGenerales {
    constructor() {
        this.table;
        this.Folio;
    }

    PlanesEmbGenerados() {
        try {

            let urlPlanesG = $("#PlanesEmbGenerados").attr("planesEmbG");

            let table = $("#PlanesEmbGenerados").DataTable(
                {
                    processing: false,
                    serverSide: true,
                    bDestroy: true,
                    "ajax":
                    {
                        url: urlPlanesG,
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
            LayoutCs.Excepcion("No es posible mostrar los planes de producción: " + error, "Plan de producción");
            StopLoading();

        }
    }

    async PlaneEmbGeneradosDetails(Folio) {
        try {
            //Datos de PP
            //PlanEmb/GetPlanEmbGeneradosDetails
            let urlDetail = $("#PlanesEmbGenerados").attr("planesEmbGDetail");

            Loading();
            let response = await $.ajax({
                url: urlDetail,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    usuario: sessionStorage.getItem("email"),
                    folio: Folio
                }
            });


            if (response.Status == "OK") {
                let data = JSON.parse(response.Data);
                let resumenEnvios = JSON.parse(response.Data2);
                let headerPlan = JSON.parse(response.ExtraData)
                let infoPlan = JSON.parse(response.Other)

                $("#reportbyline").addClass("d-none");
                $("#PPHeaderTitle").addClass("d-none");
                $(".seccionBtns").removeClass("d-none");


                if (resumenEnvios) {
                    let por = porcentaje(
                        resumenEnvios[0].TotalEnvios,
                        resumenEnvios[0].EnviosCompletados);

                    $("#porcentaje").text(`%${por}`);
                }


                let revision = 1;

                if (infoPlan) revision = infoPlan[0].NumRevVentas || 1;

                if (headerPlan) {
                    //$("#revisionPEG").text(headerPlan[0]?.Revision)
                    $("#folioPEG").text(headerPlan[0]?.folio+"-"+revision)
                    $("#fecha-documentoPEG").text(headerPlan[0]?.fecha)
                    $("#DescargarReporte").attr("Rev", revision);
                }
                else {
                    console.error("Error al mostrar header del plan...")
                }
                

                LayoutCs.renderTableFromData({
                    data: data,
                    tableSelector: "#PlanesGeneradosDetalle",
                    excludeColumns: [
                        "id", "DocEntry", "DistRecorrida",
                        "HoraEntrega", "F_Pedido", "Orden",
                        "NumEstatusC", "EstatusCarga", "Consolidado"
                    ],
                    editRules: {
                        // ejemplo: "Cantidad": "editMe"
                        // Usa tu lógica si quieres pasarle `ColumnsWithEdit`, `ColumnsWithEditDate`, etc.
                        // Combínalos dinámicamente si prefieres
                        //"PiezasEntrega": "editMeNum",
                    },
                    customParsers: {
                        HoraInicio: LayoutCs.parseHora,
                        HoraFin: LayoutCs.parseHora,
                        HoraFactura: LayoutCs.convertirAHora
                    },
                    noAuth: [],
                    prefId: "rowpgd"
                });

                $("#PPHeader").removeClass("d-none");
                $("#contentTable").removeClass("d-none");

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

}

LayoutCs.validarUsuario("Log\u00EDstica");

const PEG = new PlanEmbGenerales();

$(function () {
    PEG.table = PEG.PlanesEmbGenerados();

    $(document).on("click", ".PP", function () {
        let folio = $(this).attr("folio");

        PEG.Folio = folio;
        PEG.PlaneEmbGeneradosDetails(folio);
    });

    $("#DescargarReporte").on("click", function () {
        try {
            let folio = PEG.Folio + "_PlanEmbarques";
            let revision = $(this).attr("Rev") || 1; //Poner numero revision 
            let por = $("#porcentaje").text().trim();

            LayoutCs.ExportarExcelExcelJS(
                "PlanesGeneradosDetalle",
                folio,
                revision,
                "Plan Embarque Cerrado: " + PEG.Folio,
                167,
                57,
                0,
                0,
                [
                    { label: 'PORCENTAJE CUMPLIMIENTO', value: por },
                ]
            );
        }
        catch (error) {
            LayoutCs.Alerta(
                "Plan de embarques",
                "No es posible descargar el reporte de plan de embarques: " + error);
            StopLoading();

        }
    });

});