class ReporteProduccion {
    constructor() {

    }

    showTableReportePro() {
        $('#TableReporteProdu').DataTable().destroy();
        //DATATABLE -> ESPECIFICACIONES DE TABLA
        $("#TableReporteProdu").DataTable({
            pageLength: 10,
            autoWidth: false,
            language: {
                lengthMenu: "Mostrar: _MENU_  ",
                zeroRecords: "No se encontraron resultados",
                info: "",
                infoEmpty:
                    "Mostrando registros del 0 al 0 de un total de 0 registros",
                infoFiltered: "(filtrado de un total de _MAX_ registros)",
                sSearch: "Buscar:",
                oPaginate: {
                    sNext: "Siguiente",
                    sPrevious: "Anterior",
                },
                sProcessing: "Procesando...",
            }
        });
    }

    showTableDetalleReporte() {
        $('#TableDetalleReporte').DataTable().destroy();
        //DATATABLE -> ESPECIFICACIONES DE TABLA
        $("#TableDetalleReporte").DataTable({
            pageLength: 10,
            autoWidth: false,
            language: {
                lengthMenu: "Mostrar: _MENU_  ",
                zeroRecords: "No se encontraron resultados",
                info: "",
                infoEmpty:
                    "Mostrando registros del 0 al 0 de un total de 0 registros",
                infoFiltered: "(filtrado de un total de _MAX_ registros)",
                sSearch: "Buscar:",
                oPaginate: {
                    sNext: "Siguiente",
                    sPrevious: "Anterior",
                },
                sProcessing: "Procesando...",
            }
        });
    }

}

//INSTANCIA CLASE
const RP = new ReporteProduccion();

$(document).ready(function () {
    RP.showTableReportePro();

    //EVENTOS DE CONTENIDO DINAMICO

    //Modal detalles de producion por linea
    $(document).on("click", "#detail", function () {
        $('#detailModal').modal('show');
    });

    // Ejecutar código cuando el modal se ha mostrado completamente
    $('#detailModal').on('shown.bs.modal', function () {
        RP.showTableDetalleReporte();
    });

});