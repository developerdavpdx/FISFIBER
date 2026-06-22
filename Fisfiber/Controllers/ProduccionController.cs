using Fisfiber.Hubs;
using Fisfiber.Models;
using log4net;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web.Mvc;
using System.Web.UI.WebControls;

namespace Fisfiber.Controllers
{
    public class ProduccionController : Controller
    {
        Logica Logic = new Logica();
        AccesoDatos AD = new AccesoDatos();
        private static readonly ILog log = LogManager.GetLogger(typeof(ProduccionController));

        #region VIEWS
        // GET: Produccion
        public ActionResult Index()
        {
            return View();
        }

        // GET: ConsultaPlanProduccion
        public ActionResult ConsultaPlanProduccion()
        {

            string CodeISO = IniConfigManager.LeerValor("PlanPro_CodeISO", "Valor");
            string Nivel = IniConfigManager.LeerValor("PlanPro_Nivel", "Valor");
            string FechaRev = IniConfigManager.LeerValor("PlanPro_FechaRevision", "Valor");
            string Revision = IniConfigManager.LeerValor("PlanPro_Revision", "Valor");
            string FechaLib = IniConfigManager.LeerValor("PlanPro_FechaLiberacion", "Valor");

            ViewBag.CodeISO = CodeISO;
            ViewBag.Nivel = Nivel;
            ViewBag.FechaRev = FechaRev;
            ViewBag.FechaLib = FechaLib;
            ViewBag.Revision = Revision;

            return View();
        }

        public ActionResult InspeccionProducto()
        {
            return View();
        }

        public ActionResult ReciboSobrantes()
        {
            return View();
        }

        //Obtenemos la vista de consulta recetas
        public ActionResult GestionRecetas()
        {
            return View();
        }

        public ActionResult ReporteProduccion()
        {
            return View();
        }

        public ActionResult ReporteOTTerminados()
        {
            return View();
        }

        public ActionResult ConsumoMateriaPrima()
        {
            return View();
        }

        public ActionResult ParosProduccion()
        {
            return View();
        }
        public ActionResult ReporteParosProduccion()
        {
            return View();
        }

        public ActionResult HojaEspecificaciones()
        {
            return View();
        }

        // GET: Produccion/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }

        // GET: Produccion/Create
        public ActionResult Create()
        {
            return View();
        }

        #endregion

        #region GestionRecetas



        #endregion

        #region ParosProduccion
        public JsonResult GetParosProduccion(string Inicio, string Fin)
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

                List<AccesoDatos.ParosProduccion> PP = new List<AccesoDatos.ParosProduccion>();
                string connectionString = string.Empty;
                //Parametros de fecha
                AD.RequestParameters = new Dictionary<string, string>
                {
                    { "Inicio", Inicio },
                    { "Fin", Fin }
                };
                string reporte = Logic.GlobalProcedure(AD.GCGetParosProduccion, AD.RequestParameters);
                PP = JsonConvert.DeserializeObject<List<AccesoDatos.ParosProduccion>>(reporte);
                TotalRegistros = PP.Count();

                if (FiltroBusqueda != string.Empty)
                    PP = PP.Where(e => string.Concat(e.ID,e.Linea, e.Fecha, e.MotivoReparacion, e.Solicitante, e.Estatus).Contains(FiltroBusqueda)).ToList();
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
                string msg = "No es posible obtener la lista de paros de producción " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                log.Error($"{finalmessage} - {E.Message}", E);


                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        public JsonResult GetParosHistoricos(string Inicio, string Fin, string Linea = null)
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

                //Parámetro para exportar todos los registros (sin paginación)
                string allRecords = Request.Form["allRecords"];
                bool isAllRecords = allRecords == "true";

                int TotalRegistros = 0;

                //=================================OBTENER DATOS===========================//
                List<AccesoDatos.ParosHistoricos> PP = new List<AccesoDatos.ParosHistoricos>();
                string connectionString = string.Empty;

                //Parametros de fecha y línea
                AD.RequestParameters = new Dictionary<string, string>
                {
                    { "Inicio", (Inicio == string.Empty ? null : Inicio) },
                    { "Fin", (Fin == string.Empty ? null : Fin) },
                    { "Linea", (Linea == string.Empty ? null : Linea) }
                };

                string reporte = Logic.GlobalProcedure(AD.GCReporteParosHistoricos, AD.RequestParameters);
                PP = JsonConvert.DeserializeObject<List<AccesoDatos.ParosHistoricos>>(reporte);
                TotalRegistros = PP.Count();

                if (!string.IsNullOrEmpty(FiltroBusqueda))
                    PP = PP.Where(e => string.Concat(
                        e.ID,
                        e.Linea,
                        e.FechaInicio,
                        e.FechaFinParo,
                        e.TipoMantenimiento,
                        e.Motivo,
                        e.Solicitante,
                        e.UsuarioRealizo,
                        e.Rubro,
                        e.OrdenTrabajo,
                        e.Observaciones,
                        e.Estatus
                    ).Contains(FiltroBusqueda)).ToList();

                //Total de registros filtrados
                int totalRegistrosFiltrados = PP.Count();

                //Resultado final de busqueda
                //Si es exportación (allRecords=true), omitir paginación y devolver todos los registros
                if (!isAllRecords)
                {
                    PP = PP.Skip(OmitirRegistros).Take(CantidadRegistros).ToList();
                }

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
                string msg = "No es posible obtener la lista de paros históricos " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }


        [HttpPost]
        public JsonResult ActualizarParo(int id, string fechaFin, string usuario, string tipo, string rubro, string orden, string Obs)
        {
            try
            {
                // Inicializar parámetros para el stored
                AD.RequestParameters = new Dictionary<string, string>
                {
                    { "ID", id.ToString() },
                    { "FechaFin", fechaFin },
                    { "Usuario", usuario },
                    { "Tipo", tipo },
                    { "Rubro", rubro },
                    { "Orden", orden },
                    { "Obs", Obs }
                };

                // Ejecutar el procedimiento almacenado
                string resultado = Logic.GlobalProcedure(AD.GCActualizarParoMantenimiento, AD.RequestParameters);

                string msjUpdateP = string.Empty;

                try
                {
                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("Id", id.ToString());
                    string Paro = Logic.GlobalProcedure(AD.GCGetDetParo, AD.RequestParameters);

                    var context = GlobalHost.ConnectionManager.GetHubContext<ParosHub>();
                    context.Clients.All.updateParos(Paro);
                    context.Clients.All.closeParo(Paro);

                    msjUpdateP = "Update actualizado en dashboard...";
                }
                catch (Exception E)
                {
                    msjUpdateP = "Error al mandar signal a dashboard..";
                    string MethodName = MethodBase.GetCurrentMethod().Name;
                    string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                    string msg = "No es posible enviar la notificacion (signal) al dashboard " + MethodName + " en: " + ControllerName;
                    string finalmessage = AD.Excepcion(E, msg).ToString();
                    log.Error($"{finalmessage} - {E.Message}", E);
                }


                return Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Paro actualizado correctamente",
                    Data = resultado,
                    Data2 = msjUpdateP
                });
            }
            catch (Exception e)
            {
                string methodName = MethodBase.GetCurrentMethod().Name;
                string controllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = $"No es posible actualizar el paro {methodName} en: {controllerName}, contacte al administrador con el código de error: ";
                string finalMessage = AD.Excepcion(e, msg).ToString();

                return Json(new AccesoDatos.JsonResponse
                {
                    Status = "ERROR",
                    Message = finalMessage,
                    Data = "[]"
                });
            }
        }     

        public JsonResult GetDatosExtras()
        {
            try
            {

                //Parametros de fecha
                AD.RequestParameters = new Dictionary<string, string>();

                string connectionString = string.Empty;

                string reporte = Logic.GlobalProcedure(AD.GCGetDataExtH, AD.RequestParameters);
                //Console.WriteLine(reporte);
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de header: ", Data = reporte });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener los datos de la hoja de especificaciones " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetEspecificaciones(string itemCode)
        {
            try
            {

                //Parametros de fecha
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Articulo", itemCode);

                string connectionString = string.Empty;

                string reporte = Logic.GlobalProcedure(AD.GCDatosHojaEspecificaciones, AD.RequestParameters);
                //Console.WriteLine(reporte);
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de hoja de especificacion obtenidas correctamente", Data = reporte });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener los datos de la hoja de especificaciones " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetHeaderHoja()
        {
            try
            {

                //Parametros de fecha
                AD.RequestParameters = new Dictionary<string, string>();

                string connectionString = string.Empty;

                string reporte = Logic.GlobalProcedure(AD.GCHeaderHojaEsp, AD.RequestParameters);
                //Console.WriteLine(reporte);
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de header: ", Data = reporte });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener los datos de la hoja de especificaciones " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult UpdateHeaderHoja(string Plantilla, string FechaLiberado, string FechaRevisado, string Tipo)
        {
            try
            {

                //Parametros de fecha
                AD.RequestParameters = new Dictionary<string, string>
                {
                    { "Plantilla", (Plantilla == string.Empty ? null : Plantilla) },
                    { "FechaLiberado", (FechaLiberado == string.Empty ? null : FechaLiberado) },
                    { "FechaRevisado", (FechaRevisado == string.Empty ? null : FechaRevisado) },
                    { "Tipo", (Tipo == string.Empty ? null : Tipo) }
                };



                string connectionString = string.Empty;

                string reporte = Logic.GlobalProcedure(AD.GCUpdateHeaderHojaEsp, AD.RequestParameters);
                //Console.WriteLine(reporte);
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de header: ", Data = "[]" });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener los datos de la hoja de especificaciones " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetOpRubro()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                string opciones = Logic.GlobalProcedure(AD.GCGetOpRubro, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                var resultado = Json(new AccesoDatos.JsonResponse { 
                    Status = "OK", 
                    Message = "Lista de opciones obtenida correctamente".ToString(), 
                    Data = opciones
                });
                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de opciones del rubro " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetOpTipoMant()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                string opciones = Logic.GlobalProcedure(AD.GCGetOpTipoMTO, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                var resultado = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Lista de opciones obtenida correctamente".ToString(),
                    Data = opciones
                });
                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de opciones del rubro " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        #endregion
    }
}
