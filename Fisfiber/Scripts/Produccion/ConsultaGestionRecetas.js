class ConsGesRec {
    constructor() {
        this.init();
    }

    init() {
        this.eventoFilaLinea();
        this.eventoEvidencia();
    }

    eventoFilaLinea() {
        $('.fila-linea').on('click', function (e) {

            //Bloquea el despliegue de la data de lineas de fibra
            if ($(e.target).closest('.celda-evidencia').length) {
                return;
            }

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

    eventoEvidencia() {

        $('#btnActualizarEvidencia').on('click', function () {
            $('#inputEvidencia').click();
        });

        $('#inputEvidencia').on('change', function () {

            const archivo = this.files[0];

            if (!archivo) return;

            const reader = new FileReader();

            reader.onload = function (e) {

                $('#imgEvidencia')
                    .attr('src', e.target.result)
                    .removeClass('img-default')
                    .addClass('img-evidencia');

            };

            reader.readAsDataURL(archivo);
        });
    }

}

$(document).ready(function () {
    const gesRec = new ConsGesRec();
});