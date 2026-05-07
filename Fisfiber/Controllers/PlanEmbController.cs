using DocumentFormat.OpenXml.Drawing.Charts;
using DocumentFormat.OpenXml.Office2010.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using Fisfiber.Hubs;
using Fisfiber.Models;
using log4net;
using Microsoft.Ajax.Utilities;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Drawing.Drawing2D;
using System.Linq;
using System.Numerics;
using System.Reflection;
using System.Security.Policy;
using System.Web;
using System.Web.Mvc;
using System.Web.WebPages;
using static Fisfiber.Controllers.AccesoDatos;

namespace Fisfiber.Controllers
{
    public class PlanEmbController : Controller
    {

        Logica Logic = new Logica();
        AccesoDatos AD = new AccesoDatos();
        private static readonly ILog log = LogManager.GetLogger(typeof(PlanEmbController));
        GlobalController GC = new GlobalController();

        string url =
            ConfigurationManager.AppSettings["Localhost"] == "true" ?
             ConfigurationManager.AppSettings["UrlLocalEmail"] :
             ConfigurationManager.AppSettings["UrlProdEmial"];
        //string codeAlm = ConfigurationManager.AppSettings["Almacen"];
        string codeDevolucionCliente = ConfigurationManager.AppSettings["DevolucionCliente"];
        //string codeVentas = ConfigurationManager.AppSettings["PlanVentas"];

        //Cambia nombre
        string codeLogistica = ConfigurationManager.AppSettings["Logistica"];
        string codeNotifiAlamacen = ConfigurationManager.AppSettings["NotificacionAlmacen"];


        // GET: PlanEmb
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult PlanEmbarques()
        {

            string CodeISO = IniConfigManager.LeerValor("PlanEmb_CodeISO", "Valor");
            string Nivel = IniConfigManager.LeerValor("PlanEmb_Nivel", "Valor");
            string FechaRev = IniConfigManager.LeerValor("PlanEmb_FechaRevision", "Valor");
            string FechaLib = IniConfigManager.LeerValor("PlanEmb_FechaLiberacion", "Valor");
            string Revision = IniConfigManager.LeerValor("PlanEmb_Revision", "Valor");
            ViewBag.CodeISO = CodeISO;
            ViewBag.Nivel = Nivel;
            ViewBag.FechaRev = FechaRev;
            ViewBag.FechaLib = FechaLib;
            ViewBag.Revision = Revision;

            return View();
        }

        public ActionResult MascPlanEmb()
        {

            string CodeISO = IniConfigManager.LeerValor("PlanEmb_CodeISO", "Valor");
            string Nivel = IniConfigManager.LeerValor("PlanEmb_Nivel", "Valor");
            string FechaRev = IniConfigManager.LeerValor("PlanEmb_FechaRevision", "Valor");
            string FechaLib = IniConfigManager.LeerValor("PlanEmb_FechaLiberacion", "Valor");
            string Revision = IniConfigManager.LeerValor("PlanEmb_Revision", "Valor");
            ViewBag.CodeISO = CodeISO;
            ViewBag.Nivel = Nivel;
            ViewBag.FechaRev = FechaRev;
            ViewBag.FechaLib = FechaLib;
            ViewBag.Revision = Revision;



            return View();
        }

        public ActionResult PlanesGenerados()
        {
            
            string CodeISO = IniConfigManager.LeerValor("PlanEmb_CodeISO", "Valor");
            string Nivel = IniConfigManager.LeerValor("PlanEmb_Nivel", "Valor");
            string FechaRev = IniConfigManager.LeerValor("PlanEmb_FechaRevision", "Valor");
            string FechaLib = IniConfigManager.LeerValor("PlanEmb_FechaLiberacion", "Valor");
            string Revision = IniConfigManager.LeerValor("PlanEmb_Revision", "Valor");

            ViewBag.CodeISO = CodeISO;
            ViewBag.Nivel = Nivel;
            ViewBag.FechaRev = FechaRev;
            ViewBag.FechaLib = FechaLib;
            ViewBag.Revision = Revision;


            return View();
        }

        public JsonResult GetPlanesVentas(string Status)
        {
            try
            {
                //Numero de veces que se ha realizado una peticion
                string draw = Request.Form["draw"];
                string drawValue = !string.IsNullOrEmpty(draw) ? draw : "0";
                int NroPeticion = Convert.ToInt32(drawValue);


                //Cantidad de registros a devolver
                string lenght = Request.Form["length"];
                string lenghtValue = !string.IsNullOrEmpty(lenght) ? lenght : "0";
                int CantidadRegistros = Convert.ToInt32(lenghtValue);

                //Cantidad de registros a omitir
                string start = Request.Form["start"];
                string startValue = !string.IsNullOrEmpty(start) ? start : "0";
                int OmitirRegistros = Convert.ToInt32(startValue);

                //Texto de busqueda
                string search = Request.Form["search[value]"];
                string searchValue = !string.IsNullOrEmpty(search) ? search : "";
                string FiltroBusqueda = searchValue;

                int TotalRegistros = 0;

                //=================================OBTENER DATOS===========================//

                List<AccesoDatos.PlanesVentasCreados> PP = new List<AccesoDatos.PlanesVentasCreados>();
                string connectionString = string.Empty;
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Status", Status);
                string reporte = Logic.GlobalProcedure(AD.GCGetPlanesVentas, AD.RequestParameters);
                PP = JsonConvert.DeserializeObject<List<AccesoDatos.PlanesVentasCreados>>(reporte);
                TotalRegistros = PP.Count();

                if (FiltroBusqueda != string.Empty)
                    PP = PP.Where(e => string.Concat(e.Folio, e.FechaCreacion).Contains(FiltroBusqueda)).ToList();
                //Total de registros filtrados
                int totalRegistrosFiltrados = PP.Count();
                //Resultado final de busqueda
                PP = PP.Skip(OmitirRegistros).Take(CantidadRegistros).ToList();

                //retornamos en JSON la data obtenida
                var EncuestasFiltradas = Json(new
                {
                    draw = NroPeticion,
                    recordsTotal = TotalRegistros,
                    recordsFiltered = totalRegistrosFiltrados,
                    data = PP
                }, JsonRequestBehavior.AllowGet);

                EncuestasFiltradas.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return EncuestasFiltradas;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de planes de producción " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                log.Error($"{finalmessage} - {E.Message}", E);


                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        //Trae los planes de ventas , generados como plan de embarques
        public JsonResult GetPlanesEmbarques()
        {
            try
            {
                //Numero de veces que se ha realizado una peticion
                string draw = Request.Form["draw"];
                string drawValue = !string.IsNullOrEmpty(draw) ? draw : "0";
                int NroPeticion = Convert.ToInt32(drawValue);

                //Cantidad de registros a devolver
                string lenght = Request.Form["length"];
                string lenghtValue = !string.IsNullOrEmpty(lenght) ? lenght : "0";
                int CantidadRegistros = Convert.ToInt32(lenghtValue);

                //Cantidad de registros a omitir
                string start = Request.Form["start"];
                string startValue = !string.IsNullOrEmpty(start) ? start : "0";
                int OmitirRegistros = Convert.ToInt32(startValue);

                //Texto de busqueda
                string search = Request.Form["search[value]"];
                string searchValue = !string.IsNullOrEmpty(search) ? search : "";
                string FiltroBusqueda = searchValue;

                int TotalRegistros = 0;

                //=================================OBTENER DATOS===========================//

                List<AccesoDatos.PlanesVentasCreados> PP = new List<AccesoDatos.PlanesVentasCreados>();
                string connectionString = string.Empty;
                AD.RequestParameters = new Dictionary<string, string>();
                //AD.RequestParameters.Add("Status", Status);
                string reporte = Logic.GlobalProcedure(AD.GCGetPlanesEmbarques, AD.RequestParameters);
                PP = JsonConvert.DeserializeObject<List<AccesoDatos.PlanesVentasCreados>>(reporte);
                TotalRegistros = PP.Count();

                if (FiltroBusqueda != string.Empty)
                    PP = PP.Where(e => string.Concat(e.Folio, e.FechaCreacion).Contains(FiltroBusqueda)).ToList();
                //Total de registros filtrados
                int totalRegistrosFiltrados = PP.Count();
                //Resultado final de busqueda
                PP = PP.Skip(OmitirRegistros).Take(CantidadRegistros).ToList();

                //retornamos en JSON la data obtenida
                var EncuestasFiltradas = Json(new
                {
                    draw = NroPeticion,
                    recordsTotal = TotalRegistros,
                    recordsFiltered = totalRegistrosFiltrados,
                    data = PP
                }, JsonRequestBehavior.AllowGet);

                EncuestasFiltradas.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return EncuestasFiltradas;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de planes de producción " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                log.Error($"{finalmessage} - {E.Message}", E);


                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult UpdateHeadPlanEmb(string FL, string FR, string Code, string Nivel)
        {

            try
            {

                IniConfigManager.GuardarValor("FechaLiberacion", "Valor", FL);
                IniConfigManager.GuardarValor("FechaRevision", "Valor", FR);
                IniConfigManager.GuardarValor("CodeISO", "Valor", Code);
                IniConfigManager.GuardarValor("Nivel", "Valor", Nivel);



                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "El pedido fue actulizado correctamente..",
                    Data = "",
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

        //Obtiene el detalle del plan de embarques por folio
        public JsonResult GetPlanEmbDetails(string usuario)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                AD.RequestParameters.Clear();
                //Trae el plan de embarques mas actual
                string UpdatePedidos = Logic.GlobalProcedure(AD.GCUpdatePedidosInPlanEmb, AD.RequestParameters);
                // string PPD = Logic.GlobalProcedure(AD.GCGetPlanEmbDetailsCom, AD.RequestParameters);
                string PPD = Logic.GlobalProcedure(AD.GCGetPlanEmbDetailsComV2, AD.RequestParameters);
                //string PPDT = Logic.GlobalProcedure(AD.GCGetPlanEmbDetails, AD.RequestParameters);
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

        public JsonResult GetDetailsPlanEmb(string usuario, string folio)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Folio", folio);
                // SpPdxFF_ActEstPedidosByFolio @Folio
                string UpdatePedidos = Logic.GlobalProcedure(AD.GCUpdatePedidosInPlanEmbFolio, AD.RequestParameters);
                // SpPdxFF_GetPlanEmbDetailsCombFolio @Folio
                string PPD = Logic.GlobalProcedure(AD.GCGetPlanEmbDetComFolio, AD.RequestParameters);
                // SpPdxFF_GetInfoFolioPlanEmbAct @Folio
                string PlanAct = Logic.GlobalProcedure(AD.GCGetInfoPlanEmbAct, AD.RequestParameters);


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

                string Folio = folio;
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", Folio);
                string PedidosNoAuth = Logic.GlobalProcedure(AD.GCGetPedidosNoAuth, AD.RequestParameters);


                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", Folio);
                AD.RequestParameters.Add("tabla", "PlanVentas");
                string headerBitacora = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);


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

        //Obtiene el detalle del plan de embarques por folio
        public JsonResult GetSugPlanEmb(string usuario, string folio)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Folio", folio);

                //Trae el plan de embarques mas actual
                string UpdatePedidos = Logic.GlobalProcedure(AD.GCUpdatePedidosInPlanEmbFolio, AD.RequestParameters);
                string PPD = Logic.GlobalProcedure(AD.GCGetPlanEmbDetComFolio, AD.RequestParameters);
                string PlanAct = Logic.GlobalProcedure(AD.GCGetInfoPlanEmbAct, AD.RequestParameters);
                string CapPlanEmb = Logic.GlobalProcedure(AD.GCGetCapacidadesPlanEmbFolio, AD.RequestParameters);

                dynamic PlanActData = JsonConvert.DeserializeObject<dynamic>(PlanAct);

                string Folio = folio;

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", Folio);
                string PedidosNoAuth = Logic.GlobalProcedure(AD.GCGetPedidosNoAuth, AD.RequestParameters);

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
                AD.RequestParameters.Add("tabla", "PlanVentas");
                string headerBitacora = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = CapPlanEmb,
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

        public JsonResult GetUniByPedido(int idPedido)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("IdPedido", idPedido.ToString());

                //Trae el plan de embarques mas actual
                string PPD = Logic.GlobalProcedure(AD.GCGetCapPedidoId, AD.RequestParameters);

                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (PPD.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = PPD });
                }
                //No existe información
                else if (PPD.Contains("[]"))
                {
                    //PPD = Logic.GlobalProcedure(AD.GCGetCapByPedidoTest, AD.RequestParameters);

                    //if (PPD.Contains("Error") || PPD.Contains("[]"))
                    //{
                    //    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al plan: " });
                    //}

                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al plan: " });

                }


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de unidades",
                    Data = PPD,
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
                string msg = "No es posible obtener la lista de planes de ventas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetOperadores()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                AD.RequestParameters.Clear();
                //Trae el plan de embarques mas actual
                string PPD = Logic.GlobalProcedure(AD.GCGetOperadores, AD.RequestParameters);

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


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de operadores",
                    Data = PPD,
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
                string msg = "No es posible obtener la lista de planes de ventas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetTipoUnidades()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                AD.RequestParameters.Clear();
                //Trae el plan de embarques mas actual
                string PPD = Logic.GlobalProcedure(AD.GCGetTipoUnidades, AD.RequestParameters);

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


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de tipo unidades",
                    Data = PPD,
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
                string msg = "No es posible obtener la lista de tipo unidades " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetSumPzsEntrega(string Pedido, string Folio)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Pedido", Pedido);
                AD.RequestParameters.Add("Folio", Folio);

                //Trae el plan de embarques mas actual
                string PPD = Logic.GlobalProcedure(AD.GCGetSumPzsEntregaPedido, AD.RequestParameters);

                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (PPD.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = PPD });
                }
                //No existe información
                else if (PPD.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al pedido: " });
                }


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de pedido",
                    Data = PPD,
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
                string msg = "No es posible obtener la lista de planes de ventas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetLocales()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Clear();
                //Trae el plan de embarques mas actual
                string PPD = Logic.GlobalProcedure(AD.GCGetLocales, AD.RequestParameters);

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


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de locales",
                    Data = PPD,
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
                string msg = "No es posible obtener la lista de planes de ventas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        //Optiene la relacion de unidades - operadores
        //Metodo para ligar la unidad con el operador en el plan de embarques
        public JsonResult GetUniOp()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                AD.RequestParameters.Clear();
                //Trae las unidades con su respectivo operador
                string PPD = Logic.GlobalProcedure(AD.GCGetUniOp, AD.RequestParameters);

                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (PPD.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = PPD });
                }
                //No existe información
                else if (PPD.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "ERROR",
                        Message = "No se encontró información de las unidades y operadores"
                    });
                }


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de unidades-operadores",
                    Data = PPD,
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
                string msg = "No es posible obtener la lista de unidades-operadores " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetEstatusCarga()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                //Trae estatus de carga 
                string PPD = Logic.GlobalProcedure(AD.GCGetEstatusCarga, AD.RequestParameters);
                string EstatusAut = Logic.GlobalProcedure(AD.GCGetEstatusCargaAutEmb, AD.RequestParameters);

                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (PPD.Contains("Error") || EstatusAut.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = PPD });
                }
                //No existe información
                else if (PPD.Contains("[]") && EstatusAut.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontraron los estatus..." });
                }


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de estatus carga",
                    Data = PPD,
                    ExtraData = EstatusAut,
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

        //Acualiza el plan de embarques
        public JsonResult UpdatePlanEmb(string PlanEmb,string NewPedidos, string Comentarios, string Folio)
        {
            try
            {

                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Clear();

                JArray LineasPP = JArray.Parse(PlanEmb);
                JArray NewLineasPV = JArray.Parse(NewPedidos);
                JArray Com = JArray.Parse(Comentarios);


                foreach (JObject item in LineasPP)
                {
                    //Agregar resto de parametros de consulta
                    foreach (var linea in item.Properties())
                    {

                        AD.RequestParameters.Add(linea.Name, linea.Value.ToString());
                    }


                    //Insertar la linea
                    string lineaPP = Logic.GlobalProcedure(AD.GCUpdatePlanEmb, AD.RequestParameters);


                    if (lineaPP.Contains("Error"))
                    {
                        return Json(new AccesoDatos.JsonResponse
                        { Status = "ERROR", Message = lineaPP, Data = "[]" });
                    }

                    //Limpiar los parametros
                    AD.RequestParameters.Clear();
                }

                foreach (JObject item in Com)
                {
                    //Agregar resto de parametros de consulta
                    foreach (var linea in item.Properties())
                    {
                        AD.RequestParameters.Add(linea.Name, linea.Value.ToString());
                    }


                    //Insertar la linea
                    string resComentario = Logic.GlobalProcedure(AD.GCUpdateCommentsEstPedido, AD.RequestParameters);


                    if (resComentario.Contains("Error"))
                    {
                        return Json(new AccesoDatos.JsonResponse
                        { Status = "ERROR", Message = resComentario, Data = "[]" });
                    }

                    //Limpiar los parametros
                    AD.RequestParameters.Clear();
                }

                foreach (JObject item in NewLineasPV)
                {
                    //Agregar resto de parametros de consulta
                    foreach (var linea in item.Properties())
                    {

                        AD.RequestParameters.Add(linea.Name, linea.Value.ToString());
                    }


                    //Insertar la linea
                    string lineaPP = Logic.GlobalProcedure(AD.GCDuplicarPedido, AD.RequestParameters);

                    if (lineaPP.Contains("Error"))
                    {
                        return Json(new AccesoDatos.JsonResponse
                        { Status = "ERROR", Message = lineaPP, Data = "[]" });
                    }

                    //Limpiar los parametros
                    AD.RequestParameters.Clear();
                }




                //string PlanAct = Logic.GlobalProcedure(AD.GCGetPlanEmbAct, AD.RequestParameters);
                //dynamic PlanActData = JsonConvert.DeserializeObject<dynamic>(PlanAct);
                //string Folio = PlanActData[0].folio;

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", Folio);
                AD.RequestParameters.Add("tabla", "PlanVentas");
                string headerBitacora = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);
                dynamic header = JsonConvert.DeserializeObject<dynamic>(headerBitacora);
                string Rev = header[0].Revision;

                //NOTIFICACIONES POR EMAIL
                bool envioAlm = this.SendNotifiAlamacen(Folio, Rev);
                bool envioVent = this.SendNotifiVentas(Folio, Rev);

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Folio", Folio);
                string generado = Logic.GlobalProcedure(AD.GCUpdatePlanGenerado, AD.RequestParameters);
                
                //REGRESO A ESTATUS PENDIENTE REVISION 
                string penRevVentas = Logic.GlobalProcedure(AD.GCUpdatePendRevVentas, AD.RequestParameters);


                //OK
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
                string msg = "No es posible guardar el plan " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                var Result = Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;
            }
        }

        public Boolean SendNotifiAlamacen(string Folio, string Rev)
        {
            bool enviado = true;

            try
            {
                //Envio notificacion a Logistica de nuevos pedidos
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Code", codeNotifiAlamacen);//Codigo para busqueda en tabla
                string EmailsLogistica = Logic.GlobalProcedure(AD.GCGetEmiailsCode, AD.RequestParameters);
                List<Correos> listaEmails = JsonConvert.DeserializeObject<List<Correos>>(EmailsLogistica);


                string plantillaHtml = System.IO.File.ReadAllText(
                    Server.MapPath("~/Plantillas/CorreoBase.html"));

                // Cuerpo dinámico
                string cuerpo = @"
                        Estimado usuario,<br><br>
                        Le informamos que se ha generado correctamente un nuevo plan de embarques en el sistema.<br><br>
                        Se solicita de su apoyo para completar la información de local de carga y ubicación de productos, de los pedidos.<br><br>
                        <strong style=""""color:#dc362e;"""">Folio del plan:</strong> 
                        <span style=""""font-size:18px; font-weight:bold;"""">{{FOLIO}}</span><br><br>
                        <strong style=""""color:#dc362e;"""">Revisión:</strong> 
                        <span style=""""font-size:18px; font-weight:bold;"""">{{REV}}</span><br><br>
                        Puede consultar más detalles directamente en el sistema.
                     ";


                cuerpo = cuerpo
                    .Replace("{{FOLIO}}", Folio)
                    .Replace("{{REV}}", Rev);

                // Reemplazar los valores
                string htmlFinal = plantillaHtml
                    .Replace("{{TITLEH}}", "Plan Embarques " + Folio + " Revisión: " + Rev)
                    .Replace("{{TITLE}}", "📝 Se ha genera un nuevo plan de embarques")
                    .Replace("{{BODY}}", cuerpo)
                    .Replace("{{LINK}}", url);


                EmailRequest emailRequest = new EmailRequest();
                emailRequest.To = "";
                emailRequest.Subject = "Nuevo plan embarques " + Folio + " Revisión: " + Rev;
                emailRequest.Body = htmlFinal;
                emailRequest.IsHtml = true;

                //var res = GC.SendEmails(emailRequest, "~/Images/logoFisfiber.png", listaEmails);
                var result =
                     GC.SendEmails(emailRequest, "~/Images/logoFisfiber.png", listaEmails, codeNotifiAlamacen) as JsonResult;
                var data = result.Data; // Esto es el objeto anónimo que pasaste a Json()


                Console.WriteLine(data);

                return enviado;
            }
            catch (Exception)
            {

                return false;
            }


        }

        public Boolean SendNotifiVentas(string Folio, string Rev)
        {
            bool enviado = true;

            try
            {
                //Envio notificacion a Logistica de nuevos pedidos
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Code", codeLogistica);//Codigo para busqueda en tabla
                string EmailsLogistica = Logic.GlobalProcedure(AD.GCGetEmiailsCode, AD.RequestParameters);
                List<Correos> listaEmails = JsonConvert.DeserializeObject<List<Correos>>(EmailsLogistica);


                string plantillaHtml = System.IO.File.ReadAllText(
                    Server.MapPath("~/Plantillas/CorreoBase.html"));

                // Cuerpo dinámico
                string cuerpo = @"
                        Estimado usuario,<br><br>
                        Le informamos que se ha generado una nuevo version del plan de embarques en el sistema.<br><br>
                        Puedes validar el plan de embarques en el sistema.<br><br>
                        <strong style=""""color:#dc362e;"""">Folio del plan:</strong> 
                        <span style=""""font-size:18px; font-weight:bold;"""">{{FOLIO}}</span><br><br>
                        <strong style=""""color:#dc362e;"""">Revisión:</strong> 
                        <span style=""""font-size:18px; font-weight:bold;"""">{{REV}}</span><br><br>
                        Puede consultar más detalles directamente en el sistema.
                     ";


                cuerpo = cuerpo
                    .Replace("{{FOLIO}}", Folio)
                    .Replace("{{REV}}", Rev);

                // Reemplazar los valores
                string htmlFinal = plantillaHtml
                    .Replace("{{TITLEH}}", "Plan Embarques " + Folio)
                    .Replace("{{TITLE}}", "📝 Nueva version de plan embarques")
                    .Replace("{{BODY}}", cuerpo)
                    .Replace("{{LINK}}", url);


                EmailRequest emailRequest = new EmailRequest();
                emailRequest.To = "";
                emailRequest.Subject = "Nuevo plan embarques " + Folio + " Revisión: " + Rev;
                emailRequest.Body = htmlFinal;
                emailRequest.IsHtml = true;

                //var res = GC.SendEmails(emailRequest, "~/Images/logoFisfiber.png", listaEmails);
                var result = GC.SendEmails(emailRequest, "~/Images/logoFisfiber.png", listaEmails, codeLogistica) as JsonResult;
                var data = result.Data; // Esto es el objeto anónimo que pasaste a Json()


                Console.WriteLine(data);

                return enviado;
            }
            catch (Exception)
            {

                return false;
            }


        }

        public JsonResult DeletePedidoEmb(int Id)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Id", Id.ToString());

                //Trae estatus de carga 
                string PPD = Logic.GlobalProcedure(AD.GCDeletePedidoEmb, AD.RequestParameters);

                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (PPD.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = PPD });
                }
                //No existe información
                else if (PPD.Contains("Warning"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontraron los pedidos..." });
                }

                JArray deleteItem = JArray.Parse(PPD);
                string folio = string.Empty;
                if (!string.IsNullOrWhiteSpace(PPD))
                {
                    folio = deleteItem[0]?["folio"]?.ToString() ?? "";
                }

                // SE REGRESA AL ESTADO PENDIENTE REVISION VENTAS
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Folio", folio);
                string penRevVentas = Logic.GlobalProcedure(AD.GCUpdatePendRevVentas, AD.RequestParameters);


                //NOTIFICACION AUTORIZACION PARA PEDIDO ELIMINADO
                GC.SendPedidoDelete(Id.ToString(), "embarques");



                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "El pedido fue actulizado correctamente..",
                    Data = PPD,
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

        public JsonResult NuevoEnvio(string dataEnvio)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Clear();

                JArray LineasPP = JArray.Parse(dataEnvio);

                foreach (JObject item in LineasPP)
                {
                    //Agregar resto de parametros de consulta
                    foreach (var linea in item.Properties())
                    {

                        AD.RequestParameters.Add(linea.Name, linea.Value.ToString());
                    }

                    //Insertar la linea
                    string resultInsert = Logic.GlobalProcedure(AD.GCInsertNuevoEnvio, AD.RequestParameters);


                    if (resultInsert.Contains("Error"))
                    {
                        return Json(new AccesoDatos.JsonResponse
                        { Status = "ERROR", Message = resultInsert, Data = "[]" });
                    }

                    //Limpiar los parametros
                    AD.RequestParameters.Clear();
                }



                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "El pedido fue actulizado correctamente..",
                    Data = "",
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

        //GUARDAR UBICACIONES DEL PLAN DE EMBARQUES
        public JsonResult UpdatePlanEmbAlm(string PlanEmb)
        {
            try
            {

                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Clear();

                JArray LineasPP = JArray.Parse(PlanEmb);

                foreach (JObject item in LineasPP)
                {
                    //Agregar resto de parametros de consulta
                    foreach (var linea in item.Properties())
                    {

                        AD.RequestParameters.Add(linea.Name, linea.Value.ToString());
                    }


                    //Insertar la linea
                    string lineaPP = Logic.GlobalProcedure(AD.GCUpdatePlanEmbAlm, AD.RequestParameters);


                    if (lineaPP.Contains("Error"))
                    {
                        return Json(new AccesoDatos.JsonResponse
                        { Status = "ERROR", Message = lineaPP, Data = "[]" });
                    }

                    //Limpiar los parametros
                    AD.RequestParameters.Clear();
                }


                //OK
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
                string msg = "No es posible guardar el plan " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                var Result = Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;
            }
        }

        //Mascara Plan Embarques

        public JsonResult GetMascPlanEmb()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                AD.RequestParameters.Clear();
                //Trae el plan de embarques mas actual
                string UpdatePedidos = Logic.GlobalProcedure(AD.GCUpdatePedidosInPlanEmb, AD.RequestParameters);
                string PPD = Logic.GlobalProcedure(AD.GCGetMascPlanEmb, AD.RequestParameters);
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

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", Folio);
                AD.RequestParameters.Add("tabla", "PlanVentas");
                string headerBitacora = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);



                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de mascara plan",
                    Data = PPD,
                    ExtraData = PlanAct,
                    Other = headerBitacora
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

        //Get Mascara Plan Embarques por folio
        public JsonResult GetMascPlanEmbFolio(string FolioPlanEmb)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Folio", FolioPlanEmb);

                //Trae el plan de embarques mas actual
                string UpdatePedidos = Logic.GlobalProcedure(AD.GCUpdatePedidosInPlanEmbFolio, AD.RequestParameters);
                string PPD = Logic.GlobalProcedure(AD.GCGetMascPlanEmbFolio, AD.RequestParameters);
                string PlanAct = Logic.GlobalProcedure(AD.GCGetInfoPlanEmbAct, AD.RequestParameters);

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

                //dynamic PlanActData = JsonConvert.DeserializeObject<dynamic>(PlanAct);
                //string Folio = PlanActData[0].folio;

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", FolioPlanEmb);
                AD.RequestParameters.Add("tabla", "PlanVentas");
                string headerBitacora = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);



                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de mascara plan",
                    Data = PPD,
                    ExtraData = PlanAct,
                    Other = headerBitacora
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


        public JsonResult AuthPlanEmbByVentas(string folio)
        {
            try
            {

                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Folio", folio);

                //Cambai estatus y aumenta numero de revison (NumRevVentas)
                string res = Logic.GlobalProcedure(AD.GCAuthPlanEmbVentas, AD.RequestParameters);


                if (res.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = res, Data = "[]" });
                }


                //OK
                var Result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Plan autorizado correctamente.",
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
                string msg = "No es posible guardar el plan " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                var Result = Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;
            }
        }

        //ACTUALIZAR ESTATUS DE TRANSITO DE UN PEDIDO
        public JsonResult UpdateEstPedidoPlanEmb(int Id, string Est,string DescEst, string Comentario)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Id", Id.ToString());
                AD.RequestParameters.Add("Estatus", Est);
                AD.RequestParameters.Add("Comentario", Comentario);

                string res = Logic.GlobalProcedure(AD.GCUpdateEstPedidoPlanEmb, AD.RequestParameters);


                if (res.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = res, Data = "[]" });
                }

                // Obtén el contexto del Hub
                var context = GlobalHost.ConnectionManager.GetHubContext<EstatusEnvioHub>();


                //NOTIFICACION A PARA ALMACEN Y CALIDAD POR DEVOLUCION Y/O RECHAZO
                JArray deleteItem = JArray.Parse(res);
                string folio = string.Empty;
                string pedido = string.Empty;
                string articulo = string.Empty;
                string cliente = string.Empty;
                string fEntrega = string.Empty;
                int pzsEntrega = 0;

                if (!string.IsNullOrWhiteSpace(res))
                {
                    folio = deleteItem[0]?["folio"]?.ToString() ?? "";
                    pedido = deleteItem[0]?["Pedido"]?.ToString() ?? "";
                    articulo = deleteItem[0]?["Articulo"]?.ToString() ?? "";
                    cliente = deleteItem[0]?["Cliente"]?.ToString() ?? "";
                    fEntrega = deleteItem[0]?["F_Entrega"]?.ToString() ?? "";
                    pzsEntrega = (int)(deleteItem[0]?["PiezasEntrega"] ?? 0);
                }

               var notifiSend = SendNotifiDevolucion(
                    DescEst, Comentario,
                    folio, pedido, articulo, 
                    cliente, fEntrega, pzsEntrega);

                context.Clients.All.changeEstatusPedido(Id, pedido, folio);



                var Result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Pedido actualizado correctamente.",
                    Data = "[]",
                    ExtraData = notifiSend.ToString()
                });
                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible actualziar estatus del plan " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                var Result = Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;
            }
        }

        public Boolean SendNotifiDevolucion(
            string Estatus, string Comment,
            string Folio, string Pedido, string Articulo, 
            string Cliente, string FEntrega, int PzsEntrega)
        {
            bool enviado = true;

            try
            {
                //Envio notificacion a Logistica de nuevos pedidos
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Code", codeDevolucionCliente);//Codigo para busqueda en tabla
                string EmailsLogistica = Logic.GlobalProcedure(AD.GCGetEmiailsCode, AD.RequestParameters);
                List<Correos> listaEmails = JsonConvert.DeserializeObject<List<Correos>>(EmailsLogistica);


                string plantillaHtml = System.IO.File.ReadAllText(
                    Server.MapPath("~/Plantillas/CorreoBase.html"));

                // Cuerpo dinámico
                string cuerpo = $@" Estimado usuario. Le informamos que un pedido del plan <strong>{Folio}</strong>  no ha sido entregado.<br><br>
                             <div style=""margin-bottom:20px; border-bottom:1px solid #ddd; padding-bottom:10px;"">
                               <strong>Estatus: {Estatus}</strong> <br>
                               <strong>Motivo: {Comment}</strong>
                            </div>
                            <div style=""margin-bottom:20px; border-bottom:1px solid #ddd; padding-bottom:10px;"">
                                Pedido:<strong>{Pedido}</strong>  | 
                                Cliente:<strong>{Cliente}</strong>  |
                                Articulo:<strong>{Articulo}</strong>  | 
                                Piezas Entrega:<strong>{PzsEntrega}</strong> <br>
                                Fecha Entrega:<strong>{FEntrega}</strong>  |                       
                            </div>";

                // Reemplazar los valores
                string htmlFinal = plantillaHtml
                    .Replace("{{TITLEH}}", "PEDIDO REPROGRAMADO")
                    .Replace("{{TITLE}}", "Reprogramación de pedido")
                    .Replace("{{BODY}}", cuerpo)
                    .Replace("{{LINK}}", url);


                EmailRequest emailRequest = new EmailRequest();
                emailRequest.To = "";
                emailRequest.Subject = $@"Pedido: {Pedido} Reprogramado. Plan: {Folio}";
                emailRequest.Body = htmlFinal;
                emailRequest.IsHtml = true;

                //var res = GC.SendEmails(emailRequest, "~/Images/logoFisfiber.png", listaEmails);
                var result = GC.SendEmails(emailRequest, "~/Images/logoFisfiber.png", listaEmails, codeDevolucionCliente) as JsonResult;
                var data = result.Data; // Esto es el objeto anónimo que pasaste a Json()


                //Console.WriteLine(data);

                return enviado;
            }
            catch (Exception)
            {

                return false;
            }


        }


        public JsonResult GetPedidosInPP(string folio)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Folio", folio);
                //Trae el plan de embarques mas actual
                string PPD = Logic.GlobalProcedure(AD.GCGetPedidosInPP, AD.RequestParameters);

                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (PPD.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = PPD });
                }
                //No existe información
                else if (PPD.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al plan [GetPedidosInPP]" });
                }


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de pedidos en plan de producción",
                    Data = PPD,
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
                string msg = "No es posible obtener la lista de pedidos en el plan de produccion " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetPlanesProduccionDetails(string folio, string usuario, string tabla)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                //Configuracion del plan de produccion por usuario
                AD.RequestParameters.Add("usuario", usuario);
                string CXUPP = Logic.GlobalProcedure(AD.GCGetConfiguracionPP, AD.RequestParameters);

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", folio);
                AD.RequestParameters.Add("usuario", usuario);
                AD.RequestParameters.Add("tabla", tabla);
                //Obtener detalles de los planes de produccion
                string PPD = Logic.GlobalProcedure(AD.GCGetPlanProDetailsPlanEmb, AD.RequestParameters);
                string PPDH = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);


                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (PPD.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = PPD });
                }
                //No existe información
                else if (PPD.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al plan: " + folio + "." });
                }
                //OK
                var result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de plan obtenidos correctamente.", Data = PPD, ExtraData = PPDH, Other = CXUPP });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de planes de producción " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }


        //PLANES GENERADOS
        public JsonResult GetPlanesEmbGenerados()
        {
            try
            {
                //Numero de veces que se ha realizado una peticion
                string draw = Request.Form["draw"];
                string drawValue = !string.IsNullOrEmpty(draw) ? draw : "0";
                int NroPeticion = Convert.ToInt32(drawValue);


                //Cantidad de registros a devolver
                string lenght = Request.Form["length"];
                string lenghtValue = !string.IsNullOrEmpty(lenght) ? lenght : "0";
                int CantidadRegistros = Convert.ToInt32(lenghtValue);

                //Cantidad de registros a omitir
                string start = Request.Form["start"];
                string startValue = !string.IsNullOrEmpty(start) ? start : "0";
                int OmitirRegistros = Convert.ToInt32(startValue);

                //Texto de busqueda
                string search = Request.Form["search[value]"];
                string searchValue = !string.IsNullOrEmpty(search) ? search : "";
                string FiltroBusqueda = searchValue;

                int TotalRegistros = 0;

                //=================================OBTENER DATOS===========================//

                List<AccesoDatos.PlanesVentasCreados> PP = new List<AccesoDatos.PlanesVentasCreados>();
                string connectionString = string.Empty;
                AD.RequestParameters = new Dictionary<string, string>();
                string reporte = Logic.GlobalProcedure(AD.GCGetPlanesEmbFinalizados, AD.RequestParameters);
                PP = JsonConvert.DeserializeObject<List<AccesoDatos.PlanesVentasCreados>>(reporte);
                TotalRegistros = PP.Count();

                if (FiltroBusqueda != string.Empty)
                    PP = PP.Where(e => string.Concat(e.Folio).Contains(FiltroBusqueda)).ToList();
                //Total de registros filtrados
                int totalRegistrosFiltrados = PP.Count();
                //Resultado final de busqueda
                PP = PP.Skip(OmitirRegistros).Take(CantidadRegistros).ToList();

                //retornamos en JSON la data obtenida
                var EncuestasFiltradas = Json(new
                {
                    draw = NroPeticion,
                    recordsTotal = TotalRegistros,
                    recordsFiltered = totalRegistrosFiltrados,
                    data = PP
                }, JsonRequestBehavior.AllowGet);

                EncuestasFiltradas.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return EncuestasFiltradas;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de planes de producción " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                log.Error($"{finalmessage} - {E.Message}", E);


                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetPlanEmbGeneradosDetails(string usuario, string folio)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Folio", folio);
                //Trae el plan de embarques mas actual
                string PPD = Logic.GlobalProcedure(AD.GCGetPlanEmbDetailsGenerados, AD.RequestParameters);
                string PlanAct = Logic.GlobalProcedure(AD.GCGetInfoPlanEmbAct, AD.RequestParameters);
                //Traer los envios completado vs total envios, para calcular el porcentaje
                string ResumenEnvios = Logic.GlobalProcedure(AD.GCGetResumenEnvios, AD.RequestParameters);


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



                //string Folio = PlanActData[0].folio;

                //AD.RequestParameters.Add("folio", Folio);
                //string PedidosNoAuth = Logic.GlobalProcedure(AD.GCGetPedidosNoAuth, AD.RequestParameters);


                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", folio);
                AD.RequestParameters.Add("tabla", "PlanVentas");
                string headerBitacora = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Información obtenida correctamente....",
                    Data = PPD,
                    Data2 = ResumenEnvios,
                    ExtraData = headerBitacora,
                    Other = PlanAct
                });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista del plan embarques " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult FinalizarPlanEmbarques(string Folio)
        {
            try
            {

                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Folio", Folio);


                string res = Logic.GlobalProcedure(AD.GCUpdatePlanEmbFinalizado, AD.RequestParameters);


                if (res.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = res, Data = "[]" });
                }


                //OK
                var Result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Plan finalizado correctamente.",
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
                string msg = "No es posible guardar el plan " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                var Result = Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;
            }
        }


    }
}