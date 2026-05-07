class HojaEsp {
    constructor() {
        this.recetas = [];
        this.EEsp = [];

    }

   

    async GeteEspecificaciones(itemCode) {
        try {
            //let urlnamelineas = $('body').attr("nombrelineasprod");
            Loading();

            let urlAction = $("#HojaEsp").attr("GetEsp");

            const response = await $.ajax({
                //url: '/Produccion/GetEspecificaciones',
                url: urlAction,
                type: 'POST',
                data: {
                    "itemCode": itemCode,
                }
            });

            //console.log(response);

            if (response.Status == "OK") {
                let nombreLineas = JSON.parse(response.Data);
                let linea = localStorage.getItem("linea");

                if (nombreLineas.length == 0) {
                    LayoutCs.Alerta("Plan de producción", "Los datos de las especificaciones no han sido llenados", "Warning");
                    setTimeout(() => window.history.back(), 4000);
                }
                else {
                    //console.log(nombreLineas[0]);

                    $("#titulo").empty();
                    $("#titulo").append(
                        `
                        <h3>Hoja especificaciones : Línea ${linea}</h3>
                    `
                    );

                    $("#hLinea").empty();
                    $("#hLinea").text(linea);

                    this.AsignarValores(nombreLineas[0]);
                }
               

            }

            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }
            StopLoading();


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();

        }
    }

    async GetHeader() {
        try {
            //let urlnamelineas = $('body').attr("nombrelineasprod");
            Loading();
            let urlAction = $("#HojaEsp").attr("GetHH");

            const response = await $.ajax({
               // url: '/Produccion/GetHeaderHoja',
                url: urlAction,
                type: 'POST',
            });

           // console.log(response);

            if (response.Status == "OK") {
                let header = JSON.parse(response.Data);
                this.AsignarValores(header[0]);
            }

            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }
            StopLoading();


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();

        }
    }

    AsignarValores(datos) {
        let idsNoEncontrados = [];
        let keys = Object.keys(datos);


        keys.forEach((e) => {
            let elemento = "";


            if (!e.includes("EE_")) {
                elemento = $("#h" + e)
            }

            if (elemento.length) {
                let valor = (datos[e] == '' || datos[e] == null )? '--' : datos[e];
                elemento.text(valor);

                if (valor == '--') {
                    elemento.addClass('bg-secondary');
                }
                else {

                    //Validacion para pintar Uniones de Rollo
                    if (e == 'maxunirollo') {
                        valor = parseInt(valor)
                        if (valor > 0) {
                            $("#hunionesrollo").text("Si");
                        }
                        else
                            $("#hunionesrollo").text("No");
                    }  

                    if (e == 'ColorEtiqueta') {
                        $("#divColor").empty();
                        $("#divColor").append(
                            `
                            <h3>${valor}</h3>
                            `
                        );



                        let color = obtenerHexadecimal(valor);

                        if (datos["CodColor"] != null && datos["CodColor"] != "")
                            color = datos["CodColor"]

                        $("#divColor").css("background-color", color);

                    }

                  
                }

                

            }
            else {
               idsNoEncontrados.push(e);
            }

            if (e.includes("Receta")) {
                this.recetas.push(datos[e]);
            }

            //Elementos de Especificaciones Especiales
            if (e.includes("EE_")) {
                let objeto = {
                    "campo": e,
                    "valor": datos[e]
                };

                this.EEsp.push(objeto);
            }

            if (e == "codigocliente") {
                $("#hCliente").text(datos[e]);
            }

        })

        //console.log(this.recetas);
        //console.log(this.EEsp);
        this.pintarRecetas();
        this.pintarEEsp();

        if (idsNoEncontrados.length > 0) {
            console.warn("IDs no encontrados en la vista:", idsNoEncontrados.join(", "));
        }
    }

    pintarRecetas() {
        $("#listaRecetas").empty();

        let filas = "";

        this.recetas.forEach((e, index) => {

            e = e == null ? '' : e;

            filas +=
                `
                 <tr>
                    <td>
                       ${index+1}
                   </td>
                   <td>
                      ${e}
                   </td>
                   <td>
                       0
                   </td>
                 </tr>
                `
        });

        $("#listaRecetas").append(filas);
    }

    //Pintar Especificaciones Especiales
    pintarEEsp() {
        $("#dataExtra").empty();

        let filas = "";

        this.EEsp.forEach((e) => {

            e = e == null ? '' : e;

            let campo = e.campo.replace("EE_", "");

            filas +=
                `
                 <tr>
                    <td>
                       ${campo.replaceAll("_"," ")}
                   </td>
                   <td>
                      ${e.valor}
                   </td>
                 </tr>
                `
        });

        $("#dataExtra").append(filas);
    }


    async UpdateHeader() {
        try {
            //let urlnamelineas = $('body').attr("nombrelineasprod");
            Loading();

            let Tipo = $("#htipoE").val();
            let Plantilla = $("#hplantillaE").val();
            let FechaLib = $("#hFechaLibHE").val();
            let FechaReb = $("#hFechaRebHE").val();
            let urlAction = $("#HojaEsp").attr("UpdateHH");

            const response = await $.ajax({
               // url: '/Produccion/UpdateHeaderHoja',
                url: urlAction,
                type: 'POST',
                data: {
                    "Tipo": Tipo,
                    "Plantilla": Plantilla,
                    "FechaLiberado": FechaLib,
                    "FechaRevisado": FechaReb
                }
            });

            //console.log(response);

            if (response.Status == "OK") {
                LayoutCs.Alerta("Produccion", "Encabezado Modificado correctamente:","OK");
                setTimeout(() => {
                    location.reload();
                }, 2000);
            }

            else {
                LayoutCs.Alerta("Plan de producción", response.Message);
            }
            StopLoading();


        } catch (error) {
            LayoutCs.Excepcion(error, "Plan de producción");
            StopLoading();

        }
    }

    async GetCamposExtras() {
        try {
            //let urlnamelineas = $('body').attr("nombrelineasprod");
            Loading();
            let urlAction = $("#HojaEsp").attr("DatosExtras");

            const response = await $.ajax({
                //url: '/Produccion/GetDatosExtras',
                url: urlAction,
                type: 'POST',
            });

           // console.log(response);

            if (response.Status == "OK") {
                let header = JSON.parse(response.Data);

             //   console.log(header);

                this.pintarDatosExtras(header);
            }

            else {
                LayoutCs.Alerta("Producción", response.Message);
            }
            StopLoading();


        } catch (error) {
            LayoutCs.Excepcion(error, "Producción");
            StopLoading();

        }
    }


    pintarDatosExtras(datos) {
        $("#dataExtra").empty();

        let filas = "";

        datos.forEach((e) => {
            fila +=`   <tr>
                            <td>${e.campo}</td>
                            <td>${e.valor}</td>
                        </tr>`
        });

        $("#dataExtra").append(filas);


    }

}


function obtenerHexadecimal(color) {
    const colores = {
        rojo: "#FF0000",
        verde: "#008000",
        azul: "#0000FF",
        amarillo: "#FFFF00",
        naranja: "#FFA500",
        morado: "#800080",
        rosa: "#FFC0CB",
        negro: "#000000",
        blanco: "#FFFFFF",
        gris: "#808080",
        marrón: "#A52A2A",
        celeste: "#87CEEB",
        turquesa: "#40E0D0",
        violeta: "#EE82EE",
        dorado: "#FFD700",
        plateado: "#C0C0C0"
    };

    return colores[color.toLowerCase()] || "Color no encontrado";
}

LayoutCs.validarUsuario("Producci\u00F3n");

const HE = new HojaEsp();



//FUNCION PRINCIPAL
$(function () {

    if (LayoutCs.u_perfil === "Admin") {
        $(".UpdateH").show();
        $(".editH").show();
    }
    else {
        $(".UpdateH").remove();
        $(".editH").remove();
    }

    let articulo = localStorage.getItem("articulo");

    HE.GetHeader();

    //HE.GeteEspecificaciones('ASUA12/147 LA1');
    HE.GeteEspecificaciones(articulo);

    //Ocultar encabezado y menu lateral
    $(".navbar").attr("style", "display: none !important");
    $("#sidebar").attr("style", "display: none !important");
    $(".main-body").css('max-height', 'none');


    $(".editH").click(function () {
        var label = $(this).siblings("label.labelEdit"); // Selecciona el segundo label
        var currentValue = label.text(); // Obtiene el texto actual del label

        let type = "text";
        let labelId = label.attr('id'); // Obtiene el id del label

        if (labelId != 'hplantilla' && labelId != 'htipo') {
            type = "date"
        }

        // Crea un input con el valor actual del label
        var input = $("<input>", {
            type: type,
            value: currentValue,
            class: "form-control valEdited"
        });

        input.attr("id", labelId + 'E');
        // Reemplaza el label por el input
        label.replaceWith(input);

        $(".UpdateH").attr("disabled", false);
    });

    $(".UpdateH").click(function () {
        HE.UpdateHeader();
    });
})