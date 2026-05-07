$(document).ready(function () {
    // Abrir el modal manualmente
    $('#btnEditEstatus').on('click', function () {
        $('#editEstatus').modal('show');
    });
 
    // Ejecutar código cuando el modal se ha mostrado completamente
    $('#editEstatus').on('shown.bs.modal', function () {
        console.log('El modal se ha mostrado');
    });
});
