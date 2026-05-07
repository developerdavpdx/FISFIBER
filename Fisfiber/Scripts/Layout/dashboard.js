class Dashboard {

    constructor() {
        this.colors = [
            '#8C1B24',
            '#B5B5B5',
            '#4A4A4A',
            '#1B8C6B',
            '#F7A6A6',
            '#C5C5C5'
        ];
        
    }

    //GRAFICAS
     graficaAvancePL() {

        Highcharts.chart('avancePorLinea', {
            chart: {
                type: 'solidgauge'
            },

            title: {
                text: 'Porcentaje de avance de orden de fabricación por línea',
                style: {
                    fontSize: '18px'
                }
            },

            pane: {
                startAngle: 0,
                endAngle: 360,
                background: [
                    { // Línea 1
                        outerRadius: '112%',
                        innerRadius: '88%',
                        backgroundColor: Highcharts.color(this.colors[0])
                            .setOpacity(0.3).get(),
                        borderWidth: 0
                    },
                    { // Línea 2
                        outerRadius: '87%',
                        innerRadius: '63%',
                        backgroundColor: Highcharts.color(this.colors[1])
                            .setOpacity(0.3).get(),
                        borderWidth: 0
                    },
                    { // Línea 3
                        outerRadius: '62%',
                        innerRadius: '38%',
                        backgroundColor: Highcharts.color(this.colors[2])
                            .setOpacity(0.3).get(),
                        borderWidth: 0
                    }
                ]
            },

            yAxis: {
                min: 0,
                max: 100,
                lineWidth: 0,
                tickPositions: []
            },

            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        enabled: true,
                        borderWidth: 0,
                        useHTML: true
                    }
                }
            },

            series: [{
                name: 'Línea 1',
                data: [{
                    color: this.colors[0],
                    radius: '112%',
                    innerRadius: '88%',
                    y: 65 // Valor del KPI
                }],
                dataLabels: {
                    format:
                        '<div style="text-align:center">' +
                        '<span style="font-size:25px">{y}%</span><br/>' +
                        '<span style="font-size:12px;opacity:0.4">Línea 1</span>' +
                        '</div>'
                }
            }, {
                name: 'Línea 2',
                data: [{
                    color: this.colors[1],
                    radius: '87%',
                    innerRadius: '63%',
                    y: 75 // Valor del KPI
                }],
                dataLabels: {
                    format:
                        '<div style="text-align:center">' +
                        '<span style="font-size:25px">{y}%</span><br/>' +
                        '<span style="font-size:12px;opacity:0.4">Línea 2</span>' +
                        '</div>'
                }
            }, {
                name: 'Línea 3',
                data: [{
                    color: this.colors[2],
                    radius: '62%',
                    innerRadius: '38%',
                    y: 50 // Valor del KPI
                }],
                dataLabels: {
                    format:
                        '<div style="text-align:center">' +
                        '<span style="font-size:25px">{y}%</span><br/>' +
                        '<span style="font-size:12px;opacity:0.4">Línea 3</span>' +
                        '</div>'
                }
                }],
            credits: false
        });
    }
     graficaFabriPD() {
        // Datos y opciones para una gráfica de líneas
        Highcharts.chart('fabricacionPorDia', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Total de fabricación por día'
            },
            xAxis: {
                categories: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
                crosshair: true
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Unidades Fabricadas'
                }
            },
            colors: this.colors, // Aplica los colores del arreglo
            series: [{
                name: 'Línea 1',
                data: [150, 200, 170, 220, 180]
            }, {
                name: 'Línea 2',
                data: [130, 180, 160, 210, 170]
            }, {
                name: 'Línea 3',
                data: [120, 160, 140, 200, 150]
                }],
            credits: false
        });
    }
     graficaTiempoUM() {

        Highcharts.chart('tiempoUsoMaquina', {
            chart: {
                type: 'bar'
            },
            colors: [
                '#8C1B24',
                '#B5B5B5',
                '#4A4A4A',
                '#1B8C6B',
                '#F7A6A6',
                '#C5C5C5'
            ], // Aplica los colores del arreglo
            title: {
                text: 'Tiempo de uso de cada máquina en el día actual'
            },
            xAxis: {
                categories: ['Máquina 1', 'Máquina 2', 'Máquina 3', 'Máquina 4'], // Categorías (máquinas)
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Tiempo (horas)',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                valueSuffix: ' horas'
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            series: [{
                name: 'Tiempo de Uso',
                data: [4, 6, 2, 8] // Tiempo de uso por máquina
            }],
            credits:false
        });
    }
     graficaScrapPl() {
        Highcharts.chart('scrapPorLinea', {
            chart: {
                type: 'area'
            },
            title: {
                text: 'Scrap generado por línea'
            },
            xAxis: {
                categories: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo']
            },
            yAxis: {
                title: {
                    text: 'Unidades de Scrap'
                }
            },
            colors: this.colors, // Aplica los colores del arreglo
            series: [{
                name: 'Línea 1',
                data: [30, 50, 40, 60, 70]
            }, {
                name: 'Línea 2',
                data: [25, 35, 30, 50, 60]
            }, {
                name: 'Línea 3',
                data: [20, 25, 20, 30, 40]
                }],
            credits: false
        });
    }
    async getNotifiPendModal() {
        try {
            let url = $("body").attr("consultarnotificacion");
            const response = await $.ajax({
                url: url,
                type: 'POST',
                dataType: 'JSON',
                data: {
                    usuario: sessionStorage.getItem("email")  // Considera obtener esto dinámicamente
                }
            });

            let notifi = JSON.parse(response.data);
            console.log(notifi);

            let notificaciones = "";
            let count = 0;
            let space = "";

            if (notifi.length > 0) {
                notifi.forEach(n => {

                    if (count != 0)
                        space = "mt-2";
                    else
                        space = "";

                    let itemNotifi = `<a href="${n.UrlAction}" target="_blank"><div class="toast fade show w-100 ${space}" role="alert" aria-live="assertive" aria-atomic="true">
                          <div class="toast-header">
                            <i id="notification-box-read" class="dropstart-toggle bi bi-bell-fill fs-5 position-relative" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <span class="position-absolute top-0 start-100 translate-middle badge border border-light rounded-circle bg-danger p-1" style="display: none;"><span class="visually-hidden">unread messages</span></span>
                            </i>
                            <strong class="me-auto ps-2">${n.Titulo}</strong>
                            <small>${n.FechaCreacion}</small>
                          </div>
                          <div class="toast-body text-left">
                            ${n.Mensaje}
                          </div>
                        </div>
                        </a>`;

                    LayoutCs.idsNotifiPend += `${n.NotificacionID},`
                    notificaciones += itemNotifi;
                    count++;
                })

                $('#newNotifications').modal('show');

            }
            else {
                notificaciones =
                    `
                   <li class="notification-item">
                                 <a class="dropdown-item" target="_blank">
                                     <div class="border-bottom mb-2">
                                         <div class="toast-header">
                                                 <strong class="me-auto">Sin notificaciones</strong>
                                         </div>
                                     </div>
                                 </a>
                             </li>
                  `

            }
            $(`#newNotificationsBox`).empty();
            $(`#newNotificationsBox`).append(notificaciones);




        } catch (error) {
            LayoutCs.Excepcion(error, "Notificaciones pendientes");
        }
    }
}

// Instancia de clase
const DashboardCs = new Dashboard();

$(document).ready(function () {

    DashboardCs.graficaAvancePL();
    DashboardCs.graficaFabriPD();
    DashboardCs.graficaTiempoUM();
    DashboardCs.graficaScrapPl();
    //setTimeout(DashboardCs.getNotifiPendModal, 3000);
    
    //Leer notificaciones de modal inicial
    $(document).on('shown.bs.modal', '#newNotifications', function () {
        LayoutCs.readNotifi();
    });
});

