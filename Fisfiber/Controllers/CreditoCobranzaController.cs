using Fisfiber.Models;
using log4net;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Reflection;
using System.Security.Policy;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace Fisfiber.Controllers
{
    public class CreditoCobranzaController : Controller
    {

        Logica Logic = new Logica();
        AccesoDatos AD = new AccesoDatos();
        private static readonly ILog log = LogManager.GetLogger(typeof(CreditoCobranzaController));
        GlobalController GC = new GlobalController();

        string url =
                   ConfigurationManager.AppSettings["Localhost"] == "true" ?
                    ConfigurationManager.AppSettings["UrlLocalEmail"] :
                    ConfigurationManager.AppSettings["UrlProdEmial"];

        string codeCredito = ConfigurationManager.AppSettings["Credito"];


        public ActionResult PlanVentasCC()
        {
            string CodeISO = IniConfigManager.LeerValor("ReporteCC_CodeISO", "Valor");
            string Nivel = IniConfigManager.LeerValor("ReporteCC_Nivel", "Valor");
            string FechaRev = IniConfigManager.LeerValor("ReporteCC_FechaRevision", "Valor");
            string Revision = IniConfigManager.LeerValor("ReporteCC_Revision", "Valor");
            string FechaLib = IniConfigManager.LeerValor("ReporteCC_FechaLiberacion", "Valor");

            ViewBag.CodeISO = CodeISO;
            ViewBag.Nivel = Nivel;
            ViewBag.FechaRev = FechaRev;
            ViewBag.FechaLib = FechaLib;
            ViewBag.Revision = Revision;
            
            return View();
        }

        public JsonResult UpdateEstatusOV(
         string PlanVentas, string folioPP,
         string usuario, string Tabla)
        {
            try
            {

                AD.RequestParameters = new Dictionary<string, string>();

                //Insertar el plan de produccion

                log.Info($"[UpdateEstatusOV] Actualizando plan de ventas");
                AD.RequestParameters.Clear();
                JArray LineasPP = JArray.Parse(PlanVentas);

                foreach (JObject item in LineasPP)
                {
                    //Agregar resto de parametros de consulta
                    foreach (var linea in item.Properties())
                    {

                        AD.RequestParameters.Add(linea.Name, linea.Value.ToString());
                    }


                    //Insertar la linea
                    string lineaPP = Logic.GlobalProcedure(AD.GCUpdatePVAutorizacion, AD.RequestParameters);


                    if (lineaPP.Contains("Error"))
                    {
                        log.Error($"[UpdateEstatusOV] Error al actualizar plan: {lineaPP}");
                        return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = lineaPP, Data = "[]" });
                    }
                    log.Info($"[UpdateEstatusOV] Actualizacion correcta pedidos actualizados : {lineaPP.ToString()}");

                    //Limpiar los parametros
                    AD.RequestParameters.Clear();
                }


                AD.RequestParameters.Clear();

                SendPedNoAuth(folioPP);

                //OK
                log.Info($"[ActualizarOF] Proceso completado.");
                var Result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Plan actualizado correctamente.",
                    Data = "[]",
                    ExtraData = ""
                });
                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible actualizar las ordenes de fabricación " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"[ActualizarOF] No fue posible completar el proceso de actualización del plan: {finalmessage.ToString()}");

                var Result = Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;
            }
        }


        public JsonResult UpdateEstatusPlanCC(
         string folio,
         string usuario)
        {
            string NameMetod = "UpdateEstatusPlanCC";
            
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                log.Info($"[{NameMetod}] Actualizando estatus de plan : {folio} Usuario : {usuario}");
                AD.RequestParameters.Add("Folio", folio);
                AD.RequestParameters.Add("Estatus", "1");


                string resp = Logic.GlobalProcedure(AD.GCUpdateEstRevCC, AD.RequestParameters);

                if (resp.Contains("Error"))
                {
                    throw new Exception("Error en la actualización "+resp);
                }
                //OK
                log.Info($"[{NameMetod}] Proceso completado.");
                var Result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Plan actualizado correctamente.",
                    Data = "[]",
                    ExtraData = ""
                });
                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible actualizar las ordenes de fabricación " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"[{NameMetod}] No fue posible completar el proceso de actualización del plan: {finalmessage.ToString()}");

                var Result = Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;
            }
        }

        public JsonResult SendPedNoAuth(string folio)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                //Obtener info de pedidos que requieren auth
                List<AccesoDatos.PlanVentas> PedidosEntregas = new List<AccesoDatos.PlanVentas>();
                AD.RequestParameters.Add("Folio", folio.ToString());
                string reporte = Logic.GlobalProcedure(AD.GCGetPedNoAuthOV, AD.RequestParameters);
                PedidosEntregas = JsonConvert.DeserializeObject<List<AccesoDatos.PlanVentas>>(reporte);

                //Envio notificacion a Logistica
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Code", codeCredito);//Codigo para busqueda en tabla
                string EmailsLogistica = Logic.GlobalProcedure(AD.GCGetEmiailsCode, AD.RequestParameters);
                List<Correos> listaEmails = JsonConvert.DeserializeObject<List<Correos>>(EmailsLogistica);


                if (PedidosEntregas.Count() > 0)
                {
                    var pedidosHtml = new StringBuilder();
                    foreach (AccesoDatos.PlanVentas pedido in PedidosEntregas)
                    {
                        string baseUrl = $"{url}";

                        pedidosHtml.Append($@"
                            <div style=""margin-bottom:20px; border-bottom:1px solid #ddd; padding-bottom:10px;"">
                                <strong>Pedido:</strong> {pedido.Pedido} | 
                                <strong>Fecha Entrega:</strong> {pedido.F_Entrega} |                       
                                <strong>Piezas Entrega:</strong> {pedido.PiezasEntrega}<br>
                                <strong>Cliente:</strong> {pedido.Cliente} | 
                                <strong>Fecha Original Entrega :</strong> {pedido.F_OriginalEntrega}<br><br>
                            </div>");
                    }

                    string plantillaHtml = System.IO.File.ReadAllText(
                    Server.MapPath("~/Plantillas/CorreoBase.html"));

                 

                    // Reemplazar los valores
                    string htmlFinal = plantillaHtml
                        .Replace("{{TITLEH}}", "Pedidos no autorizados")
                        .Replace("{{TITLE}}", $@"📝 Plan {folio}. <br> Los siguientes pedidos no se autorizaron por credito y cobranza:")
                        .Replace("{{BODY}}", pedidosHtml.ToString())
                        .Replace("{{LINK}}", url);

                    //htmlBody = htmlBody.Replace("{{FOLIO}}", folio);
                    //htmlBodyAuth = htmlBodyAuth.Replace("{{LISTA_PEDIDOS}}", pedidosHtml.ToString());

                    //htmlBody = htmlBody.Replace("{{FOLIO}}", folioML);
                    EmailRequest emailRequest = new EmailRequest();
                    emailRequest.To = "";
                    emailRequest.Subject = $@"Pedidos no autorizados en plan {folio}";
                    emailRequest.Body = htmlFinal;
                    emailRequest.IsHtml = true;

                    GC.SendEmails(emailRequest, "~/Images/logoFisfiber.png", listaEmails, "Creedito y cobranza");
                }


                var Result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de folio obtenidos correctamente.",
                    Data = "",
                    ExtraData = string.Empty
                });

                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible crear el plan de ordenes ventas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

    }
}