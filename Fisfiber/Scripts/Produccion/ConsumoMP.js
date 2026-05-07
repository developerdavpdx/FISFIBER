class ConsumoMP {
    constructor() { }

    createTable() {
        $("#TablePlanProduccion").DataTable(
            {
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
               
            });

    }
    
}

//Instancia de clase
const CMP = new ConsumoMP();

$(function () {
    CMP.createTable();
});