// Datos dummy
const materiasPrimas = [
    { id: 1, material: 'Polipropileno', lote: 'L-2024-089', cantidad: 1500, consumido: 35, unidad: 'KG', estatus: 'Cargado' },
    { id: 2, material: 'Fibra de Vidrio', lote: 'FV-556', cantidad: 800, consumido: 20, unidad: 'KG', estatus: 'Cargado' },
    { id: 3, material: 'Masterbatch', lote: 'MB-0012', cantidad: 120, consumido: 45, unidad: 'KG', estatus: 'Cargado' },
    { id: 4, material: 'Lubricante', lote: 'LB-089', cantidad: 60, consumido: 60, unidad: 'L', estatus: 'Cargado' },
    { id: 5, material: 'Colorante', lote: 'CLR-33', cantidad: 40, consumido: 15, unidad: 'KG', estatus: 'Pendiente Autorización' }
];

const ordenProduccion = {
    folio: 'OF-2024-1045',
    articulo: 'Tela No Tejida 50gsm',
    cantidadProgramada: 5000,
    cantidadProducida: 1850,
    eficiencia: 87,
    velocidadMaquina: 120
};

// Variables de estado
let produccionActiva = true;
let modoAcumulacion = false;
let piezasAcumuladas = 0;
let paquetesCompletados = 0;
let simulacionBasculaInterval = null;

$(document).ready(function () {
    cargarMateriasPrimas();
    actualizarProgreso();
    cargarLogActividad();

    // Eventos de pestañas
    $('#peso-tab').on('click', () => {
        modoAcumulacion = false;
        agregarLog('Modo cambiado: Peso Individual', 'info');
    });
    $('#acumulacion-tab').on('click', () => {
        modoAcumulacion = true;
        agregarLog('Modo cambiado: Acumulación', 'info');
    });

    // Eventos de botones
    $('#btnEditEstatus').on('click', () => $('#editEstatus').modal('show'));
    $('#btnGuardarEstatus').on('click', guardarEstatus);
    $('#btnDevolverMaterial').on('click', abrirModalDevolver);
    $('#btnRetiroSobrantes').on('click', abrirModalSobrantes);
    $('#btnSimularPeso').on('click', toggleSimulacionBascula);
    $('#btnGenerarEtiqueta').on('click', generarEtiqueta);
    $('#btnGenerarPaquete').on('click', generarPaquete);
    $('#btnConfirmarDevolucion').on('click', confirmarDevolucion);
    $('#btnGenerarEtiquetaSobrante').on('click', generarEtiquetaSobrante);
    $('#btnEscanear').on('click', escanearLote);

    // Evento select de línea
    $('#selectLinea').on('change', function () {
        if ($(this).val()) {
            cargarLinea($(this).val());
        }
    });
});

function cargarMateriasPrimas() {
    let html = '';
    materiasPrimas.forEach(mp => {
        const disp = mp.cantidad - (mp.cantidad * mp.consumido / 100);
        const rowClass = mp.estatus === 'Pendiente Autorización' ? 'opacity: 0.6;' : '';
        const barClass = mp.consumido > 80 ? 'bg-danger' : mp.consumido > 50 ? 'bg-warning' : 'bg-success';
        html += `<div class="row" style="${rowClass}">
            <div class="col celda-d">${mp.material}</div>
            <div class="col celda-d">${mp.lote}</div>
            <div class="col celda-d">${disp.toFixed(1)}</div>
            <div class="col celda-d">
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar ${barClass}" style="width: ${mp.consumido}%">${mp.consumido}%</div>
                </div>
            </div>
        </div>`;
    });
    $('#tablaMaterias').html(html);
}

function cargarLinea(lineaId) {
    agregarLog(`Línea ${lineaId} seleccionada`, 'success');
    agregarLog('Orden de fabricación OF-2024-1045 cargada', 'success');
    agregarLog('Materias primas cargadas: 5 materiales', 'info');
    $('#folioOF').text(ordenProduccion.folio);
    $('#articuloOF').text(ordenProduccion.articulo);
    $('#cantProgramada').text(ordenProduccion.cantidadProgramada + ' KG');
    $('#cantProducida').text(ordenProduccion.cantidadProducida);
    $('#eficiencia').text(ordenProduccion.eficiencia + '%');
    $('#velocidadMaquina').text('Velocidad: ' + ordenProduccion.velocidadMaquina + ' m/min');
}

function toggleSimulacionBascula() {
    if (simulacionBasculaInterval) {
        clearInterval(simulacionBasculaInterval);
        simulacionBasculaInterval = null;
        $('#btnSimularPeso').html('<i class="bi bi-play-circle me-2"></i>Simular Báscula');
        agregarLog('Simulación de báscula detenida', 'warning');
    } else {
        simulacionBasculaInterval = setInterval(() => {
            if (produccionActiva && !modoAcumulacion) {
                let peso = (Math.random() * 2 + 24.5).toFixed(3);
                $('#pesoPT').val(peso);
                actualizarConsumo(parseFloat(peso));
            }
        }, 3000);
        $('#btnSimularPeso').html('<i class="bi bi-stop-circle me-2"></i>Detener Simulación');
        agregarLog('Simulación de báscula iniciada', 'info');
    }
}

function actualizarConsumo(peso) {
    materiasPrimas.forEach(mp => {
        if (mp.estatus !== 'Cargado') return;
        const tasaConsumo = mp.consumido / 100;
        const nuevoConsumo = Math.min(mp.consumido + (peso * 0.01), 100);
        mp.consumido = parseFloat(nuevoConsumo.toFixed(2));
    });
    cargarMateriasPrimas();
    agregarLog(`Consumo actualizado: ${peso} KG registrados`, 'warning');
}

function generarEtiqueta() {
    const peso = $('#pesoPT').val();
    if (!peso || parseFloat(peso) <= 0) {
        agregarLog('Error: Peso inválido', 'error');
        alert('Error: Peso inválido');
        return;
    }

    mostrarModalSAP('Enviando emisión a SAP...');

    setTimeout(() => {
        mostrarModalSAP('Ejecutando recibo de producción en SAP...');
        setTimeout(() => {
            $('#modalSAP').modal('hide');
            agregarLog(`Etiqueta generada: ${peso} KG - Recibo SAP exitoso`, 'success');

            ordenProduccion.cantidadProducida += parseFloat(peso);
            actualizarProgreso();

            alert('Etiqueta generada exitosamente\nRecibo de producción registrado en SAP');
        }, 2000);
    }, 2000);
}

function mostrarModalSAP(mensaje) {
    $('#sapMensaje').text(mensaje);
    $('#modalSAP').modal('show');
}

function actualizarProgreso() {
    const porcentaje = Math.round((ordenProduccion.cantidadProducida / ordenProduccion.cantidadProgramada) * 100);
    $('#barraProgreso').css('width', porcentaje + '%').text(porcentaje + '%');
    $('#cantProducida').text(ordenProduccion.cantidadProducida);
    $('#cantTotal').text(ordenProduccion.cantidadProgramada);
    $('#eficiencia').text(ordenProduccion.eficiencia + '%');
    $('#totalConsumido').text(ordenProduccion.cantidadProducida + ' KG');
}

function abrirModalDevolver() {
    let html = '';
    materiasPrimas.filter(mp => mp.estatus === 'Cargado').forEach(mp => {
        const disp = (mp.cantidad - (mp.cantidad * mp.consumido / 100)).toFixed(1);
        html += `<tr>
            <td><input type="radio" name="materialDevolver" value="${mp.id}"></td>
            <td>${mp.material}</td>
            <td>${mp.lote}</td>
            <td>${disp} ${mp.unidad}</td>
        </tr>`;
    });
    $('#tablaDevolver').html(html);
    $('#modalDevolver').modal('show');
}

function confirmarDevolucion() {
    const selectedId = $('input[name="materialDevolver"]:checked').val();
    if (!selectedId) {
        alert('Seleccione un material para devolver');
        return;
    }

    mostrarModalSAP('Procesando devolución en SAP...');

    setTimeout(() => {
        $('#modalSAP').modal('hide');
        const mp = materiasPrimas.find(m => m.id == selectedId);
        mp.estatus = 'Devuelto';
        cargarMateriasPrimas();
        $('#modalDevolver').modal('hide');
        agregarLog(`Devolución realizada: ${mp.material} - Movimiento SAP generado`, 'warning');
        alert('Devolución completada\nEtiqueta generada con siglas DEV');
    }, 2500);
}

function abrirModalSobrantes() {
    let html = '';
    materiasPrimas.filter(mp => mp.estatus === 'Cargado').forEach(mp => {
        const sobrante = (mp.cantidad * 0.05).toFixed(1);
        html += `<tr>
            <td><input type="checkbox" class="sobranteCheck" value="${mp.id}"></td>
            <td>${mp.material}</td>
            <td>${mp.unidad}</td>
            <td>${sobrante} ${mp.unidad}</td>
        </tr>`;
    });
    $('#tablaSobrantes').html(html);
    $('#modalSobrantes').modal('show');
}

function generarEtiquetaSobrante() {
    const seleccionados = $('.sobranteCheck:checked');
    if (seleccionados.length === 0) {
        alert('Seleccione al menos un material');
        return;
    }

    mostrarModalSAP('Registrando entrada de inventario en SAP...');

    setTimeout(() => {
        $('#modalSAP').modal('hide');
        $('#modalSobrantes').modal('hide');
        agregarLog(`${seleccionados.length} material(es) sobrante(s) retirado(s) - Entrada SAP generada`, 'info');
        alert('Etiquetas generadas para materiales sobrantes');
    }, 2000);
}

function escanearLote() {
    const lote = $('#inputLote').val();
    if (!lote) {
        $('#inputLote').val('L-2024-089');
        agregarLog('Lote escaneado: L-2024-089', 'success');
        $('#inputLote').val('');
    }
}

function guardarEstatus() {
    const nuevoEstatus = $('#nuevoEstatus').val();
    const comentario = $('#comentarioEstatus').val();

    mostrarModalSAP('Actualizando estatus en SAP...');

    setTimeout(() => {
        $('#modalSAP').modal('hide');
        $('#editEstatus').modal('hide');

        const badgeClass = nuevoEstatus === 'INICIADO' ? 'bg-success' :
            nuevoEstatus === 'PAUSADO' ? 'bg-warning' :
                nuevoEstatus === 'TERMINADO' ? 'bg-primary' : 'bg-danger';
        $('#statusBadge').removeClass().addClass(`badge ${badgeClass} p-2`).text(nuevoEstatus);
        $('#estatusProduccion').removeClass().addClass('d-block').text(nuevoEstatus);

        produccionActiva = (nuevoEstatus === 'INICIADO');

        const tipoLog = nuevoEstatus === 'CANCELADO' ? 'error' : 'success';
        agregarLog(`Estatus cambiado a: ${nuevoEstatus}${comentario ? ' - ' + comentario : ''}`, tipoLog);
        alert('Estatus actualizado correctamente');
    }, 2000);
}

function agregarLog(mensaje, tipo = 'info') {
    const ahora = new Date();
    const tiempo = ahora.toLocaleTimeString('es-MX');
    
    const iconos = {
        'info': '<i class="bi bi-info-circle text-info"></i>',
        'success': '<i class="bi bi-check-circle text-success"></i>',
        'warning': '<i class="bi bi-exclamation-triangle text-warning"></i>',
        'error': '<i class="bi bi-x-circle text-danger"></i>',
        'sap': '<i class="bi bi-cloud-upload text-primary"></i>'
    };
    
    const icono = iconos[tipo] || iconos['info'];
    
    const logHtml = `<div class="col celda-d" style="font-size: 0.8rem;">
        ${icono} ${tiempo} - ${mensaje}
    </div>`;
    $('#logActividad').prepend(logHtml);
}

function cargarLogActividad() {
    agregarLog('Sistema iniciado - Línea 16 cargada', 'success');
    agregarLog('Orden de fabricación OF-2024-1045 cargada', 'success');
    agregarLog('Materias primas cargadas: 5 materiales', 'info');
}

function generarPaquete() {
    const cantPiezas = parseInt($('#cantPiezasPaquete').val());
    if (!cantPiezas || cantPiezas <= 0) {
        agregarLog('Error: Cantidad de piezas inválida', 'error');
        alert('Ingrese una cantidad válida de piezas');
        return;
    }

    piezasAcumuladas += cantPiezas;
    if (piezasAcumuladas >= cantPiezas) {
        paquetesCompletados++;
        piezasAcumuladas = 0;
        $('#piezasAcumuladas').text(piezasAcumuladas);
        $('#paquetesCompletados').text(paquetesCompletados);
        agregarLog(`Paquete completado #${paquetesCompletados}`, 'success');
        generarEtiqueta();
    } else {
        $('#piezasAcumuladas').text(piezasAcumuladas);
        agregarLog(`Pieza acumulada: ${piezasAcumuladas}/${cantPiezas}`, 'info');
    }
}
