using Antlr.Runtime.Tree;
using Fisfiber.Controllers;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Fisfiber.Hubs
{
    public class EstatusEnvioHub: Hub
    {

        public void ChangeEstatus(
         int Id, string pedido, string folio)
        {
            // Envía a todos los clientes conectados
            Clients.All.changeEstatusPedido(Id, pedido, folio);
        }

    }
}