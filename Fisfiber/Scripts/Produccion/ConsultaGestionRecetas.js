class ConsGesRec {
    constructor() {
        this.init();
    }

    init() {
        this.eventoFilaLinea();
    }

    eventoFilaLinea() {
        $('.fila-linea').on('click', function () {
            const nombre = $(this).find('td:first').text();
            const linea = $(this).data('linea');

            // Resaltar fila seleccionada
            $('.fila-linea').removeClass('table-danger');
            $(this).addClass('table-danger');

            // Actualizar títulos
            $('#tituloFibras').text(`Recetas de Fibras – ${nombre}`);
            $('#tituloResinas').text(`Recetas de Resinas – ${nombre}`);

            // Si ya está visible, sube primero y luego baja
            if ($('#seccionRecetas').is(':visible')) {
                $('#seccionRecetas').slideUp(700, function () {
                    $('#seccionRecetas').slideDown(2000);
                });
            } else {
                $('#seccionRecetas').slideDown(2000);
            }

            // this.cargarRecetas(linea);
        });
    }

}

$(document).ready(function () {
    const gesRec = new ConsGesRec();
});