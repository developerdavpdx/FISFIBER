using Fisfiber.Controllers;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Fisfiber.Hubs
{
    public class DashTendPesosHub: Hub
    {
        public void EnviarTendenciasP(
        string articulo, string sisnum, string lote)
        {
            // Envía a todos los clientes conectados
            Clients.All.updateTendencias(articulo,sisnum, lote);
        }


        public void CambioEnPlanProduccion(string folioPlan)
        {
            // Envía a todos los clientes conectados
            Clients.All.changePlanPro(folioPlan);
        }
    }
}