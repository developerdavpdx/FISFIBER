class Unidades {
    abrirModal(id, comentarios, estado, operador, ay1, ay2, ay3, ay4) {
        $('#editId').val(id);
        $('#editComentarios').val(comentarios);
        $('#editOp').val(operador);
        $('#editEstado').val(estado);
        $('#editAy1').val(ay1);
        $('#editAy2').val(ay2);
        $('#editAy3').val(ay3);
        $('#editAy4').val(ay4);
        $('#modalEditar').modal('show');
    }

    guardarCambios() {

        Loading();

        const id = $('#editId').val();
        const estado = $('#editEstado').val();
        const operador = $('#editOp').val();
        const ayud1 = $('#editAy1').val();
        const ayud2 = $('#editAy2').val();
        const ayud3 = $('#editAy3').val();
        const ayud4 = $('#editAy4').val();
        const comentarios = $('#editComentarios').val();

        //"@Url.Action("ActualizarUnidad","Unidad")"
        let urlAct = $("#contUnidades").attr("action");

        $.ajax({
            url: urlAct,
            type: 'POST',
            data: { id, estado, comentarios, operador, ayud1, ayud2, ayud3, ayud4 },
            success: function (data) {

                LayoutCs.Alerta(
                    'Unidades de carga',
                    'La actualización se hizo correctamente',
                    'OK');

                StopLoading();
                $('#modalEditar').modal('hide');

                

                setTimeout(() =>
                    location.reload(), 2000);

            },
            error: function (jqXHR, textStatus, errorThrown) {
                StopLoading();

                console.error("Estado del error:", textStatus);
                console.error("Error lanzado:", errorThrown);
                console.error("Respuesta del servidor:", jqXHR.responseText);

                LayoutCs.Alerta(
                    'Unidades de carga',
                    'Error al guardar cambios: ' + errorThrown,
                    'Warning');
            }

        });
    }
}

LayoutCs.validarUsuario("Log\u00EDstica");

const Uni = new Unidades();

$(function () {
    $(document).on("click", ".editUnidad", function () {
        let id = $(this).attr("IdUnidad");
        let com = $(this).attr("Com");
        let estado = $(this).attr("Estado");
        let op = $(this).attr("Operador");
        let ayud1 = $(this).attr("Ayud1");
        let ayud2 = $(this).attr("Ayud2");
        let ayud3 = $(this).attr("Ayud3");
        let ayud4 = $(this).attr("Ayud4");

        Uni.abrirModal(id, com, estado, op, ayud1, ayud2, ayud3, ayud4);
    })

    $(document).on("click", "#GuardarUnidad", function () {
        Uni.guardarCambios();
    });

    //Descargar Unidades
    $("#DescargarUnidades").on("click", function () {
        try {

            const hoy = new Date();
            const dia = String(hoy.getDate()).padStart(2, '0');
            const mes = String(hoy.getMonth() + 1).padStart(2, '0');
            const anio = hoy.getFullYear();
            const fechaFormateada = `${dia}-${mes}-${anio}`;

            let NombreExcel = "UnidadesCarga_" + fechaFormateada;
            LayoutCs.ExportarExcelExcelJS(
                "UnidadesCarga",
                NombreExcel,
                "",
                `Unidades de Carga Fecha: ${fechaFormateada}`,
                120,
                37
            );
        }
        catch (error) {
            LayoutCs.Alerta(
                "Unidades Carga",
                "No es posible descargar las unidades de carga: " + error);
            StopLoading();

        }
    });
});