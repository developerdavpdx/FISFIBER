/**
 * Clase DashboardProduccion
 * Maneja todo el funcionamiento del dashboard de producción incluyendo:
 * - Gráficas con Highcharts
 * - Filtros y fechas
 * - Exportación a PDF
 */
class DashboardProduccion {
    constructor() {

        //Control Polling
        this.pollingConsumidoActivo = false;
        this.intervalConsumido = null;

        this.MATERIALES_CURRENT = [];
        this.INSPECCIONES = [];


        // Configuración inicial y datos simulados 
        this.datosSimulados = {
            enProceso: {
                tendenciaPesos: [10, 11, 12, 19, 17, 12, 10, 12, 10, 10]
            },
            soportes: {
                parosPorDia: [
                    { dia: 1, minutos: 40 },
                    { dia: 2, minutos: 30 },
                    { dia: 3, minutos: 60 },
                    { dia: 4, minutos: 30 },
                    { dia: 5, minutos: 0 },
                    { dia: 6, minutos: 30 },
                    { dia: 7, minutos: 60 },
                    { dia: 8, minutos: 40 },
                    { dia: 9, minutos: 120 },
                    { dia: 10, minutos: 50 }
                ]
            },
            lineaDiaTurno: {
                eficiencia: [1130, 1175, 850, 1107, 1363, 1650, 1875, 2135, 2359, 2646]
            },
            lineaTotal: {
                produccionMensual: [
                    { mes: "Ene", conforme: 17000.9, noConforme: 80, porcentaje: 0.5 },
                    { mes: "Feb", conforme: 14875.4, noConforme: 85, porcentaje: 0.6 },
                    { mes: "Mar", conforme: 13826.5, noConforme: 90, porcentaje: 0.7 },
                    { mes: "Abr", conforme: 13701.7, noConforme: 95, porcentaje: 0.7 },
                    { mes: "May", conforme: 13577.0, noConforme: 100, porcentaje: 7.4 },
                    { mes: "Jun", conforme: 17000.9, noConforme: 105, porcentaje: 0.6 },
                    { mes: "Jul", conforme: 14875.4, noConforme: 110, porcentaje: 0.7 },
                    { mes: "Ago", conforme: 13826.5, noConforme: 115, porcentaje: 0.8 },
                    { mes: "Sep", conforme: 13701.7, noConforme: 120, porcentaje: 0.9 },
                    { mes: "Oct", conforme: 15630.3, noConforme: 125, porcentaje: 0.8 }
                ]
            }
        };

        // Configuración inicial y datos reales
        this.datosReales = {
            enProceso: {
                tendenciaPesos: [10, 11, 12, 19, 17, 12, 10, 12, 10, 10],
                categorias: [],
                PiezasPro: 0,
                Pedido: "XXXX",
                Min: 0,
                Max: 10,
                CantidadPlanificada: 0,
                OF: ""

            },
            soportes: {
                parosPorDia: [
                    { dia: 1, minutos: 40 },
                    { dia: 2, minutos: 30 },
                    { dia: 3, minutos: 60 },
                    { dia: 4, minutos: 30 },
                    { dia: 5, minutos: 0 },
                    { dia: 6, minutos: 30 },
                    { dia: 7, minutos: 60 },
                    { dia: 8, minutos: 40 },
                    { dia: 9, minutos: 120 },
                    { dia: 10, minutos: 50 }
                ],
                MAX: 150
            },
            lineaDiaTurno: {
                eficiencia: [1130, 1175, 850, 1107, 1363, 1650, 1875, 2135, 2359, 2646],
                categorias: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                MAX: 0
            },
            lineaTotal: {
                produccionMensual: [
                    { mes: "Ene", conforme: 17000.9, noConforme: 80, porcentaje: 0.5 },
                    { mes: "Feb", conforme: 14875.4, noConforme: 85, porcentaje: 0.6 },
                    { mes: "Mar", conforme: 13826.5, noConforme: 90, porcentaje: 0.7 },
                    { mes: "Abr", conforme: 13701.7, noConforme: 95, porcentaje: 0.7 },
                    { mes: "May", conforme: 13577.0, noConforme: 100, porcentaje: 7.4 },
                    { mes: "Jun", conforme: 17000.9, noConforme: 105, porcentaje: 0.6 },
                    { mes: "Jul", conforme: 14875.4, noConforme: 110, porcentaje: 0.7 },
                    { mes: "Ago", conforme: 13826.5, noConforme: 115, porcentaje: 0.8 },
                    { mes: "Sep", conforme: 13701.7, noConforme: 120, porcentaje: 0.9 },
                    { mes: "Oct", conforme: 15630.3, noConforme: 125, porcentaje: 0.8 }
                ],
                MAX: 0
            }
        };

        // Arrays para datos dinámicos
        this.tiposFalla = ["PREVENTIVO", "CORRECTIVO"];
        this.rubros = ["FIBRAS", "ELECTRICA", "MECANICA", "PROGRAMADO"];
        this.descripciones = ["CAMBIO DE FIBRAS", "SENSOR", "MALLA", "SEMANAL", "MANTENIMIENTO"];
        this.meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

        // Intervalos para actualizaciones automáticas
        this.intervalMetricas = null;
        this.intervalDatos = null;
        this.currentFecha = {};

        this.currentArt = "";
        this.currentPedido = "";
        this.currentRollos = 0;
        this.currentTendencias = [];
        this.chartTendenciaPesos = null;
        this.chartSoportes = null;
    }

    /**
     * Inicializa el dashboard completo
     * Configura fechas, carga líneas, crea gráficas y establece actualizaciones automáticas
     */
    async inicializar() {
        try {

            Loading();

            // Configurar fechas por defecto (primer y último día del mes actual)
            this.inicializarFechas();

            // Cargar líneas de producción desde el servidor
            let lineasProd = await this.cargarLineasProduccion();
            let familiasArt = await this.cargarFamilias();

            this.poblarSelectLineas(lineasProd, familiasArt);

            // Cargar almacenes desde el servidor
            await this.cargarAlmacenes();

            // Crear todas las gráficas del dashboard
            this.crearTodasLasGraficas();

            // Configurar mes actual en la interfaz
            this.configurarMesActual();

            // Iniciar actualizaciones automáticas
            //this.iniciarActualizacionesAutomaticas();

            console.log('Dashboard inicializado correctamente');

            StopLoading();
        } catch (error) {
            console.error('Error al inicializar dashboard:', error);
            LayoutCs.Excepcion(error, "Inicialización Dashboard");
            StopLoading();
        }
    }

    /**
     * Configura las fechas de inicio y fin con el rango del mes actual
     * Utiliza jQuery para manipular los inputs de fecha
     */
    inicializarFechas() {
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        //const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        const ultimoDia = hoy;

        // Usar jQuery para asignar valores a los inputs de fecha
        $('#fechaInicio').val(primerDia.toISOString().split("T")[0]);
        $('#fechaFin').val(ultimoDia.toISOString().split("T")[0]);
    }

    /**
     * Carga las líneas de producción disponibles desde el servidor
     * Ordena numéricas y alfanuméricas por separado para mejor visualización
     */
    async cargarLineasProduccion() {
        try {
            const urlLineas = $('body').attr("nombrelineasall");

            const response = await $.ajax({
                url: urlLineas,
                type: 'POST',
                dataType: 'JSON'
            });

            if (response.Status === "OK") {
                let nombreLineas = JSON.parse(response.Data);

                // Separar y ordenar líneas numéricas y alfanuméricas
                const lineasOrdenadas = this.ordenarLineas(nombreLineas);

                // console.log('Líneas cargadas:', lineasOrdenadas);
                return lineasOrdenadas;

                // Poblar el select de filtro 
                //this.poblarSelectLineas(lineasOrdenadas);

            } else {
                LayoutCs.Alerta("Dashboard", response.Message);

                return [];
            }
        } catch (error) {
            LayoutCs.Excepcion(error, "Cargar Líneas");
            console.error('Error al inicializar dashboard:', error);
            throw error;

            return [];
        }
    }


    /**
     * Carga los almacenes productivos desde el servidor
     * Ordena de forma numerica
     */
    async cargarAlmacenes() {
        try {
            const urlAlmacenes = $('#mainDash').attr("GetAlmacenes");

            const response = await $.ajax({
                url: urlAlmacenes,
                type: 'POST',
                dataType: 'JSON'
            });

            if (response.Status === "OK") {
                let almacenes = JSON.parse(response.Data);

                if (almacenes.length > 0) {
                    const listaAlmacenes = almacenes
                    // Poblar el select de filtro 
                    this.poblarSelectAlmacenes(listaAlmacenes);
                    // console.log('Almacenes cargados:', listaAlmacenes);
                } else {
                    LayoutCs.Alerta(
                        "Carga Almacenes",
                        "No se encontraron almacenes productivos",
                        "Warning");
                    console.warn("Carga Almacenes no se encontraron almacenes productivos");
                }



            } else {
                LayoutCs.Alerta("Dashboard", response.Message);
            }
        } catch (error) {
            LayoutCs.Excepcion(error, "Cargar Almacenes");
            console.error('Error al inicializar dashboard:', error);
            throw error;

        }
    }

    /**
   * Carga las familias de articulos desde el servidor
   * Ordena de forma alfabetica
   */
    async cargarFamilias() {
        try {

            //@Url.Action("GetFamiliaArt","Dashboard")
            const urlFamilias = $('#mainDash').attr("GetFamilias");

            const response = await $.ajax({
                url: urlFamilias,
                type: 'POST',
                dataType: 'JSON'
            });

            if (response.Status === "OK") {
                let familias = JSON.parse(response.Data);

                if (familias.length > 0) {
                    return familias;
                } else {
                    LayoutCs.Alerta(
                        "Carga Familias Articulos",
                        "No se encontraron familias de articulos",
                        "Warning");
                    console.warn("Carga Familias no se encontraron familias de articulos");

                    return [];
                }
            } else {
                LayoutCs.Alerta("Dashboard", response.Message);
                return [];

            }
        } catch (error) {
            LayoutCs.Excepcion(error, "Cargar Familias");
            console.error('Error al inicializar dashboard:', error);

            throw error;
            return [];

        }
    }


    /**
     * Ordena las líneas separando numéricas y alfanuméricas
     * @param {Array} lineas - Array de objetos con propiedad Linea
     * @returns {Array} - Array ordenado
     */
    ordenarLineas(lineas) {
        const numericos = [];
        const noNumericos = [];

        // Separar líneas numéricas de alfanuméricas
        lineas.forEach(item => {
            if (/^\d+$/.test(item.Linea)) {
                numericos.push(item);
            } else {
                noNumericos.push(item);
            }
        });

        // Ordenar numéricas por valor numérico
        numericos.sort((a, b) => Number(a.Linea) - Number(b.Linea));

        // Ordenar alfanuméricas por longitud de string
        noNumericos.sort((a, b) => b.Linea.length - a.Linea.length);

        return [...numericos, ...noNumericos];
    }

    /**
     * Pobla el select de líneas con las opciones obtenidas del servidor
     * @param {Array} lineas - Líneas ordenadas
     */
    poblarSelectLineas(lineas, familias) {
        const $filtroLinea = $('#filtroLinea');
        $filtroLinea.empty();

        let opLineas = '<optgroup label="LINEAS">';
        let opFam = '<optgroup label="GRUPO ARTICULOS">';
        // opLineas += `<option value="" selected>Selecciona una línea</option>`;
        lineas.forEach(linea => {
            opLineas += `<option value="${linea.Linea}">${linea.Linea}</option>`;
        });

        opLineas += '</optgroup>'

        //opLineas += `<option value="" selected>Selecciona una línea</option>`;
        familias.forEach(f => {
            opFam += `<option value="${f.NumFamilia}">LINEAS ${f.Familia}</option>`;
        });
        opFam += '</optgroup>'

        let opciones = opLineas + opFam;
        $filtroLinea.append(opciones);
    }

    /**
    * Pobla el select de almacenes con las opciones obtenidas del servidor
    * @param {Array} almacenes - Almacenes ordenados
    */
    poblarSelectAlmacenes(almacenes) {
        const $filtroAlmacen = $('#filtroAlmacen');
        let opciones = `<option value="">Todos</option>`;
        $filtroAlmacen.empty();

        almacenes.forEach(a => {
            opciones += `<option value="${a.WhsCode}">${a.WhsCode}</option>`;
        });

        $filtroAlmacen.append(opciones);
    }


    cleanTableTurnosLDT() {
        $("#LDT_InfoTurnos").empty();
    }

    /**
    * Pobla la tabla de turnos con las opciones obtenidas del servidor
    * @param {Array} turnos - Turnos ordenados
    */
    poblarTableTurnosLDT(turnos, ncTurnos, infoG) {


        let tempRow = `<tr>
                         <td><strong>{{TURNO}}</strong></td>
                         <td>{{KILOS}}</td>
                         <td>{{METROS}}</td>
                         <td>{{EFI}}</td>
                         <td>{{HRSPRO}}</td>
                         <td>{{HRSP}}</td>
                         <td>{{NCKILOS}}</td>
                         <td>{{NCMETROS}}</td>
                       </tr>`;

        $("#LDT_InfoTurnos").empty();
        if (turnos.length > 0) {

            let opciones = '';

            let TotalNCK = 0, TotalNCM = 0, TotalKP = 0, TotalMetros = 0;

            console.group("CALCULOS EFI POR TUNRNO");
            turnos.forEach((t) => {

                let nc = ncTurnos.find((e) => e.Turno == t.Turno)
                let ncK = 0, ncM = 0;
                let ncEfi = 0;



                if (nc) {
                    ncK = nc.TotalProduccionKilos;
                    ncM = nc.TotalProduccionMetros;


                    // $("#LDT_NCMeta").text(nc.Meta);
                    // $("#LDT_NCTolerancia").text(nc.Tolerancia);

                    //let hrsProg = (nc.MinHabiles / 60) * 24;
                    let MinEfi = (t.TotalHorasProg * 60) - t.MinParo;
                    let minHabiles = nc[`MinProg${t.Turno}`] - nc.MinT;
                    let hrsProg = (minHabiles / 60) * 24;
                    let totalPro = ncK;

                    if (totalPro > 0 && hrsProg > 0) {
                        ncEfi = totalPro / hrsProg;
                    }

                    //    console.log(`NC-EFI. TURNO ${nc.Turno} : 
                    //KILOSF: ${totalPro} MinutosPro ${nc.MinProg} MinParo ${nc.MinT}`)
                    //    console.log(`${totalPro} / [ ( ${nc.MinProg} - ${nc.MinT} ) / 60 ] = ${ncEfi}`)

                }

                TotalNCK += ncK;
                TotalNCM += ncM;

                //CALCULO EFICIENCIA POR TURNO
                //0.- Obtener min prog por turno
                let MinProgTurno = t[`MinProg${t.Turno}`];
                let HrsEnParoTurno = (t.MinT / 60).toFixed(2);
                let HrsProgTurno = (MinProgTurno / 60).toFixed(2);
                //1.- Minutos Programados -  Minutos en paros
                let MinHabiles = MinProgTurno - t.MinT;
                //2.- MinHabiles se pasa a horas 
                let hrsProg = (MinHabiles / 60);
                //3.- Total Producción 
                let totalPro = t.Kilos;
                let kilosProgramados = infoG.EP * hrsProg;
                let eficienciaAlcanzada = 0;

                if (kilosProgramados > 0) {
                    eficienciaAlcanzada = (totalPro / kilosProgramados) * 100;
                }

                let percentPro = porcentaje(t.Kilos, ncK);
                TotalKP += t.Kilos;
                TotalMetros += t.Metros;

                opciones += tempRow
                    .replace("{{TURNO}}", t.Turno)
                    .replace("{{KILOS}}", formatearNumero(t.Kilos))
                    .replace("{{METROS}}", formatearNumero(t.Metros))
                    .replace("{{EFI}}", formatearNumero(eficienciaAlcanzada) + "%")
                    .replace("{{HRSPRO}}", HrsProgTurno)
                    .replace("{{HRSP}}", HrsEnParoTurno)
                    .replace("{{NCKILOS}}", formatearNumero(ncK))
                    .replace("{{NCMETROS}}", percentPro)
            });
            console.groupEnd();

            $("#LDT_InfoTurnos").append(opciones);
            $("#LDT_NCKilos").text(TotalNCK.toFixed(2));
            $("#LDT_NCPor").text(porcentaje(TotalKP, TotalNCK));
            $("#LDT_TotalProSum").text(formatearNumero(TotalKP));
            $("#LDT_TotalMetrosSum").text(formatearNumero(TotalMetros));

        }
    }

    groupByTurnos(arr) {
        // Usamos reduce para ir acumulando por cada "Turno"
        const resultado = arr.reduce((acumulador, actual) => {
            const turno = actual.Turno;

            // Si aún no existe ese turno, lo inicializamos
            if (!acumulador[turno]) {
                acumulador[turno] = {
                    Turno: turno,
                    Kilos: 0,
                    Metros: 0,
                    Registros: 0,
                    Dias: 0,
                    TotalHorasProg: 0,
                    HorasProg: 0,
                    TotalHorasEf: 0,
                    EfiPro: 0,
                    MinParo: 0,
                    TotalNC: 0
                };
            }

            // Sumamos cada campo numérico (con fallback para nulls o strings)
            acumulador[turno].Kilos += Number(actual.Kilos) || 0;
            acumulador[turno].Metros += Number(actual.Metros) || 0;
            acumulador[turno].Registros += Number(actual.Registros) || 0;
            acumulador[turno].Dias += Number(actual.Dias) || 0;
            acumulador[turno].TotalHorasProg += Number(actual.TotalHorasProg) || 0;
            acumulador[turno].HorasProg += Number(actual.HorasProg) || 0;
            acumulador[turno].TotalHorasEf += Number(actual.TotalHorasEf) || 0;
            acumulador[turno].EfiPro += Number(actual.EfiPro) || 0;
            acumulador[turno].MinParo = Number(actual.MinParo) || 0;
            acumulador[turno].TotalNC += Number(actual.TotalNC) || 0;

            return acumulador;
        }, {});

        // Convertimos el objeto en arreglo
        return Object.values(resultado);
    }


    /**
    * TABLA DE LINEA TOTAL 
    * Pobla la tabla de turnos con las opciones obtenidas del servidor
    * @param {Array} turnos - Turnos ordenados
    * @param {Array} ncTurnos - Turnos ordenados (No conforme)
    */
    poblarTableTurnosMesLT(
        turnos, ncTurnos, diasLab,
        horasProg1, horasProg2, horasProg3,
        TPH, efiProg) {

        //TOTALES CONFORME
        let totalK = 0, totalM = 0;
        let totalHorasParo = 0, totalHrsProg = 0;
        let totalHrsEfec = 0, totalEfiProg = 0, sumEfiProg = 0;
        let MaxDias = 0;

        let objHorasProg =
        {
            "1": horasProg1,
            "2": horasProg2,
            "3": horasProg3
        };

        //TOTALES NO CONFORME
        let totalKNC = 0, totalDias = 0;
        let totalNCHorasParo = 0, totalNCHrsProg = 0;

        const calPer = (total, cantidad) => {

            let result = 0;

            if (total > 0 && cantidad > 0) {
                result = (cantidad / total) * 100
            }

            return result.toFixed(2);
        };


        if (Array.isArray(turnos)) {

            console.group("CALCULOS LINEA TOTAL POR TURNO");


            //data - bs - title="% de Hrs Paro respecto a  Hrs Programadas"
            console.log("Dias laborados por turno");
            console.log(diasLab);

            turnos.forEach((t) => {
                if (t.Turno != null) {
                    let idT = `#TL_T${t.Turno}`, keyLab = `DiasTurno${t.Turno}`;
                    let diasLabTurno = diasLab[keyLab] || 0;
                    let horasProg = objHorasProg[t.Turno];
                    let TotalHP = horasProg * diasLabTurno;
                    let minutosProg = (TotalHP * 60);
                    $(`${idT}DiasLab`).text(diasLabTurno);
                    $(`${idT}Kilos`).text(formatearNumero(t.Kilos));
                    $(`${idT}Metros`).text(formatearNumero(t.Metros));
                    $(`${idT}KilosProD`).text(formatearNumero((t.Kilos / diasLabTurno).toFixed(2)));
                    $(`${idT}MetrosProD`).text(formatearNumero((t.Metros / diasLabTurno).toFixed(2)));
                    $(`${idT}HP`).text(formatearNumero(TotalHP));

                    //Horas en paro en el turno
                    let hrsParo = t.MinParo / 60;
                    $(`${idT}H`).text(calPer(horasProg * diasLabTurno, TotalHP) + '%');

                    //HORAS EFECTICAS = HRS PROGRAMADAS - HRS PARO
                    let hrsEfectivas = TotalHP - hrsParo
                    $(`${idT}HH`).text(formatearNumero(hrsEfectivas));
                    //$(`${idT}HE`).text(((hrsEfectivas / t.TotalHorasProg) * 100).toFixed(2) + '%');
                    $(`${idT}HE`).text(calPer(TotalHP, hrsEfectivas) + '%');

                    totalHrsEfec += (hrsEfectivas > 0) ? hrsEfectivas : 0;

                    //EFICIENCIA EFECTIVA
                    //let EE = 0
                    //if (t.Kilos > 0 && hrsEfectivas > 0) {
                    //    EE = t.Kilos / hrsEfectivas //(hrsEfectivas * 24)
                    //}
                    //$(`${idT}EEH`).text(EE.toFixed(2));


                    let efi = parseFloat(t.EfiPro), hrsProg = parseFloat(t.HorasProg);
                    let respEfi = 0;

                    if (efi > 0 && hrsProg > 0) {
                        respEfi = efi / (hrsProg * 24);
                    }

                    //EFICIENCIA PROGRAMADA
                    //Horas Efectivas * Eficiencia Programada (Kg*Hora)
                    const EfiProgramada = hrsEfectivas * efiProg;
                    $(`${idT}EPH`).text(formatearNumero(EfiProgramada));
                    sumEfiProg += EfiProgramada;

                    //Calcular EFICIENCIA EFECTIVA
                    //hrsEfectivas = TotalHP - hrsParo; //t.TotalHorasEf - hrsParo;
                    $(`${idT}EEP`).text(calPer(EfiProgramada, t.Kilos) + '%');


                    const EfiEfectiva = t.Kilos / hrsEfectivas;
                    $(`${idT}EEH`).text(formatearNumero(EfiEfectiva));


                    totalK += t.Kilos;
                    totalM += t.Metros;
                    //totalDias += t.Dias;
                    //setMaxD(t.Dias);
                    totalHorasParo += hrsParo;
                    totalHrsProg += ((minutosProg - t.MinParo) / 60);
                    totalEfiProg += t.TotalHorasEf;
                }
            });

            console.groupEnd();

            $("#TL_TotalKilos").text(formatearNumero(totalK.toFixed(2)));
            $("#TL_TotalMetros").text(formatearNumero(totalM));
            $("#TL_KProDia").text(formatearNumero((totalK / diasLab.DiasLaborados).toFixed(2)));
            $("#TL_MProDia").text(formatearNumero((totalM / diasLab.DiasLaborados).toFixed(2)));
            $("#TL_TotalHrsProg").text(formatearNumero(TPH * diasLab.DiasLaborados));
            LDT_InfoTurnos
            // % DE HORAS PARO RESPECTO AL TOTAL DE HORAS PROGRAMADAS
            $("#TL_TotalPerHrs").text(calPer((TPH * diasLab.DiasLaborados), totalHorasParo) + "%");
            //Horas Efectivas = TotalHorasProg - HorasParo
            $("#TL_TotalHrsEfect").text(formatearNumero(totalHrsEfec));
            //Porcentaje de HorasEfectivas respecto a TotalHorasProg
            $("#TL_TotalPerHrsEfect").text(calPer((TPH * diasLab.DiasLaborados), totalHrsEfec) + "%");



            // TOTAL EFICIENCIA PROG = EFICIENCIA * DIAS LABORADOS
            $("#TL_TotalEfiProg").text(formatearNumero(sumEfiProg));
            $("#TL_TotalEfiEfecPer").text(calPer(sumEfiProg, totalK) + "%");
            //kilos producidos / horas efectivas
            $("#TL_TotalEfiEfec").text(formatearNumero(divValida(totalK / totalHrsEfec)));

            //$("#TL_DiasLab").text(diasLab);
            $("#mesActual").text(this.currentFecha.mesNombre + " " + this.currentFecha.anio)
        }
        else {
            LayoutCs.Alerta(
                "Turnos Mes",
                "La informacion de turnos esta vacia",
                "Warning");

            console.warn("poblarTableTurnosMesLT : La informacion de turnos no es un array...")
        }

        if (Array.isArray(ncTurnos)) {

            ncTurnos.forEach((t) => {
                if (t.Turno != null) {
                    let idT = `#TL_T${t.Turno}`;
                    $(`${idT}NCH`).text(t.TotalProduccionKilos);
                    // TotalNC / TOTAL P
                    let totalP = $(`${idT}Kilos`).text().replace(",", "").trim();
                    totalP = parseFloat(totalP)
                    //$(`${idT}NCP`).text(((t.TotalProduccionKilos / totalP) * 100).toFixed(2) + "%");
                    $(`${idT}NCP`).text(calPer(totalP, t.TotalProduccionKilos) + "%");

                    totalKNC += t.TotalProduccionKilos
                    totalNCHrsProg += t.MinProg;
                    totalNCHorasParo += t.MinT;

                    //EFICIENCIA SCRAP
                    let totalKilosPro = totalP //$(`${idT}Kilos`).text().trim();
                    //totalKilosPro = parseFloat(totalKilosPro);
                    //$(`${idT}EEP`).text(((t.TotalProduccionKilos/totalKilosPro)*100).toFixed(2)+"%");
                    //$(`${idT}EEP`).text(calPer(totalKilosPro, t.TotalProduccionKilos)+"%");

                }
            });

            if (totalNCHrsProg > 0)
                totalNCHrsProg = totalNCHrsProg / 60;

            if (totalNCHorasParo > 0)
                totalNCHorasParo = totalNCHorasParo / 60;
        }
        else {
            LayoutCs.Alerta(
                "Turnos Mes",
                "La informacion de turnos esta vacia",
                "Warning");

            console.warn("poblarTableTurnosMesLT : La informacion de turnos no es un array...")
        }

        $("#TL_TotalNCK").text(formatearNumero(totalKNC));
        let perNC = porcentaje(totalK, totalKNC);
        $("#TL_TotalNCPer").text(perNC + "%");
        //$("#TL_TotalNCHrsProg").text(totalNCHrsProg.toFixed(2));

        //let PerHrs = 0;
        //if (totalNCHorasParo > 0 && totalNCHrsProg > 0) {
        //    PerHrs = ((totalNCHorasParo / totalNCHrsProg) * 100).toFixed(2)
        //}

        //$("#TL_TotalNCPerHrs").text( PerHrs+"%");

    }

    poblarTableParos(paros) {


        let tempRow = `<tr>
                        <td>{{HPARO}}</td>
                        <td>{{MINP}}</td>
                        <td>{{TFALLA}}</td>
                        <td>{{RUBRO}}</td>
                        <td>{{DESC}}</td>
                        <td>{{OT}}</td>
                       </tr>`;

        $("#tablaSoportes").empty();
        if (paros.length > 0) {

            let rows = '';

            paros.forEach((p) => {
                rows += tempRow
                    .replace("{{HPARO}}", p.Fecha)
                    .replace("{{MINP}}", p.MinutosDeParo)
                    .replace("{{TFALLA}}", p.TipoMantenimiento)
                    .replace("{{RUBRO}}", p.Rubro)
                    .replace("{{DESC}}", p.MotivoReparacion)
                    .replace("{{OT}}", p.OrdenTrabajo)
            });

            $("#tablaSoportes").append(rows);

        }
    }

    poblarTableInspecciones(inspec) {


        let tempRow = `<tr>
                        <td>{{FECHA}}</td>
                        <td>{{PEDIDO}}</td>
                        <td>{{PRO}}</td>
                        <td>{{CONFORME}}</td>
                        <td>{{LOTE}}</td>
                        <td>{{ESTATUS}}</td>
                        <td>{{ETAPA}}</td>
                        <td>{{ANCHO}}</td>
                        <td>{{PESO}}</td>
                        <td>{{GM2}}</td>
                       </tr>`;

        $("#tablaInspeccion").empty();
        if (inspec.length > 0) {

            let rows = '';

            inspec.forEach((p) => {
                rows += tempRow
                    .replace("{{FECHA}}", p.FechaIns)
                    .replace("{{PEDIDO}}", p.Pedido)
                    .replace("{{PRO}}", p.Producto)
                    .replace("{{CONFORME}}", p.Conforme)
                    .replace("{{LOTE}}", p.Lote)
                    .replace("{{ESTATUS}}", p.EstatusConf)
                    .replace("{{ETAPA}}", p.EtapasConcatenadas)
                    .replace("{{ANCHO}}", p.Ancho)
                    .replace("{{PESO}}", p.Peso)
                    .replace("{{GM2}}", p.GM2)
            });

            $("#tablaInspeccion").append(rows);

        }
        else {
            $("#tablaInspeccion").append(
                `<tr>
                    <td colspan="7" class="text-center text-muted">Sin información de inspecciones ....</td>
                </tr>`);
        }
    }


    poblarSelectAlmByPedido(listaAlm) {

        // <option selected>SA</option>
        // <option value="1">One</option>
        $("#AlmPedido").empty();

        if (listaAlm == "" || listaAlm == null) {

            $("#AlmPedido").append('<option selected>Sin Almacenes</option>');
            return;
        }

        let arrayAlm = listaAlm.split(",");
        let tempOp = `<option value="{{VAL}}">{{VAL}}</option>`;
        let opciones = '<option selected>Selecciona Almacén</option>';

        arrayAlm.forEach((e) => {
            opciones += tempOp.replaceAll("{{VAL}}", e);
        });

        $("#AlmPedido").append(opciones);
    }

    /**
     * Crea todas las gráficas del dashboard usando Highcharts
     * Cada gráfica tiene configuraciones específicas y datos simulados
     */
    crearTodasLasGraficas() {
        // Gráfica 1: Tendencia de pesos en proceso
        this.crearGraficaTendenciaPesos();

        // Gráfica 2: Paros correctivos por día
        this.crearGraficaParos();

        // Gráfica 3: Eficiencia por hora
        this.crearGraficaEficiencia();

        // Gráfica 4: Producción mensual conforme/no conforme
        this.crearGraficaProduccionMensual();
    }

    /**
     * Crea la gráfica de tendencia de pesos del artículo en proceso
     */
    async crearGraficaTendenciaPesos(pedido = "XXXX", lastNumR = 10) {
        console.time("TIEMPO CREACION TENDENCIA PESOS");
        Loading();


        const getLastRollos = (lastR) => {

            let rollos = [];

            for (let i = lastR - 10; i <= lastR; i++) {
                if (i >= 0) {
                    rollos.push((i + 1).toString());
                }
            }

            rollos.reverse();

            return rollos;
        }




        //Obtener data de tendencia pesos
        let Linea = $("#filtroLinea").val();
        let Ltext = $('#filtroLinea option:selected').text();

        await this.manejarCambioLinea(Linea, Ltext);

        let LR = getLastRollos(this.datosReales.enProceso.tendenciaPesos.length)
        //let LR = this.datosReales.enProceso.categorias;
        // Define tu rango aceptable
        const pesoMinimo = this.datosReales.enProceso.Min;
        //const pesoMinimo = 19;
        const pesoMaximo = this.datosReales.enProceso.Max;
        //const pesoMaximo = 22;


        // Uso de la función
        const limites = calcularLimitesEscala(
            this.datosReales.enProceso.Min,
            Math.max(...this.datosReales.enProceso.tendenciaPesos)
        );

        const MIN = limites.MIN;
        const MAX = limites.MAX;

        // Procesa los datos para identificar puntos fuera de rango
        const dataProcesada = this.datosReales.enProceso.tendenciaPesos.map(peso => {
            if (peso > pesoMaximo || peso < pesoMinimo) {
                return {
                    y: peso,
                    color: 'rgb(140, 27, 36)', // Rojo para fuera de rango
                    marker: {
                        // radius: 8,
                        lineWidth: 2,
                        lineColor: 'rgb(140, 27, 36)'
                    }
                };
            }


            return peso; // Valor normal
        });


        this.chartTendenciaPesos = Highcharts.chart("chartEnProceso", {
            chart: {
                type: "line",
                height: 300
            },
            title: {
                text: `ARTÍCULO TENDENCIA DE PESOS PEDIDO ${this.datosReales.enProceso.Pedido}`
            },
            xAxis: {
                categories: LR
            },
            yAxis: {
                title: {
                    text: "Peso (kg)"
                },
                min: MIN,  // Valor mínimo del eje Y
                max: MAX,  // Valor máximo del eje Y
                // Opcional: controlar los intervalos de las marcas
                tickInterval: 5, // Marca cada 5 kg (10, 15, 20, 25, 30, 35, 40)
            },
            series: [{
                name: "Tendencia de Pesos",
                data: dataProcesada.slice(0, 10),
                color: "#4A4A4A",
                marker: {
                    radius: 6
                }
            }],
            legend: {
                enabled: false
            },
            tooltip: {
                formatter: function () {
                    const fueraDeRango = this.y < pesoMinimo || this.y > pesoMaximo;
                    return `<b>${this.x}</b><br/>` +
                        `Peso: ${this.y} kg` +
                        (fueraDeRango ? '<br/><span style="color:red">⚠ Fuera de rango</span>' : '');
                }
            }
        });

        StopLoading();
    }

    /**
     * Crea la gráfica de paros correctivos con colores según severidad
     */
    async crearGraficaParos() {

        let FI = $("#fechaInicio").val()
        let FF = $("#fechaFin").val()
        let Linea = $("#filtroLinea").val()
        let GrupoArticulos = $("#filtroLinea").val()
        let Turno = $("#filtroTurno").val()
        let textLinea = $('#filtroLinea option:selected').text();

        if (textLinea.includes("LINEAS")) {
            Linea = "";
        }
        else {
            GrupoArticulos = "";
        }

        //SIN await, puesto que tarda mas que las demas consultas
        //por lo que no espero para que no paresca lento
        //this.obtenerInfoInspec(Linea, Turno, GrupoArticulos);

        //await this.obtenerInfoParos(FI, FF, Linea, Turno, GrupoArticulos);

        // Lanzar ambas en paralelo
        const promesaInspec = this.obtenerInfoInspec(Linea, Turno, GrupoArticulos);
        const promesaParos = this.obtenerInfoParos(FI, FF, Linea, Turno, GrupoArticulos);

        // Esperar solo la que necesitas
        await promesaParos;

        // La de inspección seguirá ejecutándose en background



        // Destruir si existe
        if (this.chartSoportes) {
            this.chartSoportes.destroy();
        }

        let MAX = this.datosReales.soportes.MAX;

        this.chartSoportes = Highcharts.chart("chartSoportes", {
            chart: {
                type: "column",
                height: 300
            },
            title: {
                text: "PAROS CORRECTIVO minutos por día"
            },
            xAxis: {
                categories: this.datosReales.soportes.parosPorDia.map(item => item.dia.toString())
            },
            yAxis: {
                title: {
                    text: "Minutos"
                },
                max: MAX
            },
            series: [{
                name: "Minutos en Paro",
                data: this.datosReales.soportes.parosPorDia.map(item => ({
                    y: item.minutos,
                    color: item.minutos > 180 ? "rgb(140, 27, 36)" :
                        item.minutos > 120 ? "rgb(181, 181, 181)" : "rgb(74, 74, 74)"
                })),
                dataLabels: {
                    enabled: true,
                    format: "{y}"
                }
            }],
            legend: {
                enabled: false
            }
        });
    }

    limpiarGraficaLineaDiaTurno() {

        const chart = Highcharts.charts.find(c =>
            c && c.renderTo.id === "chartLineaDiaTurno"
        );

        if (!chart) return;

        // Vaciar categorías
        chart.xAxis[0].setCategories([]);

        // Vaciar datos
        chart.series[0].setData([]);

    }


    /**
     * Crea la gráfica de eficiencia por hora del día-turno
     */
    async crearGraficaEficiencia() {

        let Linea = $("#filtroLinea").val()
        let FI = $("#fechaInicio").val()
        let FF = $("#fechaFin").val()
        let Alm = $("#filtroAlmacen").val()
        let NumFam = $('#filtroLinea option:selected').text();


        if (NumFam.includes("LINEAS")) {
            NumFam = Linea
            //console.log(NumFam);
            Linea = "";
        }
        else {
            NumFam = 0;
        }

        this.limpiarGraficaLineaDiaTurno();

        await this.obtenerInfoLDT(Linea, FI, FF, Alm, NumFam)

        Highcharts.chart("chartLineaDiaTurno", {
            chart: {
                type: "line",
                height: 300
            },
            title: {
                text: "EFICIENCIA Meq/h"
            },
            xAxis: {
                categories: [...this.datosReales.lineaDiaTurno.categorias]
            },
            yAxis: {
                title: {
                    text: "Eficiencia (Meq/h)"
                },
                min: 0,
                max: this.datosReales.lineaDiaTurno.MAX //Alimentado desde el config, recibido desde controler en la vista
            },
            series: [{
                name: "Eficiencia",
                data: this.datosReales.lineaDiaTurno.eficiencia,
                color: "rgb(74, 74, 74)",
                marker: {
                    radius: 5
                },
                dataLabels: {
                    enabled: true,
                    format: "{y}"
                }
            }],
            legend: {
                enabled: false
            }
        });
    }

    /**
     * Crea la gráfica de producción mensual con barras y línea de porcentaje
     * Grafica 4 - LINEA TOTAL
     */
    async crearGraficaProduccionMensual() {

        let Linea = $("#filtroLinea").val();
        let FI = $("#fechaInicio").val();
        let FF = $("#fechaFin").val();
        let Alm = $("#filtroAlmacen").val();
        let NumFam = $('#filtroLinea option:selected').text();


        if (NumFam.includes("LINEAS")) {
            NumFam = Linea
            console.log(NumFam);
            Linea = "";
        }
        else {
            NumFam = 0;
        }

        //Limpia campos de la tabla de la grafica
        $('.infoData td').each(function () {
            if ($(this).find('strong').length === 0) {
                $(this).text(''); // elimina el texto dentro del td
            }
        });

        let dataFecha = getInfoMes(FI);

        this.currentFecha = dataFecha;

        await this.obtenerInfoLT(Linea, FI, FF, NumFam);

        await this.obtenerInfoMolidos(Linea, FI, FF, NumFam);


        Highcharts.chart("chartLineaTotal", {
            chart: {
                type: "column",
                height: 400
            },
            title: {
                text: `Producción Total conforme-no conforme-% del ${dataFecha.dInicio} a la ${dataFecha.dFin} del ${dataFecha.mesNombre} ${dataFecha.anio} (kilos)`
            },
            xAxis: {
                categories: this.datosReales.lineaTotal.produccionMensual.map(item => item.mes)
            },
            yAxis: [{
                title: {
                    text: "Producción (kilos)"
                },
                min: 0,
                max: this.datosReales.lineaTotal.MAX
            }, {
                title: {
                    text: "Porcentaje (%)"
                },
                min: 0,
                max: 10,
                opposite: true
            }],
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true,
                        format: "{y:.1f}"
                    }
                }
            },
            series: [

                {
                    name: "Conforme",
                    //data: this.datosReales.lineaTotal.produccionMensual.slice(0, 10).map(item => item.conforme),
                    data: this.datosReales.lineaTotal.produccionMensual.map(item => item.conforme),
                    color: "rgb(74, 74, 74)",
                    yAxis: 0
                }
                //{
                //        name: "Conforme",
                //        data: this.datosReales.lineaTotal.produccionMensual.map(item => ({
                //            y: item.conforme,
                //            nota: item.notaScrap || "Conforme",
                //            dataLabels: {
                //                enabled: true,
                //                format: "{point.nota}"
                //            }
                //        })),
                //        color: "rgb(74, 74, 74)",
                //        yAxis: 0
                //    }


                , {
                    name: "No Conforme",
                    //data: this.datosReales.lineaTotal.produccionMensual.map(item => item.noConforme),
                    data: this.datosReales.lineaTotal.produccionMensual.map(item => ({
                        y: item.noConforme,
                        nota: item.notaScrap || "No Conforme",
                        dataLabels: {
                            enabled: true,
                            format: "{point.nota}"
                        }
                    })),
                    color: "rgb(140, 27, 36)",
                    yAxis: 0
                }, {
                    name: "Porcentaje",
                    type: "line",
                    //data: this.datosReales.lineaTotal.produccionMensual.slice(0, 10).map(item => item.porcentaje),
                    data: this.datosReales.lineaTotal.produccionMensual.map(item => item.porcentaje),
                    color: "rgb(181, 181, 181)",
                    yAxis: 1,
                    marker: {
                        radius: 4
                    }
                }]
        });
    }

    /**
     * Aplica los filtros seleccionados por el usuario
     * Obtiene valores de los controles y actualiza las gráficas
     */
    //aplicarFiltros() {
    //    // Obtener valores 
    //    const linea = $('#filtroLinea').val();
    //    const fechaInicio = $('#fechaInicio').val();
    //    const fechaFin = $('#fechaFin').val();

    //    //console.log("Filtros aplicados:", { linea, fechaInicio, fechaFin });

    //    // Actualizar rango de fechas en la interfaz
    //    if (fechaInicio && fechaFin) {
    //        $('#fechaRango').text(`${fechaInicio} - ${fechaFin}`);
    //    }

    //    // Recrear gráficas con datos filtrados
    //    this.crearTodasLasGraficas();

    //    // Mostrar confirmación
    //    //alert("Filtros aplicados correctamente");
    //}

    aplicarFiltros() {

        const linea = $('#filtroLinea').val();
        const fechaInicio = $('#fechaInicio').val();
        const fechaFin = $('#fechaFin').val();

        $('#fechaInicio').removeClass('is-invalid');
        $('#fechaFin').removeClass('is-invalid');


        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaInicio) {
            const fInicio = new Date(fechaInicio);
            if (fInicio > hoy) {
                $('#fechaInicio').addClass('is-invalid');


                LayoutCs.Alerta(
                    "Fecha Seccionada",
                    "La fecha inicio no puede ser mayor al día actual.",
                    "Warning"
                );
                return;
            }
        }

        if (fechaFin) {
            const fFin = new Date(fechaFin);
            if (fFin > hoy) {
                $('#fechaFin').addClass('is-invalid');

                LayoutCs.Alerta(
                    "Fecha Seccionada",
                    "La fecha fin no puede ser mayor al día actual.",
                    "Warning"
                );
                return;
            }
        }

        if (fechaInicio && fechaFin) {
            if (new Date(fechaFin) < new Date(fechaInicio)) {
                LayoutCs.Alerta(
                    "Fecha Seccionada",
                    "La fecha fin no puede ser menor que la fecha inicio.",
                    "Warning"
                );
                return;
            }
        }



        if (fechaInicio && fechaFin) {
            $('#fechaRango').text(`${fechaInicio} - ${fechaFin}`);
        }



        this.crearTodasLasGraficas();
    }


    /**
     * Obtiene información de producción específica de una línea (Grafica 1 : En Proceso)
     * @param {string} linea - Código de la línea de producción
     */
    async obtenerInfoProduccion(linea) {
        try {

            //LIMPIANDO VALORE DE LA GRAFICA
            $(".celda-texto").text("");
            $("#Ep_DescTuboConsumido").html("<strong>TUBO</strong>");
            $("#EP_DescPoliConsumido").html("<strong>POLI</strong>");
            $("#EP_CantidadPoliConsumido").text("");
            $("#Ep_DescTuboConsumido").text("");

            //Action("GetInfoProLine","Dashboard")
            const urlInfoPro = $('#mainDash').attr("InfoPro");

            const response = await $.ajax({
                url: urlInfoPro,
                type: 'POST',
                dataType: 'JSON',
                data: { Linea: linea }
            });

            this.stopPollingConsumidoPoliTubo()


            if (response.Status === "OK") {

                console.group("TENDENCIA PESOS: ");

                const infoPro = JSON.parse(response.Data);
                const tendenciaPesos = JSON.parse(response.ExtraData);
                const totalP = JSON.parse(response.Other);
                const materiales = JSON.parse(response.Data2);
                const consumo = JSON.parse(response.Data3);
                let dataPro = infoPro[0];
                let rProd = 0;


                if (consumo && Array.isArray(consumo)) {

                    let Poli =
                        consumo.find((c) => c.Articulo.includes("POLI"))
                        || { Cosumido: 0, Articulo: 'POLIETILENO' };

                    let SumPoli = consumo.reduce((acumulador, current) => {
                        if (current.Articulo.includes("POLI"))
                            acumulador += current.Consumido

                        return acumulador;
                    }, 0)

                    let Tubo =
                        consumo.find((c) => c.Articulo.includes("TUBO"))
                        || { Consumido: 0, Articulo: 'TUBO' };

                    let SumTubo = consumo.reduce((acumulador, current) => {
                        if (current.Articulo.includes("TUBO"))
                            acumulador += current.Consumido

                        return acumulador;
                    }, 0)

                    $("#EP_CantidadTuboConsumido").text(SumTubo.toFixed(2));
                    $("#EP_CantidadPoliConsumido").text(SumPoli.toFixed(2));

                    $("#Ep_DescTuboConsumido").html(`<strong>${Tubo.Articulo}</strong>`);
                    $("#EP_DescPoliConsumido").html(`<strong>${Poli.Articulo}</strong>`);
                }
                else {
                    $("#EP_CantidadTuboConsumido").text(0);
                    $("#EP_CantidadPoliConsumido").text(0);

                    $("#Ep_DescTuboConsumido").html(`<strong>TUBO</strong>`);
                    $("#EP_DescPoliConsumido").html(`<strong>POLI</strong>`);
                }




                if (tendenciaPesos) {
                    let TP = tendenciaPesos.map((tp) => (parseFloat(tp.Cantidad)))
                    let Categorias = tendenciaPesos.map((tp) => (tp.NumSis))
                    this.datosReales.enProceso.tendenciaPesos = TP;
                    this.datosReales.enProceso.categorias = Categorias;
                    rProd = tendenciaPesos.length;
                    this.currentTendencias = tendenciaPesos;

                    console.table(tendenciaPesos);
                }
                else {
                    this.datosReales.enProceso.tendenciaPesos = [0];
                    console.warn(`No se encontro informacion de tendencia pesos para linea ${linea}`);
                }


                if (infoPro && infoPro.length > 0) {

                    // Cargar información específica de la línea
                    $('#tablaEnProcesoEmpty').addClass("d-none");
                    $('#tablaEnProceso').removeClass("d-none");
                    $('#chartEnProceso').removeClass("d-none");

                    this.datosReales.enProceso.OF = dataPro.DocNumOF;
                    this.datosReales.enProceso.Pedido = dataPro.Pedido;
                    this.datosReales.enProceso.Min = dataPro.PesoMin;
                    this.datosReales.enProceso.Max = dataPro.PesoMax;
                    this.datosReales.enProceso.CantidadPlanificada = dataPro.KilosPlaneados;
                    this.datosReales.enProceso.KilosCompletados = dataPro.CantidadCompletada;

                    $("#EP_TotalKilos").text(parseFloat(dataPro.KilosPlaneados).toFixed(2));
                    $("#EP_SumaKG").text(parseFloat(dataPro.CantidadCompletada).toFixed(2));


                    let rollosPro = tendenciaPesos.reduce((sum, t) => {
                        //if (t.Cantidad >= dataPro.PesoMin && t.Cantidad <= dataPro.PesoMax)
                        if (t.Productivo == 1)
                            sum += 1;

                        return sum;
                    }, 0);

                    this.datosReales.enProceso.PiezasPro = parseInt(rollosPro);
                    //console.log('Info Producción:', dataPro);

                    this.currentArt = dataPro.Articulo;
                    this.currentPedido = dataPro.Pedido;

                    // let piezas = parseInt(dataPro.PiezasProducidas);
                    let rProd = parseInt(rollosPro);
                    let rollos = parseInt(dataPro.Rollos);

                    this.currentRollos = rollos;


                    //if (isNaN(piezas)) piezas = 0;
                    if (isNaN(rollos)) rollos = 0;

                    dataPro.RoVsPP = `${rProd}/${rollos}`;

                    // Asignar valores a la interfaz
                    this.asignarValoresInterfaz("EP_", dataPro);

                    this.poblarSelectAlmByPedido(dataPro.AlmConStock);
                    //$("#EP_Conformes").text(dataPro.PiezasProducidas);
                    $("#EP_Conformes").text(rProd);

                    if (tendenciaPesos && tendenciaPesos.length > 0) {

                        let { SumC, SumNC, Total, NcList } = this.getKilosConfVsNoConf(tendenciaPesos)

                        let kilosP = (dataPro.KilosPlaneados - dataPro.CantidadCompletada).toFixed(2);

                        //$("#EP_SumaKG").text(SumC);
                        $("#EP_SumaKGNo").text(SumNC);
                        $("#EP_KilosPen").text(kilosP);
                        $("#EP_LoteList").text(NcList);

                    }
                    else {
                        console.warn("El total de producción esta vacio")
                    }

                }
                else {
                    let mensaje = `No se encontraron pedidos en proceso en linea: <strong>${linea}</strong>`;
                    console.warn(mensaje, response);
                    LayoutCs.Alerta(
                        "Info Producción",
                        mensaje,
                        "Warning");

                    $('#tablaEnProcesoEmpty').removeClass("d-none");
                    $('#tablaEnProceso').addClass("d-none");
                    $('#chartEnProceso').addClass("d-none");

                }

                if (materiales && materiales.length > 0) {
                    dashboardProduccion.MATERIALES_CURRENT = materiales;

                    this.poblarFibras(materiales)
                }
                else {
                    let mensaje = `No se obtuvo informacion de las fibras`;
                    $(".FilaFibra").remove();
                    $("#EP_MezclaF").text("");
                    console.warn(mensaje, materiales);
                }


                setTimeout(() => {
                    this.startPollingConsumidoPoliTubo();
                }, 15000)

                console.groupEnd();

            } else {
                LayoutCs.Alerta("Info Producción", response.Message);
                this.stopPollingConsumidoPoliTubo()
            }

        } catch (error) {
            LayoutCs.Excepcion(error, "Info Producción");
            console.error('Error al inicializar dashboard:', error);
        }
    }

    getKilosConfVsNoConf(data) {
        //Continua aqui

        let SumC = 0, SumNC = 0, Total = 0, NcList = "";

        if (Array.isArray(data)) {
            data.forEach((d) => {
                if (d.Productivo == 1) {
                    SumC += d.Cantidad;
                }
                else if (d.Productivo == 2) {
                    SumNC += d.Cantidad;
                }

                Total += d.Cantidad;
            });

            let listNc = data.find((d) => d.Productivo == 2);

            if (listNc) NcList = listNc.ListLotes;
        }
        else {
            console.error(`getKilosConfVsNoConf -> Data kilos produccidos no valida data: ${data}. Retornando ceros`);
            console.error(`getKilosConfVsNoConf -> ${data}`);
        }

        return { SumC, SumNC, Total, NcList };
    }

    limpiarTablaProd() {
        // Recorre todas las celdas del tbody con id="tablaEnProceso"
        $('#tablaEnProceso td[id]').each(function () {
            const id = $(this).attr('id');

            // Excluir los casos que contienen inputs, selects o estructuras internas
            if (id === "EP_NoConformes") {
                // Limpia los valores dentro sin eliminar el contenido interno
                $(this).find('#NoConfEP').text('0');
                $(this).find('select').val('-1');
            } else {
                // Para los demás, limpia el texto
                $(this).text('---');
            }
        });
    }

    poblarFibras(fibras) {

        let total = 0;
        let Mezcla = fibras[0].CodigoReceta;

        // Eliminar filas anteriores si existen
        $(".FilaFibra").remove();

        let tempRowFibra = `<tr class="FilaFibra">
                              <td colspan="2"><strong>{{FIBRA}}</strong></td>
                              <td colspan="2">{{CONSUMIDO}} </td>
                            </tr>`;
        let rowFibras = "";

        fibras.forEach((f) => {
            //let idFibra = `#EP_Fibram${index + 1}`;
            //$(idFibra).text(f.CantidadRequerida);

            rowFibras += tempRowFibra
                .replace("{{FIBRA}}", f.CodigoArticulo)
                .replace("{{CONSUMIDO}}", f.CantidadConsumida);

            //total += f.CantidadRequerida;
        });

        $("#filaFibras").after(rowFibras.toString());
        $("#EP_MezclaF").text("");
        $("#EP_MezclaF").text(Mezcla);
        // $("#EP_TotalKilos").text(total.toFixed(4));
    }

    /**
     * Obtiene información de los paros de produccion en un rango de fechas 
     * (Grafica 2 : Paros)
     * @param {date} fi - Fecha Inicio 
     * @param {date} ff - Fecha Fin
     */
    async obtenerInfoParos(fi, ff, linea, turno, grupoArt) {
        try {
            //Dashboard/GetInfoParos
            const urlInfoParos = $('#mainDash').attr("InfoParos");

            const response = await $.ajax({
                url: urlInfoParos,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    FI: fi,
                    FF: ff,
                    Linea: linea,
                    Turno: turno,
                    GrupoArticulos: grupoArt
                }
            });

            if (response.Status === "OK") {
                console.group("INFO PAROS: ");
                const infoParos = JSON.parse(response.Data);
                //const infoInspec = JSON.parse(response.Data2);
                const infoParosDia = JSON.parse(response.ExtraData);

                $("#tablaSoportes").empty();
                this.datosReales.soportes.parosPorDia = [];
                let max = 0;

                //this.INSPECCIONES = infoInspec;
                //this.poblarTableInspecciones(infoInspec);

                if (infoParos.length > 0) {
                    console.log(infoParos);
                    // Asignar valores a la interfaz
                    this.poblarTableParos(infoParos);

                    //{ dia: 1, minutos: 40 },
                    this.datosReales.soportes.parosPorDia = infoParosDia.map((p, index) => {

                        if (p.MinutosDeParo > max) max = p.MinutosDeParo;

                        return { dia: p.DiaDelMes, minutos: p.MinutosDeParo }
                    });

                    this.datosReales.soportes.MAX = max;

                    console.log(this.datosReales.soportes.parosPorDia);
                }
                else {
                    let mensaje = `Sin información de paros`;
                    console.warn(mensaje, response);
                    LayoutCs.Alerta(
                        "Info Paros",
                        mensaje,
                        "Warning");
                }
                console.groupEnd();

            } else {
                LayoutCs.Alerta("Info Producción", response.Message);
            }
        } catch (error) {
            LayoutCs.Excepcion(error, "Info Producción");
            console.error('Error al inicializar dashboard:', error);

        }
    }

    async obtenerInfoInspec(linea, turno, grupoArt) {
        try {

            $("#tablaInspeccion").empty();
            $("#tablaInspeccion").append(
                `<tr>
                    <td colspan="7" class="text-center text-muted">Cargando Inspecciones ....</td>
                </tr>`);

            //Dashboard/GetInfoInspecc
            const urlInfoParos = $('#mainDash').attr("InfoInspec");

            const response = await $.ajax({
                url: urlInfoParos,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    Linea: linea,
                    Turno: turno,
                    GrupoArticulos: grupoArt
                }
            });

            if (response.Status === "OK") {
                console.group("INFO Inspecciones: ");

                const infoInspec = JSON.parse(response.Data);
                this.INSPECCIONES = infoInspec;

                this.poblarTableInspecciones(infoInspec);

                console.groupEnd();

            } else {
                LayoutCs.Alerta("Info Inspecciones", response.Message);
            }
        } catch (error) {
            LayoutCs.Excepcion(error, "Info Inspecciones");
            console.error('Error al inicializar dashboard:', error);

        }
    }


    /**
    * Obtiene información de los paros de produccion en un rango de fechas 
    * (Grafica 3 : Línea Día Turno)     
    * @param {string} linea - Código de la línea de producción
    * @param {date} fi - Fecha Inicio 
    * @param {date} ff - Fecha Fin
    */
    async obtenerInfoLDT(linea, fi, ff, alm, numFam) {
        try {


            $(".cls-ldt").text("");
            this.cleanTableTurnosLDT();

            if (numFam != 0) linea = null;

            //"GetInfoLDT","Dashboard"
            const urlInfoLDT = $('#mainDash').attr("InfoLDT");

            const response = await $.ajax({
                url: urlInfoLDT,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    Linea: linea,
                    FI: fi,
                    FF: ff,
                    Alm: alm,
                    NumFam: numFam
                }
            });

            if (response.Status === "OK") {
                console.group("LINEA DIA TURNO - EFICIENCIA");

                const infoLDT = JSON.parse(response.Data);
                const infoEficiencia = JSON.parse(response.Data2);
                const infoTurnosLDT = JSON.parse(response.ExtraData);
                //No conforme por turno
                const infoTurnosNCLDT = JSON.parse(response.Other);
                //const tendenciaPesos = JSON.parse(response.ExtraData);

                if (infoLDT.length > 0) {
                    //let dataPro = infoLDT[0];

                    let dataPro = this.acumularPropiedades(infoLDT);
                    //this.datosReales.enProceso.Pedido = dataPro.Pedido;
                    //this.datosReales.enProceso.PiezasPro = parseInt(dataPro.PiezasProducidas);
                    console.log('Info LDT:', dataPro);
                    console.table(infoEficiencia);
                    console.log("#######TURNOS########"),
                        console.table(infoTurnosLDT)

                    if (infoEficiencia && infoEficiencia.length > 0) {

                        let max = 0;

                        console.group("Calculo Puntos Eficiencía");
                        this.datosReales.lineaDiaTurno.eficiencia =
                            infoEficiencia.map((e) => {
                                //Kilos Fabricados en el día
                                let Pro = e.Total_Kilos;

                                let HoraProg = 0;
                                let eficiencia = 0;

                                //MPD = Minutos Efectivos 
                                if (e.MPD > 0 && Pro > 0) {
                                    //Minutos Efectivos / 60 = Horas Efectivas
                                    HoraProg = (e.MPD / 60); // Pasando de min a horas
                                    //HoraProg *= 24;
                                    //KilosFabricados / Horas Efectivas
                                    eficiencia = Pro / HoraProg;
                                }
                                else {
                                    console.error(`Calculo Eficiencia. 
                            Algun valor llego vacio Fecha ${e.Fecha} Produccion: ${Pro}, HoraProg ${HoraProg}`);
                                }
                                console.log(`${e.MonthDia} -> ( KilosProducidos: ${Pro} ) / (HorasEfectivas : ${HoraProg}) = ${eficiencia}`);

                                if (eficiencia > max) max = eficiencia;

                                return parseFloat(eficiencia.toFixed(2));

                            });

                        console.groupEnd();
                        this.datosReales.lineaDiaTurno.MAX = max;



                        this.datosReales.lineaDiaTurno.categorias =
                            infoEficiencia.map((d) => {
                                return d.MonthDia;
                            });

                        console.log(this.datosReales.lineaDiaTurno.eficiencia);
                        console.log("MAXIMO: " + this.datosReales.lineaDiaTurno.MAX);
                        console.log("CATEGORIAS: ");
                        console.log(this.datosReales.lineaDiaTurno.categorias);


                    }
                    else {
                        console.warn(`Sin informacion de eficiencia para 
                        Linea ${linea}, FI: ${fi} , FF: ${ff}`);
                    }

                    //TOTALES DE MINPROG, MINT Y PRODUCCION

                    let sumaPro = infoTurnosLDT.reduce((sum, d) => {
                        sum += d.Kilos
                        return sum;
                    }, 0);

                    //let sumaMinProg = infoTurnosLDT.reduce((sum, d) => {
                    //    sum += d.MinProg
                    //    return sum;
                    //}, 0);

                    let sumaMinT = infoTurnosLDT.reduce((sum, d) => {
                        sum += d.MinT
                        return sum;
                    }, 0);

                    if (!dataPro.HP) {
                        dataPro.HP = 0;

                        setTimeout(() => {
                            LayoutCs.Alerta(
                                "Línea Día Turno",
                                `El campo de Horas Programadas. Linea ${linea} esta vacío`,
                                "Warning"
                            );
                        }, 5000);
                    }

                    let minProg = (dataPro.DiasLab * parseInt(dataPro.HP)) * 60;

                    let horasPro = (minProg - sumaMinT) / 60;

                    //HORAS PROGRAMADAS TOTAL
                    dataPro.HP = parseInt(dataPro.HP) * dataPro.DiasLab;

                    let horasEnParo = sumaMinT / 60

                    //HORAS EN PARO
                    dataPro.HorasP = horasEnParo;

                    //HORAS EFECTIVAS TOTAL
                    const HorasEefctivas = dataPro.HP - horasEnParo;


                    //dataPro.EP = Eficiencia Programada =  KILOS * HORA
                    //Kilos  que deberian de produccir = (HP - horasEnParo) * Dias Lab * EP
                    //Kilos produccidos
                    let EficienciaAlcanzada = 0;

                    if (HorasEefctivas > 0 && dataPro.EP > 0) {
                        EficienciaAlcanzada = (sumaPro / (HorasEefctivas * dataPro.EP)) * 100;
                    }
                    else {
                        console.warn(`VALORES VACIOS PARA CALCULO DE Eficiencia Alcanzada HORAS EFECTIVAS: ${HorasEefctivas} EFICIENCIA PROGRAMADA ${dataPro.EP}`);
                    }


                    //CALCULO EFICIENCIA
                    $("#LDT_Efi").text(formatearNumero(EficienciaAlcanzada) + '%');

                    $("#LDT_HEP").text(formatearNumero(HorasEefctivas));

                    // Asignar valores a la interfaz
                    this.asignarValoresInterfaz("LDT_", dataPro);



                }
                else {
                    let mensaje = `No se encontraron pedidos en proceso en linea: <strong>${linea}</strong>`;
                    console.warn(mensaje, response);
                    LayoutCs.Alerta(
                        "Info Producción",
                        mensaje,
                        "Warning");
                }

                let objInfoLDT = this.acumularPropiedades(infoLDT);


                await this.poblarTableTurnosLDT(infoTurnosLDT, infoTurnosNCLDT, objInfoLDT);

                console.groupEnd();

            } else {

                this.cleanTableTurnosLDT();
                LayoutCs.Alerta("Info Producción", response.Message);
            }
        } catch (error) {
            LayoutCs.Excepcion(error, "Info Producción");
            console.error('Error al inicializar dashboard:', error);

        }
    }

    //reduceInfoLDT(ListLDT) {
    //    console.group("Lista LDT");
    //    console.log(ListLDT);
    //    console.groupEnd();
    //}

    acumularPropiedades(data) {
        try {

            if (!Array.isArray(data)) {
                throw new Error("El parámetro debe ser un arreglo de objetos");
            }

            const acumulado = {};

            data.forEach(obj => {

                if (typeof obj !== "object" || obj === null) return;

                Object.keys(obj).forEach(prop => {

                    let valor = obj[prop];

                    // Convertir a número si viene como string
                    let numero = Number(valor);

                    // Si no es número válido usar 0
                    if (isNaN(numero)) {
                        numero = 0;
                    }

                    // Inicializar propiedad si no existe
                    if (!acumulado[prop]) {
                        acumulado[prop] = 0;
                    }

                    //Obtener el maximo de dias acumulados
                    if (prop === "DiasLab") {
                        if (acumulado[prop] < numero) {
                            acumulado[prop] = numero;
                        }
                    }
                    else {
                        acumulado[prop] += numero;
                    }

                });

            });

            return acumulado;

        } catch (error) {

            console.error("Error al acumular propiedades:", error);
            return {};

        }
    }


    /**
     * Obtiene información de los paros de produccion en un rango de fechas 
     * (Grafica 4 : Línea Total)     
     * @param {string} linea - Código de la línea de producción
     * @param {date} fi - Fecha Inicio de donde toma en cuenta todo el mes
     */
    async obtenerInfoLT(linea, fi, ff, numFam) {
        try {
            // Dashboard/GetInfoLT
            const urlInfoLT = $('#mainDash').attr("InfoLT");

            const response = await $.ajax({
                url: urlInfoLT,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    Linea: linea,
                    FI: fi,
                    FF: ff,
                    NumFam: numFam
                }
            });

            if (response.Status === "OK") {

                console.group("LINEA TOTAL - MES");
                //Total Produccion por turno en rango de fechas
                const infoLT = JSON.parse(response.Data);
                console.log("Produccion Turno");
                console.log(infoLT);
                //Total No Conforme por turno en rango de fechas 
                const infoNCTurnos = JSON.parse(response.Data2);
                console.log("No Conforme Turno");
                console.table(infoNCTurnos);
                //Informacion para grafica
                const infoMesLT = JSON.parse(response.ExtraData);

                const dataDLab = JSON.parse(response.Other);

                console.log("Grafica");
                console.table(infoMesLT);


                if (infoLT.length > 0) {
                    //console.log('Info LT:', infoLT);

                    let Linea = $("#filtroLinea").val().trim();
                    let infoLinea = infoLT.find((l) => l.Linea == Linea) || infoLT[0];


                    let horasProg1 = infoLinea.HorasProg1;
                    let horasProg2 = infoLinea.HorasProg2;
                    let horasProg3 = infoLinea.HorasProg3;
                    let totalHrsProg = parseInt(horasProg1) + parseInt(horasProg2) + parseInt(horasProg3);
                    let efiProg = infoLinea.EfiPro;

                    let dataTurnos = this.groupByTurnos(infoLT);

                    let diasLab = dataDLab ? dataDLab[0] : 0;

                    this.poblarTableTurnosMesLT(dataTurnos, infoNCTurnos, diasLab,
                        horasProg1, horasProg2, horasProg3, totalHrsProg, efiProg);

                    let max = 0;

                    if (infoMesLT.length > 0) {

                        const MAX_SCRAP = infoMesLT[0].MaxScrap;

                        $("#TL_MaxScrap").text(MAX_SCRAP);

                        this.datosReales.lineaTotal.produccionMensual = infoMesLT.map((p) => {

                            if (p.TotalKilosPro > max) max = p.TotalKilosPro;

                            const percentScrap = porcentaje(p.TotalKilosPro, p.NoConformeKilos);

                            let notaScrap = `Scrap ${percentScrap}%`;

                            return {
                                mes: p.Dia, conforme: p.TotalKilosPro,
                                noConforme: p.NoConformeKilos,
                                porcentaje: (p.TotalKilosPro / p.NoConformeKilos).toFixed(2),
                                notaScrap: notaScrap
                            }
                        })
                    }

                    $("#TL_DiasLab").text(dataDLab[0].DiasLaborados);

                    this.datosReales.lineaTotal.MAX = max;
                    console.log("MAX: " + this.datosReales.lineaTotal.MAX);
                }
                else {
                    let mensaje = `No hay informacion del mes en linea <strong>${linea}</strong>`;
                    console.warn(mensaje, response);
                    LayoutCs.Alerta(
                        "Info Linea Total",
                        mensaje,
                        "Warning");
                }

                console.groupEnd();


            } else {
                LayoutCs.Alerta("Info Linea Total", response.Message);
            }
        } catch (error) {
            LayoutCs.Excepcion(error, "Info Linea Total");
            console.error('Error al inicializar dashboard:', error);

        }
    }

    async obtenerInfoMolidos(linea, fi, ff) {
        try {
            // Dashboard/GetInfoMolido
            const urlInfoLT = $('#mainDash').attr("InfoLTMolido");

            const response = await $.ajax({
                url: urlInfoLT,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    Linea: linea,
                    FI: fi,
                    FF: ff
                }
            });

            if (response.Status === "OK") {
                const infoLT = JSON.parse(response.Data);
                const infoLTGenerado = JSON.parse(response.Data2);
                console.group("INFO MOLIDOS: ");

                //PINTANDO MOLIDO CONSUMIDO
                if (infoLT.length > 0) {
                    console.log('Info LT OBTENIDA:', infoLT);

                    let FB = infoLT.filter((a) => (a.Fibra == "MOLIDO FB"));
                    let MC = infoLT.filter((a) => (a.Fibra == "MOLIDO MODACRYL"));
                    let TotalFB = 0, TotalMC = 0;

                    FB.forEach((f) => {
                        let idT1 = `#TL_T${f.Turno}MCFBH`;
                        let idT2 = `#TL_T${f.Turno}MCFBP`;

                        $(idT1).text(formatearNumero(f.Consumido));
                        TotalFB += f.Consumido
                    });

                    MC.forEach((f) => {
                        let idT1 = `#TL_T${f.Turno}MCMCH`;
                        let idT2 = `#TL_T${f.Turno}MCMCP`;

                        $(idT1).text(formatearNumero(f.Consumido));
                        TotalMC += f.Consumido
                    });

                    $("#TL_TotakMoliFB").text(formatearNumero(TotalFB));
                    $("#TL_TotakMoliMC").text(formatearNumero(TotalMC));

                }
                else {
                    let mensaje = `No hay informacion de molidos`;
                    console.warn(mensaje, response);
                    //LayoutCs.Alerta(
                    //    "Info Linea Total",
                    //    mensaje,
                    //    "Warning");
                }


                //PINTANDO MOLIDO Y RECORTE GENERADO
                if (infoLTGenerado.length > 0) {
                    console.log('Info LT Genar OBTENIDA:', infoLTGenerado);

                    let FBG = infoLTGenerado.filter((a) => (a.CodigoArticulo == "MOLIDO FB"));
                    let MCG = infoLTGenerado.filter((a) => (a.CodigoArticulo == "MOLIDO MODACRYL"));
                    let RecorteG = infoLTGenerado.filter((a) => (a.CodigoArticulo.includes("RECORTE")));

                    let TotalFBG = 0, TotalMCG = 0, TotalReG = 0;

                    FBG.forEach((f) => {
                        TotalFBG += f.CantidadRequerida
                    });

                    MCG.forEach((f) => {
                        TotalMCG += f.CantidadRequerida
                    });

                    RecorteG.forEach((f) => {
                        TotalReG += f.CantidadRequerida
                    });

                    $("#TL_TotakMoliFBGenerado").text(formatearNumero(TotalFBG));
                    $("#TL_TotakMoliMCGenerado").text(formatearNumero(TotalMCG));
                    $("#TL_TotakRecorteGenerado").text(formatearNumero(TotalReG));

                }
                else {
                    let mensaje = `No hay informacion de molidos generados`;
                    console.warn(mensaje, response);
                    //LayoutCs.Alerta(
                    //    "Info Linea Total",
                    //    mensaje,
                    //    "Warning");
                }

                console.groupEnd();

            } else {
                LayoutCs.Alerta("Info Linea Total", response.Message);
            }
        } catch (error) {
            LayoutCs.Excepcion(error, "Info Linea Total");
            console.error('Error al inicializar dashboard:', error);

        }
    }


    async obtenerNoConforme(pedido, almacen) {
        try {
            Loading();
            const urlInfoNC = $('#mainDash').attr("InfoNoConforme");

            const response = await $.ajax({
                url: urlInfoNC,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    Alm: almacen,
                    Pedido: pedido
                }
            });

            if (response.Status === "OK") {
                const infoNC = JSON.parse(response.Data);
                if (infoNC.length > 0) {

                    //ACTUALIZA NUM ROLLOS NO CONFORME
                    // KILOS NO CONFORME
                    //SEGUN EL ALMACEN SELECCIONADO

                    console.log('Info NC:', infoNC);
                    $("#NoConfEP").text(infoNC[0].Rollos);
                    $("#EP_SumaKGNo").text(infoNC[0].CantidadKilos);

                }
                else {
                    let mensaje = `No se encontro informacion. En obtenerNoConforme  Almacen:${almacen} y Pedido :${pedido}`;
                    console.warn(mensaje, response.Message);
                }

            } else {
                LayoutCs.Alerta("Info Producción", response.Message);
            }

            StopLoading();
        } catch (error) {
            LayoutCs.Excepcion(error, "Info Producción");
            console.error('Error al inicializar dashboard:', error);
            StopLoading();
        }
    }


    async startPollingConsumidoPoliTubo(intervalo = 10000) {

        if (this.pollingLoopActivo) return;

        this.pollingLoopActivo = true;

        console.log("Iniciando polling tipo loop");

        while (this.pollingLoopActivo) {

            if (this.datosReales?.enProceso?.Pedido) {
                await this.syncConsumidoPoliTubo();
            }

            await new Promise(resolve => setTimeout(resolve, intervalo));
        }
    }

    stopPollingConsumidoPoliTubo() {
        this.pollingLoopActivo = false;
    }



    //Sincronizar el consumido de Tubo y Poli
    async syncConsumidoPoliTubo() {
        try {

            const OV = this.datosReales.enProceso.Pedido;
            let TURNO = $("#filtroTurno").val();
            let LINEA = $("#filtroLinea").val();
            let GRUPO = "";
            let TextLinea = $("#filtroLinea:selected").text();

            if (TextLinea.includes("LINEAS")) {
                GRUPO = LINEA;
                LINEA = "";
            }



            const urlInfoConsumido = $('#mainDash').attr("InfoConsumido");
            //"@Url.Action("GetInfoConsumido","Dashboard")"
            const response = await $.ajax({
                url: urlInfoConsumido,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    Pedido: OV,
                    Linea: LINEA,
                    GrupoArticulos: GRUPO,
                    Turno: TURNO,
                }
            });

            if (response.Status === "OK") {
                const consumo = JSON.parse(response.Data);
                const materiales = JSON.parse(response.Data2);
                const inspec = JSON.parse(response.Data3);

                if (consumo && Array.isArray(consumo)) {

                    // let Poli = consumo.find((c) => c.Articulo.includes("POLI")) || 0;
                    //let Tubo = consumo.find((c) => c.Articulo.includes("TUBO")) || 0;

                    let beforeTubo = parseFloat($("#EP_CantidadTuboConsumido").text().trim()).toFixed(2);
                    let beforePoli = parseFloat($("#EP_CantidadPoliConsumido").text().trim()).toFixed(2);

                    let SumPoli = consumo.reduce((acumulador, current) => {
                        if (current.Articulo.includes("POLI"))
                            acumulador += current.Consumido

                        return acumulador;
                    }, 0)


                    let SumTubo = consumo.reduce((acumulador, current) => {
                        if (current.Articulo.includes("TUBO"))
                            acumulador += current.Consumido

                        return acumulador;
                    }, 0)

                    //ACTUALIZAR SOLO SI CAMBIO

                    if (beforeTubo != SumTubo)
                        $("#EP_CantidadTuboConsumido").text(SumTubo.toFixed(2));

                    if (beforePoli != SumPoli)
                        $("#EP_CantidadPoliConsumido").text(SumPoli.toFixed(2));
                }
                else {
                    let mensaje = `No se encontro información. Consumido`;
                    console.warn(mensaje, response.Message);
                }

                if (materiales && Array.isArray(materiales)) {

                    //console.log(materiales);
                    //console.log(dashboardProduccion.MATERIALES_CURRENT);


                    let cambio = arraysSonDistintosSinOrden(dashboardProduccion.MATERIALES_CURRENT, materiales);

                    //REFRESCAR SOLO SI CAMBIO 
                    if (cambio) {
                        this.poblarFibras(materiales);
                        console.warn("Los materiales consumidos cambiaron");

                        dashboardProduccion.MATERIALES_CURRENT = materiales;
                    }
                }


                if (inspec && Array.isArray(inspec)) {

                    const oldInsp = dashboardProduccion.INSPECCIONES.length;
                    const currentInsp = inspec.length;

                    //Actualiza solo si aumento la data
                    if (currentInsp > oldInsp) {
                        //ACTUALIZA VISTA Y DATOS EN LOCAL
                        dashboardProduccion.INSPECCIONES = inspec;
                        this.poblarTableInspecciones(inspec);
                    }

                }

            } else {
                console.error("Info Producción", response.Message);
            }

        } catch (error) {
            console.error('Error al inicializar dashboard:', error);
        }
    }

    /**
     * Asigna valores del objeto datos a elementos del DOM con prefijo específico
     * @param {string} prefijo - Prefijo para los IDs de elementos
     * @param {Object} datos - Objeto con los datos a asignar
     */
    asignarValoresInterfaz(prefijo, datos) {
        const idsNoEncontrados = [];
        const keys = Object.keys(datos);

        keys.forEach(key => {
            const $elemento = $(`#${prefijo}${key}`);
            const notN = $(`#${prefijo}${key}`).attr("notNumber");

            if ($elemento.length) {
                let valor = (datos[key] === '' || datos[key] === null) ? '--' : datos[key];

                if (typeof valor == "number") valor = valor.toFixed(2);

                if (!notN) {
                    valor = formatearNumero(valor);
                }

                $elemento.text(valor);

                // Aplicar estilos 
                if (valor === '--') {
                    $elemento.addClass('bg-secondary');
                } else {
                    $elemento.removeClass('bg-secondary');
                }
            } else {
                idsNoEncontrados.push(key);
            }
        });

        if (idsNoEncontrados.length > 0) {
            console.warn("IDs no encontrados en la vista:", idsNoEncontrados.join(", "));
        }
    }

    /**
     * Exporta el dashboard completo a PDF usando html2canvas y jsPDF
     * Maneja múltiples páginas si el contenido es muy alto
     */
    async exportarAPDF() {
        try {
            // Mostrar indicador de carga 
            const $btnExport = $('.btn-export');
            const textoOriginal = $btnExport.html();

            $btnExport.html('<i class="fas fa-spinner fa-spin me-2"></i>Generando PDF...')
                .prop('disabled', true);

            // Ocultar elementos no imprimibles
            $('.no-print').hide();
            $('body').addClass('printing');

            // Obtener elemento de contenido
            const contentElement = $('.container-pdf').length ? $('.container-pdf')[0] : document.body;
            const contentRect = contentElement.getBoundingClientRect();
            const contentWidth = contentRect.width;
            const contentHeight = contentElement.scrollHeight || contentElement.offsetHeight;

            // Capturar contenido con html2canvas
            const canvas = await html2canvas(contentElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                height: contentHeight,
                width: contentWidth,
                scrollX: 0,
                scrollY: 0,
                backgroundColor: "#ffffff"
            });

            // Crear PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF("p", "mm", "a4");

            // Dimensiones A4 portrait
            const pageWidth = 210;
            const pageHeight = 297;

            // Calcular dimensiones manteniendo proporción
            const canvasAspectRatio = canvas.width / canvas.height;
            const pdfAspectRatio = pageWidth / pageHeight;

            let imgWidth, imgHeight, xOffset = 0, yOffset = 0;

            if (canvasAspectRatio > pdfAspectRatio) {
                imgWidth = pageWidth - 20;
                imgHeight = imgWidth / canvasAspectRatio;
                xOffset = 10;
                yOffset = (pageHeight - imgHeight) / 2;
            } else {
                imgHeight = pageHeight - 20;
                imgWidth = pageWidth;
                xOffset = 0;
                yOffset = 10;
            }

            // Manejar contenido que excede una página
            if (imgHeight > pageHeight) {
                const totalPages = Math.ceil(imgHeight / pageHeight);

                for (let page = 0; page < totalPages; page++) {
                    if (page > 0) {
                        pdf.addPage();
                    }

                    const sourceY = (page * pageHeight * canvas.height) / imgHeight;
                    const sourceHeight = Math.min(
                        (pageHeight * canvas.height) / imgHeight,
                        canvas.height - sourceY
                    );

                    // Canvas temporal para esta página
                    const tempCanvas = document.createElement("canvas");
                    const tempCtx = tempCanvas.getContext("2d");
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = sourceHeight;

                    tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);

                    const pageImgHeight = Math.min(pageHeight - 20, (sourceHeight * imgHeight) / canvas.height);
                    const pageImgData = tempCanvas.toDataURL("image/png");

                    pdf.addImage(pageImgData, "PNG", xOffset, 10, imgWidth, pageImgHeight);
                }
            } else {
                pdf.addImage(canvas.toDataURL("image/png"), "PNG", xOffset, yOffset, imgWidth, imgHeight);
            }

            // Descargar PDF
            const fecha = new Date().toISOString().split("T")[0];
            pdf.save(`dashboard-produccion-${fecha}.pdf`);

            // Mostrar mensaje de éxito
            LayoutCs.Alerta("Exportar Dashboard", "PDF generado correctamente en formato vertical (portrait)", "OK");

        } catch (error) {
            console.error("Error al generar PDF:", error);
            LayoutCs.Alerta("Exportar Dashboard", "Error al generar el PDF. Por favor, inténtelo de nuevo.", "Warning");
        } finally {
            // Restaurar interfaz 
            $('.no-print').show();
            $('body').removeClass('printing');
            $('.btn-export').html($('.btn-export').data('original-text') || 'Exportar PDF')
                .prop('disabled', false);
        }
    }

    /**
     * Configura el mes actual en la sección de resumen mensual
     */
    configurarMesActual() {
        const ahora = new Date();
        const mesTexto = `${this.meses[ahora.getMonth()]} ${ahora.getFullYear()}`;
        $('#mesActual').text(mesTexto);
    }

    /**
     * Inicia las actualizaciones automáticas de métricas y datos en tiempo real
     */
    iniciarActualizacionesAutomaticas() {
        // Actualizar métricas cada 30 segundos
        this.intervalMetricas = setInterval(() => {
            this.actualizarMetricasEnTiempoReal();
        }, 30000);

        // Simular nuevos datos cada minuto
        this.intervalDatos = setInterval(() => {
            this.simularNuevosDatos();
        }, 60000);
    }

    /**
     * Actualiza las métricas principales con variaciones aleatorias
     */
    actualizarMetricasEnTiempoReal() {
        const variacion = () => Math.random() * 0.1 - 0.05;

        // Actualizar total de producción
        const $totalProduccion = $('#totalProduccion');
        const totalActual = parseInt($totalProduccion.text().replace(",", ""));
        const nuevoTotal = Math.max(0, Math.round(totalActual * (1 + variacion())));
        $totalProduccion.text(nuevoTotal.toLocaleString());

        // Actualizar eficiencia global
        const $eficiencia = $('#eficiencia');
        const eficienciaActual = parseInt($eficiencia.text().replace("%", ""));
        const nuevaEficiencia = Math.max(50, Math.min(100, Math.round(eficienciaActual * (1 + variacion()))));
        $eficiencia.text(nuevaEficiencia + "%");

        // Actualizar horas de operación
        const $horasOperacion = $('#horasOperacion');
        const horasActual = parseInt($horasOperacion.text());
        const nuevasHoras = Math.max(100, Math.round(horasActual * (1 + variacion())));
        $horasOperacion.text(nuevasHoras);

        // Actualizar total de paros
        const $parosTotal = $('#parosTotal');
        const parosActual = parseInt($parosTotal.text());
        const nuevosParos = Math.max(10, Math.round(parosActual * (1 + variacion())));
        $parosTotal.text(nuevosParos);
    }

    /**
     * Simula la llegada de nuevos datos de paros en tiempo real
     */
    simularNuevosDatos() {
        // Solo agregar con 20% de probabilidad
        if (Math.random() < 0.2) {
            const now = new Date();
            const fechaHora = now.toLocaleString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            });

            // Generar datos aleatorios
            const tipoFalla = this.tiposFalla[Math.floor(Math.random() * this.tiposFalla.length)];
            const rubro = this.rubros[Math.floor(Math.random() * this.rubros.length)];
            const descripcion = this.descripciones[Math.floor(Math.random() * this.descripciones.length)];
            const codigo = Math.random() > 0.5 ? Math.floor(Math.random() * 100 + 50) : "NA";

            // Crear nueva fila 
            const nuevaFila = `
                <tr class="table-warning">
                    <td>${fechaHora}</td>
                    <td>${Math.floor(Math.random() * 120 + 15)}</td>
                    <td>${tipoFalla}</td>
                    <td>${rubro}</td>
                    <td>${descripcion}</td>
                    <td>${codigo}</td>
                </tr>
            `;

            const $tablaSoportes = $('#tablaSoportes');
            $tablaSoportes.prepend(nuevaFila);

            // Mantener solo los últimos 10 registros
            $tablaSoportes.find('tr').slice(10).remove();
        }
    }

    /**
     * Maneja el cambio de línea de producción
     * @param {string} valor - Valor de la línea seleccionada
     */
    async manejarCambioLinea(valor, textV) {
        if (textV.includes("LINEAS")) {
            // Deshabilitar vista "En Proceso" para grupos de líneas
            $('#tablaEnProcesoEmpty').removeClass("d-none");
            $('#tablaEnProceso').addClass("d-none");
            $('#chartEnProceso').addClass("d-none");
        } else {
            // Cargar información específica de la línea
            $('#tablaEnProcesoEmpty').addClass("d-none");
            $('#tablaEnProceso').removeClass("d-none");
            $('#chartEnProceso').removeClass("d-none");

            await this.obtenerInfoProduccion(valor);
        }
    }

    /**
     * Limpia los intervalos activos para evitar memory leaks
     */
    detenerActualizaciones() {
        if (this.intervalMetricas) {
            clearInterval(this.intervalMetricas);
            this.intervalMetricas = null;
        }

        if (this.intervalDatos) {
            clearInterval(this.intervalDatos);
            this.intervalDatos = null;
        }
    }
}
function initHubDashboard() {
    //Escuchando eventos con SinalR
    var hub = $.connection.dashTendPesosHub; // Conectar con el Hub de SignalR
    var hubParos = $.connection.parosHub;

    hub.client.updateTendencias = function (articulo, sisnum, lote) {
        //console.log(`Articulo ${articulo}. Tendencias ${tendencias}`);
        newTendenciasPesos(articulo, sisnum, lote);

        //Actualizar consumo de Poli y Tubo
        //dashboardProduccion.syncConsumidoPoliTubo();
    };

    //Detecta actualizaciones de pedidos en un plan
    hub.client.changePlanPro = async function (folioPlan) {
        console.log("Cambio en plan de produccion: ", folioPlan);

        let baseFolio = $("#filtroLinea").val();
        baseFolio = `P${baseFolio}:`;

        if (folioPlan.includes(linea)) {
            await dashboardProduccion.crearGraficaTendenciaPesos()
        }

    }

    hubParos.client.updateParos = function (paro) {
        console.log(`Paro en ${paro}.`);
        let dataParo = JSON.parse(paro);

        newParo(dataParo[0]);
    };

    $.connection.hub.start().done(function () {
        console.log("Conectado a hubs ....");
    });
    //END SinalR
}

function newParo(paro) {
    let Linea = $("#filtroLinea").val();
    let FI = $("#fechaInicio").val();
    let FF = $("#fechaFin").val();
    let Turno = $("#filtroTurno").val();

    if ((Linea == paro.Linea || Linea == paro.ItmsGrpCod) &&
        (Turno == paro.Turno || Turno == "")) {
        //Contruir otra vez la grafica de paros
        dashboardProduccion.crearGraficaParos();
    }

}


function newTendenciasPesos(articulo, sisnum, lote) {
    console.log(`Nuevo Lote: ${sisnum}`);

    let dataLote = JSON.parse(lote);
    let punto = dataLote[0];

    //SOLO SI ES DEL PEDIDO MOSTRADO EN LA GRAFICA Y SI EL LOTE NO ES DE RECETA.
    //Productivo = 1 -> Almacen productivo
    //Productivo = 2 -> Almacen no conforme
    //Productivo = NULL -> Almacen receta
    if (dashboardProduccion.currentPedido == punto.PedidoV && punto.Productivo) {
        console.log("Agregando punto al INICIO...");
        console.log(punto);

        let pesoMin = dashboardProduccion.datosReales.enProceso.Min;
        let pesoMax = dashboardProduccion.datosReales.enProceso.Max;
        let peso = punto.Cantidad;



        // Actualizar contadores
        if (punto.Productivo == 2) {
            let Alm = $("#AlmPedido").val();
            if (punto.Almacen == Alm) {
                //AUMENTANDO ROLLOS NO CONFORME
                let nc = parseInt($("#NoConfEP").text()) || 0;
                $("#NoConfEP").text(nc + 1);

                //AUMENTANDO CANTIDAD NO CONFORME
                let ncKilos = parseFloat($("#EP_SumaKGNo").text()) || 0;
                ncKilos += peso;
                $("#EP_SumaKGNo").text(ncKilos);

            }
        } else {
            //AUMENTANDO PESO Y ROLLOS
            let pro = parseInt($("#EP_Conformes").text()) || 0;
            let currentKilos = parseFloat($("#EP_SumaKG").text()) || 0;

            pro += 1;
            currentKilos += peso;

            $("#EP_Conformes").text(pro);
            $("#EP_RoVsPP").text(`${pro}/${dashboardProduccion.currentRollos}`);
            $("#EP_SumaKG").text(currentKilos);

            //ACTUALIZANDO KILOS PENDIENTES
            let pesoRest =
                dashboardProduccion.datosReales.enProceso.CantidadPlanificada - currentKilos;
            $("#EP_KilosPen").text(pesoRest.toFixed(2));
        }

        const chart = dashboardProduccion.chartTendenciaPesos;
        const serie = chart.series[0];
        const categorias = chart.xAxis[0].categories;

        // Determinar color
        const fueraDeRango = (peso > pesoMax || peso < pesoMin);


        // Crear nuevo punto
        const newPoint = {
            y: peso,
            color: fueraDeRango ? 'rgb(140, 27, 36)' : '#4A4A4A'
        };

        // Obtener datos actuales
        let allData = [newPoint].concat(
            serie.data.map(p => ({ y: p.y, color: p.color }))
        );

        // Limitar a 10 puntos (eliminar el último)
        if (allData.length > 10) {
            allData = allData.slice(0, 10);
        }

        const categories = Math.max(...categorias.map(Number));
        categorias.unshift((categories + 1).toString());

        // Actualizar gráfica
        chart.xAxis[0].setCategories(categorias, false);
        serie.setData(allData, true); // true = redraw automático


    }
}

// Función para calcular y sanitizar los límites de la escala
function calcularLimitesEscala(pesoMinimo, pesoMaximo) {
    // Función helper para validar y sanitizar valores
    const validarValor = (valor, valorPorDefecto = 0) => {
        const num = parseFloat(valor);
        return (!isNaN(num) && num > 0) ? num : valorPorDefecto;
    };

    // Validar y obtener valores base
    const pesoMinValidado = validarValor(pesoMinimo, 1);
    const pesoMaxValidado = validarValor(pesoMaximo, 20);

    // Asegurar que pesoMaximo sea mayor que pesoMinimo
    const pesoMin = Math.min(pesoMinValidado, pesoMaxValidado);
    const pesoMax = Math.max(pesoMinValidado, pesoMaxValidado);

    // Calcular MIN y MAX para la escala del eje Y
    let MIN = pesoMin - (pesoMin / 3);
    let MAX = pesoMax + (pesoMax / 4);

    // Evitar negativos en MIN
    MIN = Math.max(0, MIN);

    // Asegurar que haya una diferencia mínima entre MIN y MAX
    if (MAX - MIN < 1) {
        MIN = Math.max(0, pesoMin - 3);
        MAX = pesoMax + 3;
    }

    // Redondear para mejor visualización
    MIN = Math.floor(MIN);
    MAX = Math.ceil(MAX);

    return {
        MIN: MIN,
        MAX: MAX,
        pesoMin: pesoMin,
        pesoMax: pesoMax
    };
};


function arraysSonDistintosDeep(arr1, arr2) {

    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return true;

    if (arr1.length !== arr2.length) return true;

    for (let i = 0; i < arr1.length; i++) {

        if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) {
            return true;
        }
    }

    return false;
}

function arraysSonDistintosSinOrden(arr1, arr2) {

    if (arr1.length !== arr2.length) return true;

    const ordenar = (arr) =>
        [...arr].sort((a, b) =>
            a.CodigoArticulo.localeCompare(b.CodigoArticulo)
        );

    const aOrdenado = ordenar(arr1);
    const bOrdenado = ordenar(arr2);

    return JSON.stringify(aOrdenado) !== JSON.stringify(bOrdenado);
}


const dashboardProduccion = new DashboardProduccion();

/**
 * Eventos jQuery - Se ejecutan cuando el DOM está listo
 * Configuran todos los event listeners y inicializan el dashboard
 */
$(function () {
    // Crear e inicializar la instancia del dashboard
    initHubDashboard();
    dashboardProduccion.inicializar();

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

    // Event listener para aplicar filtros
    $('#btnAplicarFiltros').on('click', function () {
        dashboardProduccion.aplicarFiltros();
    });

    // Event listener para exportar PDF
    $('.btn-export').on('click', function () {
        // Guardar texto original para restaurar después
        $(this).data('original-text', $(this).html());
        dashboardProduccion.exportarAPDF();
    });

    $('#AlmPedido').on('change', function () {
        const valor = $(this).val();

        if (parseInt(valor) > 0) {
            let pedido = $("#EP_Pedido").text().trim();
            dashboardProduccion.obtenerNoConforme(pedido, valor);
        }
        else {
            $("#NoConfEP").text("");
        }
    });

    console.log('Dashboard de Producción - Eventos configurados correctamente');
});

/**
 * Limpiar recursos al salir de la página
 */
$(window).on('beforeunload', function () {
    if (dashboardProduccion) {
        dashboardProduccion.detenerActualizaciones();
    }
});

// =============================================================================
// FUNCIONES GLOBALES 
// =============================================================================

/**
 * Función global para aplicar filtros - mantiene compatibilidad
 */
function aplicarFiltros() {
    if (dashboardProduccion) {
        dashboardProduccion.aplicarFiltros();
    }
}

/**
 * Función global para exportar PDF - mantiene compatibilidad
 */
function exportToPDF() {
    if (dashboardProduccion) {
        dashboardProduccion.exportarAPDF();
    }
}

function getInfoMes(fechaStr) {
    if (!fechaStr) return null;

    // Crear fecha en formato LOCAL evitando problemas de zona horaria
    const [anioStr, mesStr, diaStr] = fechaStr.split('-');

    const anio = Number(anioStr);
    const mes = Number(mesStr) - 1; // JS usa 0–11

    const fecha = new Date(anio, mes, Number(diaStr));
    if (isNaN(fecha)) return null;

    // Primer y último día del mes
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);

    // Función para formatear YYYY-MM-DD en local
    const format = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const inicioMes = format(primerDia);
    const finMes = format(ultimoDia);

    const nombresMes = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return {
        inicio: inicioMes,
        fin: finMes,
        dInicio: primerDia.getDate(),
        dFin: ultimoDia.getDate(),
        mesNumero: mes + 1,
        mesNombre: nombresMes[mes],
        anio: anio
    };
}
