using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Fisfiber.Hubs
{
    public class BasculaHub : Hub
    {
        public void ActualizarPeso(decimal peso)
        {
            Clients.All.actualizarPeso(peso);
        }
    }
}