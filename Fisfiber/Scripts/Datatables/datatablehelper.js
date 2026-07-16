class DataTableHelper {

    crearDataTable(selector, opciones = {}) {

        if ($.fn.DataTable.isDataTable(selector)) {
            $(selector).DataTable().destroy();
        }

        const configuracion = {

            destroy: true,
            responsive: true,
            autoWidth: false,
            searching: true,
            ordering: true,
            paging: true,
            info: false,
            autoWidth: true,
            language: {
                url: "/Scripts/DataTables/i18n/es-ES.json",
                emptyTable: "No se encontraron registros.",
                zeroRecords: "No se encontraron registros.",
                paginate: {
                    previous: "← Anterior",
                    next: "Siguiente →"
                }
            }

        };

        return $(selector).DataTable(
            $.extend(true, {}, configuracion, opciones)
        );
    }

}