class ConsInsRec {
    constructor() {
        this.init();
    }

    init() {
        this.eventoFilaLinea();
        this.habilitarBoton();
    }

    eventoFilaLinea() {
        $('.fila-lineaR').on('click', function (e) {

            


            // Resaltar fila seleccionada
            $('.fila-lineaR').removeClass('table-danger');
            $(this).addClass('table-danger');


            // Si ya está visible, sube primero y luego baja
            if ($('#seccionReporteEsp').is(':visible')) {
                $('#seccionReporteEsp').slideUp(700, function () {
                    $('#seccionReporteEsp').slideDown(2000);
                });
            } else {
                $('#seccionReporteEsp').slideDown(2000);
            }

            // this.cargarRecetas(linea);
        });
    }

    habilitarBoton() {
        $('.fila-lineaR').on('click', function () {

            $('.fila-lineaR').removeClass('table-active');
            $(this).addClass('table-active');

            $('#btnCrearReporte').prop('disabled', false);

            let folio = $(this).data('folio');

            $('#btnCrearReporte').attr('data-folio', folio);

        });
    }

}

$(document).ready(function () {
    const insRec = new ConsInsRec();
});