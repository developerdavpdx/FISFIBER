class ReporteParosProduccion {
    constructor() {
        this.action = "";
        this.table = "";
    }

    ParosHistoricos(Inicio, Fin, Linea) {
        try {
            let table = $("#TblReporteParos").DataTable({
                processing: false,
                serverSide: true,
                bDestroy: true,
                ajax: {
                    url: this.action,
                    type: "POST",
                    dataType: "json",
                    data: { "Inicio": Inicio, "Fin": Fin, "Linea": Linea },
                    beforeSend: function () { Loading(); },
                    complete: function () { StopLoading(); },
                    dataSrc: function (json) { return json.data; }
                },
                columns: [
                    { data: "ID" },              // ID
                    { data: "FechaInicio" },     // Fecha inicio
                    { data: "FechaFinParo" },    // Fecha fin
                    { data: "Linea" },           // Línea
                    { data: "TipoMantenimiento" }, // Tipo Mantenimiento
                    { data: "Motivo" },          // Motivo
                    { data: "Solicitante" },     // Solicitante
                    { data: "UsuarioRealizo" },  // Usuario Realizó
                    { data: "Rubro" },           // Rubro
                    { data: "Observaciones" },   // Observaciones
                    { data: "Estatus" },         // Estatus
                    { data: "OrdenTrabajo" }     // Orden Trabajo
                ],

                columnDefs: [
                    { visible: false, targets: 0 },
                    { width: '150px', targets: '_all' }
                ],
                ordering: false,
                info: true,
                bPaginate: true,
                searching: true,
                language: {
                    lengthMenu: "Mostrar _MENU_ registros",
                    zeroRecords: "No se encontraron resultados",
                    info: "Registros del _START_ al _END_ de un total de _TOTAL_ registros",
                    infoEmpty: "Registros del 0 al 0 de un total de 0 registros",
                    infoFiltered: "(filtrado de un total de _MAX_ registros)",
                    sSearch: "Buscar:",
                    oPaginate: { sFirst: "Primero", sLast: "Último", sNext: "Siguiente", sPrevious: "Anterior" },
                    sProcessing: "Procesando...",
                    emptyTable: "No hay datos disponibles en la tabla"
                }
            });

            StopLoading();
            return table;

        } catch (error) {
            LayoutCs.Excepcion("No es posible mostrar los paros históricos: " + error, "Reporte de paros");
            StopLoading();
        }
    }
    // Exportar Excel con todos los registros (sin paginación)
    async ExportarTodoExcel() {
        const inicio = $("#FiltroFechaInicio").val();
        const fin = $("#FiltroFechaFin").val();
        const linea = $("#FiltroLinea").val();

        try {
            // Llamada AJAX para obtener todos los registros
            const response = await $.ajax({
                url: this.action,
                type: "POST",
                dataType: "json",
                data: { Inicio: inicio, Fin: fin, Linea: linea, allRecords: "true" },
                beforeSend: function () { Loading(); },
                complete: function () { StopLoading(); }
            });

            const data = response.data || [];
            if (data.length === 0) {
                alert("No hay datos para exportar");
                return;
            }

            // Crear workbook y hoja
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("ParosHistoricos");

            // Definir columnas (omitimos ID)
            sheet.columns = [
                { header: "Linea", key: "Linea", width: 15 },
                { header: "FechaInicio", key: "FechaInicio", width: 20 },
                { header: "FechaFinParo", key: "FechaFinParo", width: 20 },
                { header: "TipoMantenimiento", key: "TipoMantenimiento", width: 25 },
                { header: "Motivo", key: "Motivo", width: 30 },
                { header: "Solicitante", key: "Solicitante", width: 20 },
                { header: "UsuarioRealizo", key: "UsuarioRealizo", width: 20 },
                { header: "Rubro", key: "Rubro", width: 20 },
                { header: "Observaciones", key: "Observaciones", width: 30 },
                { header: "Estatus", key: "Estatus", width: 15 },
                { header: "OrdenTrabajo", key: "OrdenTrabajo", width: 20 }
            ];

            // Estilo encabezado
            sheet.getRow(1).eachCell(cell => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4472C4' } // azul oscuro
                };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });

            // Agregar datos con filas alternadas
            data.forEach((rowData, i) => {
                const row = sheet.addRow({
                    Linea: rowData.Linea,
                    FechaInicio: rowData.FechaInicio,
                    FechaFinParo: rowData.FechaFinParo,
                    TipoMantenimiento: rowData.TipoMantenimiento,
                    Motivo: rowData.Motivo,
                    Solicitante: rowData.Solicitante,
                    UsuarioRealizo: rowData.UsuarioRealizo,
                    Rubro: rowData.Rubro,
                    Observaciones: rowData.Observaciones,
                    Estatus: rowData.Estatus,
                    OrdenTrabajo: rowData.OrdenTrabajo
                });

                const fillColor = (i % 2 === 0) ? 'FFF2F2F2' : 'FFFFFFFF'; // gris y blanco
                row.eachCell(cell => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
                });
            });

            // Ajuste de ancho automático
            sheet.columns.forEach(column => {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, cell => {
                    const length = cell.value ? cell.value.toString().length : 0;
                    if (length > maxLength) maxLength = length;
                });
                column.width = maxLength < 15 ? 15 : maxLength + 2;
            });

            // Descargar archivo en navegador
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/octet-stream" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "Reporte_Paros_Historicos.xlsx";
            link.click();

        } catch (error) {
            LayoutCs.Excepcion("No es posible exportar los datos: " + error, "Exportar Excel");
        }
    }

    //ExportarExcel() {
    //    if (!this.table) return;

    //    const data = this.table.ajax.json()?.data || [];
    //    if (data.length === 0) {
    //        alert("No hay datos para exportar");
    //        return;
    //    }

    //    const headers = [
    //        "Linea", "FechaInicio", "FechaFinParo", "TipoMantenimiento",
    //        "Motivo", "Solicitante", "UsuarioRealizo", "Rubro",
    //        "Observaciones", "Estatus", "OrdenTrabajo"
    //    ];

    //    const worksheetData = [headers];
    //    data.forEach(row => {
    //        worksheetData.push([
    //            row.Linea,
    //            row.FechaInicio,
    //            row.FechaFinParo,
    //            row.TipoMantenimiento,
    //            row.Motivo,
    //            row.Solicitante,
    //            row.UsuarioRealizo,
    //            row.Rubro,
    //            row.Observaciones,
    //            row.Estatus,
    //            row.OrdenTrabajo
    //        ]);
    //    });

    //    const wb = XLSX.utils.book_new();
    //    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    //    // Ajustar ancho de columnas
    //    const colWidths = headers.map((h, i) => {
    //        let max = h.length;
    //        data.forEach(row => {
    //            const val = [
    //                row.Linea,
    //                row.FechaInicio,
    //                row.FechaFinParo,
    //                row.TipoMantenimiento,
    //                row.Motivo,
    //                row.Solicitante,
    //                row.UsuarioRealizo,
    //                row.Rubro,
    //                row.Observaciones,
    //                row.Estatus,
    //                row.OrdenTrabajo
    //            ][i];
    //            if (val) max = Math.max(max, val.toString().length);
    //        });
    //        return { wch: max + 2 }; // +2 para margen
    //    });
    //    ws['!cols'] = colWidths;

    //    // Zebra style y encabezado
    //    const range = XLSX.utils.decode_range(ws['!ref']);
    //    for (let R = 0; R <= range.e.r; ++R) {
    //        for (let C = range.s.c; C <= range.e.c; ++C) {
    //            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
    //            if (!ws[cellAddress]) continue;

    //            if (R === 0) {
    //                // encabezado azul
    //                ws[cellAddress].s = {
    //                    font: { bold: true, color: { rgb: "FFFFFFFF" } },
    //                    fill: { fgColor: { rgb: "FF4472C4" } },
    //                    alignment: { horizontal: "center" }
    //                };
    //            } else {
    //                const fillColor = (R % 2 === 0) ? "FFF2F2F2" : "FFFFFFFF";
    //                ws[cellAddress].s = { fill: { fgColor: { rgb: fillColor } } };
    //            }
    //        }
    //    }

    //    XLSX.utils.book_append_sheet(wb, ws, "ParosHistoricos");
    //    XLSX.writeFile(wb, "Reporte_Paros_Historicos.xlsx");
    //}
}

LayoutCs.validarUsuario("Mantenimiento");

const ReporteParosProduccionCs = new ReporteParosProduccion();

function CargarReporteHistorico() {
    const inicio = $("#FiltroFechaInicio").val();
    const fin = $("#FiltroFechaFin").val();
    const linea = $("#FiltroLinea").val();

    ReporteParosProduccionCs.action = $("#TblReporteParos").attr("ParosHistoricos");
    ReporteParosProduccionCs.table = ReporteParosProduccionCs.ParosHistoricos(inicio, fin, linea);
}

$(function () {
    CargarReporteHistorico();

    $(document).on("click", "#BtnFiltrarHistorico", CargarReporteHistorico);
    $(document).on("click", "#BtnExportExcel", function () {
        ReporteParosProduccionCs.ExportarTodoExcel();
    });
});
