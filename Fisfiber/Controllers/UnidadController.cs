using Fisfiber.Models;
using log4net;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace Fisfiber.Controllers
{
    public class UnidadController : Controller
    {

        Logica Logic = new Logica();
        AccesoDatos AD = new AccesoDatos();
        private static readonly ILog log = LogManager.GetLogger(typeof(UnidadController));

        // GET: Unidad
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Unidades()
        {
  
            string unidades = Logic.GlobalProcedure(AD.GCGetUnidadesActivas, AD.RequestParameters);
            var data = JsonConvert.DeserializeObject<List<UnidadViewModel>>(unidades);

            string estadosUnidades = Logic.GlobalProcedure(AD.GCGetEstadosUnidadesActivas, AD.RequestParameters);
            List<EstadoUnidad> dataEstadosUni = JsonConvert.DeserializeObject<List<EstadoUnidad>>(estadosUnidades);

            //string operadores = Logic.GlobalProcedure(AD.GCGetOperadores, AD.RequestParameters);
            //List<Operador> dataOperadores = JsonConvert.DeserializeObject<List<Operador>>(operadores);

            ViewBag.EstadosUnidades = dataEstadosUni;
            //ViewBag.Operadores = dataOperadores;

            return View(data.ToList());
        }

        [HttpPost]
        public ActionResult ActualizarUnidad(
            int id, string estado, string comentarios, string operador, 
            string ayud1, string ayud2, string ayud3, string ayud4)
        {
            AD.RequestParameters = new Dictionary<string, string>();
            AD.RequestParameters.Add("Id", id.ToString());
            AD.RequestParameters.Add("Estado", estado.ToString());
            AD.RequestParameters.Add("Comentarios", comentarios);
            AD.RequestParameters.Add("Operador", operador);
            AD.RequestParameters.Add("Ayudante1", ayud1);
            AD.RequestParameters.Add("Ayudante2", ayud2);
            AD.RequestParameters.Add("Ayudante3", ayud3);
            AD.RequestParameters.Add("Ayudante4", ayud4);

            string unidad = Logic.GlobalProcedure(AD.GCUpdateEstoUnidad, AD.RequestParameters);


            if (unidad.Contains("Error"))
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            
            return Json(new { success = true });
        }

    }
}