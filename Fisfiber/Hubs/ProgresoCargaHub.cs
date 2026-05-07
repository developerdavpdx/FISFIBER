using Antlr.Runtime.Tree;
using Fisfiber.Controllers;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Fisfiber.Hubs
{
    public class ProgresoCargaHub : Hub
    {
        public void EnviarProgreso(int Id,
            string pedido, string NumViaje, string Unidad,
            int TPzsEntrega, int TPzsCargadas)
        {
            // Envía a todos los clientes conectados
            Clients.All.actualizarPlanEmb(Id, pedido, NumViaje, Unidad, TPzsEntrega, TPzsCargadas);
        }

       

    }
}