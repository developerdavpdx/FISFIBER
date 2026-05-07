using Fisfiber.Models;
using log4net;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Mvc;

namespace Fisfiber.Controllers
{
    public class MonitorLogController : Controller
    {

        Logica Logic = new Logica();
        AccesoDatos AD = new AccesoDatos();
        private static readonly ILog log = LogManager.GetLogger(typeof(MonitorLogController));
        GlobalController GC = new GlobalController();

        // GET: MonitorLog
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult MonitorLog()
        {

            string CodeISO = IniConfigManager.LeerValor("Monitor_CodeISO", "Valor");
            string Nivel = IniConfigManager.LeerValor("Monitor_Nivel", "Valor");
            string FechaRev = IniConfigManager.LeerValor("Monitor_FechaRevision", "Valor");
            string Revision = IniConfigManager.LeerValor("Monitor_Revision", "Valor");
            string FechaLib = IniConfigManager.LeerValor("Monitor_FechaLiberacion", "Valor");
            ViewBag.CodeISO = CodeISO;
            ViewBag.Nivel = Nivel;
            ViewBag.FechaRev = FechaRev;
            ViewBag.FechaLib = FechaLib;
            ViewBag.Revision = Revision;
            

            return View();
        }

        public JsonResult GetPlanEmbDetails(string usuario)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                AD.RequestParameters.Clear();
                //Trae el plan de embarques mas actual
                string UpdatePedidos = Logic.GlobalProcedure(AD.GCUpdatePedidosInPlanEmb, AD.RequestParameters);
                string PPD = Logic.GlobalProcedure(AD.GCGetPlanEmbDetailsComV2, AD.RequestParameters);
                string PlanAct = Logic.GlobalProcedure(AD.GCGetPlanEmbAct, AD.RequestParameters);


                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (PPD.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = PPD });
                }
                //No existe información
                else if (PPD.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al plan: " });
                }


                dynamic PlanActData = JsonConvert.DeserializeObject<dynamic>(PlanAct);

                string Folio = PlanActData[0].folio;

                AD.RequestParameters.Add("folio", Folio);
                string PedidosNoAuth = Logic.GlobalProcedure(AD.GCGetPedidosNoAuth, AD.RequestParameters);


                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", Folio);
                AD.RequestParameters.Add("tabla", "PlanVentas");
                string headerBitacora = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);
                dynamic HeaderPlan = JsonConvert.DeserializeObject<dynamic>(headerBitacora);
               

                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = PlanAct,
                    Data = PPD,
                    ExtraData = headerBitacora,
                    Other = PedidosNoAuth
                });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de planes de ventas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }


        public JsonResult GetPlanEmbDetailsByFolio(string usuario, string Folio)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Folio",Folio);
                //Actualiza los estatus de los pedidos
                string UpdatePedidos = Logic.GlobalProcedure(AD.GCUpdatePedidosInPlanEmbFolio, AD.RequestParameters);
                
                string PPD = Logic.GlobalProcedure(AD.GCGetPlanEmbDetComFolio, AD.RequestParameters);
                string PlanAct = Logic.GlobalProcedure(AD.GCGetInfoPlanEmbAct, AD.RequestParameters);
                string RecibosPro = Logic.GlobalProcedure(AD.GCGetRecibosPorPedido, AD.RequestParameters);

                
                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (PPD.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = PPD });
                }
                //No existe información
                else if (PPD.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al plan: " });
                }
                

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", Folio);
                string PedidosNoAuth = Logic.GlobalProcedure(AD.GCGetPedidosNoAuth, AD.RequestParameters);


                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", Folio);
                AD.RequestParameters.Add("tabla", "PlanVentas");
                string headerBitacora = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);
                dynamic HeaderPlan = JsonConvert.DeserializeObject<dynamic>(headerBitacora);


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = PlanAct,
                    Data = PPD,
                    Data2 = RecibosPro,
                    ExtraData = headerBitacora,
                    Other = PedidosNoAuth
                });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de planes de embarques " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }


        public JsonResult GetEstatusCargaAut()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                //Trae estatus de carga 
                string EstatusAut = Logic.GlobalProcedure(AD.GCGetEstatusCargaAutEmb, AD.RequestParameters);

                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (EstatusAut.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = EstatusAut });
                }
                //No existe información
                else if (EstatusAut.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontraron los estatus..." });
                }


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de estatus carga",
                    Data = EstatusAut,
                    ExtraData = "",
                    Other = ""
                });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de estatus de carga " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetFacturasPedidosByFolio(string Folio)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Folio", Folio);
                //Trae estatus de carga 
                string facturas = Logic.GlobalProcedure(AD.GCGetFacturasByFolio, AD.RequestParameters);
                string remisionados = Logic.GlobalProcedure(AD.GCGetRemisionadosByFolio, AD.RequestParameters);

                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (facturas.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = facturas });
                }
                //No existe información
                else if (facturas.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontraron los estatus..." });
                }


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de facturas",
                    Data = facturas,
                    ExtraData = remisionados,
                    Other = ""
                });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de estatus de carga " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }


        public JsonResult UpdateEstatus(string id, string idNuevoEst)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                AD.RequestParameters.Add("IdPedido", id);
                AD.RequestParameters.Add("IdNuevoEstado", idNuevoEst);
                //Trae el plan de embarques mas actual
                string PPD = Logic.GlobalProcedure(AD.GCUpdateEstatusCarga, AD.RequestParameters);


                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (PPD.Contains("ERROR"))
                {
                    return Json(new AccesoDatos.JsonResponse { 
                        Status = "ERROR", Message = PPD });
                }
                //No existe información
                else if (PPD.Contains("WARNING"))
                {
                    return Json(new AccesoDatos.JsonResponse { 
                        Status = "ERROR", Message = "No se encontró el pedido" });
                }


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Pedido actualizado correctamente",
                    Data = PPD
                });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de planes de ventas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

    }
}