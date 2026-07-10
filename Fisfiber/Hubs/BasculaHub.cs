using Fisfiber.Models;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Fisfiber.Hubs
{
    public class BasculaHub : Hub
    {
        public void ActualizarPeso(BasculaPesoDto model)
        {
            Clients.All.actualizarPeso(model);
        }
    }
}