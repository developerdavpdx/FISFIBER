class ConsRepOrdenesTrabajo {
    constructor() {
        this.tablaOT = null;
        this.init();
    }

    init() {
        this.inicializarTabla();
        this.eventoFilaOT();
        this.eventoCerrarDetalle();
    }

    inicializarTabla() {
        this.tablaOT = $('#tablaOT').DataTable({
            language: {
                search: "Buscar:",
                lengthMenu: "Mostrar _MENU_ registros",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                infoEmpty: "Sin registros",
                zeroRecords: "No se encontraron resultados",
                paginate: {
                    first: "Primero",
                    last: "Último",
                    next: "Siguiente",
                    previous: "Anterior"
                }
            },
            order: [[10, 'desc']],
            pageLength: 15,
            stripeClasses: ['fila-impar', 'fila-par']
        });
    }

    eventoFilaOT() {
        // Delegado en document — funciona aunque DataTables recree el DOM
        $(document).on('click', '#tablaOT tbody tr.fila-ot', function () {
            const d = $(this).data();
            const abierto = $('#panelDetalleOT').is(':visible')
                && $('#detFolioVal').text() === d.folio;

            // Rotar iconos
            $('#tablaOT .icono-expand').css('transform', 'rotate(0deg)');

            if (abierto) {
                // Cerrar si es la misma fila
                $('#panelDetalleOT').slideUp(250);
            } else {
                // Llenar panel
                $('#detFolio').text(d.folio);
                $('#detFolioVal').text(d.folio);
                $('#detPedido').text(d.pedido);
                $('#detLinea').text(d.linea);
                $('#detCant').text(d.cant);
                $('#detTipo').text(d.tipo);
                $('#detFecha').text(d.fecha);
                $('#detArticulo').text(d.articulo);
                $('#detProducido').text(d.producido);
                $('#detRestante').text(d.restante);

                // Estatus badge
                $('#detEstatus').html(`<span class="badge-estatus ${d.estatus}">${d.estatusTxt}</span>`);

                // Barra de progreso
                const pct = parseInt(d.pct) || 0;
                const colorBar = pct === 100 ? 'bg-success' : pct > 50 ? 'bg-warning' : 'bg-danger';
                $('#detProgressBar')
                    .removeClass('bg-success bg-warning bg-danger')
                    .addClass(colorBar)
                    .css('width', pct + '%')
                    .text(pct + '%');

                // Rotar chevron de esta fila
                $(this).find('.icono-expand').css('transform', 'rotate(90deg)');

                // Mostrar panel
                $('#panelDetalleOT').slideDown(2000, function () {
                    // Scroll suave al panel
                    $('.main-body').animate({
                        scrollTop: $('#panelDetalleOT').offset().top - 20
                    }, 400);
                });
            }
        });
    }

    eventoCerrarDetalle() {
        $('#btnCerrarDetalle').on('click', function () {
            $('#panelDetalleOT').slideUp(700);
            $('#tablaOT .icono-expand').css('transform', 'rotate(0deg)');
        });
    }
}

$(document).ready(function () {
    const RepOrdenesTrabajo = new ConsRepOrdenesTrabajo();
});
