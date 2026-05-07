using Fisfiber.Controllers;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Fisfiber.Hubs
{
    public class EntregasMercanciaHub: Hub
    {

        public void EnviarEntrada(string IdPedido, string Pedido, string Entrada)
        {
            Clients.All.nuevaEntrega(IdPedido, Pedido, Entrada);
        }
    }
}