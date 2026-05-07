using Fisfiber.Hubs;
using Fisfiber.Models;
using log4net;
using Microsoft.Ajax.Utilities;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Mvc;

namespace Fisfiber.Controllers
{
    public class ApiController : Controller
    {
        Logica Logic = new Logica();
        AccesoDatos AD = new AccesoDatos();
        private static readonly ILog log = LogManager.GetLogger(typeof(ApiController));

        //Proceso de carga producción. Cachados desde la Hand Held
        [HttpPost]
        public ActionResult UpdateData(UpdateDataRequest request)
        {
            try {

                log.Info($"[UPDATE-DATA] : Entrando en actualizacion carga en vista ");

                var pedido = request.pedido;
                var rollos = request.rollos;
                
                log.Info($"[UPDATE-DATA] : Datos entrantes pedido con DocEntry: {pedido} rollos: {rollos}");

                // Obtén el contexto del Hub
                var context = GlobalHost.ConnectionManager.GetHubContext<ProgresoCargaHub>();

                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("DocEntry", pedido);
                AD.RequestParameters.Add("Pzs", rollos.ToString());

                //Trae el plan de embarques mas actual
                string Result = Logic.GlobalProcedure(AD.GCUpdateCargaPedido, AD.RequestParameters);


                log.Info($"[UPDATE-DATA] : Resultado actualizacion con store : {Result}");


                // Validación del los datos
                if (Result.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = Result });
                }
                //No existe información
                else if (Result.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al pedido" });
                }

                var jsonArray = JArray.Parse(Result);

                if (Result.Contains("CARGA COMPLETA"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = (string)jsonArray[0]["Msj"] });
                }

                int TPzsEntrega = (int)jsonArray[0]["TotalPiezasEntrega"];
                int TPzsCargadas = (int)jsonArray[0]["TotalPzsCargadas"];
                string NumViaje = (string)jsonArray[0]["NumeroViaje"];
                string Unidad = (string)jsonArray[0]["Unidad"];
                string Pedido = (string)jsonArray[0]["Pedido"];
                int Id = (int)jsonArray[0]["id"];

                // Llamar al método en el cliente
                context.Clients.All.actualizarPlanEmb(Id, Pedido, NumViaje, Unidad, TPzsEntrega, TPzsCargadas);

                if(TPzsCargadas>0 && TPzsEntrega>0 && TPzsCargadas == TPzsEntrega)
                {
                    //Actualizando a estatus "CARGADO"
                    AD.RequestParameters = new Dictionary<string, string>();
                    AD.RequestParameters.Add("Id", Id.ToString());

                    //Trae el plan de embarques mas actual
                    string ResultUpdate = Logic.GlobalProcedure(AD.GCUpdatePedidoCargado, AD.RequestParameters);

                    if (ResultUpdate.Contains("Error"))
                    {
                        //return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = Result });
                        log.Error($"[UPDATE-DATA] : No se pudo actualizar a CARGADO ; ${ResultUpdate} ");

                    }
                    //No existe información
                    else if (ResultUpdate.Contains("[]"))
                    {
                        //return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al pedido" });
                        log.Warn($"[UPDATE-DATA] : Ningun registro se actualizo a CARGADO ; ${ResultUpdate} ");

                    }

                }

                log.Info($"[UPDATE-DATA] : PROCESO COMPLETADO");


                return Json(new
                {
                    success = true,
                    message = "Dato enviado a la vista",
                    Pedido = Pedido,
                    TotalPzsEntrega = TPzsEntrega,
                    TotalPzsCargadas = TPzsCargadas
                });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = 
                    this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = 
                    "No es posible mandar la informacion a la vista " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }

        }

        //Nuevas entregas de mercancia generadas. Cachadas desde notice SAP
        [HttpPost]
        public ActionResult NuevaEntrega(EntregaM request)
        {
            try
            {


                var docEntrega = request.DocEntryEntrega;

                log.Info($"[NuevaEntrega] : Nueva entrada de mercancía recibida  {docEntrega}");

                // Obtén el contexto del Hub
                var context = GlobalHost.ConnectionManager.GetHubContext<EntregasMercanciaHub>();

                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("DocEntryEntrega", docEntrega);

                //Trae el plan de embarques mas actual
                string Result = Logic.GlobalProcedure(AD.GCSaveEntradaPedidoInPV, AD.RequestParameters);

                // Validación del los datos
                if (Result.Contains("Error") || Result.Contains("ERROR"))
                {
                    log.Error($"[NuevaEntrega] : ERROR en entrega {Result}");

                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = Result });
                }
                //No existe información
                else if (Result.Contains("[]"))
                {
                    log.Warn($"[NuevaEntrega] : No se encontro info {Result}");

                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al pedido" });
                }
                else if (Result.Contains("WARNING"))
                {
                    log.Warn($"[NuevaEntrega] : Algo salio mal {Result}");

                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al pedido" });
                }

                var jsonArray = JArray.Parse(Result);

                log.Info($"[NuevaEntrega] : Acutalización realizada correctamente {Result}");


                var IdPedido = (string)jsonArray[0]["IdPedido"];
                var Pedido = (string)jsonArray[0]["Pedido"];
                var NoEntrada = (string)jsonArray[0]["NoEntrada"];


                context.Clients.All.nuevaEntrega(IdPedido, Pedido, NoEntrada);
                log.Info($"[NuevaEntrega] : Notificación emitida a monitor IdPedido: {IdPedido} , Pedido: {Pedido}, NoEntrega {NoEntrada}");



                return Json(new
                {
                    success = true,
                    message = "Dato enviado a la vista",
                });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName =
                    this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg =
                    "No es posible mandar la informacion a la vista " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }

        }


        //Nuevos recibos de produccion. Cachados desde notice de SAP
        [HttpPost]
        public ActionResult DashUpdateTendPesos(UpdateTendRequest request)
        {
            try
            {
                var absentry = request.absentry;
                var articulo = request.articulo;

                // Obtén el contexto del Hub
                var context = GlobalHost.ConnectionManager.GetHubContext<DashTendPesosHub>();

                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("SisNum", absentry);

                string Result = Logic.GlobalProcedure(AD.GCGetNewLote, AD.RequestParameters);

                // Validación del los datos
                if (Result.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = Result });
                }
                //No existe información
                else if (Result.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al pedido" });
                }

                //var jsonArray = JArray.Parse(Result);

                //int TPzsEntrega = (int)jsonArray[0]["TotalPiezasEntrega"];
           
                // Llamar al método en el cliente
                context.Clients.All.updateTendencias(articulo, absentry, Result);


                return Json(new
                {
                    success = true,
                    message = "Dato enviado a la vista",
                    Articulo = articulo,
                    Sisnum = absentry,
                    Tendencias = Result
                });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName =
                    this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg =
                    "No es posible mandar la informacion a la vista " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }

        }


    }
}