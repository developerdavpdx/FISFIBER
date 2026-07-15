class DataTableHelper {

    crearDataTable(selector, opciones = {}) {

        if ($.fn.DataTable.isDataTable(selector)) {
            $(selector).DataTable().destroy();
        }

        const configuracion = {

            destroy: true,
            responsive: true,
            autoWidth: false,
            searching: false,
            ordering: false,
            paging: false,
            info: false,
            language: {
                url: "/Scripts/DataTables/i18n/es-ES.json",
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