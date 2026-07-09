using Fisfiber.Hubs;
using Fisfiber.Models;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Fisfiber.Controllers
{
    public class BasculaController : Controller
    {

        // GET: 
        [HttpPost]
        public ActionResult ActualizarPeso(BasculaPesoDto model)
        {
            var hub = GlobalHost.ConnectionManager.GetHubContext<BasculaHub>();

            hub.Clients.All.actualizarPeso(model.Peso);

            return Json(new { ok = true });
        }


    }
}
