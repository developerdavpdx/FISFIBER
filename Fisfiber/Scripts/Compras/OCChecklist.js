class OCChecklist {
    // Atributos de modelo para el inicio de sesión
    constructor() {
        // + atributo que indica cual es el endpoint de redireccionamiento
        this.listoc = "";
        // + atributo que indica cual es el endpoint de redireccionamiento para obtener detalles de OC
        this.ocdetails = "";
        // * atributo para guardar la tabla de datos
        this.table;
        // * Atributo para guardar los datos de una fila de la tabla
        this.rowdata = "";
        // * Atributo para guardar el ID de fila de la tabla
        this.row = "";
        // * atributo para obtener el DocEntry del Documento
        this.DocEntry = "";
        // * atributo para obtener el DocNum del Documento
        this.DocNum = "";
        // * atributo para asignaciones generales 
        this.current_row = "";
        // * atributo para guardar el response
        this.Busqueda = "";
        // * atributo para realizar busquedas filtradas
        this.ObjectCodeSeriesOC = "22";
        // * atributos para filtros
        this.FI = "";
        this.FF = "";
        this.SerieID = "";

    }

    //Listado de ordenes de compra
    OC() {

        let table = $("#OC").DataTable(
            {
                processing: false,
                serverSide: true,
                bDestroy: true,
                "ajax":
                {
                    url: this.listoc,
                    type: "POST",
                    dataType: "json",
                    data: {
                        "Busqueda": this.Busqueda,
                        "FI": this.FI,
                        "FF": this.FF,
                        "Series": this.SerieID
                    },
                    "beforeSend": function () {
                        Loading(); // Mostrar el indicador de carga
                    },
                    "complete": function () {
                        StopLoading(); // Ocultar el indicador de carga
                    }
                },
                columns:
                    [
                        {
                            "data": "DocEntry"
                        },
                        {
                            "data": "Series"
                        },
                        {
                            "data": "Pedido"
                        },
                        {
                            "data": "Cliente"
                        },
                        {
                            "data": "CodigoCliente"
                        },
                        {
                            "data": "Articulo"
                        },
                        {
                            "data": "FechaContabilizacion"
                        }
                    ],

            //        {
            //    "data": "Monto",
            //    "render": function (data, type, row) {
            //        return '$' + parseFloat(data).toLocaleString('es-MX', { minimumFractionDigits: 2 });
            //    }
            //}
                columnDefs: [{ visible: false, width: '5%', targets: 0 }/*DocEntry */,
                    { visible: true, width: '10%', targets: 1 }/*Series */,
                    { visible: true, width: '10%', targets: 2 }/*No documento */,
                    { visible: true, width: '20%', targets: 3 }/*Proveedor */,
                    { visible: true, width: '10%', targets: 4 }/*No proveedor */,
                    { visible: true, width: '20%', targets: 5 }/*Articulo */,
                    { visible: true, width: '10%', targets: 6 }/*Fecha de creación */],

                ordering: false,
                searching:false,
                info: true,
                "bPaginate": true,
                "language": {
                    "lengthMenu": "Mostrar _MENU_ registros",
                    "zeroRecords": "No se encontraron resultados",
                    "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                    "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                    "infoFiltered": "(filtrado de un total de _MAX_ registros)",
                    "sSearch": "Buscar:",
                    "oPaginate": {
                        "sFirst": "Primero",
                        "sLast": "Último",
                        "sNext": "Siguiente",
                        "sPrevious": "Anterior"
                    },
                    "sProcessing": "Procesando...",
                }
            });


        $(".buttons-excel").addClass("exceldownload");

        return table;
    }
    // * Obtener Estado Actual de la orden de compra
    // Método para validar el usuario
    async OCDetail() {
        try {
            Loading();
            const response = await $.ajax({
                url: this.ocdetails,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    DocEntry: this.DocEntry
                }
            });

            // !UNA VEZ QUE YA SE RECIBIO LA RESPUESTA
            if (response.Status == "OK") {
                this.DetailsOC = JSON.parse(response.Data);
                this.DetailsOC[0].U_OrdenFisica = this.DetailsOC[0].U_OrdenFisica == "NO" ? "No validado" : "Validado";
                this.DetailsOC[0].U_Pedimento = this.DetailsOC[0].U_Pedimento == "NO" ? "No validado" : "Validado";
                this.DetailsOC[0].U_PackingList = this.DetailsOC[0].U_PackingList == "NO" ? "No validado" : "Validado";
                this.DetailsOC[0].U_CertificadoCalidad = this.DetailsOC[0].U_CertificadoCalidad == "NO" ? "No validado" : "Validado";

                this.DetailsOC[0].ClassOC = this.DetailsOC[0].U_OrdenFisica == "No validado" ? "text-bg-warning" : "text-bg-success";
                this.DetailsOC[0].ClassPedimento = this.DetailsOC[0].U_Pedimento == "No validado" ? "text-bg-warning" : "text-bg-success";
                this.DetailsOC[0].ClassPackingList = this.DetailsOC[0].U_PackingList == "No validado" ? "text-bg-warning" : "text-bg-success";
                this.DetailsOC[0].ClassCertificadoCalidad = this.DetailsOC[0].U_CertificadoCalidad == "No validado" ? "text-bg-warning" : "text-bg-success";

                // Creamos el div que queremos agregar
                var newDiv = $(`<div class="col-md-12">
                    <div class="card">
                    <div class="card-header text-start">
                    <img src="/Images/list.png" alt="OC" style="width:35px">
                    <span>No. de documento:</span>
                    <span class="ps-1 badge rounded-pill text-bg-primary">${this.DocNum}</span>
                    </div>
                        <div class="card-body text-center">
                            <div class="fw-bold text-start">
                            <span>OC:</span> 
                            <span class="ps-1 badge rounded-pill ${this.DetailsOC[0].ClassOC}">${this.DetailsOC[0].U_OrdenFisica}</span>
                            <span class="ps-4">Pedimento:</span>
                            <span class="ps-1 badge rounded-pill ${this.DetailsOC[0].ClassPedimento}">${this.DetailsOC[0].U_Pedimento}</span>
                            <span class="ps-4">Packing List:</span>
                            <span class="ps-1 badge rounded-pill ${this.DetailsOC[0].ClassPackingList}">${this.DetailsOC[0].U_PackingList}</span>
                            <span class="ps-4">Certificado Calidad:</span>
                            <span class="ps-1 badge rounded-pill ${this.DetailsOC[0].ClassCertificadoCalidad}">${this.DetailsOC[0].U_CertificadoCalidad}</span>
                          </div>
                        </div>
                    </div>
                </div>`);

                // Agregamos el div como una fila hija
                OCChecklistCs.row.child(newDiv).show();
                OCChecklistCs.current_row.addClass('shown');

            }
            else {
                alert(response.Message);
            }

            StopLoading();

        } catch (error) {
            const errorMessage = error.responseJSON ? error.responseJSON.message : "Ocurrió un error al procesar la solicitud.";
            alert("Error", errorMessage, "Hace un momento", "ERROR"); // Muestra un mensaje de error al usuario
            StopLoading();

        }
    }
}

LayoutCs.validarUsuario("Compras");

// Instancia de clase
const OCChecklistCs = new OCChecklist();

// Función para manejar el envío del formulario
function ValidacionFormularios(event) {
    // Validar el formulario
    if (this.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
    } else {
        event.preventDefault();
        event.stopPropagation();
        //URL ACTION
        OCChecklistCs.listoc = $("#OC").attr("urldestino");

        switch ($(event.currentTarget).attr("metodo")) {
            // * Filtro normal
            case "FiltroFecha":
                OCChecklistCs.FI = $("#FI").val();
                OCChecklistCs.FF = $("#FF").val();
                break;

            case "filtroNPA":
                OCChecklistCs.Busqueda = $("#busqueda").val();
                break;
        }

        OCChecklistCs.OC();
    }

    // Añadir la clase 'was-validated' para activar los estilos de validación
    $(this).addClass('was-validated');
}

// Cuando el documento se encuentra listo
$(document).ready(function () {
    //CUANDO SE CARGA EL DOCUMENTO (PRIMERA INSTRUCCION)
    LayoutCs.SeriesNumeracionDocs(OCChecklistCs.ObjectCodeSeriesOC);
    // Validación de formularios
    $(document).on('submit', '.needs-validation', ValidacionFormularios);

    //Obtener url consulta
    OCChecklistCs.listoc = $("#OC").attr("urldestino");
    OCChecklistCs.table = OCChecklistCs.OC();

    //EVENTOS
    //Al hacer clock en cualquier fila de la tabla de OC
    $('#OC tbody').on('click', 'tr', function () {
        try {
            //Obtener url consulta
            OCChecklistCs.ocdetails = $("#OC").attr("ocdetails");
            OCChecklistCs.rowdata = OCChecklistCs.table.row(this).data();
            OCChecklistCs.DocEntry = OCChecklistCs.rowdata.DocEntry;
            OCChecklistCs.DocNum = OCChecklistCs.rowdata.Pedido;
            OCChecklistCs.current_row = $(this);
            OCChecklistCs.row = OCChecklistCs.table.row(OCChecklistCs.current_row);

            if (OCChecklistCs.row.child.isShown()) {
                OCChecklistCs.row.child.hide();
                OCChecklistCs.current_row.removeClass('shown');
            }
            else {
                //realizar peticion para obtener detalles
                OCChecklistCs.OCDetail();
            }
        }
        catch (error) {
            alert("No es posible obtener los detalles de la OC, por favor contacte al administrador del sistema con el siguiente código de error: " + error);
            StopLoading();

        }
    });

    //Al seleccionar las series
    $(document).on("click", ".seriesnumeracion", function () {
        // Obtener los atributos 'series' de los checkboxes seleccionados como un array de números
        OCChecklistCs.SerieID = $('.seriesnumeracion:checked').map(function () {
            return parseInt($(this).attr('series')); // Convertir a número entero
        }).get().join(","); // Obtener el array puro

        OCChecklistCs.listoc = $("#OC").attr("urldestino");
        OCChecklistCs.table = OCChecklistCs.OC();
    });
});
