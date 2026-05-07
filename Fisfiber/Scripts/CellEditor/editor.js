$(document).ready(function () {

    //    var logAllEvents = true;


    //Basic editor
    //  var simpleEditor = new SimpleTableCellEditor("simpleEditableTable");
    //  simpleEditor.SetEditableClass("editMe");

    //  $('#Jornadas').on("cell:edited", function (event) {
    //      console.log(`'${event.oldValue}' changed to '${event.newValue}'`);
    //  });



    //Advanced editor
    var advancedEditor = new SimpleTableCellEditor("OVSelected");
    advancedEditor.SetEditableClass("numericEdit", { validation: $.isNumeric });
    advancedEditor.SetEditableClass("numericTimes100", { validation: $.isNumeric, formatter: (val) => { return val * 100; } });
    advancedEditor.SetEditableClass("editMe");
    advancedEditor.SetEditableClass("customRenderer", {
        internals: {
            renderEditor: (elem, oldVal) => {
                $(elem).html(`<div class="select">
                          <select>
                               <option>Default Local</option>
                               <option>Defautl Visita</option>
                               <option>Victoria</option>
                           </select>
                                <div class="select_arrow">
                                </div>
                            </div>`);

                $("select option").filter(function () {
                    return $(this).val() == oldVal;
                }).prop('selected', true);

            },
            extractEditorValue: (elem) => { return $(elem).find('select').val(); },

        }
    });
    advancedEditor.SetEditableClass("customLine", {
        internals: {
            // Recibe valores dinámicos para el select
            renderEditor: (elem, oldVal) => {


                // Crear el select con las opciones numéricas dinámicas
                var selectHTML = `<div ><select>`;
                opcionesLines.forEach(opcion => {
                    selectHTML += `<option value="${opcion}">${opcion}</option>`;
                });
                selectHTML += `</select><div class="select_arrow"></div></div>`;

                $(elem).html(selectHTML);

                // Seleccionar el valor anterior (oldVal) si existe en el select
                $("select option").filter(function () {
                    return $(this).val() == oldVal;
                }).prop('selected', true);
            },
            extractEditorValue: (elem) => {
                // Obtener el valor seleccionado en el select
                return $(elem).find('select').val();
            }
        }
    });


    // Evento que se dispara cuando se edita una celda(DO SOMETHING)
    //$('table').on("cell:edited", function (element) {              
    //Asignar valor a la columna 6 de acuerdo a los valores colocados
    //Donde element trae el numero de fila y columna que fueron modificados para tomar el valor
    // var table = $("#Jornadas").DataTable();
    //  var rows = $("#Jornadas").dataTable().fnGetNodes();
    //var FilaActual = element.element._DT_CellIndex.row;
    //var ColumnaActual = element.element._DT_CellIndex.column;
    //var EquipoGanador = "";

    // //Dibuja los datos en la fila y columna actual para su procesamiento
    // table.cell(FilaActual,ColumnaActual).data(element.newValue).draw();

    // var EquipoLocal = table.cell(FilaActual,3).data();
    // var EquipoVisitante = table.cell(FilaActual,4).data();
    // //var rows = $("#Jornadas").dataTable().fnGetNodes();
    // // var EquipoLocal = $(rows[FilaActual]).find("td:eq(4)").html();
    // // var EquipoVisitante = $(rows[FilaActual]).find("td:eq(7)").html();
    // if(EquipoLocal > EquipoVisitante){
    //   EquipoGanador = "VictoriaLocal";
    //   $(rows[FilaActual]).find("td:eq(2)").css('font-weight', 'bold');
    //   $(rows[FilaActual]).find("td:eq(5)").removeAttr("style"); 
    // }
    // else if(EquipoVisitante > EquipoLocal){
    // EquipoGanador = "VictoriaVisita";
    // $(rows[FilaActual]).find("td:eq(5)").css('font-weight', 'bold');
    // $(rows[FilaActual]).find("td:eq(2)").removeAttr("style"); 
    // }

    // else if(EquipoLocal === EquipoVisitante){
    // EquipoGanador ="Empate";
    // $(rows[FilaActual]).find("td:eq(2)").removeAttr("style"); 
    // $(rows[FilaActual]).find("td:eq(5)").removeAttr("style"); 
    // }


    // //Dibuja los datos en la columna 8 de la fila actual
    // table.cell(FilaActual,6).data(EquipoGanador).draw();

    //}); 

    //SE EJECUTA CUANDO SE ENTRA EN UNA CELDA A EDITAR
    //    $('table').on("cell:onEditEnter", function (element) {    
    //      var ColumnaActual = element.element._DT_CellIndex.column;
    //    });


    //Se creo especificamente al hacer click en una celda que contenga esa clase(DO SOMETHING)
    //$('#Editable tbody').on('click', '.Default', function () {

    // var table = $('#Jornadas').DataTable();
    // var rows = $("#Jornadas").dataTable().fnGetNodes();
    // $(table).css('font-weight', 'normal');
    // var resultado = "";
    // var FilaActual =  table.cell(this).index().row;
    // var ColumnaActual =  table.cell(this).index().columnVisible;
    // if(ColumnaActual === 2){
    // resultado = "DefaultLocal";
    // $(this).css('font-weight', 'bold');
    // $(rows[FilaActual]).find("td:eq(5)").removeAttr("style"); 
    // // $(this).removeClass('Default');
    // table.cell(FilaActual,3).data('3').draw();
    // table.cell(FilaActual,4).data('0').draw();
    // table.cell(FilaActual,6).data(resultado).draw();
    // }
    // if(ColumnaActual === 5){
    //     resultado = "DefaultVisita";
    //     $(this).css('font-weight', 'bold');
    //     $(rows[FilaActual]).find("td:eq(2)").removeAttr("style"); 
    //     table.cell(FilaActual,4).data('3').draw();
    //     table.cell(FilaActual,3).data('0').draw();
    //     table.cell(FilaActual,6).data(resultado).draw();
    // }

    //});

    //Escribe en consola todo lo que sucede en la tabla
    //    if (logAllEvents) {

    //        $('table').on("cell:onEditEnter", function (event) {
    //            console.log('onEditEnter event');
    //        });

    //        $('table').on("cell:onEditEntered", function (event) {
    //            console.log('onEditEntered event');
    //        });

    //        $('table').on("cell:onEditExit", function (event) {
    //            console.log('onEditExit event');
    //        });

    //        $('table').on("cell:onEditExited", function (event) {
    //            console.log('onEditExited event');
    //        });
    //    }

});
